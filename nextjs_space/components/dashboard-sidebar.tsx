'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUser } from '@/lib/supabase/hooks'
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  MessageSquare,
  Bug,
  User,
  Shield,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trilhas', label: 'Trilhas', icon: BookOpen },
  { href: '/pasta', label: 'Pasta de Estudo', icon: FolderOpen },
  { href: '/forum', label: 'Fórum', icon: MessageSquare },
  { href: '/feedback', label: 'Relatar problema', icon: Bug },
  { href: '/perfil', label: 'Perfil', icon: User },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, supabase } = useUser()

  const handleLogout = async () => {
    await supabase?.auth?.signOut()
    router.push('/')
  }

  return (
    <div className="flex flex-col h-full">
      <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight mb-6 px-2">
        <span className="text-2xl">∫</span>
        <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">EduCalc</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
              pathname?.startsWith('/admin')
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        )}
      </nav>

      <div className="border-t pt-4 space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-muted-foreground truncate">{profile?.name ?? 'Usuário'}</span>
          <ThemeToggle />
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )
}
