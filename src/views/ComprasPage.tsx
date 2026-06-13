import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Eye, Trash2, FileText, XCircle, PackageCheck } from 'lucide-react'
import { toast } from 'sonner'
import { purchaseService, type PurchaseResponse, type PurchaseItemResponse } from '@/services/purchase'
import { catalogService } from '@/services/catalog'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { useAuthStore } from '@/stores/auth'

const orderStatusFlow: Record<string, string> = {
  BORRADOR: 'PENDIENTE',
  PENDIENTE: 'RECIBIDA',
  RECIBIDA: 'PAGADA',
}

const statusBadge: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PAGADA: 'default',
  RECIBIDA: 'default',
  PENDIENTE: 'outline',
  BORRADOR: 'secondary',
  CANCELADA: 'destructive',
}

const noHTML = (v: string) => !/[<>&"']/.test(v)
const purchaseItemSchema = z.object({
  productId: z.string().min(1).refine(noHTML),
  productName: z.string().min(1).refine(noHTML),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0.01),
})

const createPurchaseSchema = z.object({
  supplierId: z.string().min(1, 'El proveedor es requerido').refine(noHTML),
  items: z.array(purchaseItemSchema).min(1, 'Agrega al menos un producto'),
  notes: z.string().refine(noHTML).optional(),
})

type CreatePurchaseValues = z.infer<typeof createPurchaseSchema>

export function ComprasPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const canManageStatus = user?.role === 'ADMIN'
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [viewPurchase, setViewPurchase] = useState<PurchaseResponse | null>(null)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [receivePurchase, setReceivePurchase] = useState<PurchaseResponse | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelId, setCancelId] = useState<string | null>(null)

  const { data: purchasesData, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.purchases.purchases.list({ page, size: 20 }),
    queryFn: () => purchaseService.listPurchases({ page, size: 20 }),
  })

  const { data: suppliersData } = useQuery({
    queryKey: queryKeys.purchases.suppliers.list({}),
    queryFn: () => purchaseService.listSuppliers({ page: 1, size: 200 }),
  })

  const { data: productsData } = useQuery({
    queryKey: queryKeys.catalog.products.list({}),
    queryFn: () => catalogService.listProducts({ page: 1, size: 200 }),
  })

  const suppliers = suppliersData?.data ?? []
  const products = productsData?.data ?? []
  const supplierMap = new Map(suppliers.map((s) => [s.id, s.name]))

  const form = useForm<CreatePurchaseValues>({
    resolver: zodResolver(createPurchaseSchema),
    defaultValues: { supplierId: '', items: [], notes: '' },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })
  const items = form.watch('items')
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  const createMutation = useMutation({
    mutationFn: (data: CreatePurchaseValues) => purchaseService.createPurchase({
      supplierId: data.supplierId,
      items: data.items.map(i => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, unitPrice: i.unitPrice })),
      notes: data.notes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.purchases.purchases.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      toast.success('Compra creada')
      setOpen(false)
      form.reset()
    },
    onError: () => toast.error('Error al crear compra'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      purchaseService.updatePurchaseStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.purchases.purchases.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      toast.success('Estado actualizado')
    },
    onError: () => toast.error('Error al cambiar estado'),
  })

  const receiveMutation = useMutation({
    mutationFn: ({ id, items }: { id: string; items: Array<{ itemId: string; receivedQuantity: number }> }) =>
      purchaseService.receivePurchase(id, { items }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.purchases.purchases.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all })
      toast.success('Compra recibida')
      setReceiveOpen(false)
      setReceivePurchase(null)
    },
    onError: () => toast.error('Error al recibir compra'),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => purchaseService.cancelPurchase(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.purchases.purchases.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      toast.success('Compra cancelada')
      setCancelOpen(false)
      setCancelId(null)
    },
    onError: () => toast.error('Error al cancelar compra'),
  })

  function addProduct(productId: string) {
    const product = products.find(p => p.id === productId)
    if (product) {
      append({ productId: product.id, productName: product.name, quantity: 1, unitPrice: product.purchasePrice })
    }
  }

  function onSubmit(data: CreatePurchaseValues) {
    createMutation.mutate(data)
  }

  const purchases = purchasesData?.data ?? []
  const pagination = purchasesData?.pagination ?? null

  const columns: Column<PurchaseResponse>[] = [
    {
      header: 'N° Orden',
      accessor: (p) => <span className="font-mono text-sm font-medium">{p.purchaseNumber}</span>,
    },
    {
      header: 'Proveedor',
      accessor: (p) => <span className="font-medium">{supplierMap.get(p.supplierId) ?? <span className="text-muted-foreground">—</span>}</span>,
    },
    {
      header: 'Fecha',
      accessor: (p) => new Date(p.createdAt).toLocaleDateString(),
    },
    {
      header: 'Total',
      accessor: (p) => <span className="font-medium">${p.total.toLocaleString()}</span>,
    },
    {
      header: 'Estado',
      accessor: (p) => <Badge variant={statusBadge[p.status] ?? 'outline'}>{p.status}</Badge>,
    },
    {
      header: '',
      className: 'text-right',
      accessor: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" aria-label="Ver detalle" onClick={() => setViewPurchase(p)}>
            <Eye className="size-4" />
          </Button>
          {p.status === 'PENDIENTE' && (
            <Button variant="outline" size="sm" onClick={() => { setReceivePurchase(p); setReceiveOpen(true) }}>
              <PackageCheck className="mr-1 size-3" />Recibir
            </Button>
          )}
          {canManageStatus && p.status === 'BORRADOR' && (
            <Button variant="outline" size="sm" onClick={() => statusMutation.mutate({ id: p.id, status: orderStatusFlow[p.status] })}>
              {orderStatusFlow[p.status]}
            </Button>
          )}
          {canManageStatus && ['BORRADOR', 'PENDIENTE'].includes(p.status) && (
            <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label="Cancelar compra" onClick={() => { setCancelId(p.id); setCancelOpen(true) }}>
              <XCircle className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Compras"
        description="Gestión de órdenes de compra"
        actions={
          <Button onClick={() => { form.reset(); setOpen(true) }}>
            <Plus className="mr-2 size-4" />Nueva Compra
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={purchases}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        pagination={pagination ?? undefined}
        onPageChange={setPage}
        emptyIcon={FileText}
        emptyTitle="No hay compras"
        emptyDescription="Registra la primera compra a un proveedor"
        emptyAction={<Button onClick={() => { form.reset(); setOpen(true) }}><Plus className="mr-2 size-4" />Nueva Compra</Button>}
        keyExtractor={(p) => p.id}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nueva Compra</DialogTitle><DialogDescription>Registra una compra a proveedor</DialogDescription></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField control={form.control} name="supplierId" render={({ field }) => (
                <FormItem><FormLabel>Proveedor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Selecciona proveedor" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.filter(s => s.status === 'ACTIVO').map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <Separator />
              <div className="flex items-center justify-between">
                <FormLabel>Items</FormLabel>
                <Select onValueChange={(v: any) => { if (v) addProduct(v) }}>
                  <SelectTrigger className="w-64"><SelectValue placeholder="+ Agregar producto" /></SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.status === 'ACTIVO').map((p) => <SelectItem key={p.id} value={p.id}>{p.name} - ${p.purchasePrice}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-2 font-medium">Producto</th><th className="w-24 p-2 font-medium">Cant.</th><th className="w-28 p-2 font-medium">Precio</th><th className="w-28 p-2 font-medium text-right">Subtotal</th><th className="w-10 p-2"></th>
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
              <div className="flex justify-end font-bold">Total: ${total.toLocaleString()}</div>
              <DialogFooter><Button type="submit" disabled={createMutation.isPending || items.length === 0}>Crear orden de compra</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewPurchase} onOpenChange={() => setViewPurchase(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle de Compra {viewPurchase?.purchaseNumber}</DialogTitle></DialogHeader>
          {viewPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Proveedor:</span> {supplierMap.get(viewPurchase.supplierId) ?? <span className="italic text-muted-foreground">Desconocido</span>}</div>
                <div><span className="text-muted-foreground">Estado:</span> {viewPurchase.status}</div>
                <div><span className="text-muted-foreground">Fecha:</span> {new Date(viewPurchase.createdAt).toLocaleString()}</div>
              </div>
              <Separator />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Producto</th><th className="pb-2 font-medium text-right">Cant.</th><th className="pb-2 font-medium text-right">Recibido</th><th className="pb-2 font-medium text-right">Pendiente</th><th className="pb-2 font-medium text-right">P. Unit.</th><th className="pb-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {viewPurchase.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2">{item.productName}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">{item.receivedQuantity}</td>
                      <td className="py-2 text-right">{item.pendingQuantity}</td>
                      <td className="py-2 text-right">${item.unitPrice.toLocaleString()}</td>
                      <td className="py-2 text-right font-medium">${item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end font-bold text-base">Total: ${viewPurchase.total.toLocaleString()}</div>
              {viewPurchase.status === 'PENDIENTE' && (
                <DialogFooter>
                  <Button onClick={() => { setReceivePurchase(viewPurchase); setReceiveOpen(true) }}>
                    <PackageCheck className="mr-2 size-4" />Recibir Compra
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={receiveOpen} onOpenChange={(o) => { if (!o) { setReceiveOpen(false); setReceivePurchase(null) }}}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Recibir Compra</DialogTitle><DialogDescription>Registra la recepción de productos</DialogDescription></DialogHeader>
          {receivePurchase && (
            <div className="flex flex-col gap-4">
              {receivePurchase.items.map((item) => (
                <ReceiveItemRow key={item.id} item={item} />
              ))}
              <DialogFooter>
                <Button onClick={() => {
                  const inputs = document.querySelectorAll<HTMLInputElement>('[data-receive-qty]')
                  const receiveItems = Array.from(inputs).map(input => ({
                    itemId: input.dataset.receiveQty!,
                    receivedQuantity: parseInt(input.value) || 0,
                  })).filter(i => i.receivedQuantity > 0)
                  if (receiveItems.length === 0) { toast.error('Ingresa al menos una cantidad'); return }
                  receiveMutation.mutate({ id: receivePurchase.id, items: receiveItems })
                }} disabled={receiveMutation.isPending}>
                  Confirmar Recepción
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={(o) => { if (!o) { setCancelOpen(false); setCancelId(null) }}}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancelar Compra</DialogTitle><DialogDescription>Confirma la cancelación de esta orden de compra</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCancelOpen(false); setCancelId(null) }}>Volver</Button>
            <Button variant="destructive" onClick={() => cancelId && cancelMutation.mutate(cancelId)} disabled={cancelMutation.isPending}>Cancelar Compra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReceiveItemRow({ item }: { item: PurchaseItemResponse }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{item.productName}</p>
        <p className="text-xs text-muted-foreground">
          Pedido: {item.quantity} | Recibido: {item.receivedQuantity} | Pendiente: {item.pendingQuantity}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Recibir:</label>
        <Input
          type="number"
          min={0}
          max={item.pendingQuantity}
          defaultValue={item.pendingQuantity}
          className="h-8 w-20 text-right"
          data-receive-qty={item.id}
        />
      </div>
    </div>
  )
}
