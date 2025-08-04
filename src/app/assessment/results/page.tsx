'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResultsPage() {
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadResults = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Get the most recent assessment
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('completed_by', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error) throw error

        setAssessment(data)
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading your results...</div>
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No assessment found</h2>
          <button
            onClick={() => router.push('/assessment')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Take Assessment
          </button>
        </div>
      </div>
    )
  }

  const scores = assessment.scores || {}

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
          <p className="text-gray-600">Completed on {new Date(assessment.completed_at).toLocaleDateString()}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Overall Business Health Score</h2>
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {scores.overall || 0}%
            </div>
            <p className="text-gray-600">
              {scores.overall >= 80 ? 'Excellent - Your business is performing very well!' :
               scores.overall >= 60 ? 'Good - Some areas for improvement identified.' :
               scores.overall >= 40 ? 'Fair - Several opportunities for growth.' :
               'Needs Attention - Focus on key improvement areas.'}
            </p>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Engine Rooms */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Engine Rooms</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {scores.engineRooms || 0}%
            </div>
            <p className="text-sm text-gray-600">
              Core business operations and systems
            </p>
          </div>

          {/* Strategic Wheel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Strategic Wheel</h3>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {scores.strategicWheel || 0}%
            </div>
            <p className="text-sm text-gray-600">
              Strategic planning and alignment
            </p>
          </div>

          {/* Success Disciplines */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Success Disciplines</h3>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {scores.successDisciplines || 0}%
            </div>
            <p className="text-sm text-gray-600">
              Personal and leadership development
            </p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                1
              </div>
              <div>
                <h4 className="font-medium">Strategic Wheel Planning</h4>
                <p className="text-gray-600 text-sm">Based on your assessment, let's build your strategic foundation.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                2
              </div>
              <div>
                <h4 className="font-medium">Success Disciplines Focus</h4>
                <p className="text-gray-600 text-sm">Identify your top 3 disciplines for 90-day improvement.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                3
              </div>
              <div>
                <h4 className="font-medium">Achievement Engine</h4>
                <p className="text-gray-600 text-sm">Implement daily disciplines and accountability systems.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/assessment')}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >
            Retake Assessment
          </button>
        </div>
      </main>
    </div>
  )
}
