'use client'

import { useSearchParams } from 'next/navigation'
import { useCustomers } from '@/hooks/use-customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { CustomerForm, EditCustomerButton } from './customer-form'
import { DeleteCustomerButton } from './delete-button'
import { SearchInput } from './search-input'
import { Pagination } from './pagination'
import { Phone, MapPin } from 'lucide-react'

export function CustomerContent() {
  const searchParams = useSearchParams()

  const filters = {
    search: searchParams.get('search') || undefined,
    page: searchParams.get('page') || undefined,
  }

  const { data, error, isLoading } = useCustomers(filters)

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
          <h1 className="text-2xl font-bold">Pelanggan</h1>
          <p className="text-muted-foreground">Kelola daftar pelanggan/zona Anda</p>
        </div>
        <CustomerForm />
      </div>

      {/* Search */}
      <SearchInput />

      {isLoading ? (
        <>
          {/* Mobile Skeleton */}
          <div className="grid gap-4 md:hidden">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          {/* Desktop Skeleton */}
          <Card className="hidden md:block">
            <CardContent className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="grid gap-4 md:hidden">
            {data?.customers.map((customer) => (
              <Card key={customer.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <div className="flex gap-1">
                      <EditCustomerButton customer={customer} />
                      <DeleteCustomerButton id={customer.id} name={customer.name} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                  {customer.description && (
                    <p className="text-sm text-muted-foreground">
                      {customer.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            {(!data?.customers || data.customers.length === 0) && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {filters.search
                    ? `Tidak ada pelanggan dengan nama "${filters.search}"`
                    : 'Belum ada pelanggan. Klik tombol "Tambah Pelanggan" untuk menambahkan.'}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground/60">Nama</TableHead>
                    <TableHead className="text-muted-foreground/60">Telepon</TableHead>
                    <TableHead className="text-muted-foreground/60">Alamat</TableHead>
                    <TableHead className="text-muted-foreground/60">Catatan</TableHead>
                    <TableHead className="text-muted-foreground/60 w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.phone || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.address || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <EditCustomerButton customer={customer} />
                          <DeleteCustomerButton id={customer.id} name={customer.name} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.customers || data.customers.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {filters.search
                          ? `Tidak ada pelanggan dengan nama "${filters.search}"`
                          : 'Belum ada pelanggan. Klik tombol "Tambah Pelanggan" untuk menambahkan.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
