'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/lib/supabase/hooks'
import { TRACKS, type TrackKey } from '@/lib/types'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { EmptyState } from '@/components/empty-state'
import Link from 'next/link'
import { BookOpen, Trophy, Flame, Target, ArrowRight, GraduationCap } from 'lucide-react'

interface TrackProgress {
  track: TrackKey
  totalLessons: number
  completedLessons: number
}

export function DashboardContent() {
  const { user, profile, supabase, loading } = useUser()
  const [trackProgress, setTrackProgress] = useState<TrackProgress[]>([])
  const [recentAttempts, setRecentAttempts] = useState(0)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!supabase || !user) { setLoadingData(false); return }
    const fetchData = async () => {
      try {
        const { data: topics } = await supabase.from('topics').select('id, track')
        const topicsByTrack: Record<string, string[]> = {}
        ;(topics ?? []).forEach((t: any) => {
          if (!topicsByTrack[t?.track]) topicsByTrack[t.track] = []
          topicsByTrack[t.track].push(t.id)
        })
        const { data: lessons } = await supabase.from('lessons').select('id, topic_id')
        const { data: progress } = await supabase
          .from('user_lesson_progress').select('lesson_id, completed')
          .eq('user_id', user.id).eq('completed', true)
        const completedIds = new Set((progress ?? []).map((p: any) => p?.lesson_id))
        const tp: TrackProgress[] = (Object.keys(TRACKS) as TrackKey[]).map((track) => {
          const topicIds = topicsByTrack[track] ?? []
          const trackLessons = (lessons ?? []).filter((l: any) => topicIds.includes(l?.topic_id))
          const completed = trackLessons.filter((l: any) => completedIds.has(l?.id))
          return { track, totalLessons: trackLessons?.length ?? 0, completedLessons: completed?.length ?? 0 }
        })
        setTrackProgress(tp)
        const { count } = await supabase.from('user_exercise_attempts')
          .select('id', { count: 'exact', head: true }).eq('user_id', user.id)
        setRecentAttempts(count ?? 0)
      } catch (err) { console.error('Dashboard fetch error:', err) }
      setLoadingData(false)
    }
    fetchData()
  }, [supabase, user])

  if (loading || loadingData) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)}
        </div>
      </div>
    )
  }

  const totalLessons = trackProgress.reduce((a, b) => a + b.totalLessons, 0)
  const totalCompleted = trackProgress.reduce((a, b) => a + b.completedLessons, 0)

  return (
    <div className="space-y-8">
      <PageHeader title={`Olá, ${profile?.name ?? 'Estudante'}!`} description="Acompanhe seu progresso e continue estudando." />
      <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Trophy, label: 'XP Total', value: String(profile?.xp_points ?? 0), color: 'bg-primary/10 text-primary' },
          { icon: Flame, label: 'Streak', value: `${profile?.streak_days ?? 0} dias`, color: 'bg-orange-500/10 text-orange-500' },
          { icon: BookOpen, label: 'Aulas Concluídas', value: `${totalCompleted}/${totalLessons}`, color: 'bg-emerald-500/10 text-emerald-500' },
          { icon: Target, label: 'Exercícios Feitos', value: String(recentAttempts), color: 'bg-purple-500/10 text-purple-500' },
        ].map((s) => (
          <StaggerItem key={s.label}>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${s.color.split(' ')[0]}`}><s.icon className={`h-5 w-5 ${s.color.split(' ')[1]}`} /></div>
              <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
            </div></CardContent></Card>
          </StaggerItem>
        ))}
      </Stagger>
      <FadeIn>
        <h2 className="font-display text-xl font-semibold tracking-tight mb-4">Progresso nas Trilhas</h2>
        {totalLessons === 0 ? (
          <EmptyState icon={GraduationCap} title="Nenhum conteúdo disponível ainda" description="As trilhas serão exibidas aqui quando houver aulas cadastradas.">
            <Button asChild><Link href="/trilhas">Explorar Trilhas</Link></Button>
          </EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trackProgress.map((tp) => {
              const info = TRACKS[tp.track]
              const pct = tp.totalLessons > 0 ? Math.round((tp.completedLessons / tp.totalLessons) * 100) : 0
              return (
                <Card key={tp.track} variant="interactive"><CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><span className="text-xl">{info?.icon}</span><span className="font-medium">{info?.label}</span></div>
                    <Badge variant="secondary">{pct}%</Badge>
                  </div>
                  <Progress value={pct} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{tp.completedLessons} de {tp.totalLessons} aulas</span>
                    <Button variant="ghost" size="sm" asChild><Link href={`/trilhas/${tp.track}`}>Continuar <ArrowRight className="h-3 w-3 ml-1" /></Link></Button>
                  </div>
                </CardContent></Card>
              )
            })}
          </div>
        )}
      </FadeIn>
    </div>
  )
}
