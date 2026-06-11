import { LogOut, Menu } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  VENDEDOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  INVENTARIO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuthStore()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </Button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight">{user?.name}</span>
            {user?.role && (
              <Badge variant="outline" className={`mt-0.5 h-5 px-1.5 text-[10px] font-medium uppercase leading-none ${roleColors[user.role] ?? ''}`}>
                {user.role}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  )
}
