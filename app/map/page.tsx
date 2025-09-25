'use client'

import { useState, useEffect } from 'react'
import ReportsMap from '@/components/ReportsMap'
import { Report } from '@/types'
import Navigation from '@/components/Navigation'

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        setReports(data.reports || [])
        setFilteredReports(data.reports || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let filtered = reports
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter)
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter)
    }
    
    setFilteredReports(filtered)
  }, [reports, categoryFilter, statusFilter])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Environmental Reports Map</h1>
          <p className="text-green-100 mt-1">View all reported issues across Ekiti State</p>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="dumping">Illegal Dumping</option>
                <option value="flooding">Flooding</option>
                <option value="pollution">Pollution</option>
                <option value="drainage">Blocked Drainage</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredReports.length} of {reports.length} reports
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1" style={{ height: 'calc(100vh - 200px)' }}>
        {loading ? (
          <div className="h-full bg-gray-200 animate-pulse" />
        ) : (
          <ReportsMap reports={filteredReports} height="h-full" />
        )}
      </div>
    </div>
  )
}