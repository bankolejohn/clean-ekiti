/**
 * Custom error classes and error handling utilities
 */

import { NextResponse } from 'next/server';
import { API_MESSAGES } from './constants';

/**
 * Custom application errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = API_MESSAGES.ERROR.INVALID_INPUT) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = API_MESSAGES.ERROR.UNAUTHORIZED) {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = API_MESSAGES.ERROR.FORBIDDEN) {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = API_MESSAGES.ERROR.NOT_FOUND) {
    super(message, 404);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = 'File upload failed') {
    super(message, 400);
  }
}

/**
 * Error response helper
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = API_MESSAGES.ERROR.INTERNAL_ERROR
): NextResponse {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Handle specific error types
  if (error instanceof Error) {
    // Database constraint violations
    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      );
    }

    // Foreign key violations
    if (error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: 'Invalid reference' },
        { status: 400 }
      );
    }
  }

  // Default error response
  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  );
}

/**
 * Async error handler wrapper
 */
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error;
    }
  };
}

/**
 * Log error for monitoring
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
  };

  console.error('Application Error:', JSON.stringify(errorInfo, null, 2));

  // In production, you might want to send this to a logging service
  // like Sentry, LogRocket, or CloudWatch
}