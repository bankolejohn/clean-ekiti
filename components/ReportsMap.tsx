'use client'

import { useEffect, useState } from 'react'
import { Report } from '@/types'

interface ReportsMapProps {
  reports?: Report[]
  height?: string
}

export default function ReportsMap({ reports, height = 'h-full' }: ReportsMapProps) {
  const [mapReports, setMapReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    if (reports) {
      setMapReports(reports)
      setLoading(false)
    } else {
      fetch('/api/reports')
        .then(res => res.json())
        .then(data => {
          setMapReports(data.reports || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [reports])

  if (loading) {
    return (
      <div className={`${height} bg-gray-200 animate-pulse rounded-lg flex items-center justify-center`}>
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  // Calculate center point from all reports
  const centerLat = mapReports.length > 0 
    ? mapReports.reduce((sum, r) => sum + r.latitude, 0) / mapReports.length 
    : 7.6219
  const centerLng = mapReports.length > 0 
    ? mapReports.reduce((sum, r) => sum + r.longitude, 0) / mapReports.length 
    : 5.2206

  return (
    <div className={`${height} relative`}>
      {/* Map using Google Maps Embed API (free, no API key needed for basic use) */}
      <div className="h-full w-full bg-gray-100 rounded-lg overflow-hidden relative">
        {/* Simple map with markers */}
        <div className="absolute inset-0 grid grid-cols-1 gap-0">
          {/* Map background */}
          <div className="relative h-full w-full bg-gradient-to-br from-green-50 to-blue-50">
            {/* Grid overlay to simulate map */}
            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full" style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
            </div>

            {/* Map markers */}
            <div className="absolute inset-0 overflow-hidden">
              {mapReports.map((report, index) => {
                // Convert lat/lng to pixel position (simplified)
                const x = ((report.longitude - (centerLng - 0.05)) / 0.1) * 100
                const y = ((centerLat + 0.05 - report.latitude) / 0.1) * 100

                return (
                  <div
                    key={report.id}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                    }}
                    onClick={() => setSelectedReport(report)}
                  >
                    {/* Marker pin */}
                    <div className="relative">
                      <svg
                        className={`w-8 h-8 drop-shadow-lg ${
                          report.status === 'resolved' ? 'text-green-600' :
                          report.status === 'investigating' ? 'text-orange-600' :
                          'text-red-600'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0zM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11z" />
                      </svg>
                      <div className="absolute -top-1 -right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-current">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Center label */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm font-semibold text-gray-700">Ekiti State, Nigeria</p>
              <p className="text-xs text-gray-500">{mapReports.length} reports</p>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
              <p className="text-xs font-semibold mb-2">Status</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span className="text-xs">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                  <span className="text-xs">Investigating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span className="text-xs">Resolved</span>
                </div>
              </div>
            </div>

            {/* Zoom controls */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden">
              <button className="block w-10 h-10 flex items-center justify-center hover:bg-gray-100 border-b">
                <span className="text-xl font-bold">+</span>
              </button>
              <button className="block w-10 h-10 flex items-center justify-center hover:bg-gray-100">
                <span className="text-xl font-bold">−</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report details popup */}
      {selectedReport && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold capitalize text-lg">{selectedReport.category}</h4>
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
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            )}
            
            <p className="text-sm text-gray-600 mb-3">
              {selectedReport.description || 'No description provided'}
            </p>
            
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                selectedReport.status === 'resolved' ? 'bg-green-100 text-green-800' :
                selectedReport.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedReport.status}
              </span>
              
              <a
                href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View in Google Maps →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
