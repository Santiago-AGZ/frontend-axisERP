import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, ShoppingCart, AlertTriangle, Users, Package, PackageSearch,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricCard } from '@/components/shared/metric-card'
import { ErrorState } from '@/components/shared/error-state'
import { SeoHead } from '@/components/shared/seo-head'
import { queryKeys } from '@/lib/query-keys'
import { formatCurrency } from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import { reportService } from '@/services/report'
import { NavLink } from 'react-router-dom'

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

const statusBadge: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  CONFIRMADA: 'outline', PAGADA: 'default', ANULADA: 'destructive',
}

function KpiSkeleton() {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}><CardContent className="pt-6"><Skeleton className="mb-2 h-4 w-24" /><Skeleton className="h-8 w-20" /></CardContent></Card>
    ))}
  </div>
}

function VendorDashboard() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NavLink to="/ventas" className="block rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <ShoppingCart className="mb-3 size-8 text-primary" />
        <h3 className="font-semibold">Nueva Venta</h3>
        <p className="mt-1 text-sm text-muted-foreground">Registra una venta en el sistema</p>
      </NavLink>
      <NavLink to="/clientes" className="block rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <Users className="mb-3 size-8 text-blue-500" />
        <h3 className="font-semibold">Clientes</h3>
        <p className="mt-1 text-sm text-muted-foreground">Administra tus clientes</p>
      </NavLink>
      <NavLink to="/productos" className="block rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <Package className="mb-3 size-8 text-emerald-500" />
        <h3 className="font-semibold">Productos</h3>
        <p className="mt-1 text-sm text-muted-foreground">Consulta el catálogo</p>
      </NavLink>
    </div>
  )
}

function InventarioDashboard() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NavLink to="/inventario" className="block rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <PackageSearch className="mb-3 size-8 text-primary" />
        <h3 className="font-semibold">Inventario</h3>
        <p className="mt-1 text-sm text-muted-foreground">Control de existencias</p>
      </NavLink>
      <NavLink to="/compras" className="block rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <ShoppingCart className="mb-3 size-8 text-amber-500" />
        <h3 className="font-semibold">Compras</h3>
        <p className="mt-1 text-sm text-muted-foreground">Órdenes de compra</p>
      </NavLink>
      <NavLink to="/productos" className="block rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <Package className="mb-3 size-8 text-emerald-500" />
        <h3 className="font-semibold">Productos</h3>
        <p className="mt-1 text-sm text-muted-foreground">Catálogo de productos</p>
      </NavLink>
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
    staleTime: 120000,
    retry: false,
  })

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-6" role="region" aria-label="Panel de usuario">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === 'VENDEDOR' ? 'Panel de ventas' : 'Panel de inventario'}
          </p>
        </div>
        {user?.role === 'VENDEDOR' ? <VendorDashboard /> : <InventarioDashboard />}
      </div>
    )
  }

  if (dashboard.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div><h1 className="text-3xl font-bold tracking-tight">Dashboard</h1><p className="text-sm text-muted-foreground">Panel ejecutivo de AxisERP</p></div>
        <KpiSkeleton />
      </div>
    )
  }

  if (dashboard.isError) {
    return (
      <div className="flex flex-col gap-6">
        <div><h1 className="text-3xl font-bold tracking-tight">Dashboard</h1><p className="text-sm text-muted-foreground">Panel ejecutivo de AxisERP</p></div>
        <ErrorState message="Error al cargar datos del dashboard." onRetry={() => dashboard.refetch()} />
      </div>
    )
  }

  if (!dashboard.data) return null

  const dashData = dashboard.data!

  return (
    <div className="flex flex-col gap-6" role="region" aria-label="Panel de control ejecutivo">
      <SeoHead title="Dashboard" description="Panel ejecutivo con metricas en tiempo real de ventas, inventario y clientes." />
      <div><h1 className="text-3xl font-bold tracking-tight">Dashboard</h1><p className="text-sm text-muted-foreground">Panel ejecutivo de AxisERP</p></div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Ingresos Hoy" value={formatCurrency(dashData.todayRevenue)} icon={DollarSign} variant="success" />
        <MetricCard title="Ventas Pendientes" value={dashData.pendingSalesCount} icon={ShoppingCart} variant="warning" />
        <MetricCard title="Stock Bajo" value={dashData.lowStockCount} icon={AlertTriangle} variant="danger" />
        <MetricCard title="Total Clientes" value={dashData.totalCustomers} icon={Users} variant="info" />
      </div>

      {dashData.recentSales.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Ventas Recientes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashData.recentSales.slice(0, 8).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{sale.saleNumber}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(sale.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatCurrency(sale.total)}</span>
                    <Badge variant={statusBadge[sale.status] ?? 'outline'}>{sale.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
