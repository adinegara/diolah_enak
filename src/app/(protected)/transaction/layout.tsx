import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transaksi | Diolah Enak',
  description: 'Kelola transaksi Anda',
}

export default function TransactionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
