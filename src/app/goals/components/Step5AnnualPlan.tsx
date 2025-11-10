'use client'

import { StrategicInitiative } from '../types'
import { ChevronDown, ChevronUp, AlertCircle, GripVertical } from 'lucide-react'
import { useState } from 'react'

interface Step5Props {
  twelveMonthInitiatives: StrategicInitiative[]
  annualPlanByQuarter: Record<string, StrategicInitiative[]>
  setAnnualPlanByQuarter: (plan: Record<string, StrategicInitiative[]>) => void
}

interface QuarterInfo {
  id: string
  label: string
  title: string
  description: string
  suggestedItems: number
}

const QUARTERS: QuarterInfo[] = [
  {
    id: 'q1',
    label: 'Q1',
    title: 'Foundation & Planning',
    description: 'Set up systems and build momentum',
    suggestedItems: 2
  },
  {
    id: 'q2',
    label: 'Q2',
    title: 'Execution & Momentum',
    description: 'Implement initiatives and measure progress',
    suggestedItems: 2
  },
  {
    id: 'q3',
    label: 'Q3',
    title: 'Scaling & Optimization',
    description: 'Scale what\'s working and adjust',
    suggestedItems: 3
  },
  {
    id: 'q4',
    label: 'Q4',
    title: 'Refinement & Planning',
    description: 'Refine results and plan for next year',
    suggestedItems: 2
  }
]

export default function Step5AnnualPlan({
  twelveMonthInitiatives,
  annualPlanByQuarter,
  setAnnualPlanByQuarter
}: Step5Props) {
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(
    new Set(['q1', 'q2', 'q3', 'q4'])
  )
  const [draggedItem, setDraggedItem] = useState<{
    initiativeId: string
    sourceQuarter: string
  } | null>(null)

  // Toggle quarter expansion
  const toggleQuarter = (quarterId: string) => {
    const newExpanded = new Set(expandedQuarters)
    if (newExpanded.has(quarterId)) {
      newExpanded.delete(quarterId)
    } else {
      newExpanded.add(quarterId)
    }
    setExpandedQuarters(newExpanded)
  }

  // Get unassigned initiatives
  const assignedInitiativeIds = new Set(
    Object.values(annualPlanByQuarter).flat().map(i => i.id)
  )
  const unassignedInitiatives = twelveMonthInitiatives.filter(
    i => !assignedInitiativeIds.has(i.id)
  )

  // Add initiative to quarter
  const handleAddToQuarter = (initiative: StrategicInitiative, quarterId: string) => {
    setAnnualPlanByQuarter({
      ...annualPlanByQuarter,
      [quarterId]: [...(annualPlanByQuarter[quarterId] || []), initiative]
    })
  }

  // Remove initiative from quarter
  const handleRemoveFromQuarter = (initiativeId: string, quarterId: string) => {
    setAnnualPlanByQuarter({
      ...annualPlanByQuarter,
      [quarterId]: annualPlanByQuarter[quarterId].filter(i => i.id !== initiativeId)
    })
  }

  // Handle drag start
  const handleDragStart = (initiativeId: string, sourceQuarter: string) => {
    setDraggedItem({ initiativeId, sourceQuarter })
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-300')
  }

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300')
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetQuarter: string) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300')

    if (!draggedItem) return

    const { initiativeId, sourceQuarter } = draggedItem

    // If dragging from unassigned to quarter
    if (sourceQuarter === 'unassigned') {
      const initiative = unassignedInitiatives.find(i => i.id === initiativeId)
      if (initiative) {
        handleAddToQuarter(initiative, targetQuarter)
      }
    } else if (sourceQuarter === targetQuarter) {
      // Same quarter - do nothing
      return
    } else {
      // Moving between quarters
      const initiative = annualPlanByQuarter[sourceQuarter]?.find(i => i.id === initiativeId)
      if (initiative) {
        handleRemoveFromQuarter(initiativeId, sourceQuarter)
        handleAddToQuarter(initiative, targetQuarter)
      }
    }

    setDraggedItem(null)
  }

  // Calculate quarter utilization
  const getQuarterStatus = (quarterId: string, suggestedItems: number) => {
    const count = annualPlanByQuarter[quarterId]?.length || 0
    if (count === 0) return 'empty'
    if (count < suggestedItems) return 'partial'
    if (count === suggestedItems) return 'ideal'
    return 'overloaded'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ideal':
        return 'bg-green-50 border-green-200'
      case 'overloaded':
        return 'bg-amber-50 border-amber-200'
      case 'partial':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Distribute Across Your Year</h3>
          <p className="text-sm text-gray-600">
            Drag initiatives from the left to distribute them across quarters. Balance workload: aim for {QUARTERS.reduce((sum, q) => sum + q.suggestedItems, 0)} total (2-2-3-2).
          </p>
        </div>

        {/* Warning if no initiatives selected */}
        {twelveMonthInitiatives.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">No initiatives selected</p>
                <p className="text-sm text-amber-700 mt-1">
                  Go back to Step 4 to select 5-10 initiatives first.
                </p>
              </div>
            </div>
          </div>
        )}

        {twelveMonthInitiatives.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Unassigned Column */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4">
                <h4 className="font-semibold text-gray-900 text-sm mb-4 uppercase tracking-wider">
                  Available
                </h4>
                <div className="space-y-2">
                  {unassignedInitiatives.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-6">
                      All initiatives assigned ✓
                    </p>
                  ) : (
                    unassignedInitiatives.map((initiative) => (
                      <div
                        key={initiative.id}
                        draggable
                        onDragStart={() => handleDragStart(initiative.id, 'unassigned')}
                        className="p-2 bg-white border border-gray-200 rounded cursor-move hover:shadow-md hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs font-medium text-gray-900 line-clamp-2">
                            {initiative.title}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quarter Columns */}
            {QUARTERS.map((quarter) => {
              const status = getQuarterStatus(quarter.id, quarter.suggestedItems)
              const items = annualPlanByQuarter[quarter.id] || []
              const isExpanded = expandedQuarters.has(quarter.id)

              return (
                <div key={quarter.id} className="lg:col-span-1">
                  <div className={`rounded-lg border-2 p-4 min-h-96 ${getStatusColor(status)}`}>
                    {/* Quarter Header */}
                    <button
                      onClick={() => toggleQuarter(quarter.id)}
                      className="w-full text-left mb-4 pb-3 border-b border-current border-opacity-20"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                            {quarter.label}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 font-medium">
                            {quarter.title}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {items.length} of {quarter.suggestedItems} initiatives
                      </p>
                    </button>

                    {/* Drop Zone */}
                    {isExpanded && (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, quarter.id)}
                        className="border-2 border-dashed border-current border-opacity-30 rounded-lg p-3 mb-4 min-h-20 transition-all"
                      >
                        {items.length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-4">
                            Drag initiatives here
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {items.map((initiative, index) => (
                              <div
                                key={initiative.id}
                                draggable
                                onDragStart={() => handleDragStart(initiative.id, quarter.id)}
                                className="p-2 bg-white rounded border border-current border-opacity-30 cursor-move hover:shadow-md transition-all group"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    <span className="text-xs font-bold text-current text-opacity-60 mt-0.5">
                                      {index + 1}
                                    </span>
                                    <p className="text-xs font-medium text-gray-900 line-clamp-2">
                                      {initiative.title}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveFromQuarter(initiative.id, quarter.id)}
                                    className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                    title="Remove"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary & Guidance */}
      {twelveMonthInitiatives.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-900">📊 Your Annual Distribution</p>
            <div className="grid grid-cols-4 gap-2">
              {QUARTERS.map((quarter) => {
                const items = annualPlanByQuarter[quarter.id] || []
                return (
                  <div key={quarter.id} className="text-center p-2 bg-white rounded border border-blue-200">
                    <p className="text-xs font-bold text-blue-600">{quarter.label}</p>
                    <p className="text-lg font-bold text-gray-900">{items.length}</p>
                    <p className="text-xs text-gray-600">of {quarter.suggestedItems}</p>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-blue-700 mt-3">
              ℹ️ Aim for balance: 2 in Q1, 2 in Q2, 3 in Q3, 2 in Q4. This staggers rollout and allows learning.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}