'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSWRConfig } from 'swr'
import { COLLECTIONS_KEY_PREFIX } from '@/hooks/use-collections'

// Simple unique ID generator
let idCounter = 0
function generateId() {
  return `item-${Date.now()}-${++idCounter}`
}
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
import { createCollection, updateCollection, getCollectionWithItems } from './actions'
import type { Collection, Customer, Product, CollectionItemInsert } from '@/types/database'
import { Plus, Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CollectionFormProps {
  customers: Customer[]
  products: Product[]
}

interface ItemFormData {
  id: string
  zone_id: string
  product_id: string
  order_qty: string
  notes: string
}

export function CollectionForm({ customers, products }: CollectionFormProps) {
  const { mutate } = useSWRConfig()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<ItemFormData[]>([])
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const refreshData = useCallback(() => {
    mutate((key: string) => typeof key === 'string' && key.startsWith(COLLECTIONS_KEY_PREFIX))
  }, [mutate])

  const addItem = () => {
    const newId = generateId()
    setItems([
      ...items,
      {
        id: newId,
        zone_id: '',
        product_id: '',
        order_qty: '',
        notes: '',
      },
    ])
    setLastAddedId(newId)
  }

  useEffect(() => {
    if (lastAddedId && itemRefs.current[lastAddedId]) {
      itemRefs.current[lastAddedId]?.focus()
      setLastAddedId(null)
    }
  }, [lastAddedId, items])

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof ItemFormData, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setItems([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const collectionItems: Omit<CollectionItemInsert, 'collection_id'>[] = items
      .filter(item => item.zone_id && item.product_id)
      .map(item => ({
        zone_id: item.zone_id || null,
        product_id: item.product_id ? Number(item.product_id) : null,
        order_qty: item.order_qty ? Number(item.order_qty) : null,
        notes: item.notes || null,
      }))

    const result = await createCollection(
      { name, description: description || null },
      collectionItems
    )

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Koleksi berhasil dibuat')
      setOpen(false)
      resetForm()
      refreshData()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o)
      if (!o) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Koleksi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Tambah Koleksi Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Koleksi *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: Order Harian Senin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi koleksi..."
              rows={2}
            />
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Item Transaksi</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah Item
              </Button>
            </div>

            {items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                Belum ada item. Klik &quot;Tambah Item&quot; untuk menambahkan.
              </p>
            )}

            {items.map((item, index) => (
              <ItemRow
                key={item.id}
                item={item}
                index={index}
                customers={customers}
                products={products}
                onUpdate={updateItem}
                onRemove={removeItem}
                customerButtonRef={(el) => { itemRefs.current[item.id] = el }}
              />
            ))}
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || !name}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ItemRowProps {
  item: ItemFormData
  index: number
  customers: Customer[]
  products: Product[]
  onUpdate: (id: string, field: keyof ItemFormData, value: string) => void
  onRemove: (id: string) => void
  customerButtonRef?: (el: HTMLButtonElement | null) => void
}

function ItemRow({ item, index, customers, products, onUpdate, onRemove, customerButtonRef }: ItemRowProps) {
  const [customerOpen, setCustomerOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)

  return (
    <div className="p-3 border rounded-lg space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Item {index + 1}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={() => onRemove(item.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Customer */}
        <div className="space-y-1">
          <Label className="text-xs">Pelanggan *</Label>
          <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={customerButtonRef}
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal h-9 text-sm"
              >
                {item.zone_id
                  ? customers.find((c) => c.id === item.zone_id)?.name
                  : "Pilih pelanggan"}
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Cari pelanggan..." />
                <CommandList className="max-h-[200px] overflow-y-auto">
                  <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.name}
                        onSelect={() => {
                          onUpdate(item.id, 'zone_id', customer.id)
                          setCustomerOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            item.zone_id === customer.id ? "opacity-100" : "opacity-0"
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

        {/* Product */}
        <div className="space-y-1">
          <Label className="text-xs">Produk *</Label>
          <Popover open={productOpen} onOpenChange={setProductOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal h-9 text-sm"
              >
                {item.product_id
                  ? products.find((p) => p.id.toString() === item.product_id)?.name
                  : "Pilih produk"}
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Cari produk..." />
                <CommandList className="max-h-[200px] overflow-y-auto">
                  <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {products.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.name}
                        onSelect={() => {
                          onUpdate(item.id, 'product_id', product.id.toString())
                          setProductOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            item.product_id === product.id.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {product.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Qty */}
        <div className="space-y-1">
          <Label className="text-xs">Qty Order</Label>
          <Input
            type="number"
            min="0"
            value={item.order_qty}
            onChange={(e) => onUpdate(item.id, 'order_qty', e.target.value)}
            placeholder="0"
            className="h-9"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <Label className="text-xs">Catatan</Label>
          <Input
            value={item.notes}
            onChange={(e) => onUpdate(item.id, 'notes', e.target.value)}
            placeholder="Catatan..."
            className="h-9"
          />
        </div>
      </div>
    </div>
  )
}

// Edit Dialog
interface EditCollectionDialogProps {
  collection: Collection
  customers: Customer[]
  products: Product[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCollectionDialog({ collection, customers, products, open, onOpenChange }: EditCollectionDialogProps) {
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [name, setName] = useState(collection.name)
  const [description, setDescription] = useState(collection.description || '')
  const [items, setItems] = useState<ItemFormData[]>([])
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const refreshData = useCallback(() => {
    mutate((key: string) => typeof key === 'string' && key.startsWith(COLLECTIONS_KEY_PREFIX))
  }, [mutate])

  useEffect(() => {
    if (open) {
      setFetching(true)
      getCollectionWithItems(collection.id).then(result => {
        setFetching(false)
        if (result.collection) {
          setName(result.collection.name)
          setDescription(result.collection.description || '')
          setItems(result.collection.items.map(item => ({
            id: item.id.toString(),
            zone_id: item.zone_id || '',
            product_id: item.product_id?.toString() || '',
            order_qty: item.order_qty?.toString() || '',
            notes: item.notes || '',
          })))
        }
      })
    }
  }, [open, collection.id])

  useEffect(() => {
    if (lastAddedId && itemRefs.current[lastAddedId]) {
      itemRefs.current[lastAddedId]?.focus()
      setLastAddedId(null)
    }
  }, [lastAddedId, items])

  const addItem = () => {
    const newId = generateId()
    setItems([
      ...items,
      {
        id: newId,
        zone_id: '',
        product_id: '',
        order_qty: '',
        notes: '',
      },
    ])
    setLastAddedId(newId)
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof ItemFormData, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const collectionItems: Omit<CollectionItemInsert, 'collection_id'>[] = items
      .filter(item => item.zone_id && item.product_id)
      .map(item => ({
        zone_id: item.zone_id || null,
        product_id: item.product_id ? Number(item.product_id) : null,
        order_qty: item.order_qty ? Number(item.order_qty) : null,
        notes: item.notes || null,
      }))

    const result = await updateCollection(
      collection.id,
      { name, description: description || null },
      collectionItems
    )

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Koleksi berhasil diperbarui')
      onOpenChange(false)
      refreshData()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Koleksi</DialogTitle>
        </DialogHeader>
        {fetching ? (
          <div className="py-8 text-center text-muted-foreground">Memuat...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Koleksi *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Item Transaksi</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Item
                </Button>
              </div>

              {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  Belum ada item.
                </p>
              )}

              {items.map((item, index) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  customers={customers}
                  products={products}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  customerButtonRef={(el) => { itemRefs.current[item.id] = el }}
                />
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading || !name}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
