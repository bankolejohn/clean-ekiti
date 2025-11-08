/**
 * Admin logout API route
 * Handles secure admin logout by clearing authentication cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { logRequest, getCORSHeaders, getSecurityHeaders } from '@/lib/middleware';
import { API_MESSAGES } from '@/lib/constants';

/**
 * POST /api/admin/logout - Logout admin user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logRequest(request, 'Admin logout');

    // Create response
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { headers: { ...getCORSHeaders(), ...getSecurityHeaders() } }
    );

    // Clear the authentication cookie
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500, headers: getCORSHeaders() }
    );
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