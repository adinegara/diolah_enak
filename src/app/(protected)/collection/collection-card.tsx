'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Layers, MoreVertical, Pencil, Trash2, Play } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Collection, Customer, Product } from '@/types/database'
import { CollectionDetailDialog } from './collection-detail-dialog'
import { ReuseDialog } from './reuse-dialog'
import { EditCollectionDialog } from './collection-form'
import { DeleteCollectionButton } from './delete-button'

interface CollectionCardProps {
  collection: Collection & { item_count: number }
  customers: Customer[]
  products: Product[]
}

export function CollectionCard({ collection, customers, products }: CollectionCardProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [reuseOpen, setReuseOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      {/* Stacked Card Container */}
      <div className="relative h-48 cursor-pointer group" onClick={() => setDetailOpen(true)}>
        {/* Background cards (stacked effect) */}
        {collection.item_count > 1 && (
          <div
            className="absolute inset-0 bg-card border border-border rounded-xl shadow-sm transition-transform group-hover:rotate-[-4deg]"
            style={{
              transform: 'rotate(-3deg) translateY(4px)',
              zIndex: 1,
            }}
          />
        )}
        {collection.item_count > 2 && (
          <div
            className="absolute inset-0 bg-card border border-border rounded-xl shadow-sm transition-transform group-hover:rotate-[5deg]"
            style={{
              transform: 'rotate(2deg) translateY(8px)',
              zIndex: 0,
            }}
          />
        )}

        {/* Main card */}
        <Card
          className="absolute inset-0 z-10 transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1"
        >
          <CardContent className="p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    setReuseOpen(true)
                  }}>
                    <Play className="h-4 w-4 mr-2" />
                    Gunakan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    setEditOpen(true)
                  }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DeleteCollectionButton
                    id={collection.id}
                    name={collection.name}
                    trigger={
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{collection.name}</h3>
              {collection.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
              <span className="text-sm text-muted-foreground">
                {collection.item_count} item
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  setReuseOpen(true)
                }}
              >
                <Play className="h-3 w-3 mr-1" />
                Gunakan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CollectionDetailDialog
        collectionId={collection.id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onReuse={() => {
          setDetailOpen(false)
          setReuseOpen(true)
        }}
        customers={customers}
        products={products}
      />

      <ReuseDialog
        collection={collection}
        open={reuseOpen}
        onOpenChange={setReuseOpen}
      />

      <EditCollectionDialog
        collection={collection}
        customers={customers}
        products={products}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
