import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DeleteRecitantButton from './DeleteRecitantButton'
import type { Recitant } from '@/types/recitant'

export default function RecitantsTable({ recitants }: { recitants: Recitant[] }) {
  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Photo</TableHead>
            <TableHead>Nom complet</TableHead>
            <TableHead>Nationalité</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recitants.length > 0 ? (
            recitants.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={r.photo_url ?? undefined} />
                    <AvatarFallback>
                      {r.prenom?.[0]}
                      {r.nom?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  {r.prenom} {r.nom}
                </TableCell>
                <TableCell>{r.nationalite ?? '—'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/recitants/${r.id}`}>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </Link>
                  <DeleteRecitantButton id={r.id} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                Aucun récitant pour l&apos;instant.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}