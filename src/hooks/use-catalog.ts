import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { catalogApi } from '@/api/catalog'
import type { CreateProductRequest, UpdateProductRequest, CreateCategoryRequest, UpdateCategoryRequest, CreateBarcodeRequest } from '@/types/catalog'

export function useProducts(params: { search?: string; codigo?: string; categoryId?: string; includeInactive?: boolean } = {}) {
  return useQuery({ queryKey: ['products', params], queryFn: () => catalogApi.listProducts(params).then(r => r.data), staleTime: 30000 })
}

export function useProduct(id: string) {
  return useQuery({ queryKey: ['products', id], queryFn: () => catalogApi.getProduct(id).then(r => r.data), enabled: !!id, staleTime: 30000 })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductRequest) => catalogApi.createProduct(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProductRequest) => catalogApi.updateProduct(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['products', id] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useDeactivateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogApi.deactivateProduct(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useReactivateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogApi.reactivateProduct(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => catalogApi.createCategory(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories', 'category-tree'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCategoryRequest) => catalogApi.updateCategory(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories', 'category-tree'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useDeactivateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogApi.deactivateCategory(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories', 'category-tree'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: () => catalogApi.listCategories().then(r => r.data), staleTime: 30000 })
}

export function useCategoryTree() {
  return useQuery({ queryKey: ['category-tree'], queryFn: () => catalogApi.getCategoryTree().then(r => r.data), staleTime: 30000 })
}

export function useBarcodes(productId: string) {
  return useQuery({ queryKey: ['barcodes', productId], queryFn: () => catalogApi.listBarcodes(productId).then(r => r.data), enabled: !!productId, staleTime: 30000 })
}

export function useCreateBarcode(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBarcodeRequest) => catalogApi.createBarcode(productId, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['barcodes', productId] }),
  })
}

export function useDeleteBarcode(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (barcodeId: string) => catalogApi.deleteBarcode(productId, barcodeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['barcodes', productId] }),
  })
}
