import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  DollarSign, ShoppingCart, AlertTriangle, Users, Package, PackageSearch,
  ArrowRight, TrendingUp,
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
import { salesService } from '@/services/sales'
import { inventoryService } from '@/services/inventory'
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

function useTimeAgo(dateStr: string): string {
  const [timeAgoText, setTimeAgoText] = useState(() => timeAgo(dateStr))

  useEffect(() => {
    setTimeAgoText(timeAgo(dateStr))
    const interval = setInterval(() => {
      setTimeAgoText(timeAgo(dateStr))
    }, 60000)
    return () => clearInterval(interval)
  }, [dateStr])

  return timeAgoText
}

function KpiCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ '--kpi-count': count } as React.CSSProperties}>
      {Array.from({ length: count }).map((_, i) => (
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
      className="group relative block overflow-hidden rounded-xl border border-border/50 p-6 transition-all duration-200 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className={cn('mb-4 inline-flex rounded-lg p-3', iconColor.replace('text-', 'bg-').replace('500', '100').replace('primary', 'primary/10 dark:bg-primary/20'))}>
        <Icon className={cn('size-6', iconColor)} />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      <ArrowRight className="absolute right-4 top-4 size-3.5 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-foreground/50" />
    </NavLink>
  )
}

function KpiCard({ icon: Icon, value, label, iconBg, iconColor }: {
  icon: typeof DollarSign
  value: string | number
  label: string
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className={cn('flex size-9 items-center justify-center rounded-lg', iconBg)}>
        <Icon className={cn('size-4', iconColor)} />
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-[13px] text-muted-foreground">{label}</div>
    </div>
  )
}

function TimeAgoCell({ date }: { date: string }) {
  const timeAgoText = useTimeAgo(date)
  return <span className="text-muted-foreground">{timeAgoText}</span>
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
                <TableCell><TimeAgoCell date={sale.createdAt} /></TableCell>
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

function QuickLinksGrid() {
  return (
    <div className="grid grid-cols-1 animate-stagger gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="animate-fade-in" style={{ animationDelay: '80ms' } as React.CSSProperties}>
        <QuickLink to="/ventas" icon={ShoppingCart} title="Nueva Venta" description="Registra una venta en el sistema" iconColor="text-primary" />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: '140ms' } as React.CSSProperties}>
        <QuickLink to="/clientes" icon={Users} title="Clientes" description="Administra tus clientes" iconColor="text-blue-500" />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: '200ms' } as React.CSSProperties}>
        <QuickLink to="/productos" icon={Package} title="Productos" description="Consulta el catálogo" iconColor="text-emerald-500" />
      </div>
    </div>
  )
}

function VendorDashboard() {
  const sales = useQuery({
    queryKey: queryKeys.sales.sales.list({ page: 1, size: 8 }),
    queryFn: () => salesService.listSales({ page: 1, size: 8 }),
    staleTime: 60000,
  })

  const salesData = sales.data?.data ?? []
  const pendingCount = salesData.filter(s => s.status === 'PENDIENTE' || s.status === 'BORRADOR').length
  const totalRevenue = salesData.reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Dashboard" description="Panel de ventas - AxisERP" />
      <div className="animate-fade-in" style={{ animationDelay: '0ms' } as React.CSSProperties}>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Panel de ventas</p>
      </div>

      <div className="grid animate-stagger gap-4 sm:grid-cols-3">
        <div className="animate-fade-in" style={{ animationDelay: '60ms' } as React.CSSProperties}>
          <KpiCard icon={TrendingUp} value={salesData.length} label="Ventas Recientes" iconBg="bg-blue-500/10" iconColor="text-blue-400" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '120ms' } as React.CSSProperties}>
          <KpiCard icon={ShoppingCart} value={pendingCount} label="Pendientes" iconBg="bg-amber-500/10" iconColor="text-amber-400" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '180ms' } as React.CSSProperties}>
          <KpiCard icon={DollarSign} value={formatCurrency(totalRevenue)} label="Total en Ventas" iconBg="bg-emerald-500/10" iconColor="text-emerald-400" />
        </div>
      </div>

      <QuickLinksGrid />

      {salesData.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '300ms' } as React.CSSProperties}>
          <RecentSalesTable sales={salesData} />
        </div>
      )}
    </div>
  )
}

function InventarioDashboard() {
  const alerts = useQuery({
    queryKey: queryKeys.inventory.alerts.list({ page: 1, size: 200 }),
    queryFn: () => inventoryService.getAlerts({ page: 1, size: 200 }),
    staleTime: 60000,
  })

  const alertas = alerts.data?.data ?? []
  const lowStockCount = alertas.filter(a => !a.depleted).length
  const depletedCount = alertas.filter(a => a.depleted).length

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Dashboard" description="Panel de inventario - AxisERP" />
      <div className="animate-fade-in" style={{ animationDelay: '0ms' } as React.CSSProperties}>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Panel de inventario</p>
      </div>

      <div className="grid animate-stagger gap-4 sm:grid-cols-2">
        <div className="animate-fade-in" style={{ animationDelay: '60ms' } as React.CSSProperties}>
          <KpiCard icon={AlertTriangle} value={lowStockCount} label="Stock Bajo" iconBg="bg-amber-500/10" iconColor="text-amber-400" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '120ms' } as React.CSSProperties}>
          <KpiCard icon={Package} value={depletedCount} label="Agotados" iconBg="bg-red-500/10" iconColor="text-red-400" />
        </div>
      </div>

    <div className="grid grid-cols-1 animate-stagger gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="animate-fade-in" style={{ animationDelay: '180ms' } as React.CSSProperties}>
          <QuickLink to="/inventario" icon={PackageSearch} title="Inventario" description="Control de existencias" iconColor="text-primary" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '240ms' } as React.CSSProperties}>
          <QuickLink to="/compras" icon={ShoppingCart} title="Compras" description="Órdenes de compra" iconColor="text-amber-500" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '300ms' } as React.CSSProperties}>
          <QuickLink to="/productos" icon={Package} title="Productos" description="Catálogo de productos" iconColor="text-emerald-500" />
        </div>
      </div>

      {alertas.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '360ms' } as React.CSSProperties}>
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="px-5 pt-4 pb-1">
              <h3 className="text-sm font-semibold">Alertas de Inventario</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="h-9 pl-5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Producto</TableHead>
                    <TableHead className="h-9 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Stock</TableHead>
                    <TableHead className="h-9 pr-5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertas.slice(0, 8).map((item, i) => (
                    <TableRow
                      key={item.id}
                      className="animate-fade-in border-b border-border"
                      style={{ animationDelay: `${i * 40}ms` } as React.CSSProperties}
                    >
                      <TableCell className="pl-5 font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right tabular-nums">{item.currentStock}</TableCell>
                      <TableCell className="text-right pr-5">
                        <Badge variant={item.depleted ? 'destructive' : 'secondary'} className="text-[10px] px-2 py-0.5">
                          {item.depleted ? 'AGOTADO' : 'BAJO'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminDashboard() {
  const dashboard = useQuery({
    queryKey: queryKeys.reports.dashboard,
    queryFn: () => reportService.getDashboard(),
    staleTime: 180000,
    retry: false,
  })

  if (dashboard.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-fade-in" style={{ animationDelay: '0ms' } as React.CSSProperties}>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Panel ejecutivo de AxisERP</p>
        </div>
        <KpiCardSkeleton count={4} />
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

  const dashData = dashboard.data

  return (
    <div className="flex flex-col gap-6" role="region" aria-label="Panel de control ejecutivo">
      <SeoHead title="Dashboard" description="Panel ejecutivo con métricas en tiempo real de ventas, inventario y clientes." />
      <div className="animate-fade-in" style={{ animationDelay: '0ms' } as React.CSSProperties}>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Panel ejecutivo de AxisERP</p>
      </div>

      <div className="grid animate-stagger gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in" style={{ animationDelay: '60ms' } as React.CSSProperties}>
          <KpiCard icon={DollarSign} value={formatCurrency(dashData.todayRevenue)} label="Ingresos Hoy" iconBg="bg-emerald-500/10" iconColor="text-emerald-400" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '120ms' } as React.CSSProperties}>
          <KpiCard icon={ShoppingCart} value={dashData.pendingSalesCount} label="Ventas Pendientes" iconBg="bg-amber-500/10" iconColor="text-amber-400" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '180ms' } as React.CSSProperties}>
          <KpiCard icon={AlertTriangle} value={dashData.lowStockCount} label="Stock Bajo" iconBg="bg-red-500/10" iconColor="text-red-400" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '240ms' } as React.CSSProperties}>
          <KpiCard icon={Users} value={dashData.totalCustomers} label="Total Clientes" iconBg="bg-primary/10" iconColor="text-primary" />
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

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'ADMIN'

  if (!isAdmin) {
    return (
      <div role="region" aria-label="Panel de usuario">
        {user?.role === 'VENDEDOR' ? <VendorDashboard /> : <InventarioDashboard />}
      </div>
    )
  }

  return <AdminDashboard />
}
