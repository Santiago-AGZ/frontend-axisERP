import { z } from 'zod'

export const stockEntrySchema = z.object({
  productId: z.string().uuid('Selecciona un producto válido').refine(v => !/[<>&"']/.test(v), { message: 'El producto no puede contener caracteres HTML' }),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
  notes: z.string().refine(v => !/[<>&"']/.test(v), { message: 'Las notas no pueden contener caracteres HTML' }).optional(),
})

export const stockExitSchema = z.object({
  productId: z.string().uuid('Selecciona un producto válido').refine(v => !/[<>&"']/.test(v), { message: 'El producto no puede contener caracteres HTML' }),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
  notes: z.string().min(1, 'El motivo es obligatorio para salidas').refine(v => !/[<>&"']/.test(v), { message: 'Las notas no pueden contener caracteres HTML' }),
})

export type StockEntryValues = z.infer<typeof stockEntrySchema>
export type StockExitValues = z.infer<typeof stockExitSchema>
