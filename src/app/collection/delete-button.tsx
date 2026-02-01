'use client'

import { useState, useCallback } from 'react'
import { useSWRConfig } from 'swr'
import { COLLECTIONS_KEY_PREFIX } from '@/hooks/use-collections'
import { Button } from '@/components/ui/button'
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
import { deleteCollection } from './actions'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteCollectionButtonProps {
  id: number
  name: string
  trigger?: React.ReactNode
}

export function DeleteCollectionButton({ id, name, trigger }: DeleteCollectionButtonProps) {
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const refreshData = useCallback(() => {
    mutate((key: string) => typeof key === 'string' && key.startsWith(COLLECTIONS_KEY_PREFIX))
  }, [mutate])

  const handleDelete = async () => {
    setLoading(true)
    const result = await deleteCollection(id)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Koleksi berhasil dihapus')
      setOpen(false)
      refreshData()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Koleksi</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus koleksi &quot;{name}&quot;? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
