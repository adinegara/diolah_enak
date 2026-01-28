import { ChefHat } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function AppLogo({ size = 'md', showText = true, className }: AppLogoProps) {
  const sizeClasses = {
    sm: {
      container: 'w-8 h-8 rounded-lg',
      icon: 'w-4 h-4',
      text: 'text-base',
      gap: 'gap-2',
    },
    md: {
      container: 'w-10 h-10 rounded-xl',
      icon: 'w-5 h-5',
      text: 'text-xl',
      gap: 'gap-3',
    },
    lg: {
      container: 'w-16 h-16 rounded-2xl',
      icon: 'w-9 h-9',
      text: 'text-2xl',
      gap: 'gap-3',
    },
  }

  const s = sizeClasses[size]

  return (
    <div className={cn('flex items-center', s.gap, className)}>
      <div
        className={cn(
          s.container,
          'bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20'
        )}
      >
        <ChefHat className={cn(s.icon, 'text-primary-foreground')} />
      </div>
      {showText && (
        <span className={cn(s.text, 'font-bold text-foreground')}>Diolah Enak</span>
      )}
    </div>
  )
}
