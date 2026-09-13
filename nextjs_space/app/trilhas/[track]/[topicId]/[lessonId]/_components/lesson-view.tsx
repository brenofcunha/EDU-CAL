'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { ResourceList } from '@/components/content-editor'
import { ExerciseCard } from '@/components/exercise-card'
import { EmptyState } from '@/components/empty-state'
import { useUser } from '@/lib/supabase/hooks'
import { Navbar } from '@/components/navbar'
import type { Lesson, Exercise } from '@/lib/types'
import { FadeIn } from '@/components/ui/animate'
import { toast } from 'sonner'
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Star,
  StarOff,
  FileText,
} from 'lucide-react'

interface Props {
  track: string
  topicId: string
  lessonId: string
}

export function LessonView({ track, topicId, lessonId }: Props) {
  const { user, supabase } = useUser()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [completed, setCompleted] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [siblings, setSiblings] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const fetch = async () => {
      const { data: lessonData } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
      setLesson(lessonData as Lesson | null)

      const { data: exData } = await supabase.from('exercises').select('*').eq('topic_id', topicId).order('created_at')
      setExercises((exData ?? []) as Exercise[])

      const { data: siblingsData } = await supabase.from('lessons').select('*').eq('topic_id', topicId).order('order_index')
      setSiblings((siblingsData ?? []) as Lesson[])

      if (user) {
        const { data: prog } = await supabase.from('user_lesson_progress').select('completed').eq('user_id', user.id).eq('lesson_id', lessonId).single()
        setCompleted(prog?.completed ?? false)

        const { data: favData } = await supabase.from('study_favorites').select('id').eq('user_id', user.id).eq('item_type', 'lesson').eq('item_id', lessonId).single()
        setIsFav(!!favData)
      }
      setLoading(false)
    }
    fetch()
  }, [supabase, lessonId, topicId, user])

  const markComplete = async () => {
    if (!supabase || !user) { toast.error('Faça login para marcar como concluída.'); return }
    const { error } = await supabase.from('user_lesson_progress').upsert({
      user_id: user.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })
    if (!error) {
      setCompleted(true)
      toast.success('Aula marcada como concluída! +' + (lesson?.xp_reward ?? 10) + ' XP')
    }
  }

  const toggleFav = async () => {
    if (!supabase || !user) { toast.error('Faça login para favoritar.'); return }
    if (isFav) {
      await supabase.from('study_favorites').delete().eq('user_id', user.id).eq('item_type', 'lesson').eq('item_id', lessonId)
      setIsFav(false)
      toast.success('Removido dos favoritos.')
    } else {
      await supabase.from('study_favorites').insert({ user_id: user.id, item_type: 'lesson', item_id: lessonId })
      setIsFav(true)
      toast.success('Adicionado aos favoritos!')
    }
  }

  const handleAnswer = async (exerciseId: string, answer: string, isCorrect: boolean) => {
    if (!supabase || !user) return
    await supabase.from('user_exercise_attempts').insert({
      user_id: user.id, exercise_id: exerciseId, answer, is_correct: isCorrect,
    })
  }

  const currentIdx = siblings.findIndex((s) => s?.id === lessonId)
  const prevLesson = currentIdx > 0 ? siblings[currentIdx - 1] : null
  const nextLesson = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null

  if (loading) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="mx-auto max-w-[900px] px-4 py-12 space-y-4">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="mx-auto max-w-[900px] px-4 py-12">
          <EmptyState icon={FileText} title="Aula não encontrada" description="Essa aula pode não existir ou foi removida." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-[900px] px-4 py-12">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/trilhas/${track}`)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar à trilha
        </Button>

        <FadeIn>
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">{lesson.title}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{lesson.xp_reward} XP</Badge>
                    {completed && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle className="h-3 w-3 mr-1" /> Concluída</Badge>}
                  </div>
                </div>
                {user && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleFav}>
                      {isFav ? <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> : <StarOff className="h-5 w-5" />}
                    </Button>
                  </div>
                )}
              </div>
              {lesson.content_md && <MarkdownRenderer content={lesson.content_md} />}
              <ResourceList resources={lesson.resources} />
              {user && !completed && (
                <Button onClick={markComplete} className="mt-6">
                  <CheckCircle className="h-4 w-4 mr-1" /> Marcar como Concluída
                </Button>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Exercícios */}
        {exercises.length > 0 && (
          <FadeIn delay={0.2}>
            <h2 className="font-display text-xl font-semibold tracking-tight mb-4">Exercícios</h2>
            <div className="space-y-4">
              {exercises.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} onAnswer={handleAnswer} />
              ))}
            </div>
          </FadeIn>
        )}

        {/* Nav between lessons */}
        <div className="flex justify-between mt-8">
          {prevLesson ? (
            <Button variant="outline" onClick={() => router.push(`/trilhas/${track}/${topicId}/${prevLesson.id}`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> {prevLesson.title}
            </Button>
          ) : <div />}
          {nextLesson ? (
            <Button onClick={() => router.push(`/trilhas/${track}/${topicId}/${nextLesson.id}`)}>
              {nextLesson.title} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : <div />}
        </div>
      </div>
    </div>
  )
}
