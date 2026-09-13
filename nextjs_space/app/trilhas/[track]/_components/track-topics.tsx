'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import { EmptyState } from '@/components/empty-state'
import { useSupabase } from '@/lib/supabase/hooks'
import type { Topic, Lesson } from '@/lib/types'
import { BookOpen, ChevronRight, Inbox } from 'lucide-react'

export function TrackTopics({ track }: { track: string }) {
  const supabase = useSupabase()
  const [topics, setTopics] = useState<(Topic & { lessons: Lesson[] })[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <Stagger className="space-y-4">
      {topics.map((topic) => (
        <StaggerItem key={topic.id}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{topic.title}</h3>
                  {topic.description && <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>}
                </div>
                <Badge variant="secondary"><BookOpen className="h-3 w-3 mr-1" />{topic?.lessons?.length ?? 0} aulas</Badge>
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
  )
}
