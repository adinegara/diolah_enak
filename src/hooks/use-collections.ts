import useSWR from 'swr'
import type { Collection } from '@/types/database'

export interface CollectionFilters {
  search?: string
  page?: string
}

export interface CollectionWithCount extends Collection {
  item_count: number
}

export interface CollectionsResponse {
  collections: CollectionWithCount[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export function useCollections(filters: CollectionFilters) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  const queryString = params.toString()
  const key = `/api/collections${queryString ? `?${queryString}` : ''}`

  return useSWR<CollectionsResponse>(key)
}

export const COLLECTIONS_KEY_PREFIX = '/api/collections'
