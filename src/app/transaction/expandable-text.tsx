'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ExpandableTextProps {
  text: string | null
  maxLength?: number
  className?: string
}

export function ExpandableText({ text, maxLength = 50, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false)

  if (!text) return <span className="text-muted-foreground">-</span>

  const shouldTruncate = text.length > maxLength

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={cn("inline", className)}>
      {expanded ? text : `${text.slice(0, maxLength)}...`}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="ml-1 text-primary hover:underline text-xs font-medium"
      >
        {expanded ? 'Tutup' : 'Lihat'}
      </button>
    </span>
  )
}
