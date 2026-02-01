import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const ITEMS_PER_PAGE = 10

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams

  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page')) || 1
  const offset = (page - 1) * ITEMS_PER_PAGE

  // Build query with search
  let query = supabase
    .from('customer')
    .select('*', { count: 'exact' })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: customers, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  return NextResponse.json({
    customers: customers || [],
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
    },
  })
}
