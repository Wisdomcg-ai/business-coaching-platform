'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface WheelSection {
  name: string
  color: string
  icon: string
  description: string
  path: string
}

export default function StrategicWheelPage() {
  const [currentSection, setCurrentSection] = useState(0)
  const router = useRouter()

  const wheelSections: WheelSection[] = [
    { 
      name: 'Vision & Purpose', 
      color: '#B2F5EA',
      icon: '💡',
      description: 'Define why your business exists and where it\'s going',
      path: '/strategic-wheel/vision-purpose'
    },
    { 
      name: 'Strategy & Market', 
      color: '#FEF3C7',
      icon: '🎯',
      description: 'How you win in your market',
      path: '/strategic-wheel/strategy-market'
    },
    { 
      name: 'People & Culture', 
      color: '#BFE6FF',
      icon: '👥',
      description: 'Build the right team with the right culture',
      path: '/strategic-wheel/people-culture'
    },
    { 
      name: 'Systems & Execution', 
      color: '#E9D8FD',
      icon: '⚙️',
      description: 'Create systems that deliver consistent results',
      path: '/strategic-wheel/systems-execution'
    },
    { 
      name: 'Money & Metrics', 
      color: '#FED7D7',
      icon: '📊',
      description: 'Track what matters and drive profitability',
      path: '/strategic-wheel/money-metrics'
    },
    { 
      name: 'Communications & Alignment', 
      color: '#DDD6FE',
      icon: '💬',
      description: 'Keep everyone aligned and moving forward',
      path: '/strategic-wheel/communications-alignment'
    }
  ]

  const handleSectionClick = (index: number) => {
    setCurrentSection(index)
    router.push(wheelSections[index].path)
  }

  const handleNext = () => {
    if (currentSection < wheelSections.length - 1) {
      const nextIndex = currentSection + 1
      setCurrentSection(nextIndex)
      router.push(wheelSections[nextIndex].path)
    } else {
      // Complete - go back to dashboard
      router.push('/dashboard')
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      const prevIndex = currentSection - 1
      setCurrentSection(prevIndex)
      router.push(wheelSections[prevIndex].path)
    }
  }

  const handleStartSection = () => {
    router.push(wheelSections[currentSection].path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Strategic Wheel Planning
          </h1>
          <p className="text-gray-600">
            Build your 6-component strategic foundation for sustainable business growth
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Wheel */}
            <div className="bg-white rounded-lg shadow p-6">
              <svg width="360" height="360" viewBox="0 0 360 360" className="mx-auto">
                {wheelSections.map((section, index) => {
                  const anglePerSection = 60
                  const startAngle = (index * anglePerSection) - 90
                  const endAngle = startAngle + anglePerSection
                  
                  const startRad = (startAngle * Math.PI) / 180
                  const endRad = (endAngle * Math.PI) / 180
                  
                  const outerRadius = 160
                  const innerRadius = 70
                  const cx = 180
                  const cy = 180
                  
                  const x1 = cx + outerRadius * Math.cos(startRad)
                  const y1 = cy + outerRadius * Math.sin(startRad)
                  const x2 = cx + outerRadius * Math.cos(endRad)
                  const y2 = cy + outerRadius * Math.sin(endRad)
                  const ix1 = cx + innerRadius * Math.cos(startRad)
                  const iy1 = cy + innerRadius * Math.sin(startRad)
                  const ix2 = cx + innerRadius * Math.cos(endRad)
                  const iy2 = cy + innerRadius * Math.sin(endRad)
                  
                  const midAngle = startAngle + 30
                  const midRad = (midAngle * Math.PI) / 180
                  const textRadius = 115
                  const textX = cx + textRadius * Math.cos(midRad)
                  const textY = cy + textRadius * Math.sin(midRad)
                  
                  const isActive = index === currentSection
                  
                  return (
                    <g key={index}>
                      <path
                        d={`M ${ix1} ${iy1} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 0 0 ${ix1} ${iy1} Z`}
                        fill={section.color}
                        stroke="#000"
                        strokeWidth="2"
                        opacity={isActive ? 1 : 0.9}
                        onClick={() => handleSectionClick(index)}
                        className="cursor-pointer hover:opacity-100"
                      />
                      
                      <text
                        x={textX}
                        y={textY - 15}
                        textAnchor="middle"
                        fontSize="20"
                        className="pointer-events-none"
                      >
                        {section.icon}
                      </text>
                      
                      <text
                        x={textX}
                        y={textY + 5}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="600"
                        fill="#000"
                        className="pointer-events-none"
                      >
                        {section.name.split(' & ')[0]}
                        {section.name.includes('&') && (
                          <>
                            <tspan x={textX} dy="14"> & {section.name.split(' & ')[1]}</tspan>
                          </>
                        )}
                      </text>
                    </g>
                  )
                })}
                
                <circle cx="180" cy="180" r="70" fill="white" stroke="#000" strokeWidth="2" />
                <text x="180" y="175" textAnchor="middle" fontSize="18" fontWeight="bold">
                  Strategic
                </text>
                <text x="180" y="195" textAnchor="middle" fontSize="18" fontWeight="bold">
                  Wheel
                </text>
              </svg>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-700">OVERALL PROGRESS</span>
                  <span className="font-bold text-2xl">{Math.round((currentSection + 1) / 6 * 100)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(currentSection + 1) / 6 * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">QUICK NAVIGATION</h3>
              <div className="space-y-2">
                {wheelSections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => handleSectionClick(index)}
                    className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition
                      ${index === currentSection 
                        ? 'bg-blue-50 border-2 border-blue-500' 
                        : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className={`font-medium ${
                      index === currentSection ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {section.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: wheelSections[currentSection].color }}
              >
                {wheelSections[currentSection].icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {wheelSections[currentSection].name}
                </h2>
                <p className="text-gray-500">Section {currentSection + 1} of 6</p>
              </div>
            </div>

            <p className="text-gray-600 mb-8">
              {wheelSections[currentSection].description}
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 mb-8 text-center">
              <p className="text-lg text-gray-700 mb-4">
                Ready to complete this section of your Strategic Wheel?
              </p>
              <button
                onClick={handleStartSection}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Start {wheelSections[currentSection].name} →
              </button>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentSection === 0}
                className="px-6 py-3 text-gray-500 font-medium disabled:opacity-50"
              >
                ← Previous
              </button>
              
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
              >
                {currentSection < 5 ? 'Next Section →' : 'Complete Wheel ✓'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}