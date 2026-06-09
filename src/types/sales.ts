// ============================================================================
// SALES SERVICE TYPES
// ============================================================================

export type EntityStatus = 'ACTIVO' | 'INACTIVO'
export type DocumentType = 'CC' | 'NIT' | 'PASAPORTE' | 'CE'
export type PaymentStatus = 'PENDIENTE' | 'PARCIAL' | 'PAGADO'
export type SaleStatus = 'PENDIENTE' | 'PAGADO' | 'ANULADA'

export interface Customer {
  id: string
  name: string
  documentType: DocumentType
  documentNumber: string
  phone?: string
  email?: string
  address?: string
  status: EntityStatus
  createdAt: string
  updatedAt?: string
}

export interface Sale {
  id: string
  customerId: string
  customerName: string
  invoiceNumber: string
  subtotal: number
  iva: number
  discount: number
  total: number
  paymentStatus: PaymentStatus
  saleStatus: SaleStatus
  cancelReason?: string
  userId: string
  date: string
  updatedAt?: string
  items: SaleItem[]
}

export interface SaleItem {
  id: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface CreateCustomerRequest {
  name: string
  documentType: DocumentType
  documentNumber: string
  phone?: string
  email?: string
  address?: string
}

export interface UpdateCustomerRequest {
  name: string
  documentType: DocumentType
  documentNumber: string
  phone?: string
  email?: string
  address?: string
}

export interface CreateSaleRequest {
  customerId: string
  paymentStatus: PaymentStatus
  discount?: number
  items: SaleItemRequest[]
}

export interface SaleItemRequest {
  productId: string
  quantity: number
  unitPrice: number
}

export interface VoidSaleRequest {
  reason: string
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus
}
