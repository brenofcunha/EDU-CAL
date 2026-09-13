'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

export function NewTrackForm() {
  const { supabase } = useUser()
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('∫')
  const [color, setColor] = useState('from-blue-500 to-indigo-600')
  const [orderIndex, setOrderIndex] = useState('0')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!supabase || !label.trim() || !slug.trim()) { toast.error('Nome e identificador são obrigatórios.'); return }
    const normalizedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-')
    setSaving(true)
    const { error } = await supabase.from('tracks').insert({
      slug: normalizedSlug, label: label.trim(), description: description.trim() || null,
      icon: icon.trim() || '∫', color: color.trim() || 'from-blue-500 to-indigo-600', order_index: Number(orderIndex) || 0,
    })
    setSaving(false)
    if (error) { toast.error(error.code === '23505' ? 'Esse identificador já existe.' : error.message); return }
    toast.success('Trilha criada!')
    router.push('/admin/conteudo')
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Nova Trilha</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label>Nome da trilha</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Cálculo Numérico" /></div>
        <div className="space-y-2"><Label>Identificador da URL</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="calculo-numerico" /><p className="text-xs text-muted-foreground">Use letras minúsculas, números e hífens.</p></div>
        <div className="space-y-2"><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Ícone</Label><Input value={icon} onChange={(e) => setIcon(e.target.value)} /></div><div className="space-y-2"><Label>Ordem</Label><Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} /></div></div>
        <div className="space-y-2"><Label>Classes de cor Tailwind</Label><Input value={color} onChange={(e) => setColor(e.target.value)} /></div>
        <Button onClick={handleSubmit} loading={saving}><Save className="mr-1 h-4 w-4" />Criar Trilha</Button>
      </CardContent>
    </Card>
  )
}
