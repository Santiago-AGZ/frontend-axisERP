import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/api'

export function useRoleAccess(allowedRoles: UserRole[]): boolean {
  const user = useAuthStore((state) => state.user)
  if (!user) return false
  return allowedRoles.includes(user.role as UserRole)
}
