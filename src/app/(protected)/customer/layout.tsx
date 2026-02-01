import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pelanggan | Diolah Enak',
  description: 'Kelola pelanggan Anda',
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
