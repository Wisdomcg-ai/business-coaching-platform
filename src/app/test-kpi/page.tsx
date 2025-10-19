'use client'

import { useKPIs, useKPIStats } from '@/lib/kpi'
import { CheckCircle, AlertCircle, Loader2, TrendingUp, Target } from 'lucide-react'

export default function TestKPIPage() {
  const { kpis, loading, error } = useKPIs()
  const stats = useKPIStats()

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Phase 2 KPI System...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Error Loading KPIs</h2>
          <p className="text-gray-600 text-center mb-4">{error.toString()}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Phase 2 KPI System</h1>
              <p className="text-gray-600">Production-ready KPI library test page</p>
            </div>
          </div>
          
          {/* System Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total KPIs"
              value={stats?.total || 0}
              color="blue"
              icon={<Target className="w-5 h-5" />}
            />
            <StatCard
              label="Essential Tier"
              value={stats?.byTier?.ESSENTIAL || 0}
              color="green"
              icon={<CheckCircle className="w-5 h-5" />}
            />
            <StatCard
              label="Business Functions"
              value={stats?.byFunction ? Object.keys(stats.byFunction).length : 0}
              color="purple"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard
              label="Industries"
              value={stats?.byIndustry ? Object.keys(stats.byIndustry).length : 0}
              color="orange"
              icon={<AlertCircle className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Function Breakdown */}
        {stats?.byFunction && Object.keys(stats.byFunction).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">KPIs by Business Function</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(stats.byFunction).map(([func, count]) => (
                <div key={func} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">{func}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Available KPIs ({kpis.length})</h2>
            <span className="text-sm text-gray-500">
              Showing all {kpis.length} KPIs
            </span>
          </div>
          
          {kpis.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No KPIs found in the system</p>
            </div>
          ) : (
            <div className="space-y-3">
              {kpis.map((kpi: any) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  color, 
  icon 
}: { 
  label: string
  value: number | string
  color: 'blue' | 'green' | 'purple' | 'orange'
  icon: React.ReactNode
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  }

  return (
    <div className={`rounded-lg p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium opacity-80">{label}</p>
        {icon}
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

// KPI Card Component
function KPICard({ kpi }: { kpi: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">{kpi.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{kpi.description}</p>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Business Function Badge */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              {kpi.businessFunction}
            </span>
            
            {/* Tier Badge */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              {kpi.tier}
            </span>
            
            {/* Tracking Frequency */}
            <span className="text-xs text-gray-500">
              Track: {kpi.trackingFrequency}
            </span>
            
            {/* Unit */}
            <span className="text-xs text-gray-500">
              Unit: {kpi.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}