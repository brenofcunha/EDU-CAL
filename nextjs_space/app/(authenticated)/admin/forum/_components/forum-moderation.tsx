'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/layouts/page-header'
import { EmptyState } from '@/components/empty-state'
import { useUser } from '@/lib/supabase/hooks'
import { SafeDate } from '@/components/safe-format'
import type { ForumPost } from '@/lib/types'
import { toast } from 'sonner'
import { MessageSquare, Trash2, CheckCircle, Circle, Inbox } from 'lucide-react'

export function ForumModeration() {
  const { supabase } = useUser()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase.from('forum_posts').select('*, profiles!forum_posts_author_id_fkey(name), forum_replies(id)').order('created_at', { ascending: false })
    setPosts((data ?? []) as any[])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [supabase])

  const deletePost = async (id: string) => {
    if (!supabase || !confirm('Excluir este post?')) return
    await supabase.from('forum_posts').delete().eq('id', id)
    toast.success('Post excluído.')
    fetchPosts()
  }

  const toggleResolved = async (id: string, current: boolean) => {
    if (!supabase) return
    await supabase.from('forum_posts').update({ is_resolved: !current }).eq('id', id)
    toast.success(current ? 'Post marcado como aberto.' : 'Post marcado como resolvido.')
    fetchPosts()
  }

  if (loading) return <div className="h-64 bg-muted animate-pulse rounded-lg" />

  return (
    <div className="space-y-6">
      <PageHeader title="Moderar Fórum" description={`${posts.length} posts no fórum.`} />
      {posts.length === 0 ? (
        <EmptyState icon={Inbox} title="Nenhum post" />
      ) : (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Autor</TableHead><TableHead>Status</TableHead><TableHead>Respostas</TableHead><TableHead>Data</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {posts.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium max-w-[250px] truncate">{p.title}</TableCell>
                  <TableCell>{p?.profiles?.name ?? 'Anônimo'}</TableCell>
                  <TableCell>
                    <Badge variant={p.is_resolved ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleResolved(p.id, p.is_resolved)}>
                      {p.is_resolved ? <><CheckCircle className="h-3 w-3 mr-1" /> Resolvido</> : <><Circle className="h-3 w-3 mr-1" /> Aberto</>}
                    </Badge>
                  </TableCell>
                  <TableCell>{p?.forum_replies?.length ?? 0}</TableCell>
                  <TableCell><SafeDate date={p.created_at} options={{ dateStyle: 'short' }} /></TableCell>
                  <TableCell><Button variant="ghost" size="icon-sm" onClick={() => deletePost(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}
    </div>
  )
}
