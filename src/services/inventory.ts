import { api } from '@/lib/axios'
import type { ApiResponse, PaginationMeta } from '@/types/api'

interface InitializeInventoryRequest {
  productId: string
  initialStock: number
  minStock: number
  maxStock: number
  notes?: string
}

interface MovementRequest {
  quantity: number
  referenceType?: string
  referenceId?: string
  notes?: string
}

interface AdjustmentRequest {
  adjustmentType: 'POSITIVO' | 'NEGATIVO'
  quantity: number
  justification: string
  notes?: string
}

export interface InventoryResponse {
  id: string
  productId: string
  currentStock: number
  minStock: number
  maxStock: number
  lowStock: boolean
  depleted: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductInventoryResponse {
  id: string
  productId: string
  productName: string
  productCodigo: string
  currentStock: number
  minStock: number
  maxStock: number
  lowStock: boolean
  depleted: boolean
  lastMovementAt?: string
  createdAt: string
  updatedAt: string
}

export interface MovementResponse {
  id: string
  inventoryId: string
  productId: string
  movementType: string
  quantity: number
  previousStock: number
  newStock: number
  referenceType?: string
  referenceId?: string
  justification?: string
  notes?: string
  createdBy: string
  createdAt: string
}

export const inventoryService = {
  initialize: async (data: InitializeInventoryRequest) => {
    const response = await api.post<ApiResponse<InventoryResponse>>('/inventory/initialize', data)
    return response.data.data
  },

  listProducts: async (params?: { page?: number; size?: number; categoryId?: string }) => {
    const response = await api.get<ApiResponse<ProductInventoryResponse[]> & { pagination?: PaginationMeta }>('/inventory/products', { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },

  getProductInventory: async (productId: string) => {
    const response = await api.get<ApiResponse<InventoryResponse>>(`/inventory/products/${productId}`)
    return response.data.data
  },

  getAlerts: async (params?: { page?: number; size?: number }) => {
    const response = await api.get<ApiResponse<ProductInventoryResponse[]> & { pagination?: PaginationMeta }>('/inventory/alerts', { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },

  getDepleted: async (params?: { page?: number; size?: number }) => {
    const response = await api.get<ApiResponse<ProductInventoryResponse[]> & { pagination?: PaginationMeta }>('/inventory/alerts/depleted', { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },

  getMovements: async (productId: string, params?: { page?: number; size?: number }) => {
    const response = await api.get<ApiResponse<MovementResponse[]> & { pagination?: PaginationMeta }>(`/inventory/products/${productId}/movements`, { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },

  registerEntry: async (productId: string, data: MovementRequest) => {
    const response = await api.post<ApiResponse<MovementResponse>>(`/inventory/products/${productId}/entry`, data)
    return response.data.data
  },

  registerExit: async (productId: string, data: MovementRequest) => {
    const response = await api.post<ApiResponse<MovementResponse>>(`/inventory/products/${productId}/exit`, data)
    return response.data.data
  },

  registerReturn: async (productId: string, data: MovementRequest) => {
    const response = await api.post<ApiResponse<MovementResponse>>(`/inventory/products/${productId}/return`, data)
    return response.data.data
  },

  adjust: async (productId: string, data: AdjustmentRequest) => {
    const response = await api.post<ApiResponse<MovementResponse>>(`/inventory/products/${productId}/adjust`, data)
    return response.data.data
  },

  reverseMovement: async (movementId: string, justification?: string) => {
    const response = await api.post<ApiResponse<MovementResponse>>(`/inventory/movements/${movementId}/reverse`, undefined, {
      params: { justification },
    })
    return response.data.data
  },
}
