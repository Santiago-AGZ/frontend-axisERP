import { api } from "@/lib/axios";
import type {
  Supplier,
  Purchase,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  CreatePurchaseRequest,
  UpdatePurchaseStatusRequest,
} from "@/types/purchase";

export const purchaseApi = {
  listSuppliers: (params: { search?: string; nit?: string }) =>
    api.get<Supplier[]>("/proveedores", { params }),

  createSupplier: (data: CreateSupplierRequest) =>
    api.post<Supplier>("/proveedores", data),

  updateSupplier: (id: string, data: UpdateSupplierRequest) =>
    api.put<Supplier>(`/proveedores/${id}`, data),

  deactivateSupplier: (id: string) =>
    api.patch<Supplier>(`/proveedores/${id}/desactivar`),

  listPurchases: (params: {
    supplierId?: string;
    from?: string;
    to?: string;
    status?: string;
    page?: number;
    size?: number;
  }) => api.get<Purchase[]>("/compras", { params }),

  getPurchase: (id: string) => api.get<Purchase>(`/compras/${id}`),

  createPurchase: (data: CreatePurchaseRequest) =>
    api.post<Purchase>("/compras", data),

  updatePurchaseStatus: (id: string, data: UpdatePurchaseStatusRequest) =>
    api.patch<Purchase>(`/compras/${id}/estado`, data),
};
