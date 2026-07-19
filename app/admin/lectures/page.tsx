import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import LecturesTable from '@/components/lectures/LecturesTable'

export default async function LecturesPage() {
  const supabase = await createClient()

  const { data: lectures, error } = await supabase
    .from('lectures')
    .select('*, recitants(id, nom, prenom), sourates(id, nom_francais, nom_arabe)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Lectures</h2>
        <Link href="/admin/lectures/nouveau">
          <Button>+ Ajouter une lecture</Button>
        </Link>
      </div>

      {error && <p className="text-red-600 mb-4">Erreur : {error.message}</p>}

      <LecturesTable lectures={lectures ?? []} />
    </div>
  )
}