'use client'

import { useState, useCallback } from 'react'
import { useSWRConfig } from 'swr'
import { CUSTOMERS_KEY_PREFIX } from '@/hooks/use-customers'
import { DASHBOARD_STATS_KEY } from '@/hooks/use-dashboard-stats'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { deleteCustomer } from './actions'
import { Trash2 } from 'lucide-react'

export function DeleteCustomerButton({ id, name }: { id: string; name: string }) {
  const { mutate } = useSWRConfig()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const refreshData = useCallback(() => {
    mutate((key: string) => typeof key === 'string' && key.startsWith(CUSTOMERS_KEY_PREFIX))
    mutate(DASHBOARD_STATS_KEY)
  }, [mutate])

  const handleDelete = async () => {
    setLoading(true)
    await deleteCustomer(id)
    setLoading(false)
    setOpen(false)
    refreshData()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Pelanggan</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus pelanggan &quot;{name}&quot;? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
