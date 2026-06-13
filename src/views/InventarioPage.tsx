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
import { inventoryService, type ProductInventoryResponse, type MovementResponse } from '@/services/inventory'
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
import { ErrorState } from '@/components/shared/error-state'
import { SeoHead } from '@/components/shared/seo-head'
import { useAuthStore } from '@/stores/auth'
import { movementLabel, movementBadgeVariant } from '@/lib/labels'

const noHTML = (v: string) => !/[<>&"']/.test(v)
const movementSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto').refine(noHTML),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  notes: z.string().refine(noHTML).optional(),
})

const adjustSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto').refine(noHTML),
  adjustmentType: z.enum(['POSITIVO', 'NEGATIVO']),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  justification: z.string().min(1, 'La justificación es requerida').refine(noHTML),
  notes: z.string().refine(noHTML).optional(),
})

const initSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto').refine(noHTML),
  initialStock: z.number().min(0, 'Debe ser mayor o igual a 0'),
  minStock: z.number().min(0, 'Debe ser mayor o igual a 0'),
  maxStock: z.number().min(0, 'Debe ser mayor o igual a 0'),
  notes: z.string().refine(noHTML).optional(),
})

const reverseSchema = z.object({
  movementId: z.string().min(1, 'ID de movimiento requerido').refine(noHTML),
  justification: z.string().min(1, 'La justificación es requerida').refine(noHTML),
})

type MovementValues = z.infer<typeof movementSchema>
type AdjustValues = z.infer<typeof adjustSchema>
type InitValues = z.infer<typeof initSchema>
type ReverseValues = z.infer<typeof reverseSchema>

type MovementType = 'entry' | 'exit' | 'return' | null

export function InventarioPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const canReverse = user?.role === 'ADMIN'
  const [movementType, setMovementType] = useState<MovementType>(null)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [initOpen, setInitOpen] = useState(false)
  const [reverseOpen, setReverseOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')

  const { data: inventoryData, isLoading: invLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.inventory.list({ page: 1, size: 200 }),
    queryFn: () => inventoryService.listProducts({ page: 1, size: 200 }),
  })

  const { data: productsData } = useQuery({
    queryKey: queryKeys.catalog.products.list({}),
    queryFn: () => catalogService.listProducts({ page: 1, size: 200 }),
  })

  const { data: alertsData, isLoading: alertsLoading, isError: alertsError, refetch: alertsRefetch } = useQuery({
    queryKey: queryKeys.inventory.alerts.list({ page: 1, size: 200 }),
    queryFn: () => inventoryService.getAlerts({ page: 1, size: 200 }),
  })

  const { data: depletedData, isError: depletedError, refetch: depletedRefetch } = useQuery({
    queryKey: queryKeys.inventory.alerts.depleted({ page: 1, size: 200 }),
    queryFn: () => inventoryService.getDepleted({ page: 1, size: 200 }),
  })

  const { data: movementsData, isLoading: movsLoading } = useQuery({
    queryKey: queryKeys.inventory.movements.list(selectedProductId, { page: 1, size: 100 }),
    queryFn: () => inventoryService.getMovements(selectedProductId, { page: 1, size: 100 }),
    enabled: !!selectedProductId,
  })

  const inventory = inventoryData?.data ?? []
  const alerts = alertsData?.data ?? []
  const depleted = depletedData?.data ?? []
  const movements = movementsData?.data ?? []
  const products = productsData?.data ?? []

  const movementForm = useForm<MovementValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: { productId: '', quantity: 1, notes: '' },
  })

  const adjustForm = useForm<AdjustValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { productId: '', adjustmentType: 'POSITIVO', quantity: 1, justification: '', notes: '' },
  })

  const initForm = useForm<InitValues>({
    resolver: zodResolver(initSchema),
    defaultValues: { productId: '', initialStock: 0, minStock: 0, maxStock: 0, notes: '' },
  })

  const reverseForm = useForm<ReverseValues>({
    resolver: zodResolver(reverseSchema),
    defaultValues: { movementId: '', justification: '' },
  })

  const entryMutation = useMutation({
    mutationFn: (data: MovementValues) => inventoryService.registerEntry(data.productId, { quantity: data.quantity, notes: data.notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.inventory.all }); qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard }); toast.success('Entrada registrada'); closeMovement() },
    onError: () => toast.error('Error al registrar entrada'),
  })

  const exitMutation = useMutation({
    mutationFn: (data: MovementValues) => inventoryService.registerExit(data.productId, { quantity: data.quantity, notes: data.notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.inventory.all }); qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard }); toast.success('Salida registrada'); closeMovement() },
    onError: () => toast.error('Error al registrar salida'),
  })

  const returnMutation = useMutation({
    mutationFn: (data: MovementValues) => inventoryService.registerReturn(data.productId, { quantity: data.quantity, notes: data.notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.inventory.all }); qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard }); toast.success('Devolución registrada'); closeMovement() },
    onError: () => toast.error('Error al registrar devolución'),
  })

  const adjustMutation = useMutation({
    mutationFn: (data: AdjustValues) => inventoryService.adjust(data.productId, { adjustmentType: data.adjustmentType, quantity: data.quantity, justification: data.justification, notes: data.notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.inventory.all }); qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard }); toast.success('Ajuste registrado'); setAdjustOpen(false); adjustForm.reset() },
    onError: () => toast.error('Error al registrar ajuste'),
  })

  const initializeMutation = useMutation({
    mutationFn: (data: InitValues) => inventoryService.initialize(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      toast.success('Inventario inicializado')
      setInitOpen(false)
      initForm.reset()
    },
    onError: () => toast.error('Error al inicializar inventario'),
  })

  const reverseMutation = useMutation({
    mutationFn: ({ movementId, justification }: ReverseValues) => inventoryService.reverseMovement(movementId, justification),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      toast.success('Movimiento revertido')
      setReverseOpen(false)
      reverseForm.reset()
    },
    onError: () => toast.error('Error al revertir movimiento'),
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

  const movColumns: Column<MovementResponse>[] = [
    { header: 'Tipo', accessor: (m) => <Badge variant={movementBadgeVariant[m.movementType] ?? 'secondary'}>{movementLabel[m.movementType] ?? m.movementType}</Badge> },
    { header: 'Cantidad', accessor: (m) => <span className="font-mono">{m.quantity}</span> },
    { header: 'Stock Anterior', accessor: (m) => m.previousStock.toString() },
    { header: 'Stock Nuevo', accessor: (m) => <span className="font-medium">{m.newStock}</span> },
    { header: 'Fecha', accessor: (m) => new Date(m.createdAt).toLocaleString() },
    { header: 'Notas', accessor: (m) => <span className="text-sm text-muted-foreground max-w-40 truncate block">{m.notes ?? '—'}</span> },
    {
      header: '', className: 'text-right',
      accessor: (m) => (
        canReverse ? (
        <Button variant="ghost" size="icon" className="size-8" aria-label="Revertir" onClick={() => { reverseForm.setValue('movementId', m.id); reverseForm.setValue('justification', ''); setReverseOpen(true) }}>
          <RotateCcw className="size-4" />
        </Button>
        ) : null
      ),
    },
  ]

  const isPending = entryMutation.isPending || exitMutation.isPending || returnMutation.isPending

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Inventario" description="Control de existencias del inventario." />
      <PageHeader
        title="Inventario"
        description="Control de existencias"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setInitOpen(true)} aria-label="Inicializar inventario">
              <Package className="mr-2 size-4" />
              Inicializar
            </Button>
            {canReverse && (
            <Button variant="outline" onClick={() => setReverseOpen(true)} aria-label="Reversar movimiento">
              <RotateCcw className="mr-2 size-4" />
              Reversar
            </Button>
            )}
            <Button variant="outline" onClick={() => setAdjustOpen(true)}>
              <Scale className="mr-2 size-4" />
              Ajustar
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10"><Package className="size-5 text-primary" /></div>
          <div><p className="text-sm text-muted-foreground">Total Productos</p><p className="text-2xl font-bold">{inventoryData?.pagination?.totalRecords ?? inventory.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20"><AlertTriangle className="size-5 text-amber-600" /></div>
          <div><p className="text-sm text-muted-foreground">Stock Bajo</p><p className="text-2xl font-bold text-amber-600">{alertsData?.pagination?.totalRecords ?? alerts.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20"><ArrowUp className="size-5 text-red-600" /></div>
          <div><p className="text-sm text-muted-foreground">Agotados</p><p className="text-2xl font-bold text-destructive">{depletedData?.pagination?.totalRecords ?? depleted.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20"><ClipboardList className="size-5 text-blue-600" /></div>
          <div><p className="text-sm text-muted-foreground">Stock Normal</p><p className="text-2xl font-bold">{inventoryData?.pagination?.totalRecords != null && alertsData?.pagination?.totalRecords != null && depletedData?.pagination?.totalRecords != null ? inventoryData.pagination.totalRecords - alertsData.pagination.totalRecords - depletedData.pagination.totalRecords : inventory.filter(i => !i.lowStock && !i.depleted).length}</p></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="alerts">Alertas {alerts.length > 0 && `(${alerts.length})`}</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <DataTable
            columns={invColumns}
            data={inventory}
            isLoading={invLoading}
            emptyIcon={Package}
            emptyTitle="Inventario vacío"
            isError={isError}
            onRetry={() => refetch()}
            emptyDescription="No hay productos registrados en inventario"
            keyExtractor={(i) => i.id}
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          {(alertsError || depletedError) ? (
            <Card><CardContent className="py-12"><ErrorState message="Error al cargar alertas de stock" onRetry={() => { alertsRefetch(); depletedRefetch(); }} /></CardContent></Card>
          ) : alerts.length === 0 && depleted.length === 0 ? (
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

        <TabsContent value="movements" className="mt-4">
          <div className="mb-4">
            <Select value={selectedProductId} onValueChange={(v) => setSelectedProductId(v ?? '')}>
              <SelectTrigger className="w-72"><SelectValue placeholder="Selecciona un producto para ver sus movimientos" /></SelectTrigger>
              <SelectContent>
                {products.filter(p => p.status === 'ACTIVO').map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.codigo})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedProductId ? (
            <DataTable
              columns={movColumns}
              data={movements}
              isLoading={movsLoading}
              emptyIcon={ClipboardList}
              emptyTitle="Sin movimientos"
              emptyDescription="Este producto no tiene movimientos registrados"
              keyExtractor={(m) => m.id}
            />
          ) : (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Selecciona un producto para ver sus movimientos</CardContent></Card>
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

      <Dialog open={initOpen} onOpenChange={(o) => { if (!o) { setInitOpen(false); initForm.reset() }}}>
        <DialogContent>
          <DialogHeader><DialogTitle>Inicializar Inventario</DialogTitle><DialogDescription>Configura el inventario inicial de un producto</DialogDescription></DialogHeader>
          <Form {...initForm}>
            <form onSubmit={initForm.handleSubmit((data) => initializeMutation.mutate(data))} className="flex flex-col gap-4">
              <FormField control={initForm.control} name="productId" render={({ field }) => (
                <FormItem><FormLabel>Producto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un producto" /></SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.status === 'ACTIVO').map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.codigo})</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={initForm.control} name="initialStock" render={({ field }) => (
                <FormItem><FormLabel>Stock Inicial</FormLabel><FormControl><Input type="number" min={0} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={initForm.control} name="minStock" render={({ field }) => (
                <FormItem><FormLabel>Stock Mínimo</FormLabel><FormControl><Input type="number" min={0} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={initForm.control} name="maxStock" render={({ field }) => (
                <FormItem><FormLabel>Stock Máximo</FormLabel><FormControl><Input type="number" min={0} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={initForm.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Notas</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => { setInitOpen(false); initForm.reset() }}>Cancelar</Button>
                <Button type="submit" disabled={initializeMutation.isPending}>Inicializar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={reverseOpen} onOpenChange={(o) => { if (!o) { setReverseOpen(false); reverseForm.reset() }}}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reversar Movimiento</DialogTitle><DialogDescription>Ingresa el ID del movimiento y la justificación para revertirlo</DialogDescription></DialogHeader>
          <Form {...reverseForm}>
            <form onSubmit={reverseForm.handleSubmit((data) => reverseMutation.mutate(data))} className="flex flex-col gap-4">
              <FormField control={reverseForm.control} name="movementId" render={({ field }) => (
                <FormItem><FormLabel>ID del Movimiento</FormLabel><FormControl><Input {...field} placeholder="Ingresa el ID del movimiento" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={reverseForm.control} name="justification" render={({ field }) => (
                <FormItem><FormLabel>Justificación</FormLabel><FormControl><Textarea {...field} placeholder="Motivo de la reversión" /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => { setReverseOpen(false); reverseForm.reset() }}>Cancelar</Button>
                <Button type="submit" disabled={reverseMutation.isPending}>{reverseMutation.isPending ? 'Procesando...' : 'Reversar'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
