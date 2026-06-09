import { api } from '@/lib/axios'
import type { ApiResponse, PaginationMeta } from '@/types/api'

interface CreateSupplierRequest {
  codigo: string
  name: string
  nit: string
  phone?: string
  email?: string
  address?: string
}

interface UpdateSupplierRequest {
  name?: string
  phone?: string
  email?: string
  address?: string
}

export interface SupplierResponse {
  id: string
  codigo: string
  name: string
  nit: string
  phone?: string
  email?: string
  address?: string
  status: 'ACTIVO' | 'INACTIVO'
  createdAt: string
  updatedAt: string
}

interface PurchaseItemRequest {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

interface CreatePurchaseRequest {
  supplierId: string
  items: PurchaseItemRequest[]
  notes?: string
}

interface ReceiveItemRequest {
  itemId: string
  receivedQuantity: number
}

interface ReceivePurchaseRequest {
  items: ReceiveItemRequest[]
}

export interface PurchaseResponse {
  id: string
  supplierId: string
  purchaseNumber: string
  status: 'BORRADOR' | 'PENDIENTE' | 'RECIBIDA' | 'PAGADA' | 'CANCELADA'
  items: PurchaseItemResponse[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  createdBy: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseItemResponse {
  id: string
  productId: string
  productName: string
  quantity: number
  receivedQuantity: number
  pendingQuantity: number
  unitPrice: number
  subtotal: number
}

export const purchaseService = {
  listSuppliers: async (params?: { search?: string; page?: number; size?: number }) => {
    const response = await api.get<ApiResponse<SupplierResponse[]> & { pagination?: PaginationMeta }>('/suppliers', { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },

  getSupplier: async (id: string) => {
    const response = await api.get<ApiResponse<SupplierResponse>>(`/suppliers/${id}`)
    return response.data.data
  },

  createSupplier: async (data: CreateSupplierRequest) => {
    const response = await api.post<ApiResponse<SupplierResponse>>('/suppliers', data)
    return response.data.data
  },

  updateSupplier: async (id: string, data: UpdateSupplierRequest) => {
    const response = await api.put<ApiResponse<SupplierResponse>>(`/suppliers/${id}`, data)
    return response.data.data
  },

  deactivateSupplier: async (id: string) => {
    const response = await api.patch<ApiResponse<SupplierResponse>>(`/suppliers/${id}/deactivate`)
    return response.data.data
  },

  reactivateSupplier: async (id: string) => {
    const response = await api.patch<ApiResponse<SupplierResponse>>(`/suppliers/${id}/reactivate`)
    return response.data.data
  },

  listPurchases: async (params?: { search?: string; status?: string; page?: number; size?: number }) => {
    const response = await api.get<ApiResponse<PurchaseResponse[]> & { pagination?: PaginationMeta }>('/purchases', { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },

  getPurchase: async (id: string) => {
    const response = await api.get<ApiResponse<PurchaseResponse>>(`/purchases/${id}`)
    return response.data.data
  },

  createPurchase: async (data: CreatePurchaseRequest) => {
    const response = await api.post<ApiResponse<PurchaseResponse>>('/purchases', data)
    return response.data.data
  },

  updatePurchaseStatus: async (id: string, status: string) => {
    const response = await api.patch<ApiResponse<PurchaseResponse>>(`/purchases/${id}/status`, undefined, {
      params: { status },
    })
    return response.data.data
  },

  receivePurchase: async (id: string, data: ReceivePurchaseRequest) => {
    const response = await api.post<ApiResponse<PurchaseResponse>>(`/purchases/${id}/receive`, data)
    return response.data.data
  },

  cancelPurchase: async (id: string) => {
    const response = await api.patch<ApiResponse<PurchaseResponse>>(`/purchases/${id}/cancel`)
    return response.data.data
  },
}
