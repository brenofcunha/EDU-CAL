'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Bold, Code2, Download, Eye, FileUp, Heading2, Italic, Link2, List, Paperclip, Quote, Strikethrough, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export interface ContentResource {
  type: 'file' | 'link'
  title: string
  url: string
  path?: string
}

export function normalizeMarkdown(value: string) {
  const normalized = value.replace(/\r\n/g, '\n').trim()
  if (!normalized) return ''
  if (/^\s*(#|[-*+] |\d+\. |>|```|\$\$)/m.test(normalized)) return normalized
  return normalized.split(/\n\s*\n/).map((paragraph) => paragraph.replace(/\n+/g, ' ').trim()).join('\n\n')
}

interface MarkdownEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function MarkdownEditor({ label, value, onChange, placeholder, minHeight = 'min-h-[280px]' }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = (before: string, after = '', fallback = 'texto') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end) || fallback
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`
    onChange(next)
    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + before.length + selected.length + after.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Tabs defaultValue="editor">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 rounded-md border p-1">
            <Button type="button" variant="ghost" size="icon-sm" title="Título" onClick={() => insertMarkdown('## ', '', 'Título')}><Heading2 className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon-sm" title="Negrito" onClick={() => insertMarkdown('**', '**')}><Bold className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon-sm" title="Itálico" onClick={() => insertMarkdown('*', '*')}><Italic className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon-sm" title="Tachado" onClick={() => insertMarkdown('~~', '~~')}><Strikethrough className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon-sm" title="Código" onClick={() => insertMarkdown('`', '`')}><Code2 className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon-sm" title="Citação" onClick={() => insertMarkdown('> ', '', 'Citação')}><Quote className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon-sm" title="Lista" onClick={() => insertMarkdown('- ', '', 'Item')}><List className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon-sm" title="Link" onClick={() => insertMarkdown('[', '](https://)', 'texto')}><Link2 className="h-4 w-4" /></Button>
          </div>
          <TabsList><TabsTrigger value="editor">Editor</TabsTrigger><TabsTrigger value="preview"><Eye className="mr-1 h-4 w-4" />Visualizar</TabsTrigger></TabsList>
        </div>
        <TabsContent value="editor" className="mt-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`w-full resize-y rounded-md border bg-background p-3 font-mono text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring ${minHeight}`}
            placeholder={placeholder ?? 'Digite o conteúdo. Use os botões para aplicar Markdown.'}
          />
          <p className="mt-1 text-xs text-muted-foreground">O texto será salvo em Markdown. Use $$ ... $$ para fórmulas matemáticas.</p>
        </TabsContent>
        <TabsContent value="preview" className="mt-3">
          <div className={`overflow-auto rounded-md border p-4 ${minHeight}`}>{value ? <MarkdownRenderer content={value} /> : <p className="italic text-muted-foreground">Nada para visualizar.</p>}</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ResourceManagerProps {
  supabase: SupabaseClient
  resources: ContentResource[]
  onChange: (resources: ContentResource[]) => void
}

export function ResourceManager({ supabase, resources, onChange }: ResourceManagerProps) {
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const addLink = () => {
    try {
      const url = new URL(linkUrl.trim())
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
      onChange([...resources, { type: 'link', title: linkTitle.trim() || url.hostname, url: url.toString() }])
      setLinkTitle('')
      setLinkUrl('')
    } catch {
      toast.error('Informe uma URL válida começando com http:// ou https://.')
    }
  }

  const uploadFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 10 MB.')
      return
    }
    setUploading(true)
    const path = `content/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    const { error } = await supabase.storage.from('content-assets').upload(path, file, { upsert: false })
    if (error) {
      toast.error(`Não foi possível enviar o arquivo: ${error.message}`)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('content-assets').getPublicUrl(path)
    onChange([...resources, { type: 'file', title: file.name, url: data.publicUrl, path }])
    setUploading(false)
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <Label>Materiais de apoio e fontes</Label>
        <p className="text-xs text-muted-foreground">Adicione PDFs, imagens, documentos ou links para referências.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Nome da fonte" value={linkTitle} onChange={(event) => setLinkTitle(event.target.value)} />
        <Input className="min-w-[260px] flex-1" placeholder="https://exemplo.com/fonte" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} />
        <Button type="button" variant="outline" onClick={addLink}><Link2 className="mr-1 h-4 w-4" />Adicionar link</Button>
        <input ref={fileRef} type="file" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); event.currentTarget.value = '' }} />
        <Button type="button" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}><FileUp className="mr-1 h-4 w-4" />{uploading ? 'Enviando...' : 'Anexar arquivo'}</Button>
      </div>
      {resources.length > 0 && <ul className="space-y-2 text-sm">{resources.map((resource, index) => <li key={`${resource.url}-${index}`} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2"><Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" /><a href={resource.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-primary hover:underline">{resource.title}</a><Button type="button" variant="ghost" size="icon-sm" title="Remover recurso" onClick={() => onChange(resources.filter((_, resourceIndex) => resourceIndex !== index))}><Trash2 className="h-4 w-4" /></Button></li>)}</ul>}
    </div>
  )
}

export function ResourceList({ resources }: { resources?: ContentResource[] | null }) {
  if (!resources?.length) return null
  return (
    <div className="mt-6 rounded-lg border bg-muted/30 p-4">
      <h3 className="mb-3 flex items-center gap-2 font-medium"><Paperclip className="h-4 w-4" />Materiais e fontes</h3>
      <div className="space-y-2">
        {resources.map((resource, index) => (
          <a key={`${resource.url}-${index}`} href={resource.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-primary hover:underline">
            {resource.type === 'file' ? <Download className="h-4 w-4 shrink-0" /> : <Link2 className="h-4 w-4 shrink-0" />}
            <span className="truncate">{resource.title}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
