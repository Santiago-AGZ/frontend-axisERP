import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'

const hideBreadcrumbs = ['/']

export function AppLayout() {
  const { pathname } = useLocation()
  const showBreadcrumbs = !hideBreadcrumbs.includes(pathname)

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            {showBreadcrumbs && <Breadcrumbs />}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
