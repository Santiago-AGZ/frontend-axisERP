import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, Pencil, Ban, Package } from 'lucide-react'
import { toast } from 'sonner'
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
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  codigo: z.string().min(1, 'El código es requerido'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  purchasePrice: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  salePrice: z.number().min(0.01, 'El precio debe ser mayor a 0'),
})

type ProductValues = z.infer<typeof productSchema>

interface ProductItem {
  id: string
  name: string
  codigo: string
  description?: string
  category: { id: string; name: string }
  purchasePrice: number
  salePrice: number
  status: string
}

export function ProductosPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProductItem | null>(null)

  const { data: productsData, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.catalog.products.list({ search, page, size: 20 }),
    queryFn: () => catalogService.listProducts({ search, page, size: 20 }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.catalog.categories.list({ page: 1, size: 200 }),
    queryFn: () => catalogService.listCategories({ page: 1, size: 200 }),
  })

  const categories = categoriesData?.data ?? []

  const createMutation = useMutation({
    mutationFn: (data: ProductValues) => catalogService.createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.catalog.products.all })
      toast.success('Producto creado')
      setOpen(false)
    },
    onError: () => toast.error('Error al crear producto'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductValues }) =>
      catalogService.updateProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.catalog.products.all })
      toast.success('Producto actualizado')
      setOpen(false)
    },
    onError: () => toast.error('Error al actualizar producto'),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => catalogService.deactivateProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.catalog.products.all })
      toast.success('Producto desactivado')
    },
    onError: () => toast.error('Error al desactivar producto'),
  })

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', codigo: '', description: '', categoryId: '', purchasePrice: 0, salePrice: 0 },
  })

  function handleCreate() {
    setEditing(null)
    form.reset({ name: '', codigo: '', description: '', categoryId: '', purchasePrice: 0, salePrice: 0 })
    setOpen(true)
  }

  function handleEdit(product: ProductItem) {
    setEditing(product)
    form.reset({
      name: product.name,
      codigo: product.codigo,
      description: product.description ?? '',
      categoryId: product.category.id,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
    })
    setOpen(true)
  }

  function handleOpenChange(open: boolean) {
    setOpen(open)
    if (!open) { setEditing(null); form.reset() }
  }

  function onSubmit(data: ProductValues) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const products = productsData?.data ?? []
  const pagination = productsData?.pagination ?? null

  const columns: Column<ProductItem>[] = [
    {
      header: 'Código',
      accessor: (p) => <span className="font-mono text-sm">{p.codigo}</span>,
    },
    {
      header: 'Nombre',
      accessor: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      header: 'Categoría',
      accessor: (p) => p.category?.name ?? '—',
    },
    {
      header: 'P. Compra',
      accessor: (p) => `$${p.purchasePrice.toLocaleString()}`,
    },
    {
      header: 'P. Venta',
      accessor: (p) => <span className="font-medium">${p.salePrice.toLocaleString()}</span>,
    },
    {
      header: 'Estado',
      accessor: (p) => <Badge variant={p.status === 'ACTIVO' ? 'default' : 'secondary'}>{p.status}</Badge>,
    },
    {
      header: '',
      className: 'text-right',
      accessor: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" aria-label="Editar" onClick={() => handleEdit(p)}>
            <Pencil className="size-4" />
          </Button>
          {p.status === 'ACTIVO' && (
            <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label="Desactivar" onClick={() => deactivateMutation.mutate(p.id)}>
              <Ban className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Productos"
        description="Catálogo de productos"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            Nuevo Producto
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o código..."
          className="pl-10"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        pagination={pagination ?? undefined}
        onPageChange={setPage}
        emptyIcon={Package}
        emptyTitle="No hay productos"
        emptyDescription={search ? 'No se encontraron productos con ese criterio' : 'Crea el primer producto'}
        emptyAction={!search ? <Button onClick={handleCreate}><Plus className="mr-2 size-4" />Nuevo Producto</Button> : undefined}
        keyExtractor={(p) => p.id}
      />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Actualiza los datos del producto' : 'Registra un nuevo producto'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="codigo" render={({ field }) => (
                  <FormItem><FormLabel>Código</FormLabel><FormControl><Input {...field} disabled={!!editing} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem><FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Selecciona categoría" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                  <FormItem><FormLabel>Precio Compra</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="salePrice" render={({ field }) => (
                  <FormItem><FormLabel>Precio Venta</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editing ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
