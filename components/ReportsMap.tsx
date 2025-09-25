'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Report } from '@/types'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface ReportsMapProps {
  reports?: Report[]
  height?: string
}

export default function ReportsMap({ reports, height = 'h-full' }: ReportsMapProps) {
  const [mapReports, setMapReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

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
    return <div className={`${height} bg-gray-200 animate-pulse rounded-lg`} />
  }

  // Default center: Ado-Ekiti coordinates
  const center: [number, number] = [7.6219, 5.2206]

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'green'
      case 'investigating': return 'orange'
      default: return 'red'
    }
  }

  return (
    <div className={height}>
      <MapContainer center={center} zoom={12} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {mapReports.map((report) => (
          <Marker key={report.id} position={[report.latitude, report.longitude]}>
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold capitalize">{report.category}</h4>
                <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  report.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {report.status}
                </span>
                {report.image_url && (
                  <img src={report.image_url} alt="Report" className="w-full h-32 object-cover mt-2 rounded" />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}