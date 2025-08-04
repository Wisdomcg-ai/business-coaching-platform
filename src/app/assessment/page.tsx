'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AssessmentPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [responses, setResponses] = useState({
    // Revenue Stage
    currentRevenue: '',
    
    // 6 Engine Rooms (0-100% each)
    visionLeadership: 50,
    productInnovation: 50,
    leadGeneration: 50,
    salesConversion: 50,
    deliverySuccess: 50,
    operations: 50,
    
    // Strategic Wheel Readiness (1-5 scale)
    visionPurpose: 3,
    strategyMarket: 3,
    peopleCulture: 3,
    systemsExecution: 3,
    moneyMetrics: 3,
    communications: 3,
    
    // Success Disciplines (1-5 scale)
    decisionMaking: 3,
    technologyAI: 3,
    growthMindset: 3,
    leadership: 3,
    personalMastery: 3,
    operationalExcellence: 3,
    resourceOptimization: 3,
    financialAcumen: 3,
    accountability: 3,
    customerExperience: 3,
    resilience: 3,
    timeManagement: 3
  })
  
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setUser(user)
      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleInputChange = (field: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateScores = () => {
    // Engine Rooms Average
    const engineRoomsAvg = Math.round(
      (responses.visionLeadership + responses.productInnovation + 
       responses.leadGeneration + responses.salesConversion + 
       responses.deliverySuccess + responses.operations) / 6
    )

    // Strategic Wheel Average
    const strategicWheelAvg = Math.round(
      (responses.visionPurpose + responses.strategyMarket + 
       responses.peopleCulture + responses.systemsExecution + 
       responses.moneyMetrics + responses.communications) / 6 * 20
    ) // Convert 1-5 to percentage

    // Success Disciplines Average
    const disciplinesAvg = Math.round(
      (responses.decisionMaking + responses.technologyAI + responses.growthMindset +
       responses.leadership + responses.personalMastery + responses.operationalExcellence +
       responses.resourceOptimization + responses.financialAcumen + responses.accountability +
       responses.customerExperience + responses.resilience + responses.timeManagement) / 12 * 20
    ) // Convert 1-5 to percentage

    return {
      engineRooms: engineRoomsAvg,
      strategicWheel: strategicWheelAvg,
      successDisciplines: disciplinesAvg,
      overall: Math.round((engineRoomsAvg + strategicWheelAvg + disciplinesAvg) / 3)
    }
  }

  const handleSubmit = async () => {
    const scores = calculateScores()
    
    try {
      const supabase = createClient()
      
      // Save assessment to database
      const { error } = await supabase
        .from('assessments')
        .insert({
          business_id: null, // We'll add business logic later
          completed_by: user.id,
          responses: responses,
          scores: scores,
          completion_percentage: 100,
          completed_at: new Date().toISOString()
        })

      if (error) throw error

      // Redirect to results
      router.push('/assessment/results')
    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('Error saving assessment. Please try again.')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Diagnostic Assessment</h1>
          <p className="text-gray-600">Step {currentStep} of 4</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Stage</h2>
            <p className="text-gray-600 mb-6">What is your current annual revenue?</p>
            
            <div className="space-y-3">
              {['0-1M', '1M-3M', '3M-5M', '5M-10M', '10M+'].map((stage) => (
                <label key={stage} className="flex items-center">
                  <input
                    type="radio"
                    name="revenue"
                    value={stage}
                    checked={responses.currentRevenue === stage}
                    onChange={(e) => handleInputChange('currentRevenue', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-lg">${stage}</span>
                </label>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!responses.currentRevenue}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Next: Engine Rooms →
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">6 Engine Rooms Assessment</h2>
            <p className="text-gray-600 mb-6">Rate each area from 0-100% based on how well it's working in your business:</p>
            
            <div className="space-y-6">
              {[
                { key: 'visionLeadership', label: 'Vision & Leadership' },
                { key: 'productInnovation', label: 'Product Innovation' },
                { key: 'leadGeneration', label: 'Lead Generation' },
                { key: 'salesConversion', label: 'Sales & Conversion' },
                { key: 'deliverySuccess', label: 'Delivery & Success' },
                { key: 'operations', label: 'Operations (Team, Finance, Systems)' }
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {item.label}: {responses[item.key as keyof typeof responses]}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={responses[item.key as keyof typeof responses]}
                    onChange={(e) => handleInputChange(item.key, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Next: Strategic Wheel →
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Strategic Wheel Readiness</h2>
            <p className="text-gray-600 mb-6">Rate each component from 1-5 (1=Needs Work, 5=Excellent):</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'visionPurpose', label: 'Vision & Purpose' },
                { key: 'strategyMarket', label: 'Strategy & Market' },
                { key: 'peopleCulture', label: 'People & Culture' },
                { key: 'systemsExecution', label: 'Systems & Execution' },
                { key: 'moneyMetrics', label: 'Money & Metrics' },
                { key: 'communications', label: 'Communications & Alignment' }
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {item.label}
                  </label>
                  <select
                    value={responses[item.key as keyof typeof responses]}
                    onChange={(e) => handleInputChange(item.key, parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value={1}>1 - Needs Major Work</option>
                    <option value={2}>2 - Needs Some Work</option>
                    <option value={3}>3 - Average</option>
                    <option value={4}>4 - Good</option>
                    <option value={5}>5 - Excellent</option>
                  </select>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Next: Success Disciplines →
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Success Disciplines Evaluation</h2>
            <p className="text-gray-600 mb-6">Rate your current strength in each discipline (1-5):</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'decisionMaking', label: 'Decision-Making' },
                { key: 'technologyAI', label: 'Technology & AI' },
                { key: 'growthMindset', label: 'Growth Mindset' },
                { key: 'leadership', label: 'Leadership Development' },
                { key: 'personalMastery', label: 'Personal Mastery' },
                { key: 'operationalExcellence', label: 'Operational Excellence' },
                { key: 'resourceOptimization', label: 'Resource Optimization' },
                { key: 'financialAcumen', label: 'Financial Acumen' },
                { key: 'accountability', label: 'Accountability' },
                { key: 'customerExperience', label: 'Customer Experience' },
                { key: 'resilience', label: 'Resilience & Renewal' },
                { key: 'timeManagement', label: 'Time Management' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 border rounded">
                  <label className="text-sm font-medium text-gray-700">
                    {item.label}
                  </label>
                  <select
                    value={responses[item.key as keyof typeof responses]}
                    onChange={(e) => handleInputChange(item.key, parseInt(e.target.value))}
                    className="ml-2 p-1 border border-gray-300 rounded"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Complete Assessment ✓
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}