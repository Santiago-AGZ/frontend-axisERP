import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido').refine(v => !/[<>&"']/.test(v), { message: 'El email no puede contener caracteres HTML' }),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'La contraseña no puede contener caracteres HTML' }),
})

export const createUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El nombre no puede contener caracteres HTML' }),
  email: z.string().email('Email inválido').refine(v => !/[<>&"']/.test(v), { message: 'El email no puede contener caracteres HTML' }),
  roleId: z.string().uuid('Selecciona un rol válido').refine(v => !/[<>&"']/.test(v), { message: 'El rol no puede contener caracteres HTML' }),
})

export const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El nombre no puede contener caracteres HTML' }).optional(),
  email: z.string().email('Email inválido').refine(v => !/[<>&"']/.test(v), { message: 'El email no puede contener caracteres HTML' }).optional(),
  roleId: z.string().uuid('Selecciona un rol válido').refine(v => !/[<>&"']/.test(v), { message: 'El rol no puede contener caracteres HTML' }).optional(),
})

export const createRoleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El nombre no puede contener caracteres HTML' }),
  description: z.string().min(2, 'La descripción debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'La descripción no puede contener caracteres HTML' }),
})

export const updateRoleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'El nombre no puede contener caracteres HTML' }).optional(),
  description: z.string().min(2, 'La descripción debe tener al menos 2 caracteres').refine(v => !/[<>&"']/.test(v), { message: 'La descripción no puede contener caracteres HTML' }).optional(),
})

export type LoginValues = z.infer<typeof loginSchema>
export type CreateUserValues = z.infer<typeof createUserSchema>
export type UpdateUserValues = z.infer<typeof updateUserSchema>
export type CreateRoleValues = z.infer<typeof createRoleSchema>
export type UpdateRoleValues = z.infer<typeof updateRoleSchema>
