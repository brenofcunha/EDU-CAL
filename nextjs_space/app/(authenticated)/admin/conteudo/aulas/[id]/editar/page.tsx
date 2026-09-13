import { NewLessonForm } from '../../nova/_components/new-lesson-form'

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NewLessonForm editId={id} />
}