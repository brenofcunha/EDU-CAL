'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export function ForgotPasswordForm() {
  const supabase = useSupabase()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      toast.error('Supabase não configurado. Verifique as variáveis de ambiente.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window?.location?.origin ?? ''}/login`,
    })
    setLoading(false)
    if (error) {
      toast.error(error?.message ?? 'Erro ao enviar e-mail')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3 w-fit mx-auto">
          <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-sm text-muted-foreground">
          Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
        </p>
        <Button variant="outline" asChild>
          <Link href="/login">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao login
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Enviar Link de Recuperação
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Lembrou a senha?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Faça login
        </Link>
      </p>
    </form>
  )
}
