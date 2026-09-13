'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import { TRACKS, type TrackKey } from '@/lib/types'
import { useSupabase } from '@/lib/supabase/hooks'
import { ArrowRight } from 'lucide-react'

export function TracksGrid() {
  const supabase = useSupabase()
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!supabase) return
    const fetch = async () => {
      const { data } = await supabase.from('topics').select('track')
      const counts: Record<string, number> = {}
      ;(data ?? []).forEach((t: any) => { counts[t?.track] = (counts[t?.track] ?? 0) + 1 })
      setTopicCounts(counts)
    }
    fetch()
  }, [supabase])

  return (
    <Stagger className="grid sm:grid-cols-2 gap-6">
      {(Object.entries(TRACKS) as [TrackKey, typeof TRACKS[TrackKey]][]).map(([key, track]) => (
        <StaggerItem key={key}>
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
                <Badge variant="secondary">{topicCounts[key] ?? 0} tópicos</Badge>
                <Button size="sm" asChild>
                  <Link href={`/trilhas/${key}`}>
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
