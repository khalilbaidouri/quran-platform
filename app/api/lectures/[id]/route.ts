import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lectures')
    .select('*, recitants(id, nom, prenom), sourates(id, nom_francais, nom_arabe)')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const formData = await request.formData()

  const recitant_id = formData.get('recitant_id') as string
  const sourate_id = formData.get('sourate_id') as string
  const titre = formData.get('titre') as string
  const audio = formData.get('audio') as File
  const image = formData.get('image') as File

  const updateData: Record<string, unknown> = {
    recitant_id,
    sourate_id: sourate_id ? Number(sourate_id) : null,
    titre: titre || null,
  }

  if (audio && audio.size > 0) {
    const fileExt = audio.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('audios')
      .upload(fileName, audio)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage
      .from('audios')
      .getPublicUrl(fileName)

    updateData.audio_url = publicUrlData.publicUrl
    updateData.taille_fichier = audio.size
  }

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

    updateData.image_url = imageUrlData.publicUrl
  }

  const { data, error } = await supabase
    .from('lectures')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}    

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase.from('lectures').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}