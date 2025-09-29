import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/cloudinary'

export async function GET() {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ reports })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)
    const reporter_email = formData.get('reporter_email') as string
    const image = formData.get('image') as File

    let image_url = null
    if (image && image.size > 0) {
      image_url = await uploadImage(image)
    }

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        category,
        description: description || null,
        image_url,
        latitude,
        longitude,
        reporter_email: reporter_email || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}