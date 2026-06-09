import { z } from 'zod'

export const createSupplierSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El nombre no puede contener caracteres HTML' }),
  nit: z.string().min(3, 'El NIT debe tener al menos 3 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El NIT no puede contener caracteres HTML' }),
  phone: z.string().refine(v => !/[<>&"']/.test(v), { message: 'El teléfono no puede contener caracteres HTML' }).optional(),
  email: z.string().email('Email inválido').refine(v => !/[<>&"']/.test(v), { message: 'El email no puede contener caracteres HTML' }).optional().or(z.literal('')),
  address: z.string().refine(v => !/[<>&"']/.test(v), { message: 'La dirección no puede contener caracteres HTML' }).optional(),
})

export const updateSupplierSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El nombre no puede contener caracteres HTML' }).optional(),
  nit: z.string().min(3, 'El NIT debe tener al menos 3 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El NIT no puede contener caracteres HTML' }).optional(),
  phone: z.string().refine(v => !/[<>&"']/.test(v), { message: 'El teléfono no puede contener caracteres HTML' }).optional(),
  email: z.string().email('Email inválido').refine(v => !/[<>&"']/.test(v), { message: 'El email no puede contener caracteres HTML' }).optional().or(z.literal('')),
  address: z.string().refine(v => !/[<>&"']/.test(v), { message: 'La dirección no puede contener caracteres HTML' }).optional(),
})

export const createPurchaseSchema = z.object({
  supplierId: z.string().uuid('Selecciona un proveedor válido').refine(v => !/[<>&"']/.test(v), { message: 'El proveedor no puede contener caracteres HTML' }),
  status: z.enum(['BORRADOR', 'ENVIADA', 'RECIBIDA', 'PAGADA', 'CANCELADA']),
  items: z.array(z.object({
    productId: z.string().uuid('Producto inválido').refine(v => !/[<>&"']/.test(v), { message: 'El producto no puede contener caracteres HTML' }),
    quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
    unitPrice: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  })).min(1, 'Agrega al menos un item'),
})

export type CreateSupplierValues = z.infer<typeof createSupplierSchema>
export type UpdateSupplierValues = z.infer<typeof updateSupplierSchema>
export type CreatePurchaseValues = z.infer<typeof createPurchaseSchema>
