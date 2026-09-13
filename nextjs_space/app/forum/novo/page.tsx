import { Navbar } from '@/components/navbar'
import { NewPostForm } from './_components/new-post-form'

export const metadata = { title: 'Nova Pergunta' }

export default function NovoPostPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-[900px] px-4 py-12">
        <NewPostForm />
      </div>
    </div>
  )
}
