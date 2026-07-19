import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import type { Recitant } from '@/types/recitant'

export default function RecitantCard({ recitant }: { recitant: Recitant }) {
  return (
    <Link href={`/recitant/${recitant.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="flex flex-col items-center text-center py-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={recitant.photo_url ?? undefined} />
            <AvatarFallback className="text-xl">
              {recitant.prenom?.[0]}
              {recitant.nom?.[0]}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg">
            {recitant.prenom} {recitant.nom}
          </h3>
          {recitant.nationalite && (
            <p className="text-sm text-muted-foreground mt-1">
              {recitant.nationalite}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}