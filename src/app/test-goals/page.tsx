'use client'

import { useState } from 'react'
import { Calculator, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import ProfitCalculator from '@/components/ProfitCalculator'

interface KPI {
  id: string
  category: string
  name: string
  current_value: string
  target_value: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
}

const DEFAULT_KPI_CATEGORIES = [
  'Financial',
  'Marketing', 
  'Sales',
  'Operations',
  'People & Team',
  'Customer'
]

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
]

export default function TestGoalsPage() {
  const [showCalculator, setShowCalculator] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Financial'])
  const businessId = 'test-business-123'
  
  const [formData, setFormData] = useState({
    one_year_revenue: 1500000,
    one_year_gross_profit: 600000,
    one_year_gross_margin_percent: 40,
    one_year_net_profit: 225000,
    one_year_net_margin_percent: 15,
    kpis: [] as KPI[],
    kpi_categories: DEFAULT_KPI_CATEGORIES
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCalculatorSave = (calculatorData: any) => {
    setFormData(prev => ({
      ...prev,
      one_year_revenue: calculatorData.targetYearlyRevenue,
      one_year_gross_profit: calculatorData.yearlyGrossProfit,
      one_year_gross_margin_percent: calculatorData.grossMargin,
      one_year_net_profit: calculatorData.targetYearlyProfit,
      one_year_net_margin_percent: calculatorData.profitMargin
    }))
    
    if (calculatorData.suggestedKPIs && calculatorData.suggestedKPIs.length > 0) {
      const newKPIs = calculatorData.suggestedKPIs.map((kpi: any) => ({
        ...kpi,
        id: `kpi-${Date.now()}-${Math.random()}`
      }))
      
      setFormData(prev => ({
        ...prev,
        kpis: [...prev.kpis, ...newKPIs]
      }))
      
      const categoriesToExpand = [...new Set(newKPIs.map((kpi: any) => 
        kpi.category.charAt(0).toUpperCase() + kpi.category.slice(1)
      ))]
      setExpandedCategories(prev => [...new Set([...prev, ...categoriesToExpand])])
    }
    
    setShowCalculator(false)
  }

  const addKPI = (category: string) => {
    const newKPI: KPI = {
      id: `kpi-${Date.now()}`,
      category: category.toLowerCase(),
      name: '',
      current_value: '',
      target_value: '',
      frequency: 'monthly'
    }
    
    setFormData(prev => ({
      ...prev,
      kpis: [...prev.kpis, newKPI]
    }))
  }

  const updateKPI = (id: string, field: keyof KPI, value: any) => {
    setFormData(prev => ({
      ...prev,
      kpis: prev.kpis.map(kpi => 
        kpi.id === id ? { ...kpi, [field]: value } : kpi
      )
    }))
  }

  const deleteKPI = (id: string) => {
    setFormData(prev => ({
      ...prev,
      kpis: prev.kpis.filter(kpi => kpi.id !== id)
    }))
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-blue-600">Test Mode - Goals & Targets</h1>
            <p className="text-sm text-gray-600">Testing profit calculator without authentication</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vision & Targets</h1>
          <p className="mt-2 text-gray-600">Testing the enhanced profit calculator with industry-specific drivers</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">1-Year Goals</h2>
            <button
              onClick={() => setShowCalculator(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Show Profit Calculator
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Revenue Target
              </label>
              <div className="flex items-center">
                <span className="mr-2">$</span>
                <input
                  type="number"
                  value={formData.one_year_revenue}
                  onChange={(e) => handleInputChange('one_year_revenue', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gross Profit $
              </label>
              <div className="flex items-center">
                <span className="mr-2">$</span>
                <input
                  type="number"
                  value={formData.one_year_gross_profit}
                  onChange={(e) => handleInputChange('one_year_gross_profit', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gross Margin %
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formData.one_year_gross_margin_percent}
                  onChange={(e) => handleInputChange('one_year_gross_margin_percent', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Net Profit $
              </label>
              <div className="flex items-center">
                <span className="mr-2">$</span>
                <input
                  type="number"
                  value={formData.one_year_net_profit}
                  onChange={(e) => handleInputChange('one_year_net_profit', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Net Margin %
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formData.one_year_net_margin_percent}
                  onChange={(e) => handleInputChange('one_year_net_margin_percent', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Key Performance Indicators (KPIs)</h2>
          
          {formData.kpi_categories.map(category => {
            const categoryKPIs = formData.kpis.filter(kpi => 
              kpi.category === category.toLowerCase()
            )
            const isExpanded = expandedCategories.includes(category)
            
            return (
              <div key={category} className="mb-4 border rounded-lg">
                <div 
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleCategory(category)}
                >
                  <h3 className="font-medium text-gray-900">
                    {category} ({categoryKPIs.length})
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addKPI(category)
                        if (!isExpanded) toggleCategory(category)
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-4 pb-4">
                    {categoryKPIs.length === 0 ? (
                      <p className="text-gray-500 text-sm">No KPIs yet. Click + to add one.</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 mb-2">
                          <div className="col-span-4">KPI Name</div>
                          <div className="col-span-2">Frequency</div>
                          <div className="col-span-2">Current</div>
                          <div className="col-span-3">Target</div>
                          <div className="col-span-1"></div>
                        </div>
                        {categoryKPIs.map(kpi => (
                          <div key={kpi.id} className="grid grid-cols-12 gap-2 items-center">
                            <input
                              type="text"
                              value={kpi.name}
                              onChange={(e) => updateKPI(kpi.id, 'name', e.target.value)}
                              className="col-span-4 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="KPI Name"
                            />
                            <select
                              value={kpi.frequency}
                              onChange={(e) => updateKPI(kpi.id, 'frequency', e.target.value)}
                              className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              {FREQUENCIES.map(freq => (
                                <option key={freq.value} value={freq.value}>
                                  {freq.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={kpi.current_value}
                              onChange={(e) => updateKPI(kpi.id, 'current_value', e.target.value)}
                              className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Current"
                            />
                            <input
                              type="text"
                              value={kpi.target_value}
                              onChange={(e) => updateKPI(kpi.id, 'target_value', e.target.value)}
                              className="col-span-3 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Target"
                            />
                            <button
                              onClick={() => deleteKPI(kpi.id)}
                              className="col-span-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>Test Instructions:</strong> 
          </p>
          <ul className="list-disc ml-6 mt-2 text-blue-700">
            <li>Click "Show Profit Calculator" to test the industry-specific calculator</li>
            <li>The calculator will show different fields based on the detected industry</li>
            <li>It includes: Profit Pathway, Industry Drivers, and Suggested KPIs tabs</li>
            <li>When you apply the calculator results, it will update the goals and add KPIs</li>
          </ul>
        </div>
      </div>

      <ProfitCalculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        onSave={handleCalculatorSave}
        businessId={businessId}
      />
    </div>
  )
}
