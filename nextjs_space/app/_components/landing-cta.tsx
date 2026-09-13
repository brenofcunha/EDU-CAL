'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/animate'
import { Rocket } from 'lucide-react'

export function LandingCTA() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-[1200px] px-4 text-center">
        <FadeIn>
          <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-6">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight mb-4">
            Pronto para dominar Cálculo?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Crie sua conta gratuita e comece a estudar agora mesmo.
          </p>
          <Button size="lg" asChild>
            <Link href="/cadastro">
              Criar Conta Gratuita
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  )
}
