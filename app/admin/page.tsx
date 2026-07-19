import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: nbRecitants } = await supabase
    .from('recitants')
    .select('*', { count: 'exact', head: true })

  const { count: nbLectures } = await supabase
    .from('lectures')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Bienvenue</h2>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Récitants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{nbRecitants ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Lectures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{nbLectures ?? 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}