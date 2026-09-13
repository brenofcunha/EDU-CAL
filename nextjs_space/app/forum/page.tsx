import { Navbar } from '@/components/navbar'
import { ForumList } from './_components/forum-list'

export const metadata = { title: 'Fórum' }

export default function ForumPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <ForumList />
      </div>
    </div>
  )
}
