import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Diolah Enak',
  description: 'Dashboard untuk mengelola transaksi',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
