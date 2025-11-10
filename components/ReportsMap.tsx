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
  const [mapMounted, setMapMounted] = useState(false)

  useEffect(() => {
    // Fix Leaflet default icon issue (only once)
    if (typeof window !== 'undefined' && !mapMounted) {
      const L = require('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      setMapMounted(true);
    }

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
  }, [reports, mapMounted])

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
    <div className={height} key="map-container">
      <MapContainer 
        center={center} 
        zoom={12} 
        className="h-full w-full" 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={20}
          minZoom={1}
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