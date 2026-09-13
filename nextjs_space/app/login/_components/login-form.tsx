'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import { Mail, Lock } from 'lucide-react'

export function LoginForm() {
  const supabase = useSupabase()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      toast.error('Supabase não configurado. Verifique as variáveis de ambiente.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error?.message ?? 'Erro ao fazer login')
      setLoading(false)
      return
    }
    toast.success('Login realizado com sucesso!')
    const redirect = searchParams?.get('redirect') ?? '/dashboard'
    router.push(redirect)
    router.refresh()
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link href="/esqueci-senha" className="text-xs text-primary hover:underline">
            Esqueceu a senha?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Entrar
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Não tem uma conta?{' '}
        <Link href="/cadastro" className="text-primary hover:underline font-medium">
          Cadastre-se
        </Link>
      </p>
    </form>
  )
}
