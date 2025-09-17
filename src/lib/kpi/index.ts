// src/lib/kpi/index.ts

/**
 * KPI System - Main Export
 * 
 * This is the main entry point for the unified KPI system architecture.
 * It provides a clean, organized interface for importing KPI functionality
 * throughout the application.
 * 
 * Usage:
 * import { useWizardKPIs, getKPIService } from '@/lib/kpi'
 * import { BusinessFunction, Industry } from '@/lib/kpi'
 * import { formatCurrency, validateKPIValue } from '@/lib/kpi'
 */

// Import FEATURE_FLAGS first to avoid circular reference
import { FEATURE_FLAGS } from './constants'

// ============================================================================
// CORE TYPES & INTERFACES
// ============================================================================
export type {
  // Core KPI Types
  KPI,
  WizardKPI,
  RecommendationKPI,
  BusinessProfile,
  KPICriteria,
  SearchFilters,
  KPIValue,
  
  // Cache and Service Types
  CacheEntry,
  
  // Hook Return Types
  UseKPIsReturn,
  UseWizardKPIsReturn,
  UseKPISearchReturn,
  UseKPIStatsReturn
} from './types'

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================
export {
  // Core Enums
  BusinessFunction,
  Industry,
  BusinessStage,
  KPITier,
  Frequency,
  Priority,
  
  // Type Guards
  isKPI,
  isWizardKPI,
  isBusinessProfile,
  
  // Constant Arrays
  BUSINESS_FUNCTIONS,
  INDUSTRIES,
  BUSINESS_STAGES,
  KPI_TIERS,
  FREQUENCIES
} from './types'

export {
  // Metadata Constants
  BUSINESS_FUNCTION_METADATA,
  INDUSTRY_METADATA,
  BUSINESS_STAGE_METADATA,
  KPI_TIER_METADATA,
  
  // Configuration
  CACHE_CONFIG,
  PERFORMANCE_THRESHOLDS,
  VALIDATION_RULES,
  DEFAULTS,
  FEATURE_FLAGS,
  
  // Helper Functions
  getBusinessFunctionMetadata,
  getIndustryMetadata,
  getBusinessStageMetadata,
  getKPITierMetadata,
  isValidKPIId as isValidKPIIdConstant,
  isValidUnit as isValidUnitConstant
} from './constants'

// ============================================================================
// SERVICES
// ============================================================================

// KPI Service
export {
  KPIService,
  getKPIService,
  createKPIService,
  initializeKPIService,
  getKPIById,
  searchKPIs,
  getKPIsForBusiness
} from './services/kpi-service'

// Cache Service  
export {
  CacheService,
  getCacheService,
  createCacheService,
  cache
} from './services/cache-service'

// Validation Service
export {
  ValidationService,
  getValidationService,
  createValidationService,
  validateKPI,
  validateWizardKPI,
  validateBusinessProfile
} from './services/validation-service'

// ============================================================================
// DATA & REGISTRY
// ============================================================================
export {
  KPIRegistry,
  kpiRegistry,
  initializeKPIRegistry,
  getAllKPIs,
  getKPIById as getKPIByIdRegistry,
  getKPIsByFunction,
  getKPIsByIndustry,
  getKPIsByStage,
  getKPIsByTier,
  registerKPI,
  registerKPIs,
  debugRegistry,
  resetRegistry,
  measureRegistryPerformance,
  createKPI,
  loadKPIBatch
} from './data/index'

// ============================================================================
// ADAPTERS
// ============================================================================
export {
  WizardKPIAdapter,
  toWizardFormat,
  toWizardFormatArray,
  createCustomWizardKPI,
  validateTargetProgression,
  batchConvertToWizardFormat
} from './adapters/wizard-adapter'

// ============================================================================
// REACT HOOKS
// ============================================================================
export {
  useKPIs,
  useWizardKPIs,
  useKPISearch,
  useKPIStats
} from './hooks/use-kpis'

// ============================================================================
// UTILITIES
// ============================================================================

// Formatters
export {
  formatCurrency,
  formatCurrencyCompact,
  formatPercentage,
  formatNumber,
  formatNumberCompact,
  formatDays,
  formatKPIValue,
  formatFrequency,
  formatKPIBenchmarks,
  formatWizardKPIForDisplay,
  formatDuration,
  formatFileSize,
  formatKPIDate,
  createKPISummary,
  formatValidationErrors
} from './utils/formatters'

// Validators
export {
  isValidKPIId,
  isValidUnit,
  validateKPIValue,
  validateWizardKPITargets,
  validateKPIData,
  sanitizeKPIInput,
  validateBusinessProfile as validateBusinessProfileUtil,
  validateSearchFilters,
  validateKPITarget,
  validateWizardKPIBatch
} from './utils/validators'

// Mappers
export {
  mapBusinessIndustryToKPIIndustry,
  mapRevenueToStage,
  mapAssessmentToFunctions,
  mapKPIToWizardFormat,
  mapLegacyKPIToNewFormat,
  mapWizardKPIsToSaveFormat,
  mapDatabaseToWizardKPIs,
  createBusinessProfileFromUserData
} from './utils/mappers'

// ============================================================================
// ERROR TYPES
// ============================================================================
export {
  KPIError,
  ValidationError,
  CacheError
} from './types'

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Initialize the entire KPI system
 * 
 * Call this function once during application startup to initialize
 * all KPI services and load the KPI registry.
 * 
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeKPISystem(): Promise<void> {
  console.log('🚀 Initializing KPI System...')
  
  try {
    // Initialize registry first
    const { initializeKPIRegistry } = await import('./data/index')
    await initializeKPIRegistry()
    
    // Initialize KPI service
    const { initializeKPIService } = await import('./services/kpi-service')
    await initializeKPIService()
    
    console.log('✅ KPI System initialization complete')
  } catch (error) {
    console.error('❌ KPI System initialization failed:', error)
    throw error
  }
}

/**
 * Get KPI system health status
 * 
 * @returns System health information
 */
export function getKPISystemHealth(): {
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: {
    registry: boolean
    cache: boolean
    validation: boolean
  }
  stats: any
} {
  try {
    // Use dynamic imports to avoid circular dependencies
    const { kpiRegistry } = require('./data/index')
    const { getKPIService } = require('./services/kpi-service') 
    const { getCacheService } = require('./services/cache-service')

    const registryStats = kpiRegistry.getStats()
    const kpiStats = getKPIService().getStats()
    const cacheStats = getCacheService().getStats()

    const services = {
      registry: kpiRegistry.isInitialized(),
      cache: parseInt(cacheStats.hitRate) > 0,
      validation: true // ValidationService is always available
    }

    const allServicesHealthy = Object.values(services).every(Boolean)
    const status = allServicesHealthy ? 'healthy' : 'degraded'

    return {
      status,
      services,
      stats: {
        registry: registryStats,
        kpi: kpiStats,
        cache: cacheStats
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      services: {
        registry: false,
        cache: false,
        validation: false
      },
      stats: { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

/**
 * Reset entire KPI system (for testing/debugging)
 * 
 * @param reinitialize Whether to reinitialize after reset
 */
export async function resetKPISystem(reinitialize: boolean = false): Promise<void> {
  console.log('🔄 Resetting KPI System...')
  
  try {
    // Clear registry
    const { resetRegistry } = await import('./data/index')
    resetRegistry()
    
    // Clear cache
    const { getCacheService } = await import('./services/cache-service')
    const cacheService = getCacheService()
    await cacheService.clear()
    
    console.log('✅ KPI System reset complete')
    
    if (reinitialize) {
      await initializeKPISystem()
    }
  } catch (error) {
    console.error('❌ KPI System reset failed:', error)
    throw error
  }
}

/**
 * Quick start helper for new projects
 * 
 * This function provides a simple way to get started with the KPI system
 * by initializing everything and returning commonly used functions.
 * 
 * @param businessProfile Business context
 * @returns Quick start object with common functions
 */
export async function quickStartKPISystem(businessProfile?: any) {
  await initializeKPISystem()
  
  const { getKPIService } = await import('./services/kpi-service')
  const kpiService = getKPIService()
  
  return {
    // Core services
    kpiService,
    
    // Quick access functions
    async getKPIs(criteria?: any) {
      return businessProfile 
        ? kpiService.getKPIsForBusiness(businessProfile)
        : kpiService.getAllKPIs()
    },
    
    async searchKPIs(query: string, filters?: any) {
      return kpiService.searchKPIs(query, filters)
    },
    
    // Utilities
    formatKPIValue: (await import('./utils/formatters')).formatKPIValue,
    validateKPIValue: (await import('./utils/validators')).validateKPIValue,
    mapBusinessIndustryToKPIIndustry: (await import('./utils/mappers')).mapBusinessIndustryToKPIIndustry,
    
    // Health check
    getHealth: getKPISystemHealth
  }
}

// ============================================================================
// VERSION & METADATA
// ============================================================================

/**
 * KPI System version and metadata
 */
export const KPI_SYSTEM_VERSION = '1.0.0'
export const KPI_SYSTEM_BUILD = 'Phase 1 - Foundation'

export const KPI_SYSTEM_INFO = {
  version: KPI_SYSTEM_VERSION,
  build: KPI_SYSTEM_BUILD,
  features: {
    caching: FEATURE_FLAGS.ENABLE_CACHING,
    validation: FEATURE_FLAGS.ENABLE_VALIDATION,
    performance: FEATURE_FLAGS.ENABLE_PERFORMANCE_MONITORING,
    lazyLoading: FEATURE_FLAGS.ENABLE_LAZY_LOADING,
    batchOperations: FEATURE_FLAGS.ENABLE_BATCH_OPERATIONS,
    autoSave: FEATURE_FLAGS.ENABLE_AUTO_SAVE
  },
  architecture: {
    pattern: 'Service Layer + Repository + Adapter',
    caching: 'In-memory with TTL',
    validation: 'Runtime + Build-time',
    performance: 'Sub-200ms target'
  }
} as const

/**
 * Development helpers (only available in development)
 */
export const KPI_DEV_TOOLS = process.env.NODE_ENV === 'development' ? {
  getKPISystemHealth,
  resetKPISystem
} : {}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default export - Main KPI System interface
 * 
 * Provides the most commonly used functions in a single object.
 * This is useful for importing the entire system:
 * 
 * import KPISystem from '@/lib/kpi'
 * 
 * const kpis = await KPISystem.getKPIs()
 */
const KPISystem = {
  // Initialization
  initialize: initializeKPISystem,
  quickStart: quickStartKPISystem,
  
  // System Info
  version: KPI_SYSTEM_VERSION,
  health: getKPISystemHealth,
  info: KPI_SYSTEM_INFO
}

export default KPISystem