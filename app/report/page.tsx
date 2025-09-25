'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { CreateReportData } from '@/types'
import Navigation from '@/components/Navigation'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false })

export default function ReportPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateReportData>({
    category: 'dumping',
    description: '',
    latitude: 7.6219,
    longitude: 5.2206,
    reporter_email: ''
  })
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const submitData = new FormData()
    submitData.append('category', formData.category)
    submitData.append('description', formData.description || '')
    submitData.append('latitude', formData.latitude.toString())
    submitData.append('longitude', formData.longitude.toString())
    submitData.append('reporter_email', formData.reporter_email || '')
    if (image) submitData.append('image', image)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/'), 2000)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="text-gray-600">Thank you for helping keep Ekiti clean. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Report Environmental Issue</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as any})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="dumping">Illegal Dumping</option>
              <option value="flooding">Flooding</option>
              <option value="pollution">Pollution</option>
              <option value="drainage">Blocked Drainage</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe the environmental issue..."
            />
          </div>

          {/* Location Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="h-64 border border-gray-300 rounded-lg overflow-hidden">
              <LocationPicker
                onLocationSelect={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})}
                initialPosition={[formData.latitude, formData.longitude]}
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional - for updates)
            </label>
            <input
              type="email"
              value={formData.reporter_email}
              onChange={(e) => setFormData({...formData, reporter_email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  )
}