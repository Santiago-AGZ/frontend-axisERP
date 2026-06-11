import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AxiosError } from 'axios'
import { Plus, Eye, Ban, Trash2, ShoppingCart, CheckCircle2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { salesService, type SaleResponse } from '@/services/sales'
import { catalogService } from '@/services/catalog'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { ApiResponse } from '@/types/api'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SeoHead } from '@/components/shared/seo-head'
import { useAuthStore } from '@/stores/auth'

const noHTML = (v: string) => !/[<>&"']/.test(v)
const saleItemSchema = z.object({
  productId: z.string().min(1).refine(noHTML),
  productName: z.string().min(1).refine(noHTML),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0.01),
  discount: z.number().min(0),
})

type CreateSaleValues = z.infer<ReturnType<typeof createSaleSchema>>

const statusBadge: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  CONFIRMADA: 'outline',
  PAGADA: 'default',
  ANULADA: 'destructive',
  BORRADOR: 'secondary',
  PENDIENTE: 'outline',
}

export function VentasPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)

  const createSaleSchema = z.object({
    customerId: z.string().min(1, 'El cliente es requerido').refine(noHTML),
    items: z.array(saleItemSchema).min(1, 'Agrega al menos un producto'),
    discount: z.number().min(0).max(isAdmin ? 100 : 30),
    notes: z.string().refine(noHTML).optional(),
  })
  const [viewSale, setViewSale] = useState<SaleResponse | null>(null)
  const [voidOpen, setVoidOpen] = useState(false)
  const [voidingId, setVoidingId] = useState<string | null>(null)

  const { data: salesData, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.sales.sales.list({ page, size: 20 }),
    queryFn: () => salesService.listSales({ page, size: 20 }),
  })

  const { data: customersData } = useQuery({
    queryKey: queryKeys.sales.customers.list({}),
    queryFn: () => salesService.listCustomers({ page: 1, size: 200 }),
  })

  const { data: productsData } = useQuery({
    queryKey: queryKeys.catalog.products.list({}),
    queryFn: () => catalogService.listProducts({ page: 1, size: 200 }),
  })

  const customers = customersData?.data ?? []
  const products = productsData?.data ?? []

  const form = useForm<CreateSaleValues>({
    resolver: zodResolver(createSaleSchema),
    defaultValues: { customerId: '', items: [], discount: 0, notes: '' },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })
  const items = form.watch('items')
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const discount = form.watch('discount') ?? 0
  const discountAmount = subtotal * (discount / 100)
  const iva = (subtotal - discountAmount) * 0.19
  const total = subtotal - discountAmount + iva

  const createMutation = useMutation({
    mutationFn: (data: CreateSaleValues) => salesService.createSale({
      customerId: data.customerId,
      items: data.items.map(i => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount || undefined })),
      discount: data.discount || undefined,
      notes: data.notes || undefined,
    }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.sales.sales.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      qc.invalidateQueries({ queryKey: queryKeys.sales.customers.history(variables.customerId) })
      toast.success('Venta creada')
      setOpen(false)
      form.reset()
    },
    onError: (err) => {
      const msg = (err as AxiosError<ApiResponse<unknown>>)?.response?.data?.message || 'No se pudo crear la venta'
      toast.error(msg)
    },
  })

  const confirmMutation = useMutation({
    mutationFn: (id: string) => salesService.confirmSale(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.sales.sales.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all })
      const sale = salesData?.data?.find(s => s.id === id)
      if (sale?.customerId) qc.invalidateQueries({ queryKey: queryKeys.sales.customers.history(sale.customerId) })
      toast.success('Venta confirmada')
    },
    onError: (err) => {
      const msg = (err as AxiosError<ApiResponse<unknown>>)?.response?.data?.message || 'Error al confirmar venta'
      toast.error(msg)
    },
  })

  const payMutation = useMutation({
    mutationFn: (id: string) => salesService.paySale(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.sales.sales.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all })
      const sale = salesData?.data?.find(s => s.id === id)
      if (sale?.customerId) qc.invalidateQueries({ queryKey: queryKeys.sales.customers.history(sale.customerId) })
      toast.success('Pago registrado')
    },
    onError: (err) => {
      const msg = (err as AxiosError<ApiResponse<unknown>>)?.response?.data?.message || 'Error al registrar pago'
      toast.error(msg)
    },
  })

  const voidMutation = useMutation({
    mutationFn: (id: string) => salesService.voidSale(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.sales.sales.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all })
      const sale = salesData?.data?.find(s => s.id === id)
      if (sale?.customerId) qc.invalidateQueries({ queryKey: queryKeys.sales.customers.history(sale.customerId) })
      toast.success('Venta anulada')
      setVoidOpen(false)
      setVoidingId(null)
    },
    onError: (err) => {
      const msg = (err as AxiosError<ApiResponse<unknown>>)?.response?.data?.message || 'Error al anular venta'
      toast.error(msg)
    },
  })

  function addProduct(productId: string) {
    const product = products.find(p => p.id === productId)
    if (product) {
      append({ productId: product.id, productName: product.name, quantity: 1, unitPrice: product.salePrice, discount: 0 })
    }
  }

  function onSubmit(data: CreateSaleValues) {
    createMutation.mutate(data)
  }

  const sales = salesData?.data ?? []
  const pagination = salesData?.pagination ?? null

  const columns: Column<SaleResponse>[] = [
    { header: 'Factura', accessor: (s) => <span className="font-mono text-sm font-medium">{s.saleNumber}</span> },
    { header: 'Fecha', accessor: (s) => new Date(s.createdAt).toLocaleDateString() },
    { header: 'Items', accessor: (s) => s.items.length.toString() },
    { header: 'Total', accessor: (s) => <span className="font-semibold">${s.total.toLocaleString()}</span> },
    { header: 'Estado', accessor: (s) => <Badge variant={statusBadge[s.status] ?? 'outline'}>{s.status}</Badge> },
    {
      header: '',
      className: 'text-right',
      accessor: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" aria-label="Ver detalle" onClick={() => setViewSale(s)}>
            <Eye className="size-4" />
          </Button>
          {s.status === 'PENDIENTE' && (
            <Button variant="outline" size="sm" onClick={() => confirmMutation.mutate(s.id)} disabled={confirmMutation.isPending}>
              <CheckCircle2 className="mr-1 size-3" />Confirmar
            </Button>
          )}
          {s.status === 'CONFIRMADA' && (
            <Button variant="default" size="sm" onClick={() => payMutation.mutate(s.id)} disabled={payMutation.isPending}>
              <CreditCard className="mr-1 size-3" />Cobrar
            </Button>
          )}
          {isAdmin && s.status !== 'ANULADA' && s.status !== 'PAGADA' && (
            <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label="Anular venta" onClick={() => { setVoidingId(s.id); setVoidOpen(true) }}>
              <Ban className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Ventas" description="Registro de ventas del sistema AxisERP." />
      <PageHeader
        title="Ventas"
        description="Registro de ventas"
        actions={
          <Button onClick={() => { form.reset(); setOpen(true) }}>
            <Plus className="mr-2 size-4" />Nueva Venta
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={sales}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        pagination={pagination ?? undefined}
        onPageChange={setPage}
        emptyIcon={ShoppingCart}
        emptyTitle="No hay ventas"
        emptyDescription="Registra la primera venta"
        emptyAction={<Button onClick={() => { form.reset(); setOpen(true) }}><Plus className="mr-2 size-4" />Nueva Venta</Button>}
        keyExtractor={(s) => s.id}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nueva Venta</DialogTitle><DialogDescription>Registra una nueva venta</DialogDescription></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="customerId" render={({ field }) => (
                  <FormItem><FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Selecciona cliente" /></SelectTrigger>
                      <SelectContent>
                        {customers.filter(c => c.status === 'ACTIVO').map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <FormLabel>Items</FormLabel>
                <Select onValueChange={(v: any) => { if (v) addProduct(v) }}>
                  <SelectTrigger className="w-64"><SelectValue placeholder="+ Agregar producto" /></SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.status === 'ACTIVO').map((p) => <SelectItem key={p.id} value={p.id}>{p.name} - ${p.salePrice}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-2 font-medium">Producto</th><th className="w-24 p-2 font-medium">Cantidad</th><th className="w-28 p-2 font-medium">Precio</th><th className="w-28 p-2 font-medium text-right">Subtotal</th><th className="w-10 p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={field.id} className="border-b last:border-0">
                        <td className="p-2">{products.find(p => p.id === items[index]?.productId)?.name ?? '—'}</td>
                        <td className="p-2"><Input type="number" min={1} className="h-8" value={items[index]?.quantity ?? 1} onChange={(e) => form.setValue(`items.${index}.quantity`, parseInt(e.target.value) || 1)} /></td>
                        <td className="p-2"><Input type="number" step="0.01" className="h-8" value={items[index]?.unitPrice ?? 0} onChange={(e) => form.setValue(`items.${index}.unitPrice`, parseFloat(e.target.value) || 0)} /></td>
                        <td className="p-2 text-right">${((items[index]?.quantity ?? 0) * (items[index]?.unitPrice ?? 0)).toLocaleString()}</td>
                        <td className="p-2"><Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Eliminar" onClick={() => remove(index)}><Trash2 className="size-3" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toLocaleString()}</span></div>
                <div className="flex items-center justify-between gap-4">
                  <span>Descuento (%):</span>
                  <Input type="number" min={0} max={isAdmin ? 100 : 30} className="h-7 w-20 text-right" value={form.watch('discount') ?? 0} onChange={(e) => form.setValue('discount', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="flex justify-between"><span>IVA (19%):</span><span>${iva.toLocaleString()}</span></div>
                <Separator />
                <div className="flex justify-between font-bold text-base"><span>Total:</span><span>${total.toLocaleString()}</span></div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || items.length === 0}>Crear Venta</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewSale} onOpenChange={() => setViewSale(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle de Venta {viewSale?.saleNumber}</DialogTitle></DialogHeader>
          {viewSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Factura:</span> {viewSale.saleNumber}</div>
                <div><span className="text-muted-foreground">Estado:</span> {viewSale.status}</div>
                <div><span className="text-muted-foreground">Fecha:</span> {new Date(viewSale.createdAt).toLocaleString()}</div>
              </div>
              <Separator />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Producto</th><th className="pb-2 font-medium text-right">Cant.</th><th className="pb-2 font-medium text-right">P. Unit.</th><th className="pb-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {viewSale.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2">{item.productName}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">${item.unitPrice.toLocaleString()}</td>
                      <td className="py-2 text-right font-medium">${item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end font-bold text-base">Total: ${viewSale.total.toLocaleString()}</div>
              <div className="flex justify-end gap-2">
                {viewSale.status === 'PENDIENTE' && (
                  <Button size="sm" onClick={() => confirmMutation.mutate(viewSale.id)} disabled={confirmMutation.isPending}>
                    <CheckCircle2 className="mr-2 size-4" />Confirmar Venta
                  </Button>
                )}
                {viewSale.status === 'CONFIRMADA' && (
                  <Button size="sm" onClick={() => payMutation.mutate(viewSale.id)} disabled={payMutation.isPending}>
                    <CreditCard className="mr-2 size-4" />Registrar Pago
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={voidOpen} onOpenChange={setVoidOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Anular Venta</DialogTitle><DialogDescription>Confirma la anulación de esta venta</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setVoidOpen(false); setVoidingId(null) }}>Cancelar</Button>
            <Button variant="destructive" onClick={() => voidingId && voidMutation.mutate(voidingId)} disabled={voidMutation.isPending}>Anular Venta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
