'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { EditTransactionButton } from './transaction-form'
import { DeleteTransactionButton } from './delete-button'
import { ExpandableText } from './expandable-text'
import { BulkActions } from './bulk-actions'
import type { Customer, Product, UserProfile, Transaction } from '@/types/database'

interface TransactionListProps {
  transactions: (Transaction & {
    customer: Customer | null
    product: Product | null
    creator: UserProfile | null
  })[]
  customers: Customer[]
  products: Product[]
}

export function TransactionList({ transactions, customers, products }: TransactionListProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

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

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(transactions.map((t) => t.id))
    }
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  const isAllSelected = transactions.length > 0 && selectedIds.length === transactions.length

  return (
    <>
      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {transactions.map((transaction) => {
          const customer = transaction.customer
          const product = transaction.product
          const creator = transaction.creator
          const orderQty = transaction.order_qty || 0
          const returnQty = transaction.return_qty || 0
          const price = product?.price || 0

          return (
            <Card key={transaction.id} className={selectedIds.includes(transaction.id) ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedIds.includes(transaction.id)}
                    onCheckedChange={() => toggleSelect(transaction.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
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
        {transactions.length === 0 && (
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
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
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
              {transactions.map((transaction) => {
                const customer = transaction.customer
                const product = transaction.product
                const creator = transaction.creator
                const orderQty = transaction.order_qty || 0
                const returnQty = transaction.return_qty || 0
                const price = product?.price || 0
                const netTotal = (orderQty - returnQty) * price
                const total = orderQty - returnQty

                return (
                  <TableRow key={transaction.id} className={selectedIds.includes(transaction.id) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(transaction.id)}
                        onCheckedChange={() => toggleSelect(transaction.id)}
                      />
                    </TableCell>
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
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                    Belum ada transaksi. Klik tombol &quot;Tambah Transaksi&quot; untuk menambahkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BulkActions selectedIds={selectedIds} onClearSelection={clearSelection} />
    </>
  )
}
