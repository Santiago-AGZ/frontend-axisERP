import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import { salesService } from '@/services/sales'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { SeoHead } from '@/components/shared/seo-head'
import { Badge } from '@/components/ui/badge'
import { ClipboardList } from 'lucide-react'
import { actionLabel, entityLabel, actionBadge } from '@/lib/labels'

interface AuditLogRow {
  id: string
  timestamp: string
  source: string
  userId?: string
  userName?: string
  action: string
  entityType: string
  entityId?: string
  ipAddress?: string
  userAgent?: string
}

export default function AuditLogPage() {
  const page = 1

  const authAudit = useQuery({
    queryKey: queryKeys.auth.auditLogs.list({ page, size: 50 }),
    queryFn: () => authService.getAuditLogs({ page, size: 50 }),
    staleTime: 30000,
  })

  const salesAudit = useQuery({
    queryKey: queryKeys.sales.auditLogs.list({ page, size: 50 }),
    queryFn: () => salesService.getAuditLogs({ page, size: 50 }),
    staleTime: 30000,
  })

  const isLoading = authAudit.isLoading || salesAudit.isLoading
  const isError = authAudit.isError && salesAudit.isError

  const refetch = () => { authAudit.refetch(); salesAudit.refetch() }

  const authLogs: AuditLogRow[] = (authAudit.data?.data ?? []).map(l => ({ id: l.id, timestamp: l.timestamp, userId: l.userId, userName: l.userName, action: l.action, entityType: l.entityType, entityId: l.entityId, ipAddress: l.ipAddress, userAgent: l.userAgent, source: 'Auth' }))
  const salesLogs: AuditLogRow[] = (salesAudit.data?.data ?? []).map(l => ({ id: l.id, timestamp: l.timestamp, userId: l.userId, userName: l.userName, action: l.action, entityType: l.entityType, entityId: l.entityId, ipAddress: l.ipAddress, userAgent: l.userAgent, source: 'Ventas' }))

  const allLogs = [...authLogs, ...salesLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const columns: Column<AuditLogRow>[] = [
    { header: 'Fecha', accessor: (l) => new Date(l.timestamp).toLocaleString() },
    { header: 'Servicio', accessor: (l) => <span className="text-xs text-muted-foreground">{l.source}</span>, className: 'w-20' },
    { header: 'Usuario', accessor: (l) => l.userName || (l.userId ? `Usuario ${l.userId.slice(0, 8)}...` : <span className="text-muted-foreground">—</span>) },
    {
      header: 'Acción',
      accessor: (l) => <Badge variant={actionBadge[l.action] ?? 'outline'}>{actionLabel[l.action] ?? l.action}</Badge>,
    },
    { header: 'Entidad', accessor: (l) => entityLabel[l.entityType] ?? l.entityType },
    { header: 'ID Entidad', accessor: (l) => l.entityId ? <span className="font-mono text-xs">{l.entityId.slice(0, 8)}</span> : <span className="text-muted-foreground">—</span> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Auditoria" description="Registro de auditoria del sistema AxisERP." />
      <PageHeader title="Auditoria" description="Historial de acciones criticas del sistema" />

      <DataTable
        columns={columns}
        data={allLogs}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyIcon={ClipboardList}
        emptyTitle="No hay registros de auditoria"
        emptyDescription="Los registros apareceran cuando se realicen acciones criticas en el sistema"
        keyExtractor={(l) => `${l.source}-${l.id}`}
      />
    </div>
  )
}
