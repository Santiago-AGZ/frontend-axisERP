import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from '@/components/ui/form'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authService } from '@/services/auth'

const resetSchema = z.object({
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir una mayúscula')
    .regex(/[a-z]/, 'Debe incluir una minúscula')
    .regex(/[0-9]/, 'Debe incluir un número')
    .regex(/[@#$%^&*!]/, 'Debe incluir un carácter especial (@#$%^&*!)'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type ResetValues = z.infer<typeof resetSchema>

function extractRecoveryToken(): string {
  const hash = window.location.hash.replace('#', '')
  if (hash) {
    const hashParams = new URLSearchParams(hash)
    const at = hashParams.get('access_token')
    if (at) return at
  }
  const params = new URLSearchParams(window.location.search)
  const th = params.get('token_hash')
  if (th) return th
  const code = params.get('code')
  if (code) return code
  return params.get('token') ?? ''
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [token] = useState(extractRecoveryToken)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const pwd = form.watch('password')
  const checks = {
    min: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
    special: /[@#$%^&*!]/.test(pwd),
    noSpace: /^\S*$/.test(pwd),
  }

  if (!token) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto mb-4 size-12 text-destructive" />
            <CardTitle>Enlace inválido</CardTitle>
            <CardDescription>
              No se encontró un token de recuperación en el enlace. Asegúrate de usar el enlace completo del correo.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full" onClick={() => navigate('/login')}>
              Volver al inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function onSubmit(data: ResetValues) {
    setError('')
    setIsLoading(true)
    try {
      await authService.passwordReset(token, data.password)
      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar la contraseña. El enlace puede haber expirado.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
              <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle>Contraseña actualizada</CardTitle>
            <CardDescription>
              Ahora puedes iniciar sesión con tu nueva contraseña
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full" onClick={() => navigate('/login')}>
              Iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl">Nueva contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña para AxisERP
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4" role="alert">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 8 caracteres"
                          className="pl-10 pr-10"
                          autoComplete="new-password"
                          aria-label="Nueva contraseña"
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
                    <div className="space-y-1 pt-1">
                      {[
                        { label: 'Mínimo 8 caracteres', ok: checks.min },
                        { label: 'Una mayúscula', ok: checks.upper },
                        { label: 'Una minúscula', ok: checks.lower },
                        { label: 'Un número', ok: checks.digit },
                        { label: 'Un carácter especial (@#$%^&*!)', ok: checks.special },
                        { label: 'Sin espacios', ok: checks.noSpace },
                      ].map((r) => (
                        <div key={r.label} className={`flex items-center gap-1.5 text-xs ${r.ok ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          {r.ok ? <CheckCircle2 className="size-3 shrink-0" /> : <XCircle className="size-3 shrink-0" />}
                          <span>{r.label}</span>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Repite la contraseña"
                          className="pl-10"
                          autoComplete="new-password"
                          aria-label="Confirmar contraseña"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                {isLoading ? 'Actualizando...' : 'Cambiar contraseña'}
              </Button>

              <Link to="/login" className="block w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline">
                Volver al inicio de sesión
              </Link>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
