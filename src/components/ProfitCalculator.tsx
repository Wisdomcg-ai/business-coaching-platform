'use client'

import { useState, useEffect } from 'react'
import { X, TrendingUp, Users, DollarSign, Target, ArrowRight, Calculator, Info } from 'lucide-react'

interface ProfitCalculatorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  businessId?: string
  industry?: string
}

interface CalculatedKPI {
  category: string
  name: string
  current_value: string
  target_value: string
  frequency: string
}

// Simplified industry configurations
const INDUSTRY_CONFIGS = {
  'general': {
    name: 'General Business',
    icon: '💼',
    profitDrivers: {
      revenue: {
        avgTransactionValue: { label: 'Average Sale Value', default: 2000, prefix: '$' },
        transactionsPerMonth: { label: 'Sales Per Month', default: 50 },
        customerRetention: { label: 'Customer Retention (%)', default: 80, suffix: '%' }
      },
      costs: {
        directCosts: { label: 'Direct Costs (%)', default: 40, suffix: '%' },
        overheadCosts: { label: 'Overhead (%)', default: 30, suffix: '%' },
        marketingCosts: { label: 'Marketing (%)', default: 10, suffix: '%' }
      }
    },
    suggestedKPIs: [
      { category: 'financial', name: 'Monthly Revenue', frequency: 'monthly' },
      { category: 'financial', name: 'Gross Profit Margin', frequency: 'monthly' },
      { category: 'sales', name: 'New Customers', frequency: 'monthly' },
      { category: 'sales', name: 'Conversion Rate', frequency: 'weekly' }
    ]
  },
  
  'building_construction': {
    name: 'Building & Construction',
    icon: '🏗️',
    profitDrivers: {
      revenue: {
        avgProjectValue: { label: 'Average Project Value', default: 150000, prefix: '$' },
        projectsPerYear: { label: 'Projects Per Year', default: 12 },
        changeOrderPercent: { label: 'Change Orders (%)', default: 10, suffix: '%' }
      },
      costs: {
        materialsCost: { label: 'Materials Cost (%)', default: 35, suffix: '%' },
        labourCost: { label: 'Labour Cost (%)', default: 30, suffix: '%' },
        subcontractorCost: { label: 'Subcontractor (%)', default: 15, suffix: '%' },
        overheadCost: { label: 'Overhead (%)', default: 10, suffix: '%' }
      }
    },
    suggestedKPIs: [
      { category: 'financial', name: 'Project Gross Margin', frequency: 'monthly' },
      { category: 'financial', name: 'Cash Flow', frequency: 'weekly' },
      { category: 'sales', name: 'Projects Won', frequency: 'monthly' },
      { category: 'sales', name: 'Quote Conversion Rate', frequency: 'monthly' },
      { category: 'operations', name: 'Project Completion Time', frequency: 'quarterly' },
      { category: 'operations', name: 'Rework Percentage', frequency: 'monthly' }
    ]
  },
  
  'fitness': {
    name: 'Fitness & Gym',
    icon: '💪',
    profitDrivers: {
      revenue: {
        totalMembers: { label: 'Total Members', default: 500 },
        avgMembershipFee: { label: 'Avg Membership Fee', default: 80, prefix: '$' },
        ptSessionsMonth: { label: 'PT Sessions/Month', default: 200 },
        ptSessionRate: { label: 'PT Session Rate', default: 70, prefix: '$' }
      },
      costs: {
        rentCost: { label: 'Rent/Facility (%)', default: 25, suffix: '%' },
        staffCost: { label: 'Staff Cost (%)', default: 35, suffix: '%' },
        equipmentCost: { label: 'Equipment (%)', default: 10, suffix: '%' },
        marketingCost: { label: 'Marketing (%)', default: 8, suffix: '%' }
      }
    },
    suggestedKPIs: [
      { category: 'financial', name: 'Revenue per Member', frequency: 'monthly' },
      { category: 'operations', name: 'Member Check-ins', frequency: 'daily' },
      { category: 'sales', name: 'New Memberships', frequency: 'weekly' },
      { category: 'sales', name: 'Member Retention Rate', frequency: 'monthly' },
      { category: 'people', name: 'PT Utilisation Rate', frequency: 'weekly' }
    ]
  },
  
  'professional_services': {
    name: 'Professional Services',
    icon: '👔',
    profitDrivers: {
      revenue: {
        billableHours: { label: 'Billable Hours/Month', default: 120 },
        hourlyRate: { label: 'Average Hourly Rate', default: 200, prefix: '$' },
        retainerClients: { label: 'Retainer Clients', default: 5 },
        projectValue: { label: 'Avg Project Value', default: 15000, prefix: '$' }
      },
      costs: {
        salaryCost: { label: 'Salary Cost (%)', default: 50, suffix: '%' },
        officeCost: { label: 'Office/Admin (%)', default: 15, suffix: '%' },
        techCost: { label: 'Technology (%)', default: 5, suffix: '%' },
        marketingCost: { label: 'Marketing (%)', default: 7, suffix: '%' }
      }
    },
    suggestedKPIs: [
      { category: 'financial', name: 'Revenue per Employee', frequency: 'monthly' },
      { category: 'financial', name: 'Billable Utilisation', frequency: 'weekly' },
      { category: 'operations', name: 'Project Delivery Time', frequency: 'monthly' },
      { category: 'sales', name: 'New Client Acquisition', frequency: 'monthly' },
      { category: 'people', name: 'Team Utilisation Rate', frequency: 'weekly' }
    ]
  }
}

export default function ProfitCalculator({ isOpen, onClose, onSave, businessId, industry = 'general' }: ProfitCalculatorProps) {
  const [activeTab, setActiveTab] = useState<'pathway' | 'drivers' | 'kpis'>('pathway')
  const [targetMonthlyProfit, setTargetMonthlyProfit] = useState(10000)
  const [profitMargin, setProfitMargin] = useState(15)
  const [selectedIndustry, setSelectedIndustry] = useState(industry)
  const [driverValues, setDriverValues] = useState<any>({})
  const [calculations, setCalculations] = useState({
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    monthlyGrossProfit: 0,
    yearlyGrossProfit: 0,
    customersNeeded: 0,
    leadsNeeded: 0,
    suggestedKPIs: [] as CalculatedKPI[]
  })

  // Map industry string to config key
  const mapIndustryToConfig = (industryStr: string): string => {
    const normalized = industryStr.toLowerCase().replace(/\s+/g, '_')
    
    if (normalized.includes('building') || normalized.includes('construction')) {
      return 'building_construction'
    }
    if (normalized.includes('fitness') || normalized.includes('gym')) {
      return 'fitness'
    }
    if (normalized.includes('professional') || normalized.includes('consulting')) {
      return 'professional_services'
    }
    
    return 'general'
  }

  // Initialize driver values based on industry
  useEffect(() => {
    const configKey = mapIndustryToConfig(selectedIndustry)
    const config = INDUSTRY_CONFIGS[configKey as keyof typeof INDUSTRY_CONFIGS] || INDUSTRY_CONFIGS.general
    
    const defaults: any = {}
    Object.entries(config.profitDrivers).forEach(([category, drivers]) => {
      Object.entries(drivers).forEach(([key, driver]) => {
        defaults[key] = driver.default
      })
    })
    setDriverValues(defaults)
  }, [selectedIndustry])

  // Recalculate when inputs change
  useEffect(() => {
    const configKey = mapIndustryToConfig(selectedIndustry)
    const config = INDUSTRY_CONFIGS[configKey as keyof typeof INDUSTRY_CONFIGS] || INDUSTRY_CONFIGS.general
    
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
    
    if (configKey === 'building_construction') {
      const avgProjectValue = driverValues.avgProjectValue || 150000
      const projectsPerYear = Math.ceil(yearlyRevenue / avgProjectValue)
      customersNeeded = projectsPerYear
      leadsNeeded = Math.ceil(projectsPerYear * 4) // Assume 25% conversion
    } else if (configKey === 'fitness') {
      const avgMembershipFee = driverValues.avgMembershipFee || 80
      customersNeeded = Math.ceil(monthlyRevenue / avgMembershipFee)
      leadsNeeded = Math.ceil(customersNeeded * 5) // Assume 20% conversion
    } else if (configKey === 'professional_services') {
      const hourlyRate = driverValues.hourlyRate || 200
      const billableHours = driverValues.billableHours || 120
      const monthlyBillable = hourlyRate * billableHours
      customersNeeded = Math.ceil(monthlyRevenue / (monthlyBillable / 10)) // Assume 10 clients
      leadsNeeded = Math.ceil(customersNeeded * 3)
    } else {
      const avgTransaction = driverValues.avgTransactionValue || 2000
      customersNeeded = Math.ceil(monthlyRevenue / avgTransaction)
      leadsNeeded = Math.ceil(customersNeeded * 3)
    }
    
    // Generate KPI suggestions with calculated targets
    const suggestedKPIs = config.suggestedKPIs.map(kpi => ({
      ...kpi,
      current_value: '0',
      target_value: calculateKPITarget(kpi, monthlyRevenue, customersNeeded)
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
  }, [targetMonthlyProfit, profitMargin, selectedIndustry, driverValues])

  // Calculate KPI targets based on business goals
  const calculateKPITarget = (kpi: any, monthlyRevenue: number, customersNeeded: number): string => {
    switch (kpi.name) {
      case 'Monthly Revenue':
        return `$${Math.round(monthlyRevenue).toLocaleString()}`
      case 'Daily Revenue':
        return `$${Math.round(monthlyRevenue / 30).toLocaleString()}`
      case 'New Customers':
      case 'New Memberships':
        return `${Math.round(customersNeeded / 12)}`
      case 'Gross Profit Margin':
        return `${profitMargin + 20}%`
      case 'Conversion Rate':
        return '25%'
      case 'Member Retention Rate':
        return '85%'
      case 'Billable Utilisation':
        return '75%'
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
      leadsNeeded: calculations.leadsNeeded,
      suggestedKPIs: calculations.suggestedKPIs,
      industry: selectedIndustry,
      driverValues
    }
    onSave(data)
  }

  if (!isOpen) return null

  const configKey = mapIndustryToConfig(selectedIndustry)
  const config = INDUSTRY_CONFIGS[configKey as keyof typeof INDUSTRY_CONFIGS] || INDUSTRY_CONFIGS.general

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>{config.icon}</span>
                Profit Calculator
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Calculate revenue needed to achieve your profit goals
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Industry Selector */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <label className="text-sm font-medium text-gray-700 mr-3">Industry:</label>
          <select
            value={configKey}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="general">General Business</option>
            <option value="building_construction">Building & Construction</option>
            <option value="fitness">Fitness & Gym</option>
            <option value="professional_services">Professional Services</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 px-6 pt-4 border-b">
          <button
            onClick={() => setActiveTab('pathway')}
            className={`pb-2 px-1 ${activeTab === 'pathway' 
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
              : 'text-gray-600 hover:text-gray-900'}`}
          >
            Profit Pathway
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`pb-2 px-1 ${activeTab === 'drivers' 
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
              : 'text-gray-600 hover:text-gray-900'}`}
          >
            Industry Drivers
          </button>
          <button
            onClick={() => setActiveTab('kpis')}
            className={`pb-2 px-1 ${activeTab === 'kpis' 
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
              : 'text-gray-600 hover:text-gray-900'}`}
          >
            Suggested KPIs
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Profit Pathway Tab */}
          {activeTab === 'pathway' && (
            <div className="space-y-6">
              {/* Input Section */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Set Your Profit Target</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Monthly Profit
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={targetMonthlyProfit}
                        onChange={(e) => setTargetMonthlyProfit(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Net Profit Margin (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={profitMargin}
                        onChange={(e) => setProfitMargin(Number(e.target.value))}
                        className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculations Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Monthly Revenue Needed</span>
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calculations.monthlyRevenue.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Yearly Revenue Needed</span>
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calculations.yearlyRevenue.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Monthly Gross Profit</span>
                    <Target className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calculations.monthlyGrossProfit.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Customers Needed</span>
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculations.customersNeeded}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Leads Needed</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculations.leadsNeeded}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Gross Margin</span>
                    <Calculator className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.min(profitMargin + 20, 50)}%
                  </p>
                </div>
              </div>

              {/* Pathway Visual */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Profit Pathway</h3>
                <div className="flex items-center justify-between space-x-2 overflow-x-auto">
                  <div className="flex-shrink-0 text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {calculations.leadsNeeded}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Leads</p>
                  </div>
                  <ArrowRight className="text-gray-400 flex-shrink-0" />
                  <div className="flex-shrink-0 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-green-600">
                        {calculations.customersNeeded}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Customers</p>
                  </div>
                  <ArrowRight className="text-gray-400 flex-shrink-0" />
                  <div className="flex-shrink-0 text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-purple-600">
                        ${(calculations.monthlyRevenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Revenue/mo</p>
                  </div>
                  <ArrowRight className="text-gray-400 flex-shrink-0" />
                  <div className="flex-shrink-0 text-center">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-yellow-700">
                        ${(targetMonthlyProfit / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Profit/mo</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Industry Drivers Tab */}
          {activeTab === 'drivers' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                  <p className="text-sm text-yellow-800">
                    Adjust these industry-specific drivers to see how they impact your profit targets
                  </p>
                </div>
              </div>

              {Object.entries(config.profitDrivers).map(([category, drivers]) => (
                <div key={category} className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 capitalize">
                    {category} Drivers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(drivers).map(([key, driver]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {driver.label}
                        </label>
                        <div className="relative">
                          {driver.prefix && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              {driver.prefix}
                            </span>
                          )}
                          <input
                            type="number"
                            value={driverValues[key] || driver.default}
                            onChange={(e) => updateDriverValue(key, Number(e.target.value))}
                            className={`w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              driver.prefix ? 'pl-8 pr-3' : driver.suffix ? 'pr-8 pl-3' : 'px-3'
                            }`}
                          />
                          {driver.suffix && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                              {driver.suffix}
                            </span>
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
                Based on your profit targets and industry, here are the KPIs you should track:
              </p>
              
              <div className="grid gap-4">
                {calculations.suggestedKPIs.map((kpi, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Track {kpi.frequency} • Category: {kpi.category}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500">Target</p>
                        <p className="text-lg font-semibold text-gray-900">{kpi.target_value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                  💡 These KPIs will be automatically added to your goals when you save the calculator results
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Ready to set your 3-year goals based on these calculations?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Use These Targets
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}