'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [latestAssessment, setLatestAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        
        // Fetch latest assessment
        const { data: assessment } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        setLatestAssessment(assessment)
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  // Calculate progress percentages
  const getProgress = () => {
    if (!latestAssessment) return { assessment: 0, wheel: 0, disciplines: 0, achievement: 0 }
    
    return {
      assessment: 100, // Assessment is complete if there's a latest assessment
      wheel: 0, // Not implemented yet
      disciplines: 0, // Not implemented yet
      achievement: 0 // Not implemented yet
    }
  }

  const progress = getProgress()
  
  // Calculate the actual score percentage correctly
  const calculateScorePercentage = () => {
    if (!latestAssessment) return 0
    
    const totalScore = latestAssessment.total_score || 0
    const maxPossibleScore = 130 // Same as results page calculation
    
    // Ensure percentage doesn't exceed 100%
    return Math.min(100, Math.round((totalScore / maxPossibleScore) * 100))
  }
  
  const scorePercentage = calculateScorePercentage()

  // Get revenue stage from assessment
  const revenueStage = latestAssessment?.revenue_stage || 'Not assessed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Business Coaching Platform</h1>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Track your business development journey through our proven methodology.
          </p>
        </div>

        {/* Business Health Score Card */}
        {latestAssessment && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium opacity-90 mb-2">Your Business Health Score</h3>
                <div className="text-5xl font-bold mb-3">{scorePercentage}%</div>
                <div className="space-y-1">
                  <p className="text-sm opacity-90">Revenue Stage: <span className="font-semibold">{revenueStage}</span></p>
                  <p className="text-sm opacity-75">
                    Last assessed: {new Date(latestAssessment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Link
                href="/assessment/results"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                View Results
              </Link>
            </div>
          </div>
        )}

        {/* Methodology Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Diagnostic Assessment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{progress.assessment}%</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Diagnostic Assessment</h3>
            <p className="text-sm text-gray-600 mb-4">Comprehensive business evaluation</p>
            <Link
              href="/assessment"
              className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {latestAssessment ? 'Retake' : 'Start'} Assessment
            </Link>
          </div>

          {/* Strategic Wheel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">☸️</span>
              </div>
              <span className="text-2xl font-bold text-gray-400">{progress.wheel}%</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Strategic Wheel</h3>
            <p className="text-sm text-gray-600 mb-4">6-component strategic planning</p>
            <button
              disabled
              className="block w-full text-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          {/* Success Disciplines */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <span className="text-2xl font-bold text-gray-400">{progress.disciplines}%</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Success Disciplines</h3>
            <p className="text-sm text-gray-600 mb-4">Focus on top 3 disciplines</p>
            <button
              disabled
              className="block w-full text-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          {/* Achievement Engine */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <span className="text-2xl font-bold text-gray-400">{progress.achievement}%</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Achievement Engine</h3>
            <p className="text-sm text-gray-600 mb-4">90-day implementation plan</p>
            <button
              disabled
              className="block w-full text-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/assessment"
              className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-900">📝 Assessment</div>
              <div className="text-sm text-gray-600 mt-1">
                {latestAssessment ? 'Update your' : 'Take your first'} diagnostic
              </div>
            </Link>
            
            <div className="p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
              <div className="font-medium text-gray-500">📚 Resources</div>
              <div className="text-sm text-gray-400 mt-1">Coming soon</div>
            </div>
            
            <div className="p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
              <div className="font-medium text-gray-500">👥 Team</div>
              <div className="text-sm text-gray-400 mt-1">Coming soon</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
