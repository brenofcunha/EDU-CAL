'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUser } from '@/lib/supabase/hooks'
import type { Track } from '@/lib/types'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { MarkdownEditor, ResourceManager, normalizeMarkdown, type ContentResource } from '@/components/content-editor'

export function NewTopicForm({ editId }: { editId?: string }) {
  const { supabase } = useUser()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [resources, setResources] = useState<ContentResource[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [track, setTrack] = useState<string>('')
  const [orderIndex, setOrderIndex] = useState('0')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase) return
    const load = async () => {
      const [{ data: trackData }, { data: topicData }] = await Promise.all([
        supabase.from('tracks').select('*').order('order_index'),
        editId ? supabase.from('topics').select('*').eq('id', editId).single() : Promise.resolve({ data: null }),
      ])
      const availableTracks = (trackData ?? []) as Track[]
      setTracks(availableTracks)
      if (topicData) {
        setTitle(topicData.title); setDescription(topicData.description ?? ''); setTrack(topicData.track)
        setOrderIndex(String(topicData.order_index)); setResources(topicData.resources ?? [])
      } else if (availableTracks[0]) setTrack(availableTracks[0].slug)
    }
    void load()
  }, [supabase, editId])

  const handleSubmit = async () => {
    if (!supabase) return
    if (!title.trim()) { toast.error('Título obrigatório.'); return }
    setSaving(true)
    const payload = { title: title.trim(), description: normalizeMarkdown(description) || null, track, order_index: parseInt(orderIndex) || 0, resources }
    const { error } = editId
      ? await supabase.from('topics').update(payload).eq('id', editId)
      : await supabase.from('topics').insert(payload)
    setSaving(false)
    if (error) { toast.error('Erro ao criar tópico.'); return }
    toast.success(editId ? 'Tópico atualizado!' : 'Tópico criado!')
    router.push('/admin/conteudo')
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>{editId ? 'Editar Tópico' : 'Novo Tópico'}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label>Título</Label><Input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} /></div>
        <MarkdownEditor label="Descrição do tópico" value={description} onChange={setDescription} placeholder="Descreva o que o estudante aprenderá neste tópico..." minHeight="min-h-[180px]" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Trilha</Label>
            <Select value={track} onValueChange={setTrack}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tracks.map((item) => <SelectItem key={item.slug} value={item.slug}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Índice de Ordem</Label><Input type="number" value={orderIndex} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderIndex(e.target.value)} /></div>
        </div>
        {supabase && <ResourceManager supabase={supabase} resources={resources} onChange={setResources} />}
        <Button onClick={handleSubmit} loading={saving}><Save className="h-4 w-4 mr-1" /> {editId ? 'Salvar Alterações' : 'Criar Tópico'}</Button>
      </CardContent>
    </Card>
  )
}
