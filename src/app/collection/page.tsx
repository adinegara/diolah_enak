export const dynamic = 'force-dynamic'
export const runtime = "edge";

import { createClient } from '@/lib/supabase/server'
import { CollectionContent } from './collection-content'

export default async function CollectionPage() {
  const supabase = await createClient()

  // Fetch customers and products for the form
  const [customersResult, productsResult] = await Promise.all([
    supabase.from('customer').select('*').order('name'),
    supabase.from('product').select('*').order('name'),
  ])

  const customers = customersResult.data || []
  const products = productsResult.data || []

  return <CollectionContent customers={customers} products={products} />
}
