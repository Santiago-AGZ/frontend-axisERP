import { api } from "@/lib/axios";
import type {
  Customer,
  Sale,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CreateSaleRequest,
  VoidSaleRequest,
  UpdatePaymentStatusRequest,
} from "@/types/sales";

export const salesApi = {
  listCustomers: (params: {
    search?: string;
    documentNumber?: string;
    phone?: string;
  }) => api.get<Customer[]>("/clientes", { params }),

  createCustomer: (data: CreateCustomerRequest) =>
    api.post<Customer>("/clientes", data),

  updateCustomer: (id: string, data: UpdateCustomerRequest) =>
    api.put<Customer>(`/clientes/${id}`, data),

  deactivateCustomer: (id: string) =>
    api.patch<Customer>(`/clientes/${id}/desactivar`),

  listSales: (params: {
    from?: string;
    to?: string;
    customerId?: string;
    invoiceNumber?: string;
    paymentStatus?: string;
    page?: number;
    size?: number;
  }) => api.get<Sale[]>("/ventas", { params }),

  getSale: (id: string) => api.get<Sale>(`/ventas/${id}`),

  createSale: (data: CreateSaleRequest) => api.post<Sale>("/ventas", data),

  voidSale: (id: string, data: VoidSaleRequest) =>
    api.patch<Sale>(`/ventas/${id}/anular`, data),

  updatePaymentStatus: (id: string, data: UpdatePaymentStatusRequest) =>
    api.patch<Sale>(`/ventas/${id}/estado-pago`, data),
};
