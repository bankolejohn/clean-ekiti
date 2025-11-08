/**
 * Middleware utilities for API routes
 */

import { NextRequest } from 'next/server';
import { verifyJWT } from './auth';
import { AuthenticationError, AuthorizationError } from './errors';
import { RATE_LIMITS } from './constants';

/**
 * Rate limiting store (in production, use Redis or similar)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimit(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((value, key) => {
    if (now > value.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

/**
 * Rate limiting middleware
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 60 * 1000 // 1 minute
): boolean {
  cleanupRateLimit();
  
  const now = Date.now();
  const key = identifier;
  const current = rateLimitStore.get(key);

  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Authentication middleware
 */
export async function requireAuth(request: NextRequest): Promise<{ adminId: string; username: string }> {
  const token = request.cookies.get('admin-token')?.value;
  
  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }

  try {
    const payload = await verifyJWT(token);
    return {
      adminId: payload.adminId,
      username: payload.username,
    };
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
}

/**
 * CORS headers for API responses
 */
export function getCORSHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Security headers
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  };
}

/**
 * Request logging middleware
 */
export function logRequest(request: NextRequest, context?: string): void {
  const timestamp = new Date().toISOString();
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  console.log(`[${timestamp}] ${request.method} ${request.url} - IP: ${ip} - UA: ${userAgent}${context ? ` - Context: ${context}` : ''}`);
}

/**
 * Validate request method
 */
export function validateMethod(request: NextRequest, allowedMethods: string[]): void {
  if (!allowedMethods.includes(request.method)) {
    throw new Error(`Method ${request.method} not allowed`);
  }
}