'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/animate'
import { TRACKS, type Track, type TrackKey } from '@/lib/types'
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

export function LandingTracks({ tracks }: { tracks: Track[] }) {
  const displayedTracks: Track[] = tracks.length > 0
    ? tracks
    : (Object.entries(TRACKS) as [TrackKey, typeof TRACKS[TrackKey]][]).map(([slug, track]) => ({
        slug,
        label: track.label,
        description: track.description,
        icon: track.icon,
        color: track.color,
        order_index: 0,
        created_at: '',
        updated_at: '',
      }))

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2 className="font-display text-3xl font-bold tracking-tight text-center mb-4">
          Trilhas de Aprendizado
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Escolha seu nível e comece a estudar agora mesmo.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {displayedTracks.map((track, i) => (
            <FadeIn key={track.slug} delay={i * 0.1}>
              <Card variant="interactive" className="overflow-hidden">
                <div className="h-2" style={{ backgroundImage: trackGradient(track.color) }} />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{track.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{track.label}</h3>
                      <p className="text-sm text-muted-foreground">{track.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="mt-2">
                    <Link href={`/trilhas/${track.slug}`}>
                      Ver trilha <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
