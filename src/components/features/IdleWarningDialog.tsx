import { LogOut, Clock } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface IdleWarningDialogProps {
  open: boolean
  remainingSeconds: number
  onStayActive: () => void
  onLogout: () => void
}

export function IdleWarningDialog({ open, remainingSeconds, onStayActive, onLogout }: IdleWarningDialogProps) {
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false} onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); onStayActive() } }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="size-5 text-amber-500" />
            Sesión por expirar
          </DialogTitle>
          <DialogDescription>
            Tu sesión se cerrará automáticamente por inactividad en{' '}
            <strong>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </strong>
            . Haz clic en "Continuar" para mantener tu sesión activa.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="mr-2 size-4" />
            Cerrar sesión
          </Button>
          <Button onClick={onStayActive}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
