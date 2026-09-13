'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FadeIn, SlideIn } from '@/components/ui/animate'
import { ArrowRight, Sparkles } from 'lucide-react'

export function LandingHero() {
  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:py-32 text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            Plataforma gratuita de estudo de Cálculo
          </div>
        </FadeIn>
        <SlideIn from="bottom" delay={0.1}>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Domine <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">Cálculo</span> com
            <br />aulas interativas
          </h1>
        </SlideIn>
        <SlideIn from="bottom" delay={0.2}>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Trilhas completas de Cálculo I a Vetorial com exercícios, fórmulas renderizadas
            em tempo real e um fórum colaborativo para tirar dúvidas.
          </p>
        </SlideIn>
        <SlideIn from="bottom" delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/cadastro">
                Comece Agora
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/trilhas">
                Explorar Trilhas
              </Link>
            </Button>
          </div>
        </SlideIn>

        {/* Floating math symbols */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <span className="absolute top-20 left-[10%] text-6xl text-primary/10 font-mono">∫</span>
          <span className="absolute top-32 right-[15%] text-5xl text-primary/10 font-mono">∑</span>
          <span className="absolute bottom-20 left-[20%] text-4xl text-primary/10 font-mono">∇</span>
          <span className="absolute bottom-32 right-[10%] text-5xl text-primary/10 font-mono">∞</span>
          <span className="absolute top-1/2 left-[5%] text-3xl text-primary/10 font-mono">Δ</span>
          <span className="absolute top-1/3 right-[5%] text-4xl text-primary/10 font-mono">π</span>
        </div>
      </div>
    </section>
  )
}
