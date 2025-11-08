'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
  initialPosition: [number, number]
}

export default function LocationPicker({ onLocationSelect, initialPosition }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialPosition)

  useEffect(() => {
    setPosition(initialPosition)
  }, [initialPosition])

  const MapEvents = () => {
    const map = require('react-leaflet').useMapEvents({
      click(e: any) {
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
        setPosition(newPos)
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      },
    })
    return null
  }

  return (
    <MapContainer center={position} zoom={15} className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} />
      <MapEvents />
    </MapContainer>
  )
}