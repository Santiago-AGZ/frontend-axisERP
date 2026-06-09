import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import { downloadFromApi } from '@/lib/download'

export interface DashboardData {
  todayRevenue: number
  todaySalesCount: number
  pendingSalesCount: number
  lowStockCount: number
  totalCustomers: number
  recentSales: Array<{
    id: string
    saleNumber: string
    total: number
    status: string
    createdAt: string
  }>
}

export interface SalesReport {
  startDate: string
  endDate: string
  totalSales: number
  totalTransactions: number
  totalRevenue: number
  totalTax: number
  totalDiscount: number
  salesByStatus: Record<string, number>
  salesByUser: Record<string, number>
  recentSales: Array<{
    id: string
    saleNumber: string
    status: string
    total: number
    createdAt: string
  }>
}

export interface InventoryReport {
  totalProducts: number
  lowStockCount: number
  depletedCount: number
  items: Array<{
    productId: string
    productName: string
    currentStock: number
    minStock: number
    lowStock: boolean
    depleted: boolean
  }>
}

export interface TopProductsReport {
  startDate: string
  endDate: string
  rankings: Array<{
    position: number
    productId: string
    productName: string
    totalQuantity: number
    totalRevenue: number
  }>
}

export interface FrequentCustomerReport {
  startDate: string
  endDate: string
  customers: Array<{
    position: number
    customerId: string
    customerName: string
    totalVisits: number
    totalSpent: number
    averageTicket: number
    lastVisitDate: string
  }>
}

export const reportService = {
  getDashboard: async () => {
    const response = await api.get<ApiResponse<DashboardData>>('/reports/dashboard')
    return response.data.data
  },

  getSalesReport: async (params?: { startDate?: string; endDate?: string; status?: string; userId?: string; clientId?: string }) => {
    const response = await api.get<ApiResponse<SalesReport>>('/reports/sales', { params })
    return response.data.data
  },

  getInventoryReport: async (params?: { categoryId?: string }) => {
    const response = await api.get<ApiResponse<InventoryReport>>('/reports/inventory', { params })
    return response.data.data
  },

  getTopProducts: async (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    const response = await api.get<ApiResponse<TopProductsReport>>('/reports/top-products', { params })
    return response.data.data
  },

  getFrequentCustomers: async (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    const response = await api.get<ApiResponse<FrequentCustomerReport>>('/reports/customers/frequent', { params })
    return response.data.data
  },

  downloadSalesPdf: async (params?: { startDate?: string; endDate?: string; clientId?: string }) => {
    await downloadFromApi('/reports/sales/export/pdf', 'reporte-ventas', 'pdf', params)
  },

  downloadInventoryExcel: async (params?: { categoryId?: string }) => {
    await downloadFromApi('/reports/inventory/export/excel', 'reporte-inventario', 'xlsx', params)
  },

  downloadSalesCsv: async (params?: { startDate?: string; endDate?: string; status?: string; userId?: string; clientId?: string }) => {
    await downloadFromApi('/reports/sales/export/csv', 'reporte-ventas', 'csv', params)
  },
}
