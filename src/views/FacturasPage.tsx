import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Search, Download, Eye, FileDown, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { salesService, type SaleResponse } from '@/services/sales'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { SeoHead } from '@/components/shared/seo-head'

const statusBadge: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  CONFIRMADA: 'outline',
  PAGADA: 'default',
  ANULADA: 'destructive',
  BORRADOR: 'secondary',
  PENDIENTE: 'outline',
}

export function FacturasPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [viewInvoice, setViewInvoice] = useState<SaleResponse | null>(null)
  const [loadingDownload, setLoadingDownload] = useState<string | null>(null)

  const { data: salesData, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.sales.sales.list({ search, status: status || undefined, page, size: 20 }),
    queryFn: () => salesService.listSales({ status: status || undefined, page, size: 20 }),
  })

  const { data: customersData } = useQuery({
    queryKey: queryKeys.sales.customers.list({}),
    queryFn: () => salesService.listCustomers({ page: 1, size: 200 }),
    staleTime: 120000,
  })

  const customerMap = new Map((customersData?.data ?? []).map(c => [c.id, c.name]))

  const sales = salesData?.data ?? []
  const pagination = salesData?.pagination ?? null

  async function handleDownloadPdf(saleId: string) {
    setLoadingDownload(saleId)
    try {
      await salesService.downloadInvoicePdf(saleId)
      toast.success('PDF descargado')
    } catch {
      toast.error('Error al descargar PDF')
    } finally {
      setLoadingDownload(null)
    }
  }

  async function handleDownloadExcel(saleId: string) {
    setLoadingDownload(saleId)
    try {
      await salesService.downloadInvoiceExcel(saleId)
      toast.success('Excel descargado')
    } catch {
      toast.error('Error al descargar Excel')
    } finally {
      setLoadingDownload(null)
    }
  }

  async function handleDownloadCsv(saleId: string) {
    setLoadingDownload(saleId)
    try {
      await salesService.downloadInvoiceCsv(saleId)
      toast.success('CSV descargado')
    } catch {
      toast.error('Error al descargar CSV')
    } finally {
      setLoadingDownload(null)
    }
  }

  const columns: Column<SaleResponse>[] = [
    {
      header: 'Factura',
      accessor: (s) => <span className="font-mono text-sm font-medium">{s.saleNumber}</span>,
    },
    {
      header: 'Cliente',
      accessor: (s) => customerMap.get(s.customerId) ?? '—',
    },
    {
      header: 'Fecha',
      accessor: (s) => (
        <span className="text-sm text-muted-foreground">
          {new Date(s.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Total',
      accessor: (s) => (
        <span className="font-medium">
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(s.total)}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: (s) => <Badge variant={statusBadge[s.status] ?? 'outline'}>{s.status}</Badge>,
    },
    {
      header: '',
      className: 'text-right',
      accessor: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" aria-label="Ver detalle" onClick={() => setViewInvoice(s)}>
            <Eye className="size-4" />
          </Button>
          {s.status !== 'ANULADA' && s.status !== 'BORRADOR' && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="size-8" aria-label="Descargar" disabled={loadingDownload === s.id}>
                  <Download className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadPdf(s.id)}>
                  <FileDown className="mr-2 size-4" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadExcel(s.id)}>
                  <FileSpreadsheet className="mr-2 size-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadCsv(s.id)}>
                  <FileText className="mr-2 size-4" />
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Facturas" description="Consulta y descarga de facturas electrónicas." />
      <PageHeader
        title="Facturas"
        description="Consulta y descarga de facturas electrónicas"
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número de factura..."
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v ?? ''); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
            <SelectItem value="PAGADA">Pagada</SelectItem>
            <SelectItem value="ANULADA">Anulada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={sales}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        pagination={pagination ?? undefined}
        onPageChange={setPage}
        emptyIcon={FileText}
        emptyTitle="No hay facturas"
        emptyDescription="Las facturas se generan automáticamente al confirmar una venta"
        keyExtractor={(s) => s.id}
      />

      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Factura {viewInvoice?.saleNumber}</DialogTitle>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Número:</span>{' '}
                  <span className="font-medium">{viewInvoice.saleNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>{' '}
                  <Badge variant={statusBadge[viewInvoice.status] ?? 'outline'}>{viewInvoice.status}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha:</span>{' '}
                  {new Date(viewInvoice.createdAt).toLocaleString()}
                </div>
              </div>

              <Separator />

              <div className="text-sm font-medium">Items</div>
              <div className="space-y-2">
                {viewInvoice.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="flex-1">{item.productName}</span>
                    <span className="mx-4 text-muted-foreground">x{item.quantity}</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(viewInvoice.subtotal)}</span>
                </div>
                {viewInvoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descuento</span>
                    <span className="text-destructive">-{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(viewInvoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA</span>
                  <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(viewInvoice.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(viewInvoice.total)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownloadPdf(viewInvoice.id)}>
                  <FileDown className="mr-2 size-4" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadExcel(viewInvoice.id)}>
                  <FileSpreadsheet className="mr-2 size-4" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadCsv(viewInvoice.id)}>
                  <FileText className="mr-2 size-4" />
                  CSV
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
