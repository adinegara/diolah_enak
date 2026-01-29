import { createClient } from '@/lib/supabase/server'
import { TransactionForm } from './transaction-form'
import { TransactionContent } from './transaction-content'

export default async function TransactionPage() {
  const supabase = await createClient()

  // Fetch customers and products for forms (these rarely change)
  const [customersResult, productsResult] = await Promise.all([
    supabase.from('customer').select('*').order('name'),
    supabase.from('product').select('*').order('name'),
  ])

  const customers = customersResult.data || []
  const products = productsResult.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaksi</h1>
          <p className="text-muted-foreground">Kelola transaksi order dan retur</p>
        </div>
        <TransactionForm customers={customers} products={products} />
      </div>

      {/* Client Component with SWR for real-time data */}
      <TransactionContent customers={customers} products={products} />
    </div>
  )
}
