import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/api'
import type { ReactNode } from 'react'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  fallback?: ReactNode
  children: ReactNode
}

export function RoleGuard({ allowedRoles, fallback, children }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user)

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return fallback ?? null
  }

  return children
}
