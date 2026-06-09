import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseApi } from '@/api/purchase'
import type { CreateSupplierRequest, UpdateSupplierRequest, CreatePurchaseRequest, UpdatePurchaseStatusRequest } from '@/types/purchase'

export function useSuppliers(params: { search?: string; nit?: string } = {}) {
  return useQuery({ queryKey: ['suppliers', params], queryFn: () => purchaseApi.listSuppliers(params).then(r => r.data), staleTime: 30000 })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSupplierRequest) => purchaseApi.createSupplier(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

export function useUpdateSupplier(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateSupplierRequest) => purchaseApi.updateSupplier(id, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

export function useDeactivateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => purchaseApi.deactivateSupplier(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

export function usePurchases(params: { supplierId?: string; from?: string; to?: string; status?: string; page?: number; size?: number } = {}) {
  return useQuery({ queryKey: ['purchases', params], queryFn: () => purchaseApi.listPurchases(params).then(r => r.data), staleTime: 30000 })
}

export function usePurchase(id: string) {
  return useQuery({ queryKey: ['purchases', id], queryFn: () => purchaseApi.getPurchase(id).then(r => r.data), enabled: !!id, staleTime: 30000 })
}

export function useCreatePurchase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePurchaseRequest) => purchaseApi.createPurchase(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useUpdatePurchaseStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseStatusRequest }) => purchaseApi.updatePurchaseStatus(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
