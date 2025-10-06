// /src/lib/kpi/data/registry.ts
// KPI Registry - Central stats and retrieval functions
// Combines all KPI sources into a single queryable system

import { KPI, BusinessFunction, Industry, BusinessStage, KPITier } from '../types'
import { ESSENTIAL_KPIS } from './essential'
import { ATTRACT_KPIS } from './functions/attract'

// Combine all KPI sources
export const ALL_KPIS: KPI[] = [
  ...ESSENTIAL_KPIS,
  ...ATTRACT_KPIS
]

// Stats and utility functions
export function getKPIStats() {
  return {
    total: ALL_KPIS.length,
    byFunction: {
      [BusinessFunction.ATTRACT]: ALL_KPIS.filter(k => k.businessFunction === BusinessFunction.ATTRACT).length,
      [BusinessFunction.CONVERT]: ALL_KPIS.filter(k => k.businessFunction === BusinessFunction.CONVERT).length,
      [BusinessFunction.DELIVER]: ALL_KPIS.filter(k => k.businessFunction === BusinessFunction.DELIVER).length,
      [BusinessFunction.DELIGHT]: ALL_KPIS.filter(k => k.businessFunction === BusinessFunction.DELIGHT).length,
      [BusinessFunction.PEOPLE]: ALL_KPIS.filter(k => k.businessFunction === BusinessFunction.PEOPLE).length,
      [BusinessFunction.PROFIT]: ALL_KPIS.filter(k => k.businessFunction === BusinessFunction.PROFIT).length,
      [BusinessFunction.SYSTEMS]: ALL_KPIS.filter(k => k.businessFunction === BusinessFunction.SYSTEMS).length
    },
    byTier: {
      [KPITier.ESSENTIAL]: ALL_KPIS.filter(k => k.tier === KPITier.ESSENTIAL).length,
      [KPITier.RECOMMENDED]: ALL_KPIS.filter(k => k.tier === KPITier.RECOMMENDED).length,
      [KPITier.ADVANCED]: ALL_KPIS.filter(k => k.tier === KPITier.ADVANCED).length
    },
    byIndustry: {
      all: ALL_KPIS.filter(k => k.applicableIndustries.includes(Industry.ALL)).length,
      construction: ALL_KPIS.filter(k => k.applicableIndustries.includes(Industry.CONSTRUCTION_TRADES)).length,
      health: ALL_KPIS.filter(k => k.applicableIndustries.includes(Industry.HEALTH_WELLNESS)).length,
      professional: ALL_KPIS.filter(k => k.applicableIndustries.includes(Industry.PROFESSIONAL_SERVICES)).length,
      retail: ALL_KPIS.filter(k => k.applicableIndustries.includes(Industry.RETAIL_ECOMMERCE)).length,
      logistics: ALL_KPIS.filter(k => k.applicableIndustries.includes(Industry.OPERATIONS_LOGISTICS)).length
    }
  }
}

// Query functions
export function getKPIById(id: string): KPI | undefined {
  return ALL_KPIS.find(kpi => kpi.id === id)
}

export function getKPIsByFunction(businessFunction: BusinessFunction): KPI[] {
  return ALL_KPIS.filter(kpi => kpi.businessFunction === businessFunction)
}

export function getKPIsByTier(tier: KPITier): KPI[] {
  return ALL_KPIS.filter(kpi => kpi.tier === tier)
}

export function getKPIsByIndustry(industry: Industry): KPI[] {
  return ALL_KPIS.filter(kpi => 
    kpi.applicableIndustries.includes(industry) || 
    kpi.applicableIndustries.includes(Industry.ALL)
  )
}

export function getKPIsByStage(stage: BusinessStage): KPI[] {
  return ALL_KPIS.filter(kpi => kpi.applicableStages.includes(stage))
}

export function searchKPIs(query: string): KPI[] {
  const searchLower = query.toLowerCase()
  return ALL_KPIS.filter(kpi => 
    kpi.name.toLowerCase().includes(searchLower) ||
    kpi.plainName.toLowerCase().includes(searchLower) ||
    kpi.description.toLowerCase().includes(searchLower) ||
    kpi.category.toLowerCase().includes(searchLower) ||
    kpi.tags.some(tag => tag.toLowerCase().includes(searchLower))
  )
}