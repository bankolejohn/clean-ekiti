import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const { data: stats } = await supabaseAdmin
      .from('reports')
      .select('status')

    const statusCounts = stats?.reduce((acc: any, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({ reports, stats: statusCounts })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const admin = verifyAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, status } = await request.json()

    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ report })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const admin = verifyAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const { error } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Report deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
  }
}