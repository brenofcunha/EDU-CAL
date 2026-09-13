import { NewTopicForm } from '../../novo/_components/new-topic-form'

export default async function EditTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NewTopicForm editId={id} />
}