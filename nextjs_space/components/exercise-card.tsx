'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import type { Exercise } from '@/lib/types'

interface ExerciseCardProps {
  exercise: Exercise
  onAnswer?: (exerciseId: string, answer: string, isCorrect: boolean) => void
}

export function ExerciseCard({ exercise, onAnswer }: ExerciseCardProps) {
  const [selected, setSelected] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  const difficultyLabels = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }

  const handleSubmit = () => {
    if (!selected?.trim()) return
    const correct = selected.trim().toLowerCase() === exercise?.correct_answer?.trim()?.toLowerCase()
    setIsCorrect(correct)
    setSubmitted(true)
    onAnswer?.(exercise?.id ?? '', selected, correct)
  }

  const handleReset = () => {
    setSelected('')
    setSubmitted(false)
    setIsCorrect(false)
  }

  const options = exercise?.options as string[] | null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={difficultyColors[exercise?.difficulty ?? 'easy']}>
            {difficultyLabels[exercise?.difficulty ?? 'easy']}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {exercise?.xp_reward ?? 0} XP
          </Badge>
        </div>
        <CardTitle className="text-base font-medium">
          <MarkdownRenderer content={exercise?.question ?? ''} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {exercise?.type === 'mc' && (options ?? [])?.length > 0 && (
          <div className="space-y-2">
            {(options ?? []).map((opt: string, i: number) => (
              <button
                key={i}
                disabled={submitted}
                onClick={() => setSelected(opt)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${
                  submitted && opt?.toLowerCase() === exercise?.correct_answer?.toLowerCase()
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : submitted && selected === opt && !isCorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : selected === opt
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {exercise?.type === 'tf' && (
          <div className="flex gap-3">
            {['Verdadeiro', 'Falso'].map((opt) => (
              <Button
                key={opt}
                variant={selected === opt.toLowerCase() ? 'default' : 'outline'}
                disabled={submitted}
                onClick={() => setSelected(opt.toLowerCase())}
                className="flex-1"
              >
                {opt}
              </Button>
            ))}
          </div>
        )}

        {exercise?.type === 'open' && (
          <Input
            placeholder="Digite sua resposta..."
            value={selected}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelected(e.target.value)}
            disabled={submitted}
          />
        )}

        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!selected?.trim()} className="w-full">
            Verificar Resposta
          </Button>
        ) : (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              isCorrect
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <span className="font-medium">{isCorrect ? 'Correto!' : 'Incorreto'}</span>
              {!isCorrect && (
                <span className="text-sm ml-auto">Resposta: {exercise?.correct_answer ?? ''}</span>
              )}
            </div>
            {exercise?.explanation && (
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1 text-sm font-medium text-muted-foreground">
                  <HelpCircle className="h-4 w-4" /> Explicação
                </div>
                <MarkdownRenderer content={exercise.explanation} />
              </div>
            )}
            <Button variant="outline" onClick={handleReset} className="w-full">
              Tentar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
