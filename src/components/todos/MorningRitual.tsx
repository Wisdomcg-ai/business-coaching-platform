// MorningRitual.tsx - Morning ritual flow component
// Location: /src/components/todos/MorningRitual.tsx

import React from 'react';
import { 
  Coffee, 
  Zap, 
  Eye, 
  Target, 
  Star, 
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Clock,
  AlertCircle,
  Calendar  // FIXED: Added Calendar import
} from 'lucide-react';
import { EnhancedTodoItem } from './utils/types';
import { MORNING_RITUAL_STEPS, CATEGORIES } from './utils/constants';
import { useMorningRitual } from './hooks/useMorningRitual';
import TodoItem from './TodoItem';

interface MorningRitualProps {
  todos: EnhancedTodoItem[];
  musts: any[];
  currentUserName: string;
  onSelectMust: (todoId: string, level: 1 | 2) => Promise<boolean>;
  onCompleteTodo: (todoId: string) => Promise<boolean>;
  onUpdateTodo: (id: string, updates: any) => Promise<boolean>;
  onDeleteTodo: (id: string) => Promise<boolean>;
  onEditTodo: (todo: EnhancedTodoItem) => void;
  onClose: () => void;
}

export default function MorningRitual({
  todos,
  musts,
  currentUserName,
  onSelectMust,
  onCompleteTodo,
  onUpdateTodo,
  onDeleteTodo,
  onEditTodo,
  onClose
}: MorningRitualProps) {
  const {
    state,
    quickWinTodos,
    todayTodos,
    identifiedMusts,
    selectedTop3,
    canProceed,
    completeQuickWin,
    toggleMustIdentification,
    toggleTop3Selection,
    nextStep,
    previousStep,
    skipStep,
    completeRitual,
    dismissRitual
  } = useMorningRitual({
    todos,
    musts,
    currentUserName,
    onSelectMust,
    onCompleteTodo,
    onClose
  });

  const currentStepConfig = MORNING_RITUAL_STEPS[state.step];

  // Progress indicator
  const steps = Object.keys(MORNING_RITUAL_STEPS);
  const currentStepIndex = steps.indexOf(state.step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Coffee className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Morning Ritual</h1>
                <p className="text-blue-100">
                  Good morning, {currentUserName}! Let's plan your day.
                </p>
              </div>
            </div>
            <button
              onClick={dismissRitual}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <div 
                key={step}
                className="flex items-center gap-1"
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStepIndex 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white bg-opacity-20 text-white'
                  }
                `}>
                  {index < currentStepIndex ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-12 h-0.5 
                    ${index < currentStepIndex ? 'bg-white' : 'bg-white bg-opacity-20'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{currentStepConfig.emoji}</span>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentStepConfig.title}
              </h2>
            </div>
            <p className="text-gray-600">
              {currentStepConfig.description}
            </p>
          </div>

          {/* Step-specific content */}
          {state.step === 'quick-wins' && (
            <div className="space-y-4">
              {quickWinTodos.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No quick wins available right now.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Quick wins are tasks that take 2 minutes or less.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">2-Minute Rule</p>
                        <p className="text-sm text-green-700 mt-1">
                          If it takes less than 2 minutes, do it now! You have {quickWinTodos.length} quick wins.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {quickWinTodos.map(todo => (
                      <div key={todo.id} className="flex items-center gap-3">
                        <TodoItem
                          todo={todo}
                          onToggleStatus={() => {}}
                          onComplete={completeQuickWin}
                          onDelete={onDeleteTodo}
                          onEdit={onEditTodo}
                          onToggleMust={() => {}}
                          compact
                        />
                      </div>
                    ))}
                  </div>
                  
                  {state.quick_wins_completed.length > 0 && (
                    <div className="bg-green-100 rounded-lg p-3 text-green-800">
                      ✅ You've completed {state.quick_wins_completed.length} quick wins!
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {state.step === 'review' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Review Your Day</p>
                    <p className="text-sm text-blue-700 mt-1">
                      You have {todayTodos.length} tasks due today. Take a moment to review them.
                    </p>
                  </div>
                </div>
              </div>
              
              {todayTodos.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No tasks due today.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Great job staying on top of things!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {todayTodos.map(todo => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggleStatus={onUpdateTodo}
                      onComplete={onCompleteTodo}
                      onDelete={onDeleteTodo}
                      onEdit={onEditTodo}
                      onToggleMust={() => {}}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {state.step === 'identify-musts' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Identify TRUE MUSTs</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Which tasks absolutely MUST be done today? Not just important - what HAS to happen today?
                    </p>
                  </div>
                </div>
              </div>
              
              {todayTodos.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No tasks to select from.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTodos.map(todo => (
                    <div 
                      key={todo.id}
                      onClick={() => toggleMustIdentification(todo.id)}
                      className={`
                        p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${identifiedMusts.has(todo.id)
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center
                          ${identifiedMusts.has(todo.id)
                            ? 'border-yellow-500 bg-yellow-500'
                            : 'border-gray-300'
                          }
                        `}>
                          {identifiedMusts.has(todo.id) && (
                            <Star className="w-3 h-3 text-white" fill="white" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{todo.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <span className={`${CATEGORIES[todo.category as keyof typeof CATEGORIES]?.color || 'text-gray-600'}`}>
                              {CATEGORIES[todo.category as keyof typeof CATEGORIES]?.emoji || '📋'} {todo.category || 'Operations'}
                            </span>
                            {todo.due_date && (
                              <span>Due: {formatDueDate(todo.due_date)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {identifiedMusts.size > 0 && (
                <div className="bg-yellow-100 rounded-lg p-3 text-yellow-800">
                  ⭐ You've identified {identifiedMusts.size} TRUE MUST{identifiedMusts.size > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          {state.step === 'select-top-3' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900">Select Your TOP 3</p>
                    <p className="text-sm text-purple-700 mt-1">
                      From your TRUE MUSTs, pick exactly 3 that are most critical. These will be your focus today.
                    </p>
                  </div>
                </div>
              </div>
              
              {identifiedMusts.size === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No MUSTs identified.</p>
                  <button
                    onClick={previousStep}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Go back and identify MUSTs
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.from(identifiedMusts).map(todoId => {
                    const todo = todayTodos.find(t => t.id === todoId);
                    if (!todo) return null;
                    
                    return (
                      <div 
                        key={todo.id}
                        onClick={() => toggleTop3Selection(todo.id)}
                        className={`
                          p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${selectedTop3.has(todo.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center
                            ${selectedTop3.has(todo.id)
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-300'
                            }
                          `}>
                            {selectedTop3.has(todo.id) && (
                              <span className="text-white text-xs font-bold">
                                {Array.from(selectedTop3).indexOf(todo.id) + 1}
                              </span>
                            )}
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium">{todo.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                              <span className={CATEGORIES[todo.category || 'Operations'].color}>
                                {CATEGORIES[todo.category || 'Operations'].emoji} {todo.category}
                              </span>
                            </div>
                          </div>
                          {selectedTop3.has(todo.id) && (
                            <div className="text-purple-600">
                              ⭐⭐
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className={`
                rounded-lg p-3 
                ${selectedTop3.size === 3 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {selectedTop3.size === 3 
                  ? '✅ Perfect! You\'ve selected your TOP 3 MUSTs'
                  : `Select ${3 - selectedTop3.size} more task${3 - selectedTop3.size > 1 ? 's' : ''} (${selectedTop3.size}/3)`
                }
              </div>
            </div>
          )}

          {state.step === 'complete' && (
            <div className="space-y-6 text-center">
              <div className="py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  You're All Set!
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Your day is planned. Time to make it happen!
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-900 mb-3">Today's Focus:</h4>
                  
                  {state.quick_wins_completed.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Quick Wins Completed:</p>
                      <p className="font-medium text-green-600">
                        ✅ {state.quick_wins_completed.length} tasks done
                      </p>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">TRUE MUSTs (⭐):</p>
                    <p className="font-medium text-yellow-600">
                      {identifiedMusts.size - selectedTop3.size} tasks
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">TOP 3 MUSTs (⭐⭐):</p>
                    <p className="font-medium text-purple-600">
                      {selectedTop3.size} critical tasks
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={completeRitual}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Start My Day 🚀
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={previousStep}
              disabled={currentStepIndex === 0}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${currentStepIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-3">
              {state.step !== 'complete' && (
                <>
                  <button
                    onClick={skipStep}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Skip
                  </button>
                  
                  <button
                    onClick={nextStep}
                    disabled={!canProceed}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                      ${canProceed
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format due dates
function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  if (date.getTime() === today.getTime()) {
    return 'Today';
  } else if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}