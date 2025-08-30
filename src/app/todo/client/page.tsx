// /src/app/todo/client/page.tsx
// Stage 1: Client page with Supabase integration

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import TodoManager from '@/components/TodoManager'

export default function TodoClientPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState<string>('')
  
  useEffect(() => {
    loadUserData()
  }, [])
  
  const loadUserData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setUserId(user.id)
      
      // Get user's profile and business
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
      
      // Check if user is a client
      if (profile.role !== 'client') {
        router.push('/todo/coach')
        return
      }
      
      setBusinessId(profile.business_id)
      
      // Get business name
      const { data: business } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', profile.business_id)
        .single()
      
      if (business) {
        setBusinessName(business.name)
      }
      
    } catch (error) {
      console.error('Error loading user data:', error)
      alert('Failed to load user data. Please try again.')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!userId || !businessId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load todo system.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">
            Return to Dashboard
          </Link>
        </div>
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
              <h1 className="text-xl font-semibold text-gray-900">Task Management</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {businessName || 'My Business'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TodoManager
          businessId={businessId}
          userId={userId}
          userRole="client"
          supabase={supabase}
        />
      </div>
    </div>
  )
}