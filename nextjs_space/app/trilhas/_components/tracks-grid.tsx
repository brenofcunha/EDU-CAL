'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import type { Track } from '@/lib/types'
import { useSupabase } from '@/lib/supabase/hooks'
import { ArrowRight } from 'lucide-react'

function trackGradient(color: string) {
  const gradients: Record<string, string> = {
    'from-blue-500 to-indigo-600': 'linear-gradient(90deg, #3b82f6, #4f46e5)',
    'from-purple-500 to-pink-600': 'linear-gradient(90deg, #a855f7, #db2777)',
    'from-emerald-500 to-teal-600': 'linear-gradient(90deg, #10b981, #0d9488)',
    'from-amber-500 to-orange-600': 'linear-gradient(90deg, #f59e0b, #ea580c)',
  }
  return gradients[color] ?? gradients['from-blue-500 to-indigo-600']
}

export function TracksGrid({ tracks }: { tracks: Track[] }) {
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
      {tracks.map((track) => (
        <StaggerItem key={track.slug}>
          <Card variant="interactive" className="overflow-hidden h-full">
            <div className="h-2" style={{ backgroundImage: trackGradient(track.color) }} />
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
