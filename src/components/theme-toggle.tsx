'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  collapsed?: boolean
}

export function ThemeToggle({ collapsed }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        className={cn(
          'w-full gap-3 text-muted-foreground',
          collapsed ? 'md:justify-center md:px-0' : 'justify-start'
        )}
      >
        <Sun className="h-5 w-5 shrink-0" />
        <span className={cn(collapsed && 'md:hidden')}>Tema</span>
      </Button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      title={collapsed ? (isDark ? 'Mode Terang' : 'Mode Gelap') : undefined}
      className={cn(
        'w-full gap-3 text-muted-foreground hover:text-foreground',
        collapsed ? 'md:justify-center md:px-0' : 'justify-start'
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? (
        <Sun className="h-5 w-5 shrink-0" />
      ) : (
        <Moon className="h-5 w-5 shrink-0" />
      )}
      <span className={cn('transition-opacity duration-300', collapsed && 'md:hidden')}>
        {isDark ? 'Mode Terang' : 'Mode Gelap'}
      </span>
    </Button>
  )
}
