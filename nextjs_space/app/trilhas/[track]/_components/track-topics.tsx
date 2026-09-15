'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import { EmptyState } from '@/components/empty-state'
import { useSupabase } from '@/lib/supabase/hooks'
import type { Topic, Lesson } from '@/lib/types'
import { BookOpen, ChevronRight, Inbox, Search, X } from 'lucide-react'

export function TrackTopics({ track }: { track: string }) {
  const supabase = useSupabase()
  const [topics, setTopics] = useState<(Topic & { lessons: Lesson[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const fetch = async () => {
      const { data: topicsData } = await supabase
        .from('topics')
        .select('*')
        .eq('track', track)
        .order('order_index')
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index')

      const topicsWithLessons = (topicsData ?? []).map((t: any) => ({
        ...t,
        lessons: (lessonsData ?? []).filter((l: any) => l?.topic_id === t?.id),
      }))
      setTopics(topicsWithLessons)
      setLoading(false)
    }
    fetch()
  }, [supabase, track])

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div>
  }

  if (topics.length === 0) {
    return <EmptyState icon={Inbox} title="Nenhum tópico cadastrado" description="Os tópicos desta trilha aparecerão aqui quando forem adicionados." />
  }

  const normalizedSearch = search.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const filteredTopics = topics
    .map((topic) => {
      if (!normalizedSearch) return topic

      const topicMatches = [topic.title, topic.description ?? '']
        .join(' ')
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(normalizedSearch)

      return {
        ...topic,
        lessons: topicMatches
          ? topic.lessons
          : topic.lessons.filter((lesson) => lesson.title.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch)),
      }
    })
    .filter((topic) => topic.lessons.length > 0)

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar aulas nesta trilha..."
          aria-label="Buscar aulas nesta trilha"
          className="pl-10 pr-10"
        />
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSearch('')}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            aria-label="Limpar busca"
            title="Limpar busca"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {filteredTopics.length === 0 ? (
        <EmptyState icon={Search} title="Nenhuma aula encontrada" description="Tente buscar por outro título ou tópico." />
      ) : (
        <Stagger className="space-y-4">
          {filteredTopics.map((topic) => (
        <StaggerItem key={topic.id}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{topic.title}</h3>
                  {topic.description && <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>}
                </div>
                <Badge variant="secondary"><BookOpen className="h-3 w-3 mr-1" />{topic.lessons.length} aulas</Badge>
              </div>
              {(topic?.lessons?.length ?? 0) > 0 && (
                <div className="space-y-1 mt-4">
                  {topic.lessons.map((lesson: Lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/trilhas/${track}/${topic.id}/${lesson.id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{lesson.title}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
