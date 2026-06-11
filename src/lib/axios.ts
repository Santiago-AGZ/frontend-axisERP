import axios from 'axios'

const TOKEN_KEY = 'axiserp-token'
const REFRESH_TOKEN_KEY = 'axiserp-refresh-token'

function getApiBaseURL(): string {
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl) {
    return `${apiUrl}/api/v1`
  }
  return '/api/v1'
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setStoredRefreshToken(token: string | null) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
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
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      clearAuthTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = getStoredRefreshToken()
    if (!refreshToken) {
      isRefreshing = false
      clearAuthTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(`${getApiBaseURL()}/auth/refresh`, { refreshToken })
      const { accessToken, refreshToken: newRefreshToken } = data.data ?? data

      setStoredToken(accessToken)
      if (newRefreshToken) setStoredRefreshToken(newRefreshToken)

      processQueue(null, accessToken)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuthTokens()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
