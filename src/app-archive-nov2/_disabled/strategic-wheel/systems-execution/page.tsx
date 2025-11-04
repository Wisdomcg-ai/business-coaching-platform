'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Info } from 'lucide-react'

interface SystemsExecutionData {
  // ATTRACT Process Milestones
  attract_start: string
  attract_middle_1: string
  attract_middle_2: string
  attract_end: string
  
  // CONVERT Process Milestones
  convert_start: string
  convert_middle_1: string
  convert_middle_2: string
  convert_middle_3: string
  convert_end: string
  
  // DELIVER Process Milestones
  deliver_start: string
  deliver_middle_1: string
  deliver_middle_2: string
  deliver_middle_3: string
  deliver_end: string
  
  // RETAIN Process Milestones
  retain_start: string
  retain_middle_1: string
  retain_middle_2: string
  retain_end: string
  
  // Systems Maturity
  processes_documented: number
  processes_followed: number
  system_priority_1: string
  system_priority_2: string
  system_priority_3: string
  
  // Execution Rhythm
  daily_rhythm: string
  weekly_rhythm: string
  monthly_rhythm: string
  quarterly_rhythm: string
}

export default function SystemsExecutionPage() {
  const router = useRouter()
  // supabase client imported from lib
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedDataRef = useRef<string>('')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<SystemsExecutionData>({
    // ATTRACT
    attract_start: '',
    attract_middle_1: '',
    attract_middle_2: '',
    attract_end: '',
    // CONVERT
    convert_start: '',
    convert_middle_1: '',
    convert_middle_2: '',
    convert_middle_3: '',
    convert_end: '',
    // DELIVER
    deliver_start: '',
    deliver_middle_1: '',
    deliver_middle_2: '',
    deliver_middle_3: '',
    deliver_end: '',
    // RETAIN
    retain_start: '',
    retain_middle_1: '',
    retain_middle_2: '',
    retain_end: '',
    // Systems
    processes_documented: 0,
    processes_followed: 0,
    system_priority_1: '',
    system_priority_2: '',
    system_priority_3: '',
    // Rhythm
    daily_rhythm: 'None',
    weekly_rhythm: 'None',
    monthly_rhythm: 'None',
    quarterly_rhythm: 'None'
  })

  // Validation - at least one process has its start and end defined
  const isValid = (formData.attract_start.trim() !== '' && formData.attract_end.trim() !== '') ||
                  (formData.convert_start.trim() !== '' && formData.convert_end.trim() !== '') ||
                  (formData.deliver_start.trim() !== '' && formData.deliver_end.trim() !== '') ||
                  (formData.retain_start.trim() !== '' && formData.retain_end.trim() !== '')

  useEffect(() => {
    loadExistingData()
  }, [])

  const loadExistingData = async () => {
    try {
      setLoading(true)
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', 'temp-user')
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        setErrorMessage('Failed to load profile')
        return
      }

      if (!profile?.business_id) {
        router.push('/dashboard')
        return
      }

      setBusinessId(profile.business_id)

      const { data: wheel, error: wheelError } = await supabase
        .from('strategic_wheels')
        .select('*')
        .eq('business_id', profile.business_id)
        .single()

      if (wheelError && wheelError.code !== 'PGRST116') {
        console.error('Wheel error:', wheelError)
      }

      if (wheel?.systems_execution) {
        const se = wheel.systems_execution
        setFormData({
          ...formData,
          ...se
        })
        setLastSaved(new Date(wheel.updated_at))
        lastSavedDataRef.current = JSON.stringify(se)
      }
    } catch (error) {
      console.error('Error loading:', error)
      setErrorMessage('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = () => {
    setHasUnsavedChanges(true)
    setErrorMessage(null)
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveData()
    }, 2000)
  }

  const saveData = async () => {
    if (!businessId) {
      console.error('No business ID available')
      return
    }

    const currentDataString = JSON.stringify(formData)
    if (currentDataString === lastSavedDataRef.current) {
      setHasUnsavedChanges(false)
      return
    }

    setSaving(true)
    setErrorMessage(null)
    
    try {
      const { data: existing } = await supabase
        .from('strategic_wheels')
        .select('id')
        .eq('business_id', businessId)
        .single()

      let result
      if (existing) {
        result = await supabase
          .from('strategic_wheels')
          .update({
            systems_execution: formData,
            updated_at: new Date().toISOString()
          })
          .eq('business_id', businessId)
      } else {
        result = await supabase
          .from('strategic_wheels')
          .insert({
            business_id: businessId,
            systems_execution: formData,
            updated_at: new Date().toISOString()
          })
      }

      if (result.error) {
        throw result.error
      }

      lastSavedDataRef.current = currentDataString
      setHasUnsavedChanges(false)
      setLastSaved(new Date())
    } catch (error: any) {
      console.error('Error saving:', error)
      const errorMsg = error?.message || 'Failed to save data'
      setErrorMessage(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof SystemsExecutionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    handleFieldChange()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid) {
      alert('Please define at least one process with a start and end point.')
      return
    }

    await saveData()
    
    if (!errorMessage) {
      router.push('/strategic-wheel/money-metrics')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/strategic-wheel')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Systems & Execution</h1>
                <p className="mt-2 text-gray-600">HOW does work actually get done in your business</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {saving && (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Save className="h-4 w-4 animate-pulse" />
                  Saving...
                </span>
              )}
              {!saving && lastSaved && (
                <span className="text-sm text-gray-500">
                  Last saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {hasUnsavedChanges && !saving && (
                <span className="text-sm text-amber-600">Unsaved changes</span>
              )}
              {errorMessage && (
                <span className="text-sm text-red-600">Error: {errorMessage}</span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">Component 4 of 6</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Simple Process Mapping</p>
              <p>Define the key milestones in each of your 4 core business processes. We'll use this information to create detailed workflow diagrams together in a future session.</p>
            </div>
          </div>

          {/* 4 Core Business Processes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">4 Core Business Processes</h2>
            <p className="text-sm text-gray-600">Map the key milestones from start to finish for each process.</p>
          </div>

          {/* ATTRACT Process */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              1. ATTRACT Process (Lead Generation/Marketing)
            </h3>
            <p className="text-sm text-gray-600 mb-4">How do you consistently generate qualified prospects?</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">How it starts:</div>
                <input
                  type="text"
                  value={formData.attract_start}
                  onChange={(e) => updateField('attract_start', e.target.value)}
                  placeholder="e.g., Someone sees our ad / Gets a referral / Finds us on Google"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Then:</div>
                <input
                  type="text"
                  value={formData.attract_middle_1}
                  onChange={(e) => updateField('attract_middle_1', e.target.value)}
                  placeholder="e.g., They visit our website"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Then:</div>
                <input
                  type="text"
                  value={formData.attract_middle_2}
                  onChange={(e) => updateField('attract_middle_2', e.target.value)}
                  placeholder="e.g., They read our content / Watch a video / See testimonials"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Result:</div>
                <input
                  type="text"
                  value={formData.attract_end}
                  onChange={(e) => updateField('attract_end', e.target.value)}
                  placeholder="e.g., They contact us / Book a call / Request a quote"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* CONVERT Process */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              2. CONVERT Process (Sales/Conversion)
            </h3>
            <p className="text-sm text-gray-600 mb-4">How do you turn prospects into paying customers?</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">How it starts:</div>
                <input
                  type="text"
                  value={formData.convert_start}
                  onChange={(e) => updateField('convert_start', e.target.value)}
                  placeholder="e.g., Initial contact / Discovery call / Quote request"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Then:</div>
                <input
                  type="text"
                  value={formData.convert_middle_1}
                  onChange={(e) => updateField('convert_middle_1', e.target.value)}
                  placeholder="e.g., Understand their needs / Qualify them"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Then:</div>
                <input
                  type="text"
                  value={formData.convert_middle_2}
                  onChange={(e) => updateField('convert_middle_2', e.target.value)}
                  placeholder="e.g., Present solution / Send proposal"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Then:</div>
                <input
                  type="text"
                  value={formData.convert_middle_3}
                  onChange={(e) => updateField('convert_middle_3', e.target.value)}
                  placeholder="e.g., Handle objections / Negotiate terms"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Result:</div>
                <input
                  type="text"
                  value={formData.convert_end}
                  onChange={(e) => updateField('convert_end', e.target.value)}
                  placeholder="e.g., They sign contract / Pay deposit / Become customer"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* DELIVER Process */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              3. DELIVER Process (Fulfillment/Service)
            </h3>
            <p className="text-sm text-gray-600 mb-4">How do you consistently deliver your product/service?</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">How it starts:</div>
                <input
                  type="text"
                  value={formData.deliver_start}
                  onChange={(e) => updateField('deliver_start', e.target.value)}
                  placeholder="e.g., Onboard new customer / Schedule work / Set up account"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Then:</div>
                <input
                  type="text"
                  value={formData.deliver_middle_1}
                  onChange={(e) => updateField('deliver_middle_1', e.target.value)}
                  placeholder="e.g., Begin service delivery / Start project"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Then:</div>
                <input
                  type="text"
                  value={formData.deliver_middle_2}
                  onChange={(e) => updateField('deliver_middle_2', e.target.value)}
                  placeholder="e.g., Regular check-ins / Progress updates"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Then:</div>
                <input
                  type="text"
                  value={formData.deliver_middle_3}
                  onChange={(e) => updateField('deliver_middle_3', e.target.value)}
                  placeholder="e.g., Quality check / Final review"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Result:</div>
                <input
                  type="text"
                  value={formData.deliver_end}
                  onChange={(e) => updateField('deliver_end', e.target.value)}
                  placeholder="e.g., Complete delivery / Customer approval / Final invoice"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* RETAIN Process */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              4. RETAIN & GROW Process (Customer Success)
            </h3>
            <p className="text-sm text-gray-600 mb-4">How do you keep customers happy and increase their value?</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">How it starts:</div>
                <input
                  type="text"
                  value={formData.retain_start}
                  onChange={(e) => updateField('retain_start', e.target.value)}
                  placeholder="e.g., After delivery / Post-purchase / End of project"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Then:</div>
                <input
                  type="text"
                  value={formData.retain_middle_1}
                  onChange={(e) => updateField('retain_middle_1', e.target.value)}
                  placeholder="e.g., Follow up / Get feedback / Check satisfaction"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Then:</div>
                <input
                  type="text"
                  value={formData.retain_middle_2}
                  onChange={(e) => updateField('retain_middle_2', e.target.value)}
                  placeholder="e.g., Offer additional services / Share updates / Provide value"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">Result:</div>
                <input
                  type="text"
                  value={formData.retain_end}
                  onChange={(e) => updateField('retain_end', e.target.value)}
                  placeholder="e.g., They refer others / Buy again / Leave a review"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Systems Maturity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Systems Maturity Assessment</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What percentage of your core processes are documented?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.processes_documented}
                    onChange={(e) => updateField('processes_documented', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-16 text-center font-semibold text-blue-600">
                    {formData.processes_documented}%
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How well does your team follow the processes?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.processes_followed}
                    onChange={(e) => updateField('processes_followed', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-16 text-center font-semibold text-blue-600">
                    {formData.processes_followed}%
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What are your top 3 system priorities for the next 90 days?
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.system_priority_1}
                    onChange={(e) => updateField('system_priority_1', e.target.value)}
                    placeholder="Priority 1 - Most important system to create or improve"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={formData.system_priority_2}
                    onChange={(e) => updateField('system_priority_2', e.target.value)}
                    placeholder="Priority 2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={formData.system_priority_3}
                    onChange={(e) => updateField('system_priority_3', e.target.value)}
                    placeholder="Priority 3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Execution Rhythm */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Execution Rhythm</h2>
            <p className="text-sm text-gray-600 mb-4">How often do you review progress and make decisions?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily</label>
                <select
                  value={formData.daily_rhythm}
                  onChange={(e) => updateField('daily_rhythm', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="None">None</option>
                  <option value="Check-ins">Check-ins</option>
                  <option value="Huddles">Huddles</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weekly</label>
                <select
                  value={formData.weekly_rhythm}
                  onChange={(e) => updateField('weekly_rhythm', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="None">None</option>
                  <option value="Team Meeting">Team Meeting</option>
                  <option value="Reviews">Reviews</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly</label>
                <select
                  value={formData.monthly_rhythm}
                  onChange={(e) => updateField('monthly_rhythm', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="None">None</option>
                  <option value="Strategy Review">Strategy Review</option>
                  <option value="Performance Review">Performance Review</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quarterly</label>
                <select
                  value={formData.quarterly_rhythm}
                  onChange={(e) => updateField('quarterly_rhythm', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="None">None</option>
                  <option value="Strategic Planning">Strategic Planning</option>
                  <option value="Business Review">Business Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push('/strategic-wheel/people-culture')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Previous: People & Culture
            </button>
            <button
              type="submit"
              disabled={saving || !isValid}
              className={`px-8 py-3 rounded-lg transition-colors ${
                isValid && !saving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Save & Continue →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}