import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET() {
  const supabase = await createClient()

  // Fetch counts
  const [productsResult, customersResult, transactionsResult] = await Promise.all([
    supabase.from('product').select('id', { count: 'exact', head: true }),
    supabase.from('customer').select('id', { count: 'exact', head: true }),
    supabase.from('transaction').select('id', { count: 'exact', head: true }),
  ])

  // Fetch transaction stats
  const { data: transactionStats, error } = await supabase
    .from('transaction')
    .select('order_qty, return_qty, product:product_id(price)')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let totalOrder = 0
  let totalReturn = 0
  let totalBilled = 0
  let totalReturned = 0

  if (transactionStats) {
    transactionStats.forEach((t) => {
      const orderQty = t.order_qty || 0
      const returnQty = t.return_qty || 0
      const price = (t.product as { price: number | null } | null)?.price || 0

      totalOrder += orderQty
      totalReturn += returnQty
      totalBilled += orderQty * price
      totalReturned += returnQty * price
    })
  }

  return NextResponse.json({
    counts: {
      products: productsResult.count || 0,
      customers: customersResult.count || 0,
      transactions: transactionsResult.count || 0,
    },
    stats: {
      totalOrder,
      totalReturn,
      totalBilled,
      totalReturned,
    },
  })
}
