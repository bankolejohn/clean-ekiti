/**
 * API route tests for reports endpoint
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/reports/route';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  executeQuery: jest.fn(),
  supabase: {},
}));

jest.mock('@/lib/cloudinary', () => ({
  uploadImage: jest.fn(),
}));

jest.mock('@/lib/middleware', () => ({
  rateLimit: jest.fn(() => true),
  getClientIP: jest.fn(() => '127.0.0.1'),
  logRequest: jest.fn(),
  getCORSHeaders: jest.fn(() => ({})),
  getSecurityHeaders: jest.fn(() => ({})),
}));

describe('/api/reports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reports', () => {
    it('should return reports successfully', async () => {
      const mockReports = [
        {
          id: '1',
          category: 'dumping',
          latitude: 7.6219,
          longitude: 5.2206,
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const { executeQuery } = require('@/lib/supabase');
      executeQuery.mockResolvedValue(mockReports);

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reports).toEqual(mockReports);
    });

    it('should handle rate limiting', async () => {
      const { rateLimit } = require('@/lib/middleware');
      rateLimit.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);

      expect(response.status).toBe(429);
    });

    it('should handle database errors', async () => {
      const { executeQuery } = require('@/lib/supabase');
      executeQuery.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/reports', () => {
    it('should create a report successfully', async () => {
      const mockReport = {
        id: '1',
        category: 'dumping',
        latitude: 7.6219,
        longitude: 5.2206,
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
      };

      const { executeQuery } = require('@/lib/supabase');
      executeQuery.mockResolvedValue(mockReport);

      const formData = new FormData();
      formData.append('category', 'dumping');
      formData.append('latitude', '7.6219');
      formData.append('longitude', '5.2206');
      formData.append('description', 'Test description');

      const request = new NextRequest('http://localhost:3000/api/reports', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.report).toBeDefined();
      expect(data.message).toBe('Report submitted successfully');
    });

    it('should handle validation errors', async () => {
      const formData = new FormData();
      formData.append('category', 'invalid-category');

      const request = new NextRequest('http://localhost:3000/api/reports', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle image upload', async () => {
      const mockReport = {
        id: '1',
        category: 'dumping',
        latitude: 7.6219,
        longitude: 5.2206,
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
      };

      const { executeQuery } = require('@/lib/supabase');
      const { uploadImage } = require('@/lib/cloudinary');
      
      executeQuery.mockResolvedValue(mockReport);
      uploadImage.mockResolvedValue('https://example.com/image.jpg');

      const formData = new FormData();
      formData.append('category', 'dumping');
      formData.append('latitude', '7.6219');
      formData.append('longitude', '5.2206');
      
      // Create a mock file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('image', file);

      const request = new NextRequest('http://localhost:3000/api/reports', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(uploadImage).toHaveBeenCalledWith(file);
    });

    it('should handle rate limiting for report creation', async () => {
      const { rateLimit } = require('@/lib/middleware');
      rateLimit.mockImplementation((key) => {
        if (key.startsWith('reports:')) return false;
        return true;
      });

      const formData = new FormData();
      formData.append('category', 'dumping');
      formData.append('latitude', '7.6219');
      formData.append('longitude', '5.2206');

      const request = new NextRequest('http://localhost:3000/api/reports', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(429);
    });
  });
});