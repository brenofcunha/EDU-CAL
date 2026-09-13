'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/empty-state'
import { useUser, useSupabase } from '@/lib/supabase/hooks'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import type { ForumPost, ForumTag } from '@/lib/types'
import {
  MessageSquare,
  Plus,
  Search,
  CheckCircle,
  Circle,
  ThumbsUp,
  MessageCircle,
  Filter,
} from 'lucide-react'

export function ForumList() {
  const supabase = useSupabase()
  const { user } = useUser()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [tags, setTags] = useState<ForumTag[]>([])
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const fetch = async () => {
      const { data: tagsData } = await supabase.from('forum_tags').select('*')
      setTags((tagsData ?? []) as ForumTag[])

      let query = supabase.from('forum_posts').select(`
        *,
        profiles!forum_posts_author_id_fkey(name),
        forum_post_tags(forum_tags(id, name, color)),
        forum_replies(id),
        forum_votes(vote_type)
      `)

      if (filterStatus === 'resolved') query = query.eq('is_resolved', true)
      if (filterStatus === 'open') query = query.eq('is_resolved', false)

      if (sortBy === 'newest') query = query.order('created_at', { ascending: false })
      else query = query.order('created_at', { ascending: true })

      const { data } = await query
      setPosts((data ?? []) as any[])
      setLoading(false)
    }
    fetch()
  }, [supabase, filterStatus, sortBy])

  const filteredPosts = posts.filter((p) => {
    if (search && !p?.title?.toLowerCase()?.includes(search.toLowerCase())) return false
    if (filterTag !== 'all') {
      const postTagIds = (p?.forum_post_tags ?? []).map((pt: any) => pt?.forum_tags?.id)
      if (!postTagIds.includes(filterTag)) return false
    }
    return true
  })

  const getVoteScore = (post: ForumPost) => {
    const votes = post?.forum_votes ?? []
    return votes.reduce((acc: number, v: any) => acc + (v?.vote_type === 'up' ? 1 : -1), 0)
  }

  if (sortBy === 'votes') {
    filteredPosts.sort((a, b) => getVoteScore(b) - getVoteScore(a))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Fórum</h1>
          <p className="text-muted-foreground">Dúvidas, discussões e ajuda da comunidade.</p>
        </div>
        {user && (
          <Button asChild>
            <Link href="/forum/novo"><Plus className="h-4 w-4 mr-1" /> Nova Pergunta</Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar posts..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger className="w-[160px]"><Filter className="h-4 w-4 mr-1" /><SelectValue placeholder="Tag" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as tags</SelectItem>
            {tags.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abertos</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Ordenar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigos</SelectItem>
            <SelectItem value="votes">Mais votados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : filteredPosts.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Nenhum post encontrado" description="Seja o primeiro a criar uma pergunta!" />
      ) : (
        <Stagger className="space-y-3">
          {filteredPosts.map((post) => (
            <StaggerItem key={post.id}>
              <Link href={`/forum/${post.id}`}>
                <Card variant="interactive">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 min-w-[50px]">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{getVoteScore(post)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.is_resolved ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <h3 className="font-medium truncate">{post.title}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{(post as any)?.profiles?.name ?? 'Anônimo'}</span>
                          <span>·</span>
                          <SafeDate date={post.created_at} options={{ dateStyle: 'medium' }} />
                          <span>·</span>
                          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post?.forum_replies?.length ?? 0}</span>
                          {(post?.forum_post_tags ?? []).map((pt: any) => (
                            <Badge key={pt?.forum_tags?.id} variant="secondary" className="text-xs" style={{ borderColor: pt?.forum_tags?.color }}>
                              {pt?.forum_tags?.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
