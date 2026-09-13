'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { useUser } from '@/lib/supabase/hooks'
import type { Topic } from '@/lib/types'
import { toast } from 'sonner'
import { Save, Eye, Edit3 } from 'lucide-react'

export function NewLessonForm() {
  const { supabase } = useUser()
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicId, setTopicId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [orderIndex, setOrderIndex] = useState('0')
  const [xpReward, setXpReward] = useState('10')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.from('topics').select('*').order('track').order('order_index').then(({ data }) => {
      setTopics((data ?? []) as Topic[])
      if ((data ?? []).length > 0) setTopicId(data![0].id)
    })
  }, [supabase])

  const handleSubmit = async () => {
    if (!supabase || !topicId || !title.trim()) { toast.error('Preencha os campos obrigatórios.'); return }
    setSaving(true)
    const { error } = await supabase.from('lessons').insert({
      topic_id: topicId, title: title.trim(), content_md: content || null,
      order_index: parseInt(orderIndex) || 0, xp_reward: parseInt(xpReward) || 10,
    })
    setSaving(false)
    if (error) { toast.error('Erro ao criar aula.'); return }
    toast.success('Aula criada!')
    router.push('/admin/conteudo')
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader><CardTitle>Nova Aula</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tópico</Label>
          <Select value={topicId} onValueChange={setTopicId}>
            <SelectTrigger><SelectValue placeholder="Selecione um tópico" /></SelectTrigger>
            <SelectContent>{topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Título</Label><Input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Índice de Ordem</Label><Input type="number" value={orderIndex} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderIndex(e.target.value)} /></div>
          <div className="space-y-2"><Label>XP de Recompensa</Label><Input type="number" value={xpReward} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXpReward(e.target.value)} /></div>
        </div>
        <div className="space-y-2">
          <Label>Conteúdo (Markdown + KaTeX)</Label>
          <Tabs defaultValue="editor">
            <TabsList><TabsTrigger value="editor"><Edit3 className="h-4 w-4 mr-1" /> Editor</TabsTrigger><TabsTrigger value="preview"><Eye className="h-4 w-4 mr-1" /> Pré-visualizar</TabsTrigger></TabsList>
            <TabsContent value="editor" className="mt-3">
              <Textarea value={content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} className="min-h-[300px] font-mono text-sm" placeholder="Escreva em Markdown... Use $$ para fórmulas KaTeX." />
            </TabsContent>
            <TabsContent value="preview" className="mt-3">
              <div className="min-h-[300px] p-4 border rounded-lg">{content ? <MarkdownRenderer content={content} /> : <p className="text-muted-foreground italic">Nada para pré-visualizar...</p>}</div>
            </TabsContent>
          </Tabs>
        </div>
        <Button onClick={handleSubmit} loading={saving}><Save className="h-4 w-4 mr-1" /> Criar Aula</Button>
      </CardContent>
    </Card>
  )
}
