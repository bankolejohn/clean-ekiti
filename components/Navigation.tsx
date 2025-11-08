'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-primary">
            <img 
              src="/ekiti-state-logo.jpeg" 
              alt="Ekiti State Logo" 
              className="w-8 h-8 rounded-full"
            />
            <span>CleanEkiti</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="text-gray-700 hover:text-primary">
              Home
            </Link>
            <Link href="/map" className="text-gray-700 hover:text-primary">
              View Map
            </Link>
            <Link 
              href="/report" 
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Report Issue
            </Link>
            
            {/* Admin Link */}
            <div className="border-l border-gray-300 pl-6">
              <Link 
                href="/admin/login" 
                className="text-gray-500 hover:text-primary text-sm flex items-center space-x-1"
                title="Admin Login"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Admin</span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            <Link 
              href="/" 
              className="block text-gray-700 hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/map" 
              className="block text-gray-700 hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              View Map
            </Link>
            <Link 
              href="/report" 
              className="block bg-accent text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors text-center font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Report Issue
            </Link>
            <Link 
              href="/admin/login" 
              className="block text-gray-500 hover:text-primary py-2 flex items-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 0 00-8 0v4h8z" />
              </svg>
              <span>Admin Login</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}