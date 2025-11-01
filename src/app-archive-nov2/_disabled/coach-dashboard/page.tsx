'use client'

import { useRouter } from 'next/navigation'

export default function CoachDashboardPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Coach Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Client Overview</h2>
          <p className="text-gray-600 mb-4">Coach dashboard functionality will be available once authentication is set up.</p>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Main Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
