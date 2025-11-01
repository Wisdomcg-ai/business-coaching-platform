'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ArrowRight, Save } from 'lucide-react'
import { getNextSection, getPreviousSection } from '@/lib/strategic-wheel-navigation'

export default function VisionPurposePage() {
  const router = useRouter()
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedDataRef = useRef<string>('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Form data
  const [purposeStatement, setPurposeStatement] = useState('')
  const [visionStatement, setVisionStatement] = useState('')
  const [coreValues, setCoreValues] = useState<string[]>(['', '', '', '', '', '', '', ''])

  // Validation
  const isValid = purposeStatement.trim() !== '' && 
                  visionStatement.trim() !== '' && 
                  coreValues.filter(v => v.trim() !== '').length >= 3

  // Auto-save functionality
  const handleFieldChange = () => {
    setHasUnsavedChanges(true)
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save (2 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      saveData()
    }, 2000)
  }

  const saveData = async () => {
    const dataToSave = {
      purpose_statement: purposeStatement,
      vision_statement: visionStatement,
      core_values: coreValues.filter(v => v.trim() !== '')
    }

    // Check if data has actually changed
    const currentDataString = JSON.stringify(dataToSave)
    if (currentDataString === lastSavedDataRef.current) {
      setHasUnsavedChanges(false)
      return
    }

    setSaving(true)
    try {
      // For now, just save locally
      console.log('Saving data:', dataToSave)
      lastSavedDataRef.current = currentDataString
      setHasUnsavedChanges(false)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCoreValueChange = (index: number, value: string) => {
    const newValues = [...coreValues]
    newValues[index] = value
    setCoreValues(newValues)
    handleFieldChange()
  }

  const handleNext = async () => {
    if (!isValid) {
      alert('Please complete all required fields before proceeding.')
      return
    }
    
    await saveData()
    const nextSection = getNextSection('vision-purpose')
    if (nextSection) {
      router.push(`/strategic-wheel/${nextSection}`)
    }
  }

  const handlePrevious = () => {
    router.push('/strategic-wheel')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
                <h1 className="text-2xl font-bold text-gray-900">Vision & Purpose</h1>
                <p className="text-gray-600 mt-1">Define why your business exists and where it's going</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>

        {/* Purpose Statement */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Purpose Statement <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">Complete this sentence: Our business exists to...</p>
            <textarea
              value={purposeStatement}
              onChange={(e) => {
                setPurposeStatement(e.target.value)
                handleFieldChange()
              }}
              placeholder="e.g., help small businesses achieve sustainable growth through innovative solutions..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Vision Statement */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              3-Year Vision Statement <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">In 3 years, our business will be...</p>
            <textarea
              value={visionStatement}
              onChange={(e) => {
                setVisionStatement(e.target.value)
                handleFieldChange()
              }}
              placeholder="e.g., the leading provider of X in our region, serving 500+ clients with a team of 20..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Core Values <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2">(minimum 3 required)</span>
            </label>
            <p className="text-sm text-gray-600 mb-4">List the principles that guide every decision (up to 8 values)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {coreValues.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleCoreValueChange(index, e.target.value)}
                    placeholder={index < 3 ? 'Required' : 'Optional'}
                    className={`flex-1 px-3 py-2 border ${
                      index < 3 && !value.trim() ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Overview
          </button>
          
          <button
            onClick={handleNext}
            disabled={!isValid}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next: Strategy & Market
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
