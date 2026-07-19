import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import RecitantsTable from '@/components/recitants/RecitantsTable'

export default async function RecitantsPage() {
  const supabase = await createClient()

  const { data: recitants, error } = await supabase
    .from('recitants')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Récitants</h2>
        <Link href="/admin/recitants/nouveau">
          <Button>+ Ajouter un récitant</Button>
        </Link>
      </div>

      {error && <p className="text-red-600 mb-4">Erreur : {error.message}</p>}

      <RecitantsTable recitants={recitants ?? []} />
    </div>
  )
}