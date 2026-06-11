import { Suspense, useEffect } from 'react'
import { createBrowserRouter, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { useAuthStore } from '@/stores/auth'
import { LoginPage } from '@/views/LoginPage'
import { ResetPasswordPage } from '@/views/ResetPasswordPage'
import { DashboardPage } from '@/views/DashboardPage'
import { ClientesPage } from '@/views/ClientesPage'
import { ProductosPage } from '@/views/ProductosPage'
import { UsuariosPage } from '@/views/UsuariosPage'
import { CategoriasPage } from '@/views/CategoriasPage'
import { FacturasPage } from '@/views/FacturasPage'
import { ReportesPage } from '@/views/ReportesPage'
import { VentasPage } from '@/views/VentasPage'
import { InventarioPage } from '@/views/InventarioPage'
import { ProveedoresPage } from '@/views/ProveedoresPage'
import { ComprasPage } from '@/views/ComprasPage'
import AuditLogPage from '@/views/AuditLogPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleGuard } from '@/components/shared/role-guard'
import { Skeleton } from '@/components/ui/skeleton'

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12"><div className="flex flex-col gap-4 w-full max-w-md"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /><Skeleton className="h-32 w-full" /></div></div>}>
      {children}
    </Suspense>
  )
}

function HomeRedirect() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    const role = user?.role
    if (role === 'ADMIN') {
      // stay on dashboard (rendered by router)
    } else if (role === 'VENDEDOR') {
      navigate('/ventas', { replace: true })
    } else if (role === 'INVENTARIO') {
      navigate('/inventario', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, user?.role])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  const role = user?.role
  if (role === 'VENDEDOR' || role === 'INVENTARIO') return null // waiting for redirect

  return <DashboardPage />
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        path: 'clientes',
        element: <RoleGuard allowedRoles={['ADMIN', 'VENDEDOR']}><ClientesPage /></RoleGuard>,
      },
      {
        path: 'productos',
        element: <RoleGuard allowedRoles={['ADMIN', 'INVENTARIO', 'VENDEDOR']}><ProductosPage /></RoleGuard>,
      },
      {
        path: 'categorias',
        element: <RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}><CategoriasPage /></RoleGuard>,
      },
      {
        path: 'usuarios',
        element: <RoleGuard allowedRoles={['ADMIN']}><UsuariosPage /></RoleGuard>,
      },
      {
        path: 'ventas',
        element: <RoleGuard allowedRoles={['ADMIN', 'VENDEDOR']}><VentasPage /></RoleGuard>,
      },
      {
        path: 'inventario',
        element: <RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}><InventarioPage /></RoleGuard>,
      },
      {
        path: 'proveedores',
        element: <RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}><ProveedoresPage /></RoleGuard>,
      },
      {
        path: 'facturas',
        element: <RoleGuard allowedRoles={['ADMIN', 'VENDEDOR']}><FacturasPage /></RoleGuard>,
      },
      {
        path: 'reportes',
        element: <RoleGuard allowedRoles={['ADMIN']}><ReportesPage /></RoleGuard>,
      },
      {
        path: 'compras',
        element: <RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}><ComprasPage /></RoleGuard>,
      },
      {
        path: 'auditoria',
        element: <RoleGuard allowedRoles={['ADMIN']}><AuditLogPage /></RoleGuard>,
      },
    ],
  },
])
