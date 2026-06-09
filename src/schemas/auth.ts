import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const createUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  roleId: z.string().uuid('Selecciona un rol válido'),
})

export const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  roleId: z.string().uuid('Selecciona un rol válido').optional(),
})

export const createRoleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(2, 'La descripción debe tener al menos 2 caracteres'),
})

export const updateRoleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  description: z.string().min(2, 'La descripción debe tener al menos 2 caracteres').optional(),
})

export type LoginValues = z.infer<typeof loginSchema>
export type CreateUserValues = z.infer<typeof createUserSchema>
export type UpdateUserValues = z.infer<typeof updateUserSchema>
export type CreateRoleValues = z.infer<typeof createRoleSchema>
export type UpdateRoleValues = z.infer<typeof updateRoleSchema>
