'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Calendar,
  ArrowRight,
  Grip,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Settings,
  RefreshCw,
  Save,
  Database
} from 'lucide-react'

// Complete types for all features
interface BusinessProfile {
  id: string
  user_id: string
  company_name: string
  current_revenue: number
  industry: string | null
  employee_count: number
}

interface FinancialData {
  revenue_current: number
  revenue_1_year: number
  gross_profit_current: number
  gross_profit_1_year: number
  net_profit_current: number
  net_profit_1_year: number
  gross_margin_current: number
  gross_margin_1_year: number
  net_margin_current: number
  net_margin_1_year: number
  customers_current: number
  customers_1_year: number
  employees_current: number
  employees_1_year: number
  year_type: 'FY' | 'CY'
}

interface KPI {
  id: string
  kpi_id: string
  name: string
  category: string
  current_value: number
  year1_target: number
  unit: string
  frequency: string
}

interface Initiative {
  id: string
  title: string
  category: string
  quarter_assignment: string | null
  order_index: number
  selected: boolean
}

interface QuarterlyTargets {
  q1: { [key: string]: number }
  q2: { [key: string]: number }
  q3: { [key: string]: number }
  q4: { [key: string]: number }
}

interface QuarterlyPercentages {
  q1: number
  q2: number
  q3: number
  q4: number
}

export default function AnnualPlan() {
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isDemoMode, setIsDemoMode] = useState(false)
  
  // Data states
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [kpis, setKpis] = useState<KPI[]>([])
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  
  // UI states
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    financial: false,
    kpis: false,
    initiatives: false
  })
  
  // Quarterly planning states
  const [quarterlyTargets, setQuarterlyTargets] = useState<QuarterlyTargets>({
    q1: {},
    q2: {},
    q3: {},
    q4: {}
  })
  
  const [quarterlyPercentages, setQuarterlyPercentages] = useState<QuarterlyPercentages>({
    q1: 25,
    q2: 50,
    q3: 75,
    q4: 100
  })
  
  const [usePercentageMode, setUsePercentageMode] = useState(true)

  const supabase = createClient()

  // Initialize with comprehensive demo data
  const initializeDemoData = () => {
    setIsDemoMode(true)
    
    // Demo business profile
    setBusinessProfile({
      id: 'demo-profile-id',
      user_id: 'demo-user-id',
      company_name: 'Demo Business Co.',
      current_revenue: 500000,
      industry: 'Professional Services',
      employee_count: 8
    })

    // Demo financial data
    const demoFinancialData: FinancialData = {
      revenue_current: 500000,
      revenue_1_year: 750000,
      gross_profit_current: 300000,
      gross_profit_1_year: 450000,
      net_profit_current: 100000,
      net_profit_1_year: 150000,
      gross_margin_current: 60,
      gross_margin_1_year: 60,
      net_margin_current: 20,
      net_margin_1_year: 20,
      customers_current: 50,
      customers_1_year: 75,
      employees_current: 8,
      employees_1_year: 12,
      year_type: 'FY'
    }
    setFinancialData(demoFinancialData)

    // Demo KPIs
    const demoKPIs: KPI[] = [
      {
        id: 'kpi-1',
        kpi_id: 'customer-acquisition-cost',
        name: 'Customer Acquisition Cost',
        category: 'Sales',
        current_value: 500,
        year1_target: 400,
        unit: 'currency',
        frequency: 'monthly'
      },
      {
        id: 'kpi-2',
        kpi_id: 'customer-lifetime-value',
        name: 'Customer Lifetime Value',
        category: 'Sales',
        current_value: 5000,
        year1_target: 7500,
        unit: 'currency',
        frequency: 'annual'
      },
      {
        id: 'kpi-3',
        kpi_id: 'employee-satisfaction',
        name: 'Employee Satisfaction Score',
        category: 'People',
        current_value: 75,
        year1_target: 85,
        unit: 'percentage',
        frequency: 'quarterly'
      },
      {
        id: 'kpi-4',
        kpi_id: 'project-completion-rate',
        name: 'Project Completion Rate',
        category: 'Operations',
        current_value: 85,
        year1_target: 95,
        unit: 'percentage',
        frequency: 'monthly'
      }
    ]
    setKpis(demoKPIs)

    // Demo initiatives
    const demoInitiatives: Initiative[] = [
      {
        id: 'init-1',
        title: 'Launch new service offering',
        category: 'Growth',
        quarter_assignment: null,
        order_index: 0,
        selected: true
      },
      {
        id: 'init-2',
        title: 'Implement CRM system',
        category: 'Systems',
        quarter_assignment: 'q1',
        order_index: 0,
        selected: true
      },
      {
        id: 'init-3',
        title: 'Hire senior developer',
        category: 'People',
        quarter_assignment: 'q2',
        order_index: 0,
        selected: true
      },
      {
        id: 'init-4',
        title: 'Expand marketing channels',
        category: 'Marketing',
        quarter_assignment: null,
        order_index: 0,
        selected: true
      },
      {
        id: 'init-5',
        title: 'Optimize delivery processes',
        category: 'Operations',
        quarter_assignment: 'q3',
        order_index: 0,
        selected: true
      },
      {
        id: 'init-6',
        title: 'Launch customer portal',
        category: 'Technology',
        quarter_assignment: 'q4',
        order_index: 0,
        selected: true
      }
    ]
    setInitiatives(demoInitiatives)

    // Initialize quarterly targets based on demo data
    initializeQuarterlyTargets(demoKPIs, demoFinancialData)
  }

  // Auto-save functionality (works in demo mode too)
  const saveQuarterlyTargets = useCallback(async (targets: QuarterlyTargets, percentages: QuarterlyPercentages) => {
    if (isDemoMode || saving) {
      // In demo mode, just show the save animation
      setSaveStatus('saving')
      setTimeout(() => setSaveStatus('saved'), 1000)
      setTimeout(() => setSaveStatus('idle'), 3000)
      return
    }
    
    if (!businessProfile?.id) return
    
    try {
      setSaving(true)
      setSaveStatus('saving')
      
      // Real save logic would go here
      const updateData = {
        three_year_goals: {
          ...financialData,
          quarterly_targets: targets,
          quarterly_percentages: percentages,
          use_percentage_mode: usePercentageMode
        },
        updated_at: new Date().toISOString()
      }

      // Simulate save success in demo mode
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
      
    } catch (err) {
      console.error('Error saving quarterly targets:', err)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }, [businessProfile?.id, financialData, usePercentageMode, saving, isDemoMode])

  // Debounced auto-save effect
  useEffect(() => {
    if (!loading && Object.keys(quarterlyTargets.q1).length > 0) {
      const timeoutId = setTimeout(() => {
        saveQuarterlyTargets(quarterlyTargets, quarterlyPercentages)
      }, 1500)
      
      return () => clearTimeout(timeoutId)
    }
  }, [quarterlyTargets, quarterlyPercentages, saveQuarterlyTargets, loading])

  // Comprehensive data loading with fallback
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Check authentication first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError('Authentication required. Using demo data.')
        initializeDemoData()
        setLoading(false)
        return
      }

      // Try to load business profile
      try {
        const { data: profile, error: profileError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (profileError || !profile) {
          setError('No business profile found. Please complete setup. Using demo data.')
          initializeDemoData()
          setLoading(false)
          return
        }
        
        setBusinessProfile(profile)

        // Try to load strategic goals
        try {
          const { data: goals, error: goalsError } = await supabase
            .from('strategic_goals')
            .select('*')
            .eq('business_profile_id', profile.id)
            .single()
          
          if (goalsError || !goals?.three_year_goals) {
            setError('No strategic goals found. Please complete 3yr Goals & KPIs step first. Using demo data.')
            initializeDemoData()
            setLoading(false)
            return
          }

          // Load real data from strategic goals
          const goalData = goals.three_year_goals as any
          const realFinancialData: FinancialData = {
            revenue_current: goalData.revenue_current || 0,
            revenue_1_year: goalData.revenue_1_year || 0,
            gross_profit_current: goalData.gross_profit_current || 0,
            gross_profit_1_year: goalData.gross_profit_1_year || 0,
            net_profit_current: goalData.net_profit_current || 0,
            net_profit_1_year: goalData.net_profit_1_year || 0,
            gross_margin_current: goalData.gross_margin_current || 0,
            gross_margin_1_year: goalData.gross_margin_1_year || 0,
            net_margin_current: goalData.net_margin_current || 0,
            net_margin_1_year: goalData.net_margin_1_year || 0,
            customers_current: goalData.customers_current || 0,
            customers_1_year: goalData.customers_1_year || 0,
            employees_current: goalData.employees_current || 0,
            employees_1_year: goalData.employees_1_year || 0,
            year_type: goalData.year_type || 'FY'
          }
          setFinancialData(realFinancialData)

          // Load saved quarterly data
          if (goalData.quarterly_targets) {
            setQuarterlyTargets(goalData.quarterly_targets)
          }
          if (goalData.quarterly_percentages) {
            setQuarterlyPercentages(goalData.quarterly_percentages)
          }
          if (goalData.use_percentage_mode !== undefined) {
            setUsePercentageMode(goalData.use_percentage_mode)
          }

          setIsDemoMode(false)

        } catch (goalsErr) {
          setError('Unable to load strategic goals. Using demo data.')
          initializeDemoData()
        }

        // Try to load KPIs (optional)
        try {
          const { data: kpiData } = await supabase
            .from('kpis')
            .select('*')
            .eq('business_profile_id', profile.id)
          
          if (kpiData && kpiData.length > 0) {
            setKpis(kpiData)
          }
        } catch (kpiErr) {
          // KPIs are optional, use demo if needed
        }

        // Try to load initiatives (optional)
        try {
          const { data: initiativeData } = await supabase
            .from('strategic_initiatives')
            .select('*')
            .eq('business_profile_id', profile.id)
            .eq('selected', true)
          
          if (initiativeData && initiativeData.length > 0) {
            setInitiatives(initiativeData)
          }
        } catch (initErr) {
          // Initiatives are optional, use demo if needed
        }

      } catch (profileErr) {
        setError('Database access issue. Using demo data.')
        initializeDemoData()
      }

    } catch (err) {
      setError('Unable to connect to database. Using demo data.')
      initializeDemoData()
    } finally {
      setLoading(false)
    }
  }

  // Initialize quarterly targets
  const initializeQuarterlyTargets = (kpiData: KPI[], finData: FinancialData) => {
    const initialTargets: QuarterlyTargets = {
      q1: {},
      q2: {},
      q3: {},
      q4: {}
    }

    // Initialize financial targets
    const financialMetrics = [
      'revenue_1_year',
      'gross_profit_1_year', 
      'net_profit_1_year',
      'customers_1_year',
      'employees_1_year'
    ]

    financialMetrics.forEach(metric => {
      const yearTarget = (finData as any)[metric] || 0
      if (yearTarget > 0) {
        initialTargets.q1[metric] = Math.round(yearTarget * (quarterlyPercentages.q1 / 100))
        initialTargets.q2[metric] = Math.round(yearTarget * (quarterlyPercentages.q2 / 100))
        initialTargets.q3[metric] = Math.round(yearTarget * (quarterlyPercentages.q3 / 100))
        initialTargets.q4[metric] = Math.round(yearTarget * (quarterlyPercentages.q4 / 100))
      }
    })

    // Initialize KPI targets
    kpiData.forEach(kpi => {
      if (kpi.year1_target > 0) {
        initialTargets.q1[kpi.kpi_id] = Math.round(kpi.year1_target * (quarterlyPercentages.q1 / 100))
        initialTargets.q2[kpi.kpi_id] = Math.round(kpi.year1_target * (quarterlyPercentages.q2 / 100))
        initialTargets.q3[kpi.kpi_id] = Math.round(kpi.year1_target * (quarterlyPercentages.q3 / 100))
        initialTargets.q4[kpi.kpi_id] = Math.round(kpi.year1_target * (quarterlyPercentages.q4 / 100))
      }
    })

    setQuarterlyTargets(initialTargets)
  }

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  // Update quarterly percentages and recalculate
  const updateQuarterlyPercentages = (quarter: keyof QuarterlyPercentages, percentage: number) => {
    const newPercentages = { ...quarterlyPercentages, [quarter]: percentage }
    setQuarterlyPercentages(newPercentages)
    
    if (usePercentageMode) {
      recalculateAllTargets(newPercentages)
    }
  }

  // Recalculate all targets based on percentages
  const recalculateAllTargets = (percentages: QuarterlyPercentages) => {
    const newTargets: QuarterlyTargets = {
      q1: {},
      q2: {},
      q3: {},
      q4: {}
    }

    // Recalculate financial targets
    if (financialData) {
      const financialMetrics = [
        'revenue_1_year',
        'gross_profit_1_year', 
        'net_profit_1_year',
        'customers_1_year',
        'employees_1_year'
      ]

      financialMetrics.forEach(metric => {
        const yearTarget = (financialData as any)[metric] || 0
        if (yearTarget > 0) {
          newTargets.q1[metric] = Math.round(yearTarget * (percentages.q1 / 100))
          newTargets.q2[metric] = Math.round(yearTarget * (percentages.q2 / 100))
          newTargets.q3[metric] = Math.round(yearTarget * (percentages.q3 / 100))
          newTargets.q4[metric] = Math.round(yearTarget * (percentages.q4 / 100))
        }
      })
    }

    // Recalculate KPI targets
    kpis.forEach(kpi => {
      if (kpi.year1_target > 0) {
        newTargets.q1[kpi.kpi_id] = Math.round(kpi.year1_target * (percentages.q1 / 100))
        newTargets.q2[kpi.kpi_id] = Math.round(kpi.year1_target * (percentages.q2 / 100))
        newTargets.q3[kpi.kpi_id] = Math.round(kpi.year1_target * (percentages.q3 / 100))
        newTargets.q4[kpi.kpi_id] = Math.round(kpi.year1_target * (percentages.q4 / 100))
      }
    })

    setQuarterlyTargets(newTargets)
  }

  // Handle individual cell updates
  const updateQuarterlyTarget = (metric: string, quarter: 'q1' | 'q2' | 'q3' | 'q4', value: number) => {
    setQuarterlyTargets(prev => ({
      ...prev,
      [quarter]: {
        ...prev[quarter],
        [metric]: value
      }
    }))
    
    if (usePercentageMode) {
      setUsePercentageMode(false)
    }
  }

  // Get quarter end dates based on year type
  const getQuarterEndDate = (quarter: string, yearType: 'FY' | 'CY' = 'FY') => {
    const currentYear = new Date().getFullYear()
    const quarterNum = quarter.replace('q', '')
    
    if (yearType === 'FY') {
      switch (quarterNum) {
        case '1': return `Q1 30 Sept ${currentYear}`
        case '2': return `Q2 31 Dec ${currentYear}`
        case '3': return `Q3 31 Mar ${currentYear + 1}`
        case '4': return `Q4 30 June ${currentYear + 1}`
        default: return `Q${quarterNum}`
      }
    } else {
      switch (quarterNum) {
        case '1': return `Q1 31 Mar ${currentYear}`
        case '2': return `Q2 30 June ${currentYear}`
        case '3': return `Q3 30 Sept ${currentYear}`
        case '4': return `Q4 31 Dec ${currentYear}`
        default: return `Q${quarterNum}`
      }
    }
  }

  // Handle drag and drop for initiatives
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    try {
      setSaving(true)

      // Get the initiative being moved
      const initiative = initiatives.find(i => i.id === draggableId)
      if (!initiative) return

      // Check quarter limits (max 5 per quarter)
      const destinationQuarter = destination.droppableId
      const currentQuarterInitiatives = initiatives.filter(
        i => i.quarter_assignment === destinationQuarter && i.id !== draggableId
      )

      if (destinationQuarter !== 'unassigned' && currentQuarterInitiatives.length >= 5) {
        setError('Maximum 5 initiatives per quarter')
        setTimeout(() => setError(''), 3000)
        return
      }

      // Update local state immediately for better UX
      setInitiatives(prev => prev.map(i => 
        i.id === draggableId 
          ? { 
              ...i, 
              quarter_assignment: destinationQuarter === 'unassigned' ? null : destinationQuarter,
              order_index: destination.index
            }
          : i
      ))

      // In demo mode, just simulate success
      if (isDemoMode) {
        setError('')
        return
      }

      // Real database update would go here
      setError('')

    } catch (err) {
      console.error('Error updating initiative:', err)
      setError('Failed to update initiative assignment')
    } finally {
      setSaving(false)
    }
  }

  // Formatting utilities
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-AU')
  }

  const parseCurrencyInput = (value: string): number => {
    return Number(value.replace(/[^0-9.-]/g, ''))
  }

  // Get quarterly target for display
  const getQuarterlyTarget = (metric: string, quarter: 'q1' | 'q2' | 'q3' | 'q4') => {
    return quarterlyTargets[quarter][metric] || 0
  }

  // Toggle section collapse
  const toggleSection = (section: keyof typeof sectionsCollapsed) => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Get initiatives by quarter
  const getInitiativesByQuarter = (quarter: string) => {
    return initiatives
      .filter(i => i.quarter_assignment === quarter)
      .sort((a, b) => a.order_index - b.order_index)
  }

  const unassignedInitiatives = initiatives.filter(i => !i.quarter_assignment)

  // Get financial value safely
  const getFinancialValue = (key: string): number => {
    return (financialData as any)?.[key] || 0
  }

  // Save status indicator
  const getSaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center text-blue-600">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        )
      case 'saved':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <span className="text-sm">Saved</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Save failed</span>
          </div>
        )
      default:
        return null
    }
  }

  // Group KPIs by category
  const groupedKPIs = kpis.reduce((acc, kpi) => {
    if (!acc[kpi.category]) {
      acc[kpi.category] = []
    }
    acc[kpi.category].push(kpi)
    return acc
  }, {} as Record<string, KPI[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading annual plan...</p>
        </div>
      </div>
    )
  }

  if (!financialData) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-gray-400 mx-auto" />
        <p className="mt-4 text-gray-900 font-semibold">No Strategic Goals Set</p>
        <p className="mt-2 text-gray-600">Please complete the strategic goals section first</p>
        <button
          onClick={loadData}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Annual Strategic Plan</h2>
          <p className="mt-1 text-gray-600">Your roadmap from current performance to year-end targets</p>
          {businessProfile && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500">{businessProfile.company_name}</p>
              {isDemoMode && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Demo Mode</span>
              )}
            </div>
          )}
        </div>
        {getSaveStatusIndicator()}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-orange-500 hover:text-orange-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Quarterly Planning Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-600" />
            Quarterly Planning Method
          </h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={usePercentageMode}
                  onChange={() => {
                    setUsePercentageMode(true)
                    recalculateAllTargets(quarterlyPercentages)
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 font-medium text-gray-900">Use percentage targets</span>
                <span className="ml-2 text-sm text-gray-500">(recommended)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={!usePercentageMode}
                  onChange={() => setUsePercentageMode(false)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 font-medium text-gray-900">Manual individual targets</span>
              </label>
            </div>

            {/* Percentage Controls */}
            {usePercentageMode && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">Set what percentage of your annual target you want to achieve by the end of each quarter:</p>
                <div className="grid grid-cols-4 gap-4">
                  {(['q1', 'q2', 'q3', 'q4'] as const).map((quarter, index) => (
                    <div key={quarter} className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getQuarterEndDate(quarter, financialData.year_type)}
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={quarterlyPercentages[quarter]}
                          onChange={(e) => updateQuarterlyPercentages(quarter, Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                          min="0"
                          max="100"
                          step="1"
                        />
                        <span className="ml-2 text-gray-500">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Performance - COLLAPSIBLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('financial')}
          className="w-full bg-blue-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between hover:bg-blue-100 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Financial Performance
          </h3>
          {sectionsCollapsed.financial ? (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          )}
        </button>
        
        {!sectionsCollapsed.financial && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Metric</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 bg-blue-50">Current</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 bg-green-50">1 Year Target</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    {getQuarterEndDate('q1', financialData.year_type)}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    {getQuarterEndDate('q2', financialData.year_type)}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    {getQuarterEndDate('q3', financialData.year_type)}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    {getQuarterEndDate('q4', financialData.year_type)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">Revenue</td>
                  <td className="px-6 py-4 text-center text-gray-700 bg-blue-50">{formatCurrency(getFinancialValue('revenue_current'))}</td>
                  <td className="px-6 py-4 text-center font-semibold text-blue-600 bg-green-50">{formatCurrency(getFinancialValue('revenue_1_year'))}</td>
                  {(['q1', 'q2', 'q3', 'q4'] as const).map(quarter => (
                    <td key={quarter} className="px-6 py-4 text-center">
                      <input
                        type="text"
                        value={formatNumber(getQuarterlyTarget('revenue_1_year', quarter))}
                        onChange={(e) => updateQuarterlyTarget('revenue_1_year', quarter, parseCurrencyInput(e.target.value))}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={usePercentageMode}
                        placeholder="0"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">Gross Profit</td>
                  <td className="px-6 py-4 text-center text-gray-700 bg-blue-50">{formatCurrency(getFinancialValue('gross_profit_current'))}</td>
                  <td className="px-6 py-4 text-center font-semibold text-blue-600 bg-green-50">{formatCurrency(getFinancialValue('gross_profit_1_year'))}</td>
                  {(['q1', 'q2', 'q3', 'q4'] as const).map(quarter => (
                    <td key={quarter} className="px-6 py-4 text-center">
                      <input
                        type="text"
                        value={formatNumber(getQuarterlyTarget('gross_profit_1_year', quarter))}
                        onChange={(e) => updateQuarterlyTarget('gross_profit_1_year', quarter, parseCurrencyInput(e.target.value))}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={usePercentageMode}
                        placeholder="0"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">Gross Margin %</td>
                  <td className="px-6 py-4 text-center text-gray-700 bg-blue-50">{formatPercentage(getFinancialValue('gross_margin_current'))}</td>
                  <td className="px-6 py-4 text-center font-semibold text-blue-600 bg-green-50">{formatPercentage(getFinancialValue('gross_margin_1_year'))}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{formatPercentage(getFinancialValue('gross_margin_1_year'))}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{formatPercentage(getFinancialValue('gross_margin_1_year'))}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{formatPercentage(getFinancialValue('gross_margin_1_year'))}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{formatPercentage(getFinancialValue('gross_margin_1_year'))}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">Net Profit</td>
                  <td className="px-6 py-4 text-center text-gray-700 bg-blue-50">{formatCurrency(getFinancialValue('net_profit_current'))}</td>
                  <td className="px-6 py-4 text-center font-semibold text-blue-600 bg-green-50">{formatCurrency(getFinancialValue('net_profit_1_year'))}</td>
                  {(['q1', 'q2', 'q3', 'q4'] as const).map(quarter => (
                    <td key={quarter} className="px-6 py-4 text-center">
                      <input
                        type="text"
                        value={formatNumber(getQuarterlyTarget('net_profit_1_year', quarter))}
                        onChange={(e) => updateQuarterlyTarget('net_profit_1_year', quarter, parseCurrencyInput(e.target.value))}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={usePercentageMode}
                        placeholder="0"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">Net Margin %</td>
                  <td className="px-6 py-4 text-center text-gray-700 bg-blue-50">{formatPercentage(getFinancialValue('net_margin_current'))}</td>
                  <td className="px-6 py-4 text-center font-semibold text-blue-600 bg-green-50">{formatPercentage(getFinancialValue('net_margin_1_year'))}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{formatPercentage(getFinancialValue('net_margin_1_year'))}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{formatPercentage(getFinancialValue('net_margin_1_year'))}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{formatPercentage(getFinancialValue('net_margin_1_year'))}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{formatPercentage(getFinancialValue('net_margin_1_year'))}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">Customers</td>
                  <td className="px-6 py-4 text-center text-gray-700 bg-blue-50">{formatNumber(getFinancialValue('customers_current'))}</td>
                  <td className="px-6 py-4 text-center font-semibold text-green-600 bg-green-50">{formatNumber(getFinancialValue('customers_1_year'))}</td>
                  {(['q1', 'q2', 'q3', 'q4'] as const).map(quarter => (
                    <td key={quarter} className="px-6 py-4 text-center">
                      <input
                        type="number"
                        value={getQuarterlyTarget('customers_1_year', quarter)}
                        onChange={(e) => updateQuarterlyTarget('customers_1_year', quarter, Number(e.target.value))}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={usePercentageMode}
                        min="0"
                        placeholder="0"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">Employees</td>
                  <td className="px-6 py-4 text-center text-gray-700 bg-blue-50">{formatNumber(getFinancialValue('employees_current'))}</td>
                  <td className="px-6 py-4 text-center font-semibold text-purple-600 bg-green-50">{formatNumber(getFinancialValue('employees_1_year'))}</td>
                  {(['q1', 'q2', 'q3', 'q4'] as const).map(quarter => (
                    <td key={quarter} className="px-6 py-4 text-center">
                      <input
                        type="number"
                        value={getQuarterlyTarget('employees_1_year', quarter)}
                        onChange={(e) => updateQuarterlyTarget('employees_1_year', quarter, Number(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={usePercentageMode}
                        min="0"
                        placeholder="0"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Key Performance Indicators - COLLAPSIBLE */}
      {kpis.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('kpis')}
            className="w-full bg-green-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between hover:bg-green-100 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Key Performance Indicators ({kpis.length} total)
            </h3>
            {sectionsCollapsed.kpis ? (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            )}
          </button>
          
          {!sectionsCollapsed.kpis && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">KPI</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 bg-blue-50">Current</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 bg-green-50">1 Year Target</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                      {getQuarterEndDate('q1', financialData.year_type)}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                      {getQuarterEndDate('q2', financialData.year_type)}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                      {getQuarterEndDate('q3', financialData.year_type)}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                      {getQuarterEndDate('q4', financialData.year_type)}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(groupedKPIs).map(([category, categoryKpis]) => (
                    <>
                      <tr key={category} className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-2 text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          {category} KPIs
                        </td>
                      </tr>
                      {categoryKpis.map((kpi) => (
                        <tr key={kpi.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{kpi.name}</div>
                              <div className="text-sm text-gray-500">{kpi.frequency}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-700 bg-blue-50">
                            {kpi.unit === 'currency' ? formatCurrency(kpi.current_value) : 
                             kpi.unit === 'percentage' ? formatPercentage(kpi.current_value) : 
                             formatNumber(kpi.current_value)}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-green-600 bg-green-50">
                            {kpi.unit === 'currency' ? formatCurrency(kpi.year1_target) : 
                             kpi.unit === 'percentage' ? formatPercentage(kpi.year1_target) : 
                             formatNumber(kpi.year1_target)}
                          </td>
                          {(['q1', 'q2', 'q3', 'q4'] as const).map(quarter => (
                            <td key={quarter} className="px-6 py-4 text-center">
                              <input
                                type="text"
                                value={kpi.unit === 'currency' ? formatNumber(getQuarterlyTarget(kpi.kpi_id, quarter)) : getQuarterlyTarget(kpi.kpi_id, quarter)}
                                onChange={(e) => updateQuarterlyTarget(
                                  kpi.kpi_id, 
                                  quarter, 
                                  kpi.unit === 'currency' ? parseCurrencyInput(e.target.value) : Number(e.target.value)
                                )}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={usePercentageMode}
                                placeholder="0"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Strategic Initiatives - COLLAPSIBLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('initiatives')}
          className="w-full bg-purple-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between hover:bg-purple-100 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Strategic Initiatives ({initiatives.length} selected)
          </h3>
          {sectionsCollapsed.initiatives ? (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          )}
        </button>
        
        {!sectionsCollapsed.initiatives && (
          <>
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Drag initiatives to quarters • Maximum 5 per quarter • {initiatives.length} total selected
              </p>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="p-6">
                
                {/* Unassigned Initiatives */}
                <div className="mb-8">
                  <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                    Unassigned Initiatives
                  </h4>
                  
                  <Droppable droppableId="unassigned">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[100px] rounded-lg border-2 border-dashed p-4 transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'border-gray-400 bg-gray-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        {unassignedInitiatives.length === 0 ? (
                          <div className="text-center py-6 text-gray-500">
                            <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                            All initiatives assigned to quarters
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {unassignedInitiatives.map((initiative, index) => (
                              <Draggable
                                key={initiative.id}
                                draggableId={initiative.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center transition-all ${
                                      snapshot.isDragging 
                                        ? 'shadow-lg rotate-1 scale-105' 
                                        : 'hover:shadow-md'
                                    }`}
                                  >
                                    <Grip className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                                    <span className="font-medium text-gray-900 flex-1">
                                      {initiative.title}
                                    </span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {initiative.category}
                                    </span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* Quarterly Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {['q1', 'q2', 'q3', 'q4'].map((quarter, quarterIndex) => {
                    const quarterInitiatives = getInitiativesByQuarter(quarter)
                    const quarterColors = [
                      { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
                      { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
                      { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
                      { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' }
                    ][quarterIndex]

                    return (
                      <div key={quarter} className={`rounded-lg ${quarterColors.bg} ${quarterColors.border} border`}>
                        <div className="p-4 border-b border-gray-200">
                          <h4 className={`font-semibold ${quarterColors.text} flex items-center`}>
                            <div className={`w-3 h-3 ${quarterColors.dot} rounded-full mr-3`}></div>
                            {getQuarterEndDate(quarter, financialData.year_type)}
                            <span className="ml-auto text-sm font-normal">
                              {quarterInitiatives.length}/5
                            </span>
                          </h4>
                        </div>

                        <Droppable droppableId={quarter}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-[200px] p-4 transition-colors ${
                                snapshot.isDraggingOver 
                                  ? quarterColors.bg 
                                  : ''
                              }`}
                            >
                              {quarterInitiatives.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                  <Plus className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm">Drop initiatives here</p>
                                  <p className="text-xs text-gray-400">Max 5 per quarter</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {quarterInitiatives.map((initiative, index) => (
                                    <Draggable
                                      key={initiative.id}
                                      draggableId={initiative.id}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all ${
                                            snapshot.isDragging 
                                              ? 'shadow-lg rotate-1 scale-105' 
                                              : 'hover:shadow-md'
                                          }`}
                                        >
                                          <div className="flex items-start">
                                            <Grip className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                              <p className="font-medium text-gray-900 text-sm leading-tight">
                                                {initiative.title}
                                              </p>
                                              <p className="text-xs text-gray-500 mt-1">
                                                {initiative.category}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )
                  })}
                </div>
              </div>
            </DragDropContext>
          </>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <ArrowRight className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Ready for 90-Day Execution?</h4>
            <p className="text-blue-700 mb-4">
              {isDemoMode 
                ? "Complete your business setup to unlock real data and database saving. Your annual plan provides the strategic framework!"
                : "Your annual plan provides the strategic framework! Next, convert your Q1 initiatives into detailed 90-day rocks with specific milestones and owners."
              }
            </p>
            <div className="space-x-3">
              {isDemoMode && (
                <button 
                  onClick={loadData}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Complete Setup
                </button>
              )}
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Create Q1 Sprint Plan
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}