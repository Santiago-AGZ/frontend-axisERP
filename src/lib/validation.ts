import { z } from 'zod'

const noHTML = (v: string) => !/[<>&"']/.test(v)
const msg = (field: string) => `${field} no puede contener caracteres HTML`

export function stringField(min = 1, label = 'Este campo') {
  return z.string().min(min, `${label} debe tener al menos ${min} caracter(es)`).refine(noHTML, { message: msg(label) })
}

export function emailField(label = 'Email') {
  return z.string().email(`${label} inválido`).refine(noHTML, { message: msg(label) })
}

export function optionalString(label = 'Este campo') {
  return z.string().refine(noHTML, { message: msg(label) }).optional()
}
