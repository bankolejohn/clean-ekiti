/**
 * Application constants and configuration
 */

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: {
    REPORT_CREATED: 'Report submitted successfully',
    REPORT_UPDATED: 'Report status updated successfully',
    REPORT_DELETED: 'Report deleted successfully',
    LOGIN_SUCCESS: 'Login successful',
  },
  ERROR: {
    INVALID_INPUT: 'Invalid input provided',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    INTERNAL_ERROR: 'Internal server error',
    INVALID_CREDENTIALS: 'Invalid username or password',
    MISSING_FIELDS: 'Required fields are missing',
    INVALID_FILE_TYPE: 'Invalid file type',
    FILE_TOO_LARGE: 'File size exceeds limit',
  },
} as const;

// Report Categories
export const REPORT_CATEGORIES = [
  'dumping',
  'flooding', 
  'pollution',
  'drainage',
  'other'
] as const;

// Report Status
export const REPORT_STATUS = [
  'pending',
  'investigating', 
  'resolved'
] as const;

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  LATITUDE: { min: -90, max: 90 },
  LONGITUDE: { min: -180, max: 180 },
  DESCRIPTION_MAX_LENGTH: 1000,
  USERNAME_MIN_LENGTH: 3,
  PASSWORD_MIN_LENGTH: 8,
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  REPORTS_PER_HOUR: 10,
  LOGIN_ATTEMPTS_PER_HOUR: 5,
  API_REQUESTS_PER_MINUTE: 60,
} as const;

// Default Coordinates (Ado-Ekiti)
export const DEFAULT_COORDINATES = {
  LATITUDE: 7.6219,
  LONGITUDE: 5.2206,
} as const;