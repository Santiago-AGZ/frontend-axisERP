import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, Pencil, Ban, Users } from 'lucide-react'
import { toast } from 'sonner'
import { salesService, type CustomerResponse } from '@/services/sales'
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

const customerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  codigo: z.string().min(1, 'El código es requerido'),
  documentType: z.string().min(1, 'El tipo de documento es requerido'),
  documentNumber: z.string().min(1, 'El número es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type CustomerValues = z.infer<typeof customerSchema>

export function ClientesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CustomerResponse | null>(null)

  const { data: customersData, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.sales.customers.list({ search, page, size: 20 }),
    queryFn: () => salesService.listCustomers({ search, page, size: 20 }),
  })

  const createMutation = useMutation({
    mutationFn: (data: CustomerValues) => salesService.createCustomer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sales.customers.all })
      toast.success('Cliente creado')
      setOpen(false)
    },
    onError: () => toast.error('Error al crear cliente'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerValues }) =>
      salesService.updateCustomer(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sales.customers.all })
      toast.success('Cliente actualizado')
      setOpen(false)
    },
    onError: () => toast.error('Error al actualizar cliente'),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => salesService.deactivateCustomer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sales.customers.all })
      toast.success('Cliente desactivado')
    },
    onError: () => toast.error('Error al desactivar cliente'),
  })

  const form = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', codigo: '', documentType: 'CC', documentNumber: '', email: '', phone: '', address: '' },
  })

  function handleCreate() {
    setEditing(null)
    form.reset({ name: '', codigo: '', documentType: 'CC', documentNumber: '', email: '', phone: '', address: '' })
    setOpen(true)
  }

  function handleEdit(customer: CustomerResponse) {
    setEditing(customer)
    form.reset({
      name: customer.name,
      codigo: customer.codigo,
      documentType: customer.documentType,
      documentNumber: customer.documentNumber,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
    })
    setOpen(true)
  }

  function handleOpenChange(open: boolean) {
    setOpen(open)
    if (!open) { setEditing(null); form.reset() }
  }

  function onSubmit(data: CustomerValues) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const customers = customersData?.data ?? []
  const pagination = customersData?.pagination ?? null

  const columns: Column<CustomerResponse>[] = [
    {
      header: 'Nombre',
      accessor: (c) => <span className="font-medium">{c.name}</span>,
    },
    {
      header: 'Documento',
      accessor: (c) => `${c.documentType} ${c.documentNumber}`,
    },
    {
      header: 'Email',
      accessor: (c) => c.email || <span className="text-muted-foreground">—</span>,
    },
    {
      header: 'Teléfono',
      accessor: (c) => c.phone || <span className="text-muted-foreground">—</span>,
    },
    {
      header: 'Estado',
      accessor: (c) => <Badge variant={c.status === 'ACTIVO' ? 'default' : 'secondary'}>{c.status}</Badge>,
    },
    {
      header: '',
      className: 'text-right',
      accessor: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" aria-label="Editar" onClick={() => handleEdit(c)}>
            <Pencil className="size-4" />
          </Button>
          {c.status === 'ACTIVO' && (
            <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label="Desactivar" onClick={() => deactivateMutation.mutate(c.id)}>
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
        title="Clientes"
        description="Gestión de clientes"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            Nuevo Cliente
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, documento o teléfono..."
          className="pl-10"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        pagination={pagination ?? undefined}
        onPageChange={setPage}
        emptyIcon={Users}
        emptyTitle="No hay clientes"
        emptyDescription={search ? 'No se encontraron clientes con ese criterio' : 'Registra el primer cliente'}
        emptyAction={!search ? <Button onClick={handleCreate}><Plus className="mr-2 size-4" />Nuevo Cliente</Button> : undefined}
        keyExtractor={(c) => c.id}
      />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Actualiza los datos del cliente' : 'Registra un nuevo cliente'}
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
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="documentType" render={({ field }) => (
                  <FormItem><FormLabel>Tipo Documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula</SelectItem>
                        <SelectItem value="NIT">NIT</SelectItem>
                        <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                        <SelectItem value="CE">Cédula Extranjería</SelectItem>
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="documentNumber" render={({ field }) => (
                  <FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
