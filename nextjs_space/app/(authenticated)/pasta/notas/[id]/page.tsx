import { NoteDetail } from './_components/note-detail'

export const metadata = { title: 'Anotação' }

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NoteDetail noteId={id} />
}
