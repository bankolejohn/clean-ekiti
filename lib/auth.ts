/**
 * Authentication utilities with enhanced security
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticationError } from './errors';

// Validate JWT secret
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '24h';

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }
  
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * JWT payload interface
 */
interface JWTPayload {
  adminId: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign JWT token
 */
export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: TOKEN_EXPIRY,
      issuer: 'cleanekiti-app',
      audience: 'cleanekiti-admin',
    });
  } catch (error) {
    console.error('JWT signing error:', error);
    throw new Error('Failed to create authentication token');
  }
}

/**
 * Verify JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  if (!token) {
    throw new AuthenticationError('No token provided');
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: 'cleanekiti-app',
      audience: 'cleanekiti-admin',
    }) as JWTPayload;
    
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token has expired');
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token');
    }
    
    console.error('JWT verification error:', error);
    throw new AuthenticationError('Token verification failed');
  }
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validate admin session
 */
export async function validateAdminSession(token: string): Promise<{
  isValid: boolean;
  adminId?: string;
  username?: string;
}> {
  try {
    const payload = await verifyJWT(token);
    return {
      isValid: true,
      adminId: payload.adminId,
      username: payload.username,
    };
  } catch {
    return { isValid: false };
  }
}

// Legacy function names for backward compatibility
export const generateToken = signJWT;
export const verifyToken = verifyJWT;