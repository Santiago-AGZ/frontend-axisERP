export const statusLabel: Record<string, string> = {
  ACTIVO: 'Activo',
  ACTIVA: 'Activa',
  INACTIVO: 'Inactivo',
  INACTIVA: 'Inactiva',
  PENDIENTE: 'Pendiente',
  ELIMINADO: 'Eliminado',
  BORRADOR: 'Borrador',
  CONFIRMADA: 'Confirmada',
  PAGADA: 'Pagada',
  ANULADA: 'Anulada',
  RECIBIDA: 'Recibida',
  CANCELADA: 'Cancelada',
}

export const roleLabel: Record<string, string> = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  INVENTARIO: 'Inventario',
}

export const movementLabel: Record<string, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  DEVOLUCION: 'Devolucion',
  AJUSTE_POSITIVO: 'Ajuste positivo',
  AJUSTE_NEGATIVO: 'Ajuste negativo',
  INVENTARIO_INICIAL: 'Inventario inicial',
  ANULACION: 'Anulacion',
}

export const movementBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ENTRADA: 'default',
  INVENTARIO_INICIAL: 'default',
  AJUSTE_POSITIVO: 'default',
  DEVOLUCION: 'default',
  SALIDA: 'destructive',
  AJUSTE_NEGATIVO: 'destructive',
  ANULACION: 'destructive',
}

export const actionLabel: Record<string, string> = {
  LOGIN: 'Inicio de sesion',
  LOGOUT: 'Cierre de sesion',
  CREATE: 'Creacion',
  UPDATE: 'Actualizacion',
  DELETE: 'Eliminacion',
  DEACTIVATE: 'Desactivacion',
  REACTIVATE: 'Reactivacion',
  PASSWORD_RESET_REQUEST: 'Solicitud de restablecimiento',
  PASSWORD_RESET_COMPLETE: 'Restablecimiento completado',
}

export const entityLabel: Record<string, string> = {
  User: 'Usuario',
  Product: 'Producto',
  Sale: 'Venta',
  Customer: 'Cliente',
  Supplier: 'Proveedor',
  Category: 'Categoria',
  Purchase: 'Compra',
  Inventory: 'Inventario',
}

export const nextPurchaseStatusLabel: Record<string, string> = {
  PENDIENTE: 'Enviar a Pendiente',
  RECIBIDA: 'Marcar Recibida',
  PAGADA: 'Registrar Pago',
}
