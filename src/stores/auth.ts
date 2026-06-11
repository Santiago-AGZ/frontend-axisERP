import { create } from 'zustand'
import { authService } from '@/services/auth'
import { setStoredToken, setStoredRefreshToken, clearAuthTokens, getStoredToken } from '@/lib/axios'

interface User {
  id: string
  email: string
  name: string
  role: string
  status: string
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
      user: {
        id: me.id,
        email: me.email,
        name: me.name,
        role: me.role,
        status: me.status,
      },
      isAuthenticated: true,
    })
  },

  logout: async () => {
    try {
      await authService.logout()
    } finally {
      clearAuthTokens()
      set({ user: null, isAuthenticated: false })
    }
  },

  initialize: async () => {
    const token = getStoredToken()
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false })
      return
    }
    try {
      const me = await authService.getMe()
      set({
        user: {
          id: me.id,
          email: me.email,
          name: me.name,
          role: me.role,
          status: me.status,
        },
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      clearAuthTokens()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
