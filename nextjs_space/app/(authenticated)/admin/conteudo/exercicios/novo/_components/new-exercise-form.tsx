'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUser } from '@/lib/supabase/hooks'
import type { Topic } from '@/lib/types'
import { toast } from 'sonner'
import { Save, Plus, X } from 'lucide-react'
import { MarkdownEditor, ResourceManager, normalizeMarkdown, type ContentResource } from '@/components/content-editor'

export function NewExerciseForm({ editId }: { editId?: string }) {
  const { supabase } = useUser()
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicId, setTopicId] = useState('')
  const [question, setQuestion] = useState('')
  const [type, setType] = useState<'mc' | 'open' | 'tf'>('mc')
  const [options, setOptions] = useState<string[]>(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [xpReward, setXpReward] = useState('5')
  const [resources, setResources] = useState<ContentResource[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.from('topics').select('*').order('track').order('order_index').then(({ data }) => {
      setTopics((data ?? []) as Topic[])
      if ((data ?? []).length > 0 && !editId) setTopicId(data![0].id)
    })
    if (editId) {
      supabase.from('exercises').select('*').eq('id', editId).single().then(({ data }) => {
        if (!data) return
        setTopicId(data.topic_id); setQuestion(data.question); setType(data.type); setOptions(data.options ?? ['', '', '', ''])
        setCorrectAnswer(data.correct_answer); setExplanation(data.explanation ?? ''); setDifficulty(data.difficulty)
        setXpReward(String(data.xp_reward)); setResources(data.resources ?? [])
      })
    }
  }, [supabase, editId])

  const handleSubmit = async () => {
    if (!supabase || !topicId || !question.trim() || !correctAnswer.trim()) {
      toast.error('Preencha os campos obrigatórios.'); return
    }
    setSaving(true)
    const payload: any = {
      topic_id: topicId, question: normalizeMarkdown(question), type,
      correct_answer: correctAnswer.trim(), explanation: normalizeMarkdown(explanation) || null,
      difficulty, xp_reward: parseInt(xpReward) || 5,
      resources,
    }
    if (type === 'mc') payload.options = options.filter((o) => o.trim())
    const { error } = editId
      ? await supabase.from('exercises').update(payload).eq('id', editId)
      : await supabase.from('exercises').insert(payload)
    setSaving(false)
    if (error) { toast.error('Erro ao criar exercício.'); return }
    toast.success(editId ? 'Exercício atualizado!' : 'Exercício criado!')
    router.push('/admin/conteudo')
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>{editId ? 'Editar Exercício' : 'Novo Exercício'}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tópico</Label>
          <Select value={topicId} onValueChange={setTopicId}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <MarkdownEditor label="Pergunta" value={question} onChange={setQuestion} placeholder="Digite o enunciado do exercício..." minHeight="min-h-[180px]" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mc">Múltipla Escolha</SelectItem>
                <SelectItem value="tf">Verdadeiro/Falso</SelectItem>
                <SelectItem value="open">Aberta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dificuldade</Label>
            <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {type === 'mc' && (
          <div className="space-y-2">
            <Label>Opções</Label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input value={opt} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const n = [...options]; n[i] = e.target.value; setOptions(n)
                }} placeholder={`Opção ${String.fromCharCode(65 + i)}`} />
                {options.length > 2 && <Button variant="ghost" size="icon-sm" onClick={() => setOptions(options.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>}
              </div>
            ))}
            {options.length < 6 && <Button variant="outline" size="sm" onClick={() => setOptions([...options, ''])}><Plus className="h-4 w-4 mr-1" /> Adicionar Opção</Button>}
          </div>
        )}
        <div className="space-y-2">
          <Label>Resposta Correta {type === 'tf' && '(verdadeiro ou falso)'}</Label>
          <Input value={correctAnswer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCorrectAnswer(e.target.value)} />
        </div>
        <MarkdownEditor label="Explicação (opcional)" value={explanation} onChange={setExplanation} placeholder="Explique a resposta para o estudante..." minHeight="min-h-[160px]" />
        {supabase && <ResourceManager supabase={supabase} resources={resources} onChange={setResources} />}
        <div className="space-y-2"><Label>XP de Recompensa</Label><Input type="number" value={xpReward} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXpReward(e.target.value)} className="w-32" /></div>
        <Button onClick={handleSubmit} loading={saving}><Save className="h-4 w-4 mr-1" /> {editId ? 'Salvar Alterações' : 'Criar Exercício'}</Button>
      </CardContent>
    </Card>
  )
}
