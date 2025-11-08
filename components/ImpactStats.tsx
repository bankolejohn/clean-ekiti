'use client'

import { useState, useEffect } from 'react'

interface StatProps {
  end: number
  label: string
  suffix?: string
  duration?: number
}

function AnimatedStat({ end, label, suffix = '', duration = 2000 }: StatProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-green-100 text-sm md:text-base">{label}</div>
    </div>
  )
}

export default function ImpactStats() {
  return (
    <section className="bg-primary py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Making a Real Impact
          </h2>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Together, we're building a cleaner, healthier Ekiti State
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <AnimatedStat end={150} label="Reports Submitted" suffix="+" />
          <AnimatedStat end={89} label="Issues Resolved" suffix="%" />
          <AnimatedStat end={12} label="Communities Served" />
          <AnimatedStat end={24} label="Average Response Time" suffix="h" />
        </div>

        <div className="text-center mt-8 md:mt-12">
          <p className="text-green-100 text-sm md:text-base mb-4">
            Join thousands of citizens making Ekiti cleaner every day
          </p>
          <div className="flex justify-center space-x-4">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-green-800 font-semibold text-xs"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-green-100 text-sm self-center">+1,200 active reporters</span>
          </div>
        </div>
      </div>
    </section>
  )
}