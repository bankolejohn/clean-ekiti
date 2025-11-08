/**
 * TypeScript type definitions for the CleanEkiti application
 */

import { REPORT_CATEGORIES, REPORT_STATUS } from '@/lib/constants';

// Report types
export type ReportCategory = typeof REPORT_CATEGORIES[number];
export type ReportStatus = typeof REPORT_STATUS[number];

export interface Report {
  id: string;
  category: ReportCategory;
  description?: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  status: ReportStatus;
  reporter_email?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string; // Admin ID who last updated
}

export interface CreateReportData {
  category: ReportCategory;
  description?: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  reporter_email?: string;
}

// Admin user types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminLoginData {
  username: string;
  password: string;
}

export interface AdminSession {
  adminId: string;
  username: string;
}

// Statistics types
export interface ReportStats {
  total: number;
  byStatus: Record<ReportStatus, number>;
  byCategory: Record<ReportCategory, number>;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation types
export interface ValidationResult<T = any> {
  isValid: boolean;
  errors: string[];
  sanitizedData?: T;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// Map types
export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Component prop types
export interface ReportFormProps {
  onSubmit: (data: CreateReportData, image?: File) => Promise<void>;
  isSubmitting?: boolean;
}

export interface ReportCardProps {
  report: Report;
  isAdmin?: boolean;
  onStatusUpdate?: (id: string, status: ReportStatus) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export interface MapProps {
  reports: Report[];
  center?: MapCoordinates;
  zoom?: number;
  onLocationSelect?: (coordinates: MapCoordinates) => void;
}

// Error types
export interface AppError {
  name: string;
  message: string;
  statusCode: number;
  isOperational: boolean;
  stack?: string;
}