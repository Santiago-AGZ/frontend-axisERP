import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, ShoppingCart, AlertTriangle, Users, Package, PackageSearch,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ErrorState } from '@/components/shared/error-state'
import { SeoHead } from '@/components/shared/seo-head'
import { queryKeys } from '@/lib/query-keys'
import { formatCurrency, formatDate } from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import { reportService, type DashboardData } from '@/services/report'
import { NavLink } from 'react-router-dom'
import { statusBadge } from '@/lib/labels'
import { cn } from '@/lib/utils'

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `Hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `Hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `Hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`
  return formatDate(dateStr)
}

function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}>
          <div className="rounded-xl border bg-card p-5">
            <Skeleton className="skeleton-shimmer mb-3 size-8 rounded-lg" />
            <Skeleton className="skeleton-shimmer mb-1 h-7 w-28 rounded-md" />
            <Skeleton className="skeleton-shimmer h-3 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

function QuickLink({ to, icon: Icon, title, description, iconColor }: {
  to: string
  icon: typeof ShoppingCart
  title: string
  description: string
  iconColor: string
}) {
  return (
    <NavLink
      to={to}
      className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:-translate-y-0.5"
    >
      <div className={cn('mb-3 inline-flex rounded-lg p-2.5', iconColor.replace('text-', 'bg-').replace('500', '100').replace('primary', 'primary/10 dark:bg-primary/20'))}>
        <Icon className={cn('size-5', iconColor)} />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <ArrowRight className="absolute right-4 top-4 size-3.5 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-foreground/50" />
    </NavLink>
  )
}

function VendorDashboard() {
  const links = [
    { to: '/ventas', icon: ShoppingCart, title: 'Nueva Venta', description: 'Registra una venta en el sistema', iconColor: 'text-primary' },
    { to: '/clientes', icon: Users, title: 'Clientes', description: 'Administra tus clientes', iconColor: 'text-blue-500' },
    { to: '/productos', icon: Package, title: 'Productos', description: 'Consulta el catálogo', iconColor: 'text-emerald-500' },
  ]
  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Dashboard" description="Panel de ventas - AxisERP" />
      <div className="animate-fade-in" style={{ animationDelay: '0ms' } as React.CSSProperties}>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Panel de ventas</p>
      </div>
      <div className="grid animate-stagger gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link, i) => (
          <div key={link.to} className="animate-fade-in" style={{ animationDelay: `${80 + i * 60}ms` } as React.CSSProperties}>
            <QuickLink {...link} />
          </div>
        ))}
      </div>
    </div>
  )
}

function InventarioDashboard() {
  const links = [
    { to: '/inventario', icon: PackageSearch, title: 'Inventario', description: 'Control de existencias', iconColor: 'text-primary' },
    { to: '/compras', icon: ShoppingCart, title: 'Compras', description: 'Órdenes de compra', iconColor: 'text-amber-500' },
    { to: '/productos', icon: Package, title: 'Productos', description: 'Catálogo de productos', iconColor: 'text-emerald-500' },
  ]
  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Dashboard" description="Panel de inventario - AxisERP" />
      <div className="animate-fade-in" style={{ animationDelay: '0ms' } as React.CSSProperties}>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Panel de inventario</p>
      </div>
      <div className="grid animate-stagger gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link, i) => (
          <div key={link.to} className="animate-fade-in" style={{ animationDelay: `${80 + i * 60}ms` } as React.CSSProperties}>
            <QuickLink {...link} />
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentSalesTable({ sales }: { sales: DashboardData['recentSales'] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="px-5 pt-4 pb-1">
        <h3 className="text-sm font-semibold">Ventas Recientes</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="h-9 pl-5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Folio</TableHead>
              <TableHead className="h-9 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Fecha</TableHead>
              <TableHead className="h-9 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total</TableHead>
              <TableHead className="h-9 pr-5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.slice(0, 8).map((sale, i) => (
              <TableRow
                key={sale.id}
                className="animate-fade-in border-b border-border"
                style={{ animationDelay: `${i * 40}ms` } as React.CSSProperties}
              >
                <TableCell className="pl-5 font-medium">{sale.saleNumber}</TableCell>
                <TableCell className="text-muted-foreground">{timeAgo(sale.createdAt)}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(sale.total)}</TableCell>
                <TableCell className="text-right pr-5">
                  <Badge variant={statusBadge[sale.status] ?? 'outline'} className="text-[10px] px-2 py-0.5">
                    {sale.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'ADMIN'

  const dashboard = useQuery({
    queryKey: queryKeys.reports.dashboard,
    queryFn: () => reportService.getDashboard(),
    enabled: isAdmin,
    staleTime: 180000,
    retry: false,
  })

  if (!isAdmin) {
    return (
      <div role="region" aria-label="Panel de usuario">
        {user?.role === 'VENDEDOR' ? <VendorDashboard /> : <InventarioDashboard />}
      </div>
    )
  }

  if (dashboard.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-fade-in" style={{ animationDelay: '0ms' } as React.CSSProperties}>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Panel ejecutivo de AxisERP</p>
        </div>
        <KpiSkeleton />
      </div>
    )
  }

  if (dashboard.isError) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Panel ejecutivo de AxisERP</p>
        <ErrorState message="Error al cargar datos del dashboard." onRetry={() => dashboard.refetch()} />
      </div>
    )
  }

  if (!dashboard.data) return null

  const dashData = dashboard.data!

  return (
    <div className="flex flex-col gap-6" role="region" aria-label="Panel de control ejecutivo">
      <SeoHead title="Dashboard" description="Panel ejecutivo con métricas en tiempo real de ventas, inventario y clientes." />
      <div className="animate-fade-in" style={{ animationDelay: '0ms' } as React.CSSProperties}>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Panel ejecutivo de AxisERP</p>
      </div>

      <div className="grid animate-stagger gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in" style={{ animationDelay: '60ms' } as React.CSSProperties}>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <DollarSign className="size-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">{formatCurrency(dashData.todayRevenue)}</div>
            <div className="mt-1 text-[13px] text-muted-foreground">Ingresos Hoy</div>
          </div>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '120ms' } as React.CSSProperties}>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10">
              <ShoppingCart className="size-4 text-amber-400" />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">{dashData.pendingSalesCount}</div>
            <div className="mt-1 text-[13px] text-muted-foreground">Ventas Pendientes</div>
          </div>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '180ms' } as React.CSSProperties}>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="size-4 text-red-400" />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">{dashData.lowStockCount}</div>
            <div className="mt-1 text-[13px] text-muted-foreground">Stock Bajo</div>
          </div>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '240ms' } as React.CSSProperties}>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-4 text-primary" />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">{dashData.totalCustomers}</div>
            <div className="mt-1 text-[13px] text-muted-foreground">Total Clientes</div>
          </div>
        </div>
      </div>

      {dashData.recentSales.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '300ms' } as React.CSSProperties}>
          <RecentSalesTable sales={dashData.recentSales} />
        </div>
      )}
    </div>
  )
}
