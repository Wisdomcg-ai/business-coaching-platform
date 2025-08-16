'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowLeft, FileText, Calendar, CheckCircle, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react'

interface Assessment {
  id: string
  created_at: string
  completion_percentage: number
  total_score: number
  health_status: string
  revenue_stage: string
  section1_score: number
  section2_score: number
  section3_score: number
  section4_score: number
  section5_score: number
}

export default function AssessmentHistory() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get user's business
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user.id)
        .single()

      if (!profile?.business_id) {
        console.log('No business found for user')
        setLoading(false)
        return
      }

      // Get all assessments for this business
      const { data: assessmentData, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading assessments:', error)
      } else {
        console.log('Found assessments:', assessmentData)
        setAssessments(assessmentData || [])
        if (assessmentData && assessmentData.length > 0) {
          setSelectedAssessment(assessmentData[0])
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'THRIVING': return 'text-green-600 bg-green-50'
      case 'STRONG': return 'text-green-500 bg-green-50'
      case 'STABLE': return 'text-yellow-600 bg-yellow-50'
      case 'BUILDING': return 'text-orange-600 bg-orange-50'
      case 'STRUGGLING': return 'text-red-500 bg-red-50'
      case 'URGENT': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Assessment History</h1>
            <button
              onClick={() => router.push('/assessment')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Assessment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {assessments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Assessments Found</h2>
            <p className="text-gray-600 mb-6">You haven't completed any assessments yet.</p>
            <button
              onClick={() => router.push('/assessment')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
            >
              Start Your First Assessment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assessment List */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Assessments</h2>
              <div className="space-y-3">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    onClick={() => setSelectedAssessment(assessment)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedAssessment?.id === assessment.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {formatDate(assessment.created_at)}
                        </span>
                      </div>
                      {assessment.completion_percentage === 100 && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.health_status)}`}>
                        {assessment.health_status || 'Pending'}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        {assessment.total_score || 0} pts
                      </span>
                    </div>
                    
                    {assessment.completion_percentage < 100 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-gray-600">{assessment.completion_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${assessment.completion_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Details */}
            {selectedAssessment && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Details</h2>
                    <p className="text-gray-600">
                      Completed on {formatDate(selectedAssessment.created_at)}
                    </p>
                  </div>

                  {/* Overall Score */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Overall Health Score</h3>
                        <p className="text-blue-100">Business Health Status</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold">{selectedAssessment.total_score || 0}</div>
                        <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium bg-white ${
                          selectedAssessment.health_status === 'THRIVING' ? 'text-green-600' :
                          selectedAssessment.health_status === 'STRONG' ? 'text-green-500' :
                          selectedAssessment.health_status === 'STABLE' ? 'text-yellow-600' :
                          selectedAssessment.health_status === 'BUILDING' ? 'text-orange-600' :
                          selectedAssessment.health_status === 'STRUGGLING' ? 'text-red-500' :
                          'text-red-600'
                        }`}>
                          {selectedAssessment.health_status || 'Not Calculated'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Scores */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Section Breakdown</h3>
                    
                    <div className="space-y-3">
                      {[
                        { name: 'Business Foundation', score: selectedAssessment.section1_score, max: 40 },
                        { name: 'Strategic Wheel', score: selectedAssessment.section2_score, max: 60 },
                        { name: 'Profitability Health', score: selectedAssessment.section3_score, max: 30 },
                        { name: 'Business Engines', score: selectedAssessment.section4_score, max: 100 },
                        { name: 'Success Disciplines', score: selectedAssessment.section5_score, max: 60 }
                      ].map((section) => (
                        <div key={section.name} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{section.name}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {section.score || 0}/{section.max} ({Math.round(((section.score || 0) / section.max) * 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                ((section.score || 0) / section.max) >= 0.8 ? 'bg-green-500' :
                                ((section.score || 0) / section.max) >= 0.6 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${((section.score || 0) / section.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => router.push('/assessment/results')}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                    >
                      View Full Report
                    </button>
                    <button
                      onClick={() => router.push('/success-disciplines')}
                      className="flex-1 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Select Disciplines
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}