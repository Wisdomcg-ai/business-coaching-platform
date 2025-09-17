// src/lib/kpi/utils/validators.ts

import { KPI, WizardKPI, BusinessProfile } from '../types'
import { VALIDATION_RULES } from '../constants'

/**
 * Validation Utilities for KPI Data
 * 
 * These utilities provide quick validation functions that complement
 * the main ValidationService. They're designed for use in UI components
 * and form validation scenarios.
 */

/**
 * Validate KPI ID format
 * 
 * @param id KPI ID to validate
 * @returns True if valid
 */
export function isValidKPIId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  return VALIDATION_RULES.VALID_ID_PATTERN.test(id)
}

/**
 * Validate KPI unit
 * 
 * @param unit Unit string to validate
 * @returns True if valid
 */
export function isValidUnit(unit: string): boolean {
  if (!unit || typeof unit !== 'string') return false
  return VALIDATION_RULES.VALID_UNITS.includes(unit.toLowerCase())
}

/**
 * Validate numeric KPI value
 * 
 * @param value Value to validate
 * @param unit KPI unit for context
 * @param allowNegative Whether negative values are allowed
 * @returns Validation result
 */
export function validateKPIValue(
  value: number,
  unit: string,
  allowNegative: boolean = false
): { isValid: boolean; error?: string } {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: 'Value must be a number' }
  }

  if (!allowNegative && value < 0) {
    return { isValid: false, error: 'Value cannot be negative' }
  }

  if (value < VALIDATION_RULES.MIN_BENCHMARK_VALUE || value > VALIDATION_RULES.MAX_BENCHMARK_VALUE) {
    return { isValid: false, error: 'Value is outside allowed range' }
  }

  // Unit-specific validation
  switch (unit.toLowerCase()) {
    case 'percentage':
      if (value > 100) {
        return { isValid: false, error: 'Percentage cannot exceed 100%' }
      }
      break
    
    case 'ratio':
      if (value < 0) {
        return { isValid: false, error: 'Ratio cannot be negative' }
      }
      break
      
    case 'days':
      if (value < 0) {
        return { isValid: false, error: 'Days cannot be negative' }
      }
      if (value > 3650) { // 10 years
        return { isValid: false, error: 'Days value seems unrealistic' }
      }
      break
  }

  return { isValid: true }
}

/**
 * Validate wizard KPI target progression
 * 
 * @param wizardKPI WizardKPI to validate
 * @returns Validation result with details
 */
export function validateWizardKPITargets(wizardKPI: WizardKPI): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  const { currentValue, year1Target, year2Target, year3Target, unit } = wizardKPI

  // Validate individual values
  const currentValidation = validateKPIValue(currentValue, unit)
  if (!currentValidation.isValid) {
    errors.push(`Current value: ${currentValidation.error}`)
  }

  const year1Validation = validateKPIValue(year1Target, unit)
  if (!year1Validation.isValid) {
    errors.push(`Year 1 target: ${year1Validation.error}`)
  }

  const year2Validation = validateKPIValue(year2Target, unit)
  if (!year2Validation.isValid) {
    errors.push(`Year 2 target: ${year2Validation.error}`)
  }

  const year3Validation = validateKPIValue(year3Target, unit)
  if (!year3Validation.isValid) {
    errors.push(`Year 3 target: ${year3Validation.error}`)
  }

  // If individual validations failed, return early
  if (errors.length > 0) {
    return { isValid: false, errors, warnings }
  }

  // Validate progression logic for growth metrics
  if (unit === 'currency' || unit === 'number') {
    // Check for declining targets
    if (year1Target < currentValue) {
      warnings.push('Year 1 target is lower than current value')
    }
    if (year2Target < year1Target) {
      warnings.push('Year 2 target is lower than Year 1 target')
    }
    if (year3Target < year2Target) {
      warnings.push('Year 3 target is lower than Year 2 target')
    }

    // Check for unrealistic growth
    if (currentValue > 0) {
      const year1Growth = (year1Target - currentValue) / currentValue
      const year2Growth = year1Target > 0 ? (year2Target - year1Target) / year1Target : 0
      const year3Growth = year2Target > 0 ? (year3Target - year2Target) / year2Target : 0

      if (year1Growth > 5) { // 500% growth
        warnings.push('Year 1 growth rate may be too ambitious (>500%)')
      }
      if (year2Growth > 3) { // 300% growth  
        warnings.push('Year 2 growth rate may be too ambitious (>300%)')
      }
      if (year3Growth > 2) { // 200% growth
        warnings.push('Year 3 growth rate may be too ambitious (>200%)')
      }

      // Check for stagnation
      if (year1Growth < 0.05 && year2Growth < 0.05 && year3Growth < 0.05) {
        warnings.push('Targets show little growth - consider more ambitious goals')
      }
    }
  }

  // For percentage-based metrics, ensure reasonable ranges
  if (unit === 'percentage') {
    const values = [currentValue, year1Target, year2Target, year3Target]
    if (values.some(v => v > 100)) {
      errors.push('Percentage values cannot exceed 100%')
    }
    if (values.some(v => v < 0)) {
      errors.push('Percentage values cannot be negative')
    }
  }

  return { 
    isValid: errors.length === 0, 
    errors, 
    warnings 
  }
}

/**
 * Validate complete KPI data structure
 * 
 * @param data Potential KPI data
 * @returns Validation result
 */
export function validateKPIData(data: any): { 
  isValid: boolean
  errors: string[]
  missingFields: string[]
} {
  const errors: string[] = []
  const missingFields: string[] = []

  // Check required fields
  VALIDATION_RULES.REQUIRED_FIELDS.forEach(field => {
    if (!(field in data) || data[field] === undefined || data[field] === null) {
      missingFields.push(field)
    }
  })

  if (missingFields.length > 0) {
    return {
      isValid: false,
      errors: [`Missing required fields: ${missingFields.join(', ')}`],
      missingFields
    }
  }

  // Validate field formats
  if (!isValidKPIId(data.id)) {
    errors.push('Invalid KPI ID format')
  }

  if (typeof data.name !== 'string' || data.name.length === 0) {
    errors.push('Name is required and must be a string')
  }

  if (typeof data.plainName !== 'string' || data.plainName.length === 0) {
    errors.push('Plain name is required and must be a string')
  }

  if (!isValidUnit(data.unit)) {
    errors.push(`Invalid unit: ${data.unit}`)
  }

  // Validate arrays
  if (!Array.isArray(data.industries) || data.industries.length === 0) {
    errors.push('Industries must be a non-empty array')
  }

  if (!Array.isArray(data.stages) || data.stages.length === 0) {
    errors.push('Stages must be a non-empty array')
  }

  if (!Array.isArray(data.tags)) {
    errors.push('Tags must be an array')
  }

  // Validate benchmarks
  if (!data.benchmarks || typeof data.benchmarks !== 'object') {
    errors.push('Benchmarks object is required')
  } else {
    const requiredBenchmarks = ['poor', 'average', 'good', 'excellent']
    requiredBenchmarks.forEach(benchmark => {
      if (!(benchmark in data.benchmarks)) {
        errors.push(`Missing benchmark: ${benchmark}`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    missingFields
  }
}

/**
 * Sanitize and clean KPI input data
 * 
 * @param input Raw input data
 * @returns Sanitized data
 */
export function sanitizeKPIInput(input: any): any {
  if (!input || typeof input !== 'object') {
    return {}
  }

  const sanitized: any = {}

  // Sanitize string fields
  if (typeof input.id === 'string') {
    sanitized.id = input.id.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')
  }

  if (typeof input.name === 'string') {
    sanitized.name = input.name.trim()
  }

  if (typeof input.plainName === 'string') {
    sanitized.plainName = input.plainName.trim()
  }

  if (typeof input.category === 'string') {
    sanitized.category = input.category.trim()
  }

  if (typeof input.description === 'string') {
    sanitized.description = input.description.trim()
  }

  if (typeof input.whyItMatters === 'string') {
    sanitized.whyItMatters = input.whyItMatters.trim()
  }

  if (typeof input.actionToTake === 'string') {
    sanitized.actionToTake = input.actionToTake.trim()
  }

  // Sanitize numeric fields
  if (typeof input.currentValue === 'number' || typeof input.currentValue === 'string') {
    const numValue = Number(input.currentValue)
    if (!isNaN(numValue)) {
      sanitized.currentValue = numValue
    }
  }

  // Sanitize arrays
  if (Array.isArray(input.tags)) {
    sanitized.tags = input.tags
      .filter((tag: any) => typeof tag === 'string')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)
  }

  if (Array.isArray(input.industries)) {
    sanitized.industries = input.industries.filter((industry: any) => 
      typeof industry === 'string' && industry.trim().length > 0
    )
  }

  if (Array.isArray(input.stages)) {
    sanitized.stages = input.stages.filter((stage: any) => 
      typeof stage === 'string' && stage.trim().length > 0
    )
  }

  // Copy other fields as-is (with basic type checking)
  const preserveFields = [
    'function', 'tier', 'unit', 'frequency', 'formula',
    'benchmarks', 'icon', 'year1Target', 'year2Target', 'year3Target',
    'isStandard', 'isIndustry', 'isCustom'
  ]

  preserveFields.forEach(field => {
    if (field in input) {
      sanitized[field] = input[field]
    }
  })

  return sanitized
}

/**
 * Validate business profile for KPI operations
 * 
 * @param profile Business profile to validate
 * @returns Validation result
 */
export function validateBusinessProfile(profile: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!profile || typeof profile !== 'object') {
    return { isValid: false, errors: ['Business profile is required'] }
  }

  if (!profile.userId || typeof profile.userId !== 'string') {
    errors.push('User ID is required')
  }

  if (!profile.industry || typeof profile.industry !== 'string') {
    errors.push('Industry is required')
  }

  if (!profile.stage || typeof profile.stage !== 'string') {
    errors.push('Business stage is required')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate search filters
 * 
 * @param filters Search filters to validate
 * @returns Validation result
 */
export function validateSearchFilters(filters: any): {
  isValid: boolean
  errors: string[]
  sanitizedFilters: any
} {
  const errors: string[] = []
  const sanitized: any = {}

  if (!filters) {
    return { isValid: true, errors: [], sanitizedFilters: {} }
  }

  // Validate query string
  if (filters.query && typeof filters.query === 'string') {
    sanitized.query = filters.query.trim()
  }

  // Validate array filters
  const arrayFilters = ['functions', 'industries', 'stages', 'tiers', 'tags']
  
  arrayFilters.forEach(filterName => {
    if (filters[filterName]) {
      if (Array.isArray(filters[filterName])) {
        sanitized[filterName] = filters[filterName].filter((item: any) => 
          typeof item === 'string' && item.trim().length > 0
        )
      } else {
        errors.push(`${filterName} must be an array`)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedFilters: sanitized
  }
}

/**
 * Check if a value is a reasonable KPI target
 * 
 * @param currentValue Current KPI value
 * @param targetValue Target KPI value
 * @param unit KPI unit
 * @returns Validation result with suggestions
 */
export function validateKPITarget(
  currentValue: number,
  targetValue: number,
  unit: string
): {
  isValid: boolean
  severity: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
} {
  if (currentValue === 0) {
    return {
      isValid: true,
      severity: 'info',
      message: 'No current value to compare against'
    }
  }

  const growthRate = (targetValue - currentValue) / currentValue

  // For currency and number metrics
  if (unit === 'currency' || unit === 'number') {
    if (growthRate < -0.5) {
      return {
        isValid: false,
        severity: 'error',
        message: 'Target represents significant decline (>50%)',
        suggestion: 'Consider setting growth targets instead of decline targets'
      }
    }
    
    if (growthRate > 10) {
      return {
        isValid: false,
        severity: 'error',
        message: 'Target growth rate is extremely high (>1000%)',
        suggestion: 'Consider more realistic growth targets'
      }
    }
    
    if (growthRate > 3) {
      return {
        isValid: true,
        severity: 'warning',
        message: 'Target growth rate is very ambitious (>300%)',
        suggestion: 'Ensure this growth rate is achievable with your resources'
      }
    }
    
    if (growthRate < 0.1) {
      return {
        isValid: true,
        severity: 'warning',
        message: 'Target growth rate is quite conservative (<10%)',
        suggestion: 'Consider more ambitious targets for business growth'
      }
    }
  }

  return {
    isValid: true,
    severity: 'info',
    message: 'Target appears reasonable'
  }
}

/**
 * Batch validate multiple wizard KPIs
 * 
 * @param wizardKPIs Array of wizard KPIs to validate
 * @returns Batch validation result
 */
export function validateWizardKPIBatch(wizardKPIs: WizardKPI[]): {
  totalKPIs: number
  validKPIs: number
  invalidKPIs: number
  errors: Array<{ kpiId: string; errors: string[] }>
  warnings: Array<{ kpiId: string; warnings: string[] }>
  summary: {
    hasErrors: boolean
    hasWarnings: boolean
    overallValid: boolean
  }
} {
  const errors: Array<{ kpiId: string; errors: string[] }> = []
  const warnings: Array<{ kpiId: string; warnings: string[] }> = []
  let validCount = 0

  wizardKPIs.forEach(kpi => {
    const validation = validateWizardKPITargets(kpi)
    
    if (validation.errors.length > 0) {
      errors.push({ kpiId: kpi.id, errors: validation.errors })
    } else {
      validCount++
    }
    
    if (validation.warnings.length > 0) {
      warnings.push({ kpiId: kpi.id, warnings: validation.warnings })
    }
  })

  return {
    totalKPIs: wizardKPIs.length,
    validKPIs: validCount,
    invalidKPIs: wizardKPIs.length - validCount,
    errors,
    warnings,
    summary: {
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0,
      overallValid: errors.length === 0
    }
  }
}