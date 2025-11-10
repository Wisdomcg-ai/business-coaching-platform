// /app/goals/hooks/useStrategicPlanning.ts
'use client'

import { useState, useCallback, useEffect } from 'react'
import { FinancialData, KPIData, StrategicInitiative, YearType } from '../types'
import { STANDARD_KPIS, INDUSTRY_KPIS } from '../utils/constants'

interface KeyAction {
  id: string
  action: string
  owner?: string
  dueDate?: string
}

export function useStrategicPlanning() {
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Financial Data & KPIs - Initialize with empty defaults to prevent hydration mismatch
  const [financialData, setFinancialData] = useState<FinancialData>({
    revenue: { current: 0, year1: 0, year2: 0, year3: 0 },
    grossProfit: { current: 0, year1: 0, year2: 0, year3: 0 },
    grossMargin: { current: 0, year1: 0, year2: 0, year3: 0 },
    netProfit: { current: 0, year1: 0, year2: 0, year3: 0 },
    netMargin: { current: 0, year1: 0, year2: 0, year3: 0 },
    customers: { current: 0, year1: 0, year2: 0, year3: 0 },
    employees: { current: 0, year1: 0, year2: 0, year3: 0 }
  })

  const [kpis, setKpis] = useState<KPIData[]>([])

  const [yearType, setYearType] = useState<YearType>('FY')

  // Step 2: Brain Dump Ideas
  const [brainDumpIdeas, setBrainDumpIdeas] = useState<StrategicInitiative[]>([])

  // Step 3: Roadmap Suggestions
  const [roadmapSuggestions, setRoadmapSuggestions] = useState<StrategicInitiative[]>([])

  // Step 4: 12-Month Initiatives
  const [twelveMonthInitiatives, setTwelveMonthInitiatives] = useState<StrategicInitiative[]>([])

  // Step 5: Annual Plan by Quarter
  const [annualPlanByQuarter, setAnnualPlanByQuarter] = useState<Record<string, StrategicInitiative[]>>({
    q1: [],
    q2: [],
    q3: [],
    q4: []
  })

  // Step 6: 90-Day Sprint
  const [sprintFocus, setSprintFocus] = useState<StrategicInitiative[]>([])
  const [sprintKeyActions, setSprintKeyActions] = useState<KeyAction[]>([])

  // Update financial value
  const updateFinancialValue = useCallback(
    (metric: keyof FinancialData, period: 'current' | 'year1' | 'year2' | 'year3', value: number, isPercentage?: boolean) => {
      setFinancialData(prev => ({
        ...prev,
        [metric]: {
          ...prev[metric],
          [period]: value
        }
      }))
    },
    []
  )

  // Update KPI value
  const updateKPIValue = useCallback(
    (kpiId: string, field: 'currentValue' | 'year1Target' | 'year2Target' | 'year3Target', value: number) => {
      setKpis(prev =>
        prev.map(kpi =>
          kpi.id === kpiId
            ? { ...kpi, [field]: value }
            : kpi
        )
      )
    },
    []
  )

  // Add KPI
  const addKPI = useCallback((kpi: KPIData) => {
    setKpis(prev => {
      // Check if KPI already exists
      if (prev.some(k => k.id === kpi.id)) {
        return prev
      }
      // Add new KPI with initialized values
      const newKPI = {
        ...kpi,
        currentValue: kpi.currentValue || 0,
        year1Target: kpi.year1Target || 0,
        year2Target: kpi.year2Target || 0,
        year3Target: kpi.year3Target || 0
      }
      return [...prev, newKPI]
    })
  }, [])

  // Delete KPI
  const deleteKPI = useCallback((kpiId: string) => {
    setKpis(prev => prev.filter(k => k.id !== kpiId))
  }, [])

  // Save all data to localStorage (for now, can be extended to Supabase)
  const saveAllData = useCallback(async () => {
    try {
      const allData = {
        financialData,
        kpis,
        yearType,
        brainDumpIdeas,
        roadmapSuggestions,
        twelveMonthInitiatives,
        annualPlanByQuarter,
        sprintFocus,
        sprintKeyActions,
        lastSaved: new Date().toISOString()
      }

      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('strategicPlan', JSON.stringify(allData))
      }

      return true
    } catch (err) {
      console.error('Error saving data:', err)
      setError('Failed to save data')
      return false
    }
  }, [
    financialData,
    kpis,
    yearType,
    brainDumpIdeas,
    roadmapSuggestions,
    twelveMonthInitiatives,
    annualPlanByQuarter,
    sprintFocus,
    sprintKeyActions
  ])

  // Load data from localStorage on mount and set defaults if no data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('strategicPlan')
        if (saved) {
          const data = JSON.parse(saved)
          if (data.financialData) setFinancialData(data.financialData)
          if (data.kpis) setKpis(data.kpis)
          if (data.yearType) setYearType(data.yearType)
          if (data.brainDumpIdeas) setBrainDumpIdeas(data.brainDumpIdeas)
          if (data.roadmapSuggestions) setRoadmapSuggestions(data.roadmapSuggestions)
          if (data.twelveMonthInitiatives) setTwelveMonthInitiatives(data.twelveMonthInitiatives)
          if (data.annualPlanByQuarter) setAnnualPlanByQuarter(data.annualPlanByQuarter)
          if (data.sprintFocus) setSprintFocus(data.sprintFocus)
          if (data.sprintKeyActions) setSprintKeyActions(data.sprintKeyActions)
        } else {
          // Initialize with defaults on first load
          setFinancialData({
            revenue: { current: 500000, year1: 750000, year2: 1500000, year3: 3000000 },
            grossProfit: { current: 200000, year1: 337500, year2: 675000, year3: 1350000 },
            grossMargin: { current: 40, year1: 45, year2: 45, year3: 45 },
            netProfit: { current: 50000, year1: 112500, year2: 300000, year3: 600000 },
            netMargin: { current: 10, year1: 15, year2: 20, year3: 20 },
            customers: { current: 100, year1: 150, year2: 300, year3: 500 },
            employees: { current: 2, year1: 4, year2: 8, year3: 15 }
          })
          setKpis([STANDARD_KPIS[0], STANDARD_KPIS[1]])
        }
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load saved data')
      }
    }
  }, [])

  return {
    // Loading & Error
    isLoading,
    error,

    // Step 1
    financialData,
    updateFinancialValue,
    kpis,
    updateKPIValue,
    addKPI,
    deleteKPI,
    yearType,
    setYearType,

    // Step 2
    brainDumpIdeas,
    setBrainDumpIdeas,

    // Step 3
    roadmapSuggestions,
    setRoadmapSuggestions,

    // Step 4
    twelveMonthInitiatives,
    setTwelveMonthInitiatives,

    // Step 5
    annualPlanByQuarter,
    setAnnualPlanByQuarter,

    // Step 6
    sprintFocus,
    setSprintFocus,
    sprintKeyActions,
    setSprintKeyActions,

    // Save
    saveAllData
  }
}