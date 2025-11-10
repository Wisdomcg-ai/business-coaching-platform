// /app/goals/types.ts
// This file contains all TypeScript interfaces used across the goals wizard

export interface FinancialData {
  revenue: { current: number; year1: number; year2: number; year3: number }
  grossProfit: { current: number; year1: number; year2: number; year3: number }
  grossMargin: { current: number; year1: number; year2: number; year3: number }
  netProfit: { current: number; year1: number; year2: number; year3: number }
  netMargin: { current: number; year1: number; year2: number; year3: number }
  customers: { current: number; year1: number; year2: number; year3: number }
  employees: { current: number; year1: number; year2: number; year3: number }
}

export interface KPIData {
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

export interface StrategicInitiative {
  id: string
  title: string
  description?: string
  source: 'brain-dump' | 'roadmap'
  category?: string
  timeline?: 'year1' | 'year2' | 'year3'
  selected?: boolean
}

export interface BusinessProfile {
  id?: string
  company_name?: string
  industry: string
  current_revenue?: number
  employee_count?: number
}

export type YearType = 'FY' | 'CY'