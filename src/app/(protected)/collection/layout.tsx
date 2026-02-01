import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Koleksi | Diolah Enak',
  description: 'Kelola koleksi transaksi Anda',
}

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
