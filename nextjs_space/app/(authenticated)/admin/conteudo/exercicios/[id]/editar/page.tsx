import { NewExerciseForm } from '../../novo/_components/new-exercise-form'

export default async function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NewExerciseForm editId={id} />
}