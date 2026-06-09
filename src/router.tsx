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
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleGuard } from '@/components/shared/role-guard'

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
      { path: 'clientes', element: <ClientesPage /> },
      { path: 'productos', element: <ProductosPage /> },
      {
        path: 'categorias',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}>
            <CategoriasPage />
          </RoleGuard>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <UsuariosPage />
          </RoleGuard>
        ),
      },
      {
        path: 'ventas',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'VENDEDOR']}>
            <VentasPage />
          </RoleGuard>
        ),
      },
      {
        path: 'inventario',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}>
            <InventarioPage />
          </RoleGuard>
        ),
      },
      {
        path: 'proveedores',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}>
            <ProveedoresPage />
          </RoleGuard>
        ),
      },
      {
        path: 'facturas',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'VENDEDOR']}>
            <FacturasPage />
          </RoleGuard>
        ),
      },
      {
        path: 'reportes',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <ReportesPage />
          </RoleGuard>
        ),
      },
      {
        path: 'compras',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'INVENTARIO']}>
            <ComprasPage />
          </RoleGuard>
        ),
      },
    ],
  },
])
