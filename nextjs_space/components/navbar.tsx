'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useUser } from '@/lib/supabase/hooks'
import { BookOpen, MessageSquare, LayoutDashboard, LogIn, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const publicLinks = [
  { href: '/trilhas', label: 'Trilhas', icon: BookOpen },
  { href: '/forum', label: 'Fórum', icon: MessageSquare },
]

export function Navbar() {
  const { user, loading } = useUser()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1200px] flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="text-2xl">∫</span>
          <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">EduCalc</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {publicLinks.map((link) => (
            <Button key={link.href} variant={pathname?.startsWith(link.href) ? 'secondary' : 'ghost'} size="sm" asChild>
              <Link href={link.href}>
                <link.icon className="h-4 w-4 mr-1" />
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!loading && (
            user ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-1" />
                  Entrar
                </Link>
              </Button>
            )
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-2">
          {publicLinks.map((link) => (
            <Button key={link.href} variant={pathname?.startsWith(link.href) ? 'secondary' : 'ghost'} className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
              <Link href={link.href}>
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </header>
  )
}
