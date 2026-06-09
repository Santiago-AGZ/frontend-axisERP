export type UserRole = 'ADMIN' | 'VENDEDOR' | 'INVENTARIO'

export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  errors?: FieldError[]
  meta?: ResponseMeta
  pagination?: PaginationMeta
}

export interface FieldError {
  field: string
  message: string
  rejectedValue?: unknown
}

export interface ResponseMeta {
  timestamp: string
  requestId: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaginationParams {
  page?: number
  size?: number
}
