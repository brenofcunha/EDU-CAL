import { createClient } from '@/lib/supabase/server'
import type { Track } from '@/lib/types'

export async function getTracks(): Promise<Track[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('order_index')

  if (error) {
    console.error('Não foi possível carregar as trilhas:', error)
    return []
  }

  return (data ?? []) as Track[]
}
