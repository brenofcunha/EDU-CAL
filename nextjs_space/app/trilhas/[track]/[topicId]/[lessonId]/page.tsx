import { LessonView } from './_components/lesson-view'

export const metadata = { title: 'Aula' }

export default async function LessonPage({ params }: { params: Promise<{ track: string; topicId: string; lessonId: string }> }) {
  const { track, topicId, lessonId } = await params
  return <LessonView track={track} topicId={topicId} lessonId={lessonId} />
}
