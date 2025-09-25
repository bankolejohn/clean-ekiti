import Link from 'next/link'
import ReportsMap from '@/components/ReportsMap'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Header */}
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">CleanEkiti</h1>
          <p className="text-green-100 mt-2">Community-driven environmental reporting for Ekiti State</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Help Keep Ekiti Clean
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Report environmental issues in your community with photos and precise locations. 
            Together, we can create cleaner and safer neighborhoods.
          </p>
          <Link 
            href="/report" 
            className="bg-accent text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Report an Issue
          </Link>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">Recent Reports</h3>
          <div className="h-96 rounded-lg overflow-hidden shadow-lg">
            <ReportsMap />
          </div>
          <div className="text-center mt-6">
            <Link 
              href="/map" 
              className="text-primary hover:text-secondary font-semibold"
            >
              View Full Map →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 CleanEkiti. Building cleaner communities together.</p>
        </div>
      </footer>
    </div>
  )
}