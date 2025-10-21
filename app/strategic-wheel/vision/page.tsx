'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function VisionPurpose() {
  const [formData, setFormData] = useState({
    purposeStatement: '',
    visionStatement: '',
    coreValues: ['', '', '', '', '', '', '', '']
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Load existing data if any
      const { data: wheelData } = await supabase
        .from('strategic_wheels')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (wheelData) {
        setFormData({
          purposeStatement: wheelData.purpose_statement || '',
          visionStatement: wheelData.vision_statement || '',
          coreValues: wheelData.core_values || ['', '', '', '', '', '', '', '']
        })
      }
    }
    loadData()
  }, [router, supabase])

  const handleSave = async () => {
    setSaving(true)
    
    const { error } = await supabase
      .from('strategic_wheels')
      .upsert({
        user_id: user.id,
        purpose_statement: formData.purposeStatement,
        vision_statement: formData.visionStatement,
        core_values: formData.coreValues.filter(v => v.trim() !== ''),
        vision_completed: true,
        updated_at: new Date().toISOString()
      })

    if (!error) {
      setSaved(true)
      // Show success message then redirect to next component
      setTimeout(() => {
        router.push('/strategic-wheel/strategy')
      }, 1500)
    }
    setSaving(false)
  }

  const handleSaveAndExit = async () => {
    setSaving(true)
    
    const { error } = await supabase
      .from('strategic_wheels')
      .upsert({
        user_id: user.id,
        purpose_statement: formData.purposeStatement,
        vision_statement: formData.visionStatement,
        core_values: formData.coreValues.filter(v => v.trim() !== ''),
        vision_completed: true,
        updated_at: new Date().toISOString()
      })

    if (!error) {
      router.push('/strategic-wheel')
    }
    setSaving(false)
  }

  const updateCoreValue = (index: number, value: string) => {
    const newValues = [...formData.coreValues]
    newValues[index] = value
    setFormData({ ...formData, coreValues: newValues })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link 
                href="/strategic-wheel"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vision & Purpose</h1>
                <p className="text-sm text-gray-600">Strategic Wheel Component 1 of 6</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">💡</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Progress: Component 1 of 6</span>
            <span>Next: Strategy & Market</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: '16.67%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <p className="text-green-800 font-medium">Saved successfully! Moving to Strategy & Market...</p>
            </div>
          </div>
        )}

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Let's Define Your Vision & Purpose
          </h2>
          <p className="text-gray-600">
            Start with WHY your business exists and WHERE it's going. This foundation will guide every decision you make.
          </p>
        </div>

        {/* Purpose Statement */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Purpose Statement
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Complete this sentence: "Our business exists to..."
            </p>
            <textarea
              value={formData.purposeStatement}
              onChange={(e) => setFormData({ ...formData, purposeStatement: e.target.value })}
              placeholder="Example: ...help small business owners achieve financial freedom through innovative solutions and exceptional service."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        {/* Vision Statement */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              3-Year Vision Statement
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              In 3 years, our business will be...
            </p>
            <textarea
              value={formData.visionStatement}
              onChange={(e) => setFormData({ ...formData, visionStatement: e.target.value })}
              placeholder="Example: ...the recognized leader in our region for [your service], serving 500+ clients with a team of 20 professionals, generating $5M in annual revenue while maintaining our commitment to excellence and innovation."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Core Values
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              List your core values - the principles that guide every decision (add at least 3):
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {formData.coreValues.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm w-4">{index + 1}.</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateCoreValue(index, e.target.value)}
                    placeholder={
                      index === 0 ? "e.g., Integrity" :
                      index === 1 ? "e.g., Innovation" :
                      index === 2 ? "e.g., Excellence" :
                      index === 3 ? "e.g., Customer Focus" :
                      "Enter a core value"
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Success</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your purpose should inspire both you and your team</li>
            <li>• Your vision should be specific, measurable, and exciting</li>
            <li>• Core values should reflect what you truly believe, not what sounds good</li>
            <li>• Keep values to 3-8 maximum - more than that dilutes focus</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link
            href="/strategic-wheel"
            className="px-6 py-3 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Link>
          <div className="flex gap-3">
            <button
              onClick={handleSaveAndExit}
              disabled={saving || !formData.purposeStatement || !formData.visionStatement}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Save & Exit
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.purposeStatement || !formData.visionStatement}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save & Continue →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
