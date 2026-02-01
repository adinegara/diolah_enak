'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Calendar, ChevronDown } from 'lucide-react'
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
const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

const formatDateShort = (date: Date) => {
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getDateRangeLabels = () => {
  const today = new Date()
  const todayStr = formatDateShort(today)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = formatDateShort(yesterday)

  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const startOfWeekStr = formatDateShort(startOfWeek)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfMonthStr = formatDateShort(startOfMonth)

  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const startOfYearStr = formatDateShort(startOfYear)

  return {
    today: `Hari Ini (${todayStr})`,
    yesterday: `Kemarin (${yesterdayStr})`,
    thisWeek: `Minggu Ini (${startOfWeekStr} - ${todayStr})`,
    thisMonth: `Bulan Ini (${startOfMonthStr} - ${todayStr})`,
    thisYear: `Tahun Ini (${startOfYearStr} - ${todayStr})`,
  }
}

export function TransactionFilters({ customers, products }: TransactionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedCustomers = searchParams.get('customer')?.split(',').filter(Boolean) || []
  const selectedProducts = searchParams.get('product')?.split(',').filter(Boolean) || []
  const selectedDateFilter = searchParams.get('dateFilter') || ''
  const selectedDateFrom = searchParams.get('dateFrom') || ''
  const selectedDateTo = searchParams.get('dateTo') || ''
  const selectedMonth = searchParams.get('month') || ''
  const selectedYear = searchParams.get('year') || ''

  const [customType, setCustomType] = useState<string>('date')
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false)
  const [productPopoverOpen, setProductPopoverOpen] = useState(false)

  // Initialize custom type based on URL params and auto-open popover
  useEffect(() => {
    if (selectedDateFilter === 'custom') {
      if (selectedMonth) {
        setCustomType('month')
      } else if (selectedYear && !selectedMonth && !selectedDateFrom) {
        setCustomType('year')
      } else if (selectedDateFrom && selectedDateTo) {
        setCustomType('range')
      } else {
        setCustomType('date')
        // Auto-open popover when custom is selected without any params
        if (!selectedDateFrom && !selectedDateTo && !selectedMonth && !selectedYear) {
          setPopoverOpen(true)
        }
      }
    }
  }, [selectedDateFilter, selectedDateFrom, selectedDateTo, selectedMonth, selectedYear])

  const toggleCustomer = (customerId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newSelected = selectedCustomers.includes(customerId)
      ? selectedCustomers.filter(id => id !== customerId)
      : [...selectedCustomers, customerId]

    if (newSelected.length > 0) {
      params.set('customer', newSelected.join(','))
    } else {
      params.delete('customer')
    }
    params.delete('page')
    router.push(`/transaction?${params.toString()}`)
  }

  const toggleProduct = (productId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newSelected = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId]

    if (newSelected.length > 0) {
      params.set('product', newSelected.join(','))
    } else {
      params.delete('product')
    }
    params.delete('page')
    router.push(`/transaction?${params.toString()}`)
  }

  const clearCustomers = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('customer')
    params.delete('page')
    router.push(`/transaction?${params.toString()}`)
  }

  const clearProducts = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('product')
    params.delete('page')
    router.push(`/transaction?${params.toString()}`)
  }

  const handleDateFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Clear all date params
    params.delete('dateFilter')
    params.delete('dateFrom')
    params.delete('dateTo')
    params.delete('month')
    params.delete('year')

    if (value === 'custom') {
      setPopoverOpen(true)
      params.set('dateFilter', 'custom')
    } else if (value && value !== 'all') {
      params.set('dateFilter', value)
    }

    router.push(`/transaction?${params.toString()}`)
  }

  const applyCustomDate = (type: string, values: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Clear old date params
    params.delete('dateFrom')
    params.delete('dateTo')
    params.delete('month')
    params.delete('year')
    params.set('dateFilter', 'custom')

    if (type === 'date' && values.date) {
      params.set('dateFrom', values.date)
      params.set('dateTo', values.date)
    } else if (type === 'range') {
      if (values.dateFrom) params.set('dateFrom', values.dateFrom)
      if (values.dateTo) params.set('dateTo', values.dateTo)
    } else if (type === 'month') {
      if (values.month) params.set('month', values.month)
      if (values.year) params.set('year', values.year)
    } else if (type === 'year') {
      if (values.year) params.set('year', values.year)
    }

    router.push(`/transaction?${params.toString()}`)
    setPopoverOpen(false)
  }

  const clearFilters = () => {
    setPopoverOpen(false)
    router.push('/transaction')
  }

  const getDateFilterLabel = () => {
    const labels = getDateRangeLabels()
    if (!selectedDateFilter) return 'Semua Waktu'
    if (selectedDateFilter === 'today') return labels.today
    if (selectedDateFilter === 'yesterday') return labels.yesterday
    if (selectedDateFilter === 'thisWeek') return labels.thisWeek
    if (selectedDateFilter === 'thisMonth') return labels.thisMonth
    if (selectedDateFilter === 'thisYear') return labels.thisYear
    if (selectedDateFilter === 'custom') {
      if (selectedMonth && selectedYear) {
        const monthLabel = months.find(m => m.value === selectedMonth)?.label
        return `${monthLabel} ${selectedYear}`
      }
      if (selectedYear && !selectedMonth) {
        return `Tahun ${selectedYear}`
      }
      if (selectedDateFrom && selectedDateTo && selectedDateFrom === selectedDateTo) {
        return new Date(selectedDateFrom).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      }
      if (selectedDateFrom && selectedDateTo) {
        return `${new Date(selectedDateFrom).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date(selectedDateTo).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
      }
      return 'Kustom'
    }
    return 'Semua Waktu'
  }

  const hasFilters = selectedCustomers.length > 0 || selectedProducts.length > 0 || selectedDateFilter

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
        {/* Customer Multi-Select */}
        <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-[180px] justify-between">
              <span className="truncate">
                {selectedCustomers.length === 0
                  ? 'Semua Pelanggan'
                  : `${selectedCustomers.length} Pelanggan`}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2" align="start">
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {customers.map((customer) => (
                <label
                  key={customer.id}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded cursor-pointer"
                >
                  <Checkbox
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={() => toggleCustomer(customer.id)}
                  />
                  <span className="text-sm truncate">{customer.name}</span>
                </label>
              ))}
            </div>
            {selectedCustomers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={clearCustomers}
              >
                Reset
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Product Multi-Select */}
        <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-[180px] justify-between">
              <span className="truncate">
                {selectedProducts.length === 0
                  ? 'Semua Produk'
                  : `${selectedProducts.length} Produk`}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2" align="start">
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded cursor-pointer"
                >
                  <Checkbox
                    checked={selectedProducts.includes(product.id.toString())}
                    onCheckedChange={() => toggleProduct(product.id.toString())}
                  />
                  <span className="text-sm truncate">{product.name}</span>
                </label>
              ))}
            </div>
            {selectedProducts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={clearProducts}
              >
                Reset
              </Button>
            )}
          </PopoverContent>
        </Popover>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <div className="flex gap-2">
          <Select value={selectedDateFilter || 'all'} onValueChange={handleDateFilterChange}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue>{getDateFilterLabel()}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Waktu</SelectItem>
              <SelectItem value="today">{getDateRangeLabels().today}</SelectItem>
              <SelectItem value="yesterday">{getDateRangeLabels().yesterday}</SelectItem>
              <SelectItem value="thisWeek">{getDateRangeLabels().thisWeek}</SelectItem>
              <SelectItem value="thisMonth">{getDateRangeLabels().thisMonth}</SelectItem>
              <SelectItem value="thisYear">{getDateRangeLabels().thisYear}</SelectItem>
              <SelectItem value="custom">Kustom...</SelectItem>
            </SelectContent>
          </Select>

          {selectedDateFilter === 'custom' && (
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          )}
        </div>

        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipe Filter</Label>
              <Select value={customType} onValueChange={setCustomType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Tanggal Tertentu</SelectItem>
                  <SelectItem value="range">Rentang Tanggal</SelectItem>
                  <SelectItem value="month">Bulan Tertentu</SelectItem>
                  <SelectItem value="year">Tahun Tertentu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {customType === 'date' && (
              <div className="space-y-2">
                <Label>Pilih Tanggal</Label>
                <Input
                  type="date"
                  defaultValue={selectedDateFrom}
                  onChange={(e) => applyCustomDate('date', { date: e.target.value })}
                />
              </div>
            )}

            {customType === 'range' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Dari Tanggal</Label>
                  <Input
                    type="date"
                    id="dateFrom"
                    defaultValue={selectedDateFrom}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sampai Tanggal</Label>
                  <Input
                    type="date"
                    id="dateTo"
                    defaultValue={selectedDateTo}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    const dateFrom = (document.getElementById('dateFrom') as HTMLInputElement)?.value
                    const dateTo = (document.getElementById('dateTo') as HTMLInputElement)?.value
                    applyCustomDate('range', { dateFrom, dateTo })
                  }}
                >
                  Terapkan
                </Button>
              </div>
            )}

            {customType === 'month' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Bulan</Label>
                    <Select defaultValue={selectedMonth} onValueChange={(v) => {
                      const year = (document.getElementById('monthYear') as HTMLSelectElement)?.value || currentYear.toString()
                      applyCustomDate('month', { month: v, year })
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun</Label>
                    <Select defaultValue={selectedYear || currentYear.toString()}>
                      <SelectTrigger id="monthYear">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {customType === 'year' && (
              <div className="space-y-2">
                <Label>Pilih Tahun</Label>
                <Select defaultValue={selectedYear} onValueChange={(v) => applyCustomDate('year', { year: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Selected Items Display */}
      {(selectedCustomers.length > 0 || selectedProducts.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {selectedCustomers.map((customerId) => {
            const customer = customers.find(c => c.id === customerId)
            return customer ? (
              <div
                key={customerId}
                className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
              >
                <Checkbox
                  checked
                  onCheckedChange={() => toggleCustomer(customerId)}
                  className="h-3 w-3"
                />
                <span>{customer.name}</span>
              </div>
            ) : null
          })}
          {selectedProducts.map((productId) => {
            const product = products.find(p => p.id.toString() === productId)
            return product ? (
              <div
                key={productId}
                className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
              >
                <Checkbox
                  checked
                  onCheckedChange={() => toggleProduct(productId)}
                  className="h-3 w-3"
                />
                <span>{product.name}</span>
              </div>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}
