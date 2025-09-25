import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-primary">
            CleanEkiti
          </Link>
          
          <div className="flex space-x-6">
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
          </div>
        </div>
      </div>
    </nav>
  )
}