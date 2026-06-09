import { z } from 'zod'

export const createSupplierSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  nit: z.string().min(3, 'El NIT debe tener al menos 3 caracteres'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
})

export const updateSupplierSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  nit: z.string().min(3, 'El NIT debe tener al menos 3 caracteres').optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
})

export const createPurchaseSchema = z.object({
  supplierId: z.string().uuid('Selecciona un proveedor válido'),
  status: z.enum(['BORRADOR', 'ENVIADA', 'RECIBIDA', 'PAGADA', 'CANCELADA']),
  items: z.array(z.object({
    productId: z.string().uuid('Producto inválido'),
    quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
    unitPrice: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  })).min(1, 'Agrega al menos un item'),
})

export type CreateSupplierValues = z.infer<typeof createSupplierSchema>
export type UpdateSupplierValues = z.infer<typeof updateSupplierSchema>
export type CreatePurchaseValues = z.infer<typeof createPurchaseSchema>
