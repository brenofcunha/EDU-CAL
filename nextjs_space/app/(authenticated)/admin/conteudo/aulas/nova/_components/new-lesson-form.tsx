'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarkdownEditor, ResourceManager, normalizeMarkdown, type ContentResource } from '@/components/content-editor'
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
  const [resources, setResources] = useState<ContentResource[]>([])
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
      topic_id: topicId, title: title.trim(), content_md: normalizeMarkdown(content) || null,
      order_index: parseInt(orderIndex) || 0, xp_reward: parseInt(xpReward) || 10,
      resources,
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
        <MarkdownEditor label="Conteúdo da aula (Markdown + KaTeX)" value={content} onChange={setContent} placeholder="Digite a aula e use a barra de formatação..." />
        {supabase && <ResourceManager supabase={supabase} resources={resources} onChange={setResources} />}
        <Button onClick={handleSubmit} loading={saving}><Save className="h-4 w-4 mr-1" /> Criar Aula</Button>
      </CardContent>
    </Card>
  )
}
