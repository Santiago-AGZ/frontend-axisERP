import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesApi } from '@/api/sales'
import type { CreateCustomerRequest, UpdateCustomerRequest, CreateSaleRequest, VoidSaleRequest, UpdatePaymentStatusRequest } from '@/types/sales'

export function useCustomers(params: { search?: string; documentNumber?: string; phone?: string } = {}) {
  return useQuery({ queryKey: ['customers', params], queryFn: () => salesApi.listCustomers(params).then(r => r.data), staleTime: 30000 })
}

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => salesApi.createCustomer(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCustomerRequest) => salesApi.updateCustomer(id, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export function useDeactivateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => salesApi.deactivateCustomer(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export function useSales(params: { from?: string; to?: string; customerId?: string; invoiceNumber?: string; paymentStatus?: string; page?: number; size?: number } = {}) {
  return useQuery({ queryKey: ['sales', params], queryFn: () => salesApi.listSales(params).then(r => r.data), staleTime: 30000 })
}

export function useSale(id: string) {
  return useQuery({ queryKey: ['sales', id], queryFn: () => salesApi.getSale(id).then(r => r.data), enabled: !!id, staleTime: 30000 })
}

export function useCreateSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSaleRequest) => salesApi.createSale(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useVoidSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VoidSaleRequest }) => salesApi.voidSale(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentStatusRequest }) => salesApi.updatePaymentStatus(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
