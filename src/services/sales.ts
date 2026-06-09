import { api } from '@/lib/axios'
import type { ApiResponse, PaginationMeta } from '@/types/api'
import { downloadFromApi } from '@/lib/download'

interface CustomerRequest {
  name: string
  codigo: string
  documentType: string
  documentNumber: string
  email?: string
  phone?: string
  address?: string
}

interface UpdateCustomerRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
}

export interface CustomerResponse {
  id: string
  codigo: string
  name: string
  documentType: string
  documentNumber: string
  email?: string
  phone?: string
  address?: string
  status: 'ACTIVO' | 'INACTIVO'
  createdAt: string
  updatedAt: string
}

interface SaleItemRequest {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount?: number
}

interface CreateSaleRequest {
  customerId: string
  items: SaleItemRequest[]
  discount?: number
  notes?: string
}

export interface SaleResponse {
  id: string
  customerId: string
  saleNumber: string
  status: 'BORRADOR' | 'PENDIENTE' | 'CONFIRMADA' | 'PAGADA' | 'ANULADA'
  items: SaleItemResponse[]
  subtotal: number
  discount: number
  tax: number
  total: number
  notes?: string
  createdBy: string
  version: number
  createdAt: string
  updatedAt: string
}

export interface SaleItemResponse {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  subtotal: number
}

export interface InvoiceResponse {
  id: string
  saleId: string
  invoiceNumber: number
  customerSnapshot: string
  itemsSnapshot: string
  subtotal: number
  discount: number
  tax: number
  total: number
  issuedAt: string
}

export const salesService = {
  listCustomers: async (params?: { search?: string; includeInactive?: boolean; page?: number; size?: number }) => {
    const response = await api.get<ApiResponse<CustomerResponse[]> & { pagination?: PaginationMeta }>('/customers', { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },

  getCustomer: async (codigo: string) => {
    const response = await api.get<ApiResponse<CustomerResponse>>(`/customers/${codigo}`)
    return response.data.data
  },

  getCustomerByCodigo: async (codigo: string) => {
    const response = await api.get<ApiResponse<CustomerResponse>>(`/customers/${codigo}`)
    return response.data.data
  },

  createCustomer: async (data: CustomerRequest) => {
    const response = await api.post<ApiResponse<CustomerResponse>>('/customers', data)
    return response.data.data
  },

  updateCustomer: async (id: string, data: UpdateCustomerRequest) => {
    const response = await api.put<ApiResponse<CustomerResponse>>(`/customers/${id}`, data)
    return response.data.data
  },

  deactivateCustomer: async (id: string) => {
    const response = await api.patch<ApiResponse<CustomerResponse>>(`/customers/${id}/deactivate`)
    return response.data.data
  },

  reactivateCustomer: async (id: string) => {
    const response = await api.patch<ApiResponse<CustomerResponse>>(`/customers/${id}/reactivate`)
    return response.data.data
  },

  getCustomerHistory: async (customerId: string) => {
    const response = await api.get<ApiResponse<SaleResponse[]>>(`/customers/${customerId}/history`)
    return response.data.data
  },

  listSales: async (params?: { customerId?: string; status?: string; productId?: string; page?: number; size?: number }) => {
    const response = await api.get<ApiResponse<SaleResponse[]> & { pagination?: PaginationMeta }>('/sales', { params })
    return { data: response.data.data, pagination: response.data.pagination }
  },

  getSale: async (id: string) => {
    const response = await api.get<ApiResponse<SaleResponse>>(`/sales/${id}`)
    return response.data.data
  },

  createSale: async (data: CreateSaleRequest) => {
    const response = await api.post<ApiResponse<SaleResponse>>('/sales', data)
    return response.data.data
  },

  confirmSale: async (id: string) => {
    const response = await api.patch<ApiResponse<SaleResponse>>(`/sales/${id}/confirm`)
    return response.data.data
  },

  paySale: async (id: string) => {
    const response = await api.patch<ApiResponse<SaleResponse>>(`/sales/${id}/pay`)
    return response.data.data
  },

  voidSale: async (id: string) => {
    const response = await api.patch<ApiResponse<SaleResponse>>(`/sales/${id}/void`)
    return response.data.data
  },

  getInvoice: async (id: string) => {
    const response = await api.get<ApiResponse<InvoiceResponse>>(`/invoices/${id}`)
    return response.data.data
  },

  getInvoiceBySale: async (saleId: string) => {
    const response = await api.get<ApiResponse<InvoiceResponse>>(`/invoices/by-sale/${saleId}`)
    return response.data.data
  },

  downloadInvoicePdf: async (saleId: string) => {
    await downloadFromApi(`/invoices/${saleId}/pdf`, `factura-${saleId}`, 'pdf')
  },

  downloadInvoiceExcel: async (saleId: string) => {
    await downloadFromApi(`/invoices/${saleId}/excel`, `factura-${saleId}`, 'xlsx')
  },

  downloadInvoiceCsv: async (saleId: string) => {
    await downloadFromApi(`/invoices/${saleId}/csv`, `factura-${saleId}`, 'csv')
  },
}
