'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function StrategicWheel() {
  const [currentSection, setCurrentSection] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    checkUser()
  }, [router, supabase])

  const sections = [
    {
      id: 'vision',
      title: 'Vision & Purpose',
      icon: '💡',
      description: 'Define why your business exists and where it\'s going',
      color: '#E0F2FE', // light blue
      darkColor: '#0284C7'
    },
    {
      id: 'strategy',
      title: 'Strategy & Market', 
      icon: '🎯',
      description: 'Identify your target market and competitive advantage',
      color: '#FEF3C7', // light yellow
      darkColor: '#D97706'
    },
    {
      id: 'people',
      title: 'People & Culture',
      icon: '👥',
      description: 'Build your team and define your culture',
      color: '#D1FAE5', // light green
      darkColor: '#059669'
    },
    {
      id: 'systems',
      title: 'Systems & Execution',
      icon: '⚙️',
      description: 'Design your core processes and execution rhythm',
      color: '#DBEAFE', // light blue
      darkColor: '#2563EB'
    },
    {
      id: 'money',
      title: 'Money & Metrics',
      icon: '📊',
      description: 'Set financial goals and key performance indicators',
      color: '#FED7AA', // light orange
      darkColor: '#EA580C'
    },
    {
      id: 'communications',
      title: 'Communications & Alignment',
      icon: '💬',
      description: 'Establish team alignment and meeting rhythms',
      color: '#E9D5FF', // light purple
      darkColor: '#9333EA'
    }
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  // SVG Wheel Component
  const StrategicWheelDiagram = () => {
    const centerX = 150
    const centerY = 150
    const outerRadius = 130
    const innerRadius = 55
    
    // Calculate path for each segment
    const createPath = (startAngle: number, endAngle: number) => {
      const start = (startAngle * Math.PI) / 180
      const end = (endAngle * Math.PI) / 180
      
      const x1 = centerX + outerRadius * Math.cos(start)
      const y1 = centerY + outerRadius * Math.sin(start)
      const x2 = centerX + outerRadius * Math.cos(end)
      const y2 = centerY + outerRadius * Math.sin(end)
      
      const x3 = centerX + innerRadius * Math.cos(start)
      const y3 = centerY + innerRadius * Math.sin(start)
      const x4 = centerX + innerRadius * Math.cos(end)
      const y4 = centerY + innerRadius * Math.sin(end)
      
      return `
        M ${x3} ${y3}
        L ${x1} ${y1}
        A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2}
        L ${x4} ${y4}
        A ${innerRadius} ${innerRadius} 0 0 0 ${x3} ${y3}
      `
    }
    
    // Calculate text position for each segment
    const getTextPosition = (index: number) => {
      const angle = -90 + (index * 60) + 30 // Center of each segment
      const radius = (outerRadius + innerRadius) / 2
      const radian = (angle * Math.PI) / 180
      
      return {
        x: centerX + radius * Math.cos(radian),
        y: centerY + radius * Math.sin(radian)
      }
    }

    return (
      <svg 
        width="300" 
        height="300" 
        viewBox="0 0 300 300" 
        className="w-full h-full max-w-xs mx-auto"
      >
        {/* Segments */}
        {sections.map((section, index) => {
          const startAngle = -90 + (index * 60)
          const endAngle = startAngle + 60
          const textPos = getTextPosition(index)
          
          return (
            <g key={section.id}>
              {/* Segment Path */}
              <path
                d={createPath(startAngle, endAngle)}
                fill={section.color}
                stroke="#fff"
                strokeWidth="2"
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => router.push(`/strategic-wheel/${section.id}`)}
              />
              
              {/* Icon */}
              <text
                x={textPos.x}
                y={textPos.y - 8}
                textAnchor="middle"
                className="text-xl pointer-events-none"
              >
                {section.icon}
              </text>
              
              {/* Title */}
              <text
                x={textPos.x}
                y={textPos.y + 8}
                textAnchor="middle"
                className="text-[10px] font-semibold pointer-events-none"
                fill="#111"
              >
                {section.title.split('&')[0]}
              </text>
              {section.title.includes('&') && (
                <text
                  x={textPos.x}
                  y={textPos.y + 20}
                  textAnchor="middle"
                  className="text-[10px] font-semibold pointer-events-none"
                  fill="#111"
                >
                  {'&' + section.title.split('&')[1]}
                </text>
              )}
            </g>
          )
        })}
        
        {/* Center Circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="white"
          stroke="#ddd"
          strokeWidth="2"
        />
        
        {/* Center Text */}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="text-sm font-bold"
          fill="#111"
        >
          Strategic
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="text-sm font-bold"
          fill="#111"
        >
          Wheel
        </text>
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Strategic Wheel Planning</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Build Your Strategic Foundation
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            The Strategic Wheel is your comprehensive business planning framework. 
            Work through each of the 6 components to create a complete strategic plan for your business.
          </p>
          
          {/* Strategic Wheel Diagram */}
          <div className="mb-6">
            <StrategicWheelDiagram />
          </div>

          <div className="text-center text-gray-600">
            Click on any segment to start planning that component
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <Link
              key={section.id}
              href={`/strategic-wheel/${section.id}`}
              className={`block p-6 bg-white rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105 ${
                index === 0 ? 'ring-2 ring-blue-500' : ''
              }`}
              onMouseEnter={() => setCurrentSection(index)}
              onMouseLeave={() => setCurrentSection(null)}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: section.color }}
                >
                  <span className="text-2xl">{section.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {section.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {index === 0 ? 'Start here' : `Component ${index + 1}`}
                    </span>
                    <span className="text-blue-600">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: section.color }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">{section.title}</div>
                </div>
                <div className="text-sm text-gray-500">Not started</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
