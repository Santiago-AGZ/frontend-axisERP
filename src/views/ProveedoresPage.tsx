import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, Pencil, Ban, CheckCircle, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { purchaseService, type SupplierResponse } from '@/services/purchase'
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
import { SeoHead } from '@/components/shared/seo-head'

const noHTML = (v: string) => !/[<>&"']/.test(v)
const supplierSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').refine(noHTML),
  nit: z.string().min(1, 'El NIT es requerido').refine(noHTML),
  phone: z.string().refine(noHTML).optional(),
  email: z.string().email('Email inválido').refine(noHTML).optional().or(z.literal('')),
  address: z.string().refine(noHTML).optional(),
})

type SupplierValues = z.infer<typeof supplierSchema>

export function ProveedoresPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SupplierResponse | null>(null)
  const [confirmAction, setConfirmAction] = useState<{type: 'deactivate'|'reactivate', id: string} | null>(null)

  const { data: suppliersData, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.purchases.suppliers.list({ search, page, size: 20 }),
    queryFn: () => purchaseService.listSuppliers({ search, page, size: 20 }),
  })

  const createMutation = useMutation({
    mutationFn: (data: SupplierValues) => purchaseService.createSupplier({
      name: data.name,
      nit: data.nit,
      codigo: '',
      phone: data.phone || undefined,
      email: data.email || undefined,
      address: data.address || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.purchases.suppliers.all })
      toast.success('Proveedor creado')
      setOpen(false)
    },
    onError: () => toast.error('Error al crear proveedor'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierValues }) =>
      purchaseService.updateSupplier(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.purchases.suppliers.all })
      toast.success('Proveedor actualizado')
      setOpen(false)
    },
    onError: () => toast.error('Error al actualizar proveedor'),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => purchaseService.deactivateSupplier(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.purchases.suppliers.all })
      toast.success('Proveedor desactivado')
    },
    onError: () => toast.error('Error al desactivar proveedor'),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => purchaseService.reactivateSupplier(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.purchases.suppliers.all })
      toast.success('Proveedor activado')
    },
    onError: () => toast.error('Error al activar proveedor'),
  })

  const form = useForm<SupplierValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: '', nit: '', phone: '', email: '', address: '' },
  })

  function handleCreate() {
    setEditing(null)
    form.reset({ name: '', nit: '', phone: '', email: '', address: '' })
    setOpen(true)
  }

  function handleEdit(supplier: SupplierResponse) {
    setEditing(supplier)
    form.reset({
      name: supplier.name,
      nit: supplier.nit,
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
    })
    setOpen(true)
  }

  function handleOpenChange(open: boolean) {
    setOpen(open)
    if (!open) { setEditing(null); form.reset() }
  }

  function onSubmit(data: SupplierValues) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const suppliers = suppliersData?.data ?? []
  const pagination = suppliersData?.pagination ?? null

  const columns: Column<SupplierResponse>[] = [
    {
      header: 'Nombre',
      accessor: (s) => <span className="font-medium">{s.name}</span>,
    },
    {
      header: 'NIT',
      accessor: (s) => <span className="font-mono text-sm">{s.nit}</span>,
    },
    {
      header: 'Email',
      accessor: (s) => s.email || <span className="text-muted-foreground">—</span>,
    },
    {
      header: 'Teléfono',
      accessor: (s) => s.phone || <span className="text-muted-foreground">—</span>,
    },
    {
      header: 'Estado',
      accessor: (s) => <Badge variant={s.status === 'ACTIVO' ? 'default' : 'secondary'}>{s.status}</Badge>,
    },
    {
      header: '',
      className: 'text-right',
      accessor: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" aria-label="Editar" onClick={() => handleEdit(s)}>
            <Pencil className="size-4" />
          </Button>
          {s.status === 'ACTIVO' && (
            <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label="Desactivar" onClick={() => setConfirmAction({type:'deactivate', id: s.id})}>
              <Ban className="size-4" />
            </Button>
          )}
          {s.status === 'INACTIVO' && (
            <Button variant="ghost" size="icon" className="size-8 text-emerald-600" aria-label="Activar proveedor" onClick={() => setConfirmAction({type:'reactivate', id: s.id})}>
              <CheckCircle className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Proveedores" description="Gestión de proveedores del sistema." />
      <PageHeader
        title="Proveedores"
        description="Gestión de proveedores"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            Nuevo Proveedor
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o NIT..."
          className="pl-10"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        pagination={pagination ?? undefined}
        onPageChange={setPage}
        emptyIcon={Truck}
        emptyTitle="No hay proveedores"
        emptyDescription={search ? 'No se encontraron proveedores' : 'Registra el primer proveedor'}
        emptyAction={!search ? <Button onClick={handleCreate}><Plus className="mr-2 size-4" />Nuevo Proveedor</Button> : undefined}
        keyExtractor={(s) => s.id}
      />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Actualiza los datos del proveedor' : 'Registra un nuevo proveedor'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="nit" render={({ field }) => (
                  <FormItem><FormLabel>NIT</FormLabel><FormControl><Input {...field} disabled={!!editing} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editing ? 'Actualizar proveedor' : 'Crear proveedor'}
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
        title={confirmAction?.type === 'deactivate' ? 'Desactivar Proveedor' : 'Reactivar Proveedor'}
        description={confirmAction?.type === 'deactivate' ? '¿Estás seguro de que deseas desactivar este proveedor? No podrá recibir nuevas compras.' : '¿Estás seguro de que deseas reactivar este proveedor? Volverá a estar disponible para compras.'}
        confirmText={confirmAction?.type === 'deactivate' ? 'Desactivar' : 'Reactivar'}
        variant={confirmAction?.type === 'deactivate' ? 'destructive' : 'default'}
        isLoading={confirmAction?.type === 'deactivate' ? deactivateMutation.isPending : reactivateMutation.isPending}
      />
    </div>
  )
}