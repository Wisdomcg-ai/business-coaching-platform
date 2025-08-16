'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/auth/login')
        return
      }
      
      setUser(user)
      await loadAssessment(user.id)
    } catch (error) {
      console.error('Error:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadAssessment = async (userId: string) => {
    try {
      // Load the most recent assessment
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        console.log('Loaded assessment:', data)
        setAssessment(data)
      } else {
        console.log('No assessment found or error:', error)
      }
    } catch (error) {
      console.error('Error loading assessment:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-50'
    if (percentage >= 50) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return 'Mastery Level'
    if (percentage >= 80) return 'Excellence'
    if (percentage >= 70) return 'Proficiency'
    if (percentage >= 60) return 'Development'
    if (percentage >= 50) return 'Foundation'
    return 'Getting Started'
  }

  const getBusinessStage = (stage: string) => {
    const stageMap: { [key: string]: string } = {
      'Under $250K': 'Foundation',
      '$250K - $1M': 'Traction',
      '$1M - $3M': 'Scaling',
      '$3M - $5M': 'Optimization',
      '$5M - $10M': 'Leadership',
      '$10M+': 'Mastery'
    }
    return stageMap[stage] || stage
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Business Coaching Platform</h1>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Your business development journey continues here.</p>
        </div>

        {/* Assessment Status Card */}
        {assessment ? (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Latest Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${getScoreBgColor(assessment.total_percentage || 0)}`}>
                <p className="text-sm text-gray-600">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(assessment.total_percentage || 0)}`}>
                  {Math.round(assessment.total_percentage || 0)}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Performance Level</p>
                <p className="text-lg font-semibold">{getPerformanceLevel(assessment.total_percentage || 0)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Business Stage</p>
                <p className="text-lg font-semibold">{getBusinessStage(assessment.revenue_stage || assessment.revenue_range || '')}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-lg font-semibold">
                  {assessment.completed_at 
                    ? new Date(assessment.completed_at).toLocaleDateString()
                    : new Date(assessment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {/* Section Scores */}
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-gray-700">Section Scores:</h4>
              <div className="space-y-2">
                {[
                  { name: 'Business Foundation', score: assessment.foundation_score, icon: '🏢' },
                  { name: 'Strategic Wheel', score: assessment.strategic_wheel_score, icon: '🎯' },
                  { name: 'Profitability Health', score: assessment.profitability_score, icon: '💰' },
                  { name: 'Business Engines', score: assessment.engines_score, icon: '⚙️' },
                  { name: 'Success Disciplines', score: assessment.disciplines_score, icon: '💪' }
                ].map((section) => (
                  <div key={section.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="mr-2 text-lg">{section.icon}</span>
                      {section.name}
                    </span>
                    <span className={`font-semibold ${getScoreColor(section.score || 0)}`}>
                      {Math.round(section.score || 0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Link
                href="/assessment/results"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                View Full Report
              </Link>
              <Link
                href="/assessment"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Retake Assessment
              </Link>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Assessment Found</h3>
            <p className="text-gray-600 mb-6">Start with a comprehensive business diagnostic to identify your strengths and opportunities.</p>
            <Link
              href="/assessment"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Assessment
            </Link>
          </div>
        )}

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Strategic Wheel Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Strategic Wheel</h3>
              <span className="text-3xl">🎯</span>
            </div>
            <p className="text-gray-600 mb-4">Build your 6-component strategic foundation</p>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{assessment ? '100%' : '0%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: assessment ? '100%' : '0%' }}
                />
              </div>
            </div>
            <Link
              href="/strategic-wheel"
              className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {assessment ? 'Review Plan' : 'Start Planning'}
            </Link>
          </div>

          {/* Success Disciplines Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Success Disciplines</h3>
              <span className="text-3xl">💪</span>
            </div>
            <p className="text-gray-600 mb-4">Focus on your top 3 development areas</p>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>0%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: '0%' }}
                />
              </div>
            </div>
            <Link
              href="/success-disciplines"
              className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Select Disciplines
            </Link>
          </div>

          {/* 90-Day Goals Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">90-Day Goals</h3>
              <span className="text-3xl">🚀</span>
            </div>
            <p className="text-gray-600 mb-4">Set and track your quarterly objectives</p>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>Not Started</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: '0%' }}
                />
              </div>
            </div>
            <button
              disabled
              className="block w-full text-center bg-gray-100 text-gray-400 py-2 rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}