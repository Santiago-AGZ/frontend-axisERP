// ============================================================================
// CATALOG SERVICE TYPES
// ============================================================================

export type ProductStatus = 'ACTIVO' | 'INACTIVO'
export type CategoryStatus = 'ACTIVA' | 'INACTIVA'
export type BarcodeType = 'EAN13' | 'EAN8' | 'UPC_A' | 'UPC_E' | 'CODE128' | 'CODE39' | 'QR'

export interface Product {
  id: string
  name: string
  codigo: string
  description?: string
  categoryId: string
  category: CategorySummary
  purchasePrice: number
  salePrice: number
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface CategorySummary {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  status: CategoryStatus
  createdAt: string
  updatedAt: string
}

export interface CategoryTree {
  id: string
  name: string
  description?: string
  parentId?: string
  status: string
  children: CategoryTree[]
}

export interface ProductBarcode {
  id: string
  productId: string
  barcodeValue: string
  barcodeType: BarcodeType
  isPrimary: boolean
  createdAt: string
}

export interface CreateProductRequest {
  name: string
  codigo: string
  description?: string
  categoryId: string
  purchasePrice: number
  salePrice: number
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  categoryId?: string
  purchasePrice?: number
  salePrice?: number
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  parentId?: string
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  parentId?: string
}

export interface CreateBarcodeRequest {
  barcodeValue: string
  barcodeType: BarcodeType
  isPrimary?: boolean
}
