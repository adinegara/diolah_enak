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
import { ProductForm, EditProductButton } from './product-form'
import { DeleteProductButton } from './delete-button'
import { SearchInput } from './search-input'
import { Pagination } from './pagination'

const ITEMS_PER_PAGE = 10

interface ProductPageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function ProductPage({ searchParams }: ProductPageProps) {
  const params = await searchParams
  const search = params.search || ''
  const currentPage = Number(params.page) || 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  const supabase = await createClient()

  // Build query with search
  let query = supabase
    .from('product')
    .select('*', { count: 'exact' })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: products, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produk</h1>
          <p className="text-muted-foreground">Kelola daftar produk Anda</p>
        </div>
        <ProductForm />
      </div>

      {/* Search */}
      <SearchInput />

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {products?.map((product) => (
          <Card key={product.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex gap-1">
                  <EditProductButton product={product} />
                  <DeleteProductButton id={product.id} name={product.name} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {product.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {product.description}
                </p>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Harga</p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Harga Customer</p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(product.customer_price)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!products || products.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {search
                ? `Tidak ada produk dengan nama "${search}"`
                : 'Belum ada produk. Klik tombol "Tambah Produk" untuk menambahkan.'}
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
                <TableHead className="text-muted-foreground/60">Deskripsi</TableHead>
                <TableHead className="text-muted-foreground/60 text-right">Harga</TableHead>
                <TableHead className="text-muted-foreground/60 text-right">Harga Customer</TableHead>
                <TableHead className="text-muted-foreground/60 w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.customer_price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <EditProductButton product={product} />
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!products || products.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {search
                      ? `Tidak ada produk dengan nama "${search}"`
                      : 'Belum ada produk. Klik tombol "Tambah Produk" untuk menambahkan.'}
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
