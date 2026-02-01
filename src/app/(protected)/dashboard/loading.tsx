import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-32 bg-secondary rounded-xl animate-pulse" />
          <div className="h-4 w-48 bg-secondary rounded-xl animate-pulse mt-2" />
        </div>
        <div className="h-10 w-36 bg-secondary rounded-xl animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-secondary rounded-xl animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-secondary rounded-xl animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  )
}
