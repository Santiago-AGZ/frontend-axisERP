import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, LayoutDashboard } from 'lucide-react'

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  clientes: 'Clientes',
  productos: 'Productos',
  categorias: 'Categorías',
  usuarios: 'Usuarios',
  ventas: 'Ventas',
  facturas: 'Facturas',
  inventario: 'Inventario',
  proveedores: 'Proveedores',
  compras: 'Compras',
  reportes: 'Reportes',
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="flex items-center gap-1 transition-colors hover:text-foreground" aria-label="Dashboard">
            <LayoutDashboard className="size-3.5" />
          </Link>
        </li>
        {segments.map((segment, index) => {
          const path = '/' + segments.slice(0, index + 1).join('/')
          const label = routeLabels[segment] || segment
          const isLast = index === segments.length - 1

          return (
            <li key={path} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5 shrink-0" />
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to={path} className="transition-colors hover:text-foreground">
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
