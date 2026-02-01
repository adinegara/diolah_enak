import useSWR from 'swr'
import type { Product } from '@/types/database'

export interface ProductFilters {
  search?: string
  page?: string
}

export interface ProductsResponse {
  products: Product[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export function useProducts(filters: ProductFilters) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  const queryString = params.toString()
  const key = `/api/products${queryString ? `?${queryString}` : ''}`

  return useSWR<ProductsResponse>(key)
}

export const PRODUCTS_KEY_PREFIX = '/api/products'
