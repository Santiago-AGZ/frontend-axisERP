import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El nombre no puede contener caracteres HTML' }),
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El código no puede contener caracteres HTML' }),
  description: z.string().refine(v => !/[<>&"']/.test(v), { message: 'La descripción no puede contener caracteres HTML' }).optional(),
  categoryId: z.string().uuid('Selecciona una categoría válida').refine(v => !/[<>&"']/.test(v), { message: 'La categoría no puede contener caracteres HTML' }),
  purchasePrice: z.number().min(0.01, 'El precio de compra debe ser mayor a 0'),
  salePrice: z.number().min(0.01, 'El precio de venta debe ser mayor a 0'),
}).refine((data) => data.salePrice >= data.purchasePrice, {
  message: 'El precio de venta debe ser mayor o igual al precio de compra',
  path: ['salePrice'],
})

export const updateProductSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El nombre no puede contener caracteres HTML' }).optional(),
  description: z.string().refine(v => !/[<>&"']/.test(v), { message: 'La descripción no puede contener caracteres HTML' }).optional(),
  categoryId: z.string().uuid('Selecciona una categoría válida').refine(v => !/[<>&"']/.test(v), { message: 'La categoría no puede contener caracteres HTML' }).optional(),
  purchasePrice: z.number().min(0.01, 'El precio de compra debe ser mayor a 0').optional(),
  salePrice: z.number().min(0.01, 'El precio de venta debe ser mayor a 0').optional(),
})

export const createCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El nombre no puede contener caracteres HTML' }),
  description: z.string().refine(v => !/[<>&"']/.test(v), { message: 'La descripción no puede contener caracteres HTML' }).optional(),
  parentId: z.string().uuid().refine(v => !/[<>&"']/.test(v), { message: 'La categoría padre no puede contener caracteres HTML' }).optional().or(z.literal('')),
})

export const updateCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El nombre no puede contener caracteres HTML' }).optional(),
  description: z.string().refine(v => !/[<>&"']/.test(v), { message: 'La descripción no puede contener caracteres HTML' }).optional(),
  parentId: z.string().uuid().refine(v => !/[<>&"']/.test(v), { message: 'La categoría padre no puede contener caracteres HTML' }).optional().or(z.literal('')),
})

export type CreateProductValues = z.infer<typeof createProductSchema>
export type UpdateProductValues = z.infer<typeof updateProductSchema>
export type CreateCategoryValues = z.infer<typeof createCategorySchema>
export type UpdateCategoryValues = z.infer<typeof updateCategorySchema>
