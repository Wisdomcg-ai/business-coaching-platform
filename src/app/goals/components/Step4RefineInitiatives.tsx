'use client'

import { StrategicInitiative } from '../types'
import { AlertCircle, X, Check } from 'lucide-react'

interface Step4Props {
  brainDumpIdeas: StrategicInitiative[]
  roadmapSuggestions: StrategicInitiative[]
  twelveMonthInitiatives: StrategicInitiative[]
  setTwelveMonthInitiatives: (initiatives: StrategicInitiative[]) => void
}

export default function Step4RefineInitiatives({
  brainDumpIdeas,
  roadmapSuggestions,
  twelveMonthInitiatives,
  setTwelveMonthInitiatives
}: Step4Props) {
  // Combine all available initiatives (brain dump + roadmap)
  const allAvailableInitiatives = [...brainDumpIdeas, ...roadmapSuggestions]
  
  const selectedCount = twelveMonthInitiatives.length
  const isOverLimit = selectedCount > 10
  const isInRange = selectedCount >= 5 && selectedCount <= 10

  // Toggle initiative selection
  const handleToggleInitiative = (initiative: StrategicInitiative) => {
    const isSelected = twelveMonthInitiatives.some(item => item.id === initiative.id)
    
    if (isSelected) {
      // Remove from selected
      setTwelveMonthInitiatives(
        twelveMonthInitiatives.filter(item => item.id !== initiative.id)
      )
    } else {
      // Add to selected (no limit enforcement here - let user see the warning)
      setTwelveMonthInitiatives([
        ...twelveMonthInitiatives,
        { ...initiative, selected: true }
      ])
    }
  }

  // Remove initiative from selected
  const handleRemoveInitiative = (initiativeId: string) => {
    setTwelveMonthInitiatives(
      twelveMonthInitiatives.filter(item => item.id !== initiativeId)
    )
  }

  // Clear all selections
  const handleClearAll = () => {
    setTwelveMonthInitiatives([])
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Refine Your 12-Month Initiatives</h3>
          <p className="text-sm text-gray-600">
            Review all your ideas and recommendations below. Select 5-10 initiatives to focus on for the next 12 months.
          </p>
        </div>

        {/* Selection Status */}
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Selected: <span className={selectedCount === 0 ? 'text-gray-500' : 'font-bold text-blue-600'}>{selectedCount}</span> initiatives
              </p>
              <p className="text-xs text-gray-600 mt-1">Goal: 5-10 initiatives</p>
            </div>
            <div className="text-right">
              {selectedCount === 0 && (
                <p className="text-sm text-gray-600">Start selecting initiatives below</p>
              )}
              {selectedCount > 0 && selectedCount < 5 && (
                <p className="text-sm text-amber-600 font-medium">
                  Need at least {5 - selectedCount} more
                </p>
              )}
              {isInRange && (
                <p className="text-sm text-green-600 font-medium flex items-center justify-end gap-1">
                  <Check className="w-4 h-4" /> Perfect range
                </p>
              )}
              {isOverLimit && (
                <p className="text-sm text-red-600 font-medium">
                  {selectedCount - 10} too many ({Math.max(0, selectedCount - 10)} to remove)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Initiatives (Left) */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Available Initiatives</h4>
              <span className="text-xs text-gray-500">{allAvailableInitiatives.length} total</span>
            </div>

            {allAvailableInitiatives.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  No initiatives yet. Go back to Steps 2 & 3 to add ideas and roadmap recommendations.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allAvailableInitiatives.map((initiative) => {
                  const isSelected = twelveMonthInitiatives.some(item => item.id === initiative.id)
                  const source = brainDumpIdeas.some(i => i.id === initiative.id)
                    ? 'your idea'
                    : 'recommended'

                  return (
                    <button
                      key={initiative.id}
                      onClick={() => handleToggleInitiative(initiative)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{initiative.title}</p>
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            {source === 'your idea' ? '💡' : '✨'} {source}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Selected Initiatives (Right) */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
                Your 12-Month Plan
              </h4>
              {selectedCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            {selectedCount === 0 ? (
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Select initiatives from the left to add them here
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto bg-green-50 rounded-lg border border-green-200 p-3">
                {twelveMonthInitiatives.map((initiative, index) => (
                  <div
                    key={initiative.id}
                    className="flex items-start justify-between gap-2 p-2 bg-white rounded border border-green-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                          {index + 1}
                        </span>
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {initiative.title}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveInitiative(initiative.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {isOverLimit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Too many initiatives selected</p>
              <p className="text-sm text-red-700 mt-1">
                You have {selectedCount} initiatives. Please remove {selectedCount - 10} to stay within the 5-10 range.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedCount > 0 && selectedCount < 5 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">You need more initiatives</p>
              <p className="text-sm text-amber-700 mt-1">
                Add at least {5 - selectedCount} more initiatives to reach the recommended minimum of 5.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedCount === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Start selecting initiatives</p>
              <p className="text-sm text-blue-700 mt-1">
                Click any initiative on the left to add it to your 12-month plan. Aim for 5-10 total.
              </p>
            </div>
          </div>
        </div>
      )}

      {isInRange && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✅ <strong>Great!</strong> You have {selectedCount} initiatives selected. Ready to move to the annual plan.
          </p>
        </div>
      )}
    </div>
  )
}