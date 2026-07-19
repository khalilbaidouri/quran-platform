'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Recitant } from '@/types/recitant'

type Props = {
  mode: 'create' | 'edit'
  recitant?: Recitant
}

export default function RecitantForm({ mode, recitant }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    const url =
      mode === 'create' ? '/api/recitants' : `/api/recitants/${recitant!.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, { method, body: formData })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur inconnue')
      setLoading(false)
      return
    }

    router.push('/admin/recitants')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {mode === 'edit' && recitant && (
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={recitant.photo_url ?? undefined} />
                <AvatarFallback>
                  {recitant.prenom?.[0]}
                  {recitant.nom?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="photo">Changer la photo</Label>
                <Input id="photo" name="photo" type="file" accept="image/*" />
              </div>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              <Input id="photo" name="photo" type="file" accept="image/*" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                name="prenom"
                defaultValue={recitant?.prenom}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                name="nom"
                defaultValue={recitant?.nom}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalite">Nationalité</Label>
            <Input
              id="nationalite"
              name="nationalite"
              placeholder="ex: Égyptien"
              defaultValue={recitant?.nationalite ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="biographie">Biographie</Label>
            <Textarea
              id="biographie"
              name="biographie"
              rows={4}
              defaultValue={recitant?.biographie ?? ''}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? 'Enregistrement...'
              : mode === 'create'
              ? 'Enregistrer'
              : 'Enregistrer les modifications'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}