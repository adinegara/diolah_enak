'use client'
export const runtime = "edge";

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AppLogo } from '@/components/app-logo'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Gradient glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <AppLogo size="lg" className="flex-col" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Selamat Datang
            </h1>
            <p className="text-muted-foreground">
              Masuk untuk mengelola transaksi produk Anda
            </p>
          </div>

          {/* Google Login Button */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
              size="lg"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Masuk dengan Google
            </Button>
          </div>

          {/* App tagline */}
          <p className="text-sm text-muted-foreground">
            Sistem Manajemen Transaksi
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Dengan masuk, Anda menyetujui kebijakan privasi kami
        </p>
      </footer>
    </div>
  )
}
