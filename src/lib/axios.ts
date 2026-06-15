import axios, { AxiosError } from 'axios'

const REFRESH_TOKEN_KEY = 'axiserp-refresh-token'

let inMemoryAccessToken: string | null = null

export function getApiBaseURL(): string {
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl) {
    return `${apiUrl.replace(/\/+$/, '')}/api/v1`
  }
  return '/api/v1'
}

function redirectToLogin() {
  if (window.location.pathname === '/login') return
  window.location.replace('/login')
}

export function getStoredToken(): string | null {
  return inMemoryAccessToken
}

export function setStoredToken(token: string | null) {
  inMemoryAccessToken = token
}

export function getStoredRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredRefreshToken(token: string | null) {
  try {
    if (token) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
    } else {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  } catch {
    /* sessionStorage unavailable */
  }
}

export function clearAuthTokens() {
  inMemoryAccessToken = null
  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    /* sessionStorage unavailable */
  }
}

export function isAxiosError<T = unknown>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error)
}

export function extractApiErrorMessage(error: unknown): string | null {
  if (isAxiosError<{ message?: string; data?: { message?: string } }>(error)) {
    return error.response?.data?.message
      ?? error.response?.data?.data?.message
      ?? null
  }
  if (error instanceof Error) {
    return error.message
  }
  return null
}

export const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token)
    } else {
      reject(error)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error)
    }

    if (originalRequest?.url?.includes('/auth/refresh')) {
      clearAuthTokens()
      redirectToLogin()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest!.headers.Authorization = `Bearer ${token}`
          return api(originalRequest!)
        })
    }

    originalRequest!._retry = true
    isRefreshing = true

    const refreshToken = getStoredRefreshToken()
    if (!refreshToken) {
      isRefreshing = false
      clearAuthTokens()
      redirectToLogin()
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(`${getApiBaseURL()}/auth/refresh`, { refreshToken })
      const { accessToken, refreshToken: newRefreshToken } = data.data ?? data

      setStoredToken(accessToken)
      if (newRefreshToken) setStoredRefreshToken(newRefreshToken)

      processQueue(null, accessToken)
      originalRequest!.headers.Authorization = `Bearer ${accessToken}`
      return api(originalRequest!)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuthTokens()
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
