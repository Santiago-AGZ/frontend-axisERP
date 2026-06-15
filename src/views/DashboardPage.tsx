import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, ShoppingCart, AlertTriangle, Users, Package, PackageSearch,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricCard } from '@/components/shared/metric-card'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { SeoHead } from '@/components/shared/seo-head'
import { queryKeys } from '@/lib/query-keys'
import { formatCurrency } from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import { reportService } from '@/services/report'
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
  return new Date(dateStr).toLocaleDateString()
}

function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-5">
            <Skeleton className="skeleton-shimmer mb-3 h-3 w-20 rounded-md" />
            <Skeleton className="skeleton-shimmer h-7 w-28 rounded-md" />
          </CardContent>
        </Card>
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
      className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-glass hover:-translate-y-0.5"
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
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader title="Dashboard" description="Panel de ventas" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink to="/ventas" icon={ShoppingCart} title="Nueva Venta" description="Registra una venta en el sistema" iconColor="text-primary" />
        <QuickLink to="/clientes" icon={Users} title="Clientes" description="Administra tus clientes" iconColor="text-blue-500" />
        <QuickLink to="/productos" icon={Package} title="Productos" description="Consulta el catálogo" iconColor="text-emerald-500" />
      </div>
    </div>
  )
}

function InventarioDashboard() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader title="Dashboard" description="Panel de inventario" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink to="/inventario" icon={PackageSearch} title="Inventario" description="Control de existencias" iconColor="text-primary" />
        <QuickLink to="/compras" icon={ShoppingCart} title="Compras" description="Órdenes de compra" iconColor="text-amber-500" />
        <QuickLink to="/productos" icon={Package} title="Productos" description="Catálogo de productos" iconColor="text-emerald-500" />
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
        <PageHeader title="Dashboard" description="Panel ejecutivo de AxisERP" />
        <KpiSkeleton />
      </div>
    )
  }

  if (dashboard.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard" description="Panel ejecutivo de AxisERP" />
        <ErrorState message="Error al cargar datos del dashboard." onRetry={() => dashboard.refetch()} />
      </div>
    )
  }

  if (!dashboard.data) return null

  const dashData = dashboard.data!

  return (
    <div className="flex flex-col gap-6 animate-fade-in" role="region" aria-label="Panel de control ejecutivo">
      <SeoHead title="Dashboard" description="Panel ejecutivo con métricas en tiempo real de ventas, inventario y clientes." />
      <PageHeader title="Dashboard" description="Panel ejecutivo de AxisERP" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Ingresos Hoy" value={formatCurrency(dashData.todayRevenue)} icon={DollarSign} variant="success" />
        <MetricCard title="Ventas Pendientes" value={dashData.pendingSalesCount} icon={ShoppingCart} variant="warning" />
        <MetricCard title="Stock Bajo" value={dashData.lowStockCount} icon={AlertTriangle} variant="danger" />
        <MetricCard title="Total Clientes" value={dashData.totalCustomers} icon={Users} variant="info" />
      </div>

      {dashData.recentSales.length > 0 && (
        <div className="animate-slide-up">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ventas Recientes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {dashData.recentSales.slice(0, 8).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between rounded-lg border px-3.5 py-3 transition-colors hover:bg-muted/40">
                    <div className="space-y-0.5">
                      <p className="text-[13px] font-medium">{sale.saleNumber}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>{timeAgo(sale.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-semibold tabular-nums">{formatCurrency(sale.total)}</span>
                      <Badge variant={statusBadge[sale.status] ?? 'outline'} className="text-[10px] px-2 py-0.5">
                        {sale.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
