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

export default async function ProductPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('product')
    .select('*')
    .order('created_at', { ascending: false })

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
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(product.price)}
              </p>
            </CardContent>
          </Card>
        ))}
        {(!products || products.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada produk. Klik tombol &quot;Tambah Produk&quot; untuk menambahkan.
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
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
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
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Belum ada produk. Klik tombol &quot;Tambah Produk&quot; untuk menambahkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
