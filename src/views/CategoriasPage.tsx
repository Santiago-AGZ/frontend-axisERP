import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, Pencil, Ban, CheckCircle, Tags } from 'lucide-react'
import { toast } from 'sonner'
import { catalogService } from '@/services/catalog'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { SeoHead } from '@/components/shared/seo-head'
import { useAuthStore } from '@/stores/auth'
import { noHTML } from '@/lib/validations'
import { SearchableSelect } from '@/components/shared/searchable-select'
import { extractApiErrorMessage } from '@/lib/axios'

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').refine(noHTML),
  description: z.string().refine(noHTML).optional(),
  parentId: z.string().refine(noHTML).optional(),
})

type CategoryValues = z.infer<typeof categorySchema>

interface CategoryItem {
  id: string
  name: string
  description?: string
  parentId?: string
  status: 'ACTIVA' | 'INACTIVA'
  createdAt: string
}

export function CategoriasPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const canToggleStatus = user?.role === 'ADMIN'
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<{type: 'deactivate'|'reactivate', id: string} | null>(null)

  const { data: categoriesData, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.catalog.categories.list({ search, page, size: 20 }),
    queryFn: () => catalogService.listCategories({ search, page, size: 20 }),
  })

  const { data: allCategories } = useQuery({
    queryKey: queryKeys.catalog.categories.list({ page: 1, size: 200 }),
    queryFn: () => catalogService.listCategories({ page: 1, size: 200 }),
  })

  const categories = categoriesData?.data ?? []
  const pagination = categoriesData?.pagination ?? null

  const createMutation = useMutation({
    mutationFn: (data: CategoryValues) => catalogService.createCategory({
      name: data.name,
      description: data.description || undefined,
      parentId: data.parentId || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.catalog.categories.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      toast.success('Categoría creada')
      setOpen(false)
    },
    onError: (err) => toast.error(extractApiErrorMessage(err) ?? 'Error al crear categoría'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryValues }) =>
      catalogService.updateCategory(id, { name: data.name, description: data.description || undefined, parentId: data.parentId || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.catalog.categories.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      toast.success('Categoría actualizada')
      setOpen(false)
    },
    onError: (err) => toast.error(extractApiErrorMessage(err) ?? 'Error al actualizar categoría'),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => catalogService.deactivateCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.catalog.categories.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      toast.success('Categoría desactivada')
    },
    onError: (err) => toast.error(extractApiErrorMessage(err) ?? 'Error al desactivar categoría'),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => catalogService.reactivateCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.catalog.categories.all })
      qc.invalidateQueries({ queryKey: queryKeys.reports.dashboard })
      toast.success('Categoría activada')
    },
    onError: (err) => toast.error(extractApiErrorMessage(err) ?? 'Error al activar categoría'),
  })

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', parentId: '' },
  })

  function handleCreate() {
    setEditing(null)
    form.reset({ name: '', description: '', parentId: '' })
    setOpen(true)
  }

  function handleEdit(cat: CategoryItem) {
    setEditing(cat)
    form.reset({ name: cat.name, description: cat.description ?? '', parentId: cat.parentId ?? '' })
    setOpen(true)
  }

  function handleOpenChange(open: boolean) {
    setOpen(open)
    if (!open) { setEditing(null); form.reset() }
  }

  function onSubmit(data: CategoryValues) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const parentOptions = (allCategories?.data ?? []).filter((c) => c.status === 'ACTIVA' && c.id !== editing?.id)

  const columns: Column<CategoryItem>[] = [
    {
      header: 'Nombre',
      accessor: (c) => <span className="font-medium">{c.name}</span>,
    },
    {
      header: 'Descripción',
      accessor: (c) => c.description ?? <span className="text-muted-foreground">—</span>,
    },
    {
      header: 'Categoría Padre',
      accessor: (c) => {
        const parent = parentOptions.find(p => p.id === c.parentId)
        return parent?.name ?? <span className="text-muted-foreground">—</span>
      },
    },
    {
      header: 'Estado',
      accessor: (c) => (
        <Badge variant={c.status === 'ACTIVA' ? 'default' : 'secondary'}>{c.status}</Badge>
      ),
    },
    {
      header: '',
      className: 'text-right',
      accessor: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" aria-label="Editar" onClick={() => handleEdit(c)}>
            <Pencil className="size-4" />
          </Button>
          {canToggleStatus && c.status === 'ACTIVA' ? (
            <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label="Desactivar" onClick={() => setConfirmAction({type:'deactivate', id: c.id})}>
              <Ban className="size-4" />
            </Button>
          ) : canToggleStatus && (
            <Button variant="ghost" size="icon" className="size-8 text-emerald-600" aria-label="Activar" onClick={() => setConfirmAction({type:'reactivate', id: c.id})}>
              <CheckCircle className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Categorías" description="Clasificación de productos por categorías." />
      <PageHeader
        title="Categorías"
        description="Clasificación de productos"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            Nueva Categoría
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar categorías..."
          className="pl-10"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          aria-label="Buscar categorías"
        />
      </div>

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        pagination={pagination ?? undefined}
        onPageChange={setPage}
        emptyIcon={Tags}
        emptyTitle="No hay categorías"
        emptyDescription={search ? 'No se encontraron categorías con ese criterio' : 'Crea la primera categoría para clasificar productos'}
        emptyAction={
          !search ? <Button onClick={handleCreate}><Plus className="mr-2 size-4" />Nueva Categoría</Button> : undefined
        }
        keyExtractor={(c) => c.id}
      />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Actualiza los datos de la categoría' : 'Registra una nueva categoría'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría Padre</FormLabel>
                    <SearchableSelect
                      options={[
                        { value: '', label: 'Ninguna (categoría raíz)' },
                        ...parentOptions.map(c => ({ value: c.id, label: c.name })),
                      ]}
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      placeholder="Ninguna (categoría raíz)"
                      notFound="No se encontraron categorías"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editing ? 'Actualizar categoría' : 'Crear categoría'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => { if (!open) setConfirmAction(null) }}
        onConfirm={() => {
          if (confirmAction?.type === 'deactivate') deactivateMutation.mutate(confirmAction.id)
          else if (confirmAction?.type === 'reactivate') reactivateMutation.mutate(confirmAction.id)
          setConfirmAction(null)
        }}
        title={confirmAction?.type === 'deactivate' ? 'Desactivar Categoría' : 'Reactivar Categoría'}
        description={confirmAction?.type === 'deactivate' ? '¿Estás seguro de que deseas desactivar esta categoría? Los productos asociados no se verán afectados.' : '¿Estás seguro de que deseas reactivar esta categoría? Volverá a estar disponible para clasificar productos.'}
        confirmText={confirmAction?.type === 'deactivate' ? 'Desactivar' : 'Reactivar'}
        variant={confirmAction?.type === 'deactivate' ? 'destructive' : 'default'}
        isLoading={confirmAction?.type === 'deactivate' ? deactivateMutation.isPending : reactivateMutation.isPending}
      />
    </div>
  )
}