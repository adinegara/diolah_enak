'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (term) {
        params.set('search', term)
        params.set('page', '1')
      } else {
        params.delete('search')
      }
      startTransition(() => {
        router.push(`?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Cari nama produk..."
        defaultValue={searchParams.get('search') ?? ''}
        onChange={(e) => handleSearch(e.target.value)}
        className={`pl-9 ${isPending ? 'opacity-50' : ''}`}
      />
    </div>
  )
}
