import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const ITEMS_PER_PAGE = 12

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams

  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page')) || 1
  const offset = (page - 1) * ITEMS_PER_PAGE

  // Build query with search
  let query = supabase
    .from('collection')
    .select('*', { count: 'exact' })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: collections, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get item counts for each collection
  const collectionIds = collections?.map(c => c.id) || []
  let itemCounts: Record<number, number> = {}

  if (collectionIds.length > 0) {
    const { data: items } = await supabase
      .from('collection_item')
      .select('collection_id')
      .in('collection_id', collectionIds)

    if (items) {
      itemCounts = items.reduce((acc, item) => {
        acc[item.collection_id] = (acc[item.collection_id] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    }
  }

  const collectionsWithCounts = collections?.map(c => ({
    ...c,
    item_count: itemCounts[c.id] || 0,
  })) || []

  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  return NextResponse.json({
    collections: collectionsWithCounts,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
    },
  })
}
