'use client'

import { useSearchParams } from 'next/navigation'
import { useTransactions } from '@/hooks/use-transactions'
import { TransactionFilters } from './filters'
import { StatsSection } from './stats-section'
import { TransactionList } from './transaction-list'
import { Pagination } from './pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshableContent } from '@/components/pull-to-refresh'
import type { Customer, Product } from '@/types/database'

interface TransactionContentProps {
  customers: Customer[]
  products: Product[]
}

export function TransactionContent({ customers, products }: TransactionContentProps) {
  const searchParams = useSearchParams()

  const filters = {
    customer: searchParams.get('customer') || undefined,
    product: searchParams.get('product') || undefined,
    dateFilter: searchParams.get('dateFilter') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    month: searchParams.get('month') || undefined,
    year: searchParams.get('year') || undefined,
    page: searchParams.get('page') || undefined,
  }

  const { data, error, isLoading } = useTransactions(filters)

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Terjadi kesalahan saat memuat data. Silakan coba lagi.
        </CardContent>
      </Card>
    )
  }

  return (
    <RefreshableContent>
      <div className="space-y-6">
        {/* Filters */}
        <TransactionFilters customers={customers} products={products} />

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <StatsSection
            totalOrder={data?.stats.totalOrder || 0}
            totalReturn={data?.stats.totalReturn || 0}
            totalBilled={data?.stats.totalBilled || 0}
            totalReturned={data?.stats.totalReturned || 0}
          />
        )}

        {/* Transaction List with Bulk Actions */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </CardContent>
          </Card>
        ) : (
          <TransactionList
            transactions={data?.transactions || []}
            customers={customers}
            products={products}
          />
        )}

        {/* Pagination */}
        {!isLoading && data && (
          <Pagination
            currentPage={data.pagination.currentPage}
            totalPages={data.pagination.totalPages}
            totalItems={data.pagination.totalItems}
          />
        )}
      </div>
    </RefreshableContent>
  )
}
