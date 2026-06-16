import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, ShoppingCart, FileText, Truck, Package,
  PackageOpen, Tags, Warehouse, BarChart3, Shield, ClipboardList, LogOut, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface NavItem {
  icon: typeof LayoutDashboard
  label: string
  to: string
  roles: string[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/', roles: ['ADMIN', 'VENDEDOR', 'INVENTARIO'] },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { icon: Users, label: 'Clientes', to: '/clientes', roles: ['ADMIN', 'VENDEDOR'] },
      { icon: ShoppingCart, label: 'Ventas', to: '/ventas', roles: ['ADMIN', 'VENDEDOR'] },
      { icon: FileText, label: 'Facturas', to: '/facturas', roles: ['ADMIN', 'VENDEDOR'] },
    ],
  },
  {
    label: 'Compras',
    items: [
      { icon: Truck, label: 'Proveedores', to: '/proveedores', roles: ['ADMIN'] },
      { icon: Package, label: 'Compras', to: '/compras', roles: ['ADMIN', 'INVENTARIO'] },
    ],
  },
  {
    label: 'Productos',
    items: [
      { icon: PackageOpen, label: 'Productos', to: '/productos', roles: ['ADMIN', 'INVENTARIO', 'VENDEDOR'] },
      { icon: Tags, label: 'Categorias', to: '/categorias', roles: ['ADMIN', 'INVENTARIO'] },
      { icon: Warehouse, label: 'Inventario', to: '/inventario', roles: ['ADMIN', 'INVENTARIO'] },
    ],
  },
  {
    label: 'Reportes',
    items: [
      { icon: BarChart3, label: 'Reportes', to: '/reportes', roles: ['ADMIN', 'INVENTARIO'] },
    ],
  },
  {
    label: 'Administracion',
    items: [
      { icon: Shield, label: 'Usuarios', to: '/usuarios', roles: ['ADMIN'] },
      { icon: ClipboardList, label: 'Auditoria', to: '/auditoria', roles: ['ADMIN'] },
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
          <p className="text-[10px] leading-tight text-sidebar-foreground/35">Sistema de Gestion</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto rounded-md p-1.5 text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
          aria-label="Cerrar menu"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto sidebar-scroll py-4">
        {navGroups.map((group, gi) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(userRole))
          if (visibleItems.length === 0) return null

          return (
            <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
              <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map(({ icon: Icon, label, to }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'relative flex items-center gap-3 px-3 py-1.5 text-[13px] transition-all duration-150',
                        isActive
                          ? 'font-medium text-sidebar-accent-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-[1.5px] before:rounded-r-full before:bg-primary'
                          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            'size-4 shrink-0 transition-colors duration-150',
                            isActive ? 'text-sidebar-foreground' : 'text-sidebar-foreground/40'
                          )}
                        />
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

      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-xs font-medium text-sidebar-foreground/70">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-medium leading-tight text-sidebar-foreground">
              {user?.name ?? 'Usuario'}
            </span>
            <span className="truncate text-[11px] leading-tight text-sidebar-foreground/40">
              {user?.email ?? ''}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={logout}
            aria-label="Cerrar sesion"
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
