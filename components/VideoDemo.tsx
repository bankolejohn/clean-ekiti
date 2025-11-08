'use client'

import { useState } from 'react'

export default function VideoDemo() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              See CleanEkiti in Action
            </h2>
            <p className="text-lg text-gray-600">
              Watch how easy it is to report environmental issues in just 30 seconds
            </p>
          </div>

          {/* Video Container */}
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-video relative">
              {!isPlaying ? (
                // Video Thumbnail/Placeholder
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <div className="text-center">
                    {/* Play Button */}
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-20 h-20 md:w-24 md:h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 mx-auto hover:bg-opacity-30 transition-all duration-300 group"
                    >
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-white ml-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                    
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                      How to Report in 30 Seconds
                    </h3>
                    <p className="text-green-100 text-sm md:text-base">
                      Click to see the simple 3-step process
                    </p>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
                  <div className="absolute bottom-4 right-4 w-24 h-24 bg-white bg-opacity-5 rounded-full"></div>
                  <div className="absolute top-1/2 right-8 w-8 h-8 bg-accent bg-opacity-30 rounded-full"></div>
                </div>
              ) : (
                // Video Player Placeholder (replace with actual video)
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                    <p className="text-lg mb-4">Demo Video Coming Soon!</p>
                    <p className="text-sm text-gray-300 mb-6">
                      For now, try the interactive steps below
                    </p>
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      Back to Preview
                    </button>
                  </div>
                  
                  {/* Replace this div with actual video element when ready */}
                  {/* 
                  <video 
                    className="w-full h-full object-cover" 
                    controls 
                    autoPlay
                    src="/demo-video.mp4"
                  >
                    Your browser does not support the video tag.
                  </video>
                  */}
                </div>
              )}
            </div>
            
            {/* Video Controls Overlay */}
            {isPlaying && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  </button>
                  <span className="text-sm">0:00 / 0:30</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    HD
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Video Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Quick & Easy</h4>
              <p className="text-sm text-gray-600">Report issues in under 30 seconds</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">GPS Accurate</h4>
              <p className="text-sm text-gray-600">Precise location tracking</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Real Results</h4>
              <p className="text-sm text-gray-600">Track progress to resolution</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}