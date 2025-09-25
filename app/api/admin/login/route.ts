import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, admin.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = generateToken(admin.id)

    const response = NextResponse.json({ 
      message: 'Login successful',
      admin: { id: admin.id, username: admin.username, email: admin.email }
    })

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}