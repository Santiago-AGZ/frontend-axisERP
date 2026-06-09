// ============================================================================
// PURCHASE SERVICE TYPES
// ============================================================================

export type EntityStatus = 'ACTIVO' | 'INACTIVO'
export type PurchasePaymentStatus = 'PENDIENTE' | 'PAGADA'
export type OrderStatus = 'BORRADOR' | 'ENVIADA' | 'RECIBIDA' | 'PAGADA' | 'CANCELADA'

export interface Supplier {
  id: string
  name: string
  nit: string
  phone?: string
  email?: string
  address?: string
  status: EntityStatus
  createdAt: string
  updatedAt?: string
}

export interface Purchase {
  id: string
  supplierId: string
  supplierName: string
  orderNumber?: string
  total: number
  orderStatus: OrderStatus
  paymentStatus: PurchasePaymentStatus
  notes?: string
  receivedAt?: string
  date: string
  updatedAt?: string
  items: PurchaseItem[]
}

export interface PurchaseItem {
  id: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  receivedQty?: number
  subtotal: number
}

export interface CreateSupplierRequest {
  name: string
  nit: string
  phone?: string
  email?: string
  address?: string
}

export interface UpdateSupplierRequest {
  name?: string
  phone?: string
  email?: string
  address?: string
}

export interface CreatePurchaseRequest {
  supplierId: string
  status: OrderStatus
  items: PurchaseItemRequest[]
}

export interface PurchaseItemRequest {
  productId: string
  quantity: number
  unitPrice: number
}

export interface UpdatePurchaseStatusRequest {
  status: OrderStatus
}
