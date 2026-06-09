import type { PaginationMeta } from '@/types/api'

export interface PaginationState {
  page: number
  pageSize: number
}

export function getPageCount(totalRecords: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalRecords / pageSize))
}

export function getPageNumbers(meta: PaginationMeta): (number | 'ellipsis')[] {
  const { page, totalPages } = meta
  const pages: (number | 'ellipsis')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  if (page > 3) pages.push('ellipsis')

  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (page < totalPages - 2) pages.push('ellipsis')

  pages.push(totalPages)

  return pages
}
