import { createClient } from '@/lib/supabase/server'
import LectureForm from '@/components/lectures/LectureForm'

export default async function NouvelleLecturePage() {
  const supabase = await createClient()

  const [{ data: recitants }, { data: sourates }] = await Promise.all([
    supabase.from('recitants').select('*').order('nom'),
    supabase.from('sourates').select('*').order('id'),
  ])

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-6">Ajouter une lecture</h2>
      <LectureForm
        mode="create"
        recitants={recitants ?? []}
        sourates={sourates ?? []}
      />
    </div>
  )
}