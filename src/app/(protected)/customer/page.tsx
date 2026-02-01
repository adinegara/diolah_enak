export const dynamic = 'force-dynamic'
export const runtime = "edge";

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CustomerForm, EditCustomerButton } from './customer-form'
import { DeleteCustomerButton } from './delete-button'
import { SearchInput } from './search-input'
import { Pagination } from './pagination'
import { Phone, MapPin } from 'lucide-react'

const ITEMS_PER_PAGE = 10

interface CustomerPageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function CustomerPage({ searchParams }: CustomerPageProps) {
  const params = await searchParams
  const search = params.search || ''
  const currentPage = Number(params.page) || 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  const supabase = await createClient()

  // Build query with search
  let query = supabase
    .from('customer')
    .select('*', { count: 'exact' })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: customers, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

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

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {customers?.map((customer) => (
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
        {(!customers || customers.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {search
                ? `Tidak ada pelanggan dengan nama "${search}"`
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
              {customers?.map((customer) => (
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
              {(!customers || customers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {search
                      ? `Tidak ada pelanggan dengan nama "${search}"`
                      : 'Belum ada pelanggan. Klik tombol "Tambah Pelanggan" untuk menambahkan.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
      />
    </div>
  )
}
