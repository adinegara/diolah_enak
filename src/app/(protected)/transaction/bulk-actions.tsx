'use client'

import { useState } from 'react'
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { bulkUpdateStatus, bulkDeleteTransactions } from './actions'
import { TRANSACTIONS_KEY_PREFIX } from '@/hooks/use-transactions'
import { DASHBOARD_STATS_KEY } from '@/hooks/use-dashboard-stats'
import { X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface BulkActionsProps {
  selectedIds: number[]
  onClearSelection: () => void
}

export function BulkActions({ selectedIds, onClearSelection }: BulkActionsProps) {
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [status, setStatus] = useState<string>('')

  const refreshData = () => {
    mutate((key: string) => typeof key === 'string' && key.startsWith(TRANSACTIONS_KEY_PREFIX))
    mutate(DASHBOARD_STATS_KEY)
  }

  const handleBulkUpdate = async () => {
    if (!status || selectedIds.length === 0) return

    setLoading(true)
    const result = await bulkUpdateStatus(selectedIds, status)
    setLoading(false)

    if (result.success) {
      toast.success(`${selectedIds.length} transaksi berhasil diupdate`)
      onClearSelection()
      setStatus('')
      refreshData()
    } else {
      toast.error(result.error || 'Gagal mengupdate transaksi')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    setDeleting(true)
    const result = await bulkDeleteTransactions(selectedIds)
    setDeleting(false)

    if (result.success) {
      toast.success(`${selectedIds.length} transaksi berhasil dihapus`)
      onClearSelection()
      refreshData()
    } else {
      toast.error(result.error || 'Gagal menghapus transaksi')
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <div className="fixed -bottom-1 md:bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background border rounded-lg shadow-lg p-3 w-[90%] max-w-sm md:w-auto md:max-w-none">
      {/* Header with count and close */}
      <div className="flex items-center justify-between mb-3 md:hidden">
        <span className="text-sm font-medium">
          {selectedIds.length} dipilih
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile: 2 rows */}
      <div className="flex flex-col gap-2 md:hidden">
        {/* Row 1: Update status */}
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleBulkUpdate}
            disabled={!status || loading || deleting}
          >
            {loading ? 'Mengupdate...' : 'Update'}
          </Button>
        </div>
        {/* Row 2: Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              disabled={loading || deleting}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus {selectedIds.length} Transaksi?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Semua transaksi yang dipilih akan dihapus secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Desktop: single row */}
      <div className="hidden md:flex items-center gap-3">
        <span className="text-sm font-medium">
          {selectedIds.length} dipilih
        </span>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={handleBulkUpdate}
          disabled={!status || loading || deleting}
        >
          {loading ? 'Mengupdate...' : 'Update Status'}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              disabled={loading || deleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus {selectedIds.length} Transaksi?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Semua transaksi yang dipilih akan dihapus secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
