'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Target, TrendingUp, CheckCircle, AlertCircle, Sparkles, Brain, Users, Zap, DollarSign, Shield, Clock, BarChart3, Star, FileText } from 'lucide-react'

// Define the 12 Success Disciplines with their details
const disciplines = [
  {
    id: 'decision_making',
    name: 'Decision-Making Frameworks',
    icon: Brain,
    color: 'from-purple-500 to-purple-600',
    description: 'Master the art of making quick, effective decisions with clear frameworks and criteria.',
    benefits: [
      'Eliminate decision paralysis',
      'Make confident choices quickly',
      'Reduce overthinking and procrastination'
    ],
    assessmentKey: 'discipline_1'
  },
  {
    id: 'technology_ai',
    name: 'Technology & AI Integration',
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    description: 'Leverage cutting-edge technology and AI to automate, optimize, and scale your business.',
    benefits: [
      'Automate repetitive tasks',
      'Gain data-driven insights',
      'Stay ahead of competitors'
    ],
    assessmentKey: 'discipline_2'
  },
  {
    id: 'growth_mindset',
    name: 'Growth Mindset & Learning',
    icon: TrendingUp,
    color: 'from-green-500 to-green-600',
    description: 'Cultivate continuous learning and improvement to adapt and thrive in changing markets.',
    benefits: [
      'Embrace challenges as opportunities',
      'Learn from failures faster',
      'Build a learning culture'
    ],
    assessmentKey: 'discipline_3'
  },
  {
    id: 'leadership',
    name: 'Leadership Development',
    icon: Users,
    color: 'from-indigo-500 to-indigo-600',
    description: 'Develop the leadership skills to inspire, guide, and empower your team to excellence.',
    benefits: [
      'Inspire and motivate others',
      'Build high-performing teams',
      'Create future leaders'
    ],
    assessmentKey: 'discipline_4'
  },
  {
    id: 'personal_mastery',
    name: 'Personal Mastery',
    icon: Star,
    color: 'from-yellow-500 to-yellow-600',
    description: 'Master your personal habits, energy, and focus to perform at your peak consistently.',
    benefits: [
      'Maintain high energy levels',
      'Achieve deep focus states',
      'Build powerful daily rituals'
    ],
    assessmentKey: 'discipline_5'
  },
  {
    id: 'operational_excellence',
    name: 'Operational Excellence',
    icon: BarChart3,
    color: 'from-red-500 to-red-600',
    description: 'Create efficient, scalable systems that deliver consistent quality and results.',
    benefits: [
      'Reduce operational costs',
      'Improve quality consistency',
      'Scale without chaos'
    ],
    assessmentKey: 'discipline_6'
  },
  {
    id: 'resource_optimization',
    name: 'Resource Optimization',
    icon: Target,
    color: 'from-orange-500 to-orange-600',
    description: 'Maximize the return on every resource - time, money, people, and assets.',
    benefits: [
      'Increase ROI on all investments',
      'Eliminate waste and inefficiency',
      'Do more with less'
    ],
    assessmentKey: 'discipline_7'
  },
  {
    id: 'financial_acumen',
    name: 'Financial Acumen',
    icon: DollarSign,
    color: 'from-emerald-500 to-emerald-600',
    description: 'Master financial management to drive profitability and sustainable growth.',
    benefits: [
      'Improve profit margins',
      'Make data-driven financial decisions',
      'Build financial resilience'
    ],
    assessmentKey: 'discipline_8'
  },
  {
    id: 'accountability',
    name: 'Accountability & Performance',
    icon: CheckCircle,
    color: 'from-teal-500 to-teal-600',
    description: 'Create a culture of ownership, accountability, and high performance.',
    benefits: [
      'Increase team productivity',
      'Build trust and reliability',
      'Drive consistent results'
    ],
    assessmentKey: 'discipline_9'
  },
  {
    id: 'customer_experience',
    name: 'Customer Experience',
    icon: Sparkles,
    color: 'from-pink-500 to-pink-600',
    description: 'Deliver exceptional experiences that turn customers into raving fans and advocates.',
    benefits: [
      'Increase customer lifetime value',
      'Generate more referrals',
      'Build competitive advantage'
    ],
    assessmentKey: 'discipline_10'
  },
  {
    id: 'resilience',
    name: 'Resilience & Renewal',
    icon: Shield,
    color: 'from-cyan-500 to-cyan-600',
    description: 'Build the resilience to overcome challenges and maintain sustainable success.',
    benefits: [
      'Bounce back from setbacks',
      'Prevent burnout',
      'Maintain work-life balance'
    ],
    assessmentKey: 'discipline_11'
  },
  {
    id: 'time_management',
    name: 'Time Management & Effectiveness',
    icon: Clock,
    color: 'from-violet-500 to-violet-600',
    description: 'Master your time to focus on high-impact activities that drive real results.',
    benefits: [
      'Accomplish more in less time',
      'Focus on what matters most',
      'Eliminate time-wasters'
    ],
    assessmentKey: 'discipline_12'
  }
]

export default function SuccessDisciplines() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [existingSelection, setExistingSelection] = useState(false)
  const [hasAssessment, setHasAssessment] = useState(false)
  const [assessmentDate, setAssessmentDate] = useState<string>('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadDisciplineData()
  }, [])

  const loadDisciplineData = async () => {
    try {
      // Get current user
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
        alert('No business found. Please complete setup first.')
        router.push('/dashboard')
        return
      }

      setBusinessId(profile.business_id)

      // Get latest assessment to calculate scores
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (assessment && !assessmentError) {
        setHasAssessment(true)
        setAssessmentDate(new Date(assessment.created_at).toLocaleDateString())
        
        // Calculate scores from assessment data
        const disciplineScores: Record<string, number> = {}
        
        // Extract discipline scores from section5_disciplines
        const section5Data = assessment.section5_disciplines || {}
        
        // Calculate score for each discipline based on YES answers
        disciplines.forEach((discipline, index) => {
          let yesCount = 0
          const disciplineNum = index + 1
          
          // Each discipline has 5 questions in the assessment
          for (let q = 1; q <= 5; q++) {
            const questionKey = `discipline_${disciplineNum}_q${q}`
            // Check various ways the data might be stored
            if (section5Data[questionKey] === true || 
                section5Data[questionKey] === 'yes' || 
                section5Data[questionKey] === 'YES') {
              yesCount++
            }
          }
          
          // Calculate percentage (5 questions, each worth 20%)
          const score = yesCount * 20
          disciplineScores[discipline.id] = score
        })
        
        console.log('Calculated discipline scores:', disciplineScores)
        setScores(disciplineScores)
        
      } else {
        // No assessment found - generate demo scores
        console.log('No assessment found, using demo scores')
        const demoScores: Record<string, number> = {}
        disciplines.forEach(discipline => {
          // Generate varied demo scores to make it interesting
          const baseScore = Math.floor(Math.random() * 3) * 20 // 0, 20, 40
          const bonus = Math.floor(Math.random() * 3) * 20 // 0, 20, 40
          demoScores[discipline.id] = baseScore + bonus + 20 // Range: 20-100
        })
        setScores(demoScores)
      }

      // Check if there's an existing selection
      const { data: existing } = await supabase
        .from('success_disciplines')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existing) {
        setExistingSelection(true)
        const selected = [
          existing.discipline_1,
          existing.discipline_2,
          existing.discipline_3
        ].filter(Boolean)
        setSelectedDisciplines(selected)
      }

    } catch (error) {
      console.error('Error loading discipline data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDiscipline = (disciplineId: string) => {
    setSelectedDisciplines(prev => {
      if (prev.includes(disciplineId)) {
        return prev.filter(id => id !== disciplineId)
      }
      if (prev.length >= 3) {
        // Replace the oldest selection
        return [...prev.slice(1), disciplineId]
      }
      return [...prev, disciplineId]
    })
  }

  const handleSave = async () => {
    if (selectedDisciplines.length !== 3) {
      alert('Please select exactly 3 disciplines to focus on.')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !businessId) {
        alert('Session expired. Please log in again.')
        router.push('/auth/login')
        return
      }

      const disciplineData = {
        business_id: businessId,
        user_id: user.id,
        discipline_1: selectedDisciplines[0],
        discipline_2: selectedDisciplines[1],
        discipline_3: selectedDisciplines[2],
        discipline_1_score: scores[selectedDisciplines[0]] || 0,
        discipline_2_score: scores[selectedDisciplines[1]] || 0,
        discipline_3_score: scores[selectedDisciplines[2]] || 0,
        selection_reason: 'Selected after diagnostic assessment',
        target_completion_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }

      const { data, error } = await supabase
        .from('success_disciplines')
        .insert([disciplineData])
        .select()

      if (error) {
        console.error('Database error:', error)
        alert(`Failed to save: ${error.message}`)
        return
      }

      // Success! Navigate to dashboard
      alert('Success! Your focus disciplines have been saved.')
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Error saving disciplines:', error)
      alert('Failed to save your selection. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Sort disciplines by score (lowest first) to help identify improvement areas
  const sortedDisciplines = [...disciplines].sort((a, b) => {
    const scoreA = scores[a.id] || 0
    const scoreB = scores[b.id] || 0
    return scoreA - scoreB
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your discipline scores...</p>
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
            <h1 className="text-xl font-semibold text-gray-900">Success Disciplines</h1>
            <button
              onClick={() => router.push('/assessment/history')}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <FileText className="h-5 w-5 mr-2" />
              View Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Target className="h-6 w-6 text-blue-600 mt-1" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Focus Areas</h2>
              <p className="text-gray-600 mb-4">
                Based on your assessment results, select the 3 Success Disciplines you want to focus on for the next 90 days. 
                We recommend choosing disciplines with lower scores for maximum impact.
              </p>
              
              {hasAssessment ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-green-800">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Scores based on your assessment from {assessmentDate}
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-yellow-800">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    No assessment found. Showing demo scores. 
                    <button 
                      onClick={() => router.push('/assessment')}
                      className="underline ml-1 font-medium"
                    >
                      Complete assessment for accurate results
                    </button>
                  </p>
                </div>
              )}
              
              {existingSelection && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    You have previously selected disciplines. You can update your selection below.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selection Counter */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Selected Disciplines</h3>
              <p className="text-blue-100">Choose exactly 3 disciplines to focus on</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{selectedDisciplines.length}/3</div>
              <div className="text-sm text-blue-100">Selected</div>
            </div>
          </div>
        </div>

        {/* Improvement Recommendations */}
        {hasAssessment && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-amber-900 mb-2">
              💡 Recommended Focus Areas (Lowest Scores)
            </h3>
            <div className="flex flex-wrap gap-2">
              {sortedDisciplines.slice(0, 3).map(discipline => (
                <span 
                  key={discipline.id}
                  className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                >
                  {discipline.name} ({scores[discipline.id]}%)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Disciplines Grid - Sorted by score (lowest first) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sortedDisciplines.map((discipline) => {
            const Icon = discipline.icon
            const isSelected = selectedDisciplines.includes(discipline.id)
            const score = scores[discipline.id] || 0
            const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
            const isRecommended = sortedDisciplines.slice(0, 3).includes(discipline)
            
            return (
              <div
                key={discipline.id}
                onClick={() => toggleDiscipline(discipline.id)}
                className={`
                  relative rounded-xl p-6 cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 shadow-lg transform scale-105' 
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {/* Recommended Badge */}
                {isRecommended && !isSelected && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  </div>
                )}
                
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-blue-600 text-white rounded-full p-1">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                )}

                {/* Discipline Icon and Title */}
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${discipline.color} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {discipline.name}
                </h3>

                {/* Current Score */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Your Score</span>
                    <span className={`font-semibold ${scoreColor}`}>{score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3">
                  {discipline.description}
                </p>

                {/* Benefits */}
                <div className="space-y-1">
                  {discipline.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span className="text-xs text-gray-500">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Save for Later
          </button>
          
          <button
            onClick={handleSave}
            disabled={selectedDisciplines.length !== 3 || saving}
            className={`
              px-8 py-3 rounded-lg font-semibold transition-all duration-200
              ${selectedDisciplines.length === 3
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {saving ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </span>
            ) : (
              <span>
                {selectedDisciplines.length === 3 
                  ? 'Save and Continue →' 
                  : `Select ${3 - selectedDisciplines.length} More Discipline${3 - selectedDisciplines.length !== 1 ? 's' : ''}`
                }
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}