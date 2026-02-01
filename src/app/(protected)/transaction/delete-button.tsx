'use client'

import { useState } from 'react'
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { deleteTransaction } from './actions'
import { TRANSACTIONS_KEY_PREFIX } from '@/hooks/use-transactions'
import { DASHBOARD_STATS_KEY } from '@/hooks/use-dashboard-stats'
import { Trash2 } from 'lucide-react'

export function DeleteTransactionButton({ id }: { id: number }) {
  const { mutate } = useSWRConfig()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const result = await deleteTransaction(id)
    setLoading(false)
    setOpen(false)

    if (result.success) {
      // Refresh all transaction queries and dashboard stats (keeps existing data visible while revalidating)
      mutate((key: string) => typeof key === 'string' && key.startsWith(TRANSACTIONS_KEY_PREFIX))
      mutate(DASHBOARD_STATS_KEY)
    }
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
          <DialogTitle>Hapus Transaksi</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
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
