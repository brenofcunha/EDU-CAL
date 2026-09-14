'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bug, CheckCircle2, Clock3, Lightbulb, MessageSquare, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/layouts/page-header'
import { SafeDate } from '@/components/safe-format'
import { useUser } from '@/lib/supabase/hooks'
import type { UserFeedback } from '@/lib/types'

const statusLabels: Record<UserFeedback['status'], string> = {
  new: 'Novo',
  in_progress: 'Em análise',
  resolved: 'Resolvido',
  dismissed: 'Encerrado',
}

export function FeedbackForm() {
  const { user, supabase } = useUser()
  const [category, setCategory] = useState<UserFeedback['category']>('bug')
  const [description, setDescription] = useState('')
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([])
  const [sending, setSending] = useState(false)

  const loadFeedbacks = useCallback(async () => {
    if (!supabase || !user) return
    const { data } = await supabase.from('user_feedback').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    setFeedbacks((data ?? []) as UserFeedback[])
  }, [supabase, user])

  useEffect(() => { loadFeedbacks() }, [loadFeedbacks])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !user) return
    const trimmedDescription = description.trim()
    if (trimmedDescription.length < 10) {
      toast.error('Descreva o problema com pelo menos 10 caracteres.')
      return
    }

    setSending(true)
    const { error } = await supabase.from('user_feedback').insert({
      user_id: user.id,
      category,
      description: trimmedDescription,
      page_url: window.location.origin + window.location.pathname,
    })
    setSending(false)
    if (error) {
      toast.error('Não foi possível enviar o feedback.')
      return
    }
    setDescription('')
    toast.success('Feedback enviado para a equipe responsável.')
    await loadFeedbacks()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Relatar um problema" description="Ajude a melhorar o EduCalc enviando um relato para a equipe administrativa." />
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bug className="h-5 w-5 text-primary" /> Novo feedback</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="feedback-category">Tipo de feedback</Label>
              <select id="feedback-category" value={category} onChange={(event) => setCategory(event.target.value as UserFeedback['category'])} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="bug">Relatar um bug</option>
                <option value="suggestion">Enviar uma sugestão</option>
                <option value="other">Outro assunto</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-description">Descrição</Label>
              <Textarea id="feedback-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="O que aconteceu? Inclua os passos para reproduzir o problema." minLength={10} maxLength={5000} rows={7} required />
              <p className="text-xs text-muted-foreground text-right">{description.length}/5000</p>
            </div>
            <div className="flex justify-end"><Button type="submit" loading={sending}><Send className="h-4 w-4" /> Enviar feedback</Button></div>
          </form>
        </CardContent>
      </Card>

      {feedbacks.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Meus relatos recentes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {feedback.category === 'bug' ? <Bug className="h-4 w-4 text-rose-500" /> : feedback.category === 'suggestion' ? <Lightbulb className="h-4 w-4 text-amber-500" /> : <MessageSquare className="h-4 w-4 text-blue-500" />}
                    {feedback.category === 'bug' ? 'Bug' : feedback.category === 'suggestion' ? 'Sugestão' : 'Outro'}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock3 className="h-3 w-3" /> {statusLabels[feedback.status]}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{feedback.description}</p>
                <p className="text-xs text-muted-foreground"><SafeDate date={feedback.created_at} options={{ dateStyle: 'medium', timeStyle: 'short' }} /></p>
                {feedback.status === 'resolved' && <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Este relato foi resolvido.</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}