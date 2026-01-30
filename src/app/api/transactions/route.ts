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
    .order('created_at', { ascending: false })

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

  // Date filter (using timestamp ranges)
  if (dateFilter && dateFilter !== 'all') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStart = today.toISOString()
    const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()

    switch (dateFilter) {
      case 'today':
        query = query.gte('date', todayStart).lte('date', todayEnd)
        break
      case 'yesterday': {
        const yesterdayStart = new Date(today)
        yesterdayStart.setDate(yesterdayStart.getDate() - 1)
        const yesterdayEnd = new Date(yesterdayStart.getTime() + 24 * 60 * 60 * 1000 - 1)
        query = query.gte('date', yesterdayStart.toISOString()).lte('date', yesterdayEnd.toISOString())
        break
      }
      case 'thisWeek': {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        query = query.gte('date', startOfWeek.toISOString()).lte('date', todayEnd)
        break
      }
      case 'thisMonth': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        query = query.gte('date', startOfMonth.toISOString()).lte('date', todayEnd)
        break
      }
      case 'thisYear': {
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        query = query.gte('date', startOfYear.toISOString()).lte('date', todayEnd)
        break
      }
      case 'custom': {
        if (month && year) {
          const yearNum = parseInt(year)
          const monthNum = parseInt(month) - 1
          const startOfMonth = new Date(yearNum, monthNum, 1)
          const endOfMonth = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999)
          query = query
            .gte('date', startOfMonth.toISOString())
            .lte('date', endOfMonth.toISOString())
        } else if (year && !month && !dateFrom) {
          const yearNum = parseInt(year)
          const startOfYear = new Date(yearNum, 0, 1)
          const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59, 999)
          query = query
            .gte('date', startOfYear.toISOString())
            .lte('date', endOfYear.toISOString())
        } else if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom)
          fromDate.setHours(0, 0, 0, 0)
          const toDate = new Date(dateTo)
          toDate.setHours(23, 59, 59, 999)
          query = query
            .gte('date', fromDate.toISOString())
            .lte('date', toDate.toISOString())
        } else if (dateFrom) {
          const fromDate = new Date(dateFrom)
          fromDate.setHours(0, 0, 0, 0)
          const fromDateEnd = new Date(fromDate.getTime() + 24 * 60 * 60 * 1000 - 1)
          query = query.gte('date', fromDate.toISOString()).lte('date', fromDateEnd.toISOString())
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
