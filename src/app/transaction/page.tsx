export const dynamic = 'force-dynamic'
export const runtime = "edge";

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TransactionForm, EditTransactionButton } from './transaction-form'
import { DeleteTransactionButton } from './delete-button'
import { TransactionFilters } from './filters'
import { ExpandableText } from './expandable-text'
import { StatsSection } from './stats-section'
import { Badge } from '@/components/ui/badge'
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-white">Selesai</Badge>
      case 'delivered':
        return <Badge className="bg-primary text-primary-foreground">Dikirim</Badge>
      case 'pending':
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getCreatorName = (creator: UserProfile | null) => {
    if (!creator) return '-'
    return creator.full_name || creator.email || '-'
  }

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

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {transactions?.map((transaction) => {
          const customer = transaction.customer as Customer | null
          const product = transaction.product as Product | null
          const creator = transaction.creator as UserProfile | null
          const orderQty = transaction.order_qty || 0
          const returnQty = transaction.return_qty || 0
          const price = product?.price || 0

          return (
            <Card key={transaction.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{product?.name || '-'}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {customer?.name || '-'} • {formatDate(transaction.date)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <EditTransactionButton
                      transaction={transaction}
                      customers={customers}
                      products={products}
                    />
                    <DeleteTransactionButton id={transaction.id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  {getStatusBadge(transaction.status)}
                  <span className="text-sm font-medium">
                    @ {formatCurrency(price)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order</p>
                    <p className="font-semibold text-primary">{orderQty}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Retur</p>
                    <p className="font-semibold text-destructive">{returnQty}</p>
                  </div>
                </div>
                {transaction.status === 'completed' && (
                  <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold">{orderQty - returnQty}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total (Rp)</p>
                      <p className="font-semibold">{formatCurrency((orderQty - returnQty) * price)}</p>
                    </div>
                  </div>
                )}
                {transaction.notes && (
                  <div className="text-sm pt-2 border-t">
                    <p className="text-muted-foreground text-xs mb-1">Catatan:</p>
                    <ExpandableText text={transaction.notes} maxLength={50} />
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Dibuat oleh: {getCreatorName(creator)}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {(!transactions || transactions.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada transaksi. Klik tombol &quot;Tambah Transaksi&quot; untuk menambahkan.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground/60">Tanggal</TableHead>
                <TableHead className="text-muted-foreground/60">Pelanggan</TableHead>
                <TableHead className="text-muted-foreground/60">Produk</TableHead>
                <TableHead className="text-muted-foreground/60 text-right">Harga</TableHead>
                <TableHead className="text-muted-foreground/60 text-right">Order</TableHead>
                <TableHead className="text-muted-foreground/60 text-right">Retur</TableHead>
                <TableHead className="text-muted-foreground/60 text-right">Total</TableHead>
                <TableHead className="text-muted-foreground/60 text-right">Total (Rp)</TableHead>
                <TableHead className="text-muted-foreground/60">Status</TableHead>
                <TableHead className="text-muted-foreground/60">Dibuat Oleh</TableHead>
                <TableHead className="text-muted-foreground/60">Catatan</TableHead>
                <TableHead className="text-muted-foreground/60 w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((transaction) => {
                const customer = transaction.customer as Customer | null
                const product = transaction.product as Product | null
                const creator = transaction.creator as UserProfile | null
                const orderQty = transaction.order_qty || 0
                const returnQty = transaction.return_qty || 0
                const price = product?.price || 0
                const netTotal = (orderQty - returnQty) * price
                const total = orderQty - returnQty

                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className="font-medium">
                      {customer?.name || '-'}
                    </TableCell>
                    <TableCell>{product?.name || '-'}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(price)}
                    </TableCell>
                    <TableCell className="text-right text-primary font-medium">
                      {orderQty}
                    </TableCell>
                    <TableCell className="text-right text-destructive font-medium">
                      {returnQty}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {transaction.status === 'completed' ? total : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {transaction.status === 'completed' ? formatCurrency(netTotal) : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {getCreatorName(creator)}
                    </TableCell>
                    <TableCell className="max-w-[200px] whitespace-normal break-words">
                      <ExpandableText text={transaction.notes} maxLength={30} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <EditTransactionButton
                          transaction={transaction}
                          customers={customers}
                          products={products}
                        />
                        <DeleteTransactionButton id={transaction.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {(!transactions || transactions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                    Belum ada transaksi. Klik tombol &quot;Tambah Transaksi&quot; untuk menambahkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
