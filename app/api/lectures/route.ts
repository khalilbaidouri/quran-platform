import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lectures')
    .select('*, recitants(id, nom, prenom), sourates(id, nom_francais, nom_arabe)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const formData = await request.formData()

  const recitant_id = formData.get('recitant_id') as string
  const sourate_id = formData.get('sourate_id') as string
  const titre = formData.get('titre') as string
  const audio = formData.get('audio') as File
  const image = formData.get('image') as File

  if (!recitant_id) {
    return NextResponse.json({ error: 'Le récitant est requis.' }, { status: 400 })
  }
  if (!audio || audio.size === 0) {
    return NextResponse.json({ error: 'Le fichier audio est requis.' }, { status: 400 })
  }

  const audioExt = audio.name.split('.').pop()
  const audioFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${audioExt}`

  const { error: uploadError } = await supabase.storage
    .from('audios')
    .upload(audioFileName, audio)

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: audioUrlData } = supabase.storage
    .from('audios')
    .getPublicUrl(audioFileName)

  let image_url: string | null = null

  if (image && image.size > 0) {
    const imageExt = image.name.split('.').pop()
    const imageFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${imageExt}`

    const { error: imageUploadError } = await supabase.storage
      .from('photos')
      .upload(imageFileName, image)

    if (imageUploadError) {
      return NextResponse.json({ error: imageUploadError.message }, { status: 500 })
    }

    const { data: imageUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(imageFileName)

    image_url = imageUrlData.publicUrl
  }

  const { data, error } = await supabase
    .from('lectures')
    .insert({
      recitant_id,
      sourate_id: sourate_id ? Number(sourate_id) : null,
      titre: titre || null,
      audio_url: audioUrlData.publicUrl,
      image_url,
      taille_fichier: audio.size,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}