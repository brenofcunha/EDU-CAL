'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { EmptyState } from '@/components/empty-state'
import { useUser } from '@/lib/supabase/hooks'
import { FadeIn } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import type { ForumPost, ForumReply } from '@/lib/types'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Send,
  MessageCircle,
  FileText,
} from 'lucide-react'

export function PostDetail({ postId }: { postId: string }) {
  const { user, supabase } = useUser()
  const router = useRouter()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({})

  const fetchPost = async () => {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase.from('forum_posts').select(`
      *, profiles!forum_posts_author_id_fkey(name),
      forum_post_tags(forum_tags(id, name, color)),
      forum_votes(user_id, vote_type)
    `).eq('id', postId).single()
    setPost(data as any)

    const { data: repliesData } = await supabase.from('forum_replies').select(`
      *, profiles!forum_replies_author_id_fkey(name),
      forum_votes(user_id, vote_type)
    `).eq('post_id', postId).order('created_at')
    setReplies((repliesData ?? []) as any[])

    // User votes
    if (user) {
      const { data: votesData } = await supabase.from('forum_votes').select('*').eq('user_id', user.id)
      const vm: Record<string, 'up' | 'down'> = {}
      ;(votesData ?? []).forEach((v: any) => {
        if (v?.post_id) vm[`post_${v.post_id}`] = v.vote_type
        if (v?.reply_id) vm[`reply_${v.reply_id}`] = v.vote_type
      })
      setUserVotes(vm)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPost() }, [supabase, user, postId])

  const vote = async (type: 'up' | 'down', targetPost?: string, targetReply?: string) => {
    if (!supabase || !user) { toast.error('Faça login para votar.'); return }
    const key = targetPost ? `post_${targetPost}` : `reply_${targetReply}`
    const existing = userVotes[key]

    if (existing === type) {
      // Remove vote
      if (targetPost) await supabase.from('forum_votes').delete().eq('user_id', user.id).eq('post_id', targetPost)
      else await supabase.from('forum_votes').delete().eq('user_id', user.id).eq('reply_id', targetReply)
      setUserVotes((prev) => { const n = { ...prev }; delete n[key]; return n })
    } else {
      if (existing) {
        // Update
        if (targetPost) await supabase.from('forum_votes').update({ vote_type: type }).eq('user_id', user.id).eq('post_id', targetPost)
        else await supabase.from('forum_votes').update({ vote_type: type }).eq('user_id', user.id).eq('reply_id', targetReply)
      } else {
        // Insert
        await supabase.from('forum_votes').insert({
          user_id: user.id,
          post_id: targetPost ?? null,
          reply_id: targetReply ?? null,
          vote_type: type,
        })
      }
      setUserVotes((prev) => ({ ...prev, [key]: type }))
    }
    fetchPost()
  }

  const getScore = (votes: any[]) => (votes ?? []).reduce((a: number, v: any) => a + (v?.vote_type === 'up' ? 1 : -1), 0)

  const submitReply = async () => {
    if (!supabase || !user) { toast.error('Faça login para responder.'); return }
    if (!replyText.trim()) return
    setSending(true)
    const { error } = await supabase.from('forum_replies').insert({
      post_id: postId, author_id: user.id, body_md: replyText.trim(),
    })
    setSending(false)
    if (error) { toast.error('Erro ao enviar resposta.'); return }
    setReplyText('')
    toast.success('Resposta enviada!')
    fetchPost()
  }

  if (loading) return <div className="h-64 bg-muted animate-pulse rounded-lg" />
  if (!post) return <EmptyState icon={FileText} title="Post não encontrado" />

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/forum')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Fórum
      </Button>

      <FadeIn>
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => vote('up', postId)} className={userVotes[`post_${postId}`] === 'up' ? 'text-primary' : ''}>
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{getScore(post?.forum_votes ?? [])}</span>
                <Button variant="ghost" size="icon-sm" onClick={() => vote('down', postId)} className={userVotes[`post_${postId}`] === 'down' ? 'text-destructive' : ''}>
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {post.is_resolved && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle className="h-3 w-3 mr-1" /> Resolvido</Badge>}
                  {(post?.forum_post_tags ?? []).map((pt: any) => (
                    <Badge key={pt?.forum_tags?.id} variant="outline" style={{ borderColor: pt?.forum_tags?.color, color: pt?.forum_tags?.color }}>{pt?.forum_tags?.name}</Badge>
                  ))}
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight mb-2">{post.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{((post as any)?.profiles?.name ?? 'A')?.[0]?.toUpperCase()}</AvatarFallback></Avatar>
                  <span>{(post as any)?.profiles?.name ?? 'Anônimo'}</span>
                  <span>·</span>
                  <SafeDate date={post.created_at} options={{ dateStyle: 'medium' }} />
                </div>
                <MarkdownRenderer content={post.body_md} />
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <Separator />

      <h2 className="font-semibold text-lg flex items-center gap-2">
        <MessageCircle className="h-5 w-5" /> {replies.length} Respostas
      </h2>

      {replies.map((reply) => (
        <FadeIn key={reply.id}>
          <Card className={reply.is_accepted ? 'border-emerald-500' : ''}>
            <CardContent className="pt-5 pb-5">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => vote('up', undefined, reply.id)} className={userVotes[`reply_${reply.id}`] === 'up' ? 'text-primary' : ''}>
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{getScore(reply?.forum_votes ?? [])}</span>
                  <Button variant="ghost" size="icon-sm" onClick={() => vote('down', undefined, reply.id)} className={userVotes[`reply_${reply.id}`] === 'down' ? 'text-destructive' : ''}>
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Avatar className="h-5 w-5"><AvatarFallback className="text-xs">{((reply as any)?.profiles?.name ?? 'A')?.[0]?.toUpperCase()}</AvatarFallback></Avatar>
                    <span>{(reply as any)?.profiles?.name ?? 'Anônimo'}</span>
                    <span>·</span>
                    <SafeDate date={reply.created_at} options={{ dateStyle: 'medium' }} />
                    {reply.is_accepted && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs"><CheckCircle className="h-3 w-3 mr-1" /> Aceita</Badge>}
                  </div>
                  <MarkdownRenderer content={reply.body_md} />
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      ))}

      {/* Reply box */}
      {user && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">Sua Resposta</h3>
            <Textarea
              placeholder="Escreva em Markdown..."
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
              className="min-h-[120px] font-mono text-sm mb-3"
            />
            <Button onClick={submitReply} loading={sending} disabled={!replyText.trim()}>
              <Send className="h-4 w-4 mr-1" /> Enviar Resposta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
