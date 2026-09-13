import { Navbar } from '@/components/navbar'
import { TrackTopics } from './_components/track-topics'
import { TRACKS } from '@/lib/types'

export const metadata = { title: 'Trilha' }

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params
  const trackInfo = TRACKS[track as keyof typeof TRACKS]

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{trackInfo?.icon ?? '∫'}</span>
          <h1 className="font-display text-3xl font-bold tracking-tight">{trackInfo?.label ?? 'Trilha'}</h1>
        </div>
        <p className="text-muted-foreground mb-8">{trackInfo?.description ?? ''}</p>
        <TrackTopics track={track} />
      </div>
    </div>
  )
}
