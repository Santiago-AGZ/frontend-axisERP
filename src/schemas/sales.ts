import { z } from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El nombre no puede contener caracteres HTML' }),
  documentType: z.enum(['CC', 'NIT', 'PASAPORTE', 'CE']),
  documentNumber: z.string().min(3, 'El número de documento debe tener al menos 3 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El documento no puede contener caracteres HTML' }),
  phone: z.string().refine(v => !/[<>&"']/.test(v), { message: 'El teléfono no puede contener caracteres HTML' }).optional(),
  email: z.string().email('Email inválido').refine(v => !/[<>&"']/.test(v), { message: 'El email no puede contener caracteres HTML' }).optional().or(z.literal('')),
  address: z.string().refine(v => !/[<>&"']/.test(v), { message: 'La dirección no puede contener caracteres HTML' }).optional(),
})

export const updateCustomerSchema = createCustomerSchema

export const createSaleSchema = z.object({
  customerId: z.string().uuid('Selecciona un cliente válido').refine(v => !/[<>&"']/.test(v), { message: 'El cliente no puede contener caracteres HTML' }),
  paymentStatus: z.enum(['PENDIENTE', 'PARCIAL', 'PAGADO']),
  discount: z.number().min(0).max(30, 'El descuento no puede superar el 30%').optional(),
  items: z.array(z.object({
    productId: z.string().uuid('Producto inválido').refine(v => !/[<>&"']/.test(v), { message: 'El producto no puede contener caracteres HTML' }),
    quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
    unitPrice: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  })).min(1, 'Agrega al menos un item'),
})

export const voidSaleSchema = z.object({
  reason: z.string().min(1, 'El motivo de anulación es obligatorio').refine(v => !/[<>&"']/.test(v), { message: 'El motivo no puede contener caracteres HTML' }),
})

export type CreateCustomerValues = z.infer<typeof createCustomerSchema>
export type UpdateCustomerValues = z.infer<typeof updateCustomerSchema>
export type CreateSaleValues = z.infer<typeof createSaleSchema>
export type VoidSaleValues = z.infer<typeof voidSaleSchema>
