export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
    users: {
      all: ['users'] as const,
      list: (params?: Record<string, unknown>) => ['users', 'list', params] as const,
      detail: (id: string) => ['users', id] as const,
    },
    roles: {
      all: ['roles'] as const,
      detail: (id: string) => ['roles', id] as const,
      permissions: (roleId: string) => ['roles', roleId, 'permissions'] as const,
    },
    permissions: {
      all: ['permissions'] as const,
    },
    auditLogs: {
      all: ['audit-logs'] as const,
      list: (params?: Record<string, unknown>) => ['audit-logs', params] as const,
    },
  },
  catalog: {
    products: {
      all: ['products'] as const,
      list: (params?: Record<string, unknown>) => ['products', 'list', params] as const,
      detail: (id: string) => ['products', id] as const,
    },
    categories: {
      all: ['categories'] as const,
      list: (params?: Record<string, unknown>) => ['categories', 'list', params] as const,
      detail: (id: string) => ['categories', id] as const,
      tree: ['categories', 'tree'] as const,
    },
    barcodes: {
      list: (productId: string) => ['products', productId, 'barcodes'] as const,
    },
  },
  inventory: {
    all: ['inventory'] as const,
    list: (params?: Record<string, unknown>) => ['inventory', params] as const,
    product: (productId: string) => ['inventory', productId] as const,
    alerts: {
      all: ['inventory', 'alerts'] as const,
      list: (params?: Record<string, unknown>) => ['inventory', 'alerts', params] as const,
      depleted: (params?: Record<string, unknown>) => ['inventory', 'alerts', 'depleted', params] as const,
    },
    movements: {
      list: (productId: string, params?: Record<string, unknown>) => ['inventory', 'movements', productId, params] as const,
    },
  },
  sales: {
    customers: {
      all: ['customers'] as const,
      list: (params?: Record<string, unknown>) => ['customers', 'list', params] as const,
      detail: (id: string) => ['customers', id] as const,
      history: (customerId: string) => ['customers', customerId, 'history'] as const,
    },
    sales: {
      all: ['sales'] as const,
      list: (params?: Record<string, unknown>) => ['sales', 'list', params] as const,
      detail: (id: string) => ['sales', id] as const,
    },
    invoices: {
      detail: (id: string) => ['invoices', id] as const,
      bySale: (saleId: string) => ['invoices', 'by-sale', saleId] as const,
    },
    auditLogs: {
      all: ['sales', 'audit-logs'] as const,
      list: (params?: Record<string, unknown>) => ['sales', 'audit-logs', params] as const,
    },
  },
  purchases: {
    suppliers: {
      all: ['suppliers'] as const,
      list: (params?: Record<string, unknown>) => ['suppliers', 'list', params] as const,
      detail: (id: string) => ['suppliers', id] as const,
    },
    purchases: {
      all: ['purchases'] as const,
      list: (params?: Record<string, unknown>) => ['purchases', 'list', params] as const,
      detail: (id: string) => ['purchases', id] as const,
    },
  },
  reports: {
    dashboard: ['reports', 'dashboard'] as const,
    sales: (params?: Record<string, unknown>) => ['reports', 'sales', params] as const,
    inventory: (params?: Record<string, unknown>) => ['reports', 'inventory', params] as const,
    topProducts: (params?: Record<string, unknown>) => ['reports', 'top-products', params] as const,
    frequentCustomers: (params?: Record<string, unknown>) => ['reports', 'frequent-customers', params] as const,
  },
}
