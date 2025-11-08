'use client'

import { useEffect, useState, useRef } from 'react'
import { Report } from '@/types'

interface ReportsMapProps {
  reports?: Report[]
  height?: string
}

export default function ReportsMap({ reports, height = 'h-full' }: ReportsMapProps) {
  const [mapReports, setMapReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch reports if not provided
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

  useEffect(() => {
    // Only initialize map on client side and if not already initialized
    if (typeof window === 'undefined' || !mapContainerRef.current || mapRef.current || loading) {
      return
    }

    // Dynamically import Leaflet only on client side
    import('leaflet').then((L) => {
      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      // Initialize map
      const map = L.map(mapContainerRef.current!, {
        center: [7.6219, 5.2206], // Ado-Ekiti coordinates
        zoom: 12,
        scrollWheelZoom: true,
      })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 1,
      }).addTo(map)

      // Add markers for each report
      mapReports.forEach((report) => {
        const marker = L.marker([report.latitude, report.longitude]).addTo(map)
        
        // Create popup content
        const popupContent = `
          <div class="p-2">
            <h4 class="font-semibold capitalize text-base mb-1">${report.category}</h4>
            <p class="text-sm text-gray-600 mb-2">${report.description || 'No description'}</p>
            <span class="px-2 py-1 rounded text-xs font-medium ${
              report.status === 'resolved' ? 'bg-green-100 text-green-800' :
              report.status === 'investigating' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }">
              ${report.status}
            </span>
            ${report.image_url ? `<img src="${report.image_url}" alt="Report" class="w-full h-32 object-cover mt-2 rounded" />` : ''}
          </div>
        `
        
        marker.bindPopup(popupContent)
      })

      mapRef.current = map
    })

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [loading, mapReports])

  if (loading) {
    return (
      <div className={`${height} bg-gray-200 animate-pulse rounded-lg flex items-center justify-center`}>
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  return (
    <div className={height}>
      <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
    </div>
  )
}
