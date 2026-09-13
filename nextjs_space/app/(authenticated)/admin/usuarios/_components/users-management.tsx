'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/layouts/page-header'
import { useUser } from '@/lib/supabase/hooks'
import { SafeDate } from '@/components/safe-format'
import type { Profile } from '@/lib/types'
import { toast } from 'sonner'
import { Users, Shield, User } from 'lucide-react'

export function UsersManagement() {
  const { supabase } = useUser()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setProfiles((data ?? []) as Profile[])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [supabase])

  const updateRole = async (userId: string, role: string) => {
    if (!supabase) return
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (error) { toast.error('Erro ao atualizar role.'); return }
    toast.success('Role atualizado!')
    fetchUsers()
  }

  if (loading) return <div className="h-64 bg-muted animate-pulse rounded-lg" />

  return (
    <div className="space-y-6">
      <PageHeader title="Gerenciar Usuários" description={`${profiles.length} usuários cadastrados.`} />
      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant={p.role === 'admin' ? 'default' : 'secondary'}>
                      {p.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                      {p.role === 'admin' ? 'Admin' : 'Estudante'}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.xp_points}</TableCell>
                  <TableCell>{p.streak_days} dias</TableCell>
                  <TableCell><SafeDate date={p.created_at} options={{ dateStyle: 'short' }} /></TableCell>
                  <TableCell>
                    <Select value={p.role} onValueChange={(v: string) => updateRole(p.id, v)}>
                      <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Estudante</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
