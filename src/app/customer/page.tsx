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
import { Phone, MapPin } from 'lucide-react'

export default async function CustomerPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('customer')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pelanggan</h1>
          <p className="text-muted-foreground">Kelola daftar pelanggan/zona Anda</p>
        </div>
        <CustomerForm />
      </div>

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
              Belum ada pelanggan. Klik tombol &quot;Tambah Pelanggan&quot; untuk menambahkan.
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
                <TableHead>Telepon</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
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
                    Belum ada pelanggan. Klik tombol &quot;Tambah Pelanggan&quot; untuk menambahkan.
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
