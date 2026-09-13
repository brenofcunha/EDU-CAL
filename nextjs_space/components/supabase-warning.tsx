'use client'

import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function SupabaseWarning() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (url && key) return null

  return (
    <Alert variant="destructive" className="m-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Supabase não configurado</AlertTitle>
      <AlertDescription>
        As variáveis de ambiente do Supabase não estão configuradas.
        Copie o arquivo <code className="font-mono text-xs">.env.example</code> para <code className="font-mono text-xs">.env.local</code> e preencha com as credenciais do seu projeto Supabase.
      </AlertDescription>
    </Alert>
  )
}
