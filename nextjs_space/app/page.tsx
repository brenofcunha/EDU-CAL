import { Navbar } from '@/components/navbar'
import { LandingHero } from './_components/landing-hero'
import { LandingFeatures } from './_components/landing-features'
import { LandingTracks } from './_components/landing-tracks'
import { LandingCTA } from './_components/landing-cta'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <LandingHero />
      <LandingFeatures />
      <LandingTracks />
      <LandingCTA />
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 EduCalc. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
