'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface StatsSectionProps {
  totalOrder: number
  totalReturn: number
  totalBilled: number
  totalReturned: number
}

export function StatsSection({
  totalOrder,
  totalReturn,
  totalBilled,
  totalReturned,
}: StatsSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }
  const [showStats, setShowStats] = useState(false)

  return (
    <div>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full mb-3 md:hidden"
        onClick={() => setShowStats(!showStats)}
      >
        {showStats ? (
          <>
            <ChevronUp className="h-4 w-4 mr-2" />
            Sembunyikan Statistik
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-2" />
            Tampilkan Statistik
          </>
        )}
      </Button>

      {/* Stats Cards - Hidden by default on mobile, always visible on md+ */}
      <div className={`grid gap-4 grid-cols-2 lg:grid-cols-4 ${showStats ? 'block' : 'hidden'} md:grid`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalOrder.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalBilled)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Retur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {totalReturn.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalReturned)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qty Bersih
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalOrder - totalReturn).toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nilai Bersih
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBilled - totalReturned)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
