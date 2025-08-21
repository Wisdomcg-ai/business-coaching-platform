'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import { 
  LayoutDashboard, 
  FileText, 
  Target, 
  TrendingUp, 
  Users, 
  Settings,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Building2,
  DollarSign,
  ClipboardCheck,
  Brain,
  Rocket
} from 'lucide-react'

type Business = Database['public']['Tables']['businesses']['Row']
type Assessment = Database['public']['Tables']['assessments']['Row']

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setUser(user)
      
      // Load business data
      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single()
      
      if (businessData) {
        setBusiness(businessData)
        
        // Load latest assessment
        const { data: assessmentData } = await supabase
          .from('assessments')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (assessmentData) {
          setAssessment(assessmentData)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // Calculate days since assessment
  const daysSinceAssessment = assessment 
    ? Math.floor((Date.now() - new Date(assessment.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Determine health score color
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/coach-dashboard"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Coach View →
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {business?.name || 'Welcome to Your Dashboard'}
              </h2>
              <p className="text-blue-100">
                Your business growth journey starts here
              </p>
            </div>
            <Rocket className="w-16 h-16 text-blue-200" />
          </div>
          
          {assessment && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-blue-100">Health Score</div>
                <div className="text-2xl font-bold">{assessment.total_score}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-blue-100">Assessment Age</div>
                <div className="text-2xl font-bold">{daysSinceAssessment} days</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-blue-100">Next Review</div>
                <div className="text-2xl font-bold">{Math.max(0, 90 - (daysSinceAssessment || 0))} days</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Diagnostic Assessment */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClipboardCheck className="w-6 h-6 text-blue-600" />
              </div>
              {assessment && (
                <span className={`text-2xl font-bold ${getHealthColor(assessment.total_score)}`}>
                  {assessment.total_score}%
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Health Assessment</h3>
            <p className="text-sm text-gray-600 mb-4">
              {assessment 
                ? `Last assessed ${daysSinceAssessment} days ago`
                : 'Complete your diagnostic assessment'}
            </p>
            <Link
              href="/assessment"
              className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {assessment ? 'Retake Assessment' : 'Start Assessment'}
            </Link>
          </div>

          {/* Business Profile */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                business?.profile_completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {business?.profile_completed ? 'Complete' : 'Incomplete'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Business Profile</h3>
            
            {/* Key Business Info */}
            {business && (
              <div className="space-y-1 mb-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium text-gray-900">{business.industry || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium text-gray-900">
                    {business.annual_revenue 
                      ? `$${business.annual_revenue.toLocaleString()}` 
                      : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Team Size:</span>
                  <span className="font-medium text-gray-900">{business.employee_count || 0}</span>
                </div>
              </div>
            )}
            
            <Link
              href="/business-profile"
              className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {business?.profile_completed ? 'Update Profile' : 'Complete Profile'}
            </Link>
          </div>

          {/* Revenue Stage Roadmap */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                business?.annual_revenue 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {business?.annual_revenue 
                  ? business.annual_revenue < 250000 ? 'Foundation' :
                    business.annual_revenue < 1000000 ? 'Traction' :
                    business.annual_revenue < 3000000 ? 'Scaling' :
                    business.annual_revenue < 5000000 ? 'Optimization' :
                    business.annual_revenue < 10000000 ? 'Leadership' :
                    'Mastery'
                  : 'Not Set'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Revenue Roadmap</h3>
            <p className="text-sm text-gray-600 mb-4">
              Stage-specific guidance for growth
            </p>
            
            {business?.annual_revenue && (
              <div className="mb-4">
                <div className="text-xs text-gray-600">Progress to next stage</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ 
                      width: `${
                        business.annual_revenue < 250000 ? (business.annual_revenue / 250000) * 100 :
                        business.annual_revenue < 1000000 ? ((business.annual_revenue - 250000) / 750000) * 100 :
                        business.annual_revenue < 3000000 ? ((business.annual_revenue - 1000000) / 2000000) * 100 :
                        business.annual_revenue < 5000000 ? ((business.annual_revenue - 3000000) / 2000000) * 100 :
                        business.annual_revenue < 10000000 ? ((business.annual_revenue - 5000000) / 5000000) * 100 :
                        100
                      }%` 
                    }}
                  />
                </div>
              </div>
            )}
            
            <Link
              href="/revenue-roadmap"
              className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Your Roadmap
            </Link>
          </div>

          {/* Goals & Strategy */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
                Coming Soon
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Goals & Strategy</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set and track your 90-day goals
            </p>
            <button
              disabled
              className="block w-full text-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        {assessment && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Assessment Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Foundation</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${assessment.foundation_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{assessment.foundation_score}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Strategic Wheel</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${assessment.strategic_wheel_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{assessment.strategic_wheel_score}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Profitability</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${assessment.profitability_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{assessment.profitability_score}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Business Engines</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${assessment.engines_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{assessment.engines_score}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Success Disciplines</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${assessment.disciplines_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{assessment.disciplines_score}%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/assessment/results"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                View Detailed Results
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/strategic-wheel"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Strategic Wheel</h3>
                <p className="text-sm text-gray-600">6-component planning</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
          </Link>

          <Link
            href="/success-disciplines"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Target className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Success Disciplines</h3>
                <p className="text-sm text-gray-600">12 areas of excellence</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
          </Link>

          <Link
            href="/resources"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Resources</h3>
                <p className="text-sm text-gray-600">Tools & templates</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}