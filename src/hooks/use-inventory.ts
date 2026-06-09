import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/api/inventory'
import type { StockEntryRequest, StockExitRequest } from '@/types/inventory'

export function useInventory(params: { search?: string; categoryId?: string; includeLowStock?: boolean } = {}) {
  return useQuery({ queryKey: ['inventory', params], queryFn: () => inventoryApi.getInventory(params).then(r => r.data), staleTime: 30000 })
}

export function useProductInventory(productId: string) {
  return useQuery({ queryKey: ['inventory', productId], queryFn: () => inventoryApi.getProductInventory(productId).then(r => r.data), enabled: !!productId, staleTime: 30000 })
}

export function useInventoryAlerts() {
  return useQuery({ queryKey: ['inventory-alerts'], queryFn: () => inventoryApi.getAlerts().then(r => r.data), staleTime: 30000 })
}

export function useRegisterStockEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StockEntryRequest) => inventoryApi.registerEntry(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useRegisterStockExit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StockExitRequest) => inventoryApi.registerExit(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useInventoryMovements(params: { productId?: string; from?: string; to?: string; page?: number; size?: number } = {}) {
  return useQuery({ queryKey: ['inventory-movements', params], queryFn: () => inventoryApi.getMovements(params).then(r => r.data), staleTime: 30000 })
}
