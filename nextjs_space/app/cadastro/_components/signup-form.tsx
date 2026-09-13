'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/lib/supabase/hooks'
import { toast } from 'sonner'
import { Mail, Lock, User } from 'lucide-react'

export function SignUpForm() {
  const supabase = useSupabase()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (name.trim().length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres.')
      return false
    }
    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.')
      return false
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error('A senha deve conter letras e números.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      toast.error('Supabase não configurado. Verifique as variáveis de ambiente.')
      return
    }
    if (!validate()) return
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      toast.error(error?.message ?? 'Erro ao criar conta')
      setLoading(false)
      return
    }
    toast.success('Conta criada com sucesso!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>
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
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Mín. 8 caracteres (letras e números)"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">Mínimo 8 caracteres, com letras e números.</p>
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Criar Conta
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Faça login
        </Link>
      </p>
    </form>
  )
}
