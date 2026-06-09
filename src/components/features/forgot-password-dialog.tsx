import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { authService } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'

const resetSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
})

type ResetValues = z.infer<typeof resetSchema>

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 'email' | 'sent'

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<Step>('email')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  })

  function handleOpenChange(open: boolean) {
    if (!open) {
      setStep('email')
      setError('')
      form.reset()
    }
    onOpenChange(open)
  }

  async function onSubmit(data: ResetValues) {
    setError('')
    setIsLoading(true)
    try {
      await authService.passwordReset(data.email)
      setStep('sent')
    } catch {
      setError('Error al enviar la solicitud. Verifica el correo e intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {step === 'email' ? (
          <>
            <DialogHeader>
              <DialogTitle>Recuperar contraseña</DialogTitle>
              <DialogDescription>
                Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
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
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleOpenChange(false)}
                >
                  <ArrowLeft className="size-4" />
                  Volver al inicio de sesión
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Correo enviado</DialogTitle>
              <DialogDescription>
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Si el correo ingresado está registrado, recibirás un mensaje con los pasos a seguir.
              </p>
            </div>

            <Button variant="outline" className="w-full" onClick={() => handleOpenChange(false)}>
              Volver al inicio de sesión
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
