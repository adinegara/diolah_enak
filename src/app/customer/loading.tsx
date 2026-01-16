import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-28 bg-secondary rounded-xl animate-pulse" />
          <div className="h-4 w-44 bg-secondary rounded-xl animate-pulse mt-2" />
        </div>
        <div className="h-10 w-40 bg-secondary rounded-xl animate-pulse" />
      </div>

      {/* Table skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 flex-1 bg-secondary rounded-xl animate-pulse" />
                <div className="h-4 w-28 bg-secondary rounded-xl animate-pulse" />
                <div className="h-4 w-32 bg-secondary rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
