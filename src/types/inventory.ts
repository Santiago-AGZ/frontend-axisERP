// ============================================================================
// INVENTORY SERVICE TYPES
// ============================================================================

export type MovementType = 'COMPRA' | 'VENTA' | 'DEVOLUCION' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO' | 'PERDIDA' | 'INVENTARIO_INICIAL'
export type StockLevel = 'AGOTADO' | 'CRITICO' | 'BAJO' | 'NORMAL'

export interface InventoryItem {
  id: string
  productId: string
  productName: string
  productCode: string
  categoryName: string
  currentStock: number
  minStock: number
  lowStock: boolean
  outOfStock: boolean
  stockLevel?: StockLevel
  lastUpdated: string
}

export interface InventoryMovement {
  id: string
  productId: string
  productName: string
  productCode: string
  type: MovementType
  quantity: number
  previousStock: number
  newStock: number
  userId?: string
  notes?: string
  createdAt: string
}

export interface StockEntryRequest {
  productId: string
  quantity: number
  notes?: string
}

export interface StockExitRequest {
  productId: string
  quantity: number
  notes: string
}
