'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronRight, ChevronLeft, Save, Target, TrendingUp, Calendar, Users, 
  CheckCircle, AlertCircle, Clock, Plus, Trash2, DollarSign, Calculator,
  X, Timer, MapPin, Info, ChevronDown, ChevronUp,
  Package, Heart, Brain, Settings, ListChecks, Loader2,
  Home, Car, GraduationCap, Plane, Sparkles, Edit2, User, Star,
  BarChart3, Percent, Hash, Activity, HelpCircle
} from 'lucide-react'
import ProfitCalculator from '@/components/ProfitCalculator'
import EnhancedKPIModal from '@/components/EnhancedKPIModal'
import StrategicInitiatives from '@/components/strategic-initiatives'
import AnnualPlan from '@/components/AnnualPlan'
import { createClient } from '@/lib/supabase/client'
import { getBusinessProfile } from '@/lib/supabase/helpers' // ADDED: Import helper function
import type { Database } from '@/lib/supabase/types'

// Type definitions
interface FinancialData {
  revenue: { current: number; year1: number; year2: number; year3: number }
  grossProfit: { current: number; year1: number; year2: number; year3: number }
  grossMargin: { current: number; year1: number; year2: number; year3: number }
  netProfit: { current: number; year1: number; year2: number; year3: number }
  netMargin: { current: number; year1: number; year2: number; year3: number }
  customers: { current: number; year1: number; year2: number; year3: number }
  employees: { current: number; year1: number; year2: number; year3: number }
}

interface KPIData {
  id: string
  name: string
  friendlyName?: string
  category: string
  currentValue: number
  year1Target: number
  year2Target: number
  year3Target: number
  unit: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  description?: string
  isStandard?: boolean
  isIndustry?: boolean
  isCustom?: boolean
}

interface LifeGoal {
  id: string
  category: 'property' | 'vehicle' | 'investment' | 'education' | 'travel' | 'family' | 'lifestyle' | 'freedom'
  title: string
  targetAmount?: number
  targetYear: 'year1' | 'year2' | 'year3'
  description?: string
  completed: boolean
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

// Industry-specific KPIs database - INCLUDING ALLIED HEALTH
const INDUSTRY_KPIS: Record<string, KPIData[]> = {
  building_construction: [
    {
      id: 'project-pipeline',
      name: 'Project Pipeline Value',
      friendlyName: 'Total value of projects in pipeline',
      category: 'Sales',
      currentValue: 2000000,
      year1Target: 3000000,
      year2Target: 5000000,
      year3Target: 8000000,
      unit: 'currency',
      frequency: 'monthly',
      description: 'Total value of potential projects',
      isIndustry: true
    },
    {
      id: 'quote-conversion',
      name: 'Quote to Job %',
      friendlyName: 'Percentage of quotes that convert',
      category: 'Sales',
      currentValue: 25,
      year1Target: 35,
      year2Target: 40,
      year3Target: 45,
      unit: 'percentage',
      frequency: 'monthly',
      description: 'Quote to job conversion rate',
      isIndustry: true
    },
    {
      id: 'avg-project-value',
      name: 'Avg Project Value',
      friendlyName: 'Average project contract value',
      category: 'Sales',
      currentValue: 75000,
      year1Target: 100000,
      year2Target: 150000,
      year3Target: 200000,
      unit: 'currency',
      frequency: 'monthly',
      description: 'Average value per project',
      isIndustry: true
    }
  ],
  allied_health: [
    {
      id: 'patient-satisfaction',
      name: 'Patient Satisfaction',
      friendlyName: 'Average patient satisfaction score',
      category: 'Customer',
      currentValue: 8,
      year1Target: 9,
      year2Target: 9.2,
      year3Target: 9.5,
      unit: 'number',
      frequency: 'monthly',
      description: 'Patient satisfaction score (out of 10)',
      isIndustry: true
    },
    {
      id: 'appointment-utilization',
      name: 'Appointment Utilization',
      friendlyName: 'Percentage of appointments booked',
      category: 'Operations',
      currentValue: 75,
      year1Target: 85,
      year2Target: 90,
      year3Target: 92,
      unit: 'percentage',
      frequency: 'weekly',
      description: 'Booked appointments vs available slots',
      isIndustry: true
    },
    {
      id: 'patient-retention',
      name: 'Patient Retention Rate',
      friendlyName: 'Percentage of patients retained',
      category: 'Customer',
      currentValue: 80,
      year1Target: 85,
      year2Target: 88,
      year3Target: 90,
      unit: 'percentage',
      frequency: 'quarterly',
      description: 'Percentage of patients returning for follow-up care',
      isIndustry: true
    }
  ],
  professional_services: [
    {
      id: 'billable-rate',
      name: 'Avg Billable Rate',
      friendlyName: 'Average hourly billable rate',
      category: 'Financial',
      currentValue: 150,
      year1Target: 175,
      year2Target: 200,
      year3Target: 250,
      unit: 'currency',
      frequency: 'monthly',
      description: 'Average rate charged per hour',
      isIndustry: true
    },
    {
      id: 'utilization',
      name: 'Team Utilization',
      friendlyName: 'Percentage of billable hours',
      category: 'Productivity',
      currentValue: 65,
      year1Target: 75,
      year2Target: 80,
      year3Target: 85,
      unit: 'percentage',
      frequency: 'weekly',
      description: 'Billable hours vs total hours',
      isIndustry: true
    },
    {
      id: 'client-retention',
      name: 'Client Retention',
      friendlyName: 'Percentage of clients retained',
      category: 'Customer',
      currentValue: 80,
      year1Target: 85,
      year2Target: 90,
      year3Target: 92,
      unit: 'percentage',
      frequency: 'annual',
      description: 'Annual client retention rate',
      isIndustry: true
    }
  ],
  retail: [
    {
      id: 'same-store-sales',
      name: 'Same Store Sales Growth',
      friendlyName: 'Year over year sales growth',
      category: 'Sales',
      currentValue: 5,
      year1Target: 8,
      year2Target: 10,
      year3Target: 12,
      unit: 'percentage',
      frequency: 'monthly',
      description: 'YoY growth for same locations',
      isIndustry: true
    },
    {
      id: 'inventory-turnover',
      name: 'Inventory Turnover',
      friendlyName: 'Times inventory sold per year',
      category: 'Operations',
      currentValue: 6,
      year1Target: 8,
      year2Target: 10,
      year3Target: 12,
      unit: 'number',
      frequency: 'quarterly',
      description: 'How quickly inventory sells',
      isIndustry: true
    },
    {
      id: 'avg-transaction',
      name: 'Avg Transaction Value',
      friendlyName: 'Average sale amount',
      category: 'Sales',
      currentValue: 85,
      year1Target: 100,
      year2Target: 120,
      year3Target: 150,
      unit: 'currency',
      frequency: 'daily',
      description: 'Average value per transaction',
      isIndustry: true
    }
  ]
}

// Life goal categories - Professional colors (no amber/yellow)
const LIFE_GOAL_CATEGORIES = {
  property: { label: 'Property', icon: Home, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  vehicle: { label: 'Vehicle', icon: Car, color: 'bg-green-100 text-green-800 border-green-200' },
  investment: { label: 'Investment', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  education: { label: 'Education', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  travel: { label: 'Travel', icon: Plane, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  family: { label: 'Family', icon: Heart, color: 'bg-rose-100 text-rose-800 border-rose-200' },
  lifestyle: { label: 'Lifestyle', icon: Sparkles, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  freedom: { label: 'Freedom', icon: DollarSign, color: 'bg-teal-100 text-teal-800 border-teal-200' }
}

const LIFE_GOAL_SUGGESTIONS = {
  property: [
    'Buy dream home',
    'Purchase investment property',
    'Build holiday home',
    'Buy coastal property',
    'Acquire rental properties'
  ],
  vehicle: [
    'Buy luxury car',
    'Purchase family 4WD',
    'Get a boat',
    'Buy a caravan',
    'Upgrade to electric vehicle'
  ],
  investment: [
    'Build share portfolio',
    'Max out superannuation',
    'Create passive income streams',
    'Invest in ASX shares',
    'Build emergency fund (12 months)'
  ],
  education: [
    'Kids university fund',
    'Executive MBA',
    'Professional certifications',
    'Learn new skills',
    'Private school fees'
  ],
  travel: [
    'Annual family holidays',
    'European adventure',
    'Visit all continents',
    'Pacific cruise',
    'Outback adventure'
  ],
  family: [
    'More family time',
    'Support parents retirement',
    'Family experiences fund',
    'Children activities fund',
    'Family health & wellness'
  ],
  lifestyle: [
    'Work 4-day week',
    'Take sabbatical',
    'Join golf club',
    'Personal trainer',
    'Beach lifestyle'
  ],
  freedom: [
    'Financial independence',
    'Retire by age 50',
    'Work optional by 45',
    'Build generational wealth',
    'Complete time freedom'
  ]
}

// Helper functions
const formatDollar = (value: number): string => {
  return value.toLocaleString('en-AU')
}

const parseDollarInput = (value: string): number => {
  return Number(value.replace(/,/g, ''))
}

const formatUnit = (value: number | string, unit: string): string => {
  if (unit === '$' || unit === 'currency') {
    return `$${formatDollar(Number(value))}`
  } else if (unit === '%' || unit === 'percentage') {
    return `${value}%`
  } else if (unit === '#' || unit === 'number') {
    return formatDollar(Number(value))
  } else {
    return `${value}`
  }
}

// Get unit label for display
const getUnitLabel = (unit: string): string => {
  switch(unit) {
    case 'currency': return '($)'
    case 'percentage': return '(%)'
    case 'number': return '(#)'
    default: return ''
  }
}

// FIXED: Safe accessor for business profile revenue
const getCurrentRevenue = (profile: any): number => {
  if (!profile) return 500000
  // Try multiple property names for backwards compatibility
  return profile.current_revenue || profile.annual_revenue || profile.currentRevenue || 500000
}

// FIXED: Map industry from database to KPI categories
const mapIndustryFromDatabase = (dbIndustry: string | null): string => {
  if (!dbIndustry) return 'building_construction'
  
  const lower = dbIndustry.toLowerCase()
  
  // Map database industry values to our KPI categories
  if (lower.includes('construction') || lower.includes('building')) return 'building_construction'
  if (lower.includes('allied') || lower.includes('health') || lower.includes('physio') || lower.includes('psych')) return 'allied_health'
  if (lower.includes('professional') || lower.includes('services') || lower.includes('consult')) return 'professional_services'
  if (lower.includes('retail')) return 'retail'
  
  // Default to building_construction if no specific match
  return 'building_construction'
}

// Financial Help Info Card Component
function FinancialHelpCard({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null
  
  return (
    <div className="absolute z-50 left-6 top-8 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
      <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
      <div className="space-y-2 relative">
        <h4 className="font-semibold text-gray-900">Financial Goals Help</h4>
        <p className="text-sm text-gray-600">
          You can enter either dollar amounts or percentages - the system automatically calculates the other.
        </p>
        <p className="text-sm text-gray-600">
          When you change revenue, profits scale automatically to maintain your margin percentages.
        </p>
      </div>
    </div>
  )
}

// KPI Info Card Component - Fixed positioning
function KPIInfoCard({ kpi, isVisible }: { kpi: KPIData; isVisible: boolean }) {
  if (!isVisible) return null
  
  return (
    <div className="absolute z-50 left-6 top-8 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
      <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
      <div className="space-y-2 relative">
        <h4 className="font-semibold text-gray-900">{kpi.name}</h4>
        {kpi.friendlyName && (
          <p className="text-sm text-gray-600">{kpi.friendlyName}</p>
        )}
        {kpi.description && (
          <p className="text-sm text-gray-500">{kpi.description}</p>
        )}
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-gray-500">Category:</span>
            <span className="ml-1 font-medium">{kpi.category}</span>
          </div>
          <div>
            <span className="text-gray-500">Frequency:</span>
            <span className="ml-1 font-medium capitalize">{kpi.frequency}</span>
          </div>
        </div>
        {kpi.isStandard && (
          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Standard KPI</span>
        )}
        {kpi.isIndustry && (
          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Industry KPI</span>
        )}
        {kpi.isCustom && (
          <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">Custom KPI</span>
        )}
      </div>
    </div>
  )
}

// Custom KPI Modal Component - Enhanced Design
function CustomKPIModal({ isOpen, onClose, onSave }: any) {
  const [customKPI, setCustomKPI] = useState({
    name: '',
    friendlyName: '',
    category: 'Sales',
    unit: 'currency',
    frequency: 'monthly' as const,
    description: ''
  })
  
  const handleSave = () => {
    if (customKPI.name) {
      onSave({
        ...customKPI,
        id: `custom-${Date.now()}`,
        currentValue: 0,
        year1Target: 0,
        year2Target: 0,
        year3Target: 0,
        isCustom: true
      })
      setCustomKPI({
        name: '',
        friendlyName: '',
        category: 'Sales',
        unit: 'currency',
        frequency: 'monthly',
        description: ''
      })
      onClose()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Create Custom KPI</h3>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              KPI Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customKPI.name}
              onChange={(e) => setCustomKPI({ ...customKPI, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Customer Lifetime Value"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={customKPI.friendlyName}
              onChange={(e) => setCustomKPI({ ...customKPI, friendlyName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Average customer spend over lifetime"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={customKPI.category}
                onChange={(e) => setCustomKPI({ ...customKPI, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Financial">Financial</option>
                <option value="Operations">Operations</option>
                <option value="Customer">Customer</option>
                <option value="People">People</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={customKPI.unit}
                onChange={(e) => setCustomKPI({ ...customKPI, unit: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="currency">Dollar ($)</option>
                <option value="percentage">Percentage (%)</option>
                <option value="number">Number (#)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tracking Frequency
            </label>
            <select
              value={customKPI.frequency}
              onChange={(e) => setCustomKPI({ ...customKPI, frequency: e.target.value as any })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={customKPI.description}
              onChange={(e) => setCustomKPI({ ...customKPI, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              rows={3}
              placeholder="Brief description of what this KPI measures"
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!customKPI.name}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Create KPI
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Core states - FIXED: Remove isSaving, add lastSaved and showFinancialHelp
  const [isLoading, setIsLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [showProfitCalculator, setShowProfitCalculator] = useState(false)
  const [yearType, setYearType] = useState<'FY' | 'CY'>('FY')
  const [hoveredKPI, setHoveredKPI] = useState<string | null>(null)
  const [showFinancialHelp, setShowFinancialHelp] = useState(false)
  
  // Collapsed sections state
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  
  // Business data - FIXED with proper database loading
  const [industry, setIndustry] = useState('building_construction')
  const [currentRevenue, setCurrentRevenue] = useState(500000)
  const [businessProfile, setBusinessProfile] = useState<any>(null)
  
  // Financial data - Now includes customers and employees
  const [financialData, setFinancialData] = useState<FinancialData>({
    revenue: { current: 500000, year1: 750000, year2: 1500000, year3: 3000000 },
    grossProfit: { current: 200000, year1: 337500, year2: 675000, year3: 1350000 },
    grossMargin: { current: 40, year1: 45, year2: 45, year3: 45 },
    netProfit: { current: 50000, year1: 112500, year2: 300000, year3: 600000 },
    netMargin: { current: 10, year1: 15, year2: 20, year3: 20 },
    customers: { current: 100, year1: 150, year2: 300, year3: 500 },
    employees: { current: 2, year1: 4, year2: 8, year3: 15 }
  })
  
  // KPIs
  const [kpis, setKpis] = useState<KPIData[]>([])
  const [showKPIModal, setShowKPIModal] = useState(false)
  const [showCustomKPIModal, setShowCustomKPIModal] = useState(false)
  
  // Life Goals
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[]>([])
  const [showLifeGoalModal, setShowLifeGoalModal] = useState(false)
  const [editingLifeGoal, setEditingLifeGoal] = useState<LifeGoal | null>(null)
  
  // Strategic items
  const [ninetyDayItems, setNinetyDayItems] = useState<NinetyDayItem[]>([])

  // Database operations - FIXED: Remove isSaving circular dependency
  const saveFinancialData = useCallback(async (data: FinancialData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const financialRecord = {
        user_id: user.id,
        revenue_current: data.revenue.current,
        revenue_1_year: data.revenue.year1,
        revenue_2_year: data.revenue.year2,
        revenue_3_year: data.revenue.year3,
        gross_profit_current: data.grossProfit.current,
        gross_profit_1_year: data.grossProfit.year1,
        gross_profit_2_year: data.grossProfit.year2,
        gross_profit_3_year: data.grossProfit.year3,
        gross_margin_current: data.grossMargin.current,
        gross_margin_1_year: data.grossMargin.year1,
        gross_margin_2_year: data.grossMargin.year2,
        gross_margin_3_year: data.grossMargin.year3,
        net_profit_current: data.netProfit.current,
        net_profit_1_year: data.netProfit.year1,
        net_profit_2_year: data.netProfit.year2,
        net_profit_3_year: data.netProfit.year3,
        net_margin_current: data.netMargin.current,
        net_margin_1_year: data.netMargin.year1,
        net_margin_2_year: data.netMargin.year2,
        net_margin_3_year: data.netMargin.year3,
        customers_current: data.customers.current,
        customers_1_year: data.customers.year1,
        customers_2_year: data.customers.year2,
        customers_3_year: data.customers.year3,
        employees_current: data.employees.current,
        employees_1_year: data.employees.year1,
        employees_2_year: data.employees.year2,
        employees_3_year: data.employees.year3,
        year_type: yearType,
        industry: industry
      }

      const { error } = await supabase
        .from('strategic_goals')
        .upsert(financialRecord, { onConflict: 'user_id' })

      if (error) throw error
      
      setLastSaved(new Date())
    } catch (err) {
      console.error('Error saving financial data:', err)
      setError('Failed to save financial data')
    }
  }, [supabase, yearType, industry])

  const saveKPIs = useCallback(async (kpiList: KPIData[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete existing KPIs
      await supabase
        .from('strategic_kpis')
        .delete()
        .eq('user_id', user.id)

      // Insert updated KPIs
      if (kpiList.length > 0) {
        const kpiRecords = kpiList.map(kpi => ({
          user_id: user.id,
          kpi_id: kpi.id,
          name: kpi.name,
          friendly_name: kpi.friendlyName,
          category: kpi.category,
          unit: kpi.unit,
          frequency: kpi.frequency,
          description: kpi.description,
          current_value: kpi.currentValue,
          year1_target: kpi.year1Target,
          year2_target: kpi.year2Target,
          year3_target: kpi.year3Target,
          is_standard: kpi.isStandard || false,
          is_industry: kpi.isIndustry || false,
          is_custom: kpi.isCustom || false
        }))

        const { error } = await supabase
          .from('strategic_kpis')
          .insert(kpiRecords)

        if (error) throw error
      }
      
      setLastSaved(new Date())
    } catch (err) {
      console.error('Error saving KPIs:', err)
      setError('Failed to save KPIs')
    }
  }, [supabase])

  const saveLifeGoals = useCallback(async (goals: LifeGoal[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete existing life goals
      await supabase
        .from('life_goals')
        .delete()
        .eq('user_id', user.id)

      // Insert updated life goals
      if (goals.length > 0) {
        const goalRecords = goals.map(goal => ({
          user_id: user.id,
          category: goal.category,
          title: goal.title,
          target_amount: goal.targetAmount,
          target_year: goal.targetYear,
          description: goal.description,
          completed: goal.completed
        }))

        const { error } = await supabase
          .from('life_goals')
          .insert(goalRecords)

        if (error) throw error
      }
      
      setLastSaved(new Date())
    } catch (err) {
      console.error('Error saving life goals:', err)
      setError('Failed to save life goals')
    }
  }, [supabase])

  // Auto-save when data changes
  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        saveFinancialData(financialData)
      }, 2000) // Save 2 seconds after user stops typing
      
      return () => clearTimeout(timeoutId)
    }
  }, [financialData, saveFinancialData, isLoading])

  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        saveKPIs(kpis)
      }, 2000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [kpis, saveKPIs, isLoading])

  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        saveLifeGoals(lifeGoals)
      }, 2000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [lifeGoals, saveLifeGoals, isLoading])

  // Toggle section collapse
  const toggleSection = (section: string) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section)
    } else {
      newCollapsed.add(section)
    }
    setCollapsedSections(newCollapsed)
  }

  // Initialize on mount
  useEffect(() => {
    initializeAndLoadData()
  }, [])

  async function initializeAndLoadData() {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Please log in to access your strategic planning')
        setIsLoading(false)
        return
      }
      
      console.log('🔄 Loading business profile from database...')
      
      // FIXED: Load business profile from Supabase database instead of localStorage
      try {
        const dbBusinessProfile = await getBusinessProfile()
        console.log('📊 Database business profile:', dbBusinessProfile)
        
        if (dbBusinessProfile) {
          // Map the database industry to our KPI categories
          const mappedIndustry = mapIndustryFromDatabase(dbBusinessProfile.industry)
          console.log(`🏭 Industry mapping: "${dbBusinessProfile.industry}" → "${mappedIndustry}"`)
          
          setIndustry(mappedIndustry)
          setCurrentRevenue(dbBusinessProfile.current_revenue || 500000)
          setBusinessProfile({
            id: dbBusinessProfile.id,
            company_name: dbBusinessProfile.company_name,
            industry: mappedIndustry,
            current_revenue: dbBusinessProfile.current_revenue,
            employee_count: dbBusinessProfile.employee_count
          })
          
          console.log('✅ Business profile loaded successfully:', {
            industry: mappedIndustry,
            revenue: dbBusinessProfile.current_revenue
          })
        } else {
          console.log('⚠️ No business profile found, using defaults')
          setIndustry('building_construction')
          setCurrentRevenue(500000)
        }
      } catch (profileError) {
        console.error('❌ Error loading business profile:', profileError)
        // Continue with defaults if profile loading fails
        setIndustry('building_construction')
        setCurrentRevenue(500000)
      }

      // Load financial data from database
      const { data: strategicGoals } = await supabase
        .from('strategic_goals')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (strategicGoals) {
        setFinancialData({
          revenue: {
            current: strategicGoals.revenue_current,
            year1: strategicGoals.revenue_1_year,
            year2: strategicGoals.revenue_2_year,
            year3: strategicGoals.revenue_3_year
          },
          grossProfit: {
            current: strategicGoals.gross_profit_current,
            year1: strategicGoals.gross_profit_1_year,
            year2: strategicGoals.gross_profit_2_year,
            year3: strategicGoals.gross_profit_3_year
          },
          grossMargin: {
            current: Number(strategicGoals.gross_margin_current),
            year1: Number(strategicGoals.gross_margin_1_year),
            year2: Number(strategicGoals.gross_margin_2_year),
            year3: Number(strategicGoals.gross_margin_3_year)
          },
          netProfit: {
            current: strategicGoals.net_profit_current,
            year1: strategicGoals.net_profit_1_year,
            year2: strategicGoals.net_profit_2_year,
            year3: strategicGoals.net_profit_3_year
          },
          netMargin: {
            current: Number(strategicGoals.net_margin_current),
            year1: Number(strategicGoals.net_margin_1_year),
            year2: Number(strategicGoals.net_margin_2_year),
            year3: Number(strategicGoals.net_margin_3_year)
          },
          customers: {
            current: strategicGoals.customers_current,
            year1: strategicGoals.customers_1_year,
            year2: strategicGoals.customers_2_year,
            year3: strategicGoals.customers_3_year
          },
          employees: {
            current: strategicGoals.employees_current,
            year1: strategicGoals.employees_1_year,
            year2: strategicGoals.employees_2_year,
            year3: strategicGoals.employees_3_year
          }
        })
        setYearType(strategicGoals.year_type as 'FY' | 'CY')
        
        // FIXED: Don't override industry from strategic_goals
        // Keep the industry from business_profiles as the source of truth
        console.log('✅ Using industry from business profile, not overriding from strategic_goals')
      }

      // Load KPIs from database
      const { data: savedKPIs } = await supabase
        .from('strategic_kpis')
        .select('*')
        .eq('user_id', user.id)

      if (savedKPIs && savedKPIs.length > 0) {
        const loadedKPIs = savedKPIs.map((kpi: any) => ({
          id: kpi.kpi_id,
          name: kpi.name,
          friendlyName: kpi.friendly_name,
          category: kpi.category,
          unit: kpi.unit,
          frequency: kpi.frequency,
          description: kpi.description,
          currentValue: Number(kpi.current_value),
          year1Target: Number(kpi.year1_target),
          year2Target: Number(kpi.year2_target),
          year3Target: Number(kpi.year3_target),
          isStandard: kpi.is_standard,
          isIndustry: kpi.is_industry,
          isCustom: kpi.is_custom
        }))
        
        // FIXED: Check if industry-specific KPIs match current industry
        const currentIndustryKPIs = INDUSTRY_KPIS[industry] || []
        const loadedIndustryKPIs = loadedKPIs.filter(kpi => kpi.isIndustry)
        const standardAndCustomKPIs = loadedKPIs.filter(kpi => !kpi.isIndustry)
        
        // If loaded industry KPIs don't match current industry, replace them
        const industryKPIsMatch = currentIndustryKPIs.length > 0 && 
          loadedIndustryKPIs.some(loaded => 
            currentIndustryKPIs.some(current => current.id === loaded.id)
          )
        
        if (!industryKPIsMatch && currentIndustryKPIs.length > 0) {
          console.log(`🔄 Industry KPIs mismatch detected. Replacing with ${industry} KPIs`)
          setKpis([...standardAndCustomKPIs, ...currentIndustryKPIs])
        } else {
          setKpis(loadedKPIs)
          console.log('✅ Loaded existing KPIs:', loadedKPIs.length)
        }
      } else {
        // Initialize with standard + industry-specific KPIs if none exist
        console.log(`🎯 Initializing KPIs for industry: ${industry}`)
        
        const standardKPIs: KPIData[] = [
          {
            id: 'leads',
            name: 'Leads',
            friendlyName: 'Number of leads generated',
            category: 'Marketing',
            currentValue: 50,
            year1Target: 100,
            year2Target: 200,
            year3Target: 400,
            unit: 'number',
            frequency: 'monthly',
            description: 'Number of qualified leads generated',
            isStandard: true
          },
          {
            id: 'conversion',
            name: 'Conversion',
            friendlyName: 'Lead to customer conversion rate',
            category: 'Sales',
            currentValue: 10,
            year1Target: 15,
            year2Target: 20,
            year3Target: 25,
            unit: 'percentage',
            frequency: 'monthly',
            description: 'Percentage of leads that become customers',
            isStandard: true
          },
          {
            id: 'avg-sale',
            name: 'Average Sale',
            friendlyName: 'Average transaction value',
            category: 'Sales',
            currentValue: 5000,
            year1Target: 7500,
            year2Target: 10000,
            year3Target: 15000,
            unit: 'currency',
            frequency: 'monthly',
            description: 'Average value per sale',
            isStandard: true
          },
          {
            id: 'team-size',
            name: 'Team Size',
            friendlyName: 'Team headcount',
            category: 'People',
            currentValue: strategicGoals?.employees_current || 2,
            year1Target: strategicGoals?.employees_1_year || 4,
            year2Target: strategicGoals?.employees_2_year || 8,
            year3Target: strategicGoals?.employees_3_year || 15,
            unit: 'number',
            frequency: 'annual',
            description: 'Total team members',
            isStandard: true
          },
          {
            id: 'revenue-per-employee',
            name: 'Revenue/Employee',
            friendlyName: 'Revenue per team member',
            category: 'Productivity',
            currentValue: strategicGoals ? Math.round(strategicGoals.revenue_current / strategicGoals.employees_current) : 250000,
            year1Target: strategicGoals ? Math.round(strategicGoals.revenue_1_year / strategicGoals.employees_1_year) : 187500,
            year2Target: strategicGoals ? Math.round(strategicGoals.revenue_2_year / strategicGoals.employees_2_year) : 187500,
            year3Target: strategicGoals ? Math.round(strategicGoals.revenue_3_year / strategicGoals.employees_3_year) : 200000,
            unit: 'currency',
            frequency: 'annual',
            description: 'Revenue divided by team size',
            isStandard: true
          }
        ]
        
        // FIXED: Add industry-specific KPIs based on the loaded industry
        const industryKPIs = INDUSTRY_KPIS[industry] || []
        console.log(`📊 Adding ${industryKPIs.length} industry-specific KPIs for ${industry}`)
        
        setKpis([...standardKPIs, ...industryKPIs])
      }

      // Load life goals from database
      const { data: savedLifeGoals } = await supabase
        .from('life_goals')
        .select('*')
        .eq('user_id', user.id)

      if (savedLifeGoals && savedLifeGoals.length > 0) {
        const loadedLifeGoals = savedLifeGoals.map((goal: any) => ({
          id: goal.id,
          category: goal.category,
          title: goal.title,
          targetAmount: goal.target_amount,
          targetYear: goal.target_year,
          description: goal.description,
          completed: goal.completed
        }))
        setLifeGoals(loadedLifeGoals)
      }
      
    } catch (err) {
      console.error('❌ Error initializing data:', err)
      setError('Failed to load data. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  // Rest of the component methods remain the same...
  const updateFinancialValue = (
    metric: keyof FinancialData,
    period: 'current' | 'year1' | 'year2' | 'year3',
    value: number,
    isPercentage: boolean = false
  ) => {
    const newData = { ...financialData }
    
    if (isPercentage) {
      // Update margin and calculate dollar amount
      if (metric === 'grossMargin') {
        newData.grossMargin[period] = value
        newData.grossProfit[period] = Math.round(newData.revenue[period] * (value / 100))
      } else if (metric === 'netMargin') {
        newData.netMargin[period] = value
        newData.netProfit[period] = Math.round(newData.revenue[period] * (value / 100))
      }
    } else {
      // Update dollar amount and calculate percentage
      if (metric === 'revenue') {
        newData.revenue[period] = value
        // Recalculate profits based on existing margins
        newData.grossProfit[period] = Math.round(value * (newData.grossMargin[period] / 100))
        newData.netProfit[period] = Math.round(value * (newData.netMargin[period] / 100))
        
        // Update revenue per employee KPI
        updateRevenuePerEmployee()
      } else if (metric === 'grossProfit') {
        newData.grossProfit[period] = value
        if (newData.revenue[period] > 0) {
          newData.grossMargin[period] = Math.round((value / newData.revenue[period]) * 100)
        }
      } else if (metric === 'netProfit') {
        newData.netProfit[period] = value
        if (newData.revenue[period] > 0) {
          newData.netMargin[period] = Math.round((value / newData.revenue[period]) * 100)
        }
      } else if (metric === 'customers' || metric === 'employees') {
        newData[metric][period] = value
        if (metric === 'employees') {
          updateRevenuePerEmployee()
        }
      }
    }
    
    setFinancialData(newData)
  }

  const updateRevenuePerEmployee = () => {
    const teamSizeKPI = kpis.find(k => k.id === 'team-size')
    const revenuePerEmpIndex = kpis.findIndex(k => k.id === 'revenue-per-employee')
    
    if (teamSizeKPI && revenuePerEmpIndex !== -1) {
      const updatedKPIs = [...kpis]
      updatedKPIs[revenuePerEmpIndex] = {
        ...updatedKPIs[revenuePerEmpIndex],
        currentValue: financialData.employees.current > 0 
          ? Math.round(financialData.revenue.current / financialData.employees.current) 
          : 0,
        year1Target: financialData.employees.year1 > 0 
          ? Math.round(financialData.revenue.year1 / financialData.employees.year1) 
          : 0,
        year2Target: financialData.employees.year2 > 0 
          ? Math.round(financialData.revenue.year2 / financialData.employees.year2) 
          : 0,
        year3Target: financialData.employees.year3 > 0 
          ? Math.round(financialData.revenue.year3 / financialData.employees.year3) 
          : 0,
      }
      setKpis(updatedKPIs)
      
      // Also update team size KPI to match employees data
      const teamSizeIndex = kpis.findIndex(k => k.id === 'team-size')
      if (teamSizeIndex !== -1) {
        updatedKPIs[teamSizeIndex] = {
          ...updatedKPIs[teamSizeIndex],
          currentValue: financialData.employees.current,
          year1Target: financialData.employees.year1,
          year2Target: financialData.employees.year2,
          year3Target: financialData.employees.year3
        }
        setKpis(updatedKPIs)
      }
    }
  }

  const updateKPIValue = (
    kpiId: string,
    field: 'currentValue' | 'year1Target' | 'year2Target' | 'year3Target',
    value: number
  ) => {
    const updatedKPIs = kpis.map(kpi =>
      kpi.id === kpiId ? { ...kpi, [field]: value } : kpi
    )
    
    setKpis(updatedKPIs)
  }

  const handleKPISave = (selectedKPIs: any[]) => {
    // Add new KPIs to the existing list
    const newKPIs = selectedKPIs.map(kpi => ({
      ...kpi,
      id: kpi.id || `custom-${Date.now()}-${Math.random()}`,
      currentValue: kpi.currentValue || 0,
      year1Target: kpi.year1Target || 0,
      year2Target: kpi.year2Target || 0,
      year3Target: kpi.year3Target || 0,
      isCustom: true
    }))
    
    setKpis([...kpis, ...newKPIs])
  }

  const handleCustomKPISave = (customKPI: KPIData) => {
    setKpis([...kpis, customKPI])
  }

  const deleteKPI = (kpiId: string) => {
    setKpis(kpis.filter(k => k.id !== kpiId))
  }

  const handleProfitCalculatorComplete = (data: any) => {
    setFinancialData({
      revenue: {
        current: data.currentRevenue || 500000,
        year1: data.year1Revenue || 750000,
        year2: data.year2Revenue || 1500000,
        year3: data.year3Revenue || 3000000
      },
      grossProfit: {
        current: data.currentGrossProfit || 200000,
        year1: data.year1GrossProfit || 337500,
        year2: data.year2GrossProfit || 675000,
        year3: data.year3GrossProfit || 1350000
      },
      grossMargin: {
        current: data.currentGrossMargin || 40,
        year1: data.year1GrossMargin || 45,
        year2: data.year2GrossMargin || 45,
        year3: data.year3GrossMargin || 45
      },
      netProfit: {
        current: data.currentProfit || 50000,
        year1: data.year1Profit || 112500,
        year2: data.year2Profit || 300000,
        year3: data.year3Profit || 600000
      },
      netMargin: {
        current: data.currentNetMargin || 10,
        year1: data.year1NetMargin || 15,
        year2: data.year2NetMargin || 20,
        year3: data.year3NetMargin || 20
      },
      customers: financialData.customers, // Keep existing customer data
      employees: financialData.employees   // Keep existing employee data
    })
    
    setShowProfitCalculator(false)
    updateRevenuePerEmployee()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading strategic planner...</p>
          <p className="mt-2 text-sm text-gray-500">Fetching business profile from database...</p>
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
      <style jsx>{`
        input[type="text"] {
          -moz-appearance: textfield;
          -webkit-appearance: textfield;
          appearance: textfield;
        }
        input[type="text"]::-webkit-outer-spin-button,
        input[type="text"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
          display: none;
        }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
          display: none;
        }
      `}</style>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Strategic Planning Wizard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Build your roadmap to success
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {lastSaved && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Auto-saved {Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000) < 10 
                    ? 'just now' 
                    : `${Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000)}s ago`
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {[
              { num: 1, label: '3yr Goals & KPIs', icon: Target },
              { num: 2, label: 'Strategic Initiatives', icon: ListChecks },
              { num: 3, label: 'Annual Plan', icon: Calendar },
              { num: 4, label: '90-Day Sprint', icon: Timer }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    currentStep === step.num 
                      ? 'bg-blue-100 text-blue-800' 
                      : currentStep > step.num 
                      ? 'text-green-600 hover:bg-gray-50' 
                      : 'text-gray-400'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                  <span className="font-medium hidden sm:inline">{step.label}</span>
                  {currentStep > step.num && <CheckCircle className="h-4 w-4" />}
                </button>
                {index < 3 && <ChevronRight className="h-5 w-5 text-gray-300 mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentStep === 1 && (
          <GoalsKPIsStep 
            financialData={financialData}
            updateFinancialValue={updateFinancialValue}
            kpis={kpis}
            updateKPIValue={updateKPIValue}
            deleteKPI={deleteKPI}
            lifeGoals={lifeGoals}
            setLifeGoals={setLifeGoals}
            onOpenProfitCalculator={() => setShowProfitCalculator(true)}
            businessProfile={businessProfile}
            yearType={yearType}
            setYearType={setYearType}
            setShowKPIModal={setShowKPIModal}
            setShowCustomKPIModal={setShowCustomKPIModal}
            setShowLifeGoalModal={setShowLifeGoalModal}
            editingLifeGoal={editingLifeGoal}
            setEditingLifeGoal={setEditingLifeGoal}
            industry={industry}
            hoveredKPI={hoveredKPI}
            setHoveredKPI={setHoveredKPI}
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
            showFinancialHelp={showFinancialHelp}
            setShowFinancialHelp={setShowFinancialHelp}
          />
        )}

        {currentStep === 2 && <StrategicInitiatives />}

        {currentStep === 3 && <AnnualPlan />}

        {currentStep === 4 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Timer className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">90-Day Sprint Planning</h3>
            <p className="text-gray-600">Coming soon - this section is under development</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            disabled={currentStep === 4}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Enhanced KPI Modal */}
      <EnhancedKPIModal 
        isOpen={showKPIModal} 
        onClose={() => setShowKPIModal(false)} 
        onSave={handleKPISave} 
        businessProfile={{
          // FIXED: Pass safe business profile with correct property names
          ...businessProfile,
          currentRevenue: getCurrentRevenue(businessProfile),
          industry: industry
        }}
        onOpenCustom={() => {
          setShowKPIModal(false)
          setShowCustomKPIModal(true)
        }}
      />

      {/* Custom KPI Modal */}
      <CustomKPIModal
        isOpen={showCustomKPIModal}
        onClose={() => setShowCustomKPIModal(false)}
        onSave={handleCustomKPISave}
      />

      {/* Life Goal Modal */}
      {showLifeGoalModal && (
        <LifeGoalModal
          editingGoal={editingLifeGoal}
          setEditingGoal={setEditingLifeGoal}
          lifeGoals={lifeGoals}
          setLifeGoals={setLifeGoals}
          onClose={() => {
            setShowLifeGoalModal(false)
            setEditingLifeGoal(null)
          }}
        />
      )}

      {/* Profit Calculator Modal */}
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
                initialRevenue={getCurrentRevenue(businessProfile)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Goals & KPIs Step Component - WITH ALL REQUESTED CHANGES
function GoalsKPIsStep({ 
  financialData,
  updateFinancialValue,
  kpis,
  updateKPIValue,
  deleteKPI,
  lifeGoals,
  setLifeGoals,
  onOpenProfitCalculator,
  businessProfile,
  yearType,
  setYearType,
  setShowKPIModal,
  setShowCustomKPIModal,
  setShowLifeGoalModal,
  editingLifeGoal,
  setEditingLifeGoal,
  industry,
  hoveredKPI,
  setHoveredKPI,
  collapsedSections,
  toggleSection,
  showFinancialHelp,
  setShowFinancialHelp
}: any) {
  const currentYear = new Date().getFullYear()
  
  const getYearEndDate = (yearNum: number) => {
    if (yearType === 'FY') {
      if (yearNum === 0) return 'Last Year'
      return `FY${(currentYear + yearNum).toString().slice(-2)}`
    } else {
      if (yearNum === 0) return 'Last Year'
      return `CY${(currentYear + yearNum - 1).toString().slice(-2)}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar - SHOWING LOADED INDUSTRY */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-sm font-medium text-gray-700 mr-3">Period Type:</span>
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setYearType('FY')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    yearType === 'FY' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Financial Year
                </button>
                <button
                  onClick={() => setYearType('CY')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    yearType === 'CY' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Calendar Year
                </button>
              </div>
            </div>
            
            {/* FIXED: Show loaded industry from database */}
            <div className="text-sm text-gray-600">
              <span>Industry: </span>
              <span className="font-semibold text-gray-900 bg-green-100 px-2 py-1 rounded">
                {industry.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </span>
            </div>
          </div>
          
          <button
            onClick={onOpenProfitCalculator}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Profit Calculator
          </button>
        </div>
      </div>

      {/* Financial Goals Table - WITH HELP TOOLTIP AND TEXT INPUT FOR GROSS MARGIN */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 border-b border-gray-200 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
          onClick={() => toggleSection('financial')}
        >
          <div className="flex items-center relative">
            <DollarSign className="h-5 w-5 text-white mr-2" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Financial Goals</h3>
            <button
              onMouseEnter={() => setShowFinancialHelp(true)}
              onMouseLeave={() => setShowFinancialHelp(false)}
              onClick={(e) => e.stopPropagation()}
              className="ml-2 text-white/80 hover:text-white relative"
            >
              <Info className="h-4 w-4" />
            </button>
            <FinancialHelpCard isVisible={showFinancialHelp} />
            {collapsedSections.has('financial') ? (
              <ChevronDown className="h-5 w-5 text-white ml-auto" />
            ) : (
              <ChevronUp className="h-5 w-5 text-white ml-auto" />
            )}
          </div>
        </div>
        
        {!collapsedSections.has('financial') && (
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '240px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '48px' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                {['current', 'year1', 'year2', 'year3'].map((period, idx) => (
                  <th key={period} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                    {getYearEndDate(idx)}
                  </th>
                ))}
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Revenue */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Revenue ($)</td>
                {['current', 'year1', 'year2', 'year3'].map(period => (
                  <td key={period} className="px-4 py-4">
                    <div className="flex justify-center">
                      <input
                        type="text"
                        value={formatDollar(financialData.revenue[period as keyof typeof financialData.revenue])}
                        onChange={(e) => updateFinancialValue('revenue', period as any, parseDollarInput(e.target.value))}
                        className="w-28 px-3 py-1.5 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </td>
                ))}
                <td className="px-2 py-4"></td>
              </tr>
              
              {/* Gross Profit */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Gross Profit ($)</td>
                {['current', 'year1', 'year2', 'year3'].map(period => (
                  <td key={period} className="px-4 py-4">
                    <div className="flex justify-center">
                      <input
                        type="text"
                        value={formatDollar(financialData.grossProfit[period as keyof typeof financialData.grossProfit])}
                        onChange={(e) => updateFinancialValue('grossProfit', period as any, parseDollarInput(e.target.value))}
                        className="w-28 px-3 py-1.5 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </td>
                ))}
                <td className="px-2 py-4"></td>
              </tr>
              
              {/* Gross Margin - FIXED: Changed to text input like net margin */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Gross Margin (%)</td>
                {['current', 'year1', 'year2', 'year3'].map(period => (
                  <td key={period} className="px-4 py-4">
                    <div className="flex justify-center">
                      <input
                        type="text"
                        value={financialData.grossMargin[period as keyof typeof financialData.grossMargin]}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                            updateFinancialValue('grossMargin', period as any, Number(value), true)
                          }
                        }}
                        className="w-28 px-3 py-1.5 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </td>
                ))}
                <td className="px-2 py-4"></td>
              </tr>
              
              {/* Net Profit */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Net Profit ($)</td>
                {['current', 'year1', 'year2', 'year3'].map(period => (
                  <td key={period} className="px-4 py-4">
                    <div className="flex justify-center">
                      <input
                        type="text"
                        value={formatDollar(financialData.netProfit[period as keyof typeof financialData.netProfit])}
                        onChange={(e) => updateFinancialValue('netProfit', period as any, parseDollarInput(e.target.value))}
                        className="w-28 px-3 py-1.5 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </td>
                ))}
                <td className="px-2 py-4"></td>
              </tr>
              
              {/* Net Margin */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Net Margin (%)</td>
                {['current', 'year1', 'year2', 'year3'].map(period => (
                  <td key={period} className="px-4 py-4">
                    <div className="flex justify-center">
                      <input
                        type="text"
                        value={financialData.netMargin[period as keyof typeof financialData.netMargin]}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                            updateFinancialValue('netMargin', period as any, Number(value), true)
                          }
                        }}
                        className="w-28 px-3 py-1.5 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </td>
                ))}
                <td className="px-2 py-4"></td>
              </tr>

              {/* REMOVED: Customers and Employees rows have been removed */}
            </tbody>
          </table>
        )}
      </div>

      {/* KPI Section - COLLAPSIBLE WITH INDUSTRY-SPECIFIC KPIs PROPERLY DISPLAYED */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 border-b border-gray-200 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
          onClick={() => toggleSection('kpi')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-white mr-2" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Key Performance Indicators</h3>
              {collapsedSections.has('kpi') ? (
                <ChevronDown className="h-5 w-5 text-white ml-2" />
              ) : (
                <ChevronUp className="h-5 w-5 text-white ml-2" />
              )}
            </div>
            {!collapsedSections.has('kpi') && (
              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowCustomKPIModal(true)}
                  className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 flex items-center text-sm transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Custom KPI
                </button>
                <button
                  onClick={() => setShowKPIModal(true)}
                  className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 flex items-center text-sm transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Choose KPIs
                </button>
              </div>
            )}
          </div>
        </div>
        
        {!collapsedSections.has('kpi') && (
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '240px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '48px' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KPI
                </th>
                {['current', 'year1', 'year2', 'year3'].map((period, idx) => (
                  <th key={period} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                    {getYearEndDate(idx)}
                  </th>
                ))}
                <th className="w-12">
                  <Trash2 className="h-4 w-4 mx-auto text-gray-400" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Standard KPIs */}
              {kpis.filter((k: KPIData) => k.isStandard).length > 0 && (
                <>
                  <tr className="bg-blue-50">
                    <td colSpan={6} className="px-6 py-2 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                      Standard KPIs
                    </td>
                  </tr>
                  {kpis.filter((k: KPIData) => k.isStandard).map((kpi: KPIData) => (
                    <tr key={kpi.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 relative">
                        <div className="flex items-center">
                          <span>{kpi.name} {getUnitLabel(kpi.unit)}</span>
                          <button
                            onMouseEnter={() => setHoveredKPI(kpi.id)}
                            onMouseLeave={() => setHoveredKPI(null)}
                            className="ml-2 text-gray-400 hover:text-gray-600 relative"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </button>
                          <KPIInfoCard kpi={kpi} isVisible={hoveredKPI === kpi.id} />
                        </div>
                      </td>
                      {['currentValue', 'year1Target', 'year2Target', 'year3Target'].map(field => (
                        <td key={field} className="px-4 py-4">
                          <div className="flex justify-center">
                            <input
                              type="text"
                              value={kpi.unit === 'currency' ? formatDollar(kpi[field as keyof KPIData] as number) : kpi[field as keyof KPIData]}
                              onChange={(e) => updateKPIValue(
                                kpi.id,
                                field as any,
                                kpi.unit === 'currency' ? parseDollarInput(e.target.value) : Number(e.target.value)
                              )}
                              className={`w-28 px-3 py-1.5 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                kpi.id === 'revenue-per-employee' ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                              disabled={kpi.id === 'revenue-per-employee'}
                            />
                          </div>
                        </td>
                      ))}
                      <td className="px-2 py-4 text-center">
                        {/* Standard KPIs cannot be deleted - show lock icon */}
                        <div className="text-gray-300" title="Standard KPIs cannot be deleted">
                          🔒
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Industry Specific KPIs - FIXED TO SHOW CORRECT INDUSTRY */}
              {kpis.filter((k: KPIData) => k.isIndustry).length > 0 && (
                <>
                  <tr className="bg-green-50">
                    <td colSpan={6} className="px-6 py-2 text-xs font-semibold text-green-900 uppercase tracking-wider">
                      Industry Specific ({industry.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())})
                    </td>
                  </tr>
                  {kpis.filter((k: KPIData) => k.isIndustry).map((kpi: KPIData) => (
                    <tr key={kpi.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 relative">
                        <div className="flex items-center">
                          <span>{kpi.name} {getUnitLabel(kpi.unit)}</span>
                          <button
                            onMouseEnter={() => setHoveredKPI(kpi.id)}
                            onMouseLeave={() => setHoveredKPI(null)}
                            className="ml-2 text-gray-400 hover:text-gray-600 relative"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </button>
                          <KPIInfoCard kpi={kpi} isVisible={hoveredKPI === kpi.id} />
                        </div>
                      </td>
                      {['currentValue', 'year1Target', 'year2Target', 'year3Target'].map(field => (
                        <td key={field} className="px-4 py-4">
                          <div className="flex justify-center">
                            <input
                              type="text"
                              value={kpi.unit === 'currency' ? formatDollar(kpi[field as keyof KPIData] as number) : kpi[field as keyof KPIData]}
                              onChange={(e) => updateKPIValue(
                                kpi.id,
                                field as any,
                                kpi.unit === 'currency' ? parseDollarInput(e.target.value) : Number(e.target.value)
                              )}
                              className="w-28 px-3 py-1.5 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </td>
                      ))}
                      <td className="px-2 py-4 text-center">
                        <button
                          onClick={() => deleteKPI(kpi.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
                          title="Delete KPI"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Custom KPIs */}
              {kpis.filter((k: KPIData) => k.isCustom).length > 0 && (
                <>
                  <tr className="bg-orange-50">
                    <td colSpan={6} className="px-6 py-2 text-xs font-semibold text-orange-900 uppercase tracking-wider">
                      Custom KPIs
                    </td>
                  </tr>
                  {kpis.filter((k: KPIData) => k.isCustom).map((kpi: KPIData) => (
                    <tr key={kpi.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 relative">
                        <div className="flex items-center">
                          <span>{kpi.name} {getUnitLabel(kpi.unit)}</span>
                          <button
                            onMouseEnter={() => setHoveredKPI(kpi.id)}
                            onMouseLeave={() => setHoveredKPI(null)}
                            className="ml-2 text-gray-400 hover:text-gray-600 relative"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </button>
                          <KPIInfoCard kpi={kpi} isVisible={hoveredKPI === kpi.id} />
                        </div>
                      </td>
                      {['currentValue', 'year1Target', 'year2Target', 'year3Target'].map(field => (
                        <td key={field} className="px-4 py-4">
                          <div className="flex justify-center">
                            <input
                              type="text"
                              value={kpi.unit === 'currency' ? formatDollar(kpi[field as keyof KPIData] as number) : kpi[field as keyof KPIData]}
                              onChange={(e) => updateKPIValue(
                                kpi.id,
                                field as any,
                                kpi.unit === 'currency' ? parseDollarInput(e.target.value) : Number(e.target.value)
                              )}
                              className="w-28 px-3 py-1.5 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </td>
                      ))}
                      <td className="px-2 py-4 text-center">
                        <button
                          onClick={() => deleteKPI(kpi.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
                          title="Delete KPI"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Life & Freedom Goals Section - COLLAPSIBLE */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 border-b border-gray-200 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
          onClick={() => toggleSection('life')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-white mr-2" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Life & Freedom Goals</h3>
              {collapsedSections.has('life') ? (
                <ChevronDown className="h-5 w-5 text-white ml-2" />
              ) : (
                <ChevronUp className="h-5 w-5 text-white ml-2" />
              )}
            </div>
            {!collapsedSections.has('life') && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingLifeGoal(null)
                  setShowLifeGoalModal(true)
                }}
                className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 flex items-center text-sm font-semibold transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Life Goal
              </button>
            )}
          </div>
        </div>
        
        {!collapsedSections.has('life') && (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {['year1', 'year2', 'year3'].map((year, idx) => (
                <div key={year} className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 text-center mb-3">
                    Year {idx + 1}
                  </h4>
                  <div className="space-y-2 min-h-[150px]">
                    {lifeGoals.filter((goal: LifeGoal) => goal.targetYear === year).map((goal: LifeGoal) => {
                      const categoryConfig = LIFE_GOAL_CATEGORIES[goal.category]
                      const Icon = categoryConfig.icon
                      
                      return (
                        <div
                          key={goal.id}
                          className={`p-3 rounded-lg border ${categoryConfig.color} cursor-pointer hover:shadow-md transition-all`}
                          onClick={() => {
                            setEditingLifeGoal(goal)
                            setShowLifeGoalModal(true)
                          }}
                        >
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium block truncate">{goal.title}</span>
                              {goal.targetAmount && (
                                <span className="text-xs opacity-80">
                                  ${formatDollar(goal.targetAmount)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {lifeGoals.filter((g: LifeGoal) => g.targetYear === year).length === 0 && (
                      <button
                        onClick={() => {
                          setEditingLifeGoal({
                            id: `new-${Date.now()}`,
                            category: 'lifestyle',
                            title: '',
                            targetYear: year as any,
                            completed: false
                          })
                          setShowLifeGoalModal(true)
                        }}
                        className="w-full py-6 px-3 border-2 border-dashed border-blue-200 rounded-lg text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm"
                      >
                        <Plus className="h-4 w-4 mx-auto mb-1" />
                        Add Goal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Life Goal Modal Component - FIXED to allow year selection
function LifeGoalModal({ editingGoal, setEditingGoal, lifeGoals, setLifeGoals, onClose }: any) {
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [selectedTargetYear, setSelectedTargetYear] = useState<'year1' | 'year2' | 'year3'>(
    editingGoal?.targetYear || 'year1'
  )
  const [customGoal, setCustomGoal] = useState({
    title: editingGoal?.title || '',
    category: editingGoal?.category || 'lifestyle',
    targetYear: editingGoal?.targetYear || 'year1',
    targetAmount: editingGoal?.targetAmount ? formatDollar(editingGoal.targetAmount) : '',
    description: editingGoal?.description || ''
  })
  
  const saveCustomGoal = () => {
    if (customGoal.title) {
      const newGoal: LifeGoal = {
        id: editingGoal?.id || `life-goal-${Date.now()}`,
        title: customGoal.title,
        category: customGoal.category as any,
        targetYear: customGoal.targetYear as any,
        targetAmount: customGoal.targetAmount ? parseDollarInput(customGoal.targetAmount) : undefined,
        description: customGoal.description,
        completed: false
      }
      
      if (editingGoal && lifeGoals.find((g: LifeGoal) => g.id === editingGoal.id)) {
        setLifeGoals(lifeGoals.map((g: LifeGoal) => g.id === editingGoal.id ? newGoal : g))
      } else {
        setLifeGoals([...lifeGoals, newGoal])
      }
      
      onClose()
    }
  }
  
  const selectSuggestion = (suggestion: string, category: keyof typeof LIFE_GOAL_CATEGORIES) => {
    const newGoal: LifeGoal = {
      id: `life-goal-${Date.now()}`,
      title: suggestion,
      category,
      targetYear: selectedTargetYear,
      completed: false
    }
    setLifeGoals([...lifeGoals, newGoal])
    onClose()
  }
  
  const deleteGoal = () => {
    if (editingGoal && lifeGoals.find((g: LifeGoal) => g.id === editingGoal.id)) {
      setLifeGoals(lifeGoals.filter((g: LifeGoal) => g.id !== editingGoal.id))
      onClose()
    }
  }
  
  // If editing existing goal, show custom form immediately
  useEffect(() => {
    if (editingGoal?.title) {
      setShowCustomForm(true)
      setCustomGoal({
        title: editingGoal.title,
        category: editingGoal.category,
        targetYear: editingGoal.targetYear,
        targetAmount: editingGoal.targetAmount ? formatDollar(editingGoal.targetAmount) : '',
        description: editingGoal.description || ''
      })
    } else if (editingGoal?.targetYear) {
      // If we have a target year from clicking "Add Goal" in a specific year column
      setSelectedTargetYear(editingGoal.targetYear)
    }
  }, [editingGoal])
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Star className="h-7 w-7 mr-2" />
                Life Goals & Personal Rewards
              </h3>
              <p className="text-blue-100 mt-1">
                Define what success means to you personally
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
        
        {/* Custom Goal Form or Suggestions */}
        {showCustomForm ? (
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={customGoal.title}
                  onChange={(e) => setCustomGoal({ ...customGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Take a sabbatical"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={customGoal.category}
                  onChange={(e) => setCustomGoal({ ...customGoal, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(LIFE_GOAL_CATEGORIES).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount (optional)
                </label>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={customGoal.targetAmount}
                    onChange={(e) => setCustomGoal({ ...customGoal, targetAmount: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50,000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Year
                </label>
                <select
                  value={customGoal.targetYear}
                  onChange={(e) => setCustomGoal({ ...customGoal, targetYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="year1">Year 1</option>
                  <option value="year2">Year 2</option>
                  <option value="year3">Year 3</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={saveCustomGoal}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold"
              >
                {editingGoal?.title ? 'Update Goal' : 'Add Custom Goal'}
              </button>
              {editingGoal?.title && (
                <button
                  onClick={deleteGoal}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Goal
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Year Selection */}
            <div className="bg-blue-50 p-4 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Select Target Year:</span>
                <div className="inline-flex bg-white rounded-lg shadow-sm border border-blue-200">
                  {['year1', 'year2', 'year3'].map((year, idx) => (
                    <button
                      key={year}
                      onClick={() => setSelectedTargetYear(year as any)}
                      className={`px-4 py-2 text-sm font-medium transition-all ${
                        selectedTargetYear === year 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${
                        idx === 0 ? 'rounded-l-lg' : ''
                      } ${
                        idx === 2 ? 'rounded-r-lg' : ''
                      } ${
                        idx !== 2 ? 'border-r border-blue-200' : ''
                      }`}
                    >
                      Year {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg hover:border-blue-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-3">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-gray-900">Create Custom Goal</span>
                        <p className="text-sm text-gray-600">Design your own personal milestone</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
              
              <div className="space-y-6">
                {Object.entries(LIFE_GOAL_SUGGESTIONS).map(([category, suggestions]) => {
                  const categoryConfig = LIFE_GOAL_CATEGORIES[category as keyof typeof LIFE_GOAL_CATEGORIES]
                  const Icon = categoryConfig.icon
                  
                  return (
                    <div key={category}>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-lg ${categoryConfig.color} mb-3`}>
                        <Icon className="h-4 w-4 mr-1.5" />
                        <span className="font-medium text-sm">{categoryConfig.label}</span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {suggestions.map(suggestion => (
                          <button
                            key={suggestion}
                            onClick={() => selectSuggestion(suggestion, category as any)}
                            className="text-left p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                          >
                            <span className="text-gray-700 text-sm font-medium">
                              {suggestion}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}