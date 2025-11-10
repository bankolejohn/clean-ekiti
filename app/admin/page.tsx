'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Report } from '@/types'
import ReportsSkeleton from '@/components/ReportsSkeleton'

export default function AdminDashboard() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports')
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await response.json()
      setReports(data.reports || [])
      setStats(data.stats || {})
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const updateReportStatus = async (id: string, status: Report['status']) => {
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (response.ok) {
        // Update the reports list
        const updatedReports = reports.map(report => 
          report.id === id ? { ...report, status } : report
        )
        setReports(updatedReports)
        
        // Recalculate stats
        const newStats = updatedReports.reduce((acc: any, report) => {
          acc[report.status] = (acc[report.status] || 0) + 1
          return acc
        }, {})
        setStats({ byStatus: newStats })
        
        setSelectedReport(null)
        
        // Show success message
        alert('Report status updated successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to update: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to update report:', error)
      alert('Failed to update report. Please try again.')
    }
  }

  const deleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/reports?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Update the reports list
        const updatedReports = reports.filter(report => report.id !== id)
        setReports(updatedReports)
        
        // Recalculate stats
        const newStats = updatedReports.reduce((acc: any, report) => {
          acc[report.status] = (acc[report.status] || 0) + 1
          return acc
        }, {})
        setStats({ byStatus: newStats })
        
        setSelectedReport(null)
        
        // Show success message
        alert('Report deleted successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to delete: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to delete report:', error)
      alert('Failed to delete report. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-primary text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-green-100 mt-1">Loading reports...</p>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-4 md:p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2 loading-skeleton"></div>
                <div className="h-8 bg-gray-200 rounded w-12 loading-skeleton"></div>
              </div>
            ))}
          </div>
          <ReportsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-green-100 mt-1">Manage environmental reports</p>
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="flex items-center space-x-2 text-green-100 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Back to Homepage</span>
              </a>
              
              <div className="border-l border-green-300 pl-4">
                <button
                  onClick={() => {
                    // Clear admin cookie and redirect to login
                    document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                    window.location.href = '/admin/login'
                  }}
                  className="flex items-center space-x-2 text-green-100 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-sm md:text-lg font-semibold text-gray-900">Total Reports</h3>
            <p className="text-2xl md:text-3xl font-bold text-primary">{reports.length}</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-sm md:text-lg font-semibold text-gray-900">Pending</h3>
            <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.byStatus?.pending || 0}</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-sm md:text-lg font-semibold text-gray-900">Investigating</h3>
            <p className="text-2xl md:text-3xl font-bold text-orange-600">{stats.byStatus?.investigating || 0}</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-sm md:text-lg font-semibold text-gray-900">Resolved</h3>
            <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.byStatus?.resolved || 0}</p>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b">
            <h2 className="text-lg md:text-xl font-semibold">Recent Reports</h2>
          </div>
          
          {/* Mobile Card View */}
          <div className="md:hidden">
            {reports.map((report) => (
              <div key={report.id} className="border-b border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="capitalize font-medium text-gray-900">{report.category}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    report.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {new Date(report.created_at).toLocaleDateString()}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="text-primary hover:text-secondary font-medium text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize font-medium">{report.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        report.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-primary hover:text-secondary font-medium mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mobile-scroll">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold capitalize">{selectedReport.category} Report</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {selectedReport.image_url && (
                <img
                  src={selectedReport.image_url}
                  alt="Report"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-3 mb-6">
                <p><strong>Description:</strong> {selectedReport.description || 'No description provided'}</p>
                <p><strong>Location:</strong> {selectedReport.location_name || `${selectedReport.latitude}, ${selectedReport.longitude}`}</p>
                {selectedReport.location_name && (
                  <p className="text-sm text-gray-500"><strong>Coordinates:</strong> {selectedReport.latitude}, {selectedReport.longitude}</p>
                )}
                <p><strong>Reporter Email:</strong> {selectedReport.reporter_email || 'Not provided'}</p>
                <p><strong>Submitted:</strong> {new Date(selectedReport.created_at).toLocaleString()}</p>
                <p><strong>Current Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    selectedReport.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    selectedReport.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedReport.status}
                  </span>
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'investigating')}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm md:text-base"
                >
                  Mark Investigating
                </button>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm md:text-base"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'pending')}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm md:text-base"
                >
                  Mark Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}