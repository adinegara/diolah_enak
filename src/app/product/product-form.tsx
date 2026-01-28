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
import { createProduct, updateProduct } from './actions'
import type { Product } from '@/types/database'
import { Plus, Pencil } from 'lucide-react'

interface ProductFormProps {
  product?: Product
  trigger?: React.ReactNode
}

export function ProductForm({ product, trigger }: ProductFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!product

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      price: formData.get('price') ? Number(formData.get('price')) : null,
      customer_price: formData.get('customer_price') ? Number(formData.get('customer_price')) : null,
    }

    const result = isEditing
      ? await updateProduct(product.id, data)
      : await createProduct(data)

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={product?.name}
              placeholder="Masukkan nama produk"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              name="description"
              defaultValue={product?.description || ''}
              placeholder="Deskripsi produk (opsional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Harga (Rp)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              defaultValue={product?.price || ''}
              placeholder="Masukkan harga"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_price">Harga Customer (Rp)</Label>
            <Input
              id="customer_price"
              name="customer_price"
              type="number"
              min="0"
              defaultValue={product?.customer_price || ''}
              placeholder="Masukkan harga customer"
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

export function EditProductButton({ product }: { product: Product }) {
  return (
    <ProductForm
      product={product}
      trigger={
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      }
    />
  )
}
