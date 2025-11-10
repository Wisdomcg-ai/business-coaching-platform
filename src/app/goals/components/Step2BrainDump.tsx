'use client'

import { StrategicInitiative } from '../types'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface Step2Props {
  brainDumpIdeas: StrategicInitiative[]
  setBrainDumpIdeas: (ideas: StrategicInitiative[]) => void
}

const generateId = () => `idea-${Date.now()}-${Math.random()}`

export default function Step2BrainDump({
  brainDumpIdeas = [],
  setBrainDumpIdeas
}: Step2Props) {
  const [newIdea, setNewIdea] = useState('')

  const handleAddIdea = () => {
    if (newIdea.trim()) {
      const idea: StrategicInitiative = {
        id: generateId(),
        title: newIdea.trim(),
        source: 'brain_dump',
        selected: false
      }
      setBrainDumpIdeas([...(brainDumpIdeas || []), idea])
      setNewIdea('')
    }
  }

  const handleRemoveIdea = (id: string) => {
    setBrainDumpIdeas((brainDumpIdeas || []).filter(i => i.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddIdea()
    }
  }

  const safeIdeas = brainDumpIdeas || []

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Brain Dump Your Ideas</h3>
          <p className="text-sm text-gray-600">
            Capture all the initiatives, projects, and ideas you want to pursue in the next 12 months. Don't filter - just dump them all here. We'll prioritize in the next step.
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add an idea (e.g., 'Launch new marketing campaign')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleAddIdea}
            disabled={!newIdea.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Ideas List */}
        {safeIdeas.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-lg text-center border-2 border-dashed border-gray-300">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No ideas yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Start typing above and press Enter or click Add to capture your ideas
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {safeIdeas.map((idea, index) => (
              <div
                key={idea.id}
                className="flex items-start justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium text-gray-900 pt-0.5">{idea.title}</p>
                </div>
                <button
                  onClick={() => handleRemoveIdea(idea.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0"
                  title="Delete idea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {safeIdeas.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>{safeIdeas.length}</strong> idea{safeIdeas.length !== 1 ? 's' : ''} captured. Ready to see recommendations!
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          ⭐ <strong>Pro Tip:</strong> Think big and capture everything. Include quick wins, strategic initiatives, team improvements, and system upgrades. We'll filter to 5-10 in the next step.
        </p>
      </div>
    </div>
  )
}