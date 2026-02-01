'use client'

import { useSearchParams } from 'next/navigation'
import { useCollections } from '@/hooks/use-collections'
import { CollectionCard } from './collection-card'
import { CollectionForm } from './collection-form'
import { SearchInput } from './search-input'
import { Pagination } from './pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import type { Customer, Product } from '@/types/database'

interface CollectionContentProps {
  customers: Customer[]
  products: Product[]
}

export function CollectionContent({ customers, products }: CollectionContentProps) {
  const searchParams = useSearchParams()

  const filters = {
    search: searchParams.get('search') || undefined,
    page: searchParams.get('page') || undefined,
  }

  const { data, error, isLoading } = useCollections(filters)

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Terjadi kesalahan saat memuat data. Silakan coba lagi.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Koleksi</h1>
          <p className="text-muted-foreground">Kumpulan transaksi yang dapat digunakan ulang</p>
        </div>
        <CollectionForm customers={customers} products={products} />
      </div>

      {/* Search */}
      <SearchInput />

      {/* Collection Cards Grid */}
      {isLoading ? (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data?.collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                customers={customers}
                products={products}
              />
            ))}
          </div>

          {(!data?.collections || data.collections.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              {filters.search
                ? `Tidak ada koleksi dengan nama "${filters.search}"`
                : 'Belum ada koleksi. Klik tombol "Tambah Koleksi" untuk menambahkan.'}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {!isLoading && data && (
        <Pagination
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.totalItems}
        />
      )}
    </div>
  )
}
