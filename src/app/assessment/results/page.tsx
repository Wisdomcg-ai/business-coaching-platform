// src/app/assessment/results/page.tsx
// Database-integrated results page with live KPI recommendations

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Target, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { getRecommendedKPIs, mapAssessmentToWeakEngines, getRevenueStageFromAmount, type KPI, type BusinessFunction, type Industry } from '@/lib/kpi-definitions-legacy'

// Types for assessment data
interface AssessmentResults {
  totalScore: number
  totalPossible: number
  percentage: number
  healthStatus: string
  revenueStage: string
  scores: {
    foundation: number
    strategicWheel: number
    profitability: number
    engines: number
    disciplines: number
    attract: number
    convert: number
    deliver: number
    people: number
    systems: number
    finance: number
  }
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  weakEngines: string[]
  industry?: string
  revenue?: number
}

interface RecommendedKPIs {
  universal: KPI[]
  engine: KPI[]
  industry: KPI[]
  total: number
}

export default function AssessmentResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<AssessmentResults | null>(null)
  const [recommendedKPIs, setRecommendedKPIs] = useState<RecommendedKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [kpiLoading, setKpiLoading] = useState(false)

  useEffect(() => {
    loadAssessmentResults()
  }, [])

  const loadAssessmentResults = async () => {
    try {
      // Load assessment results from localStorage
      const storedResults = localStorage.getItem('assessmentResults')
      const storedAnswers = localStorage.getItem('assessmentAnswers')
      
      if (storedResults && storedAnswers) {
        const parsedResults = JSON.parse(storedResults)
        const answers = JSON.parse(storedAnswers)
        
        setResults(parsedResults)
        
        // Generate KPI recommendations from database
        await generateKPIRecommendations(parsedResults, answers)
      } else {
        // No results found, redirect to assessment
        router.push('/assessment')
        return
      }
    } catch (error) {
      console.error('Error loading assessment results:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateKPIRecommendations = async (results: AssessmentResults, answers: any) => {
    setKpiLoading(true)
    try {
      // Map assessment scores to weak business functions
      const weakEngines = mapAssessmentToWeakEngines({
        attract: results.scores.attract,
        convert: results.scores.convert,
        deliver: results.scores.deliver,
        delight: results.scores.deliver, // You might want to separate this
        people: results.scores.people,
        profit: results.scores.finance,
        systems: results.scores.systems
      })

      // Determine industry from answers (you'll need to map your assessment industry question)
      let industry: Industry = 'professional-services' // Default
      if (answers.industry) {
        // Map your assessment industry options to database industries
        const industryMap: Record<string, Industry> = {
          'Construction': 'construction-trades',
          'Healthcare': 'health-wellness',
          'Professional Services': 'professional-services',
          'Retail': 'retail-ecommerce',
          'Logistics': 'operations-logistics'
        }
        industry = industryMap[answers.industry] || 'professional-services'
      }

      // Get revenue stage
      let revenueStage
      if (results.revenue) {
        revenueStage = getRevenueStageFromAmount(results.revenue)
      }

      // Get recommendations from database
      const kpiRecommendations = await getRecommendedKPIs(
        weakEngines,
        industry,
        revenueStage
      )

      setRecommendedKPIs(kpiRecommendations)
    } catch (error) {
      console.error('Error generating KPI recommendations:', error)
      // Set fallback recommendations
      setRecommendedKPIs({
        universal: [],
        engine: [],
        industry: [],
        total: 0
      })
    } finally {
      setKpiLoading(false)
    }
  }

  const getHealthStatusColor = (status: string) => {
    const colors = {
      'THRIVING': 'text-green-600 bg-green-50 border-green-200',
      'STRONG': 'text-blue-600 bg-blue-50 border-blue-200',
      'STABLE': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'BUILDING': 'text-orange-600 bg-orange-50 border-orange-200',
      'STRUGGLING': 'text-red-600 bg-red-50 border-red-200',
      'URGENT': 'text-red-800 bg-red-100 border-red-300'
    }
    return colors[status as keyof typeof colors] || colors.STABLE
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return 'Universal'
      case 2: return 'Engine Focus'
      case 3: return 'Industry'
      default: return 'Standard'
    }
  }

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-blue-100 text-blue-700'
      case 2: return 'bg-purple-100 text-purple-700'
      case 3: return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading your results...
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Assessment Results Found</h2>
          <p className="text-gray-600 mb-4">Please complete the assessment first.</p>
          <button
            onClick={() => router.push('/assessment')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Take Assessment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
                <p className="text-gray-600">Your business health snapshot and personalized KPI recommendations</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/assessment')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Overall Score Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center px-4 py-2 rounded-full border font-semibold text-sm mb-4 ${getHealthStatusColor(results.healthStatus)}`}>
              {results.healthStatus}
            </div>
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {results.percentage}%
            </div>
            <p className="text-gray-600 text-lg">
              Overall Business Health Score
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {results.totalScore} out of {results.totalPossible} points • {results.revenueStage} Stage
            </p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(results.scores).map(([key, score]) => {
              let maxScore, label
              switch (key) {
                case 'foundation':
                  maxScore = 40
                  label = 'Foundation'
                  break
                case 'strategicWheel':
                  maxScore = 60
                  label = 'Strategic Wheel'
                  break
                case 'profitability':
                  maxScore = 30
                  label = 'Profitability'
                  break
                case 'engines':
                  maxScore = 100
                  label = 'Business Engines'
                  break
                case 'disciplines':
                  maxScore = 60
                  label = 'Success Disciplines'
                  break
                default:
                  // Individual engine scores (these are percentages)
                  maxScore = 100
                  label = key.charAt(0).toUpperCase() + key.slice(1)
                  break
              }

              const percentage = key === 'attract' || key === 'convert' || key === 'deliver' || key === 'people' || key === 'systems' || key === 'finance'
                ? score // These are already percentages
                : Math.round((score / maxScore) * 100)

              return (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className={`text-sm font-semibold ${getScoreColor(percentage)}`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        percentage >= 80 ? 'bg-green-500' :
                        percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {key === 'attract' || key === 'convert' || key === 'deliver' || key === 'people' || key === 'systems' || key === 'finance'
                      ? `${score}%` // These are already percentages
                      : `${score}/${maxScore} points`
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Strengths */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Your Strengths</h3>
            </div>
            <ul className="space-y-3">
              {results.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {results.improvements?.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Key Recommendations</h3>
            </div>
            <ul className="space-y-3">
              {results.recommendations?.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Database-Driven KPI Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Personalized KPI Recommendations</h2>
              <p className="text-gray-600">Based on your assessment, here are the metrics that will help you improve fastest</p>
            </div>
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>

          {kpiLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading personalized recommendations...
              </div>
            </div>
          ) : recommendedKPIs && recommendedKPIs.total > 0 ? (
            <>
              {/* Universal KPIs */}
              {recommendedKPIs.universal.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">Universal</span>
                    Essential KPIs Every Business Needs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedKPIs.universal.map((kpi) => (
                      <div key={kpi.id} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getTierColor(kpi.tier)}`}>
                            {getTierLabel(kpi.tier)}
                          </span>
                          <span className="text-xs text-gray-500">{kpi.category}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{kpi.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{kpi.friendlyName}</p>
                        <p className="text-xs text-gray-500">{kpi.whyItMatters}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engine KPIs */}
              {recommendedKPIs.engine.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">Engine Focus</span>
                    KPIs for Your Weak Business Areas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedKPIs.engine.map((kpi) => (
                      <div key={kpi.id} className="p-4 rounded-lg border border-purple-200 bg-purple-50">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getTierColor(kpi.tier)}`}>
                            {kpi.businessFunction}
                          </span>
                          <span className="text-xs text-gray-500">{kpi.category}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{kpi.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{kpi.friendlyName}</p>
                        <p className="text-xs text-gray-500">{kpi.whyItMatters}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry KPIs */}
              {recommendedKPIs.industry.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">Industry</span>
                    KPIs Specific to Your Business Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedKPIs.industry.map((kpi) => (
                      <div key={kpi.id} className="p-4 rounded-lg border border-green-200 bg-green-50">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getTierColor(kpi.tier)}`}>
                            {getTierLabel(kpi.tier)}
                          </span>
                          <span className="text-xs text-gray-500">{kpi.category}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{kpi.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{kpi.friendlyName}</p>
                        <p className="text-xs text-gray-500">{kpi.whyItMatters}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                <p className="text-sm text-gray-600 mb-4">
                  We've recommended {recommendedKPIs.total} KPIs based on your assessment:
                  {recommendedKPIs.universal.length > 0 && ` ${recommendedKPIs.universal.length} universal,`}
                  {recommendedKPIs.engine.length > 0 && ` ${recommendedKPIs.engine.length} for weak business engines,`}
                  {recommendedKPIs.industry.length > 0 && ` ${recommendedKPIs.industry.length} industry-specific`}
                </p>
                <button
                  onClick={() => router.push('/strategic-goals')}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Set Up Your Strategic Goals & KPIs
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No KPI recommendations available</div>
              <button
                onClick={() => generateKPIRecommendations(results, JSON.parse(localStorage.getItem('assessmentAnswers') || '{}'))}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Loading Recommendations
              </button>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Set Your Goals</h3>
              <p className="text-sm opacity-90">Define specific, measurable targets for the next 90 days</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Track KPIs</h3>
              <p className="text-sm opacity-90">Monitor the recommended metrics to measure progress</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Take Action</h3>
              <p className="text-sm opacity-90">Implement changes based on your improvement areas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}