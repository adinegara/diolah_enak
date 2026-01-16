export const dynamic = 'force-dynamic'
export const runtime = "edge";

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, Receipt, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch counts
  const [productsResult, customersResult, transactionsResult] = await Promise.all([
    supabase.from('product').select('id', { count: 'exact', head: true }),
    supabase.from('customer').select('id', { count: 'exact', head: true }),
    supabase.from('transaction').select('id', { count: 'exact', head: true }),
  ])

  // Fetch transaction stats
  const { data: transactionStats } = await supabase
    .from('transaction')
    .select('order_qty, return_qty, product:product_id(price)')

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

  const stats: Array<{
    title: string
    value: string | number
    icon: typeof Package
    href?: string
    subtitle?: string
  }> = [
      {
        title: 'Total Produk',
        value: productsResult.count || 0,
        icon: Package,
        href: '/product',
      },
      {
        title: 'Total Pelanggan',
        value: customersResult.count || 0,
        icon: Users,
        href: '/customer',
      },
      {
        title: 'Total Transaksi',
        value: transactionsResult.count || 0,
        icon: Receipt,
        href: '/transaction',
      },
      {
        title: 'Total Order',
        value: totalOrder.toLocaleString('id-ID'),
        icon: TrendingUp,
        subtitle: 'qty',
      },
    ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Ringkasan data transaksi Anda</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/transaction?action=new">+ Transaksi Baru</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:bg-secondary/50 transition-colors">
              {stat.href ? (
                <Link href={stat.href}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    )}
                  </CardContent>
                </Link>
              ) : (
                <>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          )
        })}
      </div>

      {/* Financial Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan Penjualan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Tagihan</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(totalBilled)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Retur</span>
              <span className="text-xl font-bold text-destructive">
                {formatCurrency(totalReturned)}
              </span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Bersih</span>
              <span className="text-xl font-bold">
                {formatCurrency(totalBilled - totalReturned)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan Qty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Order</span>
              <span className="text-xl font-bold text-primary">
                {totalOrder.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Retur</span>
              <span className="text-xl font-bold text-destructive">
                {totalReturn.toLocaleString('id-ID')}
              </span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Bersih</span>
              <span className="text-xl font-bold">
                {(totalOrder - totalReturn).toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" asChild className="h-auto py-4">
              <Link href="/product?action=new" className="flex flex-col items-center gap-2">
                <Package className="h-6 w-6" />
                <span>Tambah Produk</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4">
              <Link href="/customer?action=new" className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>Tambah Pelanggan</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4">
              <Link href="/transaction?action=new" className="flex flex-col items-center gap-2">
                <Receipt className="h-6 w-6" />
                <span>Tambah Transaksi</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4">
              <Link href="/transaction" className="flex flex-col items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Lihat Laporan</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
