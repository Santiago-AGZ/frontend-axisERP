import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { EmptyState } from './empty-state'
import { ErrorState } from './error-state'
import type { PaginationMeta } from '@/types/api'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  header: string
  accessor: (item: T) => ReactNode
  className?: string
  sortable?: boolean
  sortKey?: string
}

type SortDirection = 'asc' | 'desc'
interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  pagination?: PaginationMeta
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  emptyIcon?: LucideIcon
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  keyExtractor: (item: T) => string
  ariaLabel?: string
}

function TableSkeleton({ columns, rows = 5 }: { columns: Column<unknown>[]; rows?: number }) {
  return (
    <div className="border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.header} className={cn(col.className, 'h-11')}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {columns.map((col, colIdx) => (
                <TableCell key={colIdx} className={col.className}>
                  <Skeleton className={`skeleton-shimmer h-3.5 rounded-md ${colIdx === 0 ? 'w-32' : colIdx === columns.length - 1 ? 'w-20' : 'w-24'}`} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (direction === 'asc') return <ArrowUp className="ml-1 size-3 shrink-0 text-primary" />
  if (direction === 'desc') return <ArrowDown className="ml-1 size-3 shrink-0 text-primary" />
  return <ArrowUpDown className="ml-1 size-3 shrink-0 text-muted-foreground/30" />
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  pagination,
  onPageChange,
  onPageSizeChange,
  emptyIcon,
  emptyTitle = 'No hay datos',
  emptyDescription,
  emptyAction,
  keyExtractor,
  ariaLabel,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedData = useMemo(() => {
    if (!sortColumn) return data
    return [...data].sort((a, b) => {
      const aVal = String((a as Record<string, unknown>)[sortColumn] ?? '')
      const bVal = String((b as Record<string, unknown>)[sortColumn] ?? '')
      const cmp = aVal.localeCompare(bVal, 'es', { numeric: true })
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [data, sortColumn, sortDirection])

  function handleSort(col: Column<T>) {
    if (!col.sortable) return
    const key = col.sortKey || col.header.toLowerCase()
    if (sortColumn === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  if (isLoading) {
    return <TableSkeleton columns={columns as Column<unknown>[]} />
  }

  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />
  }

  if (sortedData.length === 0) {
    return (
      <div className="border border-border rounded-lg">
        <EmptyState
          icon={emptyIcon as LucideIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden border border-border rounded-lg">
        <Table aria-label={ariaLabel}>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.header}
                  className={col.className}
                  {...(col.sortable ? {
                    onClick: () => handleSort(col),
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSort(col)
                      }
                    },
                    tabIndex: 0,
                    role: 'columnheader',
                    'aria-sort': sortColumn === (col.sortKey || col.header.toLowerCase())
                      ? (sortDirection === 'asc' ? 'ascending' : 'descending')
                      : undefined,
                  } : {})}
                >
                  <div className={cn(
                    'flex items-center gap-0.5',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground'
                  )}>
                    {col.header}
                    {col.sortable && (
                      <SortIcon direction={sortColumn === (col.sortKey || col.header.toLowerCase()) ? sortDirection : null} />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={keyExtractor(item)}>
                {columns.map((col) => (
                  <TableCell key={col.header} className={col.className}>
                    {col.accessor(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (onPageChange || onPageSizeChange) && (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="text-[13px]">Página {pagination.page} de {pagination.totalPages}</span>
            {onPageSizeChange && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground/40 mx-1">|</span>
                <Select
                  value={String(pagination.pageSize)}
                  onValueChange={(v) => onPageSizeChange(Number(v))}
                >
                  <SelectTrigger className="h-8 w-14 text-[13px]" aria-label="Elementos por página">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!pagination.hasPrevious}
              onClick={() => onPageChange?.(pagination.page - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange?.(pagination.page + 1)}
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
