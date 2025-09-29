import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    console.log('Login attempt:', { username, password })

    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()

    console.log('Admin query result:', { admin, error })

    if (error || !admin) {
      console.log('Admin not found')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, admin.password_hash)
    console.log('Password validation:', { isValidPassword, providedPassword: password, storedHash: admin.password_hash })
    
    if (!isValidPassword) {
      console.log('Password validation failed')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = generateToken(admin.id)
    console.log('Generated token:', token)

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
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}