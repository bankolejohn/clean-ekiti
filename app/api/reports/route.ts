/**
 * Public API routes for environmental reports
 * Handles report creation and retrieval with security and validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/cloudinary';
import { validateReportData, validateFile } from '@/lib/validation';
import { createErrorResponse, ValidationError } from '@/lib/errors';
import { rateLimit, getClientIP, logRequest, getCORSHeaders, getSecurityHeaders } from '@/lib/middleware';
import { API_MESSAGES, RATE_LIMITS } from '@/lib/constants';
import type { Report, CreateReportData } from '@/types';

/**
 * GET /api/reports - Fetch all public reports
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logRequest(request, 'Fetching public reports');

    // Apply rate limiting
    const clientIP = getClientIP(request);
    if (!rateLimit(clientIP, RATE_LIMITS.API_REQUESTS_PER_MINUTE)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getCORSHeaders() }
      );
    }

    // Fetch reports with only necessary fields for public view
    const { data: reports, error: fetchError } = await supabase
      .from('reports')
      .select(`
        id,
        category,
        description,
        image_url,
        latitude,
        longitude,
        status,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(100); // Limit results for performance

    if (fetchError) {
      throw new Error(`Failed to fetch reports: ${fetchError.message}`);
    }

    return NextResponse.json(
      { reports },
      { 
        headers: { 
          ...getCORSHeaders(), 
          ...getSecurityHeaders(),
          'Cache-Control': 'public, max-age=300' // 5 minutes cache
        } 
      }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch reports');
  }
}

/**
 * POST /api/reports - Create a new environmental report
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logRequest(request, 'Creating new report');

    // Apply rate limiting for report creation
    const clientIP = getClientIP(request);
    if (!rateLimit(`reports:${clientIP}`, RATE_LIMITS.REPORTS_PER_HOUR, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many reports submitted. Please try again later.' },
        { status: 429, headers: getCORSHeaders() }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    // Extract and validate basic data
    const rawData: Partial<CreateReportData> = {
      category: formData.get('category') as any,
      description: formData.get('description') as string || undefined,
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
      location_name: formData.get('location_name') as string || undefined,
      reporter_email: formData.get('reporter_email') as string || undefined,
    };

    // Validate report data
    const validation = validateReportData(rawData);
    if (!validation.isValid) {
      throw new ValidationError(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const reportData = validation.sanitizedData!;

    // Handle image upload if present
    let image_url: string | null = null;
    const imageFile = formData.get('image') as File;
    
    console.log('Image file received:', {
      hasFile: !!imageFile,
      size: imageFile?.size,
      type: imageFile?.type,
      name: imageFile?.name
    });
    
    if (imageFile && imageFile.size > 0) {
      // Validate image file
      const fileValidation = validateFile(imageFile);
      console.log('File validation result:', fileValidation);
      
      if (!fileValidation.isValid) {
        console.error('File validation failed:', fileValidation.error);
        throw new ValidationError(fileValidation.error!);
      }

      try {
        console.log('Starting image upload to Cloudinary...');
        image_url = await uploadImage(imageFile);
        console.log('Image uploaded successfully:', image_url);
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        console.error('Upload error details:', {
          message: uploadError instanceof Error ? uploadError.message : 'Unknown error',
          stack: uploadError instanceof Error ? uploadError.stack : undefined
        });
        throw new ValidationError(`Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
      }
    }

    // Create report in database
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        ...reportData,
        image_url,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !report) {
      throw new Error(`Failed to create report: ${insertError?.message || 'Unknown error'}`);
    }

    return NextResponse.json(
      { 
        message: API_MESSAGES.SUCCESS.REPORT_CREATED,
        report: {
          id: report.id,
          category: report.category,
          status: report.status,
          created_at: report.created_at,
        }
      },
      { 
        status: 201,
        headers: { ...getCORSHeaders(), ...getSecurityHeaders() }
      }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to create report');
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