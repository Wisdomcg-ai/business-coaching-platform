'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronRight, ChevronLeft, Save, Target, TrendingUp, Calendar, Users, 
  CheckCircle, AlertCircle, Clock, Plus, Trash2, DollarSign, Calculator,
  BarChart, ArrowRight, Edit2, X, Check, Rocket, Trophy, Timer,
  MapPin, Filter, User, Flag, ChevronDown, ChevronUp, Percent,
  Building2, Package, Heart, Brain, Settings, Eye, EyeOff, Copy,
  AlertTriangle, Info, GripVertical, ListChecks, Loader2, WifiOff
} from 'lucide-react'
import ProfitCalculator from '@/components/ProfitCalculator'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'
import { RealtimeChannel } from '@supabase/supabase-js'

// Type definitions
type DbBusinessProfile = Database['public']['Tables']['business_profiles']['Row']
type DbStrategicGoal = Database['public']['Tables']['strategic_goals']['Row']
type DbKPI = Database['public']['Tables']['kpis']['Row']
type DbStrategicInitiative = Database['public']['Tables']['strategic_initiatives']['Row']
type DbNinetyDaySprint = Database['public']['Tables']['ninety_day_sprints']['Row']
type DbSprintMilestone = Database['public']['Tables']['sprint_milestones']['Row']

interface BHAG {
  statement: string
  metrics: string
  deadline: string
}

interface ThreeYearGoal {
  id: string
  category: 'revenue' | 'profit' | 'customers' | 'operations' | 'team' | 'market'
  metric: string
  currentValue: number
  year1Target: number
  year2Target: number
  year3Target: number
  unit: '$' | '%' | '#'
}

interface SelectedKPI {
  id: string
  name: string
  category: string
  currentValue: number
  year1Target: number
  year2Target: number
  year3Target: number
  unit: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
}

interface StrategicItem {
  id: string
  title: string
  category: 'attract' | 'convert' | 'deliver' | 'delight' | 'systems' | 'people' | 'profit' | 'strategy'
  isFromRoadmap: boolean
  customSource?: string
  selected: boolean
  quarterAssignment?: 'q1' | 'q2' | 'q3' | 'q4' | null
}

interface NinetyDayItem {
  id: string
  title: string
  owner: string
  dueDate: string
  status: 'not-started' | 'in-progress' | 'completed'
  milestones: {
    id: string
    description: string
    completed: boolean
    dueDate: string
  }[]
}

// Revenue Roadmap Data
const REVENUE_ROADMAP = {
  foundation: {
    range: '$0-250K',
    items: [
      { title: 'Define core service/product offering', category: 'strategy' },
      { title: 'Set up basic website and online presence', category: 'attract' },
      { title: 'Create sales process and pricing', category: 'convert' },
      { title: 'Document core delivery process', category: 'deliver' },
      { title: 'Set up accounting and invoicing', category: 'systems' },
      { title: 'Get first 10 customers', category: 'convert' },
      { title: 'Build customer feedback system', category: 'delight' }
    ]
  },
  growth: {
    range: '$250K-1M',
    items: [
      { title: 'Hire first key employee', category: 'people' },
      { title: 'Implement CRM system', category: 'systems' },
      { title: 'Develop marketing strategy', category: 'attract' },
      { title: 'Create customer onboarding process', category: 'deliver' },
      { title: 'Build referral program', category: 'delight' },
      { title: 'Establish KPI dashboard', category: 'profit' },
      { title: 'Develop sales playbook', category: 'convert' },
      { title: 'Create employee training program', category: 'people' }
    ]
  },
  scale: {
    range: '$1M-5M',
    items: [
      { title: 'Build management team', category: 'people' },
      { title: 'Expand to new market segment', category: 'strategy' },
      { title: 'Launch second product/service line', category: 'strategy' },
      { title: 'Implement quality management system', category: 'deliver' },
      { title: 'Build strategic partnerships', category: 'strategy' },
      { title: 'Create customer success program', category: 'delight' },
      { title: 'Upgrade technology stack', category: 'systems' },
      { title: 'Develop predictable sales engine', category: 'convert' }
    ]
  },
  optimize: {
    range: '$5M+',
    items: [
      { title: 'International expansion planning', category: 'strategy' },
      { title: 'Build acquisition strategy', category: 'strategy' },
      { title: 'Create innovation lab', category: 'strategy' },
      { title: 'Implement ERP system', category: 'systems' },
      { title: 'Develop franchise/licensing model', category: 'strategy' },
      { title: 'Build corporate university', category: 'people' },
      { title: 'Establish board of advisors', category: 'strategy' },
      { title: 'Create succession planning', category: 'people' }
    ]
  }
}

const CATEGORY_CONFIG = {
  attract: { label: 'Attract (Marketing)', icon: Target, color: 'bg-blue-100 text-blue-700' },
  convert: { label: 'Convert (Sales)', icon: TrendingUp, color: 'bg-green-100 text-green-700' },
  deliver: { label: 'Deliver (Operations)', icon: Package, color: 'bg-purple-100 text-purple-700' },
  delight: { label: 'Delight (Customer)', icon: Heart, color: 'bg-pink-100 text-pink-700' },
  systems: { label: 'Systems & Process', icon: Settings, color: 'bg-gray-100 text-gray-700' },
  people: { label: 'People & Culture', icon: Users, color: 'bg-orange-100 text-orange-700' },
  profit: { label: 'Profit & Finance', icon: DollarSign, color: 'bg-yellow-100 text-yellow-700' },
  strategy: { label: 'Strategy & Growth', icon: Brain, color: 'bg-indigo-100 text-indigo-700' }
}

// Predefined KPI Options
const KPI_OPTIONS = {
  financial: [
    { id: 'revenue-growth', name: 'Revenue Growth Rate', unit: '%', frequency: 'monthly' },
    { id: 'gross-margin', name: 'Gross Margin', unit: '%', frequency: 'monthly' },
    { id: 'net-margin', name: 'Net Margin', unit: '%', frequency: 'monthly' },
    { id: 'cash-flow', name: 'Cash Flow', unit: '$', frequency: 'monthly' },
    { id: 'arr', name: 'Annual Recurring Revenue', unit: '$', frequency: 'monthly' },
    { id: 'ltv', name: 'Customer Lifetime Value', unit: '$', frequency: 'quarterly' }
  ],
  sales: [
    { id: 'leads', name: 'Monthly Leads', unit: '#', frequency: 'monthly' },
    { id: 'conversion-rate', name: 'Conversion Rate', unit: '%', frequency: 'monthly' },
    { id: 'cac', name: 'Customer Acquisition Cost', unit: '$', frequency: 'monthly' },
    { id: 'sales-cycle', name: 'Sales Cycle Length', unit: 'days', frequency: 'monthly' },
    { id: 'pipeline-value', name: 'Pipeline Value', unit: '$', frequency: 'weekly' },
    { id: 'win-rate', name: 'Win Rate', unit: '%', frequency: 'monthly' }
  ],
  operations: [
    { id: 'customer-satisfaction', name: 'Customer Satisfaction', unit: '%', frequency: 'quarterly' },
    { id: 'nps', name: 'Net Promoter Score', unit: '#', frequency: 'quarterly' },
    { id: 'retention-rate', name: 'Customer Retention Rate', unit: '%', frequency: 'monthly' },
    { id: 'churn-rate', name: 'Churn Rate', unit: '%', frequency: 'monthly' },
    { id: 'delivery-time', name: 'Average Delivery Time', unit: 'days', frequency: 'weekly' },
    { id: 'quality-score', name: 'Quality Score', unit: '%', frequency: 'weekly' }
  ],
  people: [
    { id: 'employee-satisfaction', name: 'Employee Satisfaction', unit: '%', frequency: 'quarterly' },
    { id: 'employee-retention', name: 'Employee Retention', unit: '%', frequency: 'quarterly' },
    { id: 'productivity', name: 'Productivity Index', unit: '#', frequency: 'monthly' },
    { id: 'training-hours', name: 'Training Hours', unit: 'hours', frequency: 'monthly' },
    { id: 'team-size', name: 'Team Size', unit: '#', frequency: 'monthly' },
    { id: 'revenue-per-employee', name: 'Revenue per Employee', unit: '$', frequency: 'quarterly' }
  ]
}

export default function GoalsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Core states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [showProfitCalculator, setShowProfitCalculator] = useState(false)
  const [isKPIModalOpen, setIsKPIModalOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null)
  
  // Data states
  const [bhag, setBhag] = useState<BHAG>({
    statement: '',
    metrics: '',
    deadline: '10 years'
  })
  
  const [threeYearGoals, setThreeYearGoals] = useState<ThreeYearGoal[]>([
    {
      id: 'revenue',
      category: 'revenue',
      metric: 'Annual Revenue',
      currentValue: 500000,
      year1Target: 750000,
      year2Target: 1500000,
      year3Target: 3000000,
      unit: '$'
    },
    {
      id: 'profit',
      category: 'profit',
      metric: 'Net Profit',
      currentValue: 50000,
      year1Target: 112500,
      year2Target: 300000,
      year3Target: 750000,
      unit: '$'
    }
  ])
  
  const [selectedKPIs, setSelectedKPIs] = useState<SelectedKPI[]>([])
  const [strategicItems, setStrategicItems] = useState<StrategicItem[]>([])
  const [ninetyDayItems, setNinetyDayItems] = useState<NinetyDayItem[]>([])
  const [currentRevenue, setCurrentRevenue] = useState(500000)

  // Initialize and load data on mount
  useEffect(() => {
    initializeAndLoadData()
    
    return () => {
      // Cleanup realtime subscription
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
      }
    }
  }, [])

  // Save data with debounce
  const saveToDatabase = useCallback(
    debounce(async () => {
      if (!businessProfileId) return
      setIsSaving(true)
      
      try {
        // Save strategic goals
        await supabase
          .from('strategic_goals')
          .upsert({
            business_profile_id: businessProfileId,
            bhag_statement: bhag.statement,
            bhag_metrics: bhag.metrics,
            bhag_deadline: bhag.deadline,
            three_year_goals: threeYearGoals
          }, { onConflict: 'business_profile_id' })
        
        // Save KPIs
        await Promise.all(selectedKPIs.map(kpi => 
          supabase
            .from('kpis')
            .upsert({
              business_profile_id: businessProfileId,
              kpi_id: kpi.id,
              name: kpi.name,
              category: kpi.category,
              current_value: kpi.currentValue,
              year1_target: kpi.year1Target,
              year2_target: kpi.year2Target,
              year3_target: kpi.year3Target,
              unit: kpi.unit,
              frequency: kpi.frequency
            }, { onConflict: 'business_profile_id,kpi_id' })
        ))
        
        // Save strategic initiatives
        await Promise.all(strategicItems.map((item, index) =>
          supabase
            .from('strategic_initiatives')
            .upsert({
              id: item.id.startsWith('roadmap-') || item.id.startsWith('custom-') 
                ? undefined : item.id,
              business_profile_id: businessProfileId,
              title: item.title,
              category: item.category,
              is_from_roadmap: item.isFromRoadmap,
              custom_source: item.customSource || null,
              selected: item.selected,
              quarter_assignment: item.quarterAssignment,
              order_index: index
            })
        ))
        
        // Save ninety day sprints and milestones
        for (const sprint of ninetyDayItems) {
          const { data: sprintData } = await supabase
            .from('ninety_day_sprints')
            .upsert({
              id: sprint.id.startsWith('90day-') ? undefined : sprint.id,
              business_profile_id: businessProfileId,
              title: sprint.title,
              owner: sprint.owner || null,
              due_date: sprint.dueDate,
              status: sprint.status,
              quarter: 'q1',
              year: new Date().getFullYear()
            })
            .select()
            .single()
          
          if (sprintData && sprint.milestones.length > 0) {
            await Promise.all(sprint.milestones.map((milestone, index) =>
              supabase
                .from('sprint_milestones')
                .upsert({
                  sprint_id: sprintData.id,
                  description: milestone.description,
                  completed: milestone.completed,
                  due_date: milestone.dueDate,
                  order_index: index
                })
            ))
          }
        }
        
        // Update business profile
        await supabase
          .from('business_profiles')
          .update({ current_revenue: currentRevenue })
          .eq('id', businessProfileId)
          
      } catch (err) {
        console.error('Error saving data:', err)
        setError('Failed to save data. Please try again.')
      } finally {
        setIsSaving(false)
      }
    }, 1000),
    [businessProfileId, bhag, threeYearGoals, selectedKPIs, strategicItems, ninetyDayItems, currentRevenue]
  )

  // Auto-save on changes
  useEffect(() => {
    if (businessProfileId && !isLoading) {
      saveToDatabase()
    }
  }, [bhag, threeYearGoals, selectedKPIs, strategicItems, ninetyDayItems, currentRevenue])

  async function initializeAndLoadData() {
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/auth/login')
        return
      }

      // Get or create business profile
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_or_create_business_profile')
      
      if (profileError || !profileData) {
        throw new Error('Failed to load business profile')
      }
      
      setBusinessProfileId(profileData)

      // Load business profile details
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', profileData)
        .single()
      
      if (profile) {
        setCurrentRevenue(profile.current_revenue || 500000)
      }

      // Load strategic goals
      const { data: goals } = await supabase
        .from('strategic_goals')
        .select('*')
        .eq('business_profile_id', profileData)
        .single()
      
      if (goals) {
        setBhag({
          statement: goals.bhag_statement || '',
          metrics: goals.bhag_metrics || '',
          deadline: goals.bhag_deadline || '10 years'
        })
        
        if (goals.three_year_goals && Array.isArray(goals.three_year_goals)) {
          setThreeYearGoals(goals.three_year_goals as ThreeYearGoal[])
        }
      }

      // Load KPIs
      const { data: kpis } = await supabase
        .from('kpis')
        .select('*')
        .eq('business_profile_id', profileData)
        .order('created_at', { ascending: true })
      
      if (kpis) {
        setSelectedKPIs(kpis.map(kpi => ({
          id: kpi.kpi_id,
          name: kpi.name,
          category: kpi.category,
          currentValue: kpi.current_value,
          year1Target: kpi.year1_target,
          year2Target: kpi.year2_target,
          year3Target: kpi.year3_target,
          unit: kpi.unit,
          frequency: kpi.frequency as any
        })))
      }

      // Load strategic initiatives
      const { data: initiatives } = await supabase
        .from('strategic_initiatives')
        .select('*')
        .eq('business_profile_id', profileData)
        .order('order_index', { ascending: true })
      
      if (initiatives && initiatives.length > 0) {
        setStrategicItems(initiatives.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category as any,
          isFromRoadmap: item.is_from_roadmap,
          customSource: item.custom_source || undefined,
          selected: item.selected,
          quarterAssignment: item.quarter_assignment as any
        })))
      } else {
        // Initialize with roadmap items if none exist
        initializeStrategicItems()
      }

      // Load ninety day sprints with milestones
      const currentYear = new Date().getFullYear()
      const { data: sprints } = await supabase
        .from('ninety_day_sprints')
        .select(`
          *,
          sprint_milestones (*)
        `)
        .eq('business_profile_id', profileData)
        .eq('year', currentYear)
        .eq('quarter', 'q1')
        .order('created_at', { ascending: true })
      
      if (sprints) {
        setNinetyDayItems(sprints.map(sprint => ({
          id: sprint.id,
          title: sprint.title,
          owner: sprint.owner || '',
          dueDate: sprint.due_date,
          status: sprint.status as any,
          milestones: (sprint.sprint_milestones || []).map(m => ({
            id: m.id,
            description: m.description,
            completed: m.completed,
            dueDate: m.due_date
          }))
        })))
      }

      // Setup realtime subscriptions
      setupRealtimeSubscriptions(profileData)

    } catch (err) {
      console.error('Error initializing data:', err)
      setError('Failed to load data. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  function setupRealtimeSubscriptions(profileId: string) {
    const channel = supabase.channel(`business-${profileId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'strategic_goals',
          filter: `business_profile_id=eq.${profileId}`
        },
        (payload) => {
          // Handle real-time updates for strategic goals
          if (payload.eventType === 'UPDATE') {
            const updatedGoals = payload.new as DbStrategicGoal
            setBhag({
              statement: updatedGoals.bhag_statement || '',
              metrics: updatedGoals.bhag_metrics || '',
              deadline: updatedGoals.bhag_deadline || '10 years'
            })
            if (updatedGoals.three_year_goals) {
              setThreeYearGoals(updatedGoals.three_year_goals as ThreeYearGoal[])
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'strategic_initiatives',
          filter: `business_profile_id=eq.${profileId}`
        },
        async () => {
          // Reload strategic initiatives on changes
          const { data: initiatives } = await supabase
            .from('strategic_initiatives')
            .select('*')
            .eq('business_profile_id', profileId)
            .order('order_index', { ascending: true })
          
          if (initiatives) {
            setStrategicItems(initiatives.map(item => ({
              id: item.id,
              title: item.title,
              category: item.category as any,
              isFromRoadmap: item.is_from_roadmap,
              customSource: item.custom_source || undefined,
              selected: item.selected,
              quarterAssignment: item.quarter_assignment as any
            })))
          }
        }
      )
      .subscribe()
    
    setRealtimeChannel(channel)
  }

  // Utility function for debouncing
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  const initializeStrategicItems = () => {
    // Don't reinitialize if items already exist
    if (strategicItems.length > 0) return
    
    const revenueStage = currentRevenue < 250000 ? 'foundation' :
                        currentRevenue < 1000000 ? 'growth' :
                        currentRevenue < 5000000 ? 'scale' : 'optimize'
    
    const roadmapItems = REVENUE_ROADMAP[revenueStage].items.map((item, index) => ({
      id: `roadmap-${revenueStage}-${index}`,
      title: item.title,
      category: item.category as any,
      isFromRoadmap: true,
      selected: false,
      quarterAssignment: null
    }))
    
    setStrategicItems(roadmapItems)
  }

  const handleProfitCalculatorComplete = (data: any) => {
    setThreeYearGoals(prev => {
      const updated = [...prev]
      const revenueGoal = updated.find(g => g.id === 'revenue')
      const profitGoal = updated.find(g => g.id === 'profit')
      
      if (revenueGoal) {
        revenueGoal.currentValue = data.currentRevenue || currentRevenue
        revenueGoal.year1Target = data.year1Revenue || 750000
        revenueGoal.year2Target = data.year2Revenue || 1500000
        revenueGoal.year3Target = data.year3Revenue || 3000000
      }
      
      if (profitGoal) {
        profitGoal.currentValue = data.currentProfit || Math.round(currentRevenue * 0.1)
        profitGoal.year1Target = data.year1Profit || 112500
        profitGoal.year2Target = data.year2Profit || 300000
        profitGoal.year3Target = data.year3Profit || 750000
      }
      
      if (data.currentRevenue) {
        setCurrentRevenue(data.currentRevenue)
      }
      
      return updated
    })
    
    setShowProfitCalculator(false)
  }

  const toggleStrategicItem = (itemId: string) => {
    setStrategicItems(prev => {
      const selectedCount = prev.filter(item => item.selected).length
      const item = prev.find(i => i.id === itemId)
      
      if (!item?.selected && selectedCount >= 12) {
        alert('Maximum 12 items can be selected for the annual plan')
        return prev
      }
      
      return prev.map(i => 
        i.id === itemId ? { ...i, selected: !i.selected } : i
      )
    })
  }

  const assignToQuarter = (itemId: string, quarter: 'q1' | 'q2' | 'q3' | 'q4' | null) => {
    setStrategicItems(prev => {
      const quarterCount = prev.filter(i => i.quarterAssignment === quarter).length
      
      if (quarter && quarterCount >= 5) {
        alert(`Maximum 5 initiatives per quarter. Q${quarter.slice(1)} is at capacity.`)
        return prev
      }
      
      return prev.map(i => 
        i.id === itemId ? { ...i, quarterAssignment: quarter } : i
      )
    })
  }

  const addCustomStrategicItem = (title: string, category: string) => {
    const newItem: StrategicItem = {
      id: `custom-${Date.now()}`,
      title,
      category: category as any,
      isFromRoadmap: false,
      customSource: 'User Added',
      selected: false,
      quarterAssignment: null
    }
    setStrategicItems(prev => [...prev, newItem])
  }

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return <BHAGStep bhag={bhag} setBhag={setBhag} />
      
      case 2:
        return (
          <GoalsKPIsStep 
            goals={threeYearGoals}
            setGoals={setThreeYearGoals}
            kpis={selectedKPIs}
            setKpis={setSelectedKPIs}
            onOpenKPIModal={() => setIsKPIModalOpen(true)}
            onOpenProfitCalculator={() => setShowProfitCalculator(true)}
          />
        )
      
      case 3:
        return (
          <StrategicToDoStep
            items={strategicItems}
            onToggleItem={toggleStrategicItem}
            onAddCustom={addCustomStrategicItem}
            expandedCategories={expandedCategories}
            setExpandedCategories={setExpandedCategories}
            currentRevenue={currentRevenue}
          />
        )
      
      case 4:
        return (
          <AnnualPlanStep
            goals={threeYearGoals}
            kpis={selectedKPIs}
            strategicItems={strategicItems.filter(i => i.selected)}
            onAssignQuarter={assignToQuarter}
          />
        )
      
      case 5:
        return (
          <NinetyDayStep
            goals={threeYearGoals}
            kpis={selectedKPIs}
            quarterItems={strategicItems.filter(i => i.quarterAssignment === 'q1')}
            ninetyDayItems={ninetyDayItems}
            setNinetyDayItems={setNinetyDayItems}
          />
        )
      
      default:
        return null
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading strategic planner...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
          <p className="mt-4 text-gray-900 font-semibold">Something went wrong</p>
          <p className="mt-2 text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Strategic Planning Wizard</h1>
            <div className="flex items-center space-x-4">
              {isSaving && (
                <div className="flex items-center text-gray-600">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </div>
              )}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Saved'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: '10yr BHAG', icon: Rocket },
              { num: 2, label: '3yr Goals & KPIs', icon: Target },
              { num: 3, label: 'Strategic To-Do', icon: ListChecks },
              { num: 4, label: 'Annual Plan', icon: Calendar },
              { num: 5, label: '90-Day Sprint', icon: Timer }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    currentStep === step.num 
                      ? 'bg-blue-100 text-blue-700' 
                      : currentStep > step.num 
                      ? 'text-green-600 hover:bg-gray-50' 
                      : 'text-gray-400'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                  <span className="font-medium">{step.label}</span>
                  {currentStep > step.num && <CheckCircle className="h-4 w-4" />}
                </button>
                {index < 4 && <ChevronRight className="h-5 w-5 text-gray-300 ml-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
            disabled={currentStep === 5}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showProfitCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Profit Calculator</h3>
                <button
                  onClick={() => setShowProfitCalculator(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <ProfitCalculator 
                onComplete={handleProfitCalculatorComplete}
                initialRevenue={currentRevenue}
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI Selection Modal */}
      {isKPIModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Select Key Performance Indicators</h3>
                <button
                  onClick={() => setIsKPIModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Select the KPIs you want to track. You can set targets for each KPI after selection.
                </p>
              </div>

              <div className="space-y-6">
                {Object.entries(KPI_OPTIONS).map(([category, kpis]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                      {category} KPIs
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {kpis.map((kpi) => (
                        <label key={kpi.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedKPIs.some(k => k.id === kpi.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedKPIs([...selectedKPIs, {
                                  ...kpi,
                                  category,
                                  currentValue: 0,
                                  year1Target: 0,
                                  year2Target: 0,
                                  year3Target: 0
                                }])
                              } else {
                                setSelectedKPIs(selectedKPIs.filter(k => k.id !== kpi.id))
                              }
                            }}
                            className="h-4 w-4 text-blue-600 mr-3"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{kpi.name}</p>
                            <p className="text-xs text-gray-500">{kpi.frequency} • {kpi.unit}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {selectedKPIs.length} KPIs selected
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsKPIModalOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsKPIModalOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Step Components (same as before, no changes needed)
function BHAGStep({ bhag, setBhag }: { bhag: BHAG; setBhag: (bhag: BHAG) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Rocket className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Define Your 10-Year BHAG</h2>
          <p className="text-gray-600">Big Hairy Audacious Goal - Your Moonshot Vision</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's your audacious 10-year vision?
            </label>
            <textarea
              value={bhag.statement}
              onChange={(e) => setBhag({ ...bhag, statement: e.target.value })}
              placeholder="e.g., Become the #1 sustainable construction company in Australia with $50M revenue and 200 happy team members"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How will you measure success?
            </label>
            <input
              type="text"
              value={bhag.metrics}
              onChange={(e) => setBhag({ ...bhag, metrics: e.target.value })}
              placeholder="e.g., $50M revenue, 200 employees, 30% market share, 1000 5-star reviews"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">BHAG Criteria Checklist:</h3>
            <div className="space-y-2">
              {[
                'Clear and compelling vision',
                'Requires significant effort and growth',
                'Has specific measurable outcomes',
                'Aligns with your core purpose',
                'Excites and energizes your team'
              ].map((criterion, index) => (
                <label key={index} className="flex items-center text-blue-800">
                  <input type="checkbox" className="mr-2 text-blue-600" />
                  <span className="text-sm">{criterion}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add remaining step components (GoalsKPIsStep, StrategicToDoStep, AnnualPlanStep, NinetyDayStep)
// These components remain the same as in your original code
// I'm including them here for completeness

function GoalsKPIsStep({ 
  goals, 
  setGoals, 
  kpis, 
  setKpis, 
  onOpenKPIModal, 
  onOpenProfitCalculator 
}: any) {
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)

  const addGoal = () => {
    const newGoal: ThreeYearGoal = {
      id: `goal-${Date.now()}`,
      category: 'operations',
      metric: '',
      currentValue: 0,
      year1Target: 0,
      year2Target: 0,
      year3Target: 0,
      unit: '#'
    }
    setGoals([...goals, newGoal])
    setEditingGoalId(newGoal.id)
  }

  const updateGoal = (id: string, updates: Partial<ThreeYearGoal>) => {
    setGoals(goals.map((g: ThreeYearGoal) => 
      g.id === id ? { ...g, ...updates } : g
    ))
  }

  const deleteGoal = (id: string) => {
    if (id === 'revenue' || id === 'profit') {
      alert('Revenue and Profit goals cannot be deleted')
      return
    }
    setGoals(goals.filter((g: ThreeYearGoal) => g.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">3-Year Financial Goals</h3>
          <button
            onClick={onOpenProfitCalculator}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Calculator className="h-5 w-5 mr-2" />
            Open Profit Calculator
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Metric</th>
                <th className="text-center py-3 px-2">Current</th>
                <th className="text-center py-3 px-2">Year 1</th>
                <th className="text-center py-3 px-2">Year 2</th>
                <th className="text-center py-3 px-2">Year 3</th>
                <th className="text-center py-3 px-2">3yr Growth</th>
              </tr>
            </thead>
            <tbody>
              {goals.filter((g: ThreeYearGoal) => g.category === 'revenue' || g.category === 'profit').map((goal: ThreeYearGoal) => (
                <tr key={goal.id} className="border-b">
                  <td className="py-3 px-2 font-medium">{goal.metric}</td>
                  <td className="py-3 px-2 text-center">
                    ${goal.currentValue.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-center">
                    ${goal.year1Target.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-center">
                    ${goal.year2Target.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-center">
                    ${goal.year3Target.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-center font-semibold text-green-600">
                    {Math.round(((goal.year3Target - goal.currentValue) / goal.currentValue) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <Info className="h-4 w-4 inline mr-2" />
            Use the Profit Calculator to model different scenarios and set realistic financial targets
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Additional 3-Year Goals</h3>
          <button
            onClick={addGoal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Goal
          </button>
        </div>

        {goals.filter((g: ThreeYearGoal) => g.category !== 'revenue' && g.category !== 'profit').length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No additional goals yet</p>
            <p className="text-sm mt-1">Add goals for customers, operations, team growth, etc.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.filter((g: ThreeYearGoal) => g.category !== 'revenue' && g.category !== 'profit').map((goal: ThreeYearGoal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                {editingGoalId === goal.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={goal.metric}
                        onChange={(e) => updateGoal(goal.id, { metric: e.target.value })}
                        placeholder="Goal metric (e.g., Customer Count)"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <select
                        value={goal.unit}
                        onChange={(e) => updateGoal(goal.id, { unit: e.target.value as any })}
                        className="px-3 py-2 border rounded-lg"
                      >
                        <option value="#">Number (#)</option>
                        <option value="%">Percentage (%)</option>
                        <option value="$">Dollar ($)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <input
                        type="number"
                        value={goal.currentValue}
                        onChange={(e) => updateGoal(goal.id, { currentValue: Number(e.target.value) })}
                        placeholder="Current"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={goal.year1Target}
                        onChange={(e) => updateGoal(goal.id, { year1Target: Number(e.target.value) })}
                        placeholder="Year 1"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={goal.year2Target}
                        onChange={(e) => updateGoal(goal.id, { year2Target: Number(e.target.value) })}
                        placeholder="Year 2"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={goal.year3Target}
                        onChange={(e) => updateGoal(goal.id, { year3Target: Number(e.target.value) })}
                        placeholder="Year 3"
                        className="px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingGoalId(null)}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{goal.metric || 'Unnamed Goal'}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        Current: {goal.unit === '$' ? '$' : ''}{goal.currentValue}{goal.unit === '%' ? '%' : goal.unit === '#' ? '' : ''} → 
                        Year 3: {goal.unit === '$' ? '$' : ''}{goal.year3Target}{goal.unit === '%' ? '%' : goal.unit === '#' ? '' : ''}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingGoalId(goal.id)}
                        className="p-1 text-gray-600 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Key Performance Indicators (KPIs)</h3>
          <button
            onClick={onOpenKPIModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Select KPIs
          </button>
        </div>

        {kpis.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No KPIs selected yet</p>
            <p className="text-sm mt-1">Choose metrics to track your progress</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">KPI</th>
                  <th className="text-center py-2 px-2">Frequency</th>
                  <th className="text-center py-2 px-2">Current</th>
                  <th className="text-center py-2 px-2">Year 1</th>
                  <th className="text-center py-2 px-2">Year 2</th>
                  <th className="text-center py-2 px-2">Year 3</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((kpi: SelectedKPI, index: number) => (
                  <tr key={kpi.id} className="border-b">
                    <td className="py-2 px-2 font-medium">{kpi.name}</td>
                    <td className="py-2 px-2 text-center capitalize">{kpi.frequency}</td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={kpi.currentValue}
                        onChange={(e) => {
                          const updated = [...kpis]
                          updated[index].currentValue = Number(e.target.value)
                          setKpis(updated)
                        }}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={kpi.year1Target}
                        onChange={(e) => {
                          const updated = [...kpis]
                          updated[index].year1Target = Number(e.target.value)
                          setKpis(updated)
                        }}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={kpi.year2Target}
                        onChange={(e) => {
                          const updated = [...kpis]
                          updated[index].year2Target = Number(e.target.value)
                          setKpis(updated)
                        }}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={kpi.year3Target}
                        onChange={(e) => {
                          const updated = [...kpis]
                          updated[index].year3Target = Number(e.target.value)
                          setKpis(updated)
                        }}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => setKpis(kpis.filter((_: any, i: number) => i !== index))}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StrategicToDoStep({ items, onToggleItem, onAddCustom, expandedCategories, setExpandedCategories, currentRevenue }: any) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', category: 'strategy' })

  const selectedCount = items.filter((i: StrategicItem) => i.selected).length
  const revenueStage = currentRevenue < 250000 ? 'foundation' :
                      currentRevenue < 1000000 ? 'growth' :
                      currentRevenue < 5000000 ? 'scale' : 'optimize'

  const groupedItems = items.reduce((acc: any, item: StrategicItem) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Strategic To-Do List</h3>
            <p className="text-sm text-gray-600 mt-1">
              Revenue Stage: <span className="font-semibold">{REVENUE_ROADMAP[revenueStage].range}</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg ${selectedCount > 12 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              <span className="font-semibold">{selectedCount}/12</span> selected for annual plan
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Custom
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <Info className="h-4 w-4 inline mr-2" />
            Select up to 12 strategic initiatives to focus on over the next 12 months. 
            Items with <MapPin className="h-4 w-4 inline mx-1 text-blue-600" /> are revenue roadmap recommendations for your stage.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {Object.entries(groupedItems).map(([category, categoryItems]: [string, any]) => {
          const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
          const Icon = config.icon
          const isExpanded = expandedCategories.has(category)
          
          return (
            <div key={category} className="border-b last:border-b-0">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${config.color}`}>
                    <Icon className="h-4 w-4 mr-2" />
                    {config.label}
                  </span>
                  <span className="text-sm text-gray-600">
                    {categoryItems.filter((i: StrategicItem) => i.selected).length}/{categoryItems.length} selected
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </button>

              {isExpanded && (
                <div className="px-6 pb-4">
                  <div className="space-y-2">
                    {categoryItems.map((item: StrategicItem) => (
                      <label
                        key={item.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          item.selected 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => onToggleItem(item.id)}
                          className="h-5 w-5 text-blue-600 mr-3"
                        />
                        <span className="flex-1 text-sm">{item.title}</span>
                        {item.isFromRoadmap && (
                          <MapPin className="h-4 w-4 text-blue-600 ml-2" title="Revenue Roadmap Recommendation" />
                        )}
                        {item.customSource && (
                          <span className="text-xs text-gray-500 ml-2">{item.customSource}</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add Custom Strategic Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initiative Title
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Implement new CRM system"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newItem.title) {
                    onAddCustom(newItem.title, newItem.category)
                    setNewItem({ title: '', category: 'strategy' })
                    setShowAddModal(false)
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AnnualPlanStep({ goals, kpis, strategicItems, onAssignQuarter }: any) {
  const quarters = ['q1', 'q2', 'q3', 'q4']
  
  const getQuarterItems = (quarter: string) => 
    strategicItems.filter((item: StrategicItem) => item.quarterAssignment === quarter)
  
  const getUnassignedItems = () => 
    strategicItems.filter((item: StrategicItem) => !item.quarterAssignment)

  const revenueGoal = goals.find((g: ThreeYearGoal) => g.id === 'revenue')
  const profitGoal = goals.find((g: ThreeYearGoal) => g.id === 'profit')

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Year 1 Goals Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Revenue Target</p>
            <p className="text-2xl font-bold">${(revenueGoal?.year1Target || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Profit Target</p>
            <p className="text-2xl font-bold">${(profitGoal?.year1Target || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Key Initiatives</p>
            <p className="text-2xl font-bold">{strategicItems.length}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">KPIs Tracked</p>
            <p className="text-2xl font-bold">{kpis.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6">Quarterly Initiative Distribution</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {quarters.map((quarter) => {
            const quarterNum = quarter.slice(1)
            const quarterItems = getQuarterItems(quarter)
            const isFull = quarterItems.length >= 5
            
            return (
              <div key={quarter} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Q{quarterNum}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {quarterItems.length}/5
                  </span>
                </div>
                
                <div className="mb-4 p-3 bg-gray-50 rounded text-xs">
                  <p className="text-gray-600">Revenue: ${Math.round((revenueGoal?.year1Target || 0) * (parseInt(quarterNum) / 4)).toLocaleString()}</p>
                  <p className="text-gray-600">Profit: ${Math.round((profitGoal?.year1Target || 0) * (parseInt(quarterNum) / 4)).toLocaleString()}</p>
                </div>
                
                <div className="space-y-2 min-h-[200px]">
                  {quarterItems.map((item: StrategicItem) => (
                    <div key={item.id} className="p-2 bg-blue-50 rounded text-sm flex items-center justify-between">
                      <span className="flex-1 truncate">{item.title}</span>
                      <button
                        onClick={() => onAssignQuarter(item.id, null)}
                        className="ml-2 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {quarterItems.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-8">
                      Drag initiatives here or click below
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {getUnassignedItems().length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-3">Unassigned Initiatives</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getUnassignedItems().map((item: StrategicItem) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm flex-1">{item.title}</span>
                  <div className="flex space-x-1">
                    {quarters.map(q => (
                      <button
                        key={q}
                        onClick={() => onAssignQuarter(item.id, q as any)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-blue-100 rounded"
                        disabled={getQuarterItems(q).length >= 5}
                      >
                        Q{q.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6">Quarterly KPI Targets</h3>
        
        {kpis.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No KPIs to track quarterly</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">KPI</th>
                  <th className="text-center py-2">Q1</th>
                  <th className="text-center py-2">Q2</th>
                  <th className="text-center py-2">Q3</th>
                  <th className="text-center py-2">Q4 (Year 1)</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((kpi: SelectedKPI) => (
                  <tr key={kpi.id} className="border-b">
                    <td className="py-2 font-medium">{kpi.name}</td>
                    <td className="py-2 text-center">
                      {Math.round(kpi.year1Target * 0.25)}
                    </td>
                    <td className="py-2 text-center">
                      {Math.round(kpi.year1Target * 0.5)}
                    </td>
                    <td className="py-2 text-center">
                      {Math.round(kpi.year1Target * 0.75)}
                    </td>
                    <td className="py-2 text-center font-semibold">
                      {kpi.year1Target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function NinetyDayStep({ goals, kpis, quarterItems, ninetyDayItems, setNinetyDayItems }: any) {
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const revenueGoal = goals.find((g: ThreeYearGoal) => g.id === 'revenue')
  const profitGoal = goals.find((g: ThreeYearGoal) => g.id === 'profit')
  const q1Revenue = Math.round((revenueGoal?.year1Target || 0) * 0.25)
  const q1Profit = Math.round((profitGoal?.year1Target || 0) * 0.25)

  const addNinetyDayItem = (initiative: string) => {
    const newItem: NinetyDayItem = {
      id: `90day-${Date.now()}`,
      title: initiative,
      owner: '',
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'not-started',
      milestones: []
    }
    setNinetyDayItems([...ninetyDayItems, newItem])
    setEditingId(newItem.id)
  }

  const updateItem = (id: string, updates: Partial<NinetyDayItem>) => {
    setNinetyDayItems(ninetyDayItems.map((item: NinetyDayItem) =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const addMilestone = (itemId: string) => {
    const item = ninetyDayItems.find((i: NinetyDayItem) => i.id === itemId)
    if (item) {
      const newMilestone = {
        id: `milestone-${Date.now()}`,
        description: '',
        completed: false,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      updateItem(itemId, {
        milestones: [...item.milestones, newMilestone]
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Q1 Sprint Goals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-green-100 text-sm">Q1 Revenue Target</p>
            <p className="text-2xl font-bold">${q1Revenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Q1 Profit Target</p>
            <p className="text-2xl font-bold">${q1Profit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Q1 Initiatives</p>
            <p className="text-2xl font-bold">{quarterItems.length}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Days Remaining</p>
            <p className="text-2xl font-bold">90</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Q1 KPI Targets</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {kpis.map((kpi: SelectedKPI) => (
            <div key={kpi.id} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">{kpi.name}</p>
              <p className="text-lg font-semibold">{Math.round(kpi.year1Target * 0.25)} {kpi.unit}</p>
              <p className="text-xs text-gray-500">{kpi.frequency}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Q1 Sprint Initiatives</h3>
          <button
            onClick={() => addNinetyDayItem('New Initiative')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Initiative
          </button>
        </div>

        {quarterItems.length > 0 && ninetyDayItems.length === 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-3">Import your Q1 initiatives:</p>
            <div className="space-y-2">
              {quarterItems.map((item: StrategicItem) => (
                <button
                  key={item.id}
                  onClick={() => addNinetyDayItem(item.title)}
                  className="block w-full text-left p-2 bg-white rounded hover:bg-blue-100 text-sm"
                >
                  + {item.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {ninetyDayItems.map((item: NinetyDayItem) => (
            <div key={item.id} className="border rounded-lg p-4">
              {editingId === item.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                      placeholder="Initiative title"
                    />
                    <input
                      type="text"
                      value={item.owner}
                      onChange={(e) => updateItem(item.id, { owner: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                      placeholder="Owner name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => updateItem(item.id, { dueDate: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <select
                      value={item.status}
                      onChange={(e) => updateItem(item.id, { status: e.target.value as any })}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {item.owner || 'Unassigned'}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-100 text-green-700' :
                          item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="p-1 text-gray-600 hover:text-blue-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-700">Milestones</h5>
                      <button
                        onClick={() => addMilestone(item.id)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Add Milestone
                      </button>
                    </div>
                    {item.milestones.length === 0 ? (
                      <p className="text-sm text-gray-500">No milestones yet</p>
                    ) : (
                      <div className="space-y-2">
                        {item.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={milestone.completed}
                              onChange={(e) => {
                                const updatedMilestones = item.milestones.map(m =>
                                  m.id === milestone.id ? { ...m, completed: e.target.checked } : m
                                )
                                updateItem(item.id, { milestones: updatedMilestones })
                              }}
                              className="h-4 w-4"
                            />
                            <input
                              type="text"
                              value={milestone.description}
                              onChange={(e) => {
                                const updatedMilestones = item.milestones.map(m =>
                                  m.id === milestone.id ? { ...m, description: e.target.value } : m
                                )
                                updateItem(item.id, { milestones: updatedMilestones })
                              }}
                              className={`flex-1 text-sm px-2 py-1 border rounded ${
                                milestone.completed ? 'line-through text-gray-400' : ''
                              }`}
                              placeholder="Milestone description"
                            />
                            <input
                              type="date"
                              value={milestone.dueDate}
                              onChange={(e) => {
                                const updatedMilestones = item.milestones.map(m =>
                                  m.id === milestone.id ? { ...m, dueDate: e.target.value } : m
                                )
                                updateItem(item.id, { milestones: updatedMilestones })
                              }}
                              className="text-sm px-2 py-1 border rounded"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}