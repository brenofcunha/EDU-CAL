'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUser } from '@/lib/supabase/hooks'
import { TRACKS, type TrackKey } from '@/lib/types'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

export function NewTopicForm() {
  const { supabase } = useUser()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [track, setTrack] = useState<string>('calculo1')
  const [orderIndex, setOrderIndex] = useState('0')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!supabase) return
    if (!title.trim()) { toast.error('Título obrigatório.'); return }
    setSaving(true)
    const { error } = await supabase.from('topics').insert({
      title: title.trim(), description: description.trim() || null, track, order_index: parseInt(orderIndex) || 0,
    })
    setSaving(false)
    if (error) { toast.error('Erro ao criar tópico.'); return }
    toast.success('Tópico criado!')
    router.push('/admin/conteudo')
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Novo Tópico</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label>Título</Label><Input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} /></div>
        <div className="space-y-2"><Label>Descrição</Label><Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Trilha</Label>
            <Select value={track} onValueChange={setTrack}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(TRACKS) as [TrackKey, typeof TRACKS[TrackKey]][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Índice de Ordem</Label><Input type="number" value={orderIndex} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderIndex(e.target.value)} /></div>
        </div>
        <Button onClick={handleSubmit} loading={saving}><Save className="h-4 w-4 mr-1" /> Criar Tópico</Button>
      </CardContent>
    </Card>
  )
}
