'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PageHeader } from '@/components/layouts/page-header'
import { useUser } from '@/lib/supabase/hooks'
import { FadeIn } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { toast } from 'sonner'
import { Trophy, Flame, Calendar, Save, MessageSquare } from 'lucide-react'

export function PerfilContent() {
  const { user, profile, supabase, loading } = useUser()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [postCount, setPostCount] = useState(0)

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '')
      setBio(profile.bio ?? '')
    }
  }, [profile])

  useEffect(() => {
    if (!supabase || !user) return
    const fetch = async () => {
      const { count } = await supabase.from('forum_posts').select('id', { count: 'exact', head: true }).eq('author_id', user.id)
      setPostCount(count ?? 0)
    }
    fetch()
  }, [supabase, user])

  const handleSave = async () => {
    if (!supabase || !user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ name: name.trim(), bio: bio.trim(), updated_at: new Date().toISOString() }).eq('id', user.id)
    setSaving(false)
    if (error) { toast.error('Erro ao salvar perfil.'); return }
    toast.success('Perfil atualizado!')
  }

  if (loading) return <div className="h-64 bg-muted animate-pulse rounded-lg" />

  const initials = (profile?.name ?? 'U').split(' ').map((n: string) => n?.[0] ?? '').join('').toUpperCase().substring(0, 2)

  return (
    <div className="space-y-8">
      <PageHeader title="Meu Perfil" description="Visualize e edite suas informações." />

      <div className="grid gap-6 md:grid-cols-3">
        <FadeIn>
          <Card className="md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{profile?.name ?? 'Usuário'}</h3>
              <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
              <Badge variant="secondary" className="mt-2">{profile?.role === 'admin' ? 'Administrador' : 'Estudante'}</Badge>
              <div className="grid grid-cols-3 gap-4 mt-6 w-full">
                <div className="text-center">
                  <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">{profile?.xp_points ?? 0}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
                <div className="text-center">
                  <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{profile?.streak_days ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
                <div className="text-center">
                  <MessageSquare className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{postCount}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
              </div>
              {profile?.created_at && (
                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Membro desde <SafeDate date={profile.created_at} options={{ dateStyle: 'medium' }} />
                </p>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1} className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Editar Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)} placeholder="Conte um pouco sobre você..." />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} loading={saving}><Save className="h-4 w-4 mr-1" /> Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
