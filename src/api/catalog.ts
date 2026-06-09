import { api } from "@/lib/axios";
import type {
  Product,
  Category,
  CategoryTree,
  ProductBarcode,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateBarcodeRequest,
} from "@/types/catalog";

export const catalogApi = {
  listProducts: (params: {
    search?: string;
    codigo?: string;
    categoryId?: string;
    includeInactive?: boolean;
    page?: number;
    size?: number;
  }) => api.get<Product[]>("/productos", { params }),

  getProduct: (id: string) => api.get<Product>(`/productos/${id}`),

  createProduct: (data: CreateProductRequest) =>
    api.post<Product>("/productos", data),

  updateProduct: (id: string, data: UpdateProductRequest) =>
    api.put<Product>(`/productos/${id}`, data),

  deactivateProduct: (id: string) =>
    api.patch<Product>(`/productos/${id}/desactivar`),

  reactivateProduct: (id: string) =>
    api.patch<Product>(`/productos/${id}/reactivar`),

  listCategories: () => api.get<Category[]>("/categorias"),

  getCategory: (id: string) => api.get<Category>(`/categorias/${id}`),

  createCategory: (data: CreateCategoryRequest) =>
    api.post<Category>("/categorias", data),

  updateCategory: (id: string, data: UpdateCategoryRequest) =>
    api.put<Category>(`/categorias/${id}`, data),

  deactivateCategory: (id: string) =>
    api.patch<Category>(`/categorias/${id}/desactivar`),

  reactivateCategory: (id: string) =>
    api.patch<Category>(`/categorias/${id}/reactivar`),

  getCategoryTree: () => api.get<CategoryTree[]>("/categorias/arbol"),

  listBarcodes: (productId: string) =>
    api.get<ProductBarcode[]>(`/productos/${productId}/barcodes`),

  createBarcode: (productId: string, data: CreateBarcodeRequest) =>
    api.post<ProductBarcode>(`/productos/${productId}/barcodes`, data),

  deleteBarcode: (productId: string, barcodeId: string) =>
    api.delete(`/productos/${productId}/barcodes/${barcodeId}`),
};
