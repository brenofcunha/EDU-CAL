'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layouts/page-header'
import { useUser } from '@/lib/supabase/hooks'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import { Users, BookOpen, MessageSquare, Target, FileText, Shield, Bug } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function AdminDashboard() {
  const { supabase } = useUser()
  const [stats, setStats] = useState({ users: 0, topics: 0, lessons: 0, exercises: 0, posts: 0, feedback: 0 })

  useEffect(() => {
    if (!supabase) return
    const fetch = async () => {
      const [u, t, l, e, p, f] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('topics').select('id', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('exercises').select('id', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }),
        supabase.from('user_feedback').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      ])
      setStats({
        users: u.count ?? 0, topics: t.count ?? 0, lessons: l.count ?? 0,
        exercises: e.count ?? 0, posts: p.count ?? 0, feedback: f.count ?? 0,
      })
    }
    fetch()
  }, [supabase])

  const cards = [
    { label: 'Usuários', value: stats.users, icon: Users, href: '/admin/usuarios', color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Tópicos', value: stats.topics, icon: BookOpen, href: '/admin/conteudo', color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Aulas', value: stats.lessons, icon: FileText, href: '/admin/conteudo', color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Exercícios', value: stats.exercises, icon: Target, href: '/admin/conteudo', color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Posts do Fórum', value: stats.posts, icon: MessageSquare, href: '/admin/forum', color: 'text-pink-500 bg-pink-500/10' },
    { label: 'Feedbacks novos', value: stats.feedback, icon: Bug, href: '/admin/feedbacks', color: 'text-rose-500 bg-rose-500/10' },
  ]

  const quickLinks = [
    { label: 'Gerenciar Usuários', href: '/admin/usuarios', icon: Users },
    { label: 'Gerenciar Conteúdo', href: '/admin/conteudo', icon: BookOpen },
    { label: 'Moderar Fórum', href: '/admin/forum', icon: MessageSquare },
    { label: 'Gerenciar Tags', href: '/admin/tags', icon: Shield },
    { label: 'Logs de Auditoria', href: '/admin/logs', icon: FileText },
    { label: 'Feedbacks dos Usuários', href: '/admin/feedbacks', icon: Bug },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title="Painel Administrativo" description="Visão geral da plataforma." />
      <Stagger className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <StaggerItem key={c.label}>
            <Link href={c.href}>
              <Card variant="interactive"><CardContent className="pt-6">
                <div className={`rounded-lg p-2.5 w-fit mb-3 ${c.color}`}><c.icon className="h-5 w-5" /></div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </CardContent></Card>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
      <div>
        <h2 className="font-semibold text-lg mb-4">Acesso Rápido</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((l) => (
            <Button key={l.href} variant="outline" className="justify-start h-auto py-4" asChild>
              <Link href={l.href}><l.icon className="h-5 w-5 mr-3" />{l.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
