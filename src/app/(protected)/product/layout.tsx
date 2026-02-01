import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Produk | Diolah Enak',
  description: 'Kelola produk Anda',
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
