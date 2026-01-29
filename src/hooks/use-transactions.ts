import useSWR from 'swr'
import type { Customer, Product, UserProfile, Transaction } from '@/types/database'

export interface TransactionFilters {
  customer?: string
  product?: string
  dateFilter?: string
  dateFrom?: string
  dateTo?: string
  month?: string
  year?: string
  page?: string
}

export interface TransactionWithRelations extends Transaction {
  customer: Customer | null
  product: Product | null
  creator: UserProfile | null
}

export interface TransactionsResponse {
  transactions: TransactionWithRelations[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
  stats: {
    totalOrder: number
    totalReturn: number
    totalBilled: number
    totalReturned: number
  }
}

export function useTransactions(filters: TransactionFilters) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  const queryString = params.toString()
  const key = `/api/transactions${queryString ? `?${queryString}` : ''}`

  return useSWR<TransactionsResponse>(key)
}

export const TRANSACTIONS_KEY_PREFIX = '/api/transactions'
