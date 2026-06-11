import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Package, TrendingUp, FileDown, FileSpreadsheet, FileText, Users } from 'lucide-react'
import { toast } from 'sonner'
import { reportService } from '@/services/report'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { ErrorState } from '@/components/shared/error-state'
import { SeoHead } from '@/components/shared/seo-head'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/lib/format'
import { statusLabel } from '@/lib/labels'

const PIE_COLORS = [
  'oklch(0.596 0.145 163.225)',
  'oklch(0.546 0.245 262.881)',
  'oklch(0.769 0.188 70.08)',
  'oklch(0.627 0.265 303.9)',
  'oklch(0.577 0.245 27.325)',
]

function today() {
  return new Date().toISOString().split('T')[0]
}

function thirtyDaysAgo() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

const saleStatusBadge: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  CONFIRMADA: 'outline', PAGADA: 'default', ANULADA: 'destructive',
}

function FrequentCustomersTab() {
  const [startDate, setStartDate] = useState(thirtyDaysAgo())
  const [endDate, setEndDate] = useState(today())

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.reports.frequentCustomers({ startDate, endDate, limit: 10 }),
    queryFn: () => reportService.getFrequentCustomers({ startDate, endDate, limit: 10 }),
  })

  if (isLoading) {
    return <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
  }

  if (isError) {
    return <Card><CardContent className="py-12"><ErrorState message="Error al cargar clientes frecuentes" onRetry={() => refetch()} /></CardContent></Card>
  }

  if (!data || data.customers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No hay datos de clientes frecuentes para el período seleccionado
        </CardContent>
      </Card>
    )
  }

  const chartData = data.customers.map((c) => ({
    name: c.customerName.length > 15 ? c.customerName.slice(0, 15) + '...' : c.customerName,
    gasto: c.totalSpent,
    visitas: c.totalVisits,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Desde</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-44" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Hasta</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-44" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Top Clientes por Gasto</CardTitle></CardHeader>
          <CardContent>
            <div role="img" aria-label="Gráfico de barras de clientes frecuentes por gasto total">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={140} className="text-xs" />
                  <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                  <Bar dataKey="gasto" radius={[0, 6, 6, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Ranking de Clientes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.customers.map((c) => (
                <div key={c.customerId} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="flex size-6 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {c.position}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{c.customerName}</p>
                      <p className="text-xs text-muted-foreground">{c.totalVisits} visitas</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{formatCurrency(c.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Ticket prom: {formatCurrency(c.averageTicket)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SalesReportTab() {
  const [startDate, setStartDate] = useState(thirtyDaysAgo())
  const [endDate, setEndDate] = useState(today())

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.reports.sales({ startDate, endDate }),
    queryFn: () => reportService.getSalesReport({ startDate, endDate }),
  })

  const statusChartData = data
    ? Object.entries(data.salesByStatus).map(([name, value]) => ({ name, value }))
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Desde</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-44" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Hasta</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-44" />
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => reportService.downloadSalesPdf({ startDate, endDate }).catch(() => toast.error('Error al descargar PDF'))}>
            <FileDown className="mr-2 size-4" />PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => reportService.downloadSalesCsv({ startDate, endDate }).catch(() => toast.error('Error al descargar CSV'))}>
            <FileText className="mr-2 size-4" />CSV
          </Button>
        </div>
      </div>

      {isError ? (
        <Card><CardContent className="py-12"><ErrorState message="Error al cargar el reporte de ventas" onRetry={() => refetch()} /></CardContent></Card>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (<Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Ventas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.totalTransactions}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">IVA Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(data.totalTax)}</div></CardContent></Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Ventas por Estado</CardTitle></CardHeader>
              <CardContent>
                <div role="img" aria-label="Gráfico de barras de ventas por estado">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="oklch(0.596 0.145 163.225)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Distribución</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <div role="img" aria-label="Gráfico de donut de distribución de ventas">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {statusChartData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {data.recentSales.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Ventas Recientes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.recentSales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">{sale.saleNumber}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatCurrency(sale.total)}</span>
                        <Badge variant={saleStatusBadge[sale.status] ?? 'outline'}>{sale.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Selecciona un rango de fechas</CardContent></Card>
      )}
    </div>
  )
}

function InventoryReportTab() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.reports.inventory({}),
    queryFn: () => reportService.getInventoryReport(),
  })

  if (isError) {
    return <Card><CardContent className="py-12"><ErrorState message="Error al cargar el reporte de inventario" onRetry={() => refetch()} /></CardContent></Card>
  }

  if (isLoading) {
    return <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => (<Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>))}</div>
  }

  if (!data) return <Card><CardContent className="py-12 text-center text-muted-foreground">No hay datos de inventario</CardContent></Card>

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => reportService.downloadInventoryExcel().catch(() => toast.error('Error al descargar'))}>
          <FileSpreadsheet className="mr-2 size-4" />Exportar Excel
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Productos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.totalProducts}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Stock Bajo</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{data.lowStockCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Agotados</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{data.depletedCount}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Productos con Stock Bajo</CardTitle></CardHeader>
        <CardContent>
          {data.items.filter(i => i.lowStock || i.depleted).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No hay productos con stock bajo</p>
          ) : (
            <div className="space-y-2">
              {data.items.filter(i => i.lowStock || i.depleted).map((item) => (
                <div key={item.productId} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">{item.productName}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Stock: <span className={item.depleted ? 'text-destructive font-medium' : 'text-amber-600 font-medium'}>{item.currentStock}</span> / Mín: {item.minStock}</span>
                    <Badge variant={item.depleted ? 'destructive' : 'secondary'}>{item.depleted ? 'AGOTADO' : 'BAJO'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TopProductsTab() {
  const [startDate, setStartDate] = useState(thirtyDaysAgo())
  const [endDate, setEndDate] = useState(today())

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.reports.topProducts({ startDate, endDate, limit: 10 }),
    queryFn: () => reportService.getTopProducts({ startDate, endDate, limit: 10 }),
  })

  const chartData = data ? data.rankings.map((r) => ({ name: r.productName.length > 20 ? r.productName.slice(0, 20) + '...' : r.productName, revenue: r.totalRevenue, quantity: r.totalQuantity })) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2"><label className="text-sm text-muted-foreground">Desde</label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-44" /></div>
        <div className="flex items-center gap-2"><label className="text-sm text-muted-foreground">Hasta</label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-44" /></div>
      </div>

      {isError ? (
        <Card><CardContent className="py-12"><ErrorState message="Error al cargar top productos" onRetry={() => refetch()} /></CardContent></Card>
      ) : isLoading ? (
        <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      ) : data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Top Productos por Ingresos</CardTitle></CardHeader>
            <CardContent>
              <div role="img" aria-label="Gráfico de barras horizontal de productos más vendidos por ingresos">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" width={160} className="text-xs" />
                    <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="oklch(0.596 0.145 163.225)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Ranking de Productos</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.rankings.map((product) => (
                  <div key={product.productId} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">{product.position}</span>
                      <span className="text-sm">{product.productName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{product.totalQuantity} vendidos</span>
                      <span className="font-medium">{formatCurrency(product.totalRevenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Selecciona un rango de fechas</CardContent></Card>
      )}
    </div>
  )
}

export function ReportesPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Reportes" description="Reportes y estadísticas del sistema AxisERP." />
      <PageHeader title="Reportes" description="Analisis y estadisticas del negocio" />

      <Tabs defaultValue={isAdmin ? 'sales' : 'inventory'} className="space-y-6">
        <TabsList>
          {isAdmin && <TabsTrigger value="sales" className="gap-2"><BarChart3 className="size-4" />Ventas</TabsTrigger>}
          <TabsTrigger value="inventory" className="gap-2"><Package className="size-4" />Inventario</TabsTrigger>
          {isAdmin && <TabsTrigger value="products" className="gap-2"><TrendingUp className="size-4" />Top Productos</TabsTrigger>}
          {isAdmin && <TabsTrigger value="customers" className="gap-2"><Users className="size-4" />Clientes</TabsTrigger>}
        </TabsList>

        {isAdmin && <TabsContent value="sales"><SalesReportTab /></TabsContent>}
        <TabsContent value="inventory"><InventoryReportTab /></TabsContent>
        {isAdmin && <TabsContent value="products"><TopProductsTab /></TabsContent>}
        {isAdmin && <TabsContent value="customers"><FrequentCustomersTab /></TabsContent>}
      </Tabs>
    </div>
  )
}
