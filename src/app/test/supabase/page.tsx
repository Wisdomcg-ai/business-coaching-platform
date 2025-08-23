'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing...')
  const [user, setUser] = useState<any>(null)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [assessments, setAssessments] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setStatus('🔄 Testing Supabase connection...')
      
      // Test 1: Check auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        throw new Error(`Auth Error: ${authError.message}`)
      }
      
      setUser(user)
      setStatus('✅ Auth working!')
      
      // Test 2: Try to read businesses table
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .limit(5)
      
      if (businessError) {
        throw new Error(`Business Query Error: ${businessError.message}`)
      }
      
      setBusinesses(businessData || [])
      setStatus('✅ Database connection working!')
      
      // Test 3: Try to read assessments table
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .limit(5)
      
      if (assessmentError) {
        throw new Error(`Assessment Query Error: ${assessmentError.message}`)
      }
      
      setAssessments(assessmentData || [])
      setStatus('✅ All Supabase functionality working!')
      
    } catch (err: any) {
      console.error('Supabase test failed:', err)
      setError(err.message)
      setStatus('❌ Connection failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Supabase Connection Test</h1>
          <p className="text-gray-600">Testing database connection and authentication</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Connection Status</h2>
          <div className={`p-4 rounded-lg ${
            status.includes('✅') 
              ? 'bg-green-50 border border-green-200' 
              : status.includes('❌')
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <p className="font-medium">{status}</p>
            {error && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                <p className="text-red-800 text-sm"><strong>Error:</strong> {error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">User Authentication</h2>
          {user ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p><strong>✅ User Authenticated</strong></p>
              <p className="text-sm text-gray-600 mt-1">Email: {user.email}</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">👤 No user authenticated</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Businesses Table</h2>
            <p className="text-sm text-gray-600 mb-3">Found {businesses.length} businesses</p>
            {businesses.length > 0 ? (
              <div className="space-y-2">
                {businesses.map((business, index) => (
                  <div key={business.id} className="p-3 bg-gray-50 rounded border">
                    <p className="font-medium text-sm">{business.business_name || 'Unnamed Business'}</p>
                    <p className="text-xs text-gray-500">{business.industry || 'No industry'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No businesses found</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Assessments Table</h2>
            <p className="text-sm text-gray-600 mb-3">Found {assessments.length} assessments</p>
            {assessments.length > 0 ? (
              <div className="space-y-2">
                {assessments.map((assessment, index) => (
                  <div key={assessment.id} className="p-3 bg-gray-50 rounded border">
                    <p className="font-medium text-sm">Score: {assessment.health_score}%</p>
                    <p className="text-xs text-gray-500">{assessment.health_status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No assessments found</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}