'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import { BookOpen, Brain, Users, FolderOpen, Trophy, Zap } from 'lucide-react'

const features = [
  { icon: BookOpen, title: 'Aulas com KaTeX', desc: 'Fórmulas matemáticas renderizadas com precisão tipográfica.' },
  { icon: Brain, title: 'Exercícios Interativos', desc: 'Múltipla escolha, verdadeiro/falso e questões abertas.' },
  { icon: Users, title: 'Fórum Colaborativo', desc: 'Tire dúvidas e ajude outros estudantes da comunidade.' },
  { icon: FolderOpen, title: 'Pasta de Estudo', desc: 'Anotações em Markdown e favoritos organizados.' },
  { icon: Trophy, title: 'Gamificação', desc: 'Ganhe XP, mantenha streaks e acompanhe seu progresso.' },
  { icon: Zap, title: '4 Trilhas Completas', desc: 'De Cálculo I a Vetorial, tudo em um só lugar.' },
]

export function LandingFeatures() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2 className="font-display text-3xl font-bold tracking-tight text-center mb-4">
          Tudo que você precisa para estudar Cálculo
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Ferramentas pensadas para acelerar seu aprendizado em matemática.
        </p>
        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <Card variant="interactive" className="h-full">
                <CardContent className="pt-6">
                  <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
