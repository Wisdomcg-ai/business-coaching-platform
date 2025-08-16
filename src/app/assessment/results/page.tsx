'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AssessmentResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
    try {
      // First try to get results from localStorage (just completed)
      const storedResults = localStorage.getItem('assessmentResults')
      const storedAnswers = localStorage.getItem('assessmentAnswers')
      
      if (storedResults) {
        // Fresh assessment just completed
        const parsedResults = JSON.parse(storedResults)
        const parsedAnswers = storedAnswers ? JSON.parse(storedAnswers) : {}
        
        // Add detailed breakdowns
        parsedResults.engineScores = calculateEngineScores(parsedAnswers)
        parsedResults.disciplineBreakdown = calculateDisciplineBreakdown(parsedAnswers)
        
        setResults(parsedResults)
        await saveToDatabase(parsedResults)
      } else {
        // Load from database
        await loadFromDatabase()
      }
    } catch (error) {
      console.error('Error loading results:', error)
      setSaveStatus('Error loading results')
    } finally {
      setLoading(false)
    }
  }

  const calculateEngineScores = (answers: any) => {
    // Calculate overall scores for each engine
    const scoreMap: { [key: string]: number } = {
      'Under 20 leads': 25,
      '20-50 leads': 50,
      '50-100 leads': 75,
      '100+ leads': 100,
      'No consistent channels': 20,
      '1-2 inconsistent sources': 40,
      '3-4 regular sources': 70,
      '5+ systematic channels': 100,
      'No process at all': 20,
      "Have a process but don't follow it": 40,
      'Have a process and follow it sometimes': 60,
      'Have a process and follow it consistently': 85,
      'Have a documented process and follow it consistently': 100,
      "Under 15% or don't track": 25,
      '15-25%': 50,
      '25-40%': 75,
      'Over 40%': 100,
      'Under 60%': 30,
      '60-75%': 55,
      '75-90%': 80,
      'Over 90%': 100,
      'Reactive hiring when desperate': 25,
      'Basic hiring process': 50,
      'Good hiring with defined criteria': 75,
      'Systematic recruitment of A-players': 100,
      'No formal performance management': 20,
      'Occasional informal feedback': 45,
      'Regular reviews without clear criteria': 65,
      'Systematic reviews against core values and job KPIs': 100,
      "Most processes exist only in people's heads": 20,
      'Some processes documented': 45,
      'Most key processes documented': 70,
      'All processes documented and optimized': 100,
      'Never audit compliance': 20,
      'Only when problems arise': 40,
      'Annual system audits': 65,
      'Quarterly audits with improvements': 100,
      'No budget or forecast': 20,
      'Basic revenue/expense tracking': 45,
      'Annual budget created': 70,
      'Detailed budget with monthly variance analysis': 100,
      'No cash flow forecasting': 20,
      'Check bank balance when needed': 40,
      'Monthly cash flow review': 65,
      '13-week rolling cash flow forecast': 100,
      "Don't measure systematically": 20,
      'Occasional informal feedback': 45,
      'Regular satisfaction surveys': 70,
      'Comprehensive feedback system with action plans': 100
    }

    // Calculate Attract Engine Score
    let attractScore = 0
    let attractCount = 0
    if (answers.monthlyLeads) {
      attractScore += scoreMap[answers.monthlyLeads] || 40
      attractCount++
    }
    if (answers.marketingChannels) {
      attractScore += scoreMap[answers.marketingChannels] || 40
      attractCount++
    }
    if (answers.marketingProcess) {
      attractScore += scoreMap[answers.marketingProcess] || 40
      attractCount++
    }
    // Add yes/no questions
    const attractSystems = answers.attract_systems || {}
    let attractYesCount = 0
    Object.values(attractSystems).forEach((answer: any) => {
      if (answer === 'yes') attractYesCount++
    })
    attractScore += (attractYesCount / 4) * 100
    attractCount++
    
    const finalAttractScore = attractCount > 0 ? Math.round(attractScore / attractCount) : 50

    // Calculate Convert Engine Score
    let convertScore = 0
    let convertCount = 0
    if (answers.conversionRate) {
      convertScore += scoreMap[answers.conversionRate] || 40
      convertCount++
    }
    if (answers.salesProcess) {
      convertScore += scoreMap[answers.salesProcess] || 40
      convertCount++
    }
    // Add yes/no questions
    const salesCapability = answers.sales_capability || {}
    let salesYesCount = 0
    Object.values(salesCapability).forEach((answer: any) => {
      if (answer === 'yes') salesYesCount++
    })
    convertScore += (salesYesCount / 4) * 100
    convertCount++
    
    const transactionValue = answers.transaction_value || {}
    let transactionYesCount = 0
    Object.values(transactionValue).forEach((answer: any) => {
      if (answer === 'yes') transactionYesCount++
    })
    convertScore += (transactionYesCount / 4) * 100
    convertCount++
    
    const finalConvertScore = convertCount > 0 ? Math.round(convertScore / convertCount) : 45

    // Calculate Deliver Engine Score
    let deliverScore = 0
    let deliverCount = 0
    if (answers.customerDelight) {
      deliverScore += scoreMap[answers.customerDelight] || 50
      deliverCount++
    }
    if (answers.deliveryProcess) {
      deliverScore += scoreMap[answers.deliveryProcess] || 50
      deliverCount++
    }
    if (answers.satisfactionTracking) {
      deliverScore += scoreMap[answers.satisfactionTracking] || 45
      deliverCount++
    }
    if (answers.talentStrategy) {
      deliverScore += scoreMap[answers.talentStrategy] || 50
      deliverCount++
    }
    if (answers.processDocumentation) {
      deliverScore += scoreMap[answers.processDocumentation] || 40
      deliverCount++
    }
    
    const finalDeliverScore = deliverCount > 0 ? Math.round(deliverScore / deliverCount) : 55

    // Calculate Finance Engine Score
    let financeScore = 0
    let financeCount = 0
    if (answers.budgetForecast) {
      financeScore += scoreMap[answers.budgetForecast] || 45
      financeCount++
    }
    if (answers.cashFlowForecast) {
      financeScore += scoreMap[answers.cashFlowForecast] || 50
      financeCount++
    }
    // Add yes/no questions
    const workingCapital = answers.working_capital || {}
    let capitalYesCount = 0
    Object.values(workingCapital).forEach((answer: any) => {
      if (answer === 'yes') capitalYesCount++
    })
    financeScore += (capitalYesCount / 4) * 100
    financeCount++
    
    const finalFinanceScore = financeCount > 0 ? Math.round(financeScore / financeCount) : 50

    return {
      attract: finalAttractScore,
      convert: finalConvertScore,
      deliver: finalDeliverScore,
      finance: finalFinanceScore
    }
  }

  const calculateDisciplineBreakdown = (answers: any) => {
    const disciplines = [
      { id: 'discipline_decision', name: 'Decision-Making' },
      { id: 'discipline_technology', name: 'Technology & AI' },
      { id: 'discipline_growth', name: 'Growth Mindset' },
      { id: 'discipline_leadership', name: 'Leadership' },
      { id: 'discipline_personal', name: 'Personal Mastery' },
      { id: 'discipline_operational', name: 'Operational Excellence' },
      { id: 'discipline_resource', name: 'Resource Optimization' },
      { id: 'discipline_financial', name: 'Financial Acumen' },
      { id: 'discipline_accountability', name: 'Accountability' },
      { id: 'discipline_customer', name: 'Customer Experience' },
      { id: 'discipline_resilience', name: 'Resilience & Renewal' },
      { id: 'discipline_time', name: 'Time Management' }
    ]

    return disciplines.map(discipline => {
      const disciplineAnswers = answers?.[discipline.id] || {}
      let yesCount = 0
      
      // Count "yes" answers for this discipline
      Object.values(disciplineAnswers).forEach((answer: any) => {
        if (answer === 'yes') yesCount++
      })
      
      // Calculate percentage (5 questions per discipline)
      const score = (yesCount / 5) * 100
      
      return {
        name: discipline.name,
        score: Math.round(score)
      }
    })
  }

  const saveToDatabase = async (assessmentResults: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSaveStatus('Not logged in')
        return
      }

      const assessmentData = {
        user_id: user.id,
        assessment_data: assessmentResults,
        completion_percentage: 100,
        total_percentage: assessmentResults.percentage || 0,
        health_status: assessmentResults.healthStatus || '',
        revenue_stage: assessmentResults.revenueStage || '',
        foundation_score: assessmentResults.sections?.find((s: any) => s.name === 'Business Foundation')?.percentage || 0,
        strategic_wheel_score: assessmentResults.sections?.find((s: any) => s.name === 'Strategic Wheel')?.percentage || 0,
        profitability_score: assessmentResults.sections?.find((s: any) => s.name === 'Profitability Health')?.percentage || 0,
        engines_score: assessmentResults.sections?.find((s: any) => s.name === 'Business Engines')?.percentage || 0,
        disciplines_score: assessmentResults.sections?.find((s: any) => s.name === 'Success Disciplines')?.percentage || 0,
        biggest_constraint: assessmentResults.insights?.biggestConstraint || '',
        biggest_opportunity: assessmentResults.insights?.biggestOpportunity || '',
        ninety_day_priority: assessmentResults.insights?.ninetyDayPriority || '',
        help_needed: assessmentResults.insights?.helpNeeded || '',
        completed_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('assessments')
        .insert([assessmentData])

      if (error) {
        console.error('Save error:', error)
        setSaveStatus('Error saving')
      } else {
        setSaveStatus('Assessment saved successfully!')
        localStorage.removeItem('assessmentResults')
        localStorage.removeItem('assessmentAnswers')
      }
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const loadFromDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!error && data?.assessment_data) {
        const results = data.assessment_data
        
        // If breakdowns aren't in the saved data, create them
        if (!results.engineScores) {
          results.engineScores = {
            attract: 65,
            convert: 55,
            deliver: 70,
            finance: 50
          }
        }
        if (!results.disciplineBreakdown) {
          results.disciplineBreakdown = calculateDisciplineBreakdown({})
        }
        
        setResults(results)
      }
    } catch (error) {
      console.error('Error loading from database:', error)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-50 border-green-200'
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-gradient-to-r from-green-500 to-green-600'
    if (percentage >= 50) return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    return 'bg-gradient-to-r from-red-500 to-red-600'
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

  const getEngineRating = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Developing'
    return 'Needs Focus'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No assessment results found</p>
          <Link href="/assessment" className="text-blue-600 hover:underline">
            Take Assessment
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Save Status */}
        {saveStatus && (
          <div className={`mb-4 p-4 rounded-lg ${
            saveStatus.includes('success') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : saveStatus.includes('Error')
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
          }`}>
            {saveStatus}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Business Diagnostic Report
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive analysis of your business performance and opportunities
          </p>
        </div>

        {/* Overall Score Card */}
        <div className={`mb-8 p-8 rounded-xl shadow-lg border-2 ${getScoreBgColor(results.percentage || 0)}`}>
          <div className="text-center">
            <div className="mb-4">
              <span className={`text-6xl font-bold ${getScoreColor(results.percentage || 0)}`}>
                {results.percentage || 0}%
              </span>
              <p className="text-2xl font-semibold text-gray-700 mt-2">
                Overall Business Score
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white/70 rounded-lg p-4">
                <p className="text-sm text-gray-600">Performance Level</p>
                <p className={`text-xl font-bold ${getScoreColor(results.percentage || 0)}`}>
                  {getPerformanceLevel(results.percentage || 0)}
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-4">
                <p className="text-sm text-gray-600">Business Stage</p>
                <p className="text-xl font-bold text-gray-800">
                  {getBusinessStage(results.revenueStage || '')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Scores */}
        {results.sections && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Section Performance
            </h2>
            <div className="space-y-4">
              {results.sections.map((section: any, index: number) => {
                const icons = ['🏢', '🎯', '💰', '⚙️', '💪']
                return (
                  <div key={section.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700 flex items-center">
                        <span className="mr-2 text-xl">{icons[index]}</span>
                        {section.name}
                      </span>
                      <span className={`font-bold ${getScoreColor(section.percentage)}`}>
                        {section.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(section.percentage)}`}
                        style={{ width: `${section.percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Business Engines - Simplified Overall Scores */}
        {results.engineScores && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ⚙️ Business Engines Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Attract Engine', icon: '🧲', score: results.engineScores.attract },
                { name: 'Convert Engine', icon: '💼', score: results.engineScores.convert },
                { name: 'Deliver Engine', icon: '📦', score: results.engineScores.deliver },
                { name: 'Finance Engine', icon: '💰', score: results.engineScores.finance }
              ].map((engine) => (
                <div key={engine.name} className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <span className="mr-2 text-2xl">{engine.icon}</span>
                      {engine.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-3xl font-bold ${getScoreColor(engine.score)}`}>
                      {engine.score}%
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      engine.score >= 80 ? 'bg-green-100 text-green-700' :
                      engine.score >= 60 ? 'bg-blue-100 text-blue-700' :
                      engine.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getEngineRating(engine.score)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressBarColor(engine.score)}`}
                      style={{ width: `${engine.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Disciplines Grid */}
        {results.disciplineBreakdown && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              💪 Success Disciplines Analysis
            </h2>
            <p className="text-gray-600 mb-4">Each discipline scored based on 5 key questions</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.disciplineBreakdown.map((discipline: any) => (
                <div key={discipline.name} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">{discipline.name}</p>
                  <div className="flex items-center justify-between">
                    <p className={`text-2xl font-bold ${getScoreColor(discipline.score)}`}>
                      {discipline.score}%
                    </p>
                    <div className="text-xs text-gray-500">
                      ({Math.round(discipline.score / 20)}/5 Yes)
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(discipline.score)}`}
                      style={{ width: `${discipline.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths and Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center">
              <span className="text-2xl mr-2">💪</span> Top Strengths
            </h3>
            <ul className="space-y-2">
              {(results.topStrengths || []).map((strength: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-amber-700 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span> Growth Opportunities
            </h3>
            <ul className="space-y-2">
              {(results.improvementAreas || []).map((area: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-amber-500 mr-2">→</span>
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Strategic Insights */}
        {results.insights && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Strategic Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.insights.biggestConstraint && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Biggest Constraint:</p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {results.insights.biggestConstraint}
                  </p>
                </div>
              )}
              {results.insights.biggestOpportunity && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Biggest Opportunity:</p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {results.insights.biggestOpportunity}
                  </p>
                </div>
              )}
              {results.insights.ninetyDayPriority && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">90-Day Priority:</p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {results.insights.ninetyDayPriority}
                  </p>
                </div>
              )}
              {results.insights.helpNeeded && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Help Needed:</p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {results.insights.helpNeeded}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Your Next Steps</h2>
          <div className="space-y-3 mb-6">
            <p className="flex items-start">
              <span className="mr-2">1.</span>
              Focus on your top growth opportunities to maximize impact
            </p>
            <p className="flex items-start">
              <span className="mr-2">2.</span>
              Build on your strengths to create competitive advantage
            </p>
            <p className="flex items-start">
              <span className="mr-2">3.</span>
              Set clear 90-day goals aligned with your priorities
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/strategic-wheel"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-center"
            >
              Start Strategic Planning
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}