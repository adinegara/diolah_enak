export const dynamic = 'force-dynamic'
export const runtime = "edge";

import { createClient } from '@/lib/supabase/server'
import { TransactionForm } from './transaction-form'
import { TransactionFilters } from './filters'
import { StatsSection } from './stats-section'
import { TransactionList } from './transaction-list'
import type { Customer, Product, UserProfile } from '@/types/database'

interface PageProps {
  searchParams: Promise<{
    customer?: string
    product?: string
    month?: string
    year?: string
  }>
}

export default async function TransactionPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

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
    `)
    .order('date', { ascending: false })

  // Apply filters
  if (params.customer && params.customer !== 'all') {
    query = query.eq('zone_id', params.customer)
  }

  if (params.product && params.product !== 'all') {
    query = query.eq('product_id', Number(params.product))
  }

  if (params.year && params.year !== 'all' && params.month && params.month !== 'all') {
    const startDate = `${params.year}-${params.month.padStart(2, '0')}-01`
    const endDate = new Date(Number(params.year), Number(params.month), 0)
      .toISOString()
      .split('T')[0]
    query = query.gte('date', startDate).lte('date', endDate)
  } else if (params.year && params.year !== 'all') {
    query = query.gte('date', `${params.year}-01-01`).lte('date', `${params.year}-12-31`)
  }

  const { data: transactions } = await query

  // Calculate totals
  let totalOrder = 0
  let totalReturn = 0
  let totalBilled = 0
  let totalReturned = 0

  transactions?.forEach((t) => {
    const orderQty = t.order_qty || 0
    const returnQty = t.return_qty || 0
    const price = (t.product as Product | null)?.price || 0

    totalOrder += orderQty
    totalReturn += returnQty
    totalBilled += orderQty * price
    totalReturned += returnQty * price
  })

  // Transform transactions data for the list component
  const transactionsData = (transactions || []).map((t) => ({
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
    </div>
  )
}
