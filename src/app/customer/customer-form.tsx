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
import { createCustomer, updateCustomer } from './actions'
import type { Customer } from '@/types/database'
import { Plus, Pencil } from 'lucide-react'

interface CustomerFormProps {
  customer?: Customer
  trigger?: React.ReactNode
}

export function CustomerForm({ customer, trigger }: CustomerFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!customer

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      phone: formData.get('phone') as string || null,
      address: formData.get('address') as string || null,
    }

    const result = isEditing
      ? await updateCustomer(customer.id, data)
      : await createCustomer(data)

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
            Tambah Pelanggan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Pelanggan *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={customer?.name}
              placeholder="Masukkan nama pelanggan"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">No. Telepon</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={customer?.phone || ''}
              placeholder="Masukkan nomor telepon"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              name="address"
              defaultValue={customer?.address || ''}
              placeholder="Masukkan alamat"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Catatan</Label>
            <Input
              id="description"
              name="description"
              defaultValue={customer?.description || ''}
              placeholder="Catatan tambahan (opsional)"
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

export function EditCustomerButton({ customer }: { customer: Customer }) {
  return (
    <CustomerForm
      customer={customer}
      trigger={
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      }
    />
  )
}
