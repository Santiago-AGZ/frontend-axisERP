import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { getPageNumbers } from '@/lib/pagination'

interface PaginationProps {
  page: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

const pageSizeOptions = [10, 20, 50, 100]

export function Pagination({
  page,
  pageSize,
  totalRecords,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const pages = getPageNumbers({ page, pageSize, totalRecords, totalPages, hasNext, hasPrevious })

  return (
    <nav className="flex items-center justify-between" aria-label="Navegación de página">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{totalRecords} registros</span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1">
            <span>|</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-16 text-xs" aria-label="Elementos por página">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
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
          size="icon"
          className="size-8"
          disabled={!hasPrevious}
          onClick={() => onPageChange?.(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground" aria-hidden="true">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon"
              className="size-8 text-xs"
              onClick={() => onPageChange?.(p)}
              aria-label={`Ir a página ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!hasNext}
          onClick={() => onPageChange?.(page + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  )
}
