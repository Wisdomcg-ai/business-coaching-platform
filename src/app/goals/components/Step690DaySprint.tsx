'use client'

import { StrategicInitiative } from '../types'
import { AlertCircle, Check, Plus, Trash2, Target, Zap } from 'lucide-react'
import { useState } from 'react'

interface Step6Props {
  annualPlanByQuarter: Record<string, StrategicInitiative[]>
  sprintFocus: StrategicInitiative[]
  setSprintFocus: (focus: StrategicInitiative[]) => void
  sprintKeyActions: Array<{ id: string; action: string; owner?: string; dueDate?: string }>
  setSprintKeyActions: (actions: Array<{ id: string; action: string; owner?: string; dueDate?: string }>) => void
}

interface KeyAction {
  id: string
  action: string
  owner?: string
  dueDate?: string
}

const generateActionId = () => `action-${Date.now()}-${Math.random()}`

export default function Step690DaySprint({
  annualPlanByQuarter,
  sprintFocus,
  setSprintFocus,
  sprintKeyActions,
  setSprintKeyActions
}: Step6Props) {
  const [newActionText, setNewActionText] = useState('')
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [editingOwner, setEditingOwner] = useState<string | null>(null)
  const [ownerInput, setOwnerInput] = useState('')

  // Get Q1 initiatives for 90-day sprint
  const q1Initiatives = annualPlanByQuarter['q1'] || []
  const totalInitiatives = Object.values(annualPlanByQuarter).flat().length

  // Toggle initiative for sprint focus
  const handleToggleFocus = (initiative: StrategicInitiative) => {
    const isSelected = sprintFocus.some(item => item.id === initiative.id)
    
    if (isSelected) {
      setSprintFocus(sprintFocus.filter(item => item.id !== initiative.id))
    } else {
      setSprintFocus([...sprintFocus, initiative])
    }
  }

  // Add new key action
  const handleAddAction = () => {
    if (newActionText.trim()) {
      const newAction: KeyAction = {
        id: generateActionId(),
        action: newActionText.trim(),
        owner: undefined,
        dueDate: undefined
      }
      setSprintKeyActions([...sprintKeyActions, newAction])
      setNewActionText('')
    }
  }

  // Remove key action
  const handleRemoveAction = (actionId: string) => {
    setSprintKeyActions(sprintKeyActions.filter(a => a.id !== actionId))
    if (selectedActionId === actionId) {
      setSelectedActionId(null)
    }
  }

  // Update action owner
  const handleSaveOwner = (actionId: string) => {
    setSprintKeyActions(
      sprintKeyActions.map(a =>
        a.id === actionId ? { ...a, owner: ownerInput || undefined } : a
      )
    )
    setEditingOwner(null)
    setOwnerInput('')
  }

  // Start editing owner
  const handleEditOwner = (actionId: string, currentOwner?: string) => {
    setEditingOwner(actionId)
    setOwnerInput(currentOwner || '')
  }

  // Handle key press in owner input
  const handleOwnerKeyPress = (e: React.KeyboardEvent, actionId: string) => {
    if (e.key === 'Enter') {
      handleSaveOwner(actionId)
    } else if (e.key === 'Escape') {
      setEditingOwner(null)
      setOwnerInput('')
    }
  }

  // Calculate sprint readiness
  const focusCount = sprintFocus.length
  const actionCount = sprintKeyActions.length
  const isReady = focusCount > 0 && actionCount >= 3

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your 90-Day Sprint</h3>
          <p className="text-sm text-gray-600">
            Define your focus for the next 90 days. This is your sprint to start strong and build momentum.
          </p>
        </div>

        {/* Information Box */}
        {totalInitiatives === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">No annual plan yet</p>
                <p className="text-sm text-amber-700 mt-1">
                  Go back to Step 5 to distribute your initiatives across quarters first.
                </p>
              </div>
            </div>
          </div>
        )}

        {totalInitiatives > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Q1 Initiatives (Left) */}
            <div className="lg:col-span-1">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Q1 Initiatives</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {q1Initiatives.length} items
                </span>
              </div>

              {q1Initiatives.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    Add initiatives to Q1 in Step 5 to appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {q1Initiatives.map((initiative) => {
                    const isSelected = sprintFocus.some(item => item.id === initiative.id)
                    return (
                      <button
                        key={initiative.id}
                        onClick={() => handleToggleFocus(initiative)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{initiative.title}</p>
                            <p className="text-xs text-gray-500 mt-1">Q1 focus area</p>
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

            {/* Sprint Configuration (Middle & Right) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sprint Focus Selection */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-blue-900 text-sm">Sprint Focus</h5>
                    <p className="text-xs text-blue-700 mt-1">
                      Select 1-3 initiatives from Q1 to focus on in the next 90 days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-blue-600">{focusCount}</div>
                  <div className="text-xs text-blue-700">
                    <p>selected</p>
                    <p className="text-blue-600 font-medium">of 3 ideal</p>
                  </div>
                </div>

                {focusCount > 0 && (
                  <div className="mt-4 space-y-2">
                    {sprintFocus.map((initiative, index) => (
                      <div
                        key={initiative.id}
                        className="flex items-start gap-2 p-2 bg-white rounded border border-blue-200"
                      >
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-sm font-medium text-gray-900 flex-1">{initiative.title}</p>
                        <button
                          onClick={() => handleToggleFocus(initiative)}
                          className="text-gray-300 hover:text-red-600 transition-colors"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Actions for 90 Days */}
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-green-900 text-sm">Key Actions (Next 90 Days)</h5>
                    <p className="text-xs text-green-700 mt-1">
                      Define 3-5 specific actions to take in the next 90 days
                    </p>
                  </div>
                </div>

                {/* Action Input */}
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddAction()
                      }
                    }}
                    placeholder="Add a specific action (e.g., 'Launch new marketing campaign')..."
                    className="flex-1 px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleAddAction}
                    disabled={!newActionText.trim()}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Actions List */}
                {sprintKeyActions.length === 0 ? (
                  <p className="text-sm text-green-700 text-center py-4">
                    Add your first key action above
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sprintKeyActions.map((action, index) => (
                      <div
                        key={action.id}
                        onClick={() => setSelectedActionId(action.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedActionId === action.id
                            ? 'bg-white border-green-400 shadow-md'
                            : 'bg-white border-green-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{action.action}</p>
                            
                            {selectedActionId === action.id && (
                              <div className="mt-3 space-y-2">
                                {/* Owner Field */}
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-gray-600 w-12">Owner:</label>
                                  {editingOwner === action.id ? (
                                    <input
                                      type="text"
                                      autoFocus
                                      value={ownerInput}
                                      onChange={(e) => setOwnerInput(e.target.value)}
                                      onKeyDown={(e) => handleOwnerKeyPress(e, action.id)}
                                      onBlur={() => handleSaveOwner(action.id)}
                                      placeholder="e.g., John Smith"
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                  ) : (
                                    <button
                                      onClick={() => handleEditOwner(action.id, action.owner)}
                                      className="flex-1 text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    >
                                      {action.owner ? (
                                        <span className="text-gray-900 font-medium">{action.owner}</span>
                                      ) : (
                                        <span className="text-gray-400 italic">Click to assign owner</span>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {/* Due Date Field */}
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-gray-600 w-12">Due:</label>
                                  <input
                                    type="date"
                                    value={action.dueDate || ''}
                                    onChange={(e) => {
                                      setSprintKeyActions(
                                        sprintKeyActions.map(a =>
                                          a.id === action.id ? { ...a, dueDate: e.target.value || undefined } : a
                                        )
                                      )
                                    }}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                                </div>
                              </div>
                            )}

                            {selectedActionId !== action.id && (
                              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                {action.owner && (
                                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                                    👤 {action.owner}
                                  </span>
                                )}
                                {action.dueDate && (
                                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                                    📅 {new Date(action.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveAction(action.id)
                            }}
                            className="text-gray-300 hover:text-red-600 transition-colors flex-shrink-0"
                            title="Remove action"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Count Summary */}
                <div className="mt-4 flex items-center justify-between p-3 bg-white rounded border border-green-200">
                  <span className="text-sm font-medium text-gray-900">
                    {actionCount} action{actionCount !== 1 ? 's' : ''} defined
                  </span>
                  <span className="text-xs text-green-600">
                    Goal: 3-5 actions
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sprint Readiness Status */}
      {totalInitiatives > 0 && (
        <div className={`rounded-lg border p-4 ${
          isReady
            ? 'bg-green-50 border-green-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            {isReady ? (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              {isReady ? (
                <div>
                  <p className="text-sm font-medium text-green-900">✓ Sprint is ready!</p>
                  <p className="text-sm text-green-700 mt-1">
                    You have {focusCount} focus initiative{focusCount !== 1 ? 's' : ''} and {actionCount} key action{actionCount !== 1 ? 's' : ''}. Time to execute!
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-blue-900">Complete your sprint plan</p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    {focusCount === 0 && <li>• Select at least 1 Q1 initiative as sprint focus</li>}
                    {focusCount > 0 && focusCount < 3 && <li>• Recommend selecting 2-3 focus areas (you have {focusCount})</li>}
                    {actionCount < 3 && <li>• Add at least {3 - actionCount} more key action{3 - actionCount !== 1 ? 's' : ''} (you have {actionCount})</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}