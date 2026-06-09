import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import type { CreateUserRequest, UpdateUserRequest } from '@/types/auth'

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => authApi.getMe().then(r => r.data), staleTime: 30000 })
}

export function useUsers(params: { page?: number; size?: number } = {}) {
  return useQuery({ queryKey: ['users', params], queryFn: () => authApi.listUsers(params).then(r => r.data), staleTime: 30000 })
}

export function useUser(id: string) {
  return useQuery({ queryKey: ['users', id], queryFn: () => authApi.getUser(id).then(r => r.data), enabled: !!id, staleTime: 30000 })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserRequest) => authApi.createUser(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateUserRequest) => authApi.updateUser(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['users', id] })
    },
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => authApi.deactivateUser(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useReactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => authApi.reactivateUser(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => authApi.deleteUser(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: () => authApi.listRoles().then(r => r.data), staleTime: 30000 })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description: string }) => authApi.createRole(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useUpdateRole(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; description?: string }) => authApi.updateRole(id, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => authApi.deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function usePermissions() {
  return useQuery({ queryKey: ['permissions'], queryFn: () => authApi.listPermissions().then(r => r.data), staleTime: 30000 })
}

export function useRolePermissions(roleId: string) {
  return useQuery({ queryKey: ['roles', roleId, 'permissions'], queryFn: () => authApi.getRolePermissions(roleId).then(r => r.data), enabled: !!roleId, staleTime: 30000 })
}

export function useAssignPermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      authApi.assignPermissions(roleId, permissionIds),
    onSuccess: (_, { roleId }) => qc.invalidateQueries({ queryKey: ['roles', roleId, 'permissions'] }),
  })
}

export function useAuditLogs(params: { userId?: string; action?: string; entityType?: string; page?: number; size?: number } = {}) {
  return useQuery({ queryKey: ['audit-logs', params], queryFn: () => authApi.getAuditLogs(params).then(r => r.data), staleTime: 30000 })
}
