// src/lib/kpi/data/index.ts

import { KPI, BusinessFunction, Industry, BusinessStage, KPITier } from '../types'
import { ValidationService, getValidationService } from '../services/validation-service'

/**
 * KPIRegistry - Centralized KPI Management
 * 
 * This class implements the Registry Pattern for managing all KPIs in the system.
 * It provides a single source of truth for KPI definitions and handles lazy loading
 * for performance optimization.
 * 
 * Features:
 * - Lazy loading of KPI definitions
 * - Validation of all KPIs on registration
 * - Deduplication and conflict resolution
 * - Performance monitoring
 * - Memory-efficient storage
 * 
 * Design Pattern:
 * - Singleton Pattern for global access
 * - Registry Pattern for KPI management
 * - Factory Pattern for KPI creation
 */
export class KPIRegistry {
  private static instance: KPIRegistry | null = null
  private kpis = new Map<string, KPI>()
  private loaded = false
  private loading = false
  private validationService: ValidationService

  constructor() {
    this.validationService = getValidationService()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): KPIRegistry {
    if (!KPIRegistry.instance) {
      KPIRegistry.instance = new KPIRegistry()
    }
    return KPIRegistry.instance
  }

  /**
   * Initialize and load all KPI definitions
   * 
   * This method safely handles multiple concurrent calls and ensures
   * KPIs are only loaded once.
   */
  async initialize(): Promise<void> {
    if (this.loaded) {
      return
    }

    if (this.loading) {
      // Wait for ongoing loading to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      return
    }

    try {
      this.loading = true
      console.log('🚀 Initializing KPI Registry...')

      const startTime = Date.now()

      // Load KPI definitions in parallel for performance
      // Phase 1: Only load the structure, actual data will come in Phase 2
      await this.loadKPIDefinitions()

      const loadTime = Date.now() - startTime
      const kpiCount = this.kpis.size

      console.log(`✅ KPI Registry initialized: ${kpiCount} KPIs loaded in ${loadTime}ms`)

      this.loaded = true
    } catch (error) {
      console.error('❌ Failed to initialize KPI Registry:', error)
      throw error
    } finally {
      this.loading = false
    }
  }

  /**
   * Register a single KPI
   * 
   * @param kpi KPI to register
   * @param skipValidation Whether to skip validation (for performance)
   */
  registerKPI(kpi: KPI, skipValidation: boolean = false): void {
    try {
      // Validate KPI if validation is enabled
      if (!skipValidation) {
        this.validationService.validateKPI(kpi, true)
      }

      // Check for duplicates
      if (this.kpis.has(kpi.id)) {
        console.warn(`⚠️  Duplicate KPI ID detected: ${kpi.id}. Overwriting existing KPI.`)
      }

      // Register the KPI
      this.kpis.set(kpi.id, kpi)

    } catch (error) {
      console.error(`❌ Failed to register KPI '${kpi.id}':`, error)
      throw error
    }
  }

  /**
   * Register multiple KPIs
   * 
   * @param kpis Array of KPIs to register
   * @param skipValidation Whether to skip validation
   */
  registerKPIs(kpis: KPI[], skipValidation: boolean = false): void {
    console.log(`📝 Registering ${kpis.length} KPIs...`)

    let successCount = 0
    let errorCount = 0

    kpis.forEach(kpi => {
      try {
        this.registerKPI(kpi, skipValidation)
        successCount++
      } catch (error) {
        errorCount++
        console.error(`Failed to register KPI '${kpi.id}':`, error)
      }
    })

    console.log(`📊 Registration complete: ${successCount} successful, ${errorCount} failed`)
  }

  /**
   * Get all registered KPIs
   */
  getAllKPIs(): KPI[] {
    return Array.from(this.kpis.values())
  }

  /**
   * Get KPI by ID
   */
  getKPIById(id: string): KPI | undefined {
    return this.kpis.get(id)
  }

  /**
   * Get KPIs by filter function
   */
  getKPIsByFilter(filter: (kpi: KPI) => boolean): KPI[] {
    return this.getAllKPIs().filter(filter)
  }

  /**
   * Get KPIs by business function
   */
  getKPIsByFunction(func: BusinessFunction): KPI[] {
    return this.getKPIsByFilter(kpi => kpi.function === func)
  }

  /**
   * Get KPIs by industry
   */
  getKPIsByIndustry(industry: Industry): KPI[] {
    return this.getKPIsByFilter(kpi => 
      kpi.industries.includes(industry) || 
      kpi.industries.includes(Industry.ALL)
    )
  }

  /**
   * Get KPIs by business stage
   */
  getKPIsByStage(stage: BusinessStage): KPI[] {
    return this.getKPIsByFilter(kpi => kpi.stages.includes(stage))
  }

  /**
   * Get KPIs by tier
   */
  getKPIsByTier(tier: KPITier): KPI[] {
    return this.getKPIsByFilter(kpi => kpi.tier === tier)
  }

  /**
   * Check if registry has been initialized
   */
  isInitialized(): boolean {
    return this.loaded
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const kpis = this.getAllKPIs()
    
    // Count by function
    const functionCounts = Object.values(BusinessFunction).reduce((acc, func) => {
      acc[func] = this.getKPIsByFunction(func).length
      return acc
    }, {} as Record<BusinessFunction, number>)

    // Count by tier
    const tierCounts = Object.values(KPITier).reduce((acc, tier) => {
      acc[tier] = this.getKPIsByTier(tier).length
      return acc
    }, {} as Record<KPITier, number>)

    // Count by industry
    const industryCounts = Object.values(Industry).reduce((acc, industry) => {
      acc[industry] = this.getKPIsByIndustry(industry).length
      return acc
    }, {} as Record<Industry, number>)

    return {
      total: kpis.length,
      loaded: this.loaded,
      loading: this.loading,
      functions: functionCounts,
      tiers: tierCounts,
      industries: industryCounts,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * Clear all KPIs (for testing or reset)
   */
  clear(): void {
    this.kpis.clear()
    this.loaded = false
    this.loading = false
  }

  // Private Methods

  /**
   * Load all KPI definitions from data files
   * 
   * In Phase 1, this is a placeholder. In Phase 2, this will load from:
   * - essential.ts
   * - functions/*.ts
   * - industries/*.ts
   */
  private async loadKPIDefinitions(): Promise<void> {
    try {
      // Phase 1: Create placeholder structure
      // This demonstrates the loading pattern that will be used in Phase 2
      
      console.log('📚 Loading essential KPIs...')
      await this.loadEssentialKPIs()

      console.log('🔧 Loading function KPIs...')
      await this.loadFunctionKPIs()

      console.log('🏭 Loading industry KPIs...')
      await this.loadIndustryKPIs()

      console.log('✅ All KPI definitions loaded successfully')

    } catch (error) {
      console.error('❌ Failed to load KPI definitions:', error)
      throw error
    }
  }

  /**
   * Load essential KPIs (Phase 1 placeholder)
   */
  private async loadEssentialKPIs(): Promise<void> {
    // Phase 1: Placeholder - will be implemented in Phase 2
    // In Phase 2, this will import from data/essential.ts
    console.log('Essential KPIs loading placeholder - will be implemented in Phase 2')
    
    // For now, register an empty array to establish the pattern
    this.registerKPIs([], true)
  }

  /**
   * Load function-specific KPIs (Phase 1 placeholder)
   */
  private async loadFunctionKPIs(): Promise<void> {
    // Phase 1: Placeholder - will be implemented in Phase 2
    // In Phase 2, this will dynamically import from data/functions/*.ts
    
    const functionFiles = [
      'attract',
      'convert', 
      'deliver',
      'delight',
      'people',
      'profit',
      'systems'
    ]

    console.log(`Function KPIs loading placeholder for ${functionFiles.length} files - will be implemented in Phase 2`)
    
    // Establish the loading pattern for Phase 2:
    /*
    const functionImports = await Promise.all([
      import('./functions/attract').catch(() => ({ ATTRACT_KPIS: [] })),
      import('./functions/convert').catch(() => ({ CONVERT_KPIS: [] })),
      import('./functions/deliver').catch(() => ({ DELIVER_KPIS: [] })),
      import('./functions/delight').catch(() => ({ DELIGHT_KPIS: [] })),
      import('./functions/people').catch(() => ({ PEOPLE_KPIS: [] })),
      import('./functions/profit').catch(() => ({ PROFIT_KPIS: [] })),
      import('./functions/systems').catch(() => ({ SYSTEMS_KPIS: [] }))
    ])
    
    functionImports.forEach(module => {
      const kpis = Object.values(module)[0] as KPI[]
      if (kpis && kpis.length > 0) {
        this.registerKPIs(kpis)
      }
    })
    */
  }

  /**
   * Load industry-specific KPIs (Phase 1 placeholder)
   */
  private async loadIndustryKPIs(): Promise<void> {
    // Phase 1: Placeholder - will be implemented in Phase 2
    // In Phase 2, this will dynamically import from data/industries/*.ts
    
    const industryFiles = [
      'construction',
      'health',
      'professional',
      'retail',
      'logistics'
    ]

    console.log(`Industry KPIs loading placeholder for ${industryFiles.length} files - will be implemented in Phase 2`)

    // Establish the loading pattern for Phase 2:
    /*
    const industryImports = await Promise.all([
      import('./industries/construction').catch(() => ({ CONSTRUCTION_KPIS: [] })),
      import('./industries/health').catch(() => ({ HEALTH_KPIS: [] })),
      import('./industries/professional').catch(() => ({ PROFESSIONAL_KPIS: [] })),
      import('./industries/retail').catch(() => ({ RETAIL_KPIS: [] })),
      import('./industries/logistics').catch(() => ({ LOGISTICS_KPIS: [] }))
    ])
    
    industryImports.forEach(module => {
      const kpis = Object.values(module)[0] as KPI[]
      if (kpis && kpis.length > 0) {
        this.registerKPIs(kpis)
      }
    })
    */
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): string {
    const jsonString = JSON.stringify(Array.from(this.kpis.values()))
    const sizeInBytes = new Blob([jsonString]).size
    const sizeInMB = sizeInBytes / (1024 * 1024)
    return `${sizeInMB.toFixed(2)} MB`
  }
}

/**
 * Global registry instance
 */
export const kpiRegistry = KPIRegistry.getInstance()

/**
 * Initialize the global registry
 */
export async function initializeKPIRegistry(): Promise<void> {
  await kpiRegistry.initialize()
}

/**
 * Convenience functions for common operations
 */
export function getAllKPIs(): KPI[] {
  return kpiRegistry.getAllKPIs()
}

export function getKPIById(id: string): KPI | undefined {
  return kpiRegistry.getKPIById(id)
}

export function getKPIsByFunction(func: BusinessFunction): KPI[] {
  return kpiRegistry.getKPIsByFunction(func)
}

export function getKPIsByIndustry(industry: Industry): KPI[] {
  return kpiRegistry.getKPIsByIndustry(industry)
}

export function getKPIsByStage(stage: BusinessStage): KPI[] {
  return kpiRegistry.getKPIsByStage(stage)
}

export function getKPIsByTier(tier: KPITier): KPI[] {
  return kpiRegistry.getKPIsByTier(tier)
}

export function registerKPI(kpi: KPI): void {
  kpiRegistry.registerKPI(kpi)
}

export function registerKPIs(kpis: KPI[]): void {
  kpiRegistry.registerKPIs(kpis)
}

/**
 * Development and debugging helpers
 */
export function debugRegistry(): void {
  console.table(kpiRegistry.getStats())
}

export function resetRegistry(): void {
  kpiRegistry.clear()
}

/**
 * Performance monitoring
 */
export function measureRegistryPerformance() {
  const start = Date.now()
  const kpis = getAllKPIs()
  const end = Date.now()
  
  return {
    kpiCount: kpis.length,
    loadTime: end - start,
    memoryUsage: kpiRegistry.getStats().memoryUsage
  }
}

/**
 * Type-safe KPI creation helpers
 */
export function createKPI(definition: Omit<KPI, 'createdAt' | 'updatedAt'>): KPI {
  const now = new Date().toISOString()
  
  return {
    ...definition,
    createdAt: now,
    updatedAt: now
  }
}

/**
 * Batch operations for performance
 */
export async function loadKPIBatch(
  loader: () => Promise<KPI[]>,
  batchName: string
): Promise<void> {
  console.log(`📦 Loading KPI batch: ${batchName}`)
  
  const start = Date.now()
  const kpis = await loader()
  const loadTime = Date.now() - start
  
  kpiRegistry.registerKPIs(kpis)
  
  console.log(`✅ Loaded ${kpis.length} KPIs from ${batchName} in ${loadTime}ms`)
}

// Export the registry instance as default for convenience
export default kpiRegistry