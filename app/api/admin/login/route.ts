/**
 * Admin authentication API route
 * Handles secure admin login with rate limiting and validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword, signJWT } from '@/lib/auth';
import { validateLoginData } from '@/lib/validation';
import { createErrorResponse, ValidationError, AuthenticationError } from '@/lib/errors';
import { rateLimit, getClientIP, logRequest, getCORSHeaders, getSecurityHeaders } from '@/lib/middleware';
import { API_MESSAGES, RATE_LIMITS } from '@/lib/constants';
import type { AdminUser } from '@/types';

/**
 * POST /api/admin/login - Authenticate admin user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logRequest(request, 'Admin login attempt');

    // Apply rate limiting for login attempts
    const clientIP = getClientIP(request);
    if (!rateLimit(`login:${clientIP}`, RATE_LIMITS.LOGIN_ATTEMPTS_PER_HOUR, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: getCORSHeaders() }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateLoginData(body);
    
    if (!validation.isValid) {
      throw new ValidationError(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const { username, password } = validation.sanitizedData!;

    // Fetch admin user from database (check both username and email)
    console.log('Looking for admin user:', username);
    const { data: admin, error: fetchError } = await supabaseAdmin
      .from('admin_users')
      .select('id, username, email, password_hash')
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    console.log('Fetch result:', { admin: admin ? 'found' : 'not found', error: fetchError?.message });

    if (fetchError || !admin) {
      // Don't reveal if user exists or not
      console.log('Admin user not found or error:', fetchError);
      throw new AuthenticationError(API_MESSAGES.ERROR.INVALID_CREDENTIALS);
    }

    // Verify password
    console.log('Verifying password for user:', admin.username);
    const isValidPassword = await verifyPassword(password, admin.password_hash);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      throw new AuthenticationError(API_MESSAGES.ERROR.INVALID_CREDENTIALS);
    }

    // Skip updating last login since the column doesn't exist in the database
    // If you want to track last login, add the column to your database first

    // Generate JWT token
    const token = signJWT({
      adminId: admin.id,
      username: admin.username,
    });

    // Create response with secure cookie
    const response = NextResponse.json(
      { 
        message: API_MESSAGES.SUCCESS.LOGIN_SUCCESS,
        admin: { 
          id: admin.id, 
          username: admin.username, 
          email: admin.email 
        }
      },
      { headers: { ...getCORSHeaders(), ...getSecurityHeaders() } }
    );

    // Set secure HTTP-only cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    return createErrorResponse(error, 'Login failed');
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: getCORSHeaders(),
  });
}