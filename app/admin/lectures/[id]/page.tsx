import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LectureForm from '@/components/lectures/LectureForm'

export default async function EditLecturePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: lecture }, { data: recitants }, { data: sourates }] =
    await Promise.all([
      supabase.from('lectures').select('*').eq('id', id).single(),
      supabase.from('recitants').select('*').order('nom'),
      supabase.from('sourates').select('*').order('id'),
    ])

  if (!lecture) {
    notFound()
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-6">Modifier la lecture</h2>
      <LectureForm
        mode="edit"
        lecture={lecture}
        recitants={recitants ?? []}
        sourates={sourates ?? []}
      />
    </div>
  )
}