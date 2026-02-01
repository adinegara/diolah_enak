'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSWRConfig } from 'swr'
import { TRANSACTIONS_KEY_PREFIX } from '@/hooks/use-transactions'
import { DASHBOARD_STATS_KEY } from '@/hooks/use-dashboard-stats'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { createTransaction, updateTransaction } from './actions'
import type { Transaction, Customer, Product } from '@/types/database'
import { Plus, Pencil, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionFormProps {
  transaction?: Transaction
  customers: Customer[]
  products: Product[]
  trigger?: React.ReactNode
}

export function TransactionForm({ transaction, customers, products, trigger }: TransactionFormProps) {
  const { mutate } = useSWRConfig()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<string>(transaction?.zone_id || '')
  const [selectedProduct, setSelectedProduct] = useState<string>(transaction?.product_id?.toString() || '')
  const [customerOpen, setCustomerOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)

  const isEditing = !!transaction

  const refreshData = useCallback(() => {
    // Refresh all transaction queries and dashboard stats (keeps existing data visible while revalidating)
    mutate((key: string) => typeof key === 'string' && key.startsWith(TRANSACTIONS_KEY_PREFIX))
    mutate(DASHBOARD_STATS_KEY)
  }, [mutate])

  // Reset form values when dialog opens for editing
  useEffect(() => {
    if (open && transaction) {
      setSelectedCustomer(transaction.zone_id || '')
      setSelectedProduct(transaction.product_id?.toString() || '')
    }
  }, [open, transaction])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const dateValue = formData.get('date') as string
    const data = {
      date: dateValue ? new Date(dateValue).toISOString() : null,
      zone_id: selectedCustomer || null,
      product_id: selectedProduct ? Number(selectedProduct) : null,
      order_qty: formData.get('order_qty') ? Number(formData.get('order_qty')) : null,
      return_qty: formData.get('return_qty') ? Number(formData.get('return_qty')) : null,
      status: formData.get('status') as string || null,
      notes: formData.get('notes') as string || null,
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
      refreshData()
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
      <DialogContent className="max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
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
              className="w-11/12"
              defaultValue={transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer">Pelanggan *</Label>
            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedCustomer
                    ? customers.find((c) => c.id === selectedCustomer)?.name
                    : "Pilih pelanggan"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Cari pelanggan..." />
                  <CommandList
                    onWheel={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <CommandEmpty>Pelanggan tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {customers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={customer.name}
                          onSelect={() => {
                            setSelectedCustomer(customer.id)
                            setCustomerOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCustomer === customer.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {customer.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product">Produk *</Label>
            <Popover open={productOpen} onOpenChange={setProductOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={productOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedProduct
                    ? (() => {
                      const product = products.find((p) => p.id.toString() === selectedProduct)
                      return product ? `${product.name} - Rp ${product.price?.toLocaleString('id-ID') || 0}` : "Pilih produk"
                    })()
                    : "Pilih produk"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Cari produk..." />
                  <CommandList
                    onWheel={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {products.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.name}
                          onSelect={() => {
                            setSelectedProduct(product.id.toString())
                            setProductOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProduct === product.id.toString() ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {product.name} - Rp {product.price?.toLocaleString('id-ID') || 0}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_qty">Qty Order</Label>
              <Input
                id="order_qty"
                name="order_qty"
                type="number"
                min="0"
                defaultValue={transaction?.order_qty || ''}
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
                defaultValue={transaction?.return_qty || ''}
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
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={transaction?.notes || ''}
              placeholder="Tambahkan catatan..."
              rows={3}
            />
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
