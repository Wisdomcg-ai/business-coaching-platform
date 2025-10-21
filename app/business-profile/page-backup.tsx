'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import { ArrowLeft, ArrowRight, Save, Building2, DollarSign, Users, Package, Users2, Target } from 'lucide-react'

type BusinessProfile = Database['public']['Tables']['business_profiles']['Row']

const STEPS = [
  { id: 1, name: 'Company Information', icon: Building2 },
  { id: 2, name: 'Financial Overview', icon: DollarSign },
  { id: 3, name: 'Team & Organisation', icon: Users },
  { id: 4, name: 'Products & Services', icon: Package },
  { id: 5, name: 'Customer Overview', icon: Users2 },
  { id: 6, name: 'Strategic Context', icon: Target },
]

const INDUSTRIES = [
  'Agriculture, Forestry & Fishing',
  'Mining',
  'Manufacturing',
  'Electricity, Gas, Water & Waste',
  'Construction',
  'Wholesale Trade',
  'Retail Trade',
  'Accommodation & Food Services',
  'Transport, Postal & Warehousing',
  'Information Media & Telecommunications',
  'Financial & Insurance Services',
  'Rental, Hiring & Real Estate Services',
  'Professional, Scientific & Technical Services',
  'Administrative & Support Services',
  'Public Administration & Safety',
  'Education & Training',
  'Health Care & Social Assistance',
  'Arts & Recreation Services',
  'Other Services',
]

export default function BusinessProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({})
  const [profileId, setProfileId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // Load existing profile on mount
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
        setProfileId(data.id)
        if (data.updated_at) {
          setLastSaved(new Date(data.updated_at))
        }
      } else {
        // Create new profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from('business_profiles')
          .insert({ user_id: user.id })
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
        } else if (newProfile) {
          setProfile(newProfile)
          setProfileId(newProfile.id)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save functionality
  const saveProfile = useCallback(async () => {
    if (!profileId) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('business_profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)

      if (error) {
        console.error('Error saving profile:', error)
      } else {
        setLastSaved(new Date())
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [profile, profileId, supabase])

  // Handle field changes with auto-save
  const handleFieldChange = (field: keyof BusinessProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    
    // Clear existing timer
    if (saveTimer) clearTimeout(saveTimer)
    
    // Set new timer for auto-save
    const newTimer = setTimeout(() => {
      saveProfile()
    }, 2000)
    
    setSaveTimer(newTimer)
  }

  // Handle JSON field changes (for complex nested data)
  const handleJsonFieldChange = (field: keyof BusinessProfile, path: string, value: any) => {
    setProfile(prev => {
      const currentData = (prev[field] as any) || {}
      const keys = path.split('.')
      const newData = { ...currentData }
      
      let target = newData
      for (let i = 0; i < keys.length - 1; i++) {
        if (!target[keys[i]]) target[keys[i]] = {}
        target = target[keys[i]]
      }
      target[keys[keys.length - 1]] = value
      
      return { ...prev, [field]: newData }
    })
    
    // Clear existing timer
    if (saveTimer) clearTimeout(saveTimer)
    
    // Set new timer for auto-save
    const newTimer = setTimeout(() => {
      saveProfile()
    }, 2000)
    
    setSaveTimer(newTimer)
  }

  // Calculate completion percentage
  const calculateCompletion = (): number => {
    let totalFields = 0
    let filledFields = 0

    // Company Information fields
    const companyFields = ['business_name', 'industry']
    totalFields += companyFields.length
    filledFields += companyFields.filter(field => profile[field as keyof BusinessProfile]).length

    // Financial fields
    const financialFields = ['annual_revenue']
    totalFields += financialFields.length
    filledFields += financialFields.filter(field => profile[field as keyof BusinessProfile]).length

    // Team fields
    if (profile.employee_count && profile.employee_count > 0) filledFields++
    totalFields++

    // Add more as needed...

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
  }

  // Calculate revenue stage based on revenue
  const getRevenueStage = (revenue?: number | null): string => {
    if (!revenue) return 'Foundation'
    if (revenue < 250000) return 'Foundation ($0-250K)'
    if (revenue < 1000000) return 'Traction ($250K-1M)'
    if (revenue < 3000000) return 'Scaling ($1M-3M)'
    if (revenue < 5000000) return 'Optimization ($3M-5M)'
    if (revenue < 10000000) return 'Leadership ($5M-10M)'
    return 'Mastery ($10M+)'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading business profile...</div>
      </div>
    )
  }

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
                Essential information that powers your AI coaching experience
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {calculateCompletion()}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
              {lastSaved && (
                <div className="text-xs text-gray-500 mt-2">
                  Last saved: {lastSaved.toLocaleTimeString()}
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
          {isSaving && (
            <div className="absolute top-4 right-4 flex items-center gap-2 text-blue-600">
              <Save className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Saving...</span>
            </div>
          )}

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
                    value={profile.business_name || ''}
                    onChange={(e) => handleFieldChange('business_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your registered business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trading Name
                  </label>
                  <input
                    type="text"
                    value={(profile.company_info as any)?.trading_name || ''}
                    onChange={(e) => handleJsonFieldChange('company_info', 'trading_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Name you trade under (if different)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ABN
                  </label>
                  <input
                    type="text"
                    value={(profile.company_info as any)?.abn || ''}
                    onChange={(e) => handleJsonFieldChange('company_info', 'abn', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Australian Business Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    value={profile.industry || ''}
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
                    Years in Business
                  </label>
                  <input
                    type="number"
                    value={(profile.company_info as any)?.years_in_business || ''}
                    onChange={(e) => handleJsonFieldChange('company_info', 'years_in_business', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Model
                  </label>
                  <select
                    value={(profile.company_info as any)?.business_model || ''}
                    onChange={(e) => handleJsonFieldChange('company_info', 'business_model', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="B2B">B2B (Business to Business)</option>
                    <option value="B2C">B2C (Business to Consumer)</option>
                    <option value="B2B2C">B2B2C (Both)</option>
                    <option value="Marketplace">Marketplace</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Locations / Service Areas
                  </label>
                  <textarea
                    value={(profile.company_info as any)?.locations || ''}
                    onChange={(e) => handleJsonFieldChange('company_info', 'locations', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Where do you operate? e.g., Sydney, Melbourne, Australia-wide, Global"
                  />
                </div>
              </div>

              {/* Website and Social Media */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 text-gray-800">Online Presence</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
                    </label>
                    <input
                      type="url"
                      value={(profile.company_info as any)?.website || ''}
                      onChange={(e) => handleJsonFieldChange('company_info', 'website', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.example.com.au"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={(profile.company_info as any)?.social_media?.linkedin || ''}
                      onChange={(e) => handleJsonFieldChange('company_info', 'social_media.linkedin', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={(profile.company_info as any)?.social_media?.facebook || ''}
                      onChange={(e) => handleJsonFieldChange('company_info', 'social_media.facebook', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={(profile.company_info as any)?.social_media?.instagram || ''}
                      onChange={(e) => handleJsonFieldChange('company_info', 'social_media.instagram', e.target.value)}
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
                      value={(profile.company_info as any)?.social_media?.tiktok || ''}
                      onChange={(e) => handleJsonFieldChange('company_info', 'social_media.tiktok', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Financial Overview */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Overview</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  This data will be automatically pulled from Xero once integrated. For now, please enter manually.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revenue (Annual) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={profile.annual_revenue || ''}
                      onChange={(e) => handleFieldChange('annual_revenue', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  {profile.annual_revenue && (
                    <p className="text-sm text-gray-600 mt-1">
                      Stage: <span className="font-medium text-blue-600">{getRevenueStage(profile.annual_revenue)}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gross Profit
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={(profile.financial_metrics as any)?.gross_profit || ''}
                      onChange={(e) => handleJsonFieldChange('financial_metrics', 'gross_profit', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Net Profit
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={(profile.financial_metrics as any)?.net_profit || ''}
                      onChange={(e) => handleJsonFieldChange('financial_metrics', 'net_profit', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cash Position
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={(profile.financial_metrics as any)?.cash_position || ''}
                      onChange={(e) => handleJsonFieldChange('financial_metrics', 'cash_position', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accounts Receivable Days
                  </label>
                  <input
                    type="number"
                    value={(profile.financial_metrics as any)?.receivable_days || ''}
                    onChange={(e) => handleJsonFieldChange('financial_metrics', 'receivable_days', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Average days to collect payment</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accounts Payable Days
                  </label>
                  <input
                    type="number"
                    value={(profile.financial_metrics as any)?.payable_days || ''}
                    onChange={(e) => handleJsonFieldChange('financial_metrics', 'payable_days', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Average days to pay suppliers</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Net Asset Position
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={(profile.financial_metrics as any)?.net_assets || ''}
                      onChange={(e) => handleJsonFieldChange('financial_metrics', 'net_assets', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total assets minus total liabilities</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Team & Organisation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Team & Organisational Structure</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Team
                  </label>
                  <input
                    type="number"
                    value={profile.employee_count || ''}
                    onChange={(e) => handleFieldChange('employee_count', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full-time
                  </label>
                  <input
                    type="number"
                    value={(profile.team_structure as any)?.full_time || ''}
                    onChange={(e) => handleJsonFieldChange('team_structure', 'full_time', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Part-time
                  </label>
                  <input
                    type="number"
                    value={(profile.team_structure as any)?.part_time || ''}
                    onChange={(e) => handleJsonFieldChange('team_structure', 'part_time', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contractors
                  </label>
                  <input
                    type="number"
                    value={(profile.team_structure as any)?.contractors || ''}
                    onChange={(e) => handleJsonFieldChange('team_structure', 'contractors', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offshore
                  </label>
                  <input
                    type="number"
                    value={(profile.team_structure as any)?.offshore || ''}
                    onChange={(e) => handleJsonFieldChange('team_structure', 'offshore', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Key Roles & Leadership</h3>
                
                {/* Team Members Table */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Name</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Role</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Status</th>
                        <th className="py-2 px-3 text-sm font-medium text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {((profile.team_structure as any)?.team_members || []).map((member: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={member.name || ''}
                              onChange={(e) => {
                                const updatedMembers = [...((profile.team_structure as any)?.team_members || [])]
                                updatedMembers[index] = { ...updatedMembers[index], name: e.target.value }
                                handleJsonFieldChange('team_structure', 'team_members', updatedMembers)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              placeholder="John Smith"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={member.role || ''}
                              onChange={(e) => {
                                const updatedMembers = [...((profile.team_structure as any)?.team_members || [])]
                                updatedMembers[index] = { ...updatedMembers[index], role: e.target.value }
                                handleJsonFieldChange('team_structure', 'team_members', updatedMembers)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              placeholder="CEO"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={member.status || ''}
                              onChange={(e) => {
                                const updatedMembers = [...((profile.team_structure as any)?.team_members || [])]
                                updatedMembers[index] = { ...updatedMembers[index], status: e.target.value }
                                handleJsonFieldChange('team_structure', 'team_members', updatedMembers)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="">Select Status</option>
                              <option value="Full Time">Full Time</option>
                              <option value="Part Time">Part Time</option>
                              <option value="Contractor">Contractor</option>
                              <option value="Offshore">Offshore</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={() => {
                                const updatedMembers = ((profile.team_structure as any)?.team_members || []).filter((_: any, i: number) => i !== index)
                                handleJsonFieldChange('team_structure', 'team_members', updatedMembers)
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <button
                    onClick={() => {
                      const currentMembers = (profile.team_structure as any)?.team_members || []
                      handleJsonFieldChange('team_structure', 'team_members', [...currentMembers, { name: '', role: '', status: '' }])
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Team Member
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Products & Services */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Products & Services</h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Product/Service</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Type</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Price ($)</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">% of Revenue</th>
                      <th className="py-2 px-3 text-sm font-medium text-gray-700"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {((profile.products_services as any)?.items || []).map((item: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => {
                              const updatedItems = [...((profile.products_services as any)?.items || [])]
                              updatedItems[index] = { ...updatedItems[index], name: e.target.value }
                              handleJsonFieldChange('products_services', 'items', updatedItems)
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            placeholder="Product/Service name"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={item.type || ''}
                            onChange={(e) => {
                              const updatedItems = [...((profile.products_services as any)?.items || [])]
                              updatedItems[index] = { ...updatedItems[index], type: e.target.value }
                              handleJsonFieldChange('products_services', 'items', updatedItems)
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value="">Select Type</option>
                            <option value="Product">Product</option>
                            <option value="Service">Service</option>
                            <option value="Subscription">Subscription</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={item.price || ''}
                            onChange={(e) => {
                              const updatedItems = [...((profile.products_services as any)?.items || [])]
                              updatedItems[index] = { ...updatedItems[index], price: parseFloat(e.target.value) || 0 }
                              handleJsonFieldChange('products_services', 'items', updatedItems)
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={item.revenue_percentage || ''}
                            onChange={(e) => {
                              const updatedItems = [...((profile.products_services as any)?.items || [])]
                              updatedItems[index] = { ...updatedItems[index], revenue_percentage: parseFloat(e.target.value) || 0 }
                              handleJsonFieldChange('products_services', 'items', updatedItems)
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            placeholder="0"
                            min="0"
                            max="100"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => {
                              const updatedItems = ((profile.products_services as any)?.items || []).filter((_: any, i: number) => i !== index)
                              handleJsonFieldChange('products_services', 'items', updatedItems)
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <button
                  onClick={() => {
                    const currentItems = (profile.products_services as any)?.items || []
                    handleJsonFieldChange('products_services', 'items', [...currentItems, { name: '', type: '', price: 0, revenue_percentage: 0 }])
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Product/Service
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unique Value Proposition
                </label>
                <textarea
                  value={(profile.products_services as any)?.value_proposition || ''}
                  onChange={(e) => handleJsonFieldChange('products_services', 'value_proposition', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What makes you different from competitors? Why do customers choose you?"
                />
              </div>
            </div>
          )}

          {/* Step 5: Customer Overview */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Type
                  </label>
                  <select
                    value={(profile.customer_intelligence as any)?.purchase_type || ''}
                    onChange={(e) => handleJsonFieldChange('customer_intelligence', 'purchase_type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="One-time">One-time purchase (e.g., building a home)</option>
                    <option value="Repeat">Repeat purchase (e.g., consumables)</option>
                    <option value="Mixed">Mixed (both one-time and repeat)</option>
                  </select>
                </div>

                {(profile.customer_intelligence as any)?.purchase_type !== 'One-time' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Customers/Clients
                    </label>
                    <input
                      type="number"
                      value={(profile.customer_intelligence as any)?.total_customers || ''}
                      onChange={(e) => handleJsonFieldChange('customer_intelligence', 'total_customers', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                )}

                {(profile.customer_intelligence as any)?.purchase_type === 'One-time' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Projects Completed (Last 12 Months)
                    </label>
                    <input
                      type="number"
                      value={(profile.customer_intelligence as any)?.projects_completed || ''}
                      onChange={(e) => handleJsonFieldChange('customer_intelligence', 'projects_completed', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Type
                  </label>
                  <select
                    value={(profile.customer_intelligence as any)?.customer_type || ''}
                    onChange={(e) => handleJsonFieldChange('customer_intelligence', 'customer_type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Individual Consumers">Individual Consumers</option>
                    <option value="Small Business">Small Business</option>
                    <option value="Medium Business">Medium Business</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Government">Government</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Geographic Reach
                  </label>
                  <select
                    value={(profile.customer_intelligence as any)?.geographic_reach || ''}
                    onChange={(e) => handleJsonFieldChange('customer_intelligence', 'geographic_reach', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Local">Local (City/Region)</option>
                    <option value="State">State-wide</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 text-gray-800">Digital Presence & Database</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Social Media Followers
                    </label>
                    <input
                      type="number"
                      value={(profile.customer_intelligence as any)?.social_followers || ''}
                      onChange={(e) => handleJsonFieldChange('customer_intelligence', 'social_followers', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Combined across all platforms"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Do you have a customer database?
                    </label>
                    <select
                      value={(profile.customer_intelligence as any)?.has_database || ''}
                      onChange={(e) => handleJsonFieldChange('customer_intelligence', 'has_database', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Partial">Partial/Informal</option>
                    </select>
                  </div>

                  {((profile.customer_intelligence as any)?.has_database === 'Yes' || (profile.customer_intelligence as any)?.has_database === 'Partial') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Database Size (Contacts)
                      </label>
                      <input
                        type="number"
                        value={(profile.customer_intelligence as any)?.database_size || ''}
                        onChange={(e) => handleJsonFieldChange('customer_intelligence', 'database_size', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Current + past + prospective"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Customer Description
                </label>
                <textarea
                  value={(profile.customer_intelligence as any)?.target_customer || ''}
                  onChange={(e) => handleJsonFieldChange('customer_intelligence', 'target_customer', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your ideal customer..."
                />
              </div>
            </div>
          )}

          {/* Step 6: Strategic Context */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Strategic Context</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  Keep this brief - detailed strategic planning will be captured in the diagnostic assessment and strategic wheel modules.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Goal (Next 12 Months)
                </label>
                <textarea
                  value={(profile.strategic_context as any)?.primary_goal || ''}
                  onChange={(e) => handleJsonFieldChange('strategic_context', 'primary_goal', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's your main focus for the next year?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exit Timeline
                  </label>
                  <select
                    value={(profile.strategic_context as any)?.exit_timeline || ''}
                    onChange={(e) => handleJsonFieldChange('strategic_context', 'exit_timeline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="No exit planned">No exit planned</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Growth Ambition
                  </label>
                  <select
                    value={(profile.strategic_context as any)?.growth_ambition || ''}
                    onChange={(e) => handleJsonFieldChange('strategic_context', 'growth_ambition', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Lifestyle">Lifestyle business</option>
                    <option value="Steady">Steady growth (10-20% pa)</option>
                    <option value="Moderate">Moderate growth (20-50% pa)</option>
                    <option value="Aggressive">Aggressive growth (50%+ pa)</option>
                    <option value="Hypergrowth">Hypergrowth (2x+ pa)</option>
                  </select>
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
              onClick={() => setCurrentStep(Math.min(STEPS.length, currentStep + 1))}
              disabled={currentStep === STEPS.length}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === STEPS.length
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Completion Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Profile Completion</h3>
              <p className="text-sm text-gray-600 mt-1">
                A complete profile enables more accurate AI coaching recommendations
              </p>
            </div>
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}