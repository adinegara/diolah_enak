import useSWR from 'swr'
import type { Customer } from '@/types/database'

export interface CustomerFilters {
  search?: string
  page?: string
}

export interface CustomersResponse {
  customers: Customer[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export function useCustomers(filters: CustomerFilters) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  const queryString = params.toString()
  const key = `/api/customers${queryString ? `?${queryString}` : ''}`

  return useSWR<CustomersResponse>(key)
}

export const CUSTOMERS_KEY_PREFIX = '/api/customers'
