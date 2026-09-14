'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bug, Clock3, Inbox, Lightbulb, MessageSquare, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/layouts/page-header'
import { EmptyState } from '@/components/empty-state'
import { SafeDate } from '@/components/safe-format'
import { useUser } from '@/lib/supabase/hooks'
import type { UserFeedback } from '@/lib/types'

const statusLabels: Record<UserFeedback['status'], string> = {
  new: 'Novo',
  in_progress: 'Em análise',
  resolved: 'Resolvido',
  dismissed: 'Encerrado',
}

const categoryLabels: Record<UserFeedback['category'], string> = {
  bug: 'Bug',
  suggestion: 'Sugestão',
  other: 'Outro',
}

export function FeedbackManagement() {
  const { supabase } = useUser()
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([])
  const [filter, setFilter] = useState<'all' | UserFeedback['status']>('all')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const loadFeedbacks = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    let query = supabase.from('user_feedback').select('*, profiles!user_feedback_user_id_fkey(name)').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data, error } = await query
    if (error) toast.error('Não foi possível carregar os feedbacks.')
    setFeedbacks((data ?? []) as UserFeedback[])
    setLoading(false)
  }, [filter, supabase])

  useEffect(() => { loadFeedbacks() }, [loadFeedbacks])

  const updateFeedback = async (feedback: UserFeedback, values: Partial<Pick<UserFeedback, 'status' | 'admin_notes'>>) => {
    if (!supabase) return
    setSavingId(feedback.id)
    const { error } = await supabase.from('user_feedback').update({ ...values, updated_at: new Date().toISOString() }).eq('id', feedback.id)
    setSavingId(null)
    if (error) { toast.error('Não foi possível atualizar o feedback.'); return }
    setFeedbacks((current) => current.map((item) => item.id === feedback.id ? { ...item, ...values } : item))
    toast.success('Feedback atualizado.')
  }

  if (loading) return <div className="h-64 bg-muted animate-pulse rounded-lg" />

  return (
    <div className="space-y-6">
      <PageHeader title="Feedbacks dos Usuários" description="Analise relatos enviados à conta administrativa brenofcunha." />
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'in_progress', 'resolved', 'dismissed'] as const).map((value) => (
          <Button key={value} variant={filter === value ? 'default' : 'outline'} size="sm" onClick={() => setFilter(value)}>
            {value === 'all' ? 'Todos' : statusLabels[value]}
          </Button>
        ))}
      </div>
      {feedbacks.length === 0 ? <EmptyState icon={Inbox} title="Nenhum feedback encontrado" description="Novos relatos enviados pelos usuários aparecerão aqui." /> : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => <FeedbackCard key={feedback.id} feedback={feedback} saving={savingId === feedback.id} onUpdate={updateFeedback} />)}
        </div>
      )}
    </div>
  )
}

function FeedbackCard({ feedback, saving, onUpdate }: { feedback: UserFeedback; saving: boolean; onUpdate: (feedback: UserFeedback, values: Partial<Pick<UserFeedback, 'status' | 'admin_notes'>>) => Promise<void> }) {
  const [status, setStatus] = useState(feedback.status)
  const [notes, setNotes] = useState(feedback.admin_notes ?? '')
  const CategoryIcon = feedback.category === 'bug' ? Bug : feedback.category === 'suggestion' ? Lightbulb : MessageSquare

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><CategoryIcon className="h-4 w-4 text-primary" /><span className="font-semibold">{categoryLabels[feedback.category]}</span><Badge variant="secondary">{feedback.profiles?.name ?? 'Usuário'}</Badge></div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock3 className="h-3 w-3" /><SafeDate date={feedback.created_at} options={{ dateStyle: 'medium', timeStyle: 'short' }} /></p>
          </div>
          {feedback.page_url && <p className="text-xs text-muted-foreground max-w-xs truncate" title={feedback.page_url}>{feedback.page_url}</p>}
        </div>
        <p className="text-sm whitespace-pre-wrap rounded-md bg-muted/50 p-3">{feedback.description}</p>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="space-y-2"><label htmlFor={`status-${feedback.id}`} className="text-sm font-medium">Status</label><select id={`status-${feedback.id}`} value={status} onChange={(event) => setStatus(event.target.value as UserFeedback['status'])} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="new">Novo</option><option value="in_progress">Em análise</option><option value="resolved">Resolvido</option><option value="dismissed">Encerrado</option></select></div>
          <div className="space-y-2"><label htmlFor={`notes-${feedback.id}`} className="text-sm font-medium">Notas internas</label><Textarea id={`notes-${feedback.id}`} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Adicione uma observação para a equipe..." rows={2} maxLength={5000} /></div>
        </div>
        <div className="flex justify-end"><Button size="sm" onClick={() => onUpdate(feedback, { status, admin_notes: notes.trim() || null })} loading={saving}><Save className="h-4 w-4" /> Salvar alteração</Button></div>
      </CardContent>
    </Card>
  )
}