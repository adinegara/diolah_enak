'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTransaction, updateTransaction } from './actions'
import type { Transaction, Customer, Product } from '@/types/database'
import { Plus, Pencil } from 'lucide-react'

interface TransactionFormProps {
  transaction?: Transaction
  customers: Customer[]
  products: Product[]
  trigger?: React.ReactNode
}

export function TransactionForm({ transaction, customers, products, trigger }: TransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<string>(transaction?.zone_id || '')
  const [selectedProduct, setSelectedProduct] = useState<string>(transaction?.product_id?.toString() || '')

  const isEditing = !!transaction

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      date: formData.get('date') as string || null,
      zone_id: selectedCustomer || null,
      product_id: selectedProduct ? Number(selectedProduct) : null,
      order_qty: formData.get('order_qty') ? Number(formData.get('order_qty')) : null,
      return_qty: formData.get('return_qty') ? Number(formData.get('return_qty')) : null,
      status: formData.get('status') as string || null,
    }

    const result = isEditing
      ? await updateTransaction(transaction.id, data)
      : await createTransaction(data)

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
      setSelectedCustomer('')
      setSelectedProduct('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={transaction?.date || new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer">Pelanggan *</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih pelanggan" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product">Produk *</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih produk" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name} - Rp {product.price?.toLocaleString('id-ID') || 0}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_qty">Qty Order</Label>
              <Input
                id="order_qty"
                name="order_qty"
                type="number"
                min="0"
                defaultValue={transaction?.order_qty || 0}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return_qty">Qty Retur</Label>
              <Input
                id="return_qty"
                name="return_qty"
                type="number"
                min="0"
                defaultValue={transaction?.return_qty || 0}
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={transaction?.status || 'pending'}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : isEditing ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditTransactionButtonProps {
  transaction: Transaction
  customers: Customer[]
  products: Product[]
}

export function EditTransactionButton({ transaction, customers, products }: EditTransactionButtonProps) {
  return (
    <TransactionForm
      transaction={transaction}
      customers={customers}
      products={products}
      trigger={
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      }
    />
  )
}
