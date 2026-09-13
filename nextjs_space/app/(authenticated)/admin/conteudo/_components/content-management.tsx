'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/layouts/page-header'
import { EmptyState } from '@/components/empty-state'
import { useUser } from '@/lib/supabase/hooks'
import { TRACKS } from '@/lib/types'
import type { Topic, Lesson, Exercise } from '@/lib/types'
import { toast } from 'sonner'
import { Plus, BookOpen, FileText, Target, Trash2, Inbox } from 'lucide-react'

export function ContentManagement() {
  const { supabase } = useUser()
  const [topics, setTopics] = useState<Topic[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    if (!supabase) { setLoading(false); return }
    const [t, l, e] = await Promise.all([
      supabase.from('topics').select('*').order('track').order('order_index'),
      supabase.from('lessons').select('*').order('order_index'),
      supabase.from('exercises').select('*').order('created_at', { ascending: false }),
    ])
    setTopics((t.data ?? []) as Topic[])
    setLessons((l.data ?? []) as Lesson[])
    setExercises((e.data ?? []) as Exercise[])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [supabase])

  const deleteTopic = async (id: string) => {
    if (!supabase || !confirm('Tem certeza? Isso excluirá todas as aulas e exercícios deste tópico.')) return
    await supabase.from('topics').delete().eq('id', id)
    toast.success('Tópico excluído.')
    fetchAll()
  }

  const deleteLesson = async (id: string) => {
    if (!supabase || !confirm('Excluir esta aula?')) return
    await supabase.from('lessons').delete().eq('id', id)
    toast.success('Aula excluída.')
    fetchAll()
  }

  const deleteExercise = async (id: string) => {
    if (!supabase || !confirm('Excluir este exercício?')) return
    await supabase.from('exercises').delete().eq('id', id)
    toast.success('Exercício excluído.')
    fetchAll()
  }

  if (loading) return <div className="h-64 bg-muted animate-pulse rounded-lg" />

  return (
    <div className="space-y-6">
      <PageHeader title="Gerenciar Conteúdo" description="Tópicos, aulas e exercícios." />

      <Tabs defaultValue="topics">
        <TabsList>
          <TabsTrigger value="topics"><BookOpen className="h-4 w-4 mr-1" /> Tópicos ({topics.length})</TabsTrigger>
          <TabsTrigger value="lessons"><FileText className="h-4 w-4 mr-1" /> Aulas ({lessons.length})</TabsTrigger>
          <TabsTrigger value="exercises"><Target className="h-4 w-4 mr-1" /> Exercícios ({exercises.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button asChild><Link href="/admin/conteudo/topicos/novo"><Plus className="h-4 w-4 mr-1" /> Novo Tópico</Link></Button>
          </div>
          {topics.length === 0 ? (
            <EmptyState icon={Inbox} title="Nenhum tópico" description="Crie o primeiro tópico." />
          ) : (
            <Card><CardContent className="pt-6 overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Trilha</TableHead><TableHead>Ordem</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {topics.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell><Badge variant="secondary">{TRACKS[t.track as keyof typeof TRACKS]?.label ?? t.track}</Badge></TableCell>
                      <TableCell>{t.order_index}</TableCell>
                      <TableCell><Button variant="ghost" size="icon-sm" onClick={() => deleteTopic(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button asChild><Link href="/admin/conteudo/aulas/nova"><Plus className="h-4 w-4 mr-1" /> Nova Aula</Link></Button>
          </div>
          {lessons.length === 0 ? (
            <EmptyState icon={Inbox} title="Nenhuma aula" description="Crie a primeira aula." />
          ) : (
            <Card><CardContent className="pt-6 overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>XP</TableHead><TableHead>Ordem</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {lessons.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.title}</TableCell>
                      <TableCell>{l.xp_reward}</TableCell>
                      <TableCell>{l.order_index}</TableCell>
                      <TableCell><Button variant="ghost" size="icon-sm" onClick={() => deleteLesson(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="exercises" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button asChild><Link href="/admin/conteudo/exercicios/novo"><Plus className="h-4 w-4 mr-1" /> Novo Exercício</Link></Button>
          </div>
          {exercises.length === 0 ? (
            <EmptyState icon={Inbox} title="Nenhum exercício" />
          ) : (
            <Card><CardContent className="pt-6 overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Questão</TableHead><TableHead>Tipo</TableHead><TableHead>Dificuldade</TableHead><TableHead>XP</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {exercises.map((ex) => (
                    <TableRow key={ex.id}>
                      <TableCell className="font-medium max-w-[300px] truncate">{ex.question}</TableCell>
                      <TableCell><Badge variant="secondary">{ex.type === 'mc' ? 'Múltipla Escolha' : ex.type === 'tf' ? 'V/F' : 'Aberta'}</Badge></TableCell>
                      <TableCell>{ex.difficulty}</TableCell>
                      <TableCell>{ex.xp_reward}</TableCell>
                      <TableCell><Button variant="ghost" size="icon-sm" onClick={() => deleteExercise(ex.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
