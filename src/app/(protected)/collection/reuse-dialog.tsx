'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { TRANSACTIONS_KEY_PREFIX } from '@/hooks/use-transactions'
import { DASHBOARD_STATS_KEY } from '@/hooks/use-dashboard-stats'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { reuseCollection } from './actions'
import type { Collection } from '@/types/database'
import { Play, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ReuseDialogProps {
  collection: Collection & { item_count: number }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReuseDialog({ collection, open, onOpenChange }: ReuseDialogProps) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [success, setSuccess] = useState<{ count: number } | null>(null)

  const refreshData = useCallback(() => {
    mutate((key: string) => typeof key === 'string' && key.startsWith(TRANSACTIONS_KEY_PREFIX))
    mutate(DASHBOARD_STATS_KEY)
  }, [mutate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await reuseCollection(collection.id, date)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setSuccess({ count: result.count || 0 })
      refreshData()
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset success state after dialog closes
    setTimeout(() => setSuccess(null), 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Gunakan Koleksi</DialogTitle>
          <DialogDescription>
            {success
              ? 'Transaksi berhasil dibuat'
              : `Buat transaksi baru dari koleksi "${collection.name}"`
            }
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              {success.count} transaksi berhasil dibuat
            </p>
            <p className="text-sm text-muted-foreground">
              Status: Pending
            </p>
            <div className="flex gap-2 justify-center mt-6">
              <Button variant="outline" onClick={handleClose}>
                Tutup
              </Button>
              <Button onClick={() => {
                handleClose()
                router.push('/transaction')
              }}>
                Lihat Transaksi
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reuse-date">Tanggal Transaksi *</Label>
              <Input
                id="reuse-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-11/12"
              />
              <p className="text-xs text-muted-foreground">
                Semua transaksi akan dibuat dengan tanggal ini
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">{collection.item_count} item</span> akan dibuat menjadi transaksi dengan status <span className="font-medium text-yellow-600 dark:text-yellow-500">pending</span>
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Membuat...' : 'Buat Transaksi'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
