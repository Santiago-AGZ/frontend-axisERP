import { useState, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'

const hideBreadcrumbs = new Set(['/'])

export function AppLayout() {
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const showBreadcrumbs = !hideBreadcrumbs.has(pathname)

  return (
    <div className="flex min-h-dvh">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="flex flex-1 flex-col min-w-0">
        <Header onToggleSidebar={toggleSidebar} />
        <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            {showBreadcrumbs && <Breadcrumbs />}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
