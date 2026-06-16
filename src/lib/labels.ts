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

export const statusBadge: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  CONFIRMADA: 'outline',
  PAGADA: 'default',
  ANULADA: 'destructive',
  BORRADOR: 'secondary',
  PENDIENTE: 'outline',
  RECIBIDA: 'default',
  CANCELADA: 'destructive',
  ACTIVO: 'default',
  ACTIVA: 'default',
  INACTIVO: 'secondary',
  INACTIVA: 'secondary',
  ELIMINADO: 'destructive',
}

export const actionBadge: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  LOGIN: 'default',
  LOGOUT: 'secondary',
  CREATE: 'default',
  UPDATE: 'outline',
  DELETE: 'destructive',
  DEACTIVATE: 'destructive',
  REACTIVATE: 'default',
  PASSWORD_RESET_REQUEST: 'secondary',
  PASSWORD_RESET_COMPLETE: 'default',
}

export const roleBadgeColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  VENDEDOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  INVENTARIO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export const roleTextColors: Record<string, string> = {
  ADMIN: 'text-red-600',
  VENDEDOR: 'text-blue-600',
  INVENTARIO: 'text-amber-600',
}
