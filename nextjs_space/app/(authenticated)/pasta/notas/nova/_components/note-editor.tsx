'use client'

import { useState } from 'react'
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
import { Save, Eye, Edit3 } from 'lucide-react'

export function NoteEditor() {
  const { user, supabase } = useUser()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!supabase || !user) { toast.error('Faça login primeiro.'); return }
    if (!title.trim()) { toast.error('Título é obrigatório.'); return }
    setSaving(true)
    const { error } = await supabase.from('study_notes').insert({ user_id: user.id, title: title.trim(), body_md: body })
    setSaving(false)
    if (error) { toast.error('Erro ao salvar anotação.'); return }
    toast.success('Anotação salva!')
    router.push('/pasta')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Nova Anotação" description="Escreva em Markdown com suporte a fórmulas KaTeX." />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Título da anotação" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
          </div>
          <Tabs defaultValue="editor">
            <TabsList>
              <TabsTrigger value="editor"><Edit3 className="h-4 w-4 mr-1" /> Editor</TabsTrigger>
              <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-1" /> Pré-visualização</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="mt-4">
              <Textarea
                placeholder="Escreva em Markdown... Use $$ para fórmulas KaTeX."
                value={body}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <div className="min-h-[300px] p-4 border rounded-lg bg-background">
                {body ? <MarkdownRenderer content={body} /> : <p className="text-muted-foreground italic">Nada para pré-visualizar...</p>}
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end">
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4 mr-1" /> Salvar Anotação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
