import { z } from 'zod'

export const stockEntrySchema = z.object({
  productId: z.string().uuid('Selecciona un producto válido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
  notes: z.string().optional(),
})

export const stockExitSchema = z.object({
  productId: z.string().uuid('Selecciona un producto válido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
  notes: z.string().min(1, 'El motivo es obligatorio para salidas'),
})

export type StockEntryValues = z.infer<typeof stockEntrySchema>
export type StockExitValues = z.infer<typeof stockExitSchema>
