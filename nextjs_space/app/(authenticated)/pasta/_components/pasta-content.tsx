'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layouts/page-header'
import { EmptyState } from '@/components/empty-state'
import { useUser } from '@/lib/supabase/hooks'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import type { StudyNote, StudyFavorite } from '@/lib/types'
import { FileText, Star, Clock, Plus, Trash2, BookOpen, Target } from 'lucide-react'
import { toast } from 'sonner'

export function PastaContent() {
  const { user, supabase, loading: authLoading } = useUser()
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [favorites, setFavorites] = useState<(StudyFavorite & { title?: string })[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !user) { setLoading(false); return }
    const fetch = async () => {
      const { data: notesData } = await supabase.from('study_notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
      setNotes((notesData ?? []) as StudyNote[])

      const { data: favsData } = await supabase.from('study_favorites').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      // Enrich favorites with titles
      const enriched = await Promise.all((favsData ?? []).map(async (f: any) => {
        if (f?.item_type === 'lesson') {
          const { data } = await supabase.from('lessons').select('title').eq('id', f.item_id).single()
          return { ...f, title: data?.title ?? 'Aula' }
        }
        if (f?.item_type === 'exercise') {
          const { data } = await supabase.from('exercises').select('question').eq('id', f.item_id).single()
          return { ...f, title: (data?.question ?? 'Exercício').substring(0, 80) }
        }
        return f
      }))
      setFavorites(enriched)

      const { data: histData } = await supabase.from('user_exercise_attempts').select('*, exercises(question)').eq('user_id', user.id).order('attempted_at', { ascending: false }).limit(20)
      setHistory(histData ?? [])

      setLoading(false)
    }
    fetch()
  }, [supabase, user])

  const deleteNote = async (id: string) => {
    if (!supabase) return
    await supabase.from('study_notes').delete().eq('id', id)
    setNotes((prev) => prev.filter((n) => n?.id !== id))
    toast.success('Anotação excluída.')
  }

  const removeFav = async (id: string) => {
    if (!supabase) return
    await supabase.from('study_favorites').delete().eq('id', id)
    setFavorites((prev) => prev.filter((f) => f?.id !== id))
    toast.success('Favorito removido.')
  }

  if (authLoading || loading) {
    return <div className="space-y-4"><div className="h-8 w-48 bg-muted animate-pulse rounded" /><div className="h-64 bg-muted animate-pulse rounded-lg" /></div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pasta de Estudo"
        description="Suas anotações, favoritos e histórico de exercícios."
        actions={<Button asChild><Link href="/pasta/notas/nova"><Plus className="h-4 w-4 mr-1" /> Nova Anotação</Link></Button>}
      />

      <Tabs defaultValue="notas">
        <TabsList>
          <TabsTrigger value="notas"><FileText className="h-4 w-4 mr-1" /> Anotações</TabsTrigger>
          <TabsTrigger value="favoritos"><Star className="h-4 w-4 mr-1" /> Favoritos</TabsTrigger>
          <TabsTrigger value="historico"><Clock className="h-4 w-4 mr-1" /> Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="notas" className="mt-6">
          {notes.length === 0 ? (
            <EmptyState icon={FileText} title="Nenhuma anotação" description="Crie sua primeira anotação para começar.">
              <Button asChild><Link href="/pasta/notas/nova"><Plus className="h-4 w-4 mr-1" /> Nova Anotação</Link></Button>
            </EmptyState>
          ) : (
            <Stagger className="grid gap-4 md:grid-cols-2">
              {notes.map((note) => (
                <StaggerItem key={note.id}>
                  <Card variant="interactive">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <Link href={`/pasta/notas/${note.id}`} className="flex-1">
                          <h3 className="font-medium hover:text-primary transition-colors">{note.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            <SafeDate date={note.updated_at} options={{ dateStyle: 'medium' }} />
                          </p>
                        </Link>
                        <Button variant="ghost" size="icon-sm" onClick={() => deleteNote(note.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </TabsContent>

        <TabsContent value="favoritos" className="mt-6">
          {favorites.length === 0 ? (
            <EmptyState icon={Star} title="Nenhum favorito" description="Favorite aulas ou exercícios para acesso rápido." />
          ) : (
            <div className="space-y-2">
              {favorites.map((fav) => (
                <Card key={fav.id}>
                  <CardContent className="pt-4 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {fav.item_type === 'lesson' ? <BookOpen className="h-4 w-4 text-primary" /> : <Target className="h-4 w-4 text-purple-500" />}
                      <span className="text-sm">{fav?.title ?? fav.item_type}</span>
                      <Badge variant="secondary" className="text-xs">{fav.item_type === 'lesson' ? 'Aula' : 'Exercício'}</Badge>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => removeFav(fav.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historico" className="mt-6">
          {history.length === 0 ? (
            <EmptyState icon={Clock} title="Nenhuma tentativa" description="Seu histórico de exercícios aparecerá aqui." />
          ) : (
            <div className="space-y-2">
              {history.map((h: any) => (
                <Card key={h?.id}>
                  <CardContent className="pt-4 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${h?.is_correct ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-sm truncate max-w-[300px]">{h?.exercises?.question ?? 'Exercício'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      <SafeDate date={h?.attempted_at} options={{ dateStyle: 'short', timeStyle: 'short' }} />
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
