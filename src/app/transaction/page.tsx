export const dynamic = 'force-dynamic'
export const runtime = "edge";

import { createClient } from '@/lib/supabase/server'
import { TransactionForm } from './transaction-form'
import { TransactionFilters } from './filters'
import { StatsSection } from './stats-section'
import { TransactionList } from './transaction-list'
import { Pagination } from './pagination'
import type { Customer, Product, UserProfile } from '@/types/database'

const ITEMS_PER_PAGE = 10

interface PageProps {
  searchParams: Promise<{
    customer?: string
    product?: string
    dateFilter?: string
    dateFrom?: string
    dateTo?: string
    month?: string
    year?: string
    page?: string
  }>
}

export default async function TransactionPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const currentPage = Number(params.page) || 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  // Fetch customers and products for forms
  const [customersResult, productsResult] = await Promise.all([
    supabase.from('customer').select('*').order('name'),
    supabase.from('product').select('*').order('name'),
  ])

  const customers = customersResult.data || []
  const products = productsResult.data || []

  // Build transaction query with filters
  let query = supabase
    .from('transaction')
    .select(`
      *,
      customer:zone_id(id, name),
      product:product_id(id, name, price),
      creator:profiles!created_by(id, email, full_name)
    `, { count: 'exact' })
    .order('date', { ascending: false })

  // Apply filters
  if (params.customer && params.customer !== 'all') {
    query = query.eq('zone_id', params.customer)
  }

  if (params.product && params.product !== 'all') {
    query = query.eq('product_id', Number(params.product))
  }

  // Date filter
  if (params.dateFilter && params.dateFilter !== 'all') {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    switch (params.dateFilter) {
      case 'today':
        query = query.eq('date', todayStr)
        break
      case 'yesterday': {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        query = query.eq('date', yesterday.toISOString().split('T')[0])
        break
      }
      case 'thisWeek': {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        query = query.gte('date', startOfWeek.toISOString().split('T')[0]).lte('date', todayStr)
        break
      }
      case 'thisMonth': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        query = query.gte('date', startOfMonth.toISOString().split('T')[0]).lte('date', todayStr)
        break
      }
      case 'thisYear': {
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        query = query.gte('date', startOfYear.toISOString().split('T')[0]).lte('date', todayStr)
        break
      }
      case 'custom': {
        // Handle different custom filter types
        if (params.month && params.year) {
          // Specific month
          const year = parseInt(params.year)
          const month = parseInt(params.month) - 1 // JavaScript months are 0-indexed
          const startOfMonth = new Date(year, month, 1)
          const endOfMonth = new Date(year, month + 1, 0) // Last day of month
          query = query
            .gte('date', startOfMonth.toISOString().split('T')[0])
            .lte('date', endOfMonth.toISOString().split('T')[0])
        } else if (params.year && !params.month && !params.dateFrom) {
          // Specific year only
          const year = parseInt(params.year)
          const startOfYear = new Date(year, 0, 1)
          const endOfYear = new Date(year, 11, 31)
          query = query
            .gte('date', startOfYear.toISOString().split('T')[0])
            .lte('date', endOfYear.toISOString().split('T')[0])
        } else if (params.dateFrom && params.dateTo) {
          // Date range or single date
          query = query
            .gte('date', params.dateFrom)
            .lte('date', params.dateTo)
        } else if (params.dateFrom) {
          // Single date (fallback)
          query = query.eq('date', params.dateFrom)
        }
        break
      }
    }
  }

  // First get all filtered transactions for stats calculation
  const { data: allTransactions, count } = await query

  // Calculate totals from all filtered transactions
  let totalOrder = 0
  let totalReturn = 0
  let totalBilled = 0
  let totalReturned = 0

  allTransactions?.forEach((t) => {
    const orderQty = t.order_qty || 0
    const returnQty = t.return_qty || 0
    const price = (t.product as Product | null)?.price || 0

    totalOrder += orderQty
    totalReturn += returnQty
    totalBilled += orderQty * price
    totalReturned += returnQty * price
  })

  // Pagination
  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  // Get paginated transactions for display
  const paginatedTransactions = (allTransactions || []).slice(offset, offset + ITEMS_PER_PAGE)

  // Transform transactions data for the list component
  const transactionsData = paginatedTransactions.map((t) => ({
    ...t,
    customer: t.customer as Customer | null,
    product: t.product as Product | null,
    creator: t.creator as UserProfile | null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaksi</h1>
          <p className="text-muted-foreground">Kelola transaksi order dan retur</p>
        </div>
        <TransactionForm customers={customers} products={products} />
      </div>

      {/* Filters */}
      <TransactionFilters customers={customers} products={products} />

      {/* Summary Cards */}
      <StatsSection
        totalOrder={totalOrder}
        totalReturn={totalReturn}
        totalBilled={totalBilled}
        totalReturned={totalReturned}
      />

      {/* Transaction List with Bulk Actions */}
      <TransactionList
        transactions={transactionsData}
        customers={customers}
        products={products}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
      />
    </div>
  )
}
