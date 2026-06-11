import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, Pencil, Ban, CheckCircle, Trash2, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth'
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
import { SeoHead } from '@/components/shared/seo-head'
const noHTML = (v: string) => !/[<>&"']/.test(v)
const userFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255).refine(noHTML),
  email: z.string().email('Email inválido').refine(noHTML),
  role: z.string().min(1, 'El rol es requerido').refine(noHTML),
})

type UserFormValues = z.infer<typeof userFormSchema>

const roleColors: Record<string, string> = {
  ADMIN: 'text-red-600',
  VENDEDOR: 'text-blue-600',
  INVENTARIO: 'text-amber-600',
}

const statusBadge: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  ACTIVO: 'default',
  INACTIVO: 'secondary',
  PENDIENTE: 'outline',
  ELIMINADO: 'destructive',
}

interface UserListItem {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export function UsuariosPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UserListItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'deactivate' | 'delete'; userId: string } | null>(null)

  const confirmForm = useForm<{ password: string }>({
    defaultValues: { password: '' },
  })

  const { data: roles } = useQuery({
    queryKey: queryKeys.auth.roles.all,
    queryFn: () => authService.listRoles(),
  })

  const { data: usersData, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.auth.users.list({ search, page, size: pageSize }),
    queryFn: () => authService.listUsers({ search, page, size: pageSize }),
  })

  const createMutation = useMutation({
    mutationFn: (data: UserFormValues) => authService.createUser({
      name: data.name,
      email: data.email,
      role: data.role,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.users.all })
      toast.success('Usuario creado')
      setOpen(false)
    },
    onError: () => toast.error('Error al crear usuario'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserFormValues }) =>
      authService.updateUser(id, { name: data.name, email: data.email, role: data.role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.users.all })
      toast.success('Usuario actualizado')
      setOpen(false)
    },
    onError: () => toast.error('Error al actualizar usuario'),
  })

  const deactivateMutation = useMutation({
    mutationFn: ({ id, currentPassword }: { id: string; currentPassword: string }) =>
      authService.deactivateUser(id, currentPassword),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.users.all })
      toast.success('Usuario desactivado')
      setConfirmAction(null)
    },
    onError: () => toast.error('Error al desactivar usuario'),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => authService.reactivateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.users.all })
      toast.success('Usuario reactivado')
    },
    onError: () => toast.error('Error al reactivar usuario'),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, currentPassword }: { id: string; currentPassword: string }) =>
      authService.deleteUser(id, currentPassword),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.users.all })
      toast.success('Usuario eliminado')
      setConfirmAction(null)
    },
    onError: () => toast.error('Error al eliminar usuario'),
  })

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: '', email: '', role: '' },
  })

  function handleCreate() {
    setEditing(null)
    form.reset({ name: '', email: '', role: '' })
    setOpen(true)
  }

  function handleEdit(user: UserListItem) {
    setEditing(user)
    form.reset({ name: user.name, email: user.email, role: user.role })
    setOpen(true)
  }

  function handleOpenChange(open: boolean) {
    setOpen(open)
    if (!open) {
      setEditing(null)
      form.reset()
    }
  }

  function onSubmit(data: UserFormValues) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const users = usersData?.data ?? []
  const pagination = usersData?.pagination ?? null

  const columns: Column<UserListItem>[] = [
    {
      header: 'Nombre',
      accessor: (u) => <span className="font-medium">{u.name}</span>,
    },
    {
      header: 'Email',
      accessor: (u) => u.email,
    },
    {
      header: 'Rol',
      accessor: (u) => (
        <span className={`text-sm font-medium ${roleColors[u.role] ?? ''}`}>
          {u.role}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: (u) => <Badge variant={statusBadge[u.status] ?? 'outline'}>{u.status}</Badge>,
    },
    {
      header: 'Creado',
      accessor: (u) => (
        <span className="text-sm text-muted-foreground">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: '',
      className: 'text-right',
      accessor: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" aria-label="Editar" onClick={() => handleEdit(u)}>
            <Pencil className="size-4" />
          </Button>
          {u.status === 'ACTIVO' && (
            <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label="Desactivar" onClick={() => { setConfirmAction({ type: 'deactivate', userId: u.id }); confirmForm.reset({ password: '' }) }}>
              <Ban className="size-4" />
            </Button>
          )}
          {(u.status === 'INACTIVO' || u.status === 'PENDIENTE') && (
            <Button variant="ghost" size="icon" className="size-8 text-emerald-600" aria-label="Reactivar" onClick={() => reactivateMutation.mutate(u.id)}>
              <CheckCircle className="size-4" />
            </Button>
          )}
          {u.status !== 'ELIMINADO' && (
            <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label="Eliminar" onClick={() => { setConfirmAction({ type: 'delete', userId: u.id }); confirmForm.reset({ password: '' }) }}>
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Usuarios" description="Gestión de usuarios del sistema AxisERP." />
      <PageHeader
        title="Usuarios"
        description="Gestión de usuarios del sistema"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            Nuevo Usuario
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o rol..."
          className="pl-10"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        pagination={pagination ?? undefined}
        onPageChange={setPage}
        emptyIcon={UserCog}
        emptyTitle="No hay usuarios"
        emptyDescription={search ? 'No se encontraron usuarios con ese criterio' : 'Crea el primer usuario para comenzar'}
        emptyAction={
          !search ? <Button onClick={handleCreate}><Plus className="mr-2 size-4" />Nuevo Usuario</Button> : undefined
        }
        keyExtractor={(u) => u.id}
      />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Actualiza los datos del usuario' : 'Registra un nuevo usuario en el sistema'}
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles?.map((r) => (
                          <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editing ? 'Actualizar usuario' : 'Crear usuario'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction?.type === 'deactivate' ? 'Desactivar usuario' : 'Eliminar usuario'}</DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'deactivate'
                ? 'Esta acción desactivará al usuario. Ingresa tu contraseña para confirmar.'
                : 'Esta acción eliminará permanentemente al usuario. Ingresa tu contraseña para confirmar.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={confirmForm.handleSubmit((data) => {
            if (!confirmAction) return
            if (confirmAction.type === 'deactivate') {
              deactivateMutation.mutate({ id: confirmAction.userId, currentPassword: data.password })
            } else {
              deleteMutation.mutate({ id: confirmAction.userId, currentPassword: data.password })
            }
          })} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tu contraseña</label>
              <Input type="password" {...confirmForm.register('password', { required: true })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConfirmAction(null)}>Cancelar</Button>
              <Button type="submit" variant="destructive" disabled={deactivateMutation.isPending || deleteMutation.isPending}>
                {deactivateMutation.isPending || deleteMutation.isPending ? 'Procesando...' : confirmAction?.type === 'deactivate' ? 'Desactivar' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
