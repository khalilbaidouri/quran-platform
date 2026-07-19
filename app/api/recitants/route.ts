import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recitants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const formData = await request.formData()

  const nom = formData.get('nom') as string
  const prenom = formData.get('prenom') as string
  const nationalite = formData.get('nationalite') as string
  const biographie = formData.get('biographie') as string
  const photo = formData.get('photo') as File

  let photo_url: string | null = null

  if (photo && photo.size > 0) {
    const fileExt = photo.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, photo)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    photo_url = publicUrlData.publicUrl
  }

  const { data, error } = await supabase
    .from('recitants')
    .insert({
      nom,
      prenom,
      nationalite: nationalite || null,
      biographie: biographie || null,
      photo_url,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}