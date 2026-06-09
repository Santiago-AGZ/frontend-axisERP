import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { SeoHead } from '@/components/shared/seo-head'

const resetSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirm: z.string().min(1, 'Confirma tu contraseña'),
}).refine(d => d.password === d.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
})

type ResetValues = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirm: '' },
  })

  async function onSubmit(data: ResetValues) {
    if (!token) { setError('Token inválido o expirado'); return }
    setError('')
    try {
      await api.post('/auth/password-reset/confirm', { token, newPassword: data.password })
      toast.success('Contraseña actualizada exitosamente')
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al restablecer la contraseña'
      setError(msg)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <SeoHead title="Restablecer Contraseña" />
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>Enlace inválido o expirado. Solicita un nuevo restablecimiento.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <SeoHead title="Contraseña Actualizada" />
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="mx-auto mb-4 size-12 text-emerald-500" />
            <h2 className="mb-2 text-xl font-semibold">Contraseña actualizada</h2>
            <p className="text-sm text-muted-foreground">Redirigiendo al inicio de sesión...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <SeoHead title="Restablecer Contraseña" />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Nueva contraseña</CardTitle>
          <CardDescription>Ingresa tu nueva contraseña para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" autoComplete="new-password" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="confirm" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" autoComplete="new-password" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full gap-2" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
