// /src/app/todo/page.tsx
// Stage 1: Router with role detection

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function TodoPage() {
  const router = useRouter()
  const supabase = createClient()
  
  useEffect(() => {
    checkUserRole()
  }, [])
  
  const checkUserRole = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // Get user's role from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        console.log('User role detected:', profile.role)
        
        // Redirect based on role
        if (profile.role === 'coach') {
          router.push('/todo/coach')
        } else if (profile.role === 'client') {
          router.push('/todo/client')
        } else {
          console.error('Invalid role:', profile.role)
          alert('Your account role is not set properly. Please contact support.')
          router.push('/dashboard')
        }
      } else {
        console.error('No profile found for user')
        alert('Profile not found. Please complete your account setup.')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      router.push('/dashboard')
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading task manager...</p>
      </div>
    </div>
  )
}