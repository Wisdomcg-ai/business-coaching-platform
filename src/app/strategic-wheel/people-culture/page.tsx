'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'

interface HiringPriority {
  role: string
  salary: string
  start_date: string
  comments: string
}

interface PeopleCultureData {
  // Functional Accountability Chart
  roles: {
    function: string
    person: string
    responsibilities: string
    success_metric: string
  }[]
  
  // Culture Design
  culture_description: string
  
  // Hiring Priorities - Updated structure
  hiring_priorities: HiringPriority[]
  
  // Retention Strategy
  recognition_rewards: string
  growth_opportunities: string
  work_environment: string
  compensation_strategy: string
}

export default function PeopleCulturePage() {
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
  
  const [formData, setFormData] = useState<PeopleCultureData>({
    roles: [
      { function: 'Sales & Business Development', person: '', responsibilities: '', success_metric: '' },
      { function: 'Marketing & Lead Generation', person: '', responsibilities: '', success_metric: '' },
      { function: 'Operations & Delivery', person: '', responsibilities: '', success_metric: '' },
      { function: 'Finance & Administration', person: '', responsibilities: '', success_metric: '' },
      { function: 'Customer Success', person: '', responsibilities: '', success_metric: '' },
      { function: 'Leadership & Strategy', person: '', responsibilities: '', success_metric: '' }
    ],
    culture_description: '',
    hiring_priorities: [
      { role: '', salary: '', start_date: '', comments: '' },
      { role: '', salary: '', start_date: '', comments: '' }
    ],
    recognition_rewards: '',
    growth_opportunities: '',
    work_environment: '',
    compensation_strategy: ''
  })

  // Validation
  const isValid = formData.roles.some(role => role.person.trim() !== '') && 
                  formData.culture_description.trim() !== ''

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

      // Load existing Strategic Wheel data
      const { data: wheel, error: wheelError } = await supabase
        .from('strategic_wheels')
        .select('*')
        .eq('business_id', profile.business_id)
        .single()

      if (wheelError && wheelError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Wheel error:', wheelError)
      }

      if (wheel?.people_culture) {
        const pc = wheel.people_culture
        
        // Handle legacy data format
        let hiringPriorities: HiringPriority[] = []
        if (pc.hiring_priorities && Array.isArray(pc.hiring_priorities)) {
          hiringPriorities = pc.hiring_priorities
        } else if (pc.hiring_priority_1 || pc.hiring_priority_2) {
          // Convert old format to new format
          if (pc.hiring_priority_1) {
            hiringPriorities.push({ role: pc.hiring_priority_1, salary: '', start_date: '', comments: '' })
          }
          if (pc.hiring_priority_2) {
            hiringPriorities.push({ role: pc.hiring_priority_2, salary: '', start_date: '', comments: '' })
          }
        }
        
        // Ensure at least 2 rows
        while (hiringPriorities.length < 2) {
          hiringPriorities.push({ role: '', salary: '', start_date: '', comments: '' })
        }
        
        setFormData({
          roles: pc.roles || formData.roles,
          culture_description: pc.culture_description || '',
          hiring_priorities: hiringPriorities,
          recognition_rewards: pc.recognition_rewards || '',
          growth_opportunities: pc.growth_opportunities || '',
          work_environment: pc.work_environment || '',
          compensation_strategy: pc.compensation_strategy || ''
        })
        setLastSaved(new Date(wheel.updated_at))
        lastSavedDataRef.current = JSON.stringify(pc)
      }
    } catch (error) {
      console.error('Error loading:', error)
      setErrorMessage('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Auto-save functionality
  const handleFieldChange = () => {
    setHasUnsavedChanges(true)
    setErrorMessage(null) // Clear any previous errors
    
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
      // First check if a record exists
      const { data: existing } = await supabase
        .from('strategic_wheels')
        .select('id')
        .eq('business_id', businessId)
        .single()

      let result
      if (existing) {
        // Update existing record
        result = await supabase
          .from('strategic_wheels')
          .update({
            people_culture: formData,
            updated_at: new Date().toISOString()
          })
          .eq('business_id', businessId)
      } else {
        // Create new record
        result = await supabase
          .from('strategic_wheels')
          .insert({
            business_id: businessId,
            people_culture: formData,
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

  const updateRole = (index: number, field: string, value: string) => {
    const newRoles = [...formData.roles]
    newRoles[index] = { ...newRoles[index], [field]: value }
    setFormData(prev => ({ ...prev, roles: newRoles }))
    handleFieldChange()
  }

  const updateHiringPriority = (index: number, field: keyof HiringPriority, value: string) => {
    const newPriorities = [...formData.hiring_priorities]
    newPriorities[index] = { ...newPriorities[index], [field]: value }
    setFormData(prev => ({ ...prev, hiring_priorities: newPriorities }))
    handleFieldChange()
  }

  const addHiringPriority = () => {
    if (formData.hiring_priorities.length < 10) {
      setFormData(prev => ({
        ...prev,
        hiring_priorities: [...prev.hiring_priorities, { role: '', salary: '', start_date: '', comments: '' }]
      }))
      handleFieldChange()
    }
  }

  const removeHiringPriority = (index: number) => {
    if (formData.hiring_priorities.length > 2) {
      const newPriorities = formData.hiring_priorities.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, hiring_priorities: newPriorities }))
      handleFieldChange()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid) {
      alert('Please complete at least one team role and define your culture.')
      return
    }

    await saveData()
    
    // Only navigate if save was successful
    if (!errorMessage) {
      router.push('/strategic-wheel/systems-execution')
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
                <h1 className="text-3xl font-bold text-gray-900">People & Culture</h1>
                <p className="mt-2 text-gray-600">WHO is on your team and HOW do you work together</p>
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
          <div className="text-sm text-gray-500">Component 3 of 6</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Functional Accountability Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Functional Accountability Chart <span className="text-red-500">*</span>
            </h2>
            <p className="text-gray-600 mb-4">Map your key roles and responsibilities:</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-700">Function/Role</th>
                    <th className="text-left p-3 font-medium text-gray-700">Person Responsible</th>
                    <th className="text-left p-3 font-medium text-gray-700">Key Responsibilities</th>
                    <th className="text-left p-3 font-medium text-gray-700">Success Metric</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.roles.map((role, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium text-sm text-gray-700">{role.function}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={role.person}
                          onChange={(e) => updateRole(index, 'person', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Name"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={role.responsibilities}
                          onChange={(e) => updateRole(index, 'responsibilities', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Main duties"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={role.success_metric}
                          onChange={(e) => updateRole(index, 'success_metric', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="KPI"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Culture Design */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Culture Design <span className="text-red-500">*</span>
            </h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How do you want people to feel working with/for you?
            </label>
            <textarea
              value={formData.culture_description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, culture_description: e.target.value }))
                handleFieldChange()
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Describe your ideal workplace culture, team dynamics, and working environment..."
            />
          </div>

          {/* Hiring Priorities - Updated Table Format */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Hiring Priorities</h2>
            <p className="text-gray-600 mb-4">What roles do you need to hire in the next 12 months that align with your goals?</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-700">Role</th>
                    <th className="text-left p-3 font-medium text-gray-700">Estimated Annual Salary</th>
                    <th className="text-left p-3 font-medium text-gray-700">Estimated Start Date</th>
                    <th className="text-left p-3 font-medium text-gray-700">Comments</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.hiring_priorities.map((priority, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="text"
                          value={priority.role}
                          onChange={(e) => updateHiringPriority(index, 'role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Sales Manager"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={priority.salary}
                          onChange={(e) => updateHiringPriority(index, 'salary', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., $75,000"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="date"
                          value={priority.start_date}
                          onChange={(e) => updateHiringPriority(index, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={priority.comments}
                          onChange={(e) => updateHiringPriority(index, 'comments', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Additional notes"
                        />
                      </td>
                      <td className="p-3">
                        {formData.hiring_priorities.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeHiringPriority(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {formData.hiring_priorities.length < 10 && (
              <button
                type="button"
                onClick={addHiringPriority}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Another Role
              </button>
            )}
            <p className="mt-2 text-sm text-gray-500">
              You can add up to {10 - formData.hiring_priorities.length} more roles
            </p>
          </div>

          {/* Retention Strategy */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Retention Strategy</h2>
            <p className="text-gray-600 mb-4">What will you do to keep your best people?</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recognition & Rewards
                </label>
                <textarea
                  value={formData.recognition_rewards}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, recognition_rewards: e.target.value }))
                    handleFieldChange()
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="How will you recognize and reward great performance?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Growth Opportunities
                </label>
                <textarea
                  value={formData.growth_opportunities}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, growth_opportunities: e.target.value }))
                    handleFieldChange()
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="What development and advancement opportunities will you offer?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Environment
                </label>
                <textarea
                  value={formData.work_environment}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, work_environment: e.target.value }))
                    handleFieldChange()
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="What kind of workplace will you create?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compensation Strategy
                </label>
                <textarea
                  value={formData.compensation_strategy}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, compensation_strategy: e.target.value }))
                    handleFieldChange()
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="How will you structure pay and benefits?"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push('/strategic-wheel/strategy-market')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Previous: Strategy & Market
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