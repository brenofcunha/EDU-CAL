import { Navbar } from '@/components/navbar'
import { TracksGrid } from './_components/tracks-grid'
import { getTracks } from '@/lib/tracks'

export const metadata = { title: 'Trilhas de Aprendizado' }

export const dynamic = 'force-dynamic'

export default async function TrilhasPage() {
  const tracks = await getTracks()

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Trilhas de Aprendizado</h1>
        <p className="text-muted-foreground mb-8">Escolha uma trilha e comece a estudar Cálculo.</p>
        <TracksGrid tracks={tracks} />
      </div>
    </div>
  )
}
