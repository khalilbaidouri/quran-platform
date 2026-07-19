'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Lecture, Sourate } from '@/types/lecture'
import type { Recitant } from '@/types/recitant'

type Props = {
  mode: 'create' | 'edit'
  lecture?: Lecture
  recitants: Recitant[]
  sourates: Sourate[]
}

export default function LectureForm({ mode, lecture, recitants, sourates }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recitantId, setRecitantId] = useState(lecture?.recitant_id ?? '')
  const [sourateId, setSourateId] = useState(
    lecture?.sourate_id ? String(lecture.sourate_id) : ''
  )
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.set('recitant_id', recitantId)
    formData.set('sourate_id', sourateId)

    const url = mode === 'create' ? '/api/lectures' : `/api/lectures/${lecture!.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, { method, body: formData })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur inconnue')
      setLoading(false)
      return
    }

    router.push('/admin/lectures')
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

          <div className="space-y-2">
            <Label>Récitant</Label>
            <Select value={recitantId} onValueChange={setRecitantId} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un récitant" />
              </SelectTrigger>
              <SelectContent>
                {recitants.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.prenom} {r.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sourate</Label>
            <Select value={sourateId} onValueChange={setSourateId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir une sourate (optionnel)" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {sourates.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.id}. {s.nom_francais}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titre">Titre (optionnel)</Label>
            <Input
              id="titre"
              name="titre"
              placeholder="ex: Récitation Ramadan 2024"
              defaultValue={lecture?.titre ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">
              Image de couverture (optionnel)
              {mode === 'edit' && " — laisser vide pour garder l'actuelle"}
            </Label>
            <Input id="image" name="image" type="file" accept="image/*" />
            {mode === 'edit' && lecture?.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lecture.image_url}
                alt="Couverture actuelle"
                className="w-24 h-24 object-cover rounded mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio">
              Fichier audio {mode === 'edit' && "(laisser vide pour garder l'actuel)"}
            </Label>
            <Input
              id="audio"
              name="audio"
              type="file"
              accept="audio/*"
              required={mode === 'create'}
            />
            {mode === 'edit' && lecture?.audio_url && (
              <audio controls src={lecture.audio_url} className="w-full mt-2" />
            )}
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