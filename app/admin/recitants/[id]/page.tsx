import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RecitantForm from '@/components/recitants/RecitantForm'

export default async function EditRecitantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: recitant } = await supabase
    .from('recitants')
    .select('*')
    .eq('id', id)
    .single()

  if (!recitant) {
    notFound()
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-6">Modifier le récitant</h2>
      <RecitantForm mode="edit" recitant={recitant} />
    </div>
  )
}