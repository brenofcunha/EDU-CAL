'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from './client'
import type { Profile } from '@/lib/types'
import type { User, SupabaseClient } from '@supabase/supabase-js'

export function useSupabase() {
  const [supabase] = useState(() => createClient())
  return supabase
}

export function useUser() {
  const supabase = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (sb: SupabaseClient, userId: string) => {
    const { data } = await sb.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data as Profile)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const getUser = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (u) await fetchProfile(supabase, u.id)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) await fetchProfile(supabase, u.id)
        else setProfile(null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [supabase, fetchProfile])

  return { user, profile, loading, supabase }
}
