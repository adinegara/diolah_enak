'use client'

import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshableContent } from '@/components/pull-to-refresh'
import { Package, Users, Receipt, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function DashboardContent() {
  const { data, error, isLoading } = useDashboardStats()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Terjadi kesalahan saat memuat data. Silakan coba lagi.
        </CardContent>
      </Card>
    )
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
      value: data?.counts.products || 0,
      icon: Package,
      href: '/product',
    },
    {
      title: 'Total Pelanggan',
      value: data?.counts.customers || 0,
      icon: Users,
      href: '/customer',
    },
    {
      title: 'Total Transaksi',
      value: data?.counts.transactions || 0,
      icon: Receipt,
      href: '/transaction',
    },
    {
      title: 'Total Order',
      value: (data?.stats.totalOrder || 0).toLocaleString('id-ID'),
      icon: TrendingUp,
      subtitle: 'qty',
    },
  ]

  return (
    <RefreshableContent>
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => {
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
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Tagihan</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(data?.stats.totalBilled || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Retur</span>
                  <span className="text-xl font-bold text-destructive">
                    {formatCurrency(data?.stats.totalReturned || 0)}
                  </span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Bersih</span>
                  <span className="text-xl font-bold">
                    {formatCurrency((data?.stats.totalBilled || 0) - (data?.stats.totalReturned || 0))}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan Qty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Order</span>
                  <span className="text-xl font-bold text-primary">
                    {(data?.stats.totalOrder || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Retur</span>
                  <span className="text-xl font-bold text-destructive">
                    {(data?.stats.totalReturn || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Bersih</span>
                  <span className="text-xl font-bold">
                    {((data?.stats.totalOrder || 0) - (data?.stats.totalReturn || 0)).toLocaleString('id-ID')}
                  </span>
                </div>
              </>
            )}
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
    </RefreshableContent>
  )
}
