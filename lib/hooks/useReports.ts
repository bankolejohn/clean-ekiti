/**
 * Custom React hook for managing reports data
 * Provides centralized state management for reports with caching and error handling
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Report, ReportStats, CreateReportData } from '@/types';

interface UseReportsOptions {
  autoFetch?: boolean;
  refreshInterval?: number;
}

interface UseReportsReturn {
  reports: Report[];
  stats: ReportStats | null;
  loading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  createReport: (data: CreateReportData, image?: File) => Promise<Report>;
  updateReportStatus: (id: string, status: Report['status']) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  refreshReports: () => Promise<void>;
}

export function useReports(options: UseReportsOptions = {}): UseReportsReturn {
  const { autoFetch = true, refreshInterval } = options;

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch reports from API
   */
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reports', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.statusText}`);
      }

      const data = await response.json();
      setReports(data.reports || []);

      // Calculate stats if not provided
      if (data.stats) {
        setStats(data.stats);
      } else {
        const calculatedStats = calculateStats(data.reports || []);
        setStats(calculatedStats);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reports';
      setError(errorMessage);
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new report
   */
  const createReport = useCallback(async (data: CreateReportData, image?: File): Promise<Report> => {
    const formData = new FormData();
    
    // Append form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Append image if provided
    if (image) {
      formData.append('image', image);
    }

    const response = await fetch('/api/reports', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create report');
    }

    const result = await response.json();
    
    // Refresh reports list
    await fetchReports();
    
    return result.report;
  }, [fetchReports]);

  /**
   * Update report status (admin only)
   */
  const updateReportStatus = useCallback(async (id: string, status: Report['status']) => {
    const response = await fetch('/api/admin/reports', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update report status');
    }

    // Update local state
    setReports(prev => 
      prev.map(report => 
        report.id === id ? { ...report, status, updated_at: new Date().toISOString() } : report
      )
    );

    // Recalculate stats
    const updatedReports = reports.map(report => 
      report.id === id ? { ...report, status } : report
    );
    setStats(calculateStats(updatedReports));
  }, [reports]);

  /**
   * Delete a report (admin only)
   */
  const deleteReport = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/reports?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete report');
    }

    // Update local state
    const updatedReports = reports.filter(report => report.id !== id);
    setReports(updatedReports);
    setStats(calculateStats(updatedReports));
  }, [reports]);

  /**
   * Refresh reports data
   */
  const refreshReports = useCallback(async () => {
    await fetchReports();
  }, [fetchReports]);

  /**
   * Calculate statistics from reports array
   */
  const calculateStats = useCallback((reportsArray: Report[]): ReportStats => {
    return reportsArray.reduce(
      (acc, report) => {
        acc.total++;
        acc.byStatus[report.status] = (acc.byStatus[report.status] || 0) + 1;
        acc.byCategory[report.category] = (acc.byCategory[report.category] || 0) + 1;
        return acc;
      },
      {
        total: 0,
        byStatus: {} as Record<Report['status'], number>,
        byCategory: {} as Record<Report['category'], number>,
      }
    );
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchReports();
    }
  }, [autoFetch, fetchReports]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchReports, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchReports]);

  return {
    reports,
    stats,
    loading,
    error,
    fetchReports,
    createReport,
    updateReportStatus,
    deleteReport,
    refreshReports,
  };
}