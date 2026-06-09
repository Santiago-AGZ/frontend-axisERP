import { api } from "@/lib/axios";
import type {
  Profile,
  Role,
  Permission,
  AuditLog,
  PaginatedResponse,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  LoginResponse,
} from "@/types/auth";

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get<Profile>("/usuarios/me"),

  listUsers: (params: { page?: number; size?: number }) =>
    api.get<PaginatedResponse<UserResponse>>("/usuarios", { params }),

  getUser: (id: string) => api.get<UserResponse>(`/usuarios/${id}`),

  createUser: (data: CreateUserRequest) =>
    api.post<UserResponse>("/usuarios", data),

  updateUser: (id: string, data: UpdateUserRequest) =>
    api.put<UserResponse>(`/usuarios/${id}`, data),

  deactivateUser: (id: string) =>
    api.patch<UserResponse>(`/usuarios/${id}/desactivar`),

  reactivateUser: (id: string) =>
    api.patch<UserResponse>(`/usuarios/${id}/reactivar`),

  deleteUser: (id: string) => api.delete<UserResponse>(`/usuarios/${id}`),

  adminResetPassword: (id: string) =>
    api.post(`/usuarios/${id}/reset-password`),

  listRoles: () => api.get<Role[]>("/roles"),

  createRole: (data: { name: string; description: string }) =>
    api.post<Role>("/roles", data),

  updateRole: (id: string, data: { name?: string; description?: string }) =>
    api.put<Role>(`/roles/${id}`, data),

  deleteRole: (id: string) => api.delete(`/roles/${id}`),

  listPermissions: () => api.get<Permission[]>("/permissions"),

  getRolePermissions: (roleId: string) =>
    api.get<Permission[]>(`/roles/${roleId}/permissions`),

  assignPermissions: (roleId: string, permissionIds: string[]) =>
    api.post(`/roles/${roleId}/permissions`, { permissionIds }),

  removePermission: (roleId: string, permId: string) =>
    api.delete(`/roles/${roleId}/permissions/${permId}`),

  getAuditLogs: (params: {
    userId?: string;
    action?: string;
    entityType?: string;
    page?: number;
    size?: number;
  }) => api.get<PaginatedResponse<AuditLog>>("/audit-log", { params }),
};
