import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { LoginPage } from '@/views/LoginPage'
import { ResetPasswordPage } from '@/views/ResetPasswordPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleGuard } from '@/components/shared/role-guard'
import { Skeleton } from '@/components/ui/skeleton'

const DashboardPage = lazy(() => import('@/views/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ClientesPage = lazy(() => import('@/views/ClientesPage').then((m) => ({ default: m.ClientesPage })))
const ProductosPage = lazy(() => import('@/views/ProductosPage').then((m) => ({ default: m.ProductosPage })))
const UsuariosPage = lazy(() => import('@/views/UsuariosPage').then((m) => ({ default: m.UsuariosPage })))
const CategoriasPage = lazy(() => import('@/views/CategoriasPage').then((m) => ({ default: m.CategoriasPage })))
const FacturasPage = lazy(() => import('@/views/FacturasPage').then((m) => ({ default: m.FacturasPage })))
const ReportesPage = lazy(() => import('@/views/ReportesPage').then((m) => ({ default: m.ReportesPage })))
const VentasPage = lazy(() => import('@/views/VentasPage').then((m) => ({ default: m.VentasPage })))
const InventarioPage = lazy(() => import('@/views/InventarioPage').then((m) => ({ default: m.InventarioPage })))
const ProveedoresPage = lazy(() => import('@/views/ProveedoresPage').then((m) => ({ default: m.ProveedoresPage })))
const ComprasPage = lazy(() => import('@/views/ComprasPage').then((m) => ({ default: m.ComprasPage })))
const AuditLogPage = lazy(() => import('@/views/AuditLogPage'))

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      }
    >
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
      { index: true, element: <LazyPage><DashboardPage /></LazyPage> },
      {
        path: 'clientes',
        element: <LazyPage><RoleGuard allowedRoles={['ADMIN', 'VENDEDOR']}><ClientesPage /></RoleGuard></LazyPage>,
      },
      {
        path: 'productos',
        element: <LazyPage><RoleGuard allowedRoles={['ADMIN', 'INVENTARIO', 'VENDEDOR']}><ProductosPage /></RoleGuard></LazyPage>,
      },
      {
        path: 'categorias',
        element: <LazyPage><RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}><CategoriasPage /></RoleGuard></LazyPage>,
      },
      {
        path: 'usuarios',
        element: <LazyPage><RoleGuard allowedRoles={['ADMIN']}><UsuariosPage /></RoleGuard></LazyPage>,
      },
      {
        path: 'ventas',
        element: <LazyPage><RoleGuard allowedRoles={['ADMIN', 'VENDEDOR']}><VentasPage /></RoleGuard></LazyPage>,
      },
      {
        path: 'inventario',
        element: <LazyPage><RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}><InventarioPage /></RoleGuard></LazyPage>,
      },
      {
        path: 'proveedores',
        element: <LazyPage><RoleGuard allowedRoles={['ADMIN']}><ProveedoresPage /></RoleGuard></LazyPage>,
      },
      {
        path: 'facturas',
        element: <LazyPage><RoleGuard allowedRoles={['ADMIN', 'VENDEDOR']}><FacturasPage /></RoleGuard></LazyPage>,
      },
      {
        path: 'reportes',
        element: <LazyPage><RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}><ReportesPage /></RoleGuard></LazyPage>,
      },
      {
        path: 'compras',
        element: <LazyPage><RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}><ComprasPage /></RoleGuard></LazyPage>,
      },
      {
        path: 'auditoria',
        element: <LazyPage><RoleGuard allowedRoles={['ADMIN']}><AuditLogPage /></RoleGuard></LazyPage>,
      },
    ],
  },
])
