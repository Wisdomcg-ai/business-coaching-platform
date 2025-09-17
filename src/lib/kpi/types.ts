// src/lib/kpi/types.ts

import { LucideIcon } from 'lucide-react'

/**
 * Core KPI Interface - Single Source of Truth
 * 
 * This interface defines the complete structure for all KPIs in the system.
 * It serves as the foundation for the unified KPI architecture.
 */
export interface KPI {
  // Identity
  id: string                    // Unique identifier (e.g., 'monthly-revenue')
  name: string                  // Display name (e.g., 'Monthly Revenue')
  plainName: string             // User-friendly name (e.g., 'Money Coming In Each Month')
  
  // Classification
  function: BusinessFunction    // ATTRACT, CONVERT, DELIVER, etc.
  category: string              // Sub-category (e.g., 'Revenue', 'Marketing Efficiency')
  tier: KPITier                // Essential, recommended, advanced
  industries: Industry[]        // Applicable industries
  stages: BusinessStage[]       // Applicable business stages
  
  // Measurement
  unit: string                  // 'currency', 'percentage', 'number', 'days', etc.
  frequency: Frequency          // How often to measure
  formula?: string              // Optional calculation formula
  
  // Guidance
  description: string           // What this measures
  whyItMatters: string         // Business importance explanation
  actionToTake: string         // What to do with results
  
  // Benchmarks
  benchmarks: {
    poor: number | string
    average: number | string  
    good: number | string
    excellent: number | string
  }
  
  // Metadata
  icon: LucideIcon             // Icon for UI display
  tags: string[]               // For searching/filtering
  createdAt: string            // ISO timestamp
  updatedAt: string            // ISO timestamp
}

/**
 * Business Functions - The 6 Core Business Engines
 * 
 * Based on the Strategic Wheel methodology used in the platform.
 * Each function represents a key area of business performance.
 */
export enum BusinessFunction {
  ATTRACT = 'ATTRACT',          // Marketing & Lead Generation
  CONVERT = 'CONVERT',          // Sales & Conversion
  DELIVER = 'DELIVER',          // Operations & Delivery
  DELIGHT = 'DELIGHT',          // Customer Service & Retention
  PEOPLE = 'PEOPLE',            // Team & Culture
  PROFIT = 'PROFIT',            // Financial Management
  SYSTEMS = 'SYSTEMS'           // Efficiency & Productivity
}

/**
 * Industries - Supported Business Industries
 * 
 * Maps to the industry classification used throughout the platform.
 */
export enum Industry {
  CONSTRUCTION_TRADES = 'construction-trades',
  HEALTH_WELLNESS = 'health-wellness', 
  PROFESSIONAL_SERVICES = 'professional-services',
  RETAIL_ECOMMERCE = 'retail-ecommerce',
  OPERATIONS_LOGISTICS = 'operations-logistics',
  ALL = 'all'                   // Universal KPIs applicable to all industries
}

/**
 * Business Stages - Revenue-Based Business Maturity Levels
 * 
 * Aligns with the platform's revenue stage framework.
 */
export enum BusinessStage {
  FOUNDATION = 'foundation',     // 0-250K
  TRACTION = 'traction',         // 250K-1M
  GROWTH = 'growth',             // 1M-2.5M
  SCALE = 'scale',               // 2.5M-5M
  OPTIMIZATION = 'optimization', // 5M-10M
  LEADERSHIP = 'leadership'      // 10M+
}

/**
 * KPI Tiers - Importance Classification
 * 
 * Helps with progressive disclosure and prioritization.
 */
export enum KPITier {
  ESSENTIAL = 'essential',       // Every business must track
  RECOMMENDED = 'recommended',   // Important for most businesses
  ADVANCED = 'advanced'          // For sophisticated operations
}

/**
 * Measurement Frequency Options
 */
export enum Frequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  REAL_TIME = 'real-time'
}

/**
 * Context-Specific Interfaces
 * 
 * These interfaces adapt the base KPI for specific use cases.
 */

/**
 * WizardKPI - For Goals Wizard UI
 * 
 * Extends base KPI with wizard-specific fields for target setting.
 */
export interface WizardKPI {
  // Core identification
  id: string
  name: string
  friendlyName: string          // Maps to plainName
  category: string
  unit: string
  frequency: string
  description: string
  whyItMatters: string
  actionToTake: string
  benchmarks: KPI['benchmarks']
  
  // Wizard-specific fields
  currentValue: number          // Current performance
  year1Target: number           // Year 1 target
  year2Target: number           // Year 2 target  
  year3Target: number           // Year 3 target
  
  // Classification flags
  isStandard: boolean           // Standard/universal KPI
  isIndustry: boolean           // Industry-specific KPI
  isCustom: boolean             // Custom user-created KPI
}

/**
 * RecommendationKPI - For Assessment Results
 * 
 * KPIs recommended based on assessment results with context.
 */
export interface RecommendationKPI {
  id: string
  name: string
  plainName: string
  function: BusinessFunction
  tier: KPITier
  priority: Priority
  reason: string                // Why recommended based on assessment
  whyItMatters: string
  actionToTake: string
}

/**
 * Business Profile - Context for KPI Recommendations
 * 
 * Represents the business context used for filtering and recommendations.
 */
export interface BusinessProfile {
  userId: string
  industry: Industry
  stage: BusinessStage
  weakFunctions?: BusinessFunction[]  // From assessment results
  revenue?: number
  employees?: number
  customNiche?: string
}

/**
 * KPI Search and Filter Types
 */
export interface KPICriteria {
  industry?: Industry
  stage?: BusinessStage
  functions?: BusinessFunction[]
  tier?: KPITier
  tags?: string[]
}

export interface SearchFilters {
  query?: string
  functions?: BusinessFunction[]
  industries?: Industry[]
  stages?: BusinessStage[]
  tiers?: KPITier[]
  tags?: string[]
}

/**
 * Priority Levels for Recommendations
 */
export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium', 
  LOW = 'low'
}

/**
 * Cache and Service Types
 */
export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
}

export interface KPIValue {
  kpiId: string
  userId: string
  value: number
  date: string
  period: string               // e.g., '2024-01', '2024-Q1'
}

/**
 * Error Types for Better Error Handling
 */
export class KPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'KPIError'
  }
}

export class ValidationError extends KPIError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class CacheError extends KPIError {
  constructor(message: string, details?: any) {
    super(message, 'CACHE_ERROR', details) 
    this.name = 'CacheError'
  }
}

/**
 * Type Guards for Runtime Type Checking
 */
export function isKPI(obj: any): obj is KPI {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.plainName === 'string' &&
    Object.values(BusinessFunction).includes(obj.function) &&
    typeof obj.category === 'string' &&
    Object.values(KPITier).includes(obj.tier)
}

export function isWizardKPI(obj: any): obj is WizardKPI {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.currentValue === 'number' &&
    typeof obj.year1Target === 'number' &&
    typeof obj.isStandard === 'boolean'
}

export function isBusinessProfile(obj: any): obj is BusinessProfile {
  return obj &&
    typeof obj.userId === 'string' &&
    Object.values(Industry).includes(obj.industry) &&
    Object.values(BusinessStage).includes(obj.stage)
}

/**
 * Utility Types
 */
export type KPIRegistry = Map<string, KPI>
export type FunctionKPIs = Record<BusinessFunction, KPI[]>
export type IndustryKPIs = Record<Industry, KPI[]>

// Export all enums as const for better tree-shaking
export const BUSINESS_FUNCTIONS = Object.values(BusinessFunction) as const
export const INDUSTRIES = Object.values(Industry) as const  
export const BUSINESS_STAGES = Object.values(BusinessStage) as const
export const KPI_TIERS = Object.values(KPITier) as const
export const FREQUENCIES = Object.values(Frequency) as const