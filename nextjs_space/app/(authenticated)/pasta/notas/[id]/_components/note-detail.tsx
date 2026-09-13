'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { PageHeader } from '@/components/layouts/page-header'
import { useUser } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import { Save, Eye, Edit3, ArrowLeft } from 'lucide-react'

export function NoteDetail({ noteId }: { noteId: string }) {
  const { user, supabase } = useUser()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !user) { setLoading(false); return }
    const fetch = async () => {
      const { data } = await supabase.from('study_notes').select('*').eq('id', noteId).eq('user_id', user.id).single()
      if (data) {
        setTitle(data.title ?? '')
        setBody(data.body_md ?? '')
      }
      setLoading(false)
    }
    fetch()
  }, [supabase, user, noteId])

  const handleSave = async () => {
    if (!supabase || !user) return
    if (!title.trim()) { toast.error('Título é obrigatório.'); return }
    setSaving(true)
    await supabase.from('study_notes').update({ title: title.trim(), body_md: body, updated_at: new Date().toISOString() }).eq('id', noteId)
    setSaving(false)
    toast.success('Anotação atualizada!')
  }

  if (loading) return <div className="h-64 bg-muted animate-pulse rounded-lg" />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/pasta')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      </div>
      <PageHeader title="Editar Anotação" />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
          </div>
          <Tabs defaultValue="editor">
            <TabsList>
              <TabsTrigger value="editor"><Edit3 className="h-4 w-4 mr-1" /> Editor</TabsTrigger>
              <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-1" /> Pré-visualização</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="mt-4">
              <Textarea value={body} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)} className="min-h-[300px] font-mono text-sm" />
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <div className="min-h-[300px] p-4 border rounded-lg bg-background">
                {body ? <MarkdownRenderer content={body} /> : <p className="text-muted-foreground italic">Nada para pré-visualizar...</p>}
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end">
            <Button onClick={handleSave} loading={saving}><Save className="h-4 w-4 mr-1" /> Salvar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
