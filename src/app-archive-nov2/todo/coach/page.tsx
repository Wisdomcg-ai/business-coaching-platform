// /src/app/todo/coach/page.tsx
// TEST VERSION - Allows access regardless of role for testing

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import TodoManager from '@/components/todos/TodoManagerV2'

interface Business {
  id: string
  name: string
  owner_id: string
}

export default function TodoCoachPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview')
  
  useEffect(() => {
    loadCoachData()
  }, [])
  
  const loadCoachData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setUserId(user.id)
      
      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id, role')
        .eq('id', user.id)
        .single()
      
      if (!profile) {
        alert('Profile not found. Please complete your setup.')
        router.push('/dashboard')
        return
      }
      
      // REMOVED ROLE CHECK FOR TESTING
      // Now anyone can access the coach view
      console.log('Current role:', profile.role, '- Allowing access for testing')
      
      setBusinessId(profile.business_id)
      
      // Load all businesses (clients)
      const { data: allBusinesses } = await supabase
        .from('businesses')
        .select('*')
        .neq('id', profile.business_id) // Exclude user's own business
        .order('name')
      
      if (allBusinesses) {
        setBusinesses(allBusinesses)
      }
      
    } catch (error) {
      console.error('Error loading coach data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const selectBusiness = (business: Business) => {
    setSelectedBusiness(business)
    setViewMode('detail')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {viewMode === 'overview' ? 'Client Tasks Overview' : `${selectedBusiness?.name} Tasks`}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick switch buttons for testing */}
              <Link
                href="/todo/client"
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                View as Client
              </Link>
              
              {viewMode === 'detail' && (
                <button
                  onClick={() => {
                    setViewMode('overview')
                    setSelectedBusiness(null)
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Back to Overview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'overview' ? (
          <>
            {/* Test notice */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-800">
                <strong>Test Mode:</strong> You're viewing the coach interface. 
                This would normally be restricted to coach accounts only.
              </p>
            </div>
            
            {/* Client list */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Select a Client</h2>
              
              {businesses.length === 0 ? (
                <div>
                  <p className="text-gray-500 mb-4">No other businesses found in the database.</p>
                  <p className="text-sm text-gray-600">
                    To test the coach view properly, you would need other businesses in your database. 
                    For now, you can select your own business below.
                  </p>
                  
                  {/* Show user's own business for testing */}
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold">Your Business (Test)</h3>
                    <button
                      onClick={() => selectBusiness({
                        id: businessId || '8a4cf97b-604f-4117-8fef-610b33ab9dab',
                        name: 'Your Business',
                        owner_id: userId || ''
                      })}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Tasks
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      onClick={() => selectBusiness(business)}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-gray-900">{business.name}</h3>
                      <p className="text-sm text-gray-600 mt-2">Click to manage tasks</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Coach View Features</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Select a client to view and manage their tasks</li>
                <li>• Add private notes that clients can't see</li>
                <li>• Control task visibility (published/draft)</li>
                <li>• See all tasks including private coach notes</li>
              </ul>
            </div>
          </>
        ) : (
          // Detail view - show TodoManager for selected client
          selectedBusiness && userId && (
            <>
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Coach Mode:</strong> You can add private notes and control task visibility for {selectedBusiness.name}.
                </p>
              </div>
              
              <TodoManager
                businessId={selectedBusiness.id}
                userId={userId}
                userRole="coach"
                clientName={selectedBusiness.name}
                supabase={supabase}
              />
            </>
          )
        )}
      </div>
    </div>
  )
}