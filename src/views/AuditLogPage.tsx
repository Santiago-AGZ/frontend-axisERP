import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { SeoHead } from '@/components/shared/seo-head'
import { Badge } from '@/components/ui/badge'
import { ClipboardList } from 'lucide-react'
import { actionLabel, entityLabel } from '@/lib/labels'

interface AuditEntry {
  id: string
  timestamp: string
  userId?: string
  userName?: string
  action: string
  entityType: string
  entityId?: string
  detail?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

const actionBadge: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  LOGIN: 'default',
  LOGOUT: 'secondary',
  CREATE: 'default',
  UPDATE: 'outline',
  DELETE: 'destructive',
  DEACTIVATE: 'destructive',
  REACTIVATE: 'default',
  PASSWORD_RESET_REQUEST: 'secondary',
  PASSWORD_RESET_COMPLETE: 'default',
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.auth.auditLogs.list({ page, size: 20 }),
    queryFn: () => authService.getAuditLogs({ page, size: 20 }),
    staleTime: 30000,
  })

  const logs: AuditEntry[] = data?.data ?? []
  const pagination = data?.pagination ?? null

  const columns: Column<AuditEntry>[] = [
    { header: 'Fecha', accessor: (l) => new Date(l.timestamp).toLocaleString() },
    { header: 'Usuario', accessor: (l) => l.userName || (l.userId ? `Usuario ${l.userId.slice(0, 8)}...` : <span className="text-muted-foreground">—</span>) },
    {
      header: 'Accion',
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
        data={logs}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        pagination={pagination ?? undefined}
        onPageChange={setPage}
        emptyIcon={ClipboardList}
        emptyTitle="No hay registros de auditoria"
        emptyDescription="Los registros apareceran cuando se realicen acciones criticas en el sistema"
        keyExtractor={(l) => l.id}
      />
    </div>
  )
}
