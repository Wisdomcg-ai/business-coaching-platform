'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import EnhancedKPIModal from '@/components/EnhancedKPIModal'
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  Trophy,
  Rocket,
  Eye,
  Mountain,
  AlertTriangle,
  Clock,
  BarChart3,
  Users,
  DollarSign,
  Lightbulb,
  Save,
  Loader2,
  Info,
  Heart,
  Settings,
  Star,
  Phone,
  ShoppingBag,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  Activity,
  Zap,
  Shield,
  Award,
  Megaphone
} from 'lucide-react'

// Type definitions based on our database schema
type VisionTarget = Database['public']['Tables']['vision_targets']['Row']
type AnnualTarget = Database['public']['Tables']['annual_targets']['Row']
type QuarterlyRock = Database['public']['Tables']['quarterly_rocks']['Row']
type Business = Database['public']['Tables']['businesses']['Row']
type Assessment = Database['public']['Tables']['assessments']['Row']

// Tab type
type TabType = 'quarterly' | 'annual' | '3-year' | '10-year'

// Status colors
const STATUS_COLORS = {
  'On Track': 'text-green-600 bg-green-50 border-green-200',
  'At Risk': 'text-yellow-600 bg-yellow-50 border-yellow-200',
  'Complete': 'text-blue-600 bg-blue-50 border-blue-200',
  'Missed': 'text-red-600 bg-red-50 border-red-200'
}

// Revenue stage mapping
const REVENUE_STAGES = {
  '0-250K': { name: 'FOUNDATION', next: 'TRACTION', nextTarget: '$250K' },
  '250K-1M': { name: 'TRACTION', next: 'GROWTH', nextTarget: '$1M' },
  '1M-2.5M': { name: 'GROWTH', next: 'SCALE', nextTarget: '$2.5M' },
  '2.5M-5M': { name: 'SCALE', next: 'OPTIMIZATION', nextTarget: '$5M' },
  '5M-10M': { name: 'OPTIMIZATION', next: 'LEADERSHIP', nextTarget: '$10M' },
  '10M+': { name: 'LEADERSHIP', next: 'MASTERY', nextTarget: '∞' }
}

// KPI Library with stage and industry specific metrics
const KPI_LIBRARY = {
  byStage: {
    FOUNDATION: [
      { name: 'Monthly Revenue', unit: '$', icon: DollarSign, category: 'Financial' },
      { name: 'Customer Count', unit: '#', icon: Users, category: 'Growth' },
      { name: 'Cash Runway', unit: 'months', icon: Clock, category: 'Financial' },
      { name: 'Conversion Rate', unit: '%', icon: Target, category: 'Sales' },
      { name: 'Customer Acquisition Cost', unit: '$', icon: TrendingUp, category: 'Marketing' },
    ],
    TRACTION: [
      { name: 'MRR (Monthly Recurring)', unit: '$', icon: DollarSign, category: 'Financial' },
      { name: 'Customer Lifetime Value', unit: '$', icon: Users, category: 'Customer' },
      { name: 'Churn Rate', unit: '%', icon: TrendingUp, category: 'Customer' },
      { name: 'Average Deal Size', unit: '$', icon: Target, category: 'Sales' },
      { name: 'Lead Response Time', unit: 'hours', icon: Clock, category: 'Sales' },
    ],
    GROWTH: [
      { name: 'Revenue Per Employee', unit: '$', icon: Users, category: 'Efficiency' },
      { name: 'EBITDA Margin', unit: '%', icon: DollarSign, category: 'Financial' },
      { name: 'Net Promoter Score', unit: 'score', icon: Heart, category: 'Customer' },
      { name: 'Market Share', unit: '%', icon: Target, category: 'Growth' },
      { name: 'Pipeline Coverage', unit: 'x', icon: TrendingUp, category: 'Sales' },
    ],
    SCALE: [
      { name: 'Return on Investment', unit: '%', icon: TrendingUp, category: 'Financial' },
      { name: 'Customer Satisfaction', unit: 'score', icon: Heart, category: 'Customer' },
      { name: 'Innovation Index', unit: 'score', icon: Lightbulb, category: 'Growth' },
      { name: 'Operational Efficiency', unit: '%', icon: Settings, category: 'Operations' },
      { name: 'Brand Recognition', unit: '%', icon: Star, category: 'Marketing' },
    ],
  },
  byIndustry: {
    trades: [
      { name: 'Jobs Completed/Month', unit: '#', icon: CheckCircle, category: 'Operations' },
      { name: 'Average Job Value', unit: '$', icon: DollarSign, category: 'Sales' },
      { name: 'Quote-to-Win Rate', unit: '%', icon: Target, category: 'Sales' },
      { name: 'Callback Rate', unit: '%', icon: Phone, category: 'Quality' },
      { name: 'Tool Utilization', unit: '%', icon: Settings, category: 'Efficiency' },
    ],
    professional: [
      { name: 'Billable Utilization', unit: '%', icon: Clock, category: 'Efficiency' },
      { name: 'Realization Rate', unit: '%', icon: DollarSign, category: 'Financial' },
      { name: 'Client Retention', unit: '%', icon: Users, category: 'Customer' },
      { name: 'Project Margin', unit: '%', icon: Target, category: 'Financial' },
      { name: 'Referral Rate', unit: '%', icon: Heart, category: 'Growth' },
    ],
    retail: [
      { name: 'Same Store Sales', unit: '%', icon: ShoppingBag, category: 'Sales' },
      { name: 'Inventory Turnover', unit: 'x', icon: Package, category: 'Operations' },
      { name: 'Foot Traffic', unit: '#', icon: Users, category: 'Marketing' },
      { name: 'Basket Size', unit: '$', icon: ShoppingCart, category: 'Sales' },
      { name: 'Shrinkage Rate', unit: '%', icon: AlertCircle, category: 'Operations' },
    ],
  }
}

// Roadmap initiatives by category and stage
const ROADMAP_INITIATIVES = {
  FOUNDATION: {
    'Marketing & Lead Generation': [
      'Create basic website',
      'Set up Google My Business',
      'Choose 1-2 marketing channels',
      'Create basic marketing message',
      'Start social media presence',
    ],
    'Sales & Conversion': [
      'Define sales process',
      'Create pricing strategy',
      'Develop basic proposals',
      'Set up follow-up system',
    ],
    'Operations & Delivery': [
      'Document core processes',
      'Create quality checklist',
      'Set service standards',
      'Basic project tracking',
    ],
    'Finance & Administration': [
      'Set up accounting software',
      'Track cash flow weekly',
      'Invoice management system',
      'Basic financial reporting',
    ],
    'People & Culture': [
      'Define core values',
      'Hire first employees',
      'Create job descriptions',
      'Basic onboarding process',
    ],
    'Systems & Technology': [
      'Essential tools setup',
      'File organization system',
      'Basic CRM setup',
      'Email management',
    ],
  },
  TRACTION: {
    'Marketing & Lead Generation': [
      'Build email list',
      'Content marketing start',
      'Referral program',
      'Track marketing ROI',
      'SEO optimization',
    ],
    'Sales & Conversion': [
      'Sales training program',
      'CRM implementation',
      'Pipeline management',
      'Proposal templates',
    ],
    'Operations & Delivery': [
      'Standard operating procedures',
      'Quality management system',
      'Customer feedback loop',
      'Efficiency tracking',
    ],
    'Finance & Administration': [
      'Monthly P&L reviews',
      'Budget vs actual tracking',
      'Cash flow forecasting',
      'KPI dashboard',
    ],
    'People & Culture': [
      'Performance review system',
      'Training programs',
      'Team building activities',
      'Recognition system',
    ],
    'Systems & Technology': [
      'Process automation',
      'Integration setup',
      'Reporting systems',
      'Data backup strategy',
    ],
  },
  GROWTH: {
    'Marketing & Lead Generation': [
      'Marketing team build',
      'Multi-channel strategy',
      'Marketing automation',
      'Brand development',
      'Partnership marketing',
    ],
    'Sales & Conversion': [
      'Sales team expansion',
      'Advanced CRM usage',
      'Territory planning',
      'Key account strategy',
    ],
    'Operations & Delivery': [
      'Scale operations',
      'Advanced quality systems',
      'Customer success team',
      'Innovation processes',
    ],
    'Finance & Administration': [
      'Advanced reporting',
      'Investment planning',
      'Risk management',
      'Scenario planning',
    ],
    'People & Culture': [
      'Leadership development',
      'Succession planning',
      'Culture optimization',
      'Career pathways',
    ],
    'Systems & Technology': [
      'Advanced automation',
      'AI implementation',
      'Digital transformation',
      'Platform development',
    ],
  },
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      if (timeout) {
        clearTimeout(timeout)
      }
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

// Helper function to map business industry to KPI library keys
function mapIndustryToKPIKey(industry: string | null): keyof typeof KPI_LIBRARY.byIndustry | null {
  if (!industry) return null
  
  const normalized = industry.toLowerCase()
  
  // Check for trades-related industries
  if (normalized.includes('trade') || 
      normalized.includes('electric') || 
      normalized.includes('plumb') || 
      normalized.includes('hvac') ||
      normalized.includes('building') ||
      normalized.includes('construction')) {
    return 'trades'
  }
  
  // Check for professional services
  if (normalized.includes('professional') || 
      normalized.includes('consult') ||
      normalized.includes('legal') ||
      normalized.includes('account') ||
      normalized.includes('finance') ||
      normalized.includes('insurance')) {
    return 'professional'
  }
  
  // Check for retail
  if (normalized.includes('retail') || 
      normalized.includes('shop') ||
      normalized.includes('store') ||
      normalized.includes('ecommerce') ||
      normalized.includes('e-commerce')) {
    return 'retail'
  }
  
  return null
}

export default function GoalsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  
  // State management - Default to 10-year tab
  const [activeTab, setActiveTab] = useState<TabType>('10-year')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showKPIModal, setShowKPIModal] = useState(false)
  
  // Business and assessment data
  const [business, setBusiness] = useState<Business | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [healthScore, setHealthScore] = useState(72) // Default value
  
  // Goals data
  const [visionTarget, setVisionTarget] = useState<Partial<VisionTarget>>({})
  const [annualTarget, setAnnualTarget] = useState<Partial<AnnualTarget>>({})
  const [quarterlyRocks, setQuarterlyRocks] = useState<QuarterlyRock[]>([])
  
  // Current date calculations
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1
  const quarterEndDate = new Date(currentYear, currentQuarter * 3, 0)
  const daysRemaining = Math.ceil((quarterEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Load all data on mount
  useEffect(() => {
    loadData()
  }, [])
  
  // Auto-save functionality with debouncing
  const autoSave = useCallback(
    debounce(async (data: any, type: 'vision' | 'annual' | 'rock') => {
      setSaving(true)
      try {
        if (type === 'vision' && business) {
          await saveVisionTarget(data)
        } else if (type === 'annual' && business) {
          await saveAnnualTarget(data)
        } else if (type === 'rock' && business) {
          await saveRock(data)
        }
      } catch (error) {
        console.error('Auto-save error:', error)
      } finally {
        setSaving(false)
      }
    }, 2000),
    [business]
  )
  
  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // Get first/oldest business
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
      
      if (businessError) throw businessError
      
      if (!businesses || businesses.length === 0) {
        setError('No business found. Please complete your business profile first.')
        router.push('/business-profile')
        return
      }
      
      const businessData = businesses[0]
      setBusiness(businessData)
      
      // Load latest assessment for health score and suggestions
      const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('business_id', businessData.id)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (assessments && assessments.length > 0) {
        setAssessment(assessments[0])
        // Calculate health score from assessment
        if (assessments[0].total_score && assessments[0].max_score) {
          const score = Math.round((assessments[0].total_score / assessments[0].max_score) * 100)
          setHealthScore(score)
        }
      }
      
      // Load vision targets
      const { data: visionData } = await supabase
        .from('vision_targets')
        .select('*')
        .eq('business_id', businessData.id)
        .single()
      
      if (visionData) {
        setVisionTarget(visionData)
      }
      
      // Load annual targets for current year
      const { data: annualData } = await supabase
        .from('annual_targets')
        .select('*')
        .eq('business_id', businessData.id)
        .eq('year', currentYear)
        .eq('is_active', true)
        .single()
      
      if (annualData) {
        setAnnualTarget(annualData)
      }
      
      // Load quarterly rocks for current quarter
      const { data: rocksData } = await supabase
        .from('quarterly_rocks')
        .select('*')
        .eq('business_id', businessData.id)
        .eq('year', currentYear)
        .eq('quarter', currentQuarter)
        .order('created_at', { ascending: true })
      
      if (rocksData) {
        setQuarterlyRocks(rocksData)
      }
      
    } catch (error: any) {
      console.error('Error loading data:', error)
      setError(error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }
  
  // Save functions
  async function saveVisionTarget(updates: Partial<VisionTarget>) {
    if (!business) return
    
    const updatedVision = { ...visionTarget, ...updates }
    setVisionTarget(updatedVision)
    
    if (visionTarget.id) {
      // Update existing
      const { error } = await supabase
        .from('vision_targets')
        .update(updates)
        .eq('id', visionTarget.id)
      
      if (error) throw error
    } else {
      // Create new
      const { data, error } = await supabase
        .from('vision_targets')
        .insert({ business_id: business.id, ...updates })
        .select()
        .single()
      
      if (error) throw error
      if (data) setVisionTarget(data)
    }
  }
  
  async function saveAnnualTarget(updates: Partial<AnnualTarget>) {
    if (!business) return
    
    const updatedAnnual = { ...annualTarget, ...updates }
    setAnnualTarget(updatedAnnual)
    
    if (annualTarget.id) {
      // Update existing
      const { error } = await supabase
        .from('annual_targets')
        .update(updates)
        .eq('id', annualTarget.id)
      
      if (error) throw error
    } else {
      // Create new
      const { data, error } = await supabase
        .from('annual_targets')
        .insert({ 
          business_id: business.id, 
          year: currentYear,
          ...updates 
        })
        .select()
        .single()
      
      if (error) throw error
      if (data) setAnnualTarget(data)
    }
  }
  
  async function saveRock(rock: Partial<QuarterlyRock>) {
    if (!business) return
    
    if (rock.id) {
      // Update existing
      const { error } = await supabase
        .from('quarterly_rocks')
        .update(rock)
        .eq('id', rock.id)
      
      if (error) throw error
      
      // Update local state
      setQuarterlyRocks(prev => 
        prev.map(r => r.id === rock.id ? { ...r, ...rock } : r)
      )
    } else {
      // Create new
      const { data, error } = await supabase
        .from('quarterly_rocks')
        .insert({
          business_id: business.id,
          year: currentYear,
          quarter: currentQuarter,
          due_date: quarterEndDate.toISOString(),
          ...rock
        })
        .select()
        .single()
      
      if (error) throw error
      if (data) setQuarterlyRocks(prev => [...prev, data])
    }
  }
  
  async function deleteRock(id: string) {
    const { error } = await supabase
      .from('quarterly_rocks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    setQuarterlyRocks(prev => prev.filter(r => r.id !== id))
  }
  
  // Get revenue stage info
  const revenueStageInfo = useMemo(() => {
    const revenue = business?.current_revenue || '0-250K'
    return REVENUE_STAGES[revenue as keyof typeof REVENUE_STAGES] || REVENUE_STAGES['0-250K']
  }, [business])
  
  // Get the relevant industry key for KPIs
  const industryKey = useMemo(() => {
    return mapIndustryToKPIKey(business?.industry || null)
  }, [business])
  
  // Get filtered industry KPIs
  const relevantIndustryKPIs = useMemo(() => {
    if (!industryKey) return []
    return KPI_LIBRARY.byIndustry[industryKey] || []
  }, [industryKey])
  
  // Generate smart suggestions based on assessment
  const smartSuggestions = useMemo(() => {
    const suggestions = []
    
    // Based on revenue stage
    if (revenueStageInfo.name === 'FOUNDATION') {
      suggestions.push('Focus on validating your business model and achieving consistent revenue')
      suggestions.push('Build repeatable sales process and document core operations')
    } else if (revenueStageInfo.name === 'TRACTION') {
      suggestions.push('Systematize operations and hire your first key employees')
      suggestions.push('Implement CRM and establish predictable lead generation')
    } else if (revenueStageInfo.name === 'GROWTH') {
      suggestions.push('Build management team and optimize profit margins')
      suggestions.push('Develop multiple revenue streams and scale marketing')
    }
    
    // Based on assessment weak areas (mock data for now)
    if (healthScore < 60) {
      suggestions.push('Address critical business health issues identified in assessment')
    }
    if (assessment?.section_scores?.engines && assessment.section_scores.engines < 40) {
      suggestions.push('Strengthen business engines, particularly lead generation and conversion')
    }
    
    return suggestions
  }, [revenueStageInfo, healthScore, assessment])
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your goals...</p>
        </div>
      </div>
    )
  }
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Goals</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Context Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Goals & Planning</h1>
              <p className="text-gray-600 mt-1">Set your vision and track progress</p>
            </div>
            
            {/* Context Bar */}
            <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  <span className="text-gray-600">Current Stage:</span>
                  <span className="font-semibold text-gray-900">{revenueStageInfo.name}</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-gray-600">Next:</span>
                  <span className="font-medium text-indigo-600">{revenueStageInfo.next} ({revenueStageInfo.nextTarget})</span>
                </div>
                <div className="flex items-center gap-2 border-l pl-4">
                  <span className="text-gray-600">Health Score:</span>
                  <span className={`font-bold ${healthScore >= 70 ? 'text-green-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {healthScore}%
                  </span>
                </div>
                {business?.industry && (
                  <div className="flex items-center gap-2 border-l pl-4">
                    <span className="text-gray-600">Industry:</span>
                    <span className="font-medium text-gray-900">{business.industry}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Saving indicator */}
          {saving && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving changes...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs - REVERSED ORDER */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('10-year')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === '10-year'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mountain className="h-4 w-4" />
                10-Year BHAG
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('3-year')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === '3-year'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                3-Year Vision
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('annual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'annual'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Annual Plan
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('quarterly')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quarterly'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                Quarterly Rocks
              </div>
            </button>
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 10-Year BHAG Tab */}
        {activeTab === '10-year' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">10-Year BHAG ({currentYear + 10})</h2>
                
                {/* BHAG Context */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    A <strong>Big Hairy Audacious Goal (BHAG)</strong>, coined by Jim Collins in "Built to Last," is a clear and compelling long-term goal that serves as a unifying focal point of effort. 
                    It should be ambitious enough to inspire your entire organization while being specific enough to guide decisions.
                  </p>
                </div>
                
                {/* Examples Dropdown */}
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    View BHAG Examples for Inspiration
                  </summary>
                  <div className="mt-3 space-y-3 pl-6">
                    <div className="border-l-4 border-gray-300 pl-4">
                      <p className="text-sm font-medium text-gray-900">Zappos (achieved):</p>
                      <p className="text-sm text-gray-600 italic">"Deliver WOW through service - $1 billion in gross sales by 2010"</p>
                    </div>
                    <div className="border-l-4 border-gray-300 pl-4">
                      <p className="text-sm font-medium text-gray-900">Microsoft (1980s):</p>
                      <p className="text-sm text-gray-600 italic">"A computer on every desk and in every home"</p>
                    </div>
                    <div className="border-l-4 border-gray-300 pl-4">
                      <p className="text-sm font-medium text-gray-900">Google (early days):</p>
                      <p className="text-sm text-gray-600 italic">"Organize the world's information and make it universally accessible and useful"</p>
                    </div>
                    <div className="border-l-4 border-gray-300 pl-4">
                      <p className="text-sm font-medium text-gray-900">SpaceX:</p>
                      <p className="text-sm text-gray-600 italic">"Enable human life on Mars"</p>
                    </div>
                    <div className="border-l-4 border-gray-300 pl-4">
                      <p className="text-sm font-medium text-gray-900">Amazon (1990s):</p>
                      <p className="text-sm text-gray-600 italic">"Every book, ever printed, in any language, all available in less than 60 seconds"</p>
                    </div>
                    <div className="border-l-4 border-gray-300 pl-4">
                      <p className="text-sm font-medium text-gray-900">Nike (1960s):</p>
                      <p className="text-sm text-gray-600 italic">"Crush Adidas"</p>
                    </div>
                  </div>
                </details>
              </div>
              
              <div className="space-y-6">
                {/* Combined BHAG Statement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your 10-Year BHAG
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Write a single, powerful statement that includes your measurable target and why it matters. 
                    Make it bold, clear, and inspiring.
                  </p>
                  <textarea
                    value={visionTarget.bhag_statement || ''}
                    onChange={(e) => {
                      const updated = { ...visionTarget, bhag_statement: e.target.value }
                      setVisionTarget(updated)
                      autoSave(updated, 'vision')
                    }}
                    placeholder="Example: 'We will become the recognized leader in [your industry] with $100M in revenue and 10,000 delighted customers, transforming how [target market] experiences [your value proposition], making their lives dramatically better.'"
                    rows={6}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                {/* Target Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Year
                  </label>
                  <input
                    type="number"
                    value={visionTarget.bhag_target_year || currentYear + 10}
                    onChange={(e) => {
                      const updated = { ...visionTarget, bhag_target_year: parseInt(e.target.value) || currentYear + 10 }
                      setVisionTarget(updated)
                      autoSave(updated, 'vision')
                    }}
                    min={currentYear + 5}
                    max={currentYear + 25}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                {/* Tips for a Great BHAG */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">✓ Checklist for a Great BHAG:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Is it measurable and specific? (Include numbers, market position, or clear outcome)</li>
                    <li>• Will it take 10+ years to achieve?</li>
                    <li>• Does it require you to grow beyond your current capabilities?</li>
                    <li>• Is it exciting enough to inspire your team for a decade?</li>
                    <li>• Can a 12-year-old understand it?</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 3-Year Vision Tab */}
        {activeTab === '3-year' && (
          <div className="space-y-6">
            {/* Financial Targets Section - Enhanced */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">3-Year Vision ({currentYear + 3})</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-Powered Suggestions Active</span>
                </div>
              </div>
              
              {/* Financial Targets with Visual Indicators */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    Financial Targets
                  </h3>
                  
                  {/* Revenue */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Revenue Target
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={visionTarget.three_year_revenue || ''}
                          onChange={(e) => {
                            const updated = { ...visionTarget, three_year_revenue: parseFloat(e.target.value) || 0 }
                            setVisionTarget(updated)
                            autoSave(updated, 'vision')
                          }}
                          placeholder="5000000"
                          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 rounded-lg text-sm w-full border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Growth:</span>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-700">
                              {visionTarget.three_year_revenue && business?.current_revenue ? 
                                `${Math.round(((visionTarget.three_year_revenue - parseFloat(business.current_revenue.replace(/[^0-9.-]+/g,""))) / parseFloat(business.current_revenue.replace(/[^0-9.-]+/g,""))) * 100)}%` 
                                : '---'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Gross Profit */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gross Profit Target
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={(visionTarget as any).three_year_gross_profit || ''}
                          onChange={(e) => {
                            const updated = { ...visionTarget, three_year_gross_profit: parseFloat(e.target.value) || 0 } as any
                            setVisionTarget(updated)
                            autoSave(updated, 'vision')
                          }}
                          placeholder="2000000"
                          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-lg text-sm w-full border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Margin:</span>
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <span className="font-bold text-blue-700">
                              {visionTarget.three_year_revenue && (visionTarget as any).three_year_gross_profit ? 
                                `${Math.round(((visionTarget as any).three_year_gross_profit / visionTarget.three_year_revenue) * 100)}%` 
                                : '---'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Net Profit */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Net Profit Target
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={visionTarget.three_year_profit || ''}
                          onChange={(e) => {
                            const updated = { ...visionTarget, three_year_profit: parseFloat(e.target.value) || 0 }
                            setVisionTarget(updated)
                            autoSave(updated, 'vision')
                          }}
                          placeholder="750000"
                          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-2 rounded-lg text-sm w-full border border-purple-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Margin:</span>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-purple-600" />
                            <span className="font-bold text-purple-700">
                              {visionTarget.three_year_revenue && visionTarget.three_year_profit ? 
                                `${Math.round((visionTarget.three_year_profit / visionTarget.three_year_revenue) * 100)}%` 
                                : '---'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* KPIs Section - World Class UI */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                    Key Performance Indicators
                  </h3>
                  <button
                    onClick={() => setShowKPIModal(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add KPI
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Track your most important metrics
                  {industryKey && <span className="font-medium"> for {business?.industry}</span>}
                </p>
              </div>
              
              {/* KPI Cards Grid - Beautiful Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {((visionTarget as any).kpis || []).map((kpi: any, index: number) => {
                  // Find icon from library
                  const kpiData = [...(KPI_LIBRARY.byStage[revenueStageInfo.name as keyof typeof KPI_LIBRARY.byStage] || []), 
                                   ...relevantIndustryKPIs]
                                  .find(k => k.name === kpi.name)
                  const Icon = kpiData?.icon || Target
                  const category = kpiData?.category || 'Custom'
                  
                  // Determine color based on category
                  const colorClass = category === 'Financial' ? 'from-green-500 to-green-600' :
                                    category === 'Customer' ? 'from-blue-500 to-blue-600' :
                                    category === 'Growth' ? 'from-purple-500 to-purple-600' :
                                    category === 'Operations' ? 'from-orange-500 to-orange-600' :
                                    'from-gray-500 to-gray-600'
                  
                  return (
                    <div key={index} className="relative group">
                      <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClass} bg-opacity-10`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <button
                            onClick={() => {
                              const kpis = ((visionTarget as any).kpis || []).filter((_: any, i: number) => i !== index)
                              const updated = { ...visionTarget, kpis } as any
                              setVisionTarget(updated)
                              autoSave(updated, 'vision')
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">{category}</span>
                            <span className="text-xs text-gray-400">{kpi.unit}</span>
                          </div>
                          <div className="font-semibold text-gray-900">{kpi.name}</div>
                          <div className="flex items-baseline gap-1">
                            <input
                              type="text"
                              value={kpi.target}
                              onChange={(e) => {
                                const kpis = (visionTarget as any).kpis || []
                                kpis[index] = { ...kpis[index], target: e.target.value }
                                const updated = { ...visionTarget, kpis } as any
                                setVisionTarget(updated)
                                autoSave(updated, 'vision')
                              }}
                              placeholder="Target"
                              className="flex-1 text-2xl font-bold bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
                            />
                            <span className="text-sm text-gray-500">{kpi.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* Add KPI Card */}
                <button
                  onClick={() => setShowKPIModal(true)}
                  className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[150px] group"
                >
                  <Plus className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 mb-2" />
                  <span className="text-sm text-gray-500 group-hover:text-indigo-600 font-medium">Add KPI</span>
                </button>
              </div>
              
              {/* Smart Suggestions */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-indigo-900 mb-1">
                      Recommended KPIs for {revenueStageInfo.name} Stage
                      {industryKey && <span> in {business?.industry}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* Combine stage and industry KPIs, filter out existing ones */}
                      {[...(KPI_LIBRARY.byStage[revenueStageInfo.name as keyof typeof KPI_LIBRARY.byStage] || KPI_LIBRARY.byStage.FOUNDATION),
                        ...relevantIndustryKPIs]
                        .filter((kpi, index, self) => 
                          self.findIndex(k => k.name === kpi.name) === index && // Remove duplicates
                          !((visionTarget as any).kpis || []).some((k: any) => k.name === kpi.name) // Remove already added
                        )
                        .slice(0, 4)
                        .map((kpi, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const kpis = (visionTarget as any).kpis || []
                              kpis.push({ name: kpi.name, target: '', unit: kpi.unit })
                              const updated = { ...visionTarget, kpis } as any
                              setVisionTarget(updated)
                              autoSave(updated, 'vision')
                            }}
                            className="text-xs bg-white px-3 py-1 rounded-full text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            + {kpi.name}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Strategic Initiatives - With Roadmap Integration */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-gray-600" />
                    Strategic Initiatives
                  </h3>
                  <button
                    onClick={() => {
                      const roadmapModal = document.getElementById('roadmap-modal')
                      if (roadmapModal) {
                        roadmapModal.classList.toggle('hidden')
                      }
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <Zap className="h-4 w-4" />
                    Browse Roadmap
                  </button>
                </div>
                <p className="text-sm text-gray-600">Key projects to achieve your 3-year vision</p>
              </div>
              
              {/* Initiatives List - Enhanced */}
              <div className="space-y-3 mb-4">
                {((visionTarget as any).initiatives || []).map((initiative: any, index: number) => {
                  // Determine icon based on category
                  const categoryIcon = initiative.category === 'Marketing & Lead Generation' ? Megaphone :
                                       initiative.category === 'Sales & Conversion' ? ShoppingCart :
                                       initiative.category === 'Operations & Delivery' ? Package :
                                       initiative.category === 'Finance & Administration' ? DollarSign :
                                       initiative.category === 'People & Culture' ? Users :
                                       initiative.category === 'Systems & Technology' ? Settings :
                                       Rocket
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <categoryIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={initiative.title}
                            onChange={(e) => {
                              const initiatives = (visionTarget as any).initiatives || []
                              initiatives[index] = { ...initiatives[index], title: e.target.value }
                              const updated = { ...visionTarget, initiatives } as any
                              setVisionTarget(updated)
                              autoSave(updated, 'vision')
                            }}
                            placeholder="Initiative title..."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                          
                          <div className="flex gap-3">
                            <select
                              value={initiative.category || ''}
                              onChange={(e) => {
                                const initiatives = (visionTarget as any).initiatives || []
                                initiatives[index] = { ...initiatives[index], category: e.target.value }
                                const updated = { ...visionTarget, initiatives } as any
                                setVisionTarget(updated)
                                autoSave(updated, 'vision')
                              }}
                              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                            >
                              <option value="">Select Category</option>
                              <option value="Marketing & Lead Generation">Marketing & Lead Generation</option>
                              <option value="Sales & Conversion">Sales & Conversion</option>
                              <option value="Operations & Delivery">Operations & Delivery</option>
                              <option value="Finance & Administration">Finance & Administration</option>
                              <option value="People & Culture">People & Culture</option>
                              <option value="Systems & Technology">Systems & Technology</option>
                              <option value="Strategy & Growth">Strategy & Growth</option>
                            </select>
                            
                            <label className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={initiative.next12Months || false}
                                onChange={(e) => {
                                  const initiatives = (visionTarget as any).initiatives || []
                                  initiatives[index] = { ...initiatives[index], next12Months: e.target.checked }
                                  const updated = { ...visionTarget, initiatives } as any
                                  setVisionTarget(updated)
                                  autoSave(updated, 'vision')
                                }}
                                className="rounded text-indigo-600"
                              />
                              <span className="text-sm font-medium whitespace-nowrap">Next 12 Months</span>
                            </label>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            const initiatives = ((visionTarget as any).initiatives || []).filter((_: any, i: number) => i !== index)
                            const updated = { ...visionTarget, initiatives } as any
                            setVisionTarget(updated)
                            autoSave(updated, 'vision')
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Add Initiative Button */}
              <button
                onClick={() => {
                  const initiatives = (visionTarget as any).initiatives || []
                  initiatives.push({ title: '', category: '', next12Months: false })
                  const updated = { ...visionTarget, initiatives } as any
                  setVisionTarget(updated)
                  autoSave(updated, 'vision')
                }}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Strategic Initiative
              </button>
              
              {/* Enhanced Summary with Visual Categories */}
              {((visionTarget as any).initiatives || []).length > 0 && (
                <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Initiative Overview</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                    {['Marketing & Lead Generation', 'Sales & Conversion', 'Operations & Delivery', 
                      'Finance & Administration', 'People & Culture', 'Systems & Technology', 'Strategy & Growth'].map(cat => {
                      const count = ((visionTarget as any).initiatives || []).filter((i: any) => i.category === cat).length
                      const next12 = ((visionTarget as any).initiatives || []).filter((i: any) => i.category === cat && i.next12Months).length
                      
                      if (count === 0) return null
                      
                      const Icon = cat === 'Marketing & Lead Generation' ? Megaphone :
                                  cat === 'Sales & Conversion' ? ShoppingCart :
                                  cat === 'Operations & Delivery' ? Package :
                                  cat === 'Finance & Administration' ? DollarSign :
                                  cat === 'People & Culture' ? Users :
                                  cat === 'Systems & Technology' ? Settings :
                                  Rocket
                      
                      return (
                        <div key={cat} className="bg-white rounded-lg p-3 border border-indigo-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4 text-indigo-600" />
                            <span className="text-xs font-medium text-gray-900">{cat.split(' & ')[0]}</span>
                          </div>
                          <div className="text-sm font-bold text-indigo-600">{count}</div>
                          {next12 > 0 && (
                            <div className="text-xs text-gray-500">
                              {next12} in next 12mo
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-indigo-100">
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">{((visionTarget as any).initiatives || []).length}</span> total initiatives
                    </div>
                    <div className="text-sm text-indigo-700">
                      <span className="font-semibold">{((visionTarget as any).initiatives || []).filter((i: any) => i.next12Months).length}</span> for next 12 months
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Enhanced KPI Modal */}
            <EnhancedKPIModal
              isOpen={showKPIModal}
              onClose={() => setShowKPIModal(false)}
              onSelectKPI={(kpi) => {
                const kpis = (visionTarget as any).kpis || []
                kpis.push(kpi)
                const updated = { ...visionTarget, kpis } as any
                setVisionTarget(updated)
                autoSave(updated, 'vision')
                setShowKPIModal(false)
              }}
              existingKPIs={(visionTarget as any).kpis || []}
              businessIndustry={business?.industry || null}
              businessRevenue={business?.current_revenue || '0-250K'}
              revenueStage={revenueStageInfo}
            />
            
            {/* Roadmap Browser Modal - Keep existing */}
            <div id="roadmap-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Strategic Roadmap - {revenueStageInfo.name} Stage & Below
                    </h3>
                    <button
                      onClick={() => document.getElementById('roadmap-modal')?.classList.add('hidden')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="space-y-6">
                    {Object.entries(ROADMAP_INITIATIVES[revenueStageInfo.name as keyof typeof ROADMAP_INITIATIVES] || ROADMAP_INITIATIVES.FOUNDATION).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {(items as string[]).map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                const initiatives = (visionTarget as any).initiatives || []
                                initiatives.push({ 
                                  title: item, 
                                  category: category, 
                                  next12Months: false 
                                })
                                const updated = { ...visionTarget, initiatives } as any
                                setVisionTarget(updated)
                                autoSave(updated, 'vision')
                              }}
                              className="text-left p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition text-sm"
                            >
                              <div className="flex items-start gap-2">
                                <Plus className="h-4 w-4 text-indigo-600 mt-0.5" />
                                <span>{item}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Annual Plan Tab - Keep existing */}
        {activeTab === 'annual' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{currentYear} Annual Targets</h2>
              
              {/* Financial Targets */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Targets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Revenue Target
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={annualTarget.revenue_target || ''}
                          onChange={(e) => {
                            const updated = { ...annualTarget, revenue_target: parseFloat(e.target.value) || 0 }
                            setAnnualTarget(updated)
                            autoSave(updated, 'annual')
                          }}
                          placeholder="1000000"
                          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profit Target (%)
                      </label>
                      <input
                        type="number"
                        value={annualTarget.profit_target || ''}
                        onChange={(e) => {
                          const updated = { ...annualTarget, profit_target: parseFloat(e.target.value) || 0 }
                          setAnnualTarget(updated)
                          autoSave(updated, 'annual')
                        }}
                        placeholder="15"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cash Reserve (months)
                      </label>
                      <input
                        type="number"
                        value={annualTarget.cash_target || ''}
                        onChange={(e) => {
                          const updated = { ...annualTarget, cash_target: parseFloat(e.target.value) || 0 }
                          setAnnualTarget(updated)
                          autoSave(updated, 'annual')
                        }}
                        placeholder="3"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Strategic Initiatives */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Initiatives</h3>
                  <div className="space-y-4">
                    {['Attract', 'Convert', 'Deliver', 'Finance'].map((engine) => (
                      <div key={engine} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">{engine} Engine</h4>
                        <textarea
                          placeholder={`Key initiatives for ${engine}...`}
                          rows={2}
                          value={(annualTarget.strategic_initiatives as any)?.[engine.toLowerCase()] || ''}
                          onChange={(e) => {
                            const initiatives = annualTarget.strategic_initiatives || {}
                            const updated = {
                              ...annualTarget,
                              strategic_initiatives: {
                                ...initiatives,
                                [engine.toLowerCase()]: e.target.value
                              }
                            }
                            setAnnualTarget(updated)
                            autoSave(updated, 'annual')
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Quarterly Milestones */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Milestones</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((quarter) => (
                      <div key={quarter} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Q{quarter}</h4>
                        <textarea
                          placeholder="Key milestones..."
                          rows={3}
                          value={(annualTarget.other_metrics as any)?.[`q${quarter}_milestones`] || ''}
                          onChange={(e) => {
                            const metrics = annualTarget.other_metrics || {}
                            const updated = {
                              ...annualTarget,
                              other_metrics: {
                                ...metrics,
                                [`q${quarter}_milestones`]: e.target.value
                              }
                            }
                            setAnnualTarget(updated)
                            autoSave(updated, 'annual')
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quarterly Rocks Tab - Keep existing */}
        {activeTab === 'quarterly' && (
          <div className="space-y-6">
            {/* Current Quarter Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Q{currentQuarter} {currentYear} Rocks
                  </h2>
                  <p className="text-gray-600 mt-1">Focus on 3-5 most important priorities</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Days Remaining</div>
                  <div className="text-2xl font-bold text-gray-900">{daysRemaining}</div>
                  <div className="text-xs text-gray-500">Until quarter end</div>
                </div>
              </div>
              
              {/* Rocks List */}
              <div className="space-y-4">
                {quarterlyRocks.map((rock, index) => (
                  <div key={rock.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={rock.title}
                          onChange={(e) => {
                            const updated = { ...rock, title: e.target.value }
                            setQuarterlyRocks(prev =>
                              prev.map(r => r.id === rock.id ? updated : r)
                            )
                            autoSave(updated, 'rock')
                          }}
                          placeholder="What needs to be done?"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={rock.owner || ''}
                            onChange={(e) => {
                              const updated = { ...rock, owner: e.target.value }
                              setQuarterlyRocks(prev =>
                                prev.map(r => r.id === rock.id ? updated : r)
                              )
                              autoSave(updated, 'rock')
                            }}
                            placeholder="Owner"
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                          
                          <select
                            value={rock.status}
                            onChange={(e) => {
                              const updated = { ...rock, status: e.target.value }
                              setQuarterlyRocks(prev =>
                                prev.map(r => r.id === rock.id ? updated : r)
                              )
                              autoSave(updated, 'rock')
                            }}
                            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${STATUS_COLORS[rock.status as keyof typeof STATUS_COLORS]}`}
                          >
                            <option value="On Track">On Track</option>
                            <option value="At Risk">At Risk</option>
                            <option value="Complete">Complete</option>
                            <option value="Missed">Missed</option>
                          </select>
                          
                          <select
                            value={rock.related_engine || ''}
                            onChange={(e) => {
                              const updated = { ...rock, related_engine: e.target.value || null }
                              setQuarterlyRocks(prev =>
                                prev.map(r => r.id === rock.id ? updated : r)
                              )
                              autoSave(updated, 'rock')
                            }}
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select Engine</option>
                            <option value="Attract">Attract</option>
                            <option value="Convert">Convert</option>
                            <option value="Deliver">Deliver</option>
                            <option value="Finance">Finance</option>
                          </select>
                        </div>
                        
                        <input
                          type="text"
                          value={rock.success_metric || ''}
                          onChange={(e) => {
                            const updated = { ...rock, success_metric: e.target.value }
                            setQuarterlyRocks(prev =>
                              prev.map(r => r.id === rock.id ? updated : r)
                            )
                            autoSave(updated, 'rock')
                          }}
                          placeholder="How will we measure success?"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{rock.progress_percentage || 0}%</span>
                          </div>
                          <div className="relative">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${rock.progress_percentage || 0}%` }}
                              />
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={rock.progress_percentage || 0}
                              onChange={(e) => {
                                const updated = { ...rock, progress_percentage: parseInt(e.target.value) }
                                setQuarterlyRocks(prev =>
                                  prev.map(r => r.id === rock.id ? updated : r)
                                )
                                autoSave(updated, 'rock')
                              }}
                              className="absolute inset-0 w-full opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteRock(rock.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Add Rock Button */}
                {quarterlyRocks.length < 5 && (
                  <button
                    onClick={() => {
                      const newRock = {
                        title: '',
                        owner: '',
                        status: 'On Track',
                        progress_percentage: 0,
                        success_metric: ''
                      }
                      saveRock(newRock)
                    }}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add Rock ({5 - quarterlyRocks.length} remaining)
                  </button>
                )}
                
                {quarterlyRocks.length >= 5 && (
                  <div className="text-center py-3 bg-gray-50 rounded-lg text-gray-600">
                    Maximum of 5 rocks reached - maintain focus!
                  </div>
                )}
              </div>
            </div>
            
            {/* Smart Suggestions Panel */}
            <div className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium text-gray-900">Smart Suggestions</span>
                  <span className="text-sm text-gray-500">Based on your stage and assessment</span>
                </div>
                {showSuggestions ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </button>
              
              {showSuggestions && (
                <div className="px-6 pb-6 space-y-3">
                  {smartSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                      <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-indigo-900">{suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}