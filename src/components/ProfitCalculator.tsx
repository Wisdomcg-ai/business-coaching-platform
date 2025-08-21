'use client'

import { useState, useEffect } from 'react'
import { X, TrendingUp, Users, DollarSign, Target, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProfitCalculatorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  businessId: string
}

interface CalculatedKPI {
  category: string
  name: string
  current_value: string
  target_value: string
  frequency: string
}

// Industry-specific configurations
const INDUSTRY_CONFIGS = {
  'building_construction': {
    name: 'Building & Construction',
    icon: '🏗️',
    profitDrivers: {
      revenue: {
        avgProjectValue: { label: 'Average Project Value', default: 150000 },
        projectsPerYear: { label: 'Projects Per Year', default: 12 },
        changeOrderPercent: { label: 'Change Orders (%)', default: 10 }
      },
      costs: {
        materialsCostPercent: { label: 'Materials Cost (%)', default: 35 },
        labourCostPercent: { label: 'Labour Cost (%)', default: 30 },
        subcontractorPercent: { label: 'Subcontractor (%)', default: 15 },
        overheadPercent: { label: 'Overhead (%)', default: 10 }
      },
      efficiency: {
        reworkPercent: { label: 'Rework/Defects (%)', default: 3 },
        projectEfficiency: { label: 'Project Efficiency (%)', default: 85 },
        cashFlowDays: { label: 'Cash Collection Days', default: 45 }
      }
    },
    suggestedKPIs: [
      { category: 'financial', name: 'Project Gross Margin', frequency: 'monthly' },
      { category: 'financial', name: 'Cash Flow', frequency: 'weekly' },
      { category: 'sales', name: 'Projects Won', frequency: 'monthly' },
      { category: 'sales', name: 'Quote Conversion Rate', frequency: 'monthly' },
      { category: 'operations', name: 'Project Completion Time', frequency: 'quarterly' },
      { category: 'operations', name: 'Rework Percentage', frequency: 'monthly' },
      { category: 'people', name: 'Labour Productivity', frequency: 'weekly' },
      { category: 'people', name: 'Subcontractor Performance', frequency: 'monthly' }
    ]
  },
  
  'trades': {
    name: 'Trades (Electrical/Plumbing/HVAC)',
    icon: '🔧',
    profitDrivers: {
      revenue: {
        avgJobValue: { label: 'Average Job Value', default: 2500 },
        jobsPerWeek: { label: 'Jobs Per Week', default: 10 },
        hourlyRate: { label: 'Hourly Labour Rate', default: 120 },
        emergencyPremium: { label: 'Emergency Premium (%)', default: 50 }
      },
      costs: {
        materialsMarkup: { label: 'Materials Markup (%)', default: 30 },
        labourCostPercent: { label: 'Labour Cost (%)', default: 35 },
        vehicleCostPercent: { label: 'Vehicle/Travel (%)', default: 8 },
        overheadPercent: { label: 'Overhead (%)', default: 15 }
      },
      efficiency: {
        firstTimeFixRate: { label: 'First Time Fix Rate (%)', default: 85 },
        utilizationRate: { label: 'Technician Utilisation (%)', default: 75 },
        callbackRate: { label: 'Callback Rate (%)', default: 5 }
      }
    },
    suggestedKPIs: [
      { category: 'financial', name: 'Gross Margin per Job', frequency: 'weekly' },
      { category: 'financial', name: 'Revenue per Technician', frequency: 'monthly' },
      { category: 'sales', name: 'Jobs Completed', frequency: 'weekly' },
      { category: 'operations', name: 'First Time Fix Rate', frequency: 'weekly' },
      { category: 'operations', name: 'Average Job Duration', frequency: 'weekly' },
      { category: 'people', name: 'Technician Utilisation', frequency: 'daily' },
      { category: 'marketing', name: 'Service Calls Booked', frequency: 'weekly' }
    ]
  },
  
  'allied_health': {
    name: 'Allied Health',
    icon: '🏥',
    profitDrivers: {
      revenue: {
        sessionsPerWeek: { label: 'Sessions Per Week', default: 30 },
        avgSessionFee: { label: 'Average Session Fee', default: 120 },
        groupSessionPercent: { label: 'Group Sessions (%)', default: 20 },
        packageDealPercent: { label: 'Package Deals (%)', default: 40 }
      },
      costs: {
        practitionerCostPercent: { label: 'Practitioner Cost (%)', default: 45 },
        roomRentPercent: { label: 'Room/Rent (%)', default: 15 },
        adminCostPercent: { label: 'Admin Cost (%)', default: 10 },
        marketingPercent: { label: 'Marketing (%)', default: 5 }
      },
      efficiency: {
        cancellationRate: { label: 'Cancellation Rate (%)', default: 10 },
        utilizationRate: { label: 'Room Utilisation (%)', default: 70 },
        clientRetention: { label: 'Client Retention (%)', default: 80 }
      }
    },
    suggestedKPIs: [
      { category: 'financial', name: 'Revenue per Practitioner', frequency: 'monthly' },
      { category: 'operations', name: 'Sessions Delivered', frequency: 'weekly' },
      { category: 'operations', name: 'Cancellation Rate', frequency: 'weekly' },
      { category: 'marketing', name: 'New Client Enquiries', frequency: 'weekly' },
      { category: 'people', name: 'Practitioner Utilisation', frequency: 'weekly' },
      { category: 'sales', name: 'Package Conversion Rate', frequency: 'monthly' }
    ]
  },
  
  'professional_services': {
    name: 'Professional Services',
    icon: '💼',
    profitDrivers: {
      revenue: {
        billableHoursMonth: { label: 'Billable Hours/Month', default: 120 },
        hourlyRate: { label: 'Average Hourly Rate', default: 200 },
        retainerPercent: { label: 'Retainer Revenue (%)', default: 40 },
        projectValue: { label: 'Avg Project Value', default: 15000 }
      },
      costs: {
        salaryPercent: { label: 'Salary Cost (%)', default: 50 },
        officePercent: { label: 'Office/Admin (%)', default: 15 },
        technologyPercent: { label: 'Technology (%)', default: 5 },
        marketingPercent: { label: 'Marketing (%)', default: 7 }
      },
      efficiency: {
        utilizationRate: { label: 'Utilisation Rate (%)', default: 70 },
        writeOffPercent: { label: 'Write-offs (%)', default: 5 },
        collectionDays: { label: 'Collection Days', default: 30 },
        clientRetention: { label: 'Client Retention (%)', default: 85 }
      }
    },
    suggestedKPIs: [
      { category: 'financial', name: 'Revenue per Employee', frequency: 'monthly' },
      { category: 'financial', name: 'Billable Utilisation', frequency: 'weekly' },
      { category: 'operations', name: 'Project Delivery Time', frequency: 'monthly' },
      { category: 'sales', name: 'New Client Acquisition', frequency: 'monthly' },
      { category: 'people', name: 'Team Utilisation Rate', frequency: 'weekly' },
      { category: 'marketing', name: 'Proposal Win Rate', frequency: 'monthly' }
    ]
  },
  
  'fitness_facility': {
    name: 'Fitness Facility (with PT)',
    icon: '💪',
    profitDrivers: {
      revenue: {
        totalMembers: { label: 'Total Members', default: 500 },
        avgMembershipFee: { label: 'Avg Membership Fee', default: 80 },
        ptSessionsMonth: { label: 'PT Sessions/Month', default: 200 },
        ptSessionRate: { label: 'PT Session Rate', default: 70 },
        groupClassRevenue: { label: 'Group Class Revenue', default: 3000 }
      },
      costs: {
        rentPercent: { label: 'Rent/Facility (%)', default: 25 },
        staffPercent: { label: 'Staff Cost (%)', default: 35 },
        equipmentPercent: { label: 'Equipment (%)', default: 10 },
        marketingPercent: { label: 'Marketing (%)', default: 8 }
      },
      efficiency: {
        memberRetention: { label: 'Member Retention (%)', default: 85 },
        ptConversion: { label: 'PT Conversion (%)', default: 15 },
        classUtilisation: { label: 'Class Utilisation (%)', default: 70 },
        peakUtilisation: { label: 'Peak Hour Usage (%)', default: 80 }
      }
    },
    suggestedKPIs: [
      { category: 'financial', name: 'Revenue per Member', frequency: 'monthly' },
      { category: 'operations', name: 'Member Check-ins', frequency: 'daily' },
      { category: 'sales', name: 'New Memberships', frequency: 'weekly' },
      { category: 'sales', name: 'PT Package Sales', frequency: 'weekly' },
      { category: 'people', name: 'PT Utilisation Rate', frequency: 'weekly' },
      { category: 'marketing', name: 'Trial Conversions', frequency: 'weekly' }
    ]
  },
  
  'ecommerce': {
    name: 'E-commerce',
    icon: '🛒',
    profitDrivers: {
      revenue: {
        avgOrderValue: { label: 'Average Order Value', default: 85 },
        ordersPerMonth: { label: 'Orders Per Month', default: 500 },
        conversionRate: { label: 'Conversion Rate (%)', default: 2.5 },
        repeatPurchaseRate: { label: 'Repeat Purchase (%)', default: 30 }
      },
      costs: {
        productCostPercent: { label: 'Product Cost (%)', default: 40 },
        shippingPercent: { label: 'Shipping (%)', default: 10 },
        marketingPercent: { label: 'Marketing/CAC (%)', default: 15 },
        platformFeesPercent: { label: 'Platform Fees (%)', default: 5 }
      },
      efficiency: {
        cartAbandonRate: { label: 'Cart Abandon Rate (%)', default: 70 },
        returnRate: { label: 'Return Rate (%)', default: 10 },
        customerLifetimeValue: { label: 'Customer LTV', default: 250 },
        emailConversion: { label: 'Email Conversion (%)', default: 5 }
      }
    },
    suggestedKPIs: [
      { category: 'financial', name: 'Gross Margin per Order', frequency: 'daily' },
      { category: 'marketing', name: 'Customer Acquisition Cost', frequency: 'monthly' },
      { category: 'sales', name: 'Conversion Rate', frequency: 'daily' },
      { category: 'operations', name: 'Order Fulfilment Time', frequency: 'daily' },
      { category: 'marketing', name: 'Email Open Rate', frequency: 'weekly' },
      { category: 'sales', name: 'Average Order Value', frequency: 'weekly' }
    ]
  },
  
  'hospitality': {
    name: 'Hospitality',
    icon: '🍽️',
    profitDrivers: {
      revenue: {
        avgTransactionValue: { label: 'Avg Transaction Value', default: 45 },
        transactionsPerDay: { label: 'Transactions Per Day', default: 80 },
        beveragePercent: { label: 'Beverage Sales (%)', default: 30 },
        repeatCustomerPercent: { label: 'Repeat Customers (%)', default: 40 }
      },
      costs: {
        foodCostPercent: { label: 'Food Cost (%)', default: 30 },
        beverageCostPercent: { label: 'Beverage Cost (%)', default: 25 },
        labourCostPercent: { label: 'Labour Cost (%)', default: 30 },
        overheadPercent: { label: 'Overhead (%)', default: 10 }
      },
      efficiency: {
        tableUtilisation: { label: 'Table Turnover Rate', default: 2.5 },
        wastagePercent: { label: 'Wastage (%)', default: 5 },
        staffProductivity: { label: 'Sales per Staff Hour', default: 150 },
        peakCapacity: { label: 'Peak Capacity (%)', default: 85 }
      }
    },
    suggestedKPIs: [
      { category: 'financial', name: 'Daily Revenue', frequency: 'daily' },
      { category: 'financial', name: 'Food Cost Percentage', frequency: 'weekly' },
      { category: 'operations', name: 'Table Turnover', frequency: 'daily' },
      { category: 'sales', name: 'Average Transaction Value', frequency: 'daily' },
      { category: 'people', name: 'Labour Cost Percentage', frequency: 'weekly' },
      { category: 'marketing', name: 'Customer Reviews Rating', frequency: 'weekly' }
    ]
  }
}

export default function ProfitCalculator({ isOpen, onClose, onSave, businessId }: ProfitCalculatorProps) {
  const [industry, setIndustry] = useState<string>('professional_services')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pathway' | 'drivers' | 'kpis'>('pathway')
  
  // Profit pathway state
  const [targetMonthlyProfit, setTargetMonthlyProfit] = useState<number>(20000)
  const [profitMargin, setProfitMargin] = useState<number>(15)
  
  // Industry-specific driver values
  const [driverValues, setDriverValues] = useState<any>({})
  
  // Calculated values
  const [calculations, setCalculations] = useState({
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    monthlyGrossProfit: 0,
    yearlyGrossProfit: 0,
    customersNeeded: 0,
    leadsNeeded: 0,
    suggestedKPIs: [] as CalculatedKPI[]
  })

  // Fetch business profile on mount
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!businessId) return
      
      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('industry')
          .eq('id', businessId)
          .single()
        
        if (error) throw error
        
        if (data?.industry) {
          const industryKey = mapIndustryToConfig(data.industry)
          setIndustry(industryKey)
          
          // Initialize driver values with defaults
          const config = INDUSTRY_CONFIGS[industryKey as keyof typeof INDUSTRY_CONFIGS]
          if (config) {
            const defaults: any = {}
            Object.entries(config.profitDrivers).forEach(([section, drivers]) => {
              Object.entries(drivers).forEach(([key, driver]) => {
                defaults[key] = driver.default
              })
            })
            setDriverValues(defaults)
            
            // Set default profit margin based on industry
            const defaultMargins: any = {
              building_construction: 12,
              trades: 20,
              allied_health: 30,
              professional_services: 35,
              fitness_facility: 25,
              ecommerce: 15,
              hospitality: 10
            }
            setProfitMargin(defaultMargins[industryKey] || 15)
          }
        }
      } catch (error) {
        console.error('Error fetching business profile:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (isOpen) {
      fetchBusinessProfile()
    }
  }, [businessId, isOpen])

  // Map industry strings to config keys
  const mapIndustryToConfig = (industryStr: string): string => {
    const normalized = industryStr.toLowerCase().replace(/\s+/g, '_')
    
    if (normalized.includes('building') || normalized.includes('construction')) {
      return 'building_construction'
    }
    if (normalized.includes('trade') || normalized.includes('electric') || 
        normalized.includes('plumb') || normalized.includes('hvac')) {
      return 'trades'
    }
    if (normalized.includes('allied') || normalized.includes('health') || 
        normalized.includes('physio') || normalized.includes('psych')) {
      return 'allied_health'
    }
    if (normalized.includes('fitness') || normalized.includes('gym')) {
      return 'fitness_facility'
    }
    if (normalized.includes('ecom') || normalized.includes('online') || 
        normalized.includes('retail')) {
      return 'ecommerce'
    }
    if (normalized.includes('hospit') || normalized.includes('restaurant') || 
        normalized.includes('cafe') || normalized.includes('food')) {
      return 'hospitality'
    }
    
    return 'professional_services'
  }

  // Recalculate when inputs change
  useEffect(() => {
    const config = INDUSTRY_CONFIGS[industry as keyof typeof INDUSTRY_CONFIGS]
    if (!config) return
    
    // Calculate revenue from profit target
    const monthlyRevenue = profitMargin > 0 ? (targetMonthlyProfit / (profitMargin / 100)) : 0
    const yearlyRevenue = monthlyRevenue * 12
    
    // Calculate gross profit (assumes gross margin is higher than net margin)
    const grossMargin = Math.min(profitMargin + 20, 50)
    const monthlyGrossProfit = monthlyRevenue * (grossMargin / 100)
    const yearlyGrossProfit = monthlyGrossProfit * 12
    
    // Calculate customers needed based on industry
    let customersNeeded = 0
    let leadsNeeded = 0
    
    switch (industry) {
      case 'building_construction':
        const avgProjectValue = driverValues.avgProjectValue || 150000
        const projectsPerYear = Math.ceil(yearlyRevenue / avgProjectValue)
        customersNeeded = projectsPerYear
        leadsNeeded = Math.ceil(projectsPerYear * 4) // Assume 25% conversion
        break
        
      case 'trades':
        const jobsPerWeek = driverValues.jobsPerWeek || 10
        customersNeeded = jobsPerWeek * 52
        leadsNeeded = Math.ceil(customersNeeded * 2) // Assume 50% conversion
        break
        
      case 'fitness_facility':
        const avgMembershipFee = driverValues.avgMembershipFee || 80
        customersNeeded = Math.ceil(monthlyRevenue / avgMembershipFee)
        leadsNeeded = Math.ceil(customersNeeded * 5) // Assume 20% conversion
        break
        
      case 'ecommerce':
        const avgOrderValue = driverValues.avgOrderValue || 85
        customersNeeded = Math.ceil(monthlyRevenue / avgOrderValue)
        leadsNeeded = Math.ceil(customersNeeded * 40) // Assume 2.5% conversion
        break
        
      default:
        customersNeeded = Math.ceil(monthlyRevenue / 2000)
        leadsNeeded = Math.ceil(customersNeeded * 3)
    }
    
    // Generate KPI suggestions with calculated targets
    const suggestedKPIs = config.suggestedKPIs.map(kpi => ({
      ...kpi,
      current_value: '0',
      target_value: calculateKPITarget(kpi, {
        monthlyRevenue,
        customersNeeded,
        industry,
        driverValues
      })
    }))
    
    setCalculations({
      monthlyRevenue: Math.round(monthlyRevenue),
      yearlyRevenue: Math.round(yearlyRevenue),
      monthlyGrossProfit: Math.round(monthlyGrossProfit),
      yearlyGrossProfit: Math.round(yearlyGrossProfit),
      customersNeeded,
      leadsNeeded,
      suggestedKPIs
    })
  }, [targetMonthlyProfit, profitMargin, industry, driverValues])

  // Calculate KPI targets based on business goals
  const calculateKPITarget = (kpi: any, context: any): string => {
    const { monthlyRevenue, customersNeeded, industry } = context
    
    // Industry-specific KPI calculations
    switch (`${kpi.category}-${kpi.name}`) {
      case 'financial-Daily Revenue':
        return `$${Math.round(monthlyRevenue / 30)}`
      case 'sales-New Memberships':
        return `${Math.round(customersNeeded / 52)}`
      case 'operations-Sessions Delivered':
        return `${Math.round(customersNeeded * 4)}`
      case 'people-Labour Productivity':
        return `$${Math.round(monthlyRevenue / 160 / 5)}` // Revenue per hour per person
      default:
        return 'TBD'
    }
  }

  const updateDriverValue = (key: string, value: number) => {
    setDriverValues((prev: any) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    const data = {
      targetMonthlyRevenue: calculations.monthlyRevenue,
      targetYearlyRevenue: calculations.yearlyRevenue,
      targetMonthlyProfit,
      targetYearlyProfit: targetMonthlyProfit * 12,
      profitMargin,
      grossMargin: Math.min(profitMargin + 20, 50),
      monthlyGrossProfit: calculations.monthlyGrossProfit,
      yearlyGrossProfit: calculations.yearlyGrossProfit,
      customersNeeded: calculations.customersNeeded,
      suggestedKPIs: calculations.suggestedKPIs,
      industry,
      driverValues
    }
    onSave(data)
  }

  if (!isOpen) return null

  const config = INDUSTRY_CONFIGS[industry as keyof typeof INDUSTRY_CONFIGS]
  if (!config) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>{config.icon}</span>
              Profit Calculator - {config.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Industry-specific profit pathway and drivers
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('pathway')}
            className={`pb-2 px-1 ${activeTab === 'pathway' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'}`}
          >
            Profit Pathway
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`pb-2 px-1 ${activeTab === 'drivers' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'}`}
          >
            Industry Drivers
          </button>
          <button
            onClick={() => setActiveTab('kpis')}
            className={`pb-2 px-1 ${activeTab === 'kpis' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'}`}
          >
            Suggested KPIs
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Profit Pathway Tab */}
            {activeTab === 'pathway' && (
              <div className="space-y-6">
                {/* Visual Pathway */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Your Pathway to Profit</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-semibold">Leads</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {calculations.leadsNeeded.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">per year</div>
                    </div>
                    
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                    
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                      <div className="font-semibold">Customers</div>
                      <div className="text-2xl font-bold text-indigo-600">
                        {calculations.customersNeeded.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">needed</div>
                    </div>
                    
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                    
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="font-semibold">Revenue</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${calculations.monthlyRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">per month</div>
                    </div>
                    
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                    
                    <div className="text-center bg-green-100 p-4 rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-700" />
                      <div className="font-semibold">Net Profit</div>
                      <div className="text-2xl font-bold text-green-700">
                        ${targetMonthlyProfit.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">per month</div>
                    </div>
                  </div>
                </div>

                {/* Profit Inputs */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Monthly Profit
                    </label>
                    <div className="flex items-center">
                      <span className="mr-2">$</span>
                      <input
                        type="number"
                        value={targetMonthlyProfit}
                        onChange={(e) => setTargetMonthlyProfit(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Net Margin %
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={profitMargin}
                        onChange={(e) => setProfitMargin(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                </div>

                {/* Calculated Results */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Calculated Targets:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Monthly Revenue</div>
                      <div className="text-xl font-bold">${calculations.monthlyRevenue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Yearly Revenue</div>
                      <div className="text-xl font-bold">${calculations.yearlyRevenue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Monthly Gross Profit</div>
                      <div className="text-xl font-bold">${calculations.monthlyGrossProfit.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Yearly Net Profit</div>
                      <div className="text-xl font-bold">${(targetMonthlyProfit * 12).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Industry Drivers Tab */}
            {activeTab === 'drivers' && (
              <div className="space-y-6">
                {Object.entries(config.profitDrivers).map(([section, drivers]) => (
                  <div key={section} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 capitalize">{section} Drivers</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(drivers).map(([key, driver]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {driver.label}
                          </label>
                          <div className="flex items-center">
                            {key.includes('Percent') || key.includes('Rate') ? (
                              <>
                                <input
                                  type="number"
                                  value={driverValues[key] || driver.default}
                                  onChange={(e) => updateDriverValue(key, Number(e.target.value))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="ml-2">%</span>
                              </>
                            ) : key.includes('Value') || key.includes('Rate') || key.includes('Revenue') ? (
                              <>
                                <span className="mr-2">$</span>
                                <input
                                  type="number"
                                  value={driverValues[key] || driver.default}
                                  onChange={(e) => updateDriverValue(key, Number(e.target.value))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </>
                            ) : (
                              <input
                                type="number"
                                value={driverValues[key] || driver.default}
                                onChange={(e) => updateDriverValue(key, Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested KPIs Tab */}
            {activeTab === 'kpis' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  These KPIs will be automatically added to your goals based on your industry and targets.
                </p>
                <div className="space-y-2">
                  {calculations.suggestedKPIs.map((kpi, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded capitalize">
                          {kpi.category}
                        </span>
                        <span className="font-medium">{kpi.name}</span>
                        <span className="text-sm text-gray-500">({kpi.frequency})</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Target:</span>
                        <span className="font-semibold">{kpi.target_value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply to Goals & KPIs
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}