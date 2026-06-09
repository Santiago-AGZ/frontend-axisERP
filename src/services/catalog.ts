import { api } from '@/lib/axios'
import type { ApiResponse, PaginationMeta } from '@/types/api'

interface CategorySummary {
  id: string
  name: string
}

export interface ProductResponse {
  id: string
  name: string
  codigo: string
  description?: string
  category: CategorySummary
  purchasePrice: number
  salePrice: number
  margin: number
  marginPercentage: number
  status: 'ACTIVO' | 'INACTIVO'
  createdAt: string
  updatedAt: string
}

interface ProductRequest {
  name: string
  codigo: string
  description?: string
  categoryId: string
  purchasePrice: number
  salePrice: number
}

interface UpdateProductRequest {
  name?: string
  description?: string
  categoryId?: string
  purchasePrice?: number
  salePrice?: number
}

export interface CategoryResponse {
  id: string
  name: string
  description?: string
  parentId?: string
  status: 'ACTIVA' | 'INACTIVA'
  createdAt: string
  updatedAt: string
}

interface CategoryTreeResponse {
  id: string
  name: string
  description?: string
  parentId?: string
  status: string
  children: CategoryTreeResponse[]
}

interface CategoryRequest {
  name: string
  description?: string
  parentId?: string
}

interface BarcodeResponse {
  id: string
  productId: string
  barcodeValue: string
  barcodeType: string
  isPrimary: boolean
  createdAt: string
}

export const catalogService = {
  listProducts: async (params?: { search?: string; codigo?: string; categoryId?: string; includeInactive?: boolean; page?: number; size?: number }) => {
    const response = await api.get<ApiResponse<ProductResponse[]> & { pagination?: PaginationMeta }>('/productos', { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },

  getProduct: async (id: string) => {
    const response = await api.get<ApiResponse<ProductResponse>>(`/productos/${id}`)
    return response.data.data
  },

  createProduct: async (data: ProductRequest) => {
    const response = await api.post<ApiResponse<ProductResponse>>('/productos', data)
    return response.data.data
  },

  updateProduct: async (id: string, data: UpdateProductRequest) => {
    const response = await api.put<ApiResponse<ProductResponse>>(`/productos/${id}`, data)
    return response.data.data
  },

  deactivateProduct: async (id: string) => {
    const response = await api.patch<ApiResponse<ProductResponse>>(`/productos/${id}/desactivar`)
    return response.data.data
  },

  reactivateProduct: async (id: string) => {
    const response = await api.patch<ApiResponse<ProductResponse>>(`/productos/${id}/reactivar`)
    return response.data.data
  },

  listCategories: async (params?: { search?: string; includeInactive?: boolean; page?: number; size?: number }) => {
    const response = await api.get<ApiResponse<CategoryResponse[]> & { pagination?: PaginationMeta }>('/categorias', { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },

  getCategory: async (id: string) => {
    const response = await api.get<ApiResponse<CategoryResponse>>(`/categorias/${id}`)
    return response.data.data
  },

  createCategory: async (data: CategoryRequest) => {
    const response = await api.post<ApiResponse<CategoryResponse>>('/categorias', data)
    return response.data.data
  },

  updateCategory: async (id: string, data: CategoryRequest) => {
    const response = await api.put<ApiResponse<CategoryResponse>>(`/categorias/${id}`, data)
    return response.data.data
  },

  deactivateCategory: async (id: string) => {
    const response = await api.patch<ApiResponse<CategoryResponse>>(`/categorias/${id}/desactivar`)
    return response.data.data
  },

  getCategoryTree: async () => {
    const response = await api.get<ApiResponse<CategoryTreeResponse[]>>('/categorias/arbol')
    return response.data.data
  },

  listBarcodes: async (productId: string) => {
    const response = await api.get<ApiResponse<BarcodeResponse[]>>(`/productos/${productId}/barcodes`)
    return response.data.data
  },

  createBarcode: async (productId: string, data: { barcodeValue: string; barcodeType: string; isPrimary?: boolean }) => {
    const response = await api.post<ApiResponse<BarcodeResponse>>(`/productos/${productId}/barcodes`, data)
    return response.data.data
  },

  deleteBarcode: async (productId: string, barcodeId: string) => {
    await api.delete(`/productos/${productId}/barcodes/${barcodeId}`)
  },
}
