/**
 * Admin-only API routes for report management
 * Handles CRUD operations with authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, logRequest, getCORSHeaders, getSecurityHeaders } from '@/lib/middleware';
import { createErrorResponse, ValidationError, NotFoundError } from '@/lib/errors';
import { isValidReportStatus, isValidUUID } from '@/lib/validation';
import { API_MESSAGES } from '@/lib/constants';
import type { Report, ReportStats } from '@/types';

/**
 * GET /api/admin/reports - Fetch all reports with statistics (Admin only)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logRequest(request, 'Admin fetching reports');

    // Verify admin authentication
    const admin = await requireAuth(request);

    // Fetch all reports with full details
    const { data: reports, error: fetchError } = await supabaseAdmin
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch reports: ${fetchError.message}`);
    }

    // Calculate statistics
    const stats: ReportStats = (reports || []).reduce(
      (acc, report) => {
        acc.total++;
        acc.byStatus[report.status] = (acc.byStatus[report.status] || 0) + 1;
        acc.byCategory[report.category] = (acc.byCategory[report.category] || 0) + 1;
        return acc;
      },
      {
        total: 0,
        byStatus: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
      }
    );

    return NextResponse.json(
      { reports, stats },
      { headers: { ...getCORSHeaders(), ...getSecurityHeaders() } }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch reports');
  }
}

/**
 * PUT /api/admin/reports - Update report status (Admin only)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    logRequest(request, 'Admin updating report');

    // Verify admin authentication
    const admin = await requireAuth(request);

    // Parse and validate request body
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      throw new ValidationError('Report ID and status are required');
    }

    if (!isValidUUID(id)) {
      throw new ValidationError('Invalid report ID format');
    }

    if (!isValidReportStatus(status)) {
      throw new ValidationError('Invalid status value');
    }

    // Update report status (without updated_by since column doesn't exist)
    const { data: report, error: updateError } = await supabaseAdmin
      .from('reports')
      .update({ 
        status, 
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      throw new NotFoundError(`Report not found: ${updateError.message}`);
    }

    if (!report) {
      throw new NotFoundError('Report not found');
    }

    return NextResponse.json(
      { 
        message: API_MESSAGES.SUCCESS.REPORT_UPDATED,
        report 
      },
      { headers: { ...getCORSHeaders(), ...getSecurityHeaders() } }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to update report');
  }
}

/**
 * DELETE /api/admin/reports - Delete a report (Admin only)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    logRequest(request, 'Admin deleting report');

    // Verify admin authentication
    const admin = await requireAuth(request);

    // Get report ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new ValidationError('Report ID is required');
    }

    if (!isValidUUID(id)) {
      throw new ValidationError('Invalid report ID format');
    }

    // Check if report exists before deletion
    const { data: existingReport, error: checkError } = await supabaseAdmin
      .from('reports')
      .select('id, image_url')
      .eq('id', id)
      .single();

    if (checkError || !existingReport) {
      throw new NotFoundError('Report not found');
    }

    // Delete the report
    const { error: deleteError } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Failed to delete report: ${deleteError.message}`);
    }

    // TODO: In a production environment, you might want to:
    // 1. Delete associated image from Cloudinary
    // 2. Log the deletion for audit purposes
    // 3. Soft delete instead of hard delete

    return NextResponse.json(
      { message: API_MESSAGES.SUCCESS.REPORT_DELETED },
      { headers: { ...getCORSHeaders(), ...getSecurityHeaders() } }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to delete report');
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