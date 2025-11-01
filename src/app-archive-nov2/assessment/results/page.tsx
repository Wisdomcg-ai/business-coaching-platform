'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  TrendingUp, 
  CheckCircle, 
  Target,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AssessmentData {
  id: string
  revenue_stage: string
  total_score: number
  percentage: number
  health_status: string
  foundation_score: number
  strategic_wheel_score: number
  profitability_score: number
  engines_score: number
  disciplines_score: number
  foundation_max: number
  strategic_wheel_max: number
  profitability_max: number
  engines_max: number
  disciplines_max: number
  total_max: number
  answers: any
  completed_at: string
}

interface ScoreCategory {
  name: string
  score: number
  max: number
  percentage: number
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical'
  color: string
  bgColor: string
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('id')
  
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAssessment() {
      if (!assessmentId) {
        router.push('/assessment')
        return
      }

      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          setError('Please log in to view results')
          setLoading(false)
          return
        }

        // Load assessment from database
        const { data: assessmentData, error: dbError } = await supabase
          .from('assessments')
          .select('*')
          .eq('id', assessmentId)
          .eq('user_id', user.id)
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          setError('Assessment not found')
          setLoading(false)
          return
        }

        if (!assessmentData) {
          setError('Assessment not found')
          setLoading(false)
          return
        }

        console.log('✅ Loaded assessment from database:', assessmentData.id)
        setAssessment(assessmentData)
        
        // Update metrics bar with assessment score
        localStorage.setItem('assessmentResults', JSON.stringify({
          overallScore: assessmentData.percentage,
          completedAt: assessmentData.completed_at
        }))
        
        setLoading(false)
        
      } catch (error) {
        console.error('Error loading assessment:', error)
        setError('Failed to load assessment')
        setLoading(false)
      }
    }

    loadAssessment()
  }, [assessmentId, router])

  const getScoreStatus = (percentage: number) => {
    if (percentage >= 80) return { status: 'excellent' as const, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Excellent' }
    if (percentage >= 60) return { status: 'good' as const, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Good' }
    if (percentage >= 40) return { status: 'needs-improvement' as const, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Needs Improvement' }
    return { status: 'critical' as const, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Critical' }
  }

  const getSectionCategories = (): ScoreCategory[] => {
    if (!assessment) return []

    const sections = [
      {
        name: 'Business Foundation',
        score: assessment.foundation_score,
        max: assessment.foundation_max
      },
      {
        name: 'Strategic Wheel',
        score: assessment.strategic_wheel_score,
        max: assessment.strategic_wheel_max
      },
      {
        name: 'Profitability Health',
        score: assessment.profitability_score,
        max: assessment.profitability_max
      },
      {
        name: 'Business Engines',
        score: assessment.engines_score,
        max: assessment.engines_max
      },
      {
        name: 'Success Disciplines',
        score: assessment.disciplines_score,
        max: assessment.disciplines_max
      }
    ]

    return sections.map(section => {
      const percentage = section.max > 0 ? (section.score / section.max) * 100 : 0
      const statusInfo = getScoreStatus(percentage)
      
      return {
        name: section.name,
        score: section.score,
        max: section.max,
        percentage,
        ...statusInfo
      }
    })
  }

  const getRecommendations = () => {
    if (!assessment) return []

    const categories = getSectionCategories()
    const weakAreas = categories.filter(c => c.percentage < 60).sort((a, b) => a.percentage - b.percentage)

    return weakAreas.slice(0, 3).map(area => ({
      area: area.name,
      priority: area.percentage < 40 ? 'High' : 'Medium',
      action: getActionForArea(area.name),
      impact: 'Addressing this will improve overall business performance by 15-25%'
    }))
  }

  const getActionForArea = (areaName: string) => {
    const actions: Record<string, string> = {
      'Business Foundation': 'Focus on strengthening revenue predictability and reducing owner dependency',
      'Strategic Wheel': 'Develop clear vision and improve strategic planning processes',
      'Profitability Health': 'Review pricing strategy and optimize expense management',
      'Business Engines': 'Systematize lead generation and improve conversion processes',
      'Success Disciplines': 'Implement accountability systems and develop leadership capabilities'
    }
    return actions[areaName] || 'Schedule strategy session to develop improvement plan'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {error || 'Assessment Not Found'}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Unable to load your assessment results. Please try taking the assessment again.
          </p>
          <button
            onClick={() => router.push('/assessment')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Take New Assessment
          </button>
        </div>
      </div>
    )
  }

  const categories = getSectionCategories()
  const recommendations = getRecommendations()
  const scoreInfo = getScoreStatus(assessment.percentage)

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Your Business Assessment Results
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Based on your responses, here's a comprehensive analysis of your business performance.
        </p>
      </div>

      {/* Overall Score Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
            <div className="text-white">
              <div className="text-5xl font-bold">{assessment.percentage}</div>
              <div className="text-sm opacity-90">/ 100</div>
            </div>
          </div>
          
          <div className={`inline-block px-6 py-3 rounded-full ${scoreInfo.bgColor} ${scoreInfo.color} font-semibold text-lg mb-4`}>
            {scoreInfo.label} Performance
          </div>
          
          <p className="text-gray-600 max-w-xl mx-auto">
            {assessment.percentage >= 80 && "Outstanding! Your business shows strong performance across most areas."}
            {assessment.percentage >= 60 && assessment.percentage < 80 && "Good foundation with clear opportunities for improvement."}
            {assessment.percentage >= 40 && assessment.percentage < 60 && "Solid start with several areas requiring focused attention."}
            {assessment.percentage < 40 && "Significant opportunity for growth. Let's build your roadmap to success."}
          </p>
        </div>
      </div>

      {/* Section Performance */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="text-blue-600" />
          Performance By Area
        </h2>
        
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    category.percentage >= 80 ? 'bg-green-500' :
                    category.percentage >= 60 ? 'bg-blue-500' :
                    category.percentage >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${category.color}`}>
                    {category.percentage.toFixed(0)}%
                  </span>
                  <span className="text-sm text-gray-500">
                    {category.score.toFixed(1)}/{category.max}
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    category.percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    category.percentage >= 60 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    category.percentage >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-purple-600" />
            Top Priority Actions
          </h2>
          
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-6 py-4 bg-purple-50 rounded-r-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{index + 1}. {rec.area}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    rec.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-gray-700 mb-2 font-medium">{rec.action}</p>
                <p className="text-sm text-gray-600 italic">{rec.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 text-white mb-6">
        <h2 className="text-2xl font-bold mb-3">What's Next?</h2>
        <p className="text-blue-100 mb-6">
          Your assessment is complete. Now it's time to turn insights into action.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/goals')}
            className="bg-white text-blue-600 px-6 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            Set Your Goals <ArrowRight className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => window.print()}
            className="bg-white/10 backdrop-blur text-white px-6 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border-2 border-white/30"
          >
            <Download className="h-5 w-5" /> Download Report
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white/10 backdrop-blur text-white px-6 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border-2 border-white/30"
          >
            View Dashboard <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>Assessment completed on {new Date(assessment.completed_at).toLocaleDateString()}</p>
        <p className="mt-2">
          Want to retake the assessment? 
          <button 
            onClick={() => router.push('/assessment')}
            className="text-blue-600 hover:underline ml-1 font-medium"
          >
            Start New Assessment
          </button>
        </p>
      </div>
    </>
  )
}

export default function AssessmentResults() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}