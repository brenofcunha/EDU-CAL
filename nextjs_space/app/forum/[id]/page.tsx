import { Navbar } from '@/components/navbar'
import { PostDetail } from './_components/post-detail'

export const metadata = { title: 'Post do Fórum' }

export default async function ForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-[900px] px-4 py-12">
        <PostDetail postId={id} />
      </div>
    </div>
  )
}
