'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/animate'
import { TRACKS, type TrackKey } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

export function LandingTracks() {
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
          {(Object.entries(TRACKS) as [TrackKey, typeof TRACKS[TrackKey]][]).map(([key, track], i) => (
            <FadeIn key={key} delay={i * 0.1}>
              <Card variant="interactive" className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${track.color}`} />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{track.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{track.label}</h3>
                      <p className="text-sm text-muted-foreground">{track.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="mt-2">
                    <Link href={`/trilhas/${key}`}>
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
