'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Building2, 
  DollarSign, 
  Users, 
  Package, 
  Users2, 
  Target,
  CheckCircle,
  AlertCircle,
  Globe,
  Instagram,
  Facebook,
  Linkedin
} from 'lucide-react'

type Business = Database['public']['Tables']['businesses']['Row']

const STEPS = [
  { id: 1, name: 'Company Information', icon: Building2 },
  { id: 2, name: 'Financial Snapshot', icon: DollarSign },
  { id: 3, name: 'Team & Organisation', icon: Users },
  { id: 4, name: 'Products & Services', icon: Package },
  { id: 5, name: 'Customer Segments', icon: Users2 },
  { id: 6, name: 'Current Situation', icon: Target },
]

// Simplified industry list with most common options
const INDUSTRIES = [
  'Building & Construction',
  'Professional Services',
  'Medical & Healthcare',
  'Retail & E-commerce',
  'Manufacturing',
  'Technology & Software',
  'Financial Services',
  'Real Estate',
  'Hospitality & Tourism',
  'Education & Training',
  'Transport & Logistics',
  'Agriculture & Farming',
  'Mining & Resources',
  'Marketing & Advertising',
  'Legal Services',
  'Trades & Services',
  'Wholesale & Distribution',
  'Non-Profit',
  'Government',
  'Other',
]

const BUSINESS_MODELS = [
  'B2B (Business to Business)',
  'B2C (Business to Consumer)',
  'B2B2C (Both)',
  'Marketplace',
  'SaaS (Software as a Service)',
  'Subscription',
  'E-commerce',
  'Professional Services',
  'Manufacturing',
  'Retail',
  'Wholesale',
  'Franchise',
]

// Simplified product/service types
const OFFERING_TYPES = [
  'Physical Product',
  'Service',
  'Digital Product',
  'Subscription',
  'Project-Based',
]

export default function EnhancedBusinessProfile() {
  const router = useRouter()
  // supabase client imported from lib
  
  const [currentStep, setCurrentStep] = useState(1)
  const [business, setBusiness] = useState<Partial<Business>>({})
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // Load business data on mount
  useEffect(() => {
    loadBusiness()
  }, [])

  const loadBusiness = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (data) {
        setBusiness(data)
        setBusinessId(data.id)
        if (data.profile_updated_at) {
          setLastSaved(new Date(data.profile_updated_at))
        }
        
        // Initialize empty key_roles if not present
        if (!data.key_roles || (data.key_roles as any[]).length === 0) {
          setBusiness(prev => ({
            ...prev,
            key_roles: [
              { title: '', name: '', status: '' },
              { title: '', name: '', status: '' },
              { title: '', name: '', status: '' }
            ]
          }))
        }
      } else {
        // Create new business if none exists
        const { data: newBusiness, error: createError } = await supabase
          .from('businesses')
          .insert({ 
            owner_id: user.id,
            name: 'My Business',
            industry: '',
            profile_completed: false,
            key_roles: [
              { title: '', name: '', status: '' },
              { title: '', name: '', status: '' },
              { title: '', name: '', status: '' }
            ]
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating business:', createError)
        } else if (newBusiness) {
          setBusiness(newBusiness)
          setBusinessId(newBusiness.id)
        }
      }
    } catch (error) {
      console.error('Error loading business:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!businessId) return

    setSaveStatus('saving')
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          ...business,
          profile_completed: calculateCompletion() >= 80,
          profile_updated_at: new Date().toISOString()
        })
        .eq('id', businessId)

      if (error) {
        console.error('Error saving business:', error)
        setSaveStatus('error')
      } else {
        setLastSaved(new Date())
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    } catch (error) {
      console.error('Error:', error)
      setSaveStatus('error')
    }
  }, [business, businessId])

  // Handle field changes with debounced auto-save
  const handleFieldChange = (field: keyof Business, value: any) => {
    setBusiness(prev => ({ ...prev, [field]: value }))
    
    // Clear existing timer
    if (saveTimer) clearTimeout(saveTimer)
    
    // Set new timer for auto-save (2 seconds after user stops typing)
    const newTimer = setTimeout(() => {
      autoSave()
    }, 2000)
    
    setSaveTimer(newTimer)
  }

  // Handle array field changes
  const handleArrayFieldChange = (field: keyof Business, index: number, value: string) => {
    const currentArray = (business[field] as string[]) || []
    const newArray = [...currentArray]
    newArray[index] = value
    handleFieldChange(field, newArray)
  }

  // Add item to array field
  const addArrayItem = (field: keyof Business) => {
    const currentArray = (business[field] as string[]) || []
    handleFieldChange(field, [...currentArray, ''])
  }

  // Remove item from array field
  const removeArrayItem = (field: keyof Business, index: number) => {
    const currentArray = (business[field] as string[]) || []
    const newArray = currentArray.filter((_, i) => i !== index)
    handleFieldChange(field, newArray)
  }

  // Handle JSON field changes
  const handleJsonFieldChange = (field: keyof Business, data: any) => {
    handleFieldChange(field, data)
  }

  // Calculate completion percentage
  const calculateCompletion = (): number => {
    let totalFields = 0
    let filledFields = 0

    // Required fields check
    const requiredFields: (keyof Business)[] = [
      'name', 'industry', 'annual_revenue', 
      'employee_count', 'years_in_business'
    ]
    
    totalFields += requiredFields.length
    filledFields += requiredFields.filter(field => business[field]).length

    // Optional but important fields
    if (business.locations && business.locations.length > 0) filledFields++
    if (business.gross_margin) filledFields++
    if (business.net_margin) filledFields++
    if (business.products_services) filledFields++
    if (business.customer_segments) filledFields++
    if (business.top_challenges && business.top_challenges.length > 0) filledFields++
    if (business.growth_opportunities && business.growth_opportunities.length > 0) filledFields++
    
    totalFields += 7

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
  }

  // Calculate revenue stage
  const getRevenueStage = (revenue?: number | null): string => {
    if (!revenue) return 'Foundation'
    if (revenue < 250000) return 'Foundation ($0-250K)'
    if (revenue < 1000000) return 'Traction ($250K-1M)'
    if (revenue < 3000000) return 'Scaling ($1M-3M)'
    if (revenue < 5000000) return 'Optimization ($3M-5M)'
    if (revenue < 10000000) return 'Leadership ($5M-10M)'
    return 'Mastery ($10M+)'
  }

  // Manual save function
  const manualSave = async () => {
    if (saveTimer) clearTimeout(saveTimer)
    await autoSave()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading business profile...</div>
      </div>
    )
  }

  // Get social media data or initialize empty
  const socialMedia = (business as any)?.social_media || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive context that powers AI-driven insights and recommendations
              </p>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                calculateCompletion() >= 80 ? 'text-green-600' : 
                calculateCompletion() >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {calculateCompletion()}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
              {lastSaved && (
                <div className="text-xs text-gray-500 mt-2">
                  Auto-saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    currentStep === step.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium text-center">{step.name}</span>
                  {currentStep === step.id && (
                    <div className="w-full h-1 bg-blue-600 rounded-full mt-2" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 relative">
          {/* Save Status Indicator */}
          <div className="absolute top-4 right-4">
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-blue-600">
                <Save className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Auto-saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Error saving</span>
              </div>
            )}
          </div>

          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={business.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    value={business.industry || ''}
                    onChange={(e) => handleFieldChange('industry', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Industry...</option>
                    {INDUSTRIES.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years in Business *
                  </label>
                  <input
                    type="number"
                    value={business.years_in_business || ''}
                    onChange={(e) => handleFieldChange('years_in_business', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Model
                  </label>
                  <select
                    value={business.business_model || ''}
                    onChange={(e) => handleFieldChange('business_model', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Model...</option>
                    {BUSINESS_MODELS.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Online Presence */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Online Presence</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="inline w-4 h-4 mr-1" />
                      Website
                    </label>
                    <input
                      type="url"
                      value={socialMedia.website || ''}
                      onChange={(e) => {
                        const updated = { ...socialMedia, website: e.target.value }
                        handleJsonFieldChange('social_media', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Linkedin className="inline w-4 h-4 mr-1" />
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={socialMedia.linkedin || ''}
                      onChange={(e) => {
                        const updated = { ...socialMedia, linkedin: e.target.value }
                        handleJsonFieldChange('social_media', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Facebook className="inline w-4 h-4 mr-1" />
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={socialMedia.facebook || ''}
                      onChange={(e) => {
                        const updated = { ...socialMedia, facebook: e.target.value }
                        handleJsonFieldChange('social_media', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Instagram className="inline w-4 h-4 mr-1" />
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={socialMedia.instagram || ''}
                      onChange={(e) => {
                        const updated = { ...socialMedia, instagram: e.target.value }
                        handleJsonFieldChange('social_media', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TikTok
                    </label>
                    <input
                      type="url"
                      value={socialMedia.tiktok || ''}
                      onChange={(e) => {
                        const updated = { ...socialMedia, tiktok: e.target.value }
                        handleJsonFieldChange('social_media', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locations / Service Areas
                </label>
                <div className="space-y-2">
                  {(business.locations || ['']).map((location, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => handleArrayFieldChange('locations', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Sydney, Melbourne, Australia-wide"
                      />
                      {(business.locations?.length || 0) > 1 && (
                        <button
                          onClick={() => removeArrayItem('locations', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('locations')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Location
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Financial Snapshot */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Snapshot</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  This data will be automatically synchronized with Xero once integrated. Manual entry for now.
                </p>
              </div>

              {/* Revenue Stage Indicator */}
              {business.annual_revenue && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                  <div className="text-sm opacity-90">Revenue Stage</div>
                  <div className="text-2xl font-bold mt-1">{getRevenueStage(business.annual_revenue)}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Revenue *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={business.annual_revenue || ''}
                      onChange={(e) => handleFieldChange('annual_revenue', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revenue Growth Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={business.revenue_growth_rate || ''}
                      onChange={(e) => handleFieldChange('revenue_growth_rate', parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="-100"
                      max="1000"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gross Margin (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={business.gross_margin || ''}
                      onChange={(e) => handleFieldChange('gross_margin', parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Net Margin (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={business.net_margin || ''}
                      onChange={(e) => handleFieldChange('net_margin', parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="-100"
                      max="100"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>
              </div>

              {/* Margin Health Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Gross Margin Health</div>
                  <div className={`text-lg font-semibold ${
                    (business.gross_margin || 0) >= 50 ? 'text-green-600' :
                    (business.gross_margin || 0) >= 30 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(business.gross_margin || 0) >= 50 ? 'Excellent' :
                     (business.gross_margin || 0) >= 30 ? 'Good' :
                     'Needs Improvement'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Net Margin Health</div>
                  <div className={`text-lg font-semibold ${
                    (business.net_margin || 0) >= 20 ? 'text-green-600' :
                    (business.net_margin || 0) >= 10 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(business.net_margin || 0) >= 20 ? 'Excellent' :
                     (business.net_margin || 0) >= 10 ? 'Good' :
                     'Needs Improvement'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Team & Organisation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Team & Organisation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Employees *
                  </label>
                  <input
                    type="number"
                    value={business.employee_count || ''}
                    onChange={(e) => handleFieldChange('employee_count', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                  {business.annual_revenue && business.employee_count && business.employee_count > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Revenue per employee: ${Math.round((business.annual_revenue / business.employee_count)).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Key Roles - Always show 3 rows minimum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Members
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-2 mb-2 px-3">
                    <div className="text-xs font-medium text-gray-600">Role</div>
                    <div className="text-xs font-medium text-gray-600">Name</div>
                    <div className="text-xs font-medium text-gray-600">Status</div>
                  </div>
                  <div className="space-y-2">
                    {((business.key_roles as any[] || []).length < 3 
                      ? [...(business.key_roles as any[] || []), ...Array(3 - (business.key_roles as any[] || []).length).fill({ title: '', name: '', status: '' })]
                      : (business.key_roles as any[] || [])
                    ).map((role, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={role.title || ''}
                            onChange={(e) => {
                              const roles = [...(business.key_roles as any[] || [])]
                              if (!roles[index]) roles[index] = { title: '', name: '', status: '' }
                              roles[index] = { ...roles[index], title: e.target.value }
                              handleJsonFieldChange('key_roles', roles)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="e.g., CEO, Sales Manager"
                          />
                          <input
                            type="text"
                            value={role.name || ''}
                            onChange={(e) => {
                              const roles = [...(business.key_roles as any[] || [])]
                              if (!roles[index]) roles[index] = { title: '', name: '', status: '' }
                              roles[index] = { ...roles[index], name: e.target.value }
                              handleJsonFieldChange('key_roles', roles)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Person's name"
                          />
                          <select
                            value={role.status || ''}
                            onChange={(e) => {
                              const roles = [...(business.key_roles as any[] || [])]
                              if (!roles[index]) roles[index] = { title: '', name: '', status: '' }
                              roles[index] = { ...roles[index], status: e.target.value }
                              handleJsonFieldChange('key_roles', roles)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Select Status</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="Casual">Casual</option>
                            <option value="Virtual Assistant">Virtual Assistant</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(business.key_roles as any[] || []).length > 3 && (
                    <button
                      onClick={() => {
                        const roles = [...(business.key_roles as any[] || []), { title: '', name: '', status: '' }]
                        handleJsonFieldChange('key_roles', roles)
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      + Add Another Role
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Products & Services */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Products & Services</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> If you're a builder who builds houses, that would be a "Service" or "Project-Based" offering.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What You Offer
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {(business.products_services as any[] || [{ name: '', type: '', revenue_percentage: 0 }]).map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => {
                              const items = [...(business.products_services as any[] || [])]
                              items[index] = { ...items[index], name: e.target.value }
                              handleJsonFieldChange('products_services', items)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="e.g., House Construction, Consulting, Web Design"
                          />
                          <select
                            value={item.type || ''}
                            onChange={(e) => {
                              const items = [...(business.products_services as any[] || [])]
                              items[index] = { ...items[index], type: e.target.value }
                              handleJsonFieldChange('products_services', items)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="">Select Type</option>
                            {OFFERING_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                value={item.revenue_percentage || ''}
                                onChange={(e) => {
                                  const items = [...(business.products_services as any[] || [])]
                                  items[index] = { ...items[index], revenue_percentage: parseFloat(e.target.value) || 0 }
                                  handleJsonFieldChange('products_services', items)
                                }}
                                className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="0"
                                min="0"
                                max="100"
                              />
                              <span className="absolute right-3 top-2 text-gray-500">%</span>
                            </div>
                            {(business.products_services as any[] || []).length > 1 && (
                              <button
                                onClick={() => {
                                  const items = (business.products_services as any[] || []).filter((_, i) => i !== index)
                                  handleJsonFieldChange('products_services', items)
                                }}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const items = [...(business.products_services as any[] || []), { name: '', type: '', revenue_percentage: 0 }]
                      handleJsonFieldChange('products_services', items)
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Add Another Offering
                  </button>
                </div>
              </div>

              {/* Revenue Mix Visualization */}
              {business.products_services && (business.products_services as any[]).length > 0 && 
               (business.products_services as any[]).some(item => item.revenue_percentage > 0) && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Revenue Mix</h3>
                  <div className="space-y-2">
                    {(business.products_services as any[]).map((item, index) => (
                      item.revenue_percentage > 0 && (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">{item.name || 'Unnamed'}</span>
                              <span className="font-medium">{item.revenue_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${item.revenue_percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Customer Segments */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Segments</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Customers
                  </label>
                  <input
                    type="number"
                    value={business.total_customers || ''}
                    onChange={(e) => handleFieldChange('total_customers', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Concentration (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={business.customer_concentration || ''}
                      onChange={(e) => handleFieldChange('customer_concentration', parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">% of revenue from top 10 customers</p>
                </div>
              </div>

              {/* Customer Segments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Segments
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {(business.customer_segments as any[] || [{ name: '', description: '', percentage: 0 }]).map((segment, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={segment.name || ''}
                            onChange={(e) => {
                              const segments = [...(business.customer_segments as any[] || [])]
                              segments[index] = { ...segments[index], name: e.target.value }
                              handleJsonFieldChange('customer_segments', segments)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Segment Name"
                          />
                          <input
                            type="text"
                            value={segment.description || ''}
                            onChange={(e) => {
                              const segments = [...(business.customer_segments as any[] || [])]
                              segments[index] = { ...segments[index], description: e.target.value }
                              handleJsonFieldChange('customer_segments', segments)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2"
                            placeholder="Description"
                          />
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                value={segment.percentage || ''}
                                onChange={(e) => {
                                  const segments = [...(business.customer_segments as any[] || [])]
                                  segments[index] = { ...segments[index], percentage: parseFloat(e.target.value) || 0 }
                                  handleJsonFieldChange('customer_segments', segments)
                                }}
                                className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="0"
                                min="0"
                                max="100"
                              />
                              <span className="absolute right-3 top-2 text-gray-500">%</span>
                            </div>
                            {(business.customer_segments as any[] || []).length > 1 && (
                              <button
                                onClick={() => {
                                  const segments = (business.customer_segments as any[] || []).filter((_, i) => i !== index)
                                  handleJsonFieldChange('customer_segments', segments)
                                }}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const segments = [...(business.customer_segments as any[] || []), { name: '', description: '', percentage: 0 }]
                      handleJsonFieldChange('customer_segments', segments)
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Add Segment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Current Situation (formerly Strategic Context) */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Situation</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  This provides critical context for AI recommendations. Be specific and honest about your challenges and opportunities.
                </p>
              </div>

              {/* Top Challenges */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top 3 Current Challenges
                </label>
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <textarea
                          value={(business.top_challenges || [])[index] || ''}
                          onChange={(e) => {
                            const challenges = [...(business.top_challenges || ['', '', ''])]
                            challenges[index] = e.target.value
                            handleFieldChange('top_challenges', challenges)
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder={`Challenge ${index + 1}: Be specific about what's holding you back...`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Opportunities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top 3 Growth Opportunities
                </label>
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <textarea
                          value={(business.growth_opportunities || [])[index] || ''}
                          onChange={(e) => {
                            const opportunities = [...(business.growth_opportunities || ['', '', ''])]
                            opportunities[index] = e.target.value
                            handleFieldChange('growth_opportunities', opportunities)
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder={`Opportunity ${index + 1}: What could accelerate your growth...`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            <button
              onClick={manualSave}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>

            {currentStep < STEPS.length && (
              <button
                onClick={() => setCurrentStep(Math.min(STEPS.length, currentStep + 1))}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            
            {currentStep === STEPS.length && (
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all"
              >
                Complete
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Profile Summary Card */}
        {calculateCompletion() >= 80 && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 mt-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Profile Complete!
                </h3>
                <p className="text-sm opacity-90 mt-1">
                  Your comprehensive business context is ready to power AI-driven insights
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}