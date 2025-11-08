'use client'

import { useState } from 'react'
import Link from 'next/link'

const steps = [
  {
    id: 1,
    title: "Spot an Issue",
    description: "See illegal dumping, flooding, or pollution in your area? Take a photo with your phone.",
    icon: (
      <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "bg-red-100 text-red-600"
  },
  {
    id: 2,
    title: "Report It",
    description: "Upload your photo, select the issue type, and pin the exact location on our map.",
    icon: (
      <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: 3,
    title: "We Take Action",
    description: "Local authorities receive your report and work to resolve the environmental issue.",
    icon: (
      <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-green-100 text-green-600"
  }
]

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1)

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How CleanEkiti Works
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Making environmental reporting simple and effective for everyone in Ekiti State
          </p>
        </div>

        {/* Interactive Steps */}
        <div className="max-w-6xl mx-auto">
          {/* Step Navigation */}
          <div className="flex justify-center mb-8 md:mb-12">
            <div className="flex space-x-4 md:space-x-8 bg-white rounded-full p-2 shadow-lg">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center space-x-2 px-4 md:px-6 py-3 rounded-full transition-all duration-300 ${
                    activeStep === step.id
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <span className="font-semibold">{step.id}</span>
                  <span className="hidden md:inline">{step.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Step Display */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-12 mb-8">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-12">
              {/* Icon */}
              <div className={`flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center ${steps[activeStep - 1].color}`}>
                {steps[activeStep - 1].icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Step {activeStep}: {steps[activeStep - 1].title}
                </h3>
                <p className="text-lg md:text-xl text-gray-600 mb-6">
                  {steps[activeStep - 1].description}
                </p>
                
                {/* Step-specific CTA */}
                {activeStep === 1 && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link
                      href="/report"
                      className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Start Reporting Now
                    </Link>
                    <Link
                      href="/map"
                      className="border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
                    >
                      View Existing Reports
                    </Link>
                  </div>
                )}
                
                {activeStep === 2 && (
                  <div className="bg-gray-50 rounded-lg p-4 md:p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">What you can report:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <span>• Illegal Dumping</span>
                      <span>• Flooding Issues</span>
                      <span>• Water Pollution</span>
                      <span>• Blocked Drainage</span>
                      <span>• Air Pollution</span>
                      <span>• Other Issues</span>
                    </div>
                  </div>
                )}
                
                {activeStep === 3 && (
                  <div className="bg-green-50 rounded-lg p-4 md:p-6">
                    <h4 className="font-semibold text-green-900 mb-2">Track Progress:</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Pending</span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">Investigating</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Resolved</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeStep === step.id ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Auto-advance timer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              const nextStep = activeStep === steps.length ? 1 : activeStep + 1
              setActiveStep(nextStep)
            }}
            className="text-primary hover:text-secondary font-medium text-sm"
          >
            Next Step →
          </button>
        </div>
      </div>
    </section>
  )
}