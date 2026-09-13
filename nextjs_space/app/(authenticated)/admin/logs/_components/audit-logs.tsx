'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layouts/page-header'
import { EmptyState } from '@/components/empty-state'
import { useUser } from '@/lib/supabase/hooks'
import { SafeDate } from '@/components/safe-format'
import type { AdminAuditLog } from '@/lib/types'
import { FileText, Inbox } from 'lucide-react'

export function AuditLogs() {
  const { supabase } = useUser()
  const [logs, setLogs] = useState<AdminAuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.from('admin_audit_logs').select('*, profiles!admin_audit_logs_admin_id_fkey(name)').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setLogs((data ?? []) as any[]); setLoading(false) })
  }, [supabase])

  if (loading) return <div className="h-64 bg-muted animate-pulse rounded-lg" />

  return (
    <div className="space-y-6">
      <PageHeader title="Logs de Auditoria" description="Histórico de ações administrativas." />
      {logs.length === 0 ? (
        <EmptyState icon={Inbox} title="Nenhum log registrado" description="Ações administrativas aparecerão aqui." />
      ) : (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Admin</TableHead><TableHead>Ação</TableHead><TableHead>Tabela</TableHead><TableHead>Alvo</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{(log as any)?.profiles?.name ?? 'Admin'}</TableCell>
                  <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{log.target_table ?? '-'}</TableCell>
                  <TableCell className="font-mono text-xs max-w-[200px] truncate">{log.target_id ?? '-'}</TableCell>
                  <TableCell><SafeDate date={log.created_at} options={{ dateStyle: 'short', timeStyle: 'short' }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}
    </div>
  )
}
