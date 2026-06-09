import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertTriangle, Package, ArrowUp, ArrowDown, ClipboardList,
  RotateCcw, Scale,
} from 'lucide-react'
import { toast } from 'sonner'
import { inventoryService, type ProductInventoryResponse } from '@/services/inventory'
import { catalogService } from '@/services/catalog'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const movementSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  notes: z.string().optional(),
})

const adjustSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  adjustmentType: z.enum(['POSITIVO', 'NEGATIVO']),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  justification: z.string().min(1, 'La justificación es requerida'),
  notes: z.string().optional(),
})

type MovementValues = z.infer<typeof movementSchema>
type AdjustValues = z.infer<typeof adjustSchema>

type MovementType = 'entry' | 'exit' | 'return' | null

export function InventarioPage() {
  const qc = useQueryClient()
  const [movementType, setMovementType] = useState<MovementType>(null)
  const [adjustOpen, setAdjustOpen] = useState(false)

  const { data: inventoryData, isLoading: invLoading } = useQuery({
    queryKey: queryKeys.inventory.list({ page: 1, size: 200 }),
    queryFn: () => inventoryService.listProducts({ page: 1, size: 200 }),
  })

  const { data: productsData } = useQuery({
    queryKey: queryKeys.catalog.products.list({}),
    queryFn: () => catalogService.listProducts({ page: 1, size: 200 }),
  })

  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: queryKeys.inventory.alerts.list({ page: 1, size: 200 }),
    queryFn: () => inventoryService.getAlerts({ page: 1, size: 200 }),
  })

  const { data: depletedData } = useQuery({
    queryKey: queryKeys.inventory.alerts.depleted({ page: 1, size: 200 }),
    queryFn: () => inventoryService.getDepleted({ page: 1, size: 200 }),
  })

  const inventory = inventoryData?.data ?? []
  const alerts = alertsData?.data ?? []
  const depleted = depletedData?.data ?? []
  const products = productsData?.data ?? []

  const movementForm = useForm<MovementValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: { productId: '', quantity: 1, notes: '' },
  })

  const adjustForm = useForm<AdjustValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { productId: '', adjustmentType: 'POSITIVO', quantity: 1, justification: '', notes: '' },
  })

  const entryMutation = useMutation({
    mutationFn: (data: MovementValues) => inventoryService.registerEntry(data.productId, { quantity: data.quantity, notes: data.notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.inventory.all }); toast.success('Entrada registrada'); closeMovement() },
    onError: () => toast.error('Error al registrar entrada'),
  })

  const exitMutation = useMutation({
    mutationFn: (data: MovementValues) => inventoryService.registerExit(data.productId, { quantity: data.quantity, notes: data.notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.inventory.all }); toast.success('Salida registrada'); closeMovement() },
    onError: () => toast.error('Error al registrar salida'),
  })

  const returnMutation = useMutation({
    mutationFn: (data: MovementValues) => inventoryService.registerReturn(data.productId, { quantity: data.quantity, notes: data.notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.inventory.all }); toast.success('Devolución registrada'); closeMovement() },
    onError: () => toast.error('Error al registrar devolución'),
  })

  const adjustMutation = useMutation({
    mutationFn: (data: AdjustValues) => inventoryService.adjust(data.productId, { adjustmentType: data.adjustmentType, quantity: data.quantity, justification: data.justification, notes: data.notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.inventory.all }); toast.success('Ajuste registrado'); setAdjustOpen(false); adjustForm.reset() },
    onError: () => toast.error('Error al registrar ajuste'),
  })

  function closeMovement() {
    setMovementType(null)
    movementForm.reset()
  }

  function handleMovement(type: MovementType, productId?: string) {
    setMovementType(type)
    movementForm.reset({ productId: productId ?? '', quantity: 1, notes: '' })
  }

  const movementTitle = movementType === 'entry' ? 'Entrada de Stock' : movementType === 'exit' ? 'Salida de Stock' : 'Devolución de Stock'
  const movementDesc = movementType === 'entry' ? 'Registra entrada de productos al inventario' : movementType === 'exit' ? 'Registra salida de productos del inventario' : 'Registra devolución de productos al inventario'

  function onMovementSubmit(data: MovementValues) {
    if (movementType === 'entry') entryMutation.mutate(data)
    else if (movementType === 'exit') exitMutation.mutate(data)
    else if (movementType === 'return') returnMutation.mutate(data)
  }

  function onAdjustSubmit(data: AdjustValues) {
    adjustMutation.mutate(data)
  }

  const invColumns: Column<ProductInventoryResponse>[] = [
    { header: 'Producto', accessor: (i) => <span className="font-medium">{i.productName}</span> },
    { header: 'Código', accessor: (i) => <span className="font-mono text-sm">{i.productCodigo}</span> },
    { header: 'Stock', accessor: (i) => <span className="font-semibold">{i.currentStock}</span> },
    { header: 'Stock Mín', accessor: (i) => i.minStock.toString() },
    { header: 'Stock Máx', accessor: (i) => i.maxStock.toString() },
    {
      header: 'Estado',
      accessor: (i) => {
        if (i.depleted) return <Badge variant="destructive">AGOTADO</Badge>
        if (i.lowStock) return <Badge variant="secondary">BAJO</Badge>
        return <Badge variant="default">NORMAL</Badge>
      },
    },
    {
      header: '',
      className: 'text-right',
      accessor: (i) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" aria-label="Entrada" onClick={() => handleMovement('entry', i.productId)}>
            <ArrowDown className="size-4 text-emerald-600" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Salida" onClick={() => handleMovement('exit', i.productId)}>
            <ArrowUp className="size-4 text-amber-600" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Devolución" onClick={() => handleMovement('return', i.productId)}>
            <RotateCcw className="size-4 text-blue-600" />
          </Button>
        </div>
      ),
    },
  ]

  const alertColumns: Column<ProductInventoryResponse>[] = [
    { header: 'Producto', accessor: (i) => <span className="font-medium">{i.productName}</span> },
    { header: 'Código', accessor: (i) => <span className="font-mono text-sm">{i.productCodigo}</span> },
    { header: 'Stock Actual', accessor: (i) => <span className="font-bold text-destructive">{i.currentStock}</span> },
    { header: 'Stock Mínimo', accessor: (i) => i.minStock.toString() },
    {
      header: 'Nivel',
      accessor: (i) => <Badge variant={i.depleted ? 'destructive' : 'secondary'}>{i.depleted ? 'AGOTADO' : 'CRÍTICO'}</Badge>,
    },
  ]

  const isPending = entryMutation.isPending || exitMutation.isPending || returnMutation.isPending

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventario"
        description="Control de existencias"
        actions={
          <Button variant="outline" onClick={() => setAdjustOpen(true)}>
            <Scale className="mr-2 size-4" />
            Ajustar Inventario
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10"><Package className="size-5 text-primary" /></div>
          <div><p className="text-sm text-muted-foreground">Total Productos</p><p className="text-2xl font-bold">{inventory.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20"><AlertTriangle className="size-5 text-amber-600" /></div>
          <div><p className="text-sm text-muted-foreground">Stock Bajo</p><p className="text-2xl font-bold text-amber-600">{alerts.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20"><ArrowUp className="size-5 text-red-600" /></div>
          <div><p className="text-sm text-muted-foreground">Agotados</p><p className="text-2xl font-bold text-destructive">{depleted.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20"><ClipboardList className="size-5 text-blue-600" /></div>
          <div><p className="text-sm text-muted-foreground">Stock Normal</p><p className="text-2xl font-bold">{inventory.filter(i => !i.lowStock && !i.depleted).length}</p></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="alerts">Alertas {alerts.length > 0 && `(${alerts.length})`}</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <DataTable
            columns={invColumns}
            data={inventory}
            isLoading={invLoading}
            emptyIcon={Package}
            emptyTitle="Inventario vacío"
            emptyDescription="No hay productos registrados en inventario"
            keyExtractor={(i) => i.id}
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          {alerts.length === 0 && depleted.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No hay alertas de stock</CardContent></Card>
          ) : (
            <div className="space-y-6">
              {depleted.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-destructive">Productos Agotados</h3>
                  <DataTable columns={alertColumns} data={depleted} isLoading={alertsLoading} emptyIcon={AlertTriangle} emptyTitle="No hay productos agotados" keyExtractor={(i) => i.id} />
                </div>
              )}
              {alerts.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-amber-600">Productos con Stock Bajo</h3>
                  <DataTable columns={alertColumns} data={alerts} isLoading={alertsLoading} emptyIcon={AlertTriangle} emptyTitle="No hay productos con stock bajo" keyExtractor={(i) => i.id} />
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={movementType !== null} onOpenChange={(o) => { if (!o) closeMovement() }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{movementTitle}</DialogTitle><DialogDescription>{movementDesc}</DialogDescription></DialogHeader>
          <Form {...movementForm}>
            <form onSubmit={movementForm.handleSubmit(onMovementSubmit)} className="flex flex-col gap-4">
              <FormField control={movementForm.control} name="productId" render={({ field }) => (
                <FormItem><FormLabel>Producto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un producto" /></SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.status === 'ACTIVO').map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.codigo})</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={movementForm.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel>Cantidad</FormLabel><FormControl><Input type="number" min={1} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={movementForm.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Notas</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={closeMovement}>Cancelar</Button>
                <Button type="submit" disabled={isPending}>Registrar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={adjustOpen} onOpenChange={(o) => { if (!o) { setAdjustOpen(false); adjustForm.reset() }}}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajustar Inventario</DialogTitle><DialogDescription>Realiza un ajuste positivo o negativo al inventario</DialogDescription></DialogHeader>
          <Form {...adjustForm}>
            <form onSubmit={adjustForm.handleSubmit(onAdjustSubmit)} className="flex flex-col gap-4">
              <FormField control={adjustForm.control} name="productId" render={({ field }) => (
                <FormItem><FormLabel>Producto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un producto" /></SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.status === 'ACTIVO').map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.codigo})</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={adjustForm.control} name="adjustmentType" render={({ field }) => (
                <FormItem><FormLabel>Tipo de Ajuste</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POSITIVO">Positivo (aumentar stock)</SelectItem>
                      <SelectItem value="NEGATIVO">Negativo (disminuir stock)</SelectItem>
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={adjustForm.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel>Cantidad</FormLabel><FormControl><Input type="number" min={1} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={adjustForm.control} name="justification" render={({ field }) => (
                <FormItem><FormLabel>Justificación</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={adjustForm.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Notas adicionales</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => { setAdjustOpen(false); adjustForm.reset() }}>Cancelar</Button>
                <Button type="submit" disabled={adjustMutation.isPending}>Registrar Ajuste</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
