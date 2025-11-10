// /app/goals/components/Step3Roadmap.tsx
'use client'

import { StrategicInitiative } from '../types'
import { ROADMAP_RECOMMENDATIONS } from '../utils/constants'

interface Step3Props {
  brainDumpIdeas: StrategicInitiative[]
  roadmapSuggestions: StrategicInitiative[]
  setRoadmapSuggestions: (suggestions: StrategicInitiative[]) => void
}

export default function Step3Roadmap({
  brainDumpIdeas,
  roadmapSuggestions,
  setRoadmapSuggestions
}: Step3Props) {
  const isAlreadyAdded = (title: string) => {
    return roadmapSuggestions.some(s => s.title === title) ||
           brainDumpIdeas.some(b => b.title === title)
  }

  const handleAddRecommendation = (suggestion: string) => {
    if (!isAlreadyAdded(suggestion)) {
      const newSuggestion: StrategicInitiative = {
        id: `roadmap-${Date.now()}-${Math.random()}`,
        title: suggestion,
        source: 'roadmap',
        selected: false
      }
      setRoadmapSuggestions([...roadmapSuggestions, newSuggestion])
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stage-Specific Roadmap</h3>
          <p className="text-sm text-gray-600">
            Here's what we recommend for your stage. Compare with your brain dump. Click any to add to your 12-month plan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Your Ideas */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Your Ideas</h4>
            {brainDumpIdeas.length > 0 ? (
              <div className="space-y-2">
                {brainDumpIdeas.map((idea) => (
                  <div key={idea.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-900 font-medium">{idea.title}</p>
                    <p className="text-xs text-blue-600 mt-1">💡 Your idea</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Go back to Step 2 to add ideas first.</p>
            )}
          </div>

          {/* Recommended */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Recommended</h4>
            <div className="space-y-2">
              {ROADMAP_RECOMMENDATIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddRecommendation(suggestion)}
                  disabled={isAlreadyAdded(suggestion)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    isAlreadyAdded(suggestion)
                      ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-50 border-green-200 hover:border-green-400 hover:bg-green-100 cursor-pointer'
                  }`}
                >
                  <p className="text-sm font-medium">{suggestion}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isAlreadyAdded(suggestion) ? '✓ Already added' : '+ Click to add'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          ⚠️ <strong>Next step:</strong> Combine your ideas + roadmap and prioritize what you'll do in 12 months.
        </p>
      </div>
    </div>
  )
}