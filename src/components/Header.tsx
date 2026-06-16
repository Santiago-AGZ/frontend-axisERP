import { LogOut, Menu } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'
import { roleTextColors } from '@/lib/labels'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Abrir menú"
      >
        <Menu className="size-4" />
      </Button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <Avatar className="size-7">
          <AvatarFallback className="bg-primary/10 text-[11px] font-medium text-primary">
            {user?.name ? getInitials(user.name) : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col">
          <span className="text-[13px] font-medium leading-tight">{user?.name}</span>
          {user?.role && (
            <span className={cn('text-[10px] font-medium uppercase leading-none', roleTextColors[user.role] ?? '')}>
              {user.role}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={logout} aria-label="Cerrar sesión" className="text-muted-foreground hover:text-foreground">
          <LogOut className="size-3.5" />
        </Button>
      </div>
    </header>
  )
}
