import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Product } from '@/types/database'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const ITEMS_PER_PAGE = 10

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams

  const customer = searchParams.get('customer')
  const product = searchParams.get('product')
  const dateFilter = searchParams.get('dateFilter')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const page = Number(searchParams.get('page')) || 1
  const offset = (page - 1) * ITEMS_PER_PAGE

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
  if (customer) {
    const customerIds = customer.split(',').filter(Boolean)
    if (customerIds.length > 0) {
      query = query.in('zone_id', customerIds)
    }
  }

  if (product) {
    const productIds = product.split(',').filter(Boolean).map(Number)
    if (productIds.length > 0) {
      query = query.in('product_id', productIds)
    }
  }

  // Date filter
  if (dateFilter && dateFilter !== 'all') {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    switch (dateFilter) {
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
        if (month && year) {
          const yearNum = parseInt(year)
          const monthNum = parseInt(month) - 1
          const startOfMonth = new Date(yearNum, monthNum, 1)
          const endOfMonth = new Date(yearNum, monthNum + 1, 0)
          query = query
            .gte('date', startOfMonth.toISOString().split('T')[0])
            .lte('date', endOfMonth.toISOString().split('T')[0])
        } else if (year && !month && !dateFrom) {
          const yearNum = parseInt(year)
          const startOfYear = new Date(yearNum, 0, 1)
          const endOfYear = new Date(yearNum, 11, 31)
          query = query
            .gte('date', startOfYear.toISOString().split('T')[0])
            .lte('date', endOfYear.toISOString().split('T')[0])
        } else if (dateFrom && dateTo) {
          query = query
            .gte('date', dateFrom)
            .lte('date', dateTo)
        } else if (dateFrom) {
          query = query.eq('date', dateFrom)
        }
        break
      }
    }
  }

  const { data: allTransactions, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

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
  const paginatedTransactions = (allTransactions || []).slice(offset, offset + ITEMS_PER_PAGE)

  return NextResponse.json({
    transactions: paginatedTransactions,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
    },
    stats: {
      totalOrder,
      totalReturn,
      totalBilled,
      totalReturned,
    },
  })
}
