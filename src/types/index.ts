export interface Usuario {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  status: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE' | 'ELIMINADO'
  lastLoginAt?: string
  createdAt: string
}

export interface Producto {
  id: string
  nombre: string
  descripcion?: string
  codigo: string
  categoriaId: string
  precioCompra: number
  precioVenta: number
  stock: number
  stockMinimo: number
  activo: boolean
  createdAt: string
}

export interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  activa: boolean
}

export interface Venta {
  id: string
  clienteId: string
  items: VentaItem[]
  subtotal: number
  iva: number
  descuento: number
  total: number
  estado: 'COMPLETADA' | 'ANULADA' | 'PENDIENTE'
  estadoPago: 'PAGADO' | 'PENDIENTE' | 'PARCIAL'
  fecha: string
}

export interface VentaItem {
  productoId: string
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Cliente {
  id: string
  nombre: string
  email?: string
  telefono?: string
  documento: string
  nit?: string
  direccion?: string
  activo: boolean
}

export interface Proveedor {
  id: string
  nombre: string
  email?: string
  telefono?: string
  nit: string
  direccion?: string
  activo: boolean
}

export interface Inventario {
  productoId: string
  nombre: string
  stock: number
  stockMinimo: number
  alertas: boolean
}

export interface MovimientoInventario {
  id: string
  productoId: string
  tipo: 'COMPRA' | 'VENTA' | 'DEVOLUCION' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO' | 'PERDIDA'
  cantidad: number
  motivo?: string
  fecha: string
}

export interface Role {
  id: string
  nombre: string
  descripcion?: string
  permisos: string[]
}

export interface AuditLog {
  id: string
  usuarioId: string
  accion: string
  recurso: string
  detalles?: string
  fecha: string
}
