import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, ShoppingCart, AlertTriangle, Users, TrendingUp,
  Receipt, Percent, Package, Medal,   PackageSearch,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionHeader } from '@/components/shared/section-header'
import { MetricCard } from '@/components/shared/metric-card'
import { ErrorState } from '@/components/shared/error-state'
import { SeoHead } from '@/components/shared/seo-head'
import { queryKeys } from '@/lib/query-keys'
import { formatCurrency } from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import { reportService, type SalesReport, type InventoryReport, type TopProductsReport } from '@/services/report'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { NavLink } from 'react-router-dom'

const CHART_PALETTE = [
  'oklch(0.596 0.145 163.225)',
  'oklch(0.546 0.245 262.881)',
  'oklch(0.769 0.188 70.08)',
  'oklch(0.627 0.265 303.9)',
  'oklch(0.577 0.245 27.325)',
  'oklch(0.715 0.143 215.221)',
  'oklch(0.656 0.241 354.308)',
  'oklch(0.768 0.188 131.084)',
  'oklch(0.705 0.213 47.604)',
  'oklch(0.704 0.14 182.503)',
]

const getColor = (index: number) => CHART_PALETTE[index % CHART_PALETTE.length]

const STATUS_COLORS: Record<string, string> = {
  BORRADOR: 'oklch(0.577 0.245 27.325)',
  PENDIENTE: 'oklch(0.769 0.188 70.08)',
  CONFIRMADA: 'oklch(0.546 0.245 262.881)',
  PAGADA: 'oklch(0.596 0.145 163.225)',
  ANULADA: 'oklch(0.704 0.191 22.216)',
}

function today() { return new Date().toISOString().split('T')[0] }
function thirtyDaysAgo() { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0] }

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

function StockProgress({ current, min, depleted }: { current: number; min: number; depleted: boolean }) {
  if (depleted) return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm"><span className="font-medium text-destructive">Agotado</span><span className="text-xs text-muted-foreground">Stock: {current} / Mín: {min}</span></div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-destructive/20"><div className="h-full w-0 rounded-full bg-destructive transition-all" /></div>
    </div>
  )
  const pct = min > 0 ? Math.round((current / min) * 100) : 100
  const color = pct <= 25 ? 'bg-destructive' : pct <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{current} / {min}</span>
        <span className={`text-xs font-medium ${pct <= 25 ? 'text-destructive' : pct <= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )
}

function SalesFunnel({ data }: { data: SalesReport }) {
  const funnelOrder = ['BORRADOR', 'PENDIENTE', 'CONFIRMADA', 'PAGADA', 'ANULADA']
  const chartData = funnelOrder.filter(s => data.salesByStatus[s] !== undefined).map(s => ({ name: s, value: data.salesByStatus[s] }))
  if (chartData.length === 0) return null
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">Embudo Comercial</CardTitle></CardHeader>
      <CardContent>
        <div role="img" aria-label="Gráfico de barras del embudo comercial">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (<Cell key={i} fill={STATUS_COLORS[entry.name] || getColor(i)} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function InventoryDonut({ data }: { data: InventoryReport }) {
  if (data.totalProducts === 0) return null
  const chartData = [
    { name: 'Stock Normal', value: data.totalProducts - data.lowStockCount - data.depletedCount },
    { name: 'Stock Bajo', value: data.lowStockCount },
    { name: 'Agotados', value: data.depletedCount },
  ].filter(d => d.value > 0)
  if (chartData.length === 0) return null
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">Distribución de Inventario</CardTitle></CardHeader>
      <CardContent>
        <div role="img" aria-label="Gráfico de pastel de distribución de inventario">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {chartData.map((_, i) => (<Cell key={i} fill={getColor(i)} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function RevenueTrend({ data }: { data: SalesReport }) {
  const dailyRevenue = data.recentSales.reduce<Record<string, number>>((acc, sale) => {
    const day = sale.createdAt.split(' ')[0].replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1')
    acc[day] = (acc[day] || 0) + sale.total
    return acc
  }, {})
  const chartData = Object.entries(dailyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }))
  if (chartData.length < 2) return null
  return (
    <Card className="lg:col-span-2">
      <CardHeader><CardTitle className="text-sm font-medium">Tendencia de Ingresos</CardTitle></CardHeader>
      <CardContent>
        <div role="img" aria-label="Gráfico de línea de tendencia de ingresos">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => v.split('-').slice(1).join('/')} />
              <YAxis className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(val) => formatCurrency(Number(val))} labelFormatter={(l) => `Fecha: ${l}`} />
              <Line type="monotone" dataKey="revenue" stroke="oklch(0.596 0.145 163.225)" strokeWidth={2} dot={{ fill: 'oklch(0.596 0.145 163.225)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function LowStockSection({ data }: { data: InventoryReport }) {
  const lowStockItems = data.items.filter(i => i.lowStock || i.depleted).sort((a, b) => (a.currentStock / Math.max(a.minStock, 1)) - (b.currentStock / Math.max(b.minStock, 1)))
  if (lowStockItems.length === 0) return null
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">Productos Próximos a Agotarse</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowStockItems.slice(0, 8).map((item) => (
            <div key={item.productId} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.productName}</span>
                <Badge variant={item.depleted ? 'destructive' : 'secondary'}>{item.depleted ? 'AGOTADO' : 'BAJO'}</Badge>
              </div>
              <StockProgress current={item.currentStock} min={item.minStock} depleted={item.depleted} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TopProductsRanking({ data }: { data: TopProductsReport }) {
  const totalRevenue = data.rankings.reduce((s, r) => s + r.totalRevenue, 0)
  if (data.rankings.length === 0) return null
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">Ranking de Productos</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.rankings.map((product) => {
            const pct = totalRevenue > 0 ? ((product.totalRevenue / totalRevenue) * 100).toFixed(1) : '0'
            return (
              <div key={product.productId} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full text-xs font-medium" style={{ backgroundColor: getColor(product.position - 1) + '20', color: getColor(product.position - 1) }}>
                    {product.position}
                  </span>
                  <div><p className="text-sm font-medium">{product.productName}</p><p className="text-xs text-muted-foreground">{product.totalQuantity} vendidos</p></div>
                </div>
                <div className="text-right text-sm"><p className="font-medium">{formatCurrency(product.totalRevenue)}</p><p className="text-xs text-muted-foreground">{pct}% participación</p></div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentSalesTimeline({ data }: { data: SalesReport }) {
  if (data.recentSales.length === 0) return null
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">Ventas Recientes</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.recentSales.slice(0, 8).map((sale) => (
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
  )
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
