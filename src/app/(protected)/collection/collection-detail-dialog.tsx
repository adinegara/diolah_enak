'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { getCollectionWithItems } from './actions'
import type { Customer, Product, CollectionItemWithDetails } from '@/types/database'
import { Play, Package, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface CollectionDetailDialogProps {
  collectionId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onReuse: () => void
  customers: Customer[]
  products: Product[]
}

export function CollectionDetailDialog({
  collectionId,
  open,
  onOpenChange,
  onReuse,
}: CollectionDetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [collection, setCollection] = useState<{
    id: number
    name: string
    description: string | null
    items: CollectionItemWithDetails[]
  } | null>(null)

  useEffect(() => {
    if (open) {
      setLoading(true)
      getCollectionWithItems(collectionId).then(result => {
        setLoading(false)
        if (result.collection) {
          setCollection(result.collection)
        }
      })
    }
  }, [open, collectionId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{collection?.name || 'Detail Koleksi'}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : collection ? (
          <div className="space-y-4">
            {collection.description && (
              <p className="text-sm text-muted-foreground">{collection.description}</p>
            )}

            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
              {collection.items.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Item {index + 1}</span>
                      <span className="text-sm font-medium">Qty: {item.order_qty || 0}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.customer?.name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.product?.name || '-'}</span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-2">{item.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collection.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>{item.customer?.name || '-'}</TableCell>
                      <TableCell>{item.product?.name || '-'}</TableCell>
                      <TableCell className="text-right">{item.order_qty || 0}</TableCell>
                      <TableCell className="text-muted-foreground">{item.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {collection.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Tidak ada item
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
              <Button onClick={onReuse}>
                <Play className="h-4 w-4 mr-2" />
                Gunakan Koleksi
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Gagal memuat data</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
