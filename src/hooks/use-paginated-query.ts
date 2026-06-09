import { useState } from 'react'
import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query'
import type { PaginationMeta } from '@/types/api'

interface PaginatedQueryResult<T> {
  data: T[]
  pagination: PaginationMeta | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  page: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
}

interface UsePaginatedQueryOptions<TData, TQueryKey extends QueryKey>
  extends Omit<UseQueryOptions<TData, Error, TData, TQueryKey>, 'queryKey' | 'queryFn'> {
  initialPage?: number
  initialPageSize?: number
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export function usePaginatedQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<PaginatedResponse<T>>,
  options: UsePaginatedQueryOptions<PaginatedResponse<T>, QueryKey> = {}
): PaginatedQueryResult<T> {
  const { initialPage = 1, initialPageSize = 20, ...queryOptions } = options
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const result = useQuery<PaginatedResponse<T>, Error, PaginatedResponse<T>, QueryKey>({
    queryKey: [...queryKey, { page, pageSize }],
    queryFn,
    ...queryOptions,
  })

  return {
    data: result.data?.data ?? [],
    pagination: result.data?.pagination ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    page,
    pageSize,
    setPage: (p: number) => setPage(p),
    setPageSize: (s: number) => {
      setPageSize(s)
      setPage(1)
    },
  }
}
