'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { assessmentSections, calculateTotalScore, getHealthStatus } from '@/lib/assessment-questions'

export default function AssessmentPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [businessId, setBusinessId] = useState<string>('')
  const [assessmentId, setAssessmentId] = useState<string>('')

  // Flatten all questions into a single array
  const allQuestions = assessmentSections.flatMap(section => 
    section.questions.map(q => ({ ...q, sectionTitle: section.title, sectionId: section.id }))
  )
  const currentQuestion = allQuestions[currentQuestionIndex]
  const totalQuestions = allQuestions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  useEffect(() => {
    checkUserAndLoadProgress()
  }, [])

  async function checkUserAndLoadProgress() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_id')
      .eq('id', user.id)
      .single()
    
    if (profile?.business_id) {
      setBusinessId(profile.business_id)
      
      // Check for existing incomplete assessment
      const { data: existingAssessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('business_id', profile.business_id)
        .eq('completion_percentage', 0)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (existingAssessment) {
        setAssessmentId(existingAssessment.id)
        if (existingAssessment.responses) {
          setResponses(existingAssessment.responses)
          // Find where they left off
          const answeredCount = Object.keys(existingAssessment.responses).length
          if (answeredCount > 0 && answeredCount < totalQuestions) {
            setCurrentQuestionIndex(answeredCount)
          }
        }
      }
    }
  }

  const handleResponse = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const saveProgress = async () => {
    if (!user || !businessId) return
    
    setIsSaving(true)
    try {
      if (assessmentId) {
        // Update existing assessment
        await supabase
          .from('assessments')
          .update({
            responses: responses,
            updated_at: new Date().toISOString()
          })
          .eq('id', assessmentId)
      } else {
        // Create new assessment
        const { data } = await supabase
          .from('assessments')
          .insert({
            business_id: businessId,
            completed_by: user.id,
            revenue_stage: responses.q1 || 'Unknown',
            completion_percentage: 0,
            responses: responses
          })
          .select()
          .single()
        
        if (data) {
          setAssessmentId(data.id)
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const nextQuestion = async () => {
    // Save progress every 5 questions
    if ((currentQuestionIndex + 1) % 5 === 0) {
      await saveProgress()
    }
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    if (!user || !businessId) {
      alert('Please login to save your assessment')
      return
    }

    setIsSubmitting(true)
    try {
      const totalScore = calculateTotalScore(responses)
      const healthStatus = getHealthStatus(totalScore)

      const assessmentData = {
        business_id: businessId,
        completed_by: user.id,
        revenue_stage: responses.q1 || 'Unknown',
        completion_percentage: 100,
        total_score: totalScore,
        health_status: healthStatus,
        responses: responses,
        insights: {
          biggest_constraint: responses.q15 || '',
          biggest_opportunity: responses.q16 || '',
          ninety_day_priority: responses.q17 || ''
        },
        completed_at: new Date().toISOString()
      }

      if (assessmentId) {
        // Update existing
        await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', assessmentId)
      } else {
        // Create new
        await supabase
          .from('assessments')
          .insert(assessmentData)
      }

      router.push('/dashboard')
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveAndExit = async () => {
    await saveProgress()
    router.push('/dashboard')
  }

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const hasAnswer = responses[currentQuestion.id] !== undefined && responses[currentQuestion.id] !== ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Business Diagnostic</h1>
            <button
              onClick={handleSaveAndExit}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium flex items-center gap-2"
            >
              💾 Save & Exit
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Section Title */}
          <div className="text-sm font-medium text-blue-600 mb-2">
            {currentQuestion.sectionTitle}
          </div>
          
          {/* Question */}
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {currentQuestion.text}
          </h2>

          {/* Answer Options for Single Choice */}
          {currentQuestion.type === 'single-choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option}
                  className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    responses[currentQuestion.id] === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option}
                    checked={responses[currentQuestion.id] === option}
                    onChange={(e) => handleResponse(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {/* Text Input for Text Questions */}
          {currentQuestion.type === 'text' && (
            <div>
              <textarea
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                rows={6}
                placeholder="Please share your thoughts..."
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => handleResponse(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-2">
                This helps us personalize your coaching experience
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Previous
            </button>
            
            {!isLastQuestion ? (
              <button
                onClick={nextQuestion}
                disabled={!hasAnswer}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  !hasAnswer
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!hasAnswer || isSubmitting}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  !hasAnswer || isSubmitting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Completing...' : 'Complete Assessment'}
              </button>
            )}
          </div>

          {/* Auto-save indicator */}
          {isSaving && (
            <div className="text-center mt-4 text-sm text-gray-500">
              Saving progress...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}