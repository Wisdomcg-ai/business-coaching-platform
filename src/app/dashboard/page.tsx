'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import SidebarLayout from '@/components/layout/sidebar-layout'
import { 
  Building2,
  DollarSign,
  Target,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Calendar,
  CalendarDays,
  Award,
  BarChart3,
  Mountain,
  FileBarChart,
  XCircle,
  CheckSquare,
  ChevronDown,
  Users,
  ArrowLeft
} from 'lucide-react'

// Type definitions
type Business = Database['public']['Tables']['businesses']['Row']
type Assessment = Database['public']['Tables']['assessments']['Row']

// Mock data
const mockGoals = {
  annual: { revenue: 5000000, profit: 20, team: 25 },
  quarterly: { revenue: 1250000, profit: 18, cashDays: 60 },
  focusMetric: { name: 'Monthly Recurring Revenue', current: 320000, target: 400000 }
}

const mockRocks = [
  { id: 1, title: 'Launch new product line', owner: 'John', status: 'on-track', progress: 40 },
  { id: 2, title: 'Implement CRM system', owner: 'Sarah', status: 'on-track', progress: 65 },
  { id: 3, title: 'Hire 3 senior developers', owner: 'Mike', status: 'behind', progress: 20 },
  { id: 4, title: 'Complete Series A prep', owner: 'CEO', status: 'not-started', progress: 0 }
]

// Main dashboard component
function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // State
  const [user, setUser] = useState<any>(null)
  const [isCoach, setIsCoach] = useState(false)
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null)
  const [allAssessments, setAllAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  // Load data on mount
  useEffect(() => {
    loadDashboardData()
  }, [searchParams])

  async function loadDashboardData() {
    try {
      setLoading(true)
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setUser(user)
      const userIsCoach = user.email?.includes('@wisdomcoaching.com.au') || false
      setIsCoach(userIsCoach)
      
      if (userIsCoach) {
        // Load all businesses for coach
        const { data: businesses } = await supabase
          .from('businesses')
          .select('*')
          .order('business_name')
        
        if (businesses && businesses.length > 0) {
          setAllBusinesses(businesses)
          
          const clientParam = searchParams.get('client')
          const businessToLoad = clientParam 
            ? businesses.find(b => b.id === clientParam) || businesses[0]
            : businesses[0]
          
          setSelectedClientId(businessToLoad.id)
          setBusiness(businessToLoad)
          await loadAssessments(businessToLoad.id)
        }
      } else {
        // Load client's own business
        const { data: businessData } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .single()
        
        if (businessData) {
          setBusiness(businessData)
          await loadAssessments(businessData.id)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadAssessments(businessId: string) {
    const { data: assessments } = await supabase
      .from('assessments')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
    
    if (assessments && assessments.length > 0) {
      setAllAssessments(assessments)
      setLatestAssessment(assessments[0])
    }
  }

  const handleClientChange = async (clientId: string) => {
    setSelectedClientId(clientId)
    setShowClientDropdown(false)
    router.push(`/dashboard?client=${clientId}`)
    
    const selectedBusiness = allBusinesses.find(b => b.id === clientId)
    if (selectedBusiness) {
      setBusiness(selectedBusiness)
      await loadAssessments(selectedBusiness.id)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  const getHealthColor = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case 'THRIVING': return 'text-green-600 bg-green-100'
      case 'STRONG': return 'text-blue-600 bg-blue-100'
      case 'STABLE': return 'text-yellow-600 bg-yellow-100'
      case 'BUILDING': return 'text-orange-600 bg-orange-100'
      case 'STRUGGLING': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRockStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-50 border-green-200'
      case 'behind': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'not-started': return 'text-gray-500 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const daysSinceAssessment = latestAssessment 
    ? Math.floor((Date.now() - new Date(latestAssessment.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      {/* Coach Controls */}
      {isCoach && (
        <div className="bg-blue-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/coach/dashboard" className="flex items-center hover:text-blue-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Coach Dashboard
              </Link>
              <span className="text-blue-200">|</span>
              <span className="text-sm">Coach Mode Active</span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowClientDropdown(!showClientDropdown)}
                className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg"
              >
                <Users className="h-4 w-4" />
                <span>Viewing: {business?.business_name || 'Select Client'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showClientDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-3 py-2">SELECT CLIENT</p>
                    {allBusinesses.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleClientChange(b.id)}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-900 ${
                          b.id === selectedClientId ? 'bg-blue-50' : ''
                        }`}
                      >
                        {b.business_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-blue-100 text-xs uppercase">Assessment</p>
              <p className="text-2xl font-bold">{latestAssessment?.overall_score || '--'}%</p>
            </div>
            <div className="text-center">
              <p className="text-blue-100 text-xs uppercase">Stage</p>
              <p className="text-2xl font-bold">{business?.revenue_stage || 'SCALING'}</p>
            </div>
            <div className="text-center">
              <p className="text-blue-100 text-xs uppercase">ARR</p>
              <p className="text-2xl font-bold">
                {business?.annual_revenue ? formatCurrency(business.annual_revenue) : '--'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-blue-100 text-xs uppercase">Target</p>
              <p className="text-2xl font-bold">{formatCurrency(mockGoals.annual.revenue)}</p>
            </div>
            <div className="text-center">
              <p className="text-blue-100 text-xs uppercase">Focus Metric</p>
              <p className="text-2xl font-bold">{formatCurrency(mockGoals.focusMetric.current)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Business Info */}
        {business && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold">{business.business_name}</h2>
                  <p className="text-sm text-gray-600">{business.industry}</p>
                </div>
              </div>
              {daysSinceAssessment !== null && (
                <p className="text-sm text-gray-500">
                  Last assessed {daysSinceAssessment} days ago
                </p>
              )}
            </div>
          </div>
        )}

        {/* Goals & Rocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Annual Goals</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Revenue Target</p>
                <p className="text-2xl font-bold">{formatCurrency(mockGoals.annual.revenue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold">{mockGoals.annual.profit}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Team Size</p>
                <p className="text-2xl font-bold">{mockGoals.annual.team} people</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">90-Day Goals</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Q1 Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(mockGoals.quarterly.revenue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold">{mockGoals.quarterly.profit}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cash Days</p>
                <p className="text-2xl font-bold">{mockGoals.quarterly.cashDays} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Q1 Rocks</h3>
            <div className="space-y-2">
              {mockRocks.map((rock) => (
                <div key={rock.id} className={`p-2 rounded border ${getRockStatusColor(rock.status)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{rock.title}</p>
                      <p className="text-xs text-gray-500">{rock.owner}</p>
                    </div>
                    <p className="text-sm font-bold">{rock.progress}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-semibold">Weekly Review</h4>
            </div>
            <p className="text-sm text-gray-600">Next: Monday, Dec 30</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-2">
              <CalendarDays className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold">Monthly Review</h4>
            </div>
            <p className="text-sm text-gray-600">Next: Jan 3, 2025</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-semibold">Quarterly Planning</h4>
            </div>
            <p className="text-sm text-gray-600">Next: Mar 28, 2025</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/finances/dashboard" className="bg-white rounded-lg shadow p-4 hover:shadow-md text-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mb-2 mx-auto" />
            <span className="text-sm font-medium">Business Dashboard</span>
          </Link>

          <Link href="/stop-doing" className="bg-white rounded-lg shadow p-4 hover:shadow-md text-center">
            <XCircle className="h-8 w-8 text-red-600 mb-2 mx-auto" />
            <span className="text-sm font-medium">Stop Doing List</span>
          </Link>

          <Link href="/todo-list" className="bg-white rounded-lg shadow p-4 hover:shadow-md text-center">
            <CheckSquare className="h-8 w-8 text-green-600 mb-2 mx-auto" />
            <span className="text-sm font-medium">To-Do List</span>
          </Link>

          <Link href="/reviews/weekly" className="bg-white rounded-lg shadow p-4 hover:shadow-md text-center">
            <FileBarChart className="h-8 w-8 text-orange-600 mb-2 mx-auto" />
            <span className="text-sm font-medium">Weekly Review</span>
          </Link>
        </div>
      </div>
    </SidebarLayout>
  )
}

// Export with Suspense wrapper
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}