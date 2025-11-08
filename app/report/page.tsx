'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateReportData } from '@/types'
import Navigation from '@/components/Navigation'
import ReportForm from '@/components/ReportForm'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ReportPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle report submission with enhanced error handling
   */
  const handleReportSubmit = async (data: CreateReportData, image?: File) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      
      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      // Append image if provided
      if (image) {
        formData.append('image', image)
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit report')
      }

      const result = await response.json()
      setSuccess(true)
      
      // Redirect after success
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit report'
      setError(errorMessage)
      console.error('Report submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for helping keep Ekiti clean. Your report has been received and will be reviewed by local authorities.
          </p>
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" className="mr-2" />
            <span className="text-sm text-gray-500">Redirecting to homepage...</span>
          </div>
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
          <p className="text-green-100 mt-1">Help us keep Ekiti State clean and sustainable</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Submission Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Report Form */}
        <ReportForm 
          onSubmit={handleReportSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}