import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { Lock, Mail, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import type { ApiResponse } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import { SeoHead } from '@/components/shared/seo-head'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ForgotPasswordDialog } from '@/components/features/forgot-password-dialog'
import { noHTML } from '@/lib/validations'

const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido').refine(noHTML, { message: 'Email inválido' }),
  password: z.string().min(1, 'La contraseña es requerida').refine(noHTML, { message: 'Contraseña inválida' }),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginValues) {
    setError('')
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<unknown>>
      const backendMessage = axiosError.response?.data?.message
      setError(backendMessage || 'Credenciales inválidas. Verifica tu email y contraseña.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <SeoHead title="Iniciar Sesión" description="Accede al sistema de gestión empresarial AxisERP con tus credenciales." />

      <div className="w-full max-w-sm animate-fade-in space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <span className="text-base font-bold">A</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">AxisERP</h1>
          <p className="mt-1 text-sm text-muted-foreground">Plataforma de gestión empresarial</p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          {error && (
            <Alert className="mb-4 border-primary/20 bg-primary/[0.06]" role="alert">
              <AlertCircle className="size-4 shrink-0 text-primary" />
              <AlertDescription className="text-primary/80">{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="admin@axiserp.com"
                          className="pl-10 bg-secondary"
                          autoComplete="email"
                          aria-label="Correo electrónico"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-secondary"
                          autoComplete="current-password"
                          aria-label="Contraseña"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  'Iniciando sesión...'
                ) : (
                  <>
                    <LogIn className="size-4" />
                    Iniciar sesión
                  </>
                )}
              </Button>
            </form>
          </Form>

          <Separator className="my-4" />

          <div className="text-center">
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setForgotOpen(true)}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
        </div>
      </div>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
    </div>
  )
}
