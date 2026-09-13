'use client'

import { AppShell } from '@/components/layouts/app-shell'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { SupabaseWarning } from '@/components/supabase-warning'

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sidebar={<DashboardSidebar />}>
      <SupabaseWarning />
      {children}
    </AppShell>
  )
}
