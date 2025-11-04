'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import SidebarLayout from '@/components/layout/sidebar-layout'
import type { Database } from '@/types/database.types'
import {
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  ChevronRight,
  RefreshCw,
  Building2,
  Activity,
  MessageCircle,
  Target,
  BarChart3,
  Eye,
  AlertTriangle,
  XCircle
} from 'lucide-react'

type Business = Database['public']['Tables']['businesses']['Row']
type Assessment = Database['public']['Tables']['assessments']['Row']

interface ClientData {
  business: Business
  latestAssessment?: Assessment
  daysSinceAssessment?: number
  needsAttention: boolean
  attentionReason?: string
}

export default function CoachDashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<ClientData[]>([])
  const [stats, setStats] = useState({
    totalClients: 0,
    activeThisWeek: 0,
    needingAttention: 0,
    assessmentsDue: 0
  })
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  async function checkAuthAndLoadData() {
    try {
      setLoading(true)
      
      // Check if user is authenticated and is a coach
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // Check if user is a coach (using email for now)
      if (!user.email?.includes('@wisdomcoaching.com.au')) {
        // Not a coach, redirect to regular dashboard
        router.push('/dashboard')
        return
      }
      
      // Load all businesses and their assessments
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .order('business_name')
      
      if (businessError) {
        console.error('Error loading businesses:', businessError)
        return
      }
      
      // Load assessments for all businesses
      const { data: assessments, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (assessmentError) {
        console.error('Error loading assessments:', assessmentError)
      }
      
      // Process client data
      const clientsData: ClientData[] = []
      let activeCount = 0
      let attentionCount = 0
      let assessmentsDueCount = 0
      
      for (const business of businesses || []) {
        // Find latest assessment for this business
        const businessAssessments = assessments?.filter(a => a.business_id === business.id) || []
        const latestAssessment = businessAssessments[0]
        
        // Calculate days since assessment
        let daysSinceAssessment = null
        if (latestAssessment) {
          daysSinceAssessment = Math.floor(
            (Date.now() - new Date(latestAssessment.created_at).getTime()) / (1000 * 60 * 60 * 24)
          )
        }
        
        // Determine if needs attention
        let needsAttention = false
        let attentionReason = ''
        
        if (!latestAssessment) {
          needsAttention = true
          attentionReason = 'No assessment completed'
          assessmentsDueCount++
        } else if (daysSinceAssessment && daysSinceAssessment > 90) {
          needsAttention = true
          attentionReason = 'Assessment overdue (90+ days)'
          assessmentsDueCount++
        } else if (latestAssessment.health_status === 'STRUGGLING' || latestAssessment.health_status === 'URGENT') {
          needsAttention = true
          attentionReason = `Health status: ${latestAssessment.health_status}`
        }
        
        if (needsAttention) attentionCount++
        if (daysSinceAssessment && daysSinceAssessment < 7) activeCount++
        
        clientsData.push({
          business,
          latestAssessment,
          daysSinceAssessment,
          needsAttention,
          attentionReason
        })
      }
      
      setClients(clientsData)
      setStats({
        totalClients: clientsData.length,
        activeThisWeek: activeCount,
        needingAttention: attentionCount,
        assessmentsDue: assessmentsDueCount
      })
      
    } catch (error) {
      console.error('Error loading coach dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (status: string | null | undefined) => {
    switch (status?.toUpperCase()) {
      case 'THRIVING': return 'bg-green-100 text-green-800 border-green-200'
      case 'STRONG': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'STABLE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'BUILDING': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'STRUGGLING': return 'bg-red-100 text-red-800 border-red-200'
      case 'URGENT': return 'bg-red-200 text-red-900 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getHealthIcon = (status: string | null | undefined) => {
    switch (status?.toUpperCase()) {
      case 'THRIVING': 
      case 'STRONG': 
        return <CheckCircle className="h-5 w-5" />
      case 'STABLE':
      case 'BUILDING':
        return <Activity className="h-5 w-5" />
      case 'STRUGGLING':
      case 'URGENT':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading coach dashboard...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of all your coaching clients</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active This Week</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeThisWeek}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Need Attention</p>
                <p className="text-3xl font-bold text-gray-900">{stats.needingAttention}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assessments Due</p>
                <p className="text-3xl font-bold text-gray-900">{stats.assessmentsDue}</p>
              </div>
              <Clock className="h-10 w-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Clients Needing Attention */}
        {clients.filter(c => c.needsAttention).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Clients Needing Attention
            </h2>
            <div className="space-y-3">
              {clients.filter(c => c.needsAttention).map((client) => (
                <div key={client.business.id} className="flex items-center justify-between bg-white rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{client.business.business_name}</p>
                      <p className="text-sm text-gray-600">{client.attentionReason}</p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard?client=${client.business.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                  >
                    View Client <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Clients</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedView('grid')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedView === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setSelectedView('list')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedView === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Clients Grid/List */}
        {selectedView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clients.map((client) => (
              <div key={client.business.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Building2 className="h-8 w-8 text-gray-400" />
                    {client.needsAttention && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                        Attention
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {client.business.business_name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {client.business.industry || 'Industry not set'}
                  </p>
                  
                  {client.latestAssessment ? (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Health Score</span>
                        <span className="font-bold text-lg">
                          {client.latestAssessment.overall_score || 0}%
                        </span>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        getHealthColor(client.latestAssessment.health_status)
                      }`}>
                        {getHealthIcon(client.latestAssessment.health_status)}
                        <span className="ml-2">{client.latestAssessment.health_status || 'Unknown'}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Last assessed {client.daysSinceAssessment} days ago
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 italic">No assessment data</p>
                    </div>
                  )}
                  
                  <Link
                    href={`/dashboard?client=${client.business.id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block font-medium"
                  >
                    View Client
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Assessment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.business.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {client.business.business_name}
                          </div>
                          {client.needsAttention && (
                            <div className="text-xs text-red-600">
                              {client.attentionReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {client.business.industry || 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.latestAssessment ? (
                        <div className="text-sm font-bold text-gray-900">
                          {client.latestAssessment.overall_score || 0}%
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.latestAssessment ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getHealthColor(client.latestAssessment.health_status)
                        }`}>
                          {client.latestAssessment.health_status}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {client.daysSinceAssessment !== null && client.daysSinceAssessment !== undefined
                        ? `${client.daysSinceAssessment} days ago`
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/dashboard?client=${client.business.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}