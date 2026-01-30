'use client'

import PullToRefresh from 'react-simple-pull-to-refresh'
import { useSWRConfig } from 'swr'
import { TRANSACTIONS_KEY_PREFIX } from '@/hooks/use-transactions'
import { DASHBOARD_STATS_KEY } from '@/hooks/use-dashboard-stats'

interface RefreshableContentProps {
  children: React.ReactNode
}

export function RefreshableContent({ children }: RefreshableContentProps) {
  const { mutate } = useSWRConfig()

  const handleRefresh = async () => {
    // Refresh all SWR caches
    await mutate((key: string) => typeof key === 'string' && key.startsWith(TRANSACTIONS_KEY_PREFIX))
    await mutate(DASHBOARD_STATS_KEY)
  }

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className="flex justify-center py-2 text-muted-foreground text-sm">
          Tarik untuk refresh...
        </div>
      }
      refreshingContent={
        <div className="flex justify-center py-2 text-muted-foreground text-sm">
          Memuat...
        </div>
      }
    >
      {children}
    </PullToRefresh>
  )
}
