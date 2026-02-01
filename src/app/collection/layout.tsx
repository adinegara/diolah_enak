import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/sidebar'

export const metadata: Metadata = {
  title: 'Koleksi | Diolah Enak',
  description: 'Kelola koleksi transaksi Anda',
}

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
        {children}
      </main>
    </div>
  )
}
