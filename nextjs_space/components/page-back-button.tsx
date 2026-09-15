'use client'

import { ArrowLeft } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const authPaths = ['/login', '/cadastro', '/esqueci-senha']

export function PageBackButton() {
  const pathname = usePathname()
  const router = useRouter()

  if (!pathname || pathname === '/') return null

  const isAuthPage = authPaths.some((path) => pathname.startsWith(path))
  const positionClass = isAuthPage ? 'right-4 top-4' : 'right-4 top-20'

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/')
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleBack}
      className={`fixed ${positionClass} z-40 gap-2 bg-background/90 shadow-sm backdrop-blur-sm`}
      aria-label="Voltar para a página anterior"
      title="Voltar para a página anterior"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Voltar</span>
    </Button>
  )
}
