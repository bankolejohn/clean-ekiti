import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from './supabase'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '24h' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
  } catch {
    return null
  }
}

export async function createAdminUser(username: string, email: string, password: string) {
  const passwordHash = await hashPassword(password)
  
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .insert({
      username,
      email,
      password_hash: passwordHash
    })
    .select()
    .single()

  if (error) throw error
  return data
}