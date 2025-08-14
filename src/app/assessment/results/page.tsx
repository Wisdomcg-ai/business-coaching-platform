'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function ResultsPage() {
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  
  const assessmentId = searchParams.get('id')

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId) {
        router.push('/dashboard')
        return
      }

      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

      if (error) {
        console.error('Error fetching assessment:', error)
        router.push('/dashboard')
      } else {
        setAssessment(data)
      }
      setLoading(false)
    }

    fetchAssessment()
  }, [assessmentId, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading results...</div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Assessment not found</div>
      </div>
    )
  }

  // Calculate scores based on the actual assessment data
  const calculateScores = () => {
    const data = assessment.assessment_data || {}
    
    // Section 1: Business Foundation (max 40 points)
    const foundationQuestions = {
      'revenue_stage': 10,
      'profit_margin': 10,
      'owner_salary': 5,
      'team_size': 0, // Context only
      'business_dependency': 5,
      'revenue_predictability': 10
    }
    
    // Section 2: Strategic Wheel (max 60 points)
    const wheelQuestions = {
      'vision_clarity': 5,
      'team_alignment': 5,
      'target_market': 5,
      'competitive_advantage': 5,
      'usp_usage': 5,
      'team_culture': 5,
      'core_values': 5,
      'business_execution': 5,
      'meeting_rhythms': 5,
      'performance_tracking': 5,
      'one_number': 5,
      'team_alignment_priorities': 5,
      'team_communications': 5
    }
    
    // Section 3: Profitability Health (max 30 points)
    const profitabilityQuestions = {
      'profit_blockers': 0, // Diagnostic only
      'last_price_increase': 5,
      'pricing_confidence': 5,
      'expense_review': 5,
      'subscription_audit': 5,
      'supplier_negotiation': 10
    }
    
    // Use the total_score from database
    const totalScore = assessment.total_score || 0
    
    // Calculate max possible score based on questions present
    const maxPossibleScore = 130 // 40 + 60 + 30 for sections 1-3
    
    // Ensure percentage doesn't exceed 100%
    const percentage = Math.min(100, Math.round((totalScore / maxPossibleScore) * 100))
    
    // Calculate section scores (simplified for now)
    const foundationScore = Math.round((totalScore * 0.3 / 40) * 100)
    const wheelScore = Math.round((totalScore * 0.5 / 60) * 100)
    const profitabilityScore = Math.round((totalScore * 0.2 / 30) * 100)
    
    return {
      overall: percentage,
      foundation: Math.min(100, foundationScore),
      wheel: Math.min(100, wheelScore),
      profitability: Math.min(100, profitabilityScore),
      disciplines: 0 // Not implemented yet
    }
  }

  const scores = calculateScores()
  
  // Determine health status based on score
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { text: 'THRIVING', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 80) return { text: 'STRONG', color: 'text-green-500', bg: 'bg-green-50' }
    if (score >= 70) return { text: 'STABLE', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (score >= 60) return { text: 'BUILDING', color: 'text-orange-600', bg: 'bg-orange-100' }
    if (score >= 50) return { text: 'STRUGGLING', color: 'text-red-500', bg: 'bg-red-50' }
    return { text: 'URGENT', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const healthStatus = getHealthStatus(scores.overall)
  const completedDate = new Date(assessment.completed_at || assessment.created_at).toLocaleDateString()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Results</h1>
          <p className="text-gray-600 mb-8">Completed on {completedDate}</p>

          {/* Overall Score */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Overall Business Health Score
            </h2>
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {scores.overall}%
              </div>
              <div className={`inline-block px-4 py-2 rounded-full ${healthStatus.bg}`}>
                <span className={`font-semibold ${healthStatus.color}`}>
                  {healthStatus.text}
                </span>
              </div>
              <p className="text-gray-600 mt-4">
                {scores.overall >= 70 
                  ? "Good foundation - Ready to scale with focus."
                  : scores.overall >= 50
                  ? "Solid progress - Key areas need attention."
                  : "Needs Attention - Focus on key improvement areas."}
              </p>
            </div>
          </div>

          {/* Component Scores */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Business Foundation</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {scores.foundation}%
              </div>
              <p className="text-sm text-gray-600">
                Revenue, profit, and operational basics
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Strategic Wheel</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {scores.wheel}%
              </div>
              <p className="text-sm text-gray-600">
                Strategic planning and alignment
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Success Disciplines</h3>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {scores.disciplines}%
              </div>
              <p className="text-sm text-gray-600">
                Personal and leadership development
              </p>
            </div>
          </div>

          {/* Revenue Stage */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">Your Revenue Stage</h3>
            <div className="text-xl font-medium text-blue-600 capitalize">
              {assessment.revenue_stage?.replace('_', ' ') || 'Foundation'} Stage
            </div>
            <p className="text-sm text-gray-600 mt-2">
              This determines your priority focus areas and growth strategies.
            </p>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Strategic Wheel Planning</h4>
                  <p className="text-gray-600">Based on your assessment, let's build your strategic foundation.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Success Disciplines Focus</h4>
                  <p className="text-gray-600">Identify your top 3 disciplines for 90-day improvement.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Achievement Engine</h4>
                  <p className="text-gray-600">Implement daily disciplines and accountability systems.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="flex-1 text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/assessment"
              className="flex-1 text-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Retake Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}