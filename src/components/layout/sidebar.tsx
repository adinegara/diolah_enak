'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppLogo } from '@/components/app-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transaction', label: 'Transaksi', icon: Receipt },
  { href: '/product', label: 'Produk', icon: Package },
  { href: '/customer', label: 'Pelanggan', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newValue = !isCollapsed
    setIsCollapsed(newValue)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newValue))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile menu button - only show when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'md:w-[72px]' : 'md:w-64',
          'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "p-4 border-b border-border flex items-center",
            isCollapsed ? "md:justify-center" : "justify-between"
          )}>
            <AppLogo size="sm" showText={!isCollapsed} className={cn(
              "transition-all duration-300",
              isCollapsed && "md:[&>span]:hidden"
            )} />
            {/* Collapse toggle button - desktop only */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden md:flex h-8 w-8 shrink-0",
                isCollapsed && "md:hidden"
              )}
              onClick={toggleCollapsed}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          {/* Expand button when collapsed */}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8 mx-auto mt-2"
              onClick={toggleCollapsed}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    isCollapsed && 'md:justify-center md:px-0'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className={cn(
                    'transition-opacity duration-300',
                    isCollapsed ? 'md:hidden' : ''
                  )}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Theme Toggle & Logout */}
          <div className="p-4 border-t border-border space-y-2">
            <ThemeToggle collapsed={isCollapsed} />
            <Button
              variant="ghost"
              title={isCollapsed ? 'Keluar' : undefined}
              className={cn(
                'w-full gap-3 text-muted-foreground hover:text-foreground',
                isCollapsed ? 'md:justify-center md:px-0' : 'justify-start'
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className={cn(
                'transition-opacity duration-300',
                isCollapsed ? 'md:hidden' : ''
              )}>
                Keluar
              </span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Spacer for main content */}
      <div className={cn(
        'hidden md:block transition-all duration-300',
        isCollapsed ? 'md:w-[72px]' : 'md:w-64'
      )} />
    </>
  )
}
