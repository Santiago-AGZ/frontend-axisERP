// ============================================================================
// AUTH SERVICE TYPES
// ============================================================================

export type UserRole = 'ADMIN' | 'VENDEDOR' | 'INVENTARIO'
export type ProfileStatus = 'ACTIVO' | 'INACTIVO' | 'PENDIENTE' | 'ELIMINADO'
export type AuditAction = 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DEACTIVATE' | 'REACTIVATE' | 'VOID' | 'DELETE'

export interface Profile {
  id: string
  name: string
  email: string
  roleId: string
  role: Role
  status: ProfileStatus
  createdBy?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  code: string
  name: string
  description: string
  resource: string
  action: string
  createdAt: string
}

export interface AuditLog {
  id: string
  timestamp: string
  userId?: string
  userName?: string
  action: AuditAction
  entityType: string
  entityId?: string
  detail?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  userId: string
  name: string
  email: string
  role: string
  status: string
  lastLoginAt?: string
}

export interface CreateUserRequest {
  name: string
  email: string
  roleId: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  roleId?: string
}

export interface UserResponse {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  temporaryPassword?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
