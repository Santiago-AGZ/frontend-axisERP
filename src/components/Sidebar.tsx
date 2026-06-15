import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Package, ShoppingCart, Warehouse, Truck, FileText,
  UserCog, Tags, BarChart3, ClipboardList, ScrollText, X, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navGroups = [
  {
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/', roles: ['ADMIN', 'VENDEDOR', 'INVENTARIO'] },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { icon: Users, label: 'Clientes', to: '/clientes', roles: ['ADMIN', 'VENDEDOR'] },
      { icon: Truck, label: 'Proveedores', to: '/proveedores', roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { icon: ShoppingCart, label: 'Ventas', to: '/ventas', roles: ['ADMIN', 'VENDEDOR'] },
      { icon: ScrollText, label: 'Compras', to: '/compras', roles: ['ADMIN', 'INVENTARIO'] },
      { icon: FileText, label: 'Facturas', to: '/facturas', roles: ['ADMIN', 'VENDEDOR'] },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { icon: Package, label: 'Productos', to: '/productos', roles: ['ADMIN', 'INVENTARIO', 'VENDEDOR'] },
      { icon: Tags, label: 'Categorías', to: '/categorias', roles: ['ADMIN', 'INVENTARIO'] },
      { icon: Warehouse, label: 'Inventario', to: '/inventario', roles: ['ADMIN', 'INVENTARIO'] },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { icon: BarChart3, label: 'Reportes', to: '/reportes', roles: ['ADMIN', 'INVENTARIO'] },
      { icon: UserCog, label: 'Usuarios', to: '/usuarios', roles: ['ADMIN'] },
      { icon: ClipboardList, label: 'Auditoría', to: '/auditoria', roles: ['ADMIN'] },
    ],
  },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const userRole = user?.role ?? ''

  const sidebarContent = (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <span className="text-xs font-bold">A</span>
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold leading-tight tracking-tight">AxisERP</h1>
          <p className="text-[10px] leading-tight text-sidebar-foreground/35">Sistema de Gestión</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto rounded-md p-1.5 text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto sidebar-scroll py-2">
        {navGroups.map((group, gi) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(userRole))
          if (visibleItems.length === 0) return null

          return (
            <div key={gi} className={cn(gi > 0 ? 'mt-2' : '')}>
              {group.label && (
                <p className="px-4 pb-0.5 pt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-sidebar-foreground/30">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5 px-2">
                {visibleItems.map(({ icon: Icon, label, to }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/80'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                        )}
                        <Icon className={cn('size-4 shrink-0', isActive && 'text-sidebar-primary')} />
                        <span className="truncate">{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-[10px] font-medium text-sidebar-foreground/70">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[12px] font-medium leading-tight text-sidebar-foreground/80">
              {user?.name ?? 'Usuario'}
            </span>
            <span className="truncate text-[10px] leading-tight text-sidebar-foreground/35">
              {user?.email ?? ''}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={logout}
            aria-label="Cerrar sesión"
            className="text-sidebar-foreground/30 hover:bg-sidebar-accent hover:text-sidebar-foreground/70"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden lg:block">{sidebarContent}</div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <div className="fixed inset-y-0 left-0 z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
