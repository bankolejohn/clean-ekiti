/**
 * Unit tests for validation utilities
 */

import {
  sanitizeString,
  isValidEmail,
  isValidCoordinates,
  isValidReportCategory,
  isValidReportStatus,
  validateFile,
  validateReportData,
  validateLoginData,
  isValidUUID,
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('sanitizeString', () => {
    it('should sanitize HTML entities', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(sanitizeString('Hello & "World"')).toBe('Hello & "World"');
    });

    it('should handle non-string input', () => {
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
      expect(sanitizeString(123 as any)).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null as any)).toBe(false);
    });
  });

  describe('isValidCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(isValidCoordinates(7.6219, 5.2206)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
      expect(isValidCoordinates(-90, -180)).toBe(true);
      expect(isValidCoordinates(90, 180)).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(isValidCoordinates(91, 0)).toBe(false);
      expect(isValidCoordinates(-91, 0)).toBe(false);
      expect(isValidCoordinates(0, 181)).toBe(false);
      expect(isValidCoordinates(0, -181)).toBe(false);
      expect(isValidCoordinates(NaN, 0)).toBe(false);
    });
  });

  describe('isValidReportCategory', () => {
    it('should validate correct categories', () => {
      expect(isValidReportCategory('dumping')).toBe(true);
      expect(isValidReportCategory('flooding')).toBe(true);
      expect(isValidReportCategory('pollution')).toBe(true);
      expect(isValidReportCategory('drainage')).toBe(true);
      expect(isValidReportCategory('other')).toBe(true);
    });

    it('should reject invalid categories', () => {
      expect(isValidReportCategory('invalid')).toBe(false);
      expect(isValidReportCategory('')).toBe(false);
      expect(isValidReportCategory(null as any)).toBe(false);
    });
  });

  describe('isValidReportStatus', () => {
    it('should validate correct statuses', () => {
      expect(isValidReportStatus('pending')).toBe(true);
      expect(isValidReportStatus('investigating')).toBe(true);
      expect(isValidReportStatus('resolved')).toBe(true);
    });

    it('should reject invalid statuses', () => {
      expect(isValidReportStatus('invalid')).toBe(false);
      expect(isValidReportStatus('')).toBe(false);
      expect(isValidReportStatus(null as any)).toBe(false);
    });
  });

  describe('validateFile', () => {
    const createMockFile = (name: string, size: number, type: string): File => {
      const file = new File([''], name, { type });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    it('should validate correct files', () => {
      const validFile = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg');
      const result = validateFile(validFile);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files that are too large', () => {
      const largeFile = createMockFile('large.jpg', 20 * 1024 * 1024, 'image/jpeg');
      const result = validateFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size must be less than');
    });

    it('should reject invalid file types', () => {
      const invalidFile = createMockFile('test.txt', 1024, 'text/plain');
      const result = validateFile(invalidFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Only JPEG, PNG, and WebP images are allowed');
    });

    it('should allow null/undefined files', () => {
      const result = validateFile(null as any);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateReportData', () => {
    const validData = {
      category: 'dumping' as const,
      latitude: 7.6219,
      longitude: 5.2206,
      description: 'Test description',
      reporter_email: 'test@example.com',
      location_name: 'Test Location',
    };

    it('should validate correct report data', () => {
      const result = validateReportData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedData).toBeDefined();
    });

    it('should require category', () => {
      const result = validateReportData({ ...validData, category: undefined as any });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category is required');
    });

    it('should require coordinates', () => {
      const result = validateReportData({ 
        ...validData, 
        latitude: undefined as any, 
        longitude: undefined as any 
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Location coordinates are required');
    });

    it('should validate email format', () => {
      const result = validateReportData({ ...validData, reporter_email: 'invalid-email' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should validate description length', () => {
      const longDescription = 'a'.repeat(1001);
      const result = validateReportData({ ...validData, description: longDescription });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description must be less than 1000 characters');
    });
  });

  describe('validateLoginData', () => {
    it('should validate correct login data', () => {
      const result = validateLoginData({ username: 'admin', password: 'password123' });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedData).toBeDefined();
    });

    it('should require minimum username length', () => {
      const result = validateLoginData({ username: 'ab', password: 'password123' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters');
    });

    it('should require minimum password length', () => {
      const result = validateLoginData({ username: 'admin', password: '123' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('invalid-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456-42661417400g')).toBe(false);
    });
  });
});