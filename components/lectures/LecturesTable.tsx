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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DeleteLectureButton from './DeleteLectureButton'
import type { Lecture } from '@/types/lecture'

export default function LecturesTable({ lectures }: { lectures: Lecture[] }) {
  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Récitant</TableHead>
            <TableHead>Sourate</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Écoutes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lectures.length > 0 ? (
            lectures.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <Avatar className="rounded">
                    <AvatarImage src={l.image_url ?? undefined} />
                    <AvatarFallback className="rounded">🎵</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  {l.recitants ? `${l.recitants.prenom} ${l.recitants.nom}` : '—'}
                </TableCell>
                <TableCell>
                  {l.sourates ? (
                    <Badge variant="secondary">{l.sourates.nom_francais}</Badge>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>{l.titre ?? '—'}</TableCell>
                <TableCell>{l.nombre_ecoutes}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/lectures/${l.id}`}>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </Link>
                  <DeleteLectureButton id={l.id} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Aucune lecture pour l&apos;instant.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}