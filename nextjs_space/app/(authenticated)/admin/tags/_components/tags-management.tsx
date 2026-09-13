'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layouts/page-header'
import { useUser } from '@/lib/supabase/hooks'
import type { ForumTag } from '@/lib/types'
import { toast } from 'sonner'
import { Plus, Trash2, Tag } from 'lucide-react'

export function TagsManagement() {
  const { supabase } = useUser()
  const [tags, setTags] = useState<ForumTag[]>([])
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [loading, setLoading] = useState(true)

  const fetchTags = async () => {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase.from('forum_tags').select('*').order('name')
    setTags((data ?? []) as ForumTag[])
    setLoading(false)
  }

  useEffect(() => { fetchTags() }, [supabase])

  const addTag = async () => {
    if (!supabase || !newName.trim()) { toast.error('Nome obrigatório.'); return }
    const { error } = await supabase.from('forum_tags').insert({ name: newName.trim(), color: newColor })
    if (error) { toast.error(error?.message?.includes('unique') ? 'Tag já existe.' : 'Erro ao criar tag.'); return }
    setNewName(''); toast.success('Tag criada!')
    fetchTags()
  }

  const deleteTag = async (id: string) => {
    if (!supabase || !confirm('Excluir esta tag?')) return
    await supabase.from('forum_tags').delete().eq('id', id)
    toast.success('Tag excluída.')
    fetchTags()
  }

  if (loading) return <div className="h-64 bg-muted animate-pulse rounded-lg" />

  return (
    <div className="space-y-6">
      <PageHeader title="Gerenciar Tags" description="Tags usadas no fórum." />
      <Card>
        <CardHeader><CardTitle className="text-lg">Adicionar Tag</CardTitle></CardHeader>
        <CardContent className="flex gap-3 items-end">
          <div className="flex-1 space-y-2"><Label>Nome</Label><Input value={newName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)} placeholder="Ex: Cálculo I" /></div>
          <div className="space-y-2"><Label>Cor</Label><Input type="color" value={newColor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColor(e.target.value)} className="w-16 h-10 p-1" /></div>
          <Button onClick={addTag}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          {tags.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhuma tag cadastrada.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map((t) => (
                <div key={t.id} className="flex items-center gap-2 px-3 py-2 border rounded-lg">
                  <Badge style={{ backgroundColor: t.color, color: 'white' }}>{t.name}</Badge>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteTag(t.id)}><Trash2 className="h-3 w-3 text-muted-foreground" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
