// src/lib/supabase/helpers.ts
import { createClient } from './client'
import type { Database } from './types'

type DbBusinessProfile = Database['public']['Tables']['business_profiles']['Row']
type DbStrategicGoals = Database['public']['Tables']['strategic_goals']['Row']
type DbKPI = Database['public']['Tables']['kpis']['Row']
type DbStrategicInitiative = Database['public']['Tables']['strategic_initiatives']['Row']

// =====================================================
// BUSINESS PROFILE MANAGEMENT
// =====================================================

export async function ensureBusinessProfile(): Promise<string> {
  const supabase = createClient()
  
  try {
    // First try to get existing business profile
    const { data: existingProfile, error: selectError } = await supabase
      .from('business_profiles')
      .select('id')
      .limit(1)
      .single()
    
    if (existingProfile && !selectError) {
      console.log('✅ Found existing business profile:', existingProfile.id)
      return existingProfile.id
    }
    
    // If no profile exists, use the database function
    const { data: functionResult, error: functionError } = await supabase
      .rpc('get_or_create_business_profile')
    
    if (functionError) {
      console.error('❌ Error calling get_or_create_business_profile:', functionError)
      throw new Error(`Failed to create business profile: ${functionError.message}`)
    }
    
    if (!functionResult) {
      throw new Error('No business profile ID returned from function')
    }
    
    console.log('✅ Created new business profile:', functionResult)
    return functionResult
    
  } catch (error) {
    console.error('❌ Error in ensureBusinessProfile:', error)
    throw error
  }
}

export async function getBusinessProfile(): Promise<DbBusinessProfile | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('❌ Error fetching business profile:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('❌ Error in getBusinessProfile:', error)
    return null
  }
}

// =====================================================
// STRATEGIC GOALS MANAGEMENT
// =====================================================

export async function upsertStrategicGoals(data: {
  bhag_statement?: string
  bhag_metrics?: string
  bhag_deadline?: string
  three_year_goals?: any
}): Promise<DbStrategicGoals | null> {
  const supabase = createClient()
  
  try {
    // Ensure we have a business profile
    const businessProfileId = await ensureBusinessProfile()
    
    // Check if strategic goals already exist
    const { data: existing } = await supabase
      .from('strategic_goals')
      .select('id')
      .eq('business_profile_id', businessProfileId)
      .limit(1)
      .single()
    
    const goalData = {
      business_profile_id: businessProfileId,
      bhag_statement: data.bhag_statement || null,
      bhag_metrics: data.bhag_metrics || null,
      bhag_deadline: data.bhag_deadline || new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      three_year_goals: data.three_year_goals || {}
    }
    
    if (existing) {
      // Update existing record
      const { data: updated, error } = await supabase
        .from('strategic_goals')
        .update(goalData)
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error updating strategic goals:', error)
        throw error
      }
      
      console.log('✅ Updated strategic goals')
      return updated
    } else {
      // Insert new record
      const { data: inserted, error } = await supabase
        .from('strategic_goals')
        .insert(goalData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error inserting strategic goals:', error)
        throw error
      }
      
      console.log('✅ Created strategic goals')
      return inserted
    }
  } catch (error) {
    console.error('❌ Error in upsertStrategicGoals:', error)
    return null
  }
}

export async function getStrategicGoals(): Promise<DbStrategicGoals | null> {
  const supabase = createClient()
  
  try {
    const businessProfileId = await ensureBusinessProfile()
    
    const { data, error } = await supabase
      .from('strategic_goals')
      .select('*')
      .eq('business_profile_id', businessProfileId)
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching strategic goals:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('❌ Error in getStrategicGoals:', error)
    return null
  }
}

// =====================================================
// KPI MANAGEMENT
// =====================================================

export async function batchUpsertKPIs(kpis: any[]): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const businessProfileId = await ensureBusinessProfile()
    
    // Delete existing KPIs first
    await supabase
      .from('kpis')
      .delete()
      .eq('business_profile_id', businessProfileId)
    
    // Insert new KPIs if any provided
    if (kpis.length > 0) {
      const kpiData = kpis.map(kpi => ({
        business_profile_id: businessProfileId,
        kpi_id: kpi.id || `kpi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: kpi.name,
        category: kpi.category,
        current_value: kpi.currentValue || 0,
        year1_target: kpi.year1Target || 0,
        year2_target: kpi.year2Target || 0,
        year3_target: kpi.year3Target || 0,
        unit: kpi.unit || '',
        frequency: kpi.frequency || 'monthly'
      }))
      
      const { error } = await supabase
        .from('kpis')
        .insert(kpiData)
      
      if (error) {
        console.error('❌ Error inserting KPIs:', error)
        throw error
      }
    }
    
    console.log('✅ Successfully updated KPIs')
    return true
  } catch (error) {
    console.error('❌ Error in batchUpsertKPIs:', error)
    return false
  }
}

export async function getKPIs(): Promise<DbKPI[]> {
  const supabase = createClient()
  
  try {
    const businessProfileId = await ensureBusinessProfile()
    
    const { data, error } = await supabase
      .from('kpis')
      .select('*')
      .eq('business_profile_id', businessProfileId)
      .order('category', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching KPIs:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('❌ Error in getKPIs:', error)
    return []
  }
}

// =====================================================
// STRATEGIC INITIATIVES MANAGEMENT
// =====================================================

export async function batchUpsertStrategicInitiatives(initiatives: any[]): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const businessProfileId = await ensureBusinessProfile()
    
    // Get existing initiatives
    const { data: existing } = await supabase
      .from('strategic_initiatives')
      .select('id, title')
      .eq('business_profile_id', businessProfileId)
    
    const existingTitles = new Set(existing?.map(i => i.title) || [])
    
    // Filter out initiatives that already exist (by title)
    const newInitiatives = initiatives.filter(initiative => 
      !existingTitles.has(initiative.title)
    )
    
    if (newInitiatives.length > 0) {
      const initiativeData = newInitiatives.map((initiative, index) => ({
        business_profile_id: businessProfileId,
        title: initiative.title,
        category: initiative.category || 'Strategic',
        is_from_roadmap: initiative.isFromRoadmap || false,
        custom_source: initiative.customSource || null,
        selected: initiative.selected || false,
        quarter_assignment: initiative.quarterAssignment || null,
        order_index: initiative.orderIndex || index
      }))
      
      const { error } = await supabase
        .from('strategic_initiatives')
        .insert(initiativeData)
      
      if (error) {
        console.error('❌ Error inserting strategic initiatives:', error)
        throw error
      }
      
      console.log(`✅ Inserted ${newInitiatives.length} new strategic initiatives`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Error in batchUpsertStrategicInitiatives:', error)
    return false
  }
}

export async function updateInitiativeSelection(initiativeId: string, selected: boolean, quarterAssignment?: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const updateData: any = { selected }
    if (quarterAssignment !== undefined) {
      updateData.quarter_assignment = quarterAssignment
    }
    
    const { error } = await supabase
      .from('strategic_initiatives')
      .update(updateData)
      .eq('id', initiativeId)
    
    if (error) {
      console.error('❌ Error updating initiative selection:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('❌ Error in updateInitiativeSelection:', error)
    return false
  }
}

export async function getStrategicInitiatives(): Promise<DbStrategicInitiative[]> {
  const supabase = createClient()
  
  try {
    const businessProfileId = await ensureBusinessProfile()
    
    const { data, error } = await supabase
      .from('strategic_initiatives')
      .select('*')
      .eq('business_profile_id', businessProfileId)
      .order('order_index', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching strategic initiatives:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('❌ Error in getStrategicInitiatives:', error)
    return []
  }
}

// =====================================================
// COMPREHENSIVE DATA LOADING
// =====================================================

export async function loadCompleteStrategicPlan() {
  try {
    const [businessProfile, strategicGoals, kpis, initiatives] = await Promise.all([
      getBusinessProfile(),
      getStrategicGoals(),
      getKPIs(),
      getStrategicInitiatives()
    ])
    
    return {
      businessProfile,
      strategicGoals,
      kpis,
      initiatives,
      isLoaded: true
    }
  } catch (error) {
    console.error('❌ Error loading complete strategic plan:', error)
    return {
      businessProfile: null,
      strategicGoals: null,
      kpis: [],
      initiatives: [],
      isLoaded: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// DEMO DATA FALLBACKS
// =====================================================

export function getDemoStrategicGoals() {
  return {
    id: 'demo-goals',
    business_profile_id: 'demo-profile',
    bhag_statement: 'Build Australia\'s leading business coaching platform serving 1,000+ SMBs by 2027',
    bhag_metrics: '1,000 active clients, $5M ARR, 95% satisfaction rate',
    bhag_deadline: '2027-12-31',
    three_year_goals: {
      revenue: {
        current: 250000,
        year1: 500000,
        year2: 1200000,
        year3: 2500000
      },
      profit: {
        current: 50000,
        year1: 125000,
        year2: 360000,
        year3: 875000
      },
      quarterly_targets: {
        Q1: { revenue: 125000, profit: 31250 },
        Q2: { revenue: 125000, profit: 31250 },
        Q3: { revenue: 125000, profit: 31250 },
        Q4: { revenue: 125000, profit: 31250 }
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export function getDemoKPIs() {
  return [
    { id: 'kpi-1', name: 'Monthly Recurring Revenue', category: 'Financial', currentValue: 20833, year1Target: 41667, unit: 'AUD', frequency: 'monthly' },
    { id: 'kpi-2', name: 'Customer Acquisition Cost', category: 'Marketing', currentValue: 150, year1Target: 120, unit: 'AUD', frequency: 'monthly' },
    { id: 'kpi-3', name: 'Customer Lifetime Value', category: 'Financial', currentValue: 2400, year1Target: 3200, unit: 'AUD', frequency: 'quarterly' },
    { id: 'kpi-4', name: 'Net Promoter Score', category: 'Customer', currentValue: 45, year1Target: 70, unit: 'score', frequency: 'quarterly' },
    { id: 'kpi-5', name: 'Employee Satisfaction', category: 'People', currentValue: 7.2, year1Target: 8.5, unit: 'rating', frequency: 'quarterly' }
  ]
}

export function getDemoInitiatives() {
  return [
    { id: 'init-1', title: 'Launch AI-powered assessment tool', category: 'Product', selected: true, quarterAssignment: 'Q1' },
    { id: 'init-2', title: 'Implement Xero integration', category: 'Technology', selected: true, quarterAssignment: 'Q1' },
    { id: 'init-3', title: 'Build coach dashboard', category: 'Product', selected: true, quarterAssignment: 'Q2' },
    { id: 'init-4', title: 'Create strategic planning module', category: 'Product', selected: true, quarterAssignment: 'Q2' },
    { id: 'init-5', title: 'Develop mobile app', category: 'Technology', selected: false, quarterAssignment: null }
  ]
}