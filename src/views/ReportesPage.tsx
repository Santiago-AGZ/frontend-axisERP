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
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { ErrorState } from '@/components/shared/error-state'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/lib/format'
import { statusBadge, statusLabel } from '@/lib/labels'

const CHART_COLORS = [
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

function FrequentCustomersTab() {
  const [startDate, setStartDate] = useState(thirtyDaysAgo())
  const [endDate, setEndDate] = useState(today())

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.reports.frequentCustomers({ startDate, endDate, limit: 10 }),
    queryFn: () => reportService.getFrequentCustomers({ startDate, endDate, limit: 10 }),
  })

  if (isLoading) {
    return <div className="grid gap-4 lg:grid-cols-2"><Card><CardContent className="pt-6"><Skeleton className="h-80 w-full" /></CardContent></Card><Card><CardContent className="pt-6"><Skeleton className="h-80 w-full" /></CardContent></Card></div>
  }

  if (isError) {
    return <Card><CardContent className="py-12"><ErrorState message="Error al cargar clientes frecuentes" onRetry={() => refetch()} /></CardContent></Card>
  }

  if (!data || data.customers.length === 0) {
    return <Card><CardContent className="py-12 text-center text-muted-foreground">No hay datos de clientes frecuentes para el período seleccionado</CardContent></Card>
  }

  const sortedCustomers = [...data.customers].sort((a, b) => b.totalSpent - a.totalSpent)

  const chartData = sortedCustomers.map((c) => ({
    name: (c.customerName && c.customerName.length > 0 ? (c.customerName.length > 15 ? c.customerName.slice(0, 15) + '...' : c.customerName) : `Cliente ${c.position}`),
    gasto: c.totalSpent,
    visitas: c.totalVisits,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2"><label className="text-sm text-muted-foreground">Desde</label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-44" /></div>
        <div className="flex items-center gap-2"><label className="text-sm text-muted-foreground">Hasta</label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-44" /></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Top Clientes por Gasto</CardTitle></CardHeader>
          <CardContent>
            <div role="img" aria-label="Gráfico de barras de clientes frecuentes por gasto total">
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={140} className="text-xs" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                  <Bar dataKey="gasto" radius={[0, 6, 6, 0]}>
                    {chartData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Ranking</CardTitle></CardHeader>
          <CardContent className="overflow-y-auto max-h-[380px]">
            <div className="space-y-1.5 pr-1">
              {sortedCustomers.map((c) => (
                <div key={c.customerId} className="flex items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">{c.position}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.customerName || `Cliente ${c.position}`}</p>
                      <p className="text-[11px] text-muted-foreground">{c.totalVisits} visitas</p>
                    </div>
                  </div>
                  <div className="text-right text-sm shrink-0 ml-2">
                    <p className="font-medium">{formatCurrency(c.totalSpent)}</p>
                    <p className="text-[11px] text-muted-foreground">Ticket: {formatCurrency(c.averageTicket)}</p>
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
    ? Object.entries(data.salesByStatus).map(([name, value]) => ({ name: statusLabel[name] ?? name, value }))
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2"><label className="text-sm text-muted-foreground">Desde</label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-44" /></div>
        <div className="flex items-center gap-2"><label className="text-sm text-muted-foreground">Hasta</label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-44" /></div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => reportService.downloadSalesPdf({ startDate, endDate }).catch((err) => { console.error('Error al descargar PDF', err); toast.error('Error al descargar PDF') })}><FileDown className="mr-2 size-4" />PDF</Button>
          <Button variant="outline" size="sm" onClick={() => reportService.downloadSalesCsv({ startDate, endDate }).catch((err) => { console.error('Error al descargar CSV', err); toast.error('Error al descargar CSV') })}><FileText className="mr-2 size-4" />CSV</Button>
        </div>
      </div>

      {isError ? (
        <Card><CardContent className="py-12"><ErrorState message="Error al cargar el reporte de ventas" onRetry={() => refetch()} /></CardContent></Card>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => (<Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>))}</div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Ventas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{data.totalTransactions}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ingresos Totales</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">IVA Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(data.totalTax)}</div></CardContent></Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Ventas por Estado</CardTitle></CardHeader>
              <CardContent>
                <div role="img" aria-label="Gráfico de barras de ventas por estado">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
                      <YAxis className="text-xs" allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {statusChartData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Distribución</CardTitle></CardHeader>
              <CardContent>
                <div role="img" aria-label="Gráfico de donut de distribución de ventas">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={{ stroke: 'var(--border)', strokeWidth: 1 }}>
                        {statusChartData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {data.recentSales.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Ventas Recientes</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.recentSales.slice(0, 6).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50">
                      <span className="text-[13px] font-medium">{sale.saleNumber}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold">{formatCurrency(sale.total)}</span>
                        <Badge variant={statusBadge[sale.status] ?? 'outline'} className="text-[11px]">{statusLabel[sale.status] ?? sale.status}</Badge>
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

  if (isError) return <Card><CardContent className="py-12"><ErrorState message="Error al cargar el reporte de inventario" onRetry={() => refetch()} /></CardContent></Card>
  if (isLoading) return <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => (<Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>))}</div>
  if (!data) return <Card><CardContent className="py-12 text-center text-muted-foreground">No hay datos de inventario</CardContent></Card>

  const inventoryChartData = data.items.filter((i) => i.currentStock > 0).slice(0, 10).map((i) => ({
    name: i.productName.length > 18 ? i.productName.slice(0, 18) + '...' : i.productName,
    stock: i.currentStock,
    minimo: i.minStock,
  }))

  const lowItems = data.items.filter(i => i.lowStock || i.depleted)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => reportService.downloadInventoryExcel().catch((err) => { console.error('Error al descargar Excel', err); toast.error('Error al descargar') })}><FileSpreadsheet className="mr-2 size-4" />Exportar Excel</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Productos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.totalProducts}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Stock Bajo</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{data.lowStockCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Agotados</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{data.depletedCount}</div></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {inventoryChartData.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle className="text-sm font-medium">Niveles de Stock</CardTitle></CardHeader>
            <CardContent>
              <div role="img" aria-label="Gráfico de barras de niveles de stock por producto">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryChartData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" width={150} className="text-xs" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="stock" radius={[0, 6, 6, 0]} fill={CHART_COLORS[0]} name="Stock actual" />
                    <Bar dataKey="minimo" radius={[0, 6, 6, 0]} fill={CHART_COLORS[4]} name="Stock mínimo" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className={inventoryChartData.length > 0 ? 'lg:col-span-2' : ''}>
          <CardHeader><CardTitle className="text-sm font-medium">Productos con Stock Bajo</CardTitle></CardHeader>
          <CardContent className="overflow-y-auto max-h-[316px]">
            {lowItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No hay productos con stock bajo</p>
            ) : (
              <div className="space-y-1.5 pr-1">
                {lowItems.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span className="text-sm font-medium truncate mr-2">{item.productName}</span>
                    <div className="flex items-center gap-3 text-sm shrink-0">
                      <span className="text-muted-foreground">Stock: <span className={item.depleted ? 'text-destructive font-medium' : 'text-amber-600 font-medium'}>{item.currentStock}</span> / {item.minStock}</span>
                      <Badge variant={item.depleted ? 'destructive' : 'secondary'} className="text-[11px]">{item.depleted ? 'AGOTADO' : 'BAJO'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2"><label className="text-sm text-muted-foreground">Desde</label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-44" /></div>
        <div className="flex items-center gap-2"><label className="text-sm text-muted-foreground">Hasta</label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-44" /></div>
      </div>

      {isError ? (
        <Card><CardContent className="py-12"><ErrorState message="Error al cargar top productos" onRetry={() => refetch()} /></CardContent></Card>
      ) : isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2"><Card><CardContent className="pt-6"><Skeleton className="h-80 w-full" /></CardContent></Card><Card><CardContent className="pt-6"><Skeleton className="h-80 w-full" /></CardContent></Card></div>
      ) : data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Top Productos por Ingresos</CardTitle></CardHeader>
            <CardContent>
              <div role="img" aria-label="Gráfico de barras horizontal de productos más vendidos por ingresos">
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis type="number" className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" width={160} className="text-xs" tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {chartData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                  </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Ranking</CardTitle></CardHeader>
            <CardContent className="overflow-y-auto max-h-[380px]">
              <div className="space-y-1.5 pr-1">
                {data.rankings.map((product) => (
                  <div key={product.productId} className="flex items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium">{product.position}</span>
                      <span className="text-sm truncate">{product.productName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm shrink-0 ml-2">
                      <span className="text-muted-foreground">{product.totalQuantity}</span>
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
      <PageHeader title="Reportes" description="Analisis y estadisticas del negocio" />

      <Tabs defaultValue={isAdmin ? 'sales' : 'inventory'} className="space-y-6">
        <div className="flex justify-center">
          <TabsList variant="line">
            {isAdmin && <TabsTrigger value="sales" className="gap-2"><BarChart3 className="size-4" />Ventas</TabsTrigger>}
            <TabsTrigger value="inventory" className="gap-2"><Package className="size-4" />Inventario</TabsTrigger>
            {isAdmin && <TabsTrigger value="products" className="gap-2"><TrendingUp className="size-4" />Top</TabsTrigger>}
            {isAdmin && <TabsTrigger value="customers" className="gap-2"><Users className="size-4" />Clientes</TabsTrigger>}
          </TabsList>
        </div>

        {isAdmin && <TabsContent value="sales"><SalesReportTab /></TabsContent>}
        <TabsContent value="inventory"><InventoryReportTab /></TabsContent>
        {isAdmin && <TabsContent value="products"><TopProductsTab /></TabsContent>}
        {isAdmin && <TabsContent value="customers"><FrequentCustomersTab /></TabsContent>}
      </Tabs>
    </div>
  )
}
