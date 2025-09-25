'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Report } from '@/types'

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

  const updateReportStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (response.ok) {
        setReports(reports.map(report => 
          report.id === id ? { ...report, status } : report
        ))
        setSelectedReport(null)
      }
    } catch (error) {
      console.error('Failed to update report:', error)
    }
  }

  const deleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return

    try {
      const response = await fetch(`/api/admin/reports?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReports(reports.filter(report => report.id !== id))
        setSelectedReport(null)
      }
    } catch (error) {
      console.error('Failed to delete report:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-green-100 mt-1">Manage environmental reports</p>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Reports</h3>
            <p className="text-3xl font-bold text-primary">{reports.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
            <p className="text-3xl font-bold text-red-600">{stats.pending || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Investigating</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.investigating || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.resolved || 0}</p>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Recent Reports</h2>
          </div>
          <div className="overflow-x-auto">
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
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
                <p><strong>Location:</strong> {selectedReport.latitude}, {selectedReport.longitude}</p>
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

              <div className="flex gap-2">
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'investigating')}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Mark Investigating
                </button>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'pending')}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
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