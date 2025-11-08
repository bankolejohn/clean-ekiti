/**
 * Input validation utilities
 */

import { VALIDATION_RULES, REPORT_CATEGORIES, REPORT_STATUS, FILE_LIMITS } from './constants';
import type { CreateReportData, Report } from '@/types';

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>"'&]/g, (match) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entities[match] || match;
    });
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_RULES.EMAIL.test(email.trim());
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  const latitude = Number(lat);
  const longitude = Number(lng);
  
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= VALIDATION_RULES.LATITUDE.min &&
    latitude <= VALIDATION_RULES.LATITUDE.max &&
    longitude >= VALIDATION_RULES.LONGITUDE.min &&
    longitude <= VALIDATION_RULES.LONGITUDE.max
  );
}

/**
 * Validate report category
 */
export function isValidReportCategory(category: string): category is typeof REPORT_CATEGORIES[number] {
  return REPORT_CATEGORIES.includes(category as any);
}

/**
 * Validate report status
 */
export function isValidReportStatus(status: string): status is typeof REPORT_STATUS[number] {
  return REPORT_STATUS.includes(status as any);
}

/**
 * Validate file upload
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: true }; // File is optional
  }

  if (file.size > FILE_LIMITS.MAX_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${FILE_LIMITS.MAX_SIZE / (1024 * 1024)}MB`,
    };
  }

  if (!FILE_LIMITS.ALLOWED_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed',
    };
  }

  return { isValid: true };
}

/**
 * Validate report creation data
 */
export function validateReportData(data: Partial<CreateReportData>): {
  isValid: boolean;
  errors: string[];
  sanitizedData?: CreateReportData;
} {
  const errors: string[] = [];

  // Required fields
  if (!data.category) {
    errors.push('Category is required');
  } else if (!isValidReportCategory(data.category)) {
    errors.push('Invalid category');
  }

  if (data.latitude === undefined || data.longitude === undefined) {
    errors.push('Location coordinates are required');
  } else if (!isValidCoordinates(data.latitude, data.longitude)) {
    errors.push('Invalid coordinates');
  }

  // Optional fields validation
  if (data.description && data.description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Description must be less than ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`);
  }

  if (data.reporter_email && !isValidEmail(data.reporter_email)) {
    errors.push('Invalid email format');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Sanitize data (excluding location_name as it doesn't exist in database)
  const sanitizedData: CreateReportData = {
    category: data.category!,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    description: data.description ? sanitizeString(data.description) : undefined,
    reporter_email: data.reporter_email ? sanitizeString(data.reporter_email) : undefined,
  };

  return { isValid: true, errors: [], sanitizedData };
}

/**
 * Validate admin login data
 */
export function validateLoginData(data: { username?: string; password?: string }): {
  isValid: boolean;
  errors: string[];
  sanitizedData?: { username: string; password: string };
} {
  const errors: string[] = [];

  if (!data.username || data.username.trim().length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
    errors.push(`Username must be at least ${VALIDATION_RULES.USERNAME_MIN_LENGTH} characters`);
  }

  if (!data.password || data.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedData: {
      username: sanitizeString(data.username!),
      password: data.password!, // Don't sanitize password
    },
  };
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}