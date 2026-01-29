import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardContent } from './dashboard-content'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Ringkasan data transaksi Anda</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/transaction?action=new">+ Transaksi Baru</Link>
          </Button>
        </div>
      </div>

      {/* Client Component with SWR for real-time data */}
      <DashboardContent />
    </div>
  )
}
