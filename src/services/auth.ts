import { api, getStoredRefreshToken } from '@/lib/axios'
import type { ApiResponse, PaginationMeta } from '@/types/api'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  role: string
  name: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLoginAt?: string
}

interface UserResponse {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

interface CreateUserRequest {
  name: string
  email: string
  role: string
}

interface UpdateUserRequest {
  name: string
  email: string
  role?: string
}

interface RoleResponse {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

interface AuditLogResponse {
  id: string
  timestamp: string
  userId?: string
  userName?: string
  action: string
  entityType: string
  entityId?: string
  detail?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data)
    return response.data.data
  },

  logout: async () => {
    const refreshToken = getStoredRefreshToken()
    await api.post('/auth/logout', { refreshToken })
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number; tokenType: string }>>('/auth/refresh', { refreshToken })
    return response.data.data
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<UserProfile>>('/auth/me')
    return response.data.data
  },

  listUsers: async (params?: { page?: number; size?: number; role?: string; status?: string; search?: string }) => {
    const response = await api.get<ApiResponse<UserResponse[]> & { pagination?: PaginationMeta }>('/usuarios', { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },

  createUser: async (data: CreateUserRequest) => {
    const response = await api.post<ApiResponse<UserResponse>>('/usuarios', data)
    return response.data.data
  },

  updateUser: async (id: string, data: UpdateUserRequest) => {
    const response = await api.put<ApiResponse<UserResponse>>(`/usuarios/${id}`, data)
    return response.data.data
  },

  deactivateUser: async (id: string, currentPassword: string) => {
    const response = await api.patch<ApiResponse<UserResponse>>(`/usuarios/${id}/desactivar`, { currentPassword })
    return response.data.data
  },

  reactivateUser: async (id: string) => {
    const response = await api.patch<ApiResponse<UserResponse>>(`/usuarios/${id}/reactivar`)
    return response.data.data
  },

  deleteUser: async (id: string, currentPassword: string) => {
    const response = await api.delete<ApiResponse<UserResponse>>(`/usuarios/${id}`, { data: { currentPassword } })
    return response.data.data
  },

  listRoles: async () => {
    const response = await api.get<ApiResponse<RoleResponse[]>>('/auth/roles')
    return response.data.data
  },

  passwordReset: async (email: string) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/password-reset', { email })
    return response.data.data
  },

  getAuditLogs: async (params?: { userId?: string; action?: string; entityType?: string; page?: number; size?: number }) => {
    const response = await api.get<ApiResponse<AuditLogResponse[]> & { pagination?: PaginationMeta }>('/audit-log', { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },
}
