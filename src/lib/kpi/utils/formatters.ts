// src/lib/kpi/utils/formatters.ts

import { KPI, WizardKPI, Frequency } from '../types'

/**
 * Formatting Utilities for KPI Display
 * 
 * These utilities handle the presentation layer formatting for KPIs,
 * ensuring consistent display across the application while maintaining
 * performance and internationalization support.
 */

/**
 * Format currency values with proper localization
 * 
 * @param value Numeric value to format
 * @param currency Currency code (default: USD)
 * @param locale Locale for formatting (default: en-US)
 * @param options Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options
    })
    
    return formatter.format(value)
  } catch (error) {
    // Fallback for unsupported currencies/locales
    return `$${value.toLocaleString()}`
  }
}

/**
 * Format currency with smart abbreviations (K, M, B)
 * 
 * @param value Numeric value to format
 * @param currency Currency code
 * @returns Abbreviated currency string
 */
export function formatCurrencyCompact(value: number, currency: string = 'USD'): string {
  const absValue = Math.abs(value)
  
  if (absValue >= 1_000_000_000) {
    return formatCurrency(value / 1_000_000_000, currency) + 'B'
  } else if (absValue >= 1_000_000) {
    return formatCurrency(value / 1_000_000, currency) + 'M'
  } else if (absValue >= 1_000) {
    return formatCurrency(value / 1_000, currency) + 'K'
  }
  
  return formatCurrency(value, currency)
}

/**
 * Format percentage values
 * 
 * @param value Numeric value (0-100 or 0-1 depending on isDecimal)
 * @param isDecimal Whether input is decimal (0-1) or percentage (0-100)
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  isDecimal: boolean = false,
  decimals: number = 1
): string {
  const percentage = isDecimal ? value * 100 : value
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Format numeric values with thousands separators
 * 
 * @param value Numeric value to format
 * @param decimals Number of decimal places
 * @param locale Locale for formatting
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  } catch (error) {
    return value.toFixed(decimals)
  }
}

/**
 * Format numbers with smart abbreviations
 * 
 * @param value Numeric value to format
 * @param decimals Number of decimal places
 * @returns Abbreviated number string
 */
export function formatNumberCompact(value: number, decimals: number = 1): string {
  const absValue = Math.abs(value)
  
  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`
  } else if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`
  } else if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`
  }
  
  return formatNumber(value, decimals)
}

/**
 * Format days as human-readable duration
 * 
 * @param days Number of days
 * @returns Human-readable duration string
 */
export function formatDays(days: number): string {
  if (days === 0) return '0 days'
  if (days === 1) return '1 day'
  if (days < 7) return `${days} days`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    const remainingDays = days % 7
    if (remainingDays === 0) {
      return weeks === 1 ? '1 week' : `${weeks} weeks`
    }
    return `${weeks}w ${remainingDays}d`
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    const remainingDays = days % 30
    if (remainingDays === 0) {
      return months === 1 ? '1 month' : `${months} months`
    }
    return `${months}m ${remainingDays}d`
  }
  
  const years = Math.floor(days / 365)
  const remainingDays = days % 365
  if (remainingDays === 0) {
    return years === 1 ? '1 year' : `${years} years`
  }
  return `${years}y ${remainingDays}d`
}

/**
 * Format KPI value based on its unit type
 * 
 * @param value Numeric value to format
 * @param unit KPI unit type
 * @param compact Whether to use compact formatting
 * @returns Formatted value string
 */
export function formatKPIValue(
  value: number,
  unit: string,
  compact: boolean = false
): string {
  switch (unit.toLowerCase()) {
    case 'currency':
      return compact ? formatCurrencyCompact(value) : formatCurrency(value)
    
    case 'percentage':
      return formatPercentage(value)
    
    case 'number':
    case 'count':
      return compact ? formatNumberCompact(value) : formatNumber(value)
    
    case 'days':
      return formatDays(value)
    
    case 'hours':
      if (value < 24) return `${value.toFixed(1)} hours`
      return `${(value / 24).toFixed(1)} days`
    
    case 'minutes':
      if (value < 60) return `${value.toFixed(0)} minutes`
      return `${(value / 60).toFixed(1)} hours`
    
    case 'ratio':
      return `${value.toFixed(2)}:1`
    
    case 'score':
    case 'rating':
      return `${value.toFixed(1)}/10`
    
    case 'index':
      return formatNumber(value, 0)
    
    default:
      return compact ? formatNumberCompact(value) : formatNumber(value)
  }
}

/**
 * Format frequency for display
 * 
 * @param frequency Frequency enum value
 * @returns Human-readable frequency string
 */
export function formatFrequency(frequency: string): string {
  const frequencyMap: Record<string, string> = {
    'daily': 'Daily',
    'weekly': 'Weekly', 
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'annually': 'Annually',
    'real-time': 'Real-time'
  }
  
  return frequencyMap[frequency.toLowerCase()] || frequency
}

/**
 * Format KPI benchmark values
 * 
 * @param benchmarks KPI benchmark object
 * @param unit KPI unit for formatting
 * @returns Formatted benchmark strings
 */
export function formatKPIBenchmarks(
  benchmarks: KPI['benchmarks'],
  unit: string
): Record<keyof KPI['benchmarks'], string> {
  return {
    poor: typeof benchmarks.poor === 'number' 
      ? formatKPIValue(benchmarks.poor, unit, true)
      : String(benchmarks.poor),
    average: typeof benchmarks.average === 'number'
      ? formatKPIValue(benchmarks.average, unit, true)
      : String(benchmarks.average),
    good: typeof benchmarks.good === 'number'
      ? formatKPIValue(benchmarks.good, unit, true)
      : String(benchmarks.good),
    excellent: typeof benchmarks.excellent === 'number'
      ? formatKPIValue(benchmarks.excellent, unit, true)
      : String(benchmarks.excellent)
  }
}

/**
 * Format wizard KPI for display in the UI
 * 
 * @param wizardKPI WizardKPI object
 * @returns Formatted display object
 */
export function formatWizardKPIForDisplay(wizardKPI: WizardKPI): {
  currentValue: string
  year1Target: string
  year2Target: string
  year3Target: string
  benchmarks: ReturnType<typeof formatKPIBenchmarks>
  growth: {
    year1: string
    year2: string
    year3: string
  }
} {
  const current = formatKPIValue(wizardKPI.currentValue, wizardKPI.unit, true)
  const year1 = formatKPIValue(wizardKPI.year1Target, wizardKPI.unit, true)
  const year2 = formatKPIValue(wizardKPI.year2Target, wizardKPI.unit, true)
  const year3 = formatKPIValue(wizardKPI.year3Target, wizardKPI.unit, true)

  // Calculate growth percentages
  const calculateGrowth = (current: number, target: number): string => {
    if (current === 0) return 'N/A'
    const growth = ((target - current) / current) * 100
    const sign = growth >= 0 ? '+' : ''
    return `${sign}${growth.toFixed(1)}%`
  }

  return {
    currentValue: current,
    year1Target: year1,
    year2Target: year2,
    year3Target: year3,
    benchmarks: formatKPIBenchmarks(wizardKPI.benchmarks, wizardKPI.unit),
    growth: {
      year1: calculateGrowth(wizardKPI.currentValue, wizardKPI.year1Target),
      year2: calculateGrowth(wizardKPI.year1Target, wizardKPI.year2Target),
      year3: calculateGrowth(wizardKPI.year2Target, wizardKPI.year3Target)
    }
  }
}

/**
 * Format time duration in milliseconds to human readable
 * 
 * @param milliseconds Duration in milliseconds
 * @returns Human-readable duration string
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds}ms`
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`
  if (milliseconds < 3600000) return `${(milliseconds / 60000).toFixed(1)}m`
  return `${(milliseconds / 3600000).toFixed(1)}h`
}

/**
 * Format file size in bytes to human readable
 * 
 * @param bytes Size in bytes
 * @returns Human-readable size string
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

/**
 * Format date for KPI display
 * 
 * @param date Date string or Date object
 * @param format Format type
 * @returns Formatted date string
 */
export function formatKPIDate(
  date: string | Date,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' }
  }[format]
  
  try {
    return dateObj.toLocaleDateString('en-US', options)
  } catch (error) {
    return dateObj.toString()
  }
}

/**
 * Create display-friendly KPI summary
 * 
 * @param kpi KPI object
 * @param value Current value (optional)
 * @returns Summary object for display
 */
export function createKPISummary(kpi: KPI, value?: number): {
  title: string
  subtitle: string
  value: string | null
  unit: string
  frequency: string
  description: string
} {
  return {
    title: kpi.name,
    subtitle: kpi.plainName,
    value: value !== undefined ? formatKPIValue(value, kpi.unit, true) : null,
    unit: kpi.unit,
    frequency: formatFrequency(kpi.frequency),
    description: kpi.description
  }
}

/**
 * Format validation errors for display
 * 
 * @param errors Array of error messages
 * @param maxErrors Maximum errors to show
 * @returns Formatted error display
 */
export function formatValidationErrors(
  errors: string[],
  maxErrors: number = 5
): {
  primary: string
  details: string[]
  hasMore: boolean
  total: number
} {
  const displayErrors = errors.slice(0, maxErrors)
  const hasMore = errors.length > maxErrors
  
  return {
    primary: errors[0] || 'Validation failed',
    details: displayErrors.slice(1),
    hasMore,
    total: errors.length
  }
}