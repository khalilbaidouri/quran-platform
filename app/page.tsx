import { createClient } from '@/lib/supabase/server'
import RecitantCard from '@/components/public/RecitantCard'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: recitants, error } = await supabase
    .from('recitants')
    .select('*')
    .order('nom')

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-white border-b py-8 px-6 text-center">
        <h1 className="text-3xl font-bold">Récitations du Coran</h1>
        <p className="text-muted-foreground mt-2">
          Écoutez et téléchargez librement les récitations de nos récitants
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {error && <p className="text-red-600">Erreur : {error.message}</p>}

        {recitants && recitants.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {recitants.map((r) => (
              <RecitantCard key={r.id} recitant={r} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Aucun récitant disponible pour l&apos;instant.
          </p>
        )}
      </main>
    </div>
  )
}