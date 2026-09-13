'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { useUser } from '@/lib/supabase/hooks'
import type { ForumTag } from '@/lib/types'
import { toast } from 'sonner'
import { Send, Eye, Edit3 } from 'lucide-react'

export function NewPostForm() {
  const { user, supabase } = useUser()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<ForumTag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.from('forum_tags').select('*').then(({ data }) => setTags((data ?? []) as ForumTag[]))
  }, [supabase])

  const toggleTag = (id: string) => {
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])
  }

  const handleSubmit = async () => {
    if (!supabase || !user) { toast.error('Faça login primeiro.'); return }
    if (!title.trim() || !body.trim()) { toast.error('Título e corpo são obrigatórios.'); return }
    setSending(true)
    const { data: post, error } = await supabase.from('forum_posts').insert({
      author_id: user.id, title: title.trim(), body_md: body.trim(),
    }).select().single()
    if (error || !post) { toast.error('Erro ao criar post.'); setSending(false); return }

    // Insert tags
    if (selectedTags.length > 0) {
      await supabase.from('forum_post_tags').insert(
        selectedTags.map((tagId) => ({ post_id: post.id, tag_id: tagId }))
      )
    }

    toast.success('Pergunta publicada!')
    router.push(`/forum/${post.id}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl tracking-tight">Nova Pergunta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" placeholder="Resuma sua dúvida..." value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
        </div>

        {tags.length > 0 && (
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color } : { borderColor: tag.color, color: tag.color }}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Conteúdo</Label>
          <Tabs defaultValue="editor">
            <TabsList>
              <TabsTrigger value="editor"><Edit3 className="h-4 w-4 mr-1" /> Editor</TabsTrigger>
              <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-1" /> Pré-visualizar</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="mt-3">
              <Textarea placeholder="Descreva sua dúvida em Markdown... Use $$ para fórmulas." value={body} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)} className="min-h-[200px] font-mono text-sm" />
            </TabsContent>
            <TabsContent value="preview" className="mt-3">
              <div className="min-h-[200px] p-4 border rounded-lg bg-background">
                {body ? <MarkdownRenderer content={body} /> : <p className="text-muted-foreground italic">Nada para pré-visualizar...</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} loading={sending}>
            <Send className="h-4 w-4 mr-1" /> Publicar Pergunta
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
