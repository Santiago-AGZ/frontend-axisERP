import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Package, ShoppingCart, Warehouse, Truck, FileText,
  UserCog, Tags, BarChart3, ClipboardList, ScrollText, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

const allNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/', roles: ['ADMIN', 'VENDEDOR', 'INVENTARIO'] },
  { icon: Users, label: 'Clientes', to: '/clientes', roles: ['ADMIN', 'VENDEDOR'] },
  { icon: UserCog, label: 'Usuarios', to: '/usuarios', roles: ['ADMIN'] },
  { icon: Tags, label: 'Categorias', to: '/categorias', roles: ['ADMIN', 'INVENTARIO'] },
  { icon: Package, label: 'Productos', to: '/productos', roles: ['ADMIN', 'INVENTARIO', 'VENDEDOR'] },
  { icon: ShoppingCart, label: 'Ventas', to: '/ventas', roles: ['ADMIN', 'VENDEDOR'] },
  { icon: FileText, label: 'Facturas', to: '/facturas', roles: ['ADMIN', 'VENDEDOR'] },
  { icon: Warehouse, label: 'Inventario', to: '/inventario', roles: ['ADMIN', 'INVENTARIO'] },
  { icon: Truck, label: 'Proveedores', to: '/proveedores', roles: ['ADMIN'] },
  { icon: ScrollText, label: 'Compras', to: '/compras', roles: ['ADMIN', 'INVENTARIO'] },
  { icon: BarChart3, label: 'Reportes', to: '/reportes', roles: ['ADMIN'] },
  { icon: ClipboardList, label: 'Auditoria', to: '/auditoria', roles: ['ADMIN'] },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const user = useAuthStore((state) => state.user)
  const userRole = user?.role ?? ''
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole))

  const sidebarContent = (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
            A
          </div>
          <h1 className="text-lg font-semibold tracking-tight">AxisERP</h1>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
          aria-label="Cerrar menu"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/50">AxisERP v1.0</p>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* Mobile: overlay */}
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
