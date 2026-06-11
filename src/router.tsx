import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
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
      { index: true, element: <DashboardPage /> },
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
