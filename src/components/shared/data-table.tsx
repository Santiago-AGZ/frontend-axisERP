import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from './empty-state'
import { ErrorState } from './error-state'
import type { PaginationMeta } from '@/types/api'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.header} className={col.className}>
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
                  <Skeleton className={`h-4 ${colIdx === 0 ? 'w-32' : colIdx === columns.length - 1 ? 'w-20' : 'w-24'}`} />
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
  if (direction === 'asc') return <ArrowUp className="ml-1 size-3 shrink-0" />
  if (direction === 'desc') return <ArrowDown className="ml-1 size-3 shrink-0" />
  return <ArrowUpDown className="ml-1 size-3 shrink-0 opacity-30" />
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
      <div className="rounded-md border">
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
      <div className="overflow-x-auto rounded-md border">
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
                  <div className={`flex items-center ${col.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''}`}>
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
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalRecords={pagination.totalRecords}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrevious={pagination.hasPrevious}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}
