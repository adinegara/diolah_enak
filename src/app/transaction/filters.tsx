'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { Customer, Product } from '@/types/database'

interface TransactionFiltersProps {
  customers: Customer[]
  products: Product[]
}

const months = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

export function TransactionFilters({ customers, products }: TransactionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedCustomer = searchParams.get('customer') || ''
  const selectedProduct = searchParams.get('product') || ''
  const selectedMonth = searchParams.get('month') || ''
  const selectedYear = searchParams.get('year') || ''

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/transaction?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/transaction')
  }

  const hasFilters = selectedCustomer || selectedProduct || selectedMonth || selectedYear

  return (
    <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
      <Select value={selectedCustomer} onValueChange={(v) => updateFilter('customer', v)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Semua Pelanggan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Pelanggan</SelectItem>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedProduct} onValueChange={(v) => updateFilter('product', v)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Semua Produk" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Produk</SelectItem>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id.toString()}>
              {product.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedMonth} onValueChange={(v) => updateFilter('month', v)}>
        <SelectTrigger className="w-full md:w-[140px]">
          <SelectValue placeholder="Bulan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Bulan</SelectItem>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedYear} onValueChange={(v) => updateFilter('year', v)}>
        <SelectTrigger className="w-full md:w-[120px]">
          <SelectValue placeholder="Tahun" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tahun</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  )
}
