'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dynamic from 'next/dynamic'

// This fixes the 'use client' error by loading TodoManagerV2 dynamically
const TodoManagerV2 = dynamic(
  () => import('@/components/todos/TodoManagerV2'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading Todo Manager...</p>
      </div>
    )
  }
)

export default function TodosV2Page() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [ready, setReady] = useState(false)
  
  // Your IDs
  const userId = '52343ba5-7da0-4d76-8f5f-73f336164aa6'
  const businessId = '8a4cf97b-604f-4117-8fef-610b33ab9dab'
  
  useEffect(() => {
    // Simple check that we're ready
    setReady(true)
  }, [])
  
  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Initializing...</p>
      </div>
    )
  }
  
  return (
    <TodoManagerV2
      userId={userId}
      businessId={businessId}
      userRole="coach"
    />
  )
}