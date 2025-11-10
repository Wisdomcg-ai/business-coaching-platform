'use client'

import { ChevronDown, ChevronUp, DollarSign, Activity, Plus, Trash2, X, Search, AlertCircle } from 'lucide-react'
import { FinancialData, KPIData, YearType } from '../types'
import { formatDollar, parseDollarInput } from '../utils/formatting'
import { useKPIs } from '../hooks/useKPIs'
import { useState, useMemo } from 'react'

interface Step1Props {
  financialData: FinancialData
  updateFinancialValue: (metric: keyof FinancialData, period: 'current' | 'year1' | 'year2' | 'year3', value: number, isPercentage?: boolean) => void
  kpis: KPIData[]
  updateKPIValue: (kpiId: string, field: 'currentValue' | 'year1Target' | 'year2Target' | 'year3Target', value: number) => void
  addKPI?: (kpi: KPIData) => void
  deleteKPI: (kpiId: string) => void
  yearType: YearType
  setYearType: (type: YearType) => void
  collapsedSections: Set<string>
  toggleSection: (section: string) => void
  industry: string
  showKPIModal: boolean
  setShowKPIModal: (show: boolean) => void
  businessId?: string
}

export default function Step1GoalsAndKPIs({
  financialData,
  updateFinancialValue,
  kpis,
  updateKPIValue,
  addKPI,
  deleteKPI,
  yearType,
  setYearType,
  collapsedSections,
  toggleSection,
  industry,
  showKPIModal,
  setShowKPIModal,
  businessId
}: Step1Props) {
  const currentYear = new Date().getFullYear()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Use KPI hook for complete KPI management
  const {
    unselectedKPIs,
    categories,
    loading: kpisLoading,
    error: kpisError,
    searchKPIs,
    getByCategory
  } = useKPIs({
    businessId,
    autoLoad: true,
    autoSync: true
  })

  const getYearLabel = (idx: number) => {
    if (yearType === 'FY') {
      return idx === 0 ? 'Current' : `FY${(currentYear + idx).toString().slice(-2)}`
    }
    return idx === 0 ? 'Current' : `CY${(currentYear + idx - 1).toString().slice(-2)}`
  }

  const financialMetrics = [
    { label: 'Revenue ($)', key: 'revenue', isPercentage: false },
    { label: 'Gross Profit ($)', key: 'grossProfit', isPercentage: false },
    { label: 'Gross Margin (%)', key: 'grossMargin', isPercentage: true },
    { label: 'Net Profit ($)', key: 'netProfit', isPercentage: false },
    { label: 'Net Margin (%)', key: 'netMargin', isPercentage: true }
  ]

  // Filter KPIs based on search and category
  const filteredKPIs = useMemo(() => {
    let results = unselectedKPIs

    if (selectedCategory) {
      results = results.filter(kpi => kpi.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(kpi =>
        kpi.name.toLowerCase().includes(query) ||
        kpi.friendlyName?.toLowerCase().includes(query) ||
        (kpi.description && kpi.description.toLowerCase().includes(query))
      )
    }

    return results
  }, [unselectedKPIs, searchQuery, selectedCategory])

  // Group KPIs by category
  const groupedKPIs = useMemo(() => {
    const groups: Record<string, KPIData[]> = {}
    filteredKPIs.forEach(kpi => {
      const category = kpi.category || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(kpi)
    })
    return groups
  }, [filteredKPIs])

  const handleAddKPI = (kpi: KPIData) => {
    if (addKPI) {
      const newKPI = {
        ...kpi,
        currentValue: 0,
        year1Target: 0,
        year2Target: 0,
        year3Target: 0
      }
      addKPI(newKPI)
    }
  }

  return (
    <div className="space-y-6">
      {/* Year Type & Industry Selector */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-sm font-medium text-gray-700 mr-3">Period Type:</span>
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
              {['FY', 'CY'].map(type => (
                <button
                  key={type}
                  onClick={() => setYearType(type as YearType)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    yearType === type 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {type === 'FY' ? 'Fiscal Year' : 'Calendar Year'}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-gray-600 block mb-1">INDUSTRY</span>
            <span className="text-sm text-blue-700 font-semibold capitalize">
              {industry?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Goals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div
          onClick={() => toggleSection('financial')}
          className="cursor-pointer p-5 flex items-center justify-between hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
              <p className="text-sm text-gray-600">3-year revenue and profit targets</p>
            </div>
          </div>
          {collapsedSections.has('financial') ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {!collapsedSections.has('financial') && (
          <div className="border-t border-gray-200 p-6 bg-gradient-to-b from-white to-gray-50">
            <div className="space-y-6">
              {financialMetrics.map(metric => (
                <div key={metric.key} className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">{metric.label}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['current', 'year1', 'year2', 'year3'].map((period) => {
                      const value = (financialData as any)[metric.key as keyof FinancialData]?.[period as keyof any] || 0
                      return (
                        <div key={period}>
                          <label className="text-xs font-medium text-gray-600 block mb-1.5">
                            {getYearLabel(['current', 'year1', 'year2', 'year3'].indexOf(period))}
                          </label>
                          <input
                            type="text"
                            value={metric.isPercentage ? value : formatDollar(value)}
                            onChange={(e) => {
                              const numValue = metric.isPercentage
                                ? parseFloat(e.target.value) || 0
                                : parseDollarInput(e.target.value)
                              updateFinancialValue(metric.key as keyof FinancialData, period as any, numValue, metric.isPercentage)
                            }}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-blue-300 transition-colors"
                            placeholder={metric.isPercentage ? '0%' : '$0'}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div
          onClick={() => toggleSection('kpis')}
          className="cursor-pointer p-5 flex items-center justify-between hover:bg-green-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h3>
              <p className="text-sm text-gray-600">Select from 200+ metrics across all business functions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(kpis || []).length > 0 && (
              <span className="text-xs font-bold text-white bg-green-600 px-2.5 py-1 rounded-full">
                {(kpis || []).length}
              </span>
            )}
            {collapsedSections.has('kpis') ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {!collapsedSections.has('kpis') && (
          <div className="border-t border-gray-200 p-6 bg-gradient-to-b from-white to-gray-50">
            {(kpis || []).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium mb-2">No KPIs selected yet</p>
                <p className="text-sm text-gray-600 mb-6">Add KPIs from our library of 200+ metrics to track your business health</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                    setShowKPIModal(true)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors inline-flex items-center gap-2 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First KPI
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(kpis || []).map((kpi) => (
                  <div key={kpi.id} className="space-y-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{kpi.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{kpi.friendlyName}</p>
                        {kpi.category && (
                          <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {kpi.category}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteKPI(kpi.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
                        title="Delete KPI"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {(['currentValue', 'year1Target', 'year2Target', 'year3Target'] as const).map((field, idx) => (
                        <div key={field}>
                          <label className="text-xs font-medium text-gray-600 block mb-1.5">
                            {getYearLabel(idx)}
                          </label>
                          <input
                            type="number"
                            value={kpi[field] || 0}
                            onChange={(e) => updateKPIValue(kpi.id, field, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white hover:border-green-300 transition-colors"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                    setShowKPIModal(true)
                  }}
                  className="w-full px-4 py-3 border-2 border-dashed border-green-300 text-green-700 rounded-lg hover:bg-green-50 hover:border-green-400 font-medium text-sm transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <Plus className="w-4 h-4" />
                  Add Another KPI
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Selection Modal */}
      {showKPIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-50 to-green-100 border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Select KPIs to Track</h3>
                <p className="text-sm text-gray-600 mt-1">Choose from 200+ KPIs across all business functions</p>
              </div>
              <button
                onClick={() => setShowKPIModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter */}
            <div className="border-b border-gray-200 p-4 bg-white space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search KPIs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  autoFocus
                />
              </div>

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      selectedCategory === null
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({unselectedKPIs.length})
                  </button>
                  {categories.map(cat => {
                    const count = unselectedKPIs.filter(k => k.category === cat).length
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${
                          selectedCategory === cat
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {kpisError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{kpisError}</p>
                </div>
              )}

              {kpisLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading KPI library...</p>
                </div>
              ) : filteredKPIs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 font-medium">
                    {unselectedKPIs.length === 0 
                      ? 'All available KPIs already selected' 
                      : `No KPIs match your search`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedKPIs).map(([category, categoryKPIs]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">{category} ({categoryKPIs.length})</h4>
                      <div className="space-y-2">
                        {categoryKPIs.map((kpi) => (
                          <button
                            key={kpi.id}
                            onClick={() => {
                              handleAddKPI(kpi)
                              setShowKPIModal(false)
                            }}
                            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 group-hover:text-green-700">{kpi.name}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{kpi.friendlyName}</p>
                                {kpi.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{kpi.description}</p>
                                )}
                              </div>
                              <Plus className="w-4 h-4 text-gray-400 group-hover:text-green-600 flex-shrink-0 ml-2" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {unselectedKPIs.length > 0 && `${unselectedKPIs.length} available`}
              </p>
              <button
                onClick={() => setShowKPIModal(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Set realistic targets based on your current performance. These will drive your annual and 90-day plans.
        </p>
      </div>
    </div>
  )
}