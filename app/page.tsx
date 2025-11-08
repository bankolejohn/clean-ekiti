import Link from 'next/link'
import Image from 'next/image'
import ReportsMap from '@/components/ReportsMap'
import Navigation from '@/components/Navigation'
import HowItWorks from '@/components/HowItWorks'
import VideoDemo from '@/components/VideoDemo'
import ImpactStats from '@/components/ImpactStats'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Header */}
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-2">
            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-white p-1">
              <Image 
                src="/ekiti-state-logo.jpeg" 
                alt="Ekiti State Government Logo" 
                width={64}
                height={64}
                className="rounded-full object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">CleanEkiti</h1>
              <p className="text-green-100 text-sm md:text-base">Official Environmental Reporting Platform</p>
            </div>
          </div>
          <p className="text-green-100 mt-2 text-sm md:text-base">Community-driven environmental reporting for Ekiti State</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
            Help Keep Ekiti Clean
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            Report environmental issues in your community with photos and precise locations. 
            Together, we can create cleaner and safer neighborhoods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/report" 
              className="bg-accent text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Report an Issue Now
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-primary hover:text-secondary font-semibold flex items-center space-x-2"
            >
              <span>See How It Works</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <VideoDemo />

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Impact Stats */}
      <ImpactStats />

      {/* Map Section */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">Recent Reports</h3>
          <div className="h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
            <ReportsMap />
          </div>
          <div className="text-center mt-4 md:mt-6">
            <Link 
              href="/map" 
              className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary font-semibold transition-colors md:bg-transparent md:text-primary md:hover:text-secondary md:px-0 md:py-0"
            >
              View Full Map →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="relative w-10 h-10 rounded-full bg-white p-1">
                <Image 
                  src="/ekiti-state-logo.jpeg" 
                  alt="Ekiti State Government" 
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="text-center md:text-left">
                <p className="font-semibold">CleanEkiti Platform</p>
                <p className="text-gray-400 text-sm">&copy; 2024 Ekiti State Government</p>
              </div>
            </div>
            
            {/* Admin Access */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">For administrators:</span>
              <Link 
                href="/admin/login" 
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Admin Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}