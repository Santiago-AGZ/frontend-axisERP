import { create } from 'zustand'
import { queryClient } from '@/lib/query'
import { authService } from '@/services/auth'
import {
  setStoredToken,
  setStoredRefreshToken,
  clearAuthTokens,
  getStoredToken,
  getStoredRefreshToken,
  getApiBaseURL,
} from '@/lib/axios'
import axios from 'axios'
import type { UserRole } from '@/types/api'

const VALID_ROLES: readonly UserRole[] = ['ADMIN', 'VENDEDOR', 'INVENTARIO'] as const

function parseRole(v: string): UserRole {
  if (VALID_ROLES.includes(v as UserRole)) return v as UserRole
  console.warn(`[AxisERP] Unexpected role "${v}", defaulting to VENDEDOR`)
  return 'VENDEDOR'
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  status: string
}

function userFromMe(me: { id: string; name: string; email: string; role: string; status: string }): User {
  return { id: me.id, email: me.email, name: me.name, role: parseRole(me.role), status: me.status }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    const { accessToken, refreshToken } = response

    setStoredToken(accessToken)
    if (refreshToken) setStoredRefreshToken(refreshToken)

    const me = await authService.getMe()

    set({
      user: userFromMe(me),
      isAuthenticated: true,
      isLoading: false,
    })
  },

  logout: async () => {
    try {
      await authService.logout()
    } catch {
      /* ignore backend errors — clear locally regardless */
    } finally {
      clearAuthTokens()
      queryClient.clear()
      set({ user: null, isAuthenticated: false })
    }
  },

  initialize: async () => {
    let token = getStoredToken()
    const refreshToken = getStoredRefreshToken()

    if (!token && refreshToken) {
      try {
        const { data } = await axios.post(`${getApiBaseURL()}/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = data.data ?? data
        setStoredToken(accessToken)
        if (newRefreshToken) setStoredRefreshToken(newRefreshToken)
        token = accessToken
      } catch {
        clearAuthTokens()
        set({ user: null, isAuthenticated: false, isLoading: false })
        return
      }
    }

    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false })
      return
    }

    try {
      const me = await authService.getMe()
      set({
        user: userFromMe(me),
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      clearAuthTokens()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
