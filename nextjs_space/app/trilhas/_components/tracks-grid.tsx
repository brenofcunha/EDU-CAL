'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import { TRACKS, type Track, type TrackKey } from '@/lib/types'
import { useSupabase } from '@/lib/supabase/hooks'
import { ArrowRight } from 'lucide-react'

export function TracksGrid() {
  const supabase = useSupabase()
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({})
  const [tracks, setTracks] = useState<Track[]>([])

  useEffect(() => {
    if (!supabase) return
    const fetch = async () => {
      const [{ data: trackData }, { data }] = await Promise.all([
        supabase.from('tracks').select('*').order('order_index'),
        supabase.from('topics').select('track'),
      ])
      setTracks((trackData ?? []) as Track[])
      const counts: Record<string, number> = {}
      ;(data ?? []).forEach((t: any) => { counts[t?.track] = (counts[t?.track] ?? 0) + 1 })
      setTopicCounts(counts)
    }
    fetch()
  }, [supabase])

  return (
    <Stagger className="grid sm:grid-cols-2 gap-6">
      {(tracks.length > 0 ? tracks : (Object.entries(TRACKS) as [TrackKey, typeof TRACKS[TrackKey]][]).map(([slug, item]) => ({ slug, label: item.label, description: item.description, icon: item.icon, color: item.color, order_index: 0 } as Track))).map((track) => (
        <StaggerItem key={track.slug}>
          <Card variant="interactive" className="overflow-hidden h-full">
            <div className={`h-2 bg-gradient-to-r ${track.color}`} />
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-4xl">{track.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{track.label}</h3>
                  <p className="text-sm text-muted-foreground">{track.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{topicCounts[track.slug] ?? 0} tópicos</Badge>
                <Button size="sm" asChild>
                  <Link href={`/trilhas/${track.slug}`}>
                    Acessar <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
