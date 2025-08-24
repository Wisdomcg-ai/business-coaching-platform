// CoachDashboard.tsx - Coach view dashboard for monitoring clients
// Location: /src/components/todos/CoachDashboard.tsx

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Star,
  RotateCw,
  Calendar,
  BarChart3,
  Target,
  ChevronRight,
  MessageSquare,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { EnhancedTodoItem, DailyMust, TodoCategory } from './utils/types';
import { CATEGORIES, OPEN_LOOP_AGING, MUST_LEVELS } from './utils/constants';
import TodoItem from './TodoItem';
import { toast } from 'sonner';

interface CoachDashboardProps {
  todos: EnhancedTodoItem[];
  musts: DailyMust[];
  businessName: string;
  onSuggestMust: (clientName: string, todoId: string, message?: string) => Promise<boolean>;
  onAddTask: (clientName: string, taskTitle: string) => Promise<boolean>;
  onViewClientDetails?: (clientName: string) => void;
}

interface ClientStats {
  name: string;
  todayMusts: {
    total: number;
    completed: number;
    tasks: EnhancedTodoItem[];
  };
  openLoops: {
    total: number;
    fresh: number;
    warning: number;
    critical: number;
    tasks: EnhancedTodoItem[];
  };
  weekTasks: {
    total: number;
    completed: number;
    byCategory: Record<TodoCategory, number>;
  };
  productivityScore: number;
  hasImbalance: boolean;
  imbalanceMessage?: string;
}

export default function CoachDashboard({
  todos,
  musts,
  businessName,
  onSuggestMust,
  onAddTask,
  onViewClientDetails
}: CoachDashboardProps) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({
    clientName: '',
    todoId: '',
    message: ''
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview'])
  );

  // Calculate stats for each client
  const clientStats = useMemo(() => {
    const stats: Record<string, ClientStats> = {};
    const today = new Date().toISOString().split('T')[0];
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + (5 - weekEnd.getDay()));
    
    // Get unique client names
    const clientNames = new Set<string>();
    todos.forEach(todo => {
      if (todo.assigned_to) {
        clientNames.add(todo.assigned_to);
      }
    });
    
    // Calculate stats for each client
    clientNames.forEach(clientName => {
      const clientTodos = todos.filter(t => t.assigned_to === clientName);
      const clientMusts = musts.filter(m => 
        m.user_name === clientName && 
        m.must_date === today
      );
      
      // Today's MUSTs
      const mustTodoIds = new Set(clientMusts.map(m => m.todo_id));
      const mustTodos = clientTodos.filter(t => mustTodoIds.has(t.id));
      const completedMusts = mustTodos.filter(t => t.status === 'completed').length;
      
      // Open Loops
      const openLoopTodos = clientTodos.filter(t => t.is_open_loop);
      const loopAging = {
        fresh: 0,
        warning: 0,
        critical: 0
      };
      
      openLoopTodos.forEach(todo => {
        if (todo.days_in_loop) {
          if (todo.days_in_loop <= OPEN_LOOP_AGING.fresh.max) {
            loopAging.fresh++;
          } else if (todo.days_in_loop <= OPEN_LOOP_AGING.warning.max) {
            loopAging.warning++;
          } else {
            loopAging.critical++;
          }
        }
      });
      
      // Week tasks
      const weekTodos = clientTodos.filter(t => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        return dueDate <= weekEnd && t.status !== 'completed';
      });
      
      const weekCompleted = clientTodos.filter(t => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        return dueDate <= weekEnd && t.status === 'completed';
      }).length;
      
      // Category breakdown
      const byCategory: Record<string, number> = {};
      weekTodos.forEach(todo => {
        const cat = todo.category || 'Operations';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });
      
      // Check for imbalance
      const categories = Object.keys(byCategory);
      const hasWork = ['Operations', 'Sales', 'Marketing', 'Finance', 'Strategy'].some(
        cat => byCategory[cat] > 0
      );
      const hasPersonal = byCategory['Personal'] > 0;
      
      let hasImbalance = false;
      let imbalanceMessage = '';
      
      if (hasWork && !hasPersonal) {
        hasImbalance = true;
        imbalanceMessage = 'No personal tasks - risk of burnout';
      } else if (!byCategory['Sales'] && weekTodos.length > 5) {
        hasImbalance = true;
        imbalanceMessage = 'No sales activities - revenue at risk';
      } else if (byCategory['Operations'] > weekTodos.length * 0.7) {
        hasImbalance = true;
        imbalanceMessage = 'Too focused on operations - working IN not ON business';
      }
      
      // Calculate productivity score
      const mustCompletion = mustTodos.length > 0 
        ? (completedMusts / mustTodos.length) * 50 
        : 0;
      const loopScore = Math.max(0, 30 - (loopAging.critical * 10));
      const balanceScore = hasImbalance ? 10 : 20;
      const productivityScore = Math.round(mustCompletion + loopScore + balanceScore);
      
      stats[clientName] = {
        name: clientName,
        todayMusts: {
          total: mustTodos.length,
          completed: completedMusts,
          tasks: mustTodos
        },
        openLoops: {
          total: openLoopTodos.length,
          fresh: loopAging.fresh,
          warning: loopAging.warning,
          critical: loopAging.critical,
          tasks: openLoopTodos
        },
        weekTasks: {
          total: weekTodos.length,
          completed: weekCompleted,
          byCategory: byCategory as Record<TodoCategory, number>
        },
        productivityScore,
        hasImbalance,
        imbalanceMessage
      };
    });
    
    return stats;
  }, [todos, musts]);

  // Get sorted client list
  const sortedClients = useMemo(() => {
    return Object.values(clientStats).sort((a, b) => {
      // Sort by productivity score (lower scores first - need more attention)
      return a.productivityScore - b.productivityScore;
    });
  }, [clientStats]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Handle must suggestion
  const handleSuggestMust = async (clientName: string, todoId: string) => {
    setSuggestionForm({
      clientName,
      todoId,
      message: ''
    });
    setShowSuggestionModal(true);
  };

  // Submit suggestion
  const submitSuggestion = async () => {
    try {
      await onSuggestMust(
        suggestionForm.clientName,
        suggestionForm.todoId,
        suggestionForm.message
      );
      setShowSuggestionModal(false);
      setSuggestionForm({ clientName: '', todoId: '', message: '' });
      toast.success('Suggestion sent to client!');
    } catch (err) {
      toast.error('Failed to send suggestion');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
              <p className="text-gray-600">{businessName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{sortedClients.length}</p>
              <p className="text-gray-600">Clients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(
                  sortedClients.reduce((sum, c) => sum + c.productivityScore, 0) / 
                  (sortedClients.length || 1)
                )}%
              </p>
              <p className="text-gray-600">Avg Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {sortedClients.filter(c => c.openLoops.critical > 0).length}
              </p>
              <p className="text-gray-600">Need Attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Cards */}
      {sortedClients.map(client => (
        <div 
          key={client.name}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          {/* Client Header */}
          <div className={`
            p-4 border-b
            ${client.productivityScore < 50 ? 'bg-red-50' : 
              client.productivityScore < 70 ? 'bg-yellow-50' : 'bg-green-50'}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-white
                  ${client.productivityScore < 50 ? 'bg-red-500' : 
                    client.productivityScore < 70 ? 'bg-yellow-500' : 'bg-green-500'}
                `}>
                  {client.productivityScore}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      {client.todayMusts.completed}/{client.todayMusts.total} MUSTs done
                    </span>
                    {client.openLoops.total > 0 && (
                      <span className={
                        client.openLoops.critical > 0 ? 'text-red-600 font-medium' : ''
                      }>
                        {client.openLoops.total} open loops
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {client.hasImbalance && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {client.imbalanceMessage}
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedClient(
                    selectedClient === client.name ? null : client.name
                  )}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {selectedClient === client.name ? (
                    <EyeOff className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Client Details */}
          {selectedClient === client.name && (
            <div className="p-4 space-y-4">
              {/* Today's MUSTs */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Today's MUSTs
                </h4>
                {client.todayMusts.tasks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No MUSTs selected for today</p>
                ) : (
                  <div className="space-y-2">
                    {client.todayMusts.tasks.map(todo => (
                      <div key={todo.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-500">
                            {MUST_LEVELS[todo.must_level || 0].icon}
                          </span>
                          <span className={
                            todo.status === 'completed' ? 'line-through text-gray-500' : ''
                          }>
                            {todo.title}
                          </span>
                          {todo.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {todo.status !== 'completed' && (
                          <button
                            onClick={() => handleSuggestMust(client.name, todo.id)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Suggest as MUST
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Open Loops */}
              {client.openLoops.total > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <RotateCw className="w-5 h-5 text-blue-500" />
                    Open Loops
                  </h4>
                  <div className="space-y-2">
                    {client.openLoops.tasks.slice(0, 3).map(todo => (
                      <div key={todo.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={
                            todo.days_in_loop && todo.days_in_loop > 4 
                              ? 'text-red-500' 
                              : todo.days_in_loop && todo.days_in_loop > 2 
                              ? 'text-yellow-500' 
                              : 'text-green-500'
                          }>
                            {todo.days_in_loop && todo.days_in_loop > 4 ? '🔴' : 
                             todo.days_in_loop && todo.days_in_loop > 2 ? '🟡' : '🟢'}
                          </span>
                          <span>{todo.title}</span>
                          <span className="text-sm text-gray-500">
                            ({todo.days_in_loop || 0} days)
                          </span>
                        </div>
                      </div>
                    ))}
                    {client.openLoops.total > 3 && (
                      <p className="text-sm text-gray-500">
                        +{client.openLoops.total - 3} more...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Category Balance */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  This Week's Focus
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(CATEGORIES).map(([key, config]) => {
                    const count = client.weekTasks.byCategory[key as TodoCategory] || 0;
                    return (
                      <div 
                        key={key}
                        className={`
                          p-2 rounded-lg text-center
                          ${count > 0 ? 'bg-gray-100' : 'bg-gray-50 opacity-50'}
                        `}
                      >
                        <div className="text-xl mb-1">{config.emoji}</div>
                        <div className="text-xs text-gray-600">{config.label}</div>
                        <div className="font-semibold">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t">
                <button
                  onClick={() => onViewClientDetails?.(client.name)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Full Details
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSuggestMust(client.name, '')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Suggestion Modal */}
      {showSuggestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Suggest MUST for {suggestionForm.clientName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={suggestionForm.message}
                  onChange={(e) => setSuggestionForm(prev => ({
                    ...prev,
                    message: e.target.value
                  }))}
                  placeholder="Add a note about why this should be a MUST..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSuggestionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitSuggestion}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  Send Suggestion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}