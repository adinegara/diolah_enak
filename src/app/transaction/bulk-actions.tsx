'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { bulkUpdateStatus } from './actions'
import { X } from 'lucide-react'

interface BulkActionsProps {
  selectedIds: number[]
  onClearSelection: () => void
}

export function BulkActions({ selectedIds, onClearSelection }: BulkActionsProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>('')

  const handleBulkUpdate = async () => {
    if (!status || selectedIds.length === 0) return

    setLoading(true)
    const result = await bulkUpdateStatus(selectedIds, status)
    setLoading(false)

    if (result.success) {
      onClearSelection()
      setStatus('')
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background border rounded-lg shadow-lg p-3 flex items-center gap-3">
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
        disabled={!status || loading}
      >
        {loading ? 'Mengupdate...' : 'Update Status'}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClearSelection}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
