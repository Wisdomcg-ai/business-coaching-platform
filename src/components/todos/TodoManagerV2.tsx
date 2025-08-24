'use client';

// TodoManagerV2.tsx - Main orchestrator component for the todo system
// Location: /src/components/todos/TodoManagerV2.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus,
  Coffee,
  Users,
  Star,
  RotateCw,
  Calendar,
  Archive,
  Settings,
  ChevronDown,
  Search,
  Filter,
  Layout,
  List,
  Bell,
  Sparkles
} from 'lucide-react';
import { useTodos } from './hooks/useTodos';
import { useMorningRitual } from './hooks/useMorningRitual';
import { EnhancedTodoItem, TodoView, ViewMode, ParsedTask } from './utils/types';
import { VIEW_CONFIGS, STORAGE_KEYS, SUCCESS_MESSAGES, CATEGORIES } from './utils/constants';
import QuickAdd from './QuickAdd';
import TodoList from './TodoList';
import MorningRitual from './MorningRitual';
import CoachDashboard from './CoachDashboard';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface TodoManagerV2Props {
  businessId: string;
  userId: string;
  userRole?: 'coach' | 'client' | 'admin';
  userName?: string;
}

export default function TodoManagerV2({
  businessId,
  userId,
  userRole = 'client',
  userName = 'User'
}: TodoManagerV2Props) {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>(userRole === 'coach' ? 'coach' : 'personal');
  const [currentView, setCurrentView] = useState<TodoView>('musts');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showMorningRitual, setShowMorningRitual] = useState(false);
  const [editingTodo, setEditingTodo] = useState<EnhancedTodoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCoachSuggestions, setShowCoachSuggestions] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'assignee' | 'priority'>('none');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created' | 'title'>('due_date');

  // Use the main todos hook
  const {
    todos,
    musts,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    completeTodo,
    selectMust,
    removeMust,
    refreshTodos
  } = useTodos({
    businessId,
    userId,
    viewMode,
    currentUserName: userName
  });

  // Check for morning ritual trigger
  useEffect(() => {
    if (viewMode === 'personal' && !loading) {
      const checkMorningRitual = () => {
        const now = new Date();
        const hour = now.getHours();
        const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
        const today = now.toISOString().split('T')[0];
        
        // Check if it's morning on a weekday
        if (isWeekday && hour >= 6 && hour <= 10) {
          // Check if user has selected TOP 3 MUSTs today
          const todayTop3 = musts.filter(m => 
            m.must_date === today && 
            m.must_level === 2 &&
            m.user_name === userName
          );
          
          if (todayTop3.length === 0) {
            // Check if we've already shown the ritual today
            const lastShown = localStorage.getItem('morning_ritual_last_shown');
            if (lastShown !== today) {
              setShowMorningRitual(true);
              localStorage.setItem('morning_ritual_last_shown', today);
            }
          }
        }
      };
      
      // Check immediately and then every minute
      checkMorningRitual();
      const interval = setInterval(checkMorningRitual, 60000);
      
      return () => clearInterval(interval);
    }
  }, [viewMode, loading, musts, userName]);

  // Filter todos based on current view and search
  const filteredTodos = useMemo(() => {
    let filtered = [...todos];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(query) ||
        todo.description?.toLowerCase().includes(query) ||
        todo.assigned_to?.toLowerCase().includes(query) ||
        todo.category?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [todos, searchQuery]);

  // Get assignee options for quick add
  const assigneeOptions = useMemo(() => {
    const assignees = new Set<string>();
    todos.forEach(todo => {
      if (todo.assigned_to) {
        assignees.add(todo.assigned_to);
      }
    });
    return Array.from(assignees);
  }, [todos]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayMusts = musts.filter(m => m.must_date === today);
    const completedToday = todos.filter(t => 
      t.completed_at && 
      new Date(t.completed_at).toISOString().split('T')[0] === today
    ).length;
    
    const openLoops = todos.filter(t => t.is_open_loop).length;
    const overdue = todos.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < new Date();
    }).length;
    
    return {
      todayMusts: todayMusts.length,
      completedToday,
      openLoops,
      overdue
    };
  }, [todos, musts]);

  // Handle task creation
  const handleCreateTodo = async (parsedTask: ParsedTask) => {
    await createTodo(parsedTask);
  };

  // Handle delete with confirmation
  const handleDeleteTodo = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTodo(id);
    }
  };

  // Handle MUST toggle - Fixed implementation
  const handleToggleMust = async (todoId: string, level: 1 | 2) => {
    console.log('handleToggleMust called:', { todoId, level }); // Debug log
    
    const todo = todos.find(t => t.id === todoId);
    if (!todo) {
      console.error('Todo not found for MUST toggle'); // Debug log
      return;
    }
    
    if (todo.is_must && todo.must_level === level) {
      // Remove MUST if clicking same level
      console.log('Removing MUST'); // Debug log
      await removeMust(todoId);
    } else {
      // Add or update MUST
      console.log('Adding/updating MUST'); // Debug log
      await selectMust(todoId, level);
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    let newStatus: 'pending' | 'in-progress' | 'completed';
    
    switch (todo.status) {
      case 'pending':
        newStatus = 'in-progress';
        break;
      case 'in-progress':
        newStatus = 'completed';
        break;
      default:
        return;
    }
    
    await updateTodo(todoId, { status: newStatus });
  };

  // Handle coach suggestion
  const handleCoachSuggestion = async (clientName: string, todoId: string, message?: string) => {
    // This would typically send a notification or create a suggestion record
    toast.success(`Suggestion sent to ${clientName}`);
    return true;
  };

  // Handle adding task for client
  const handleAddTaskForClient = async (clientName: string, taskTitle: string) => {
    await createTodo({
      title: taskTitle,
      assigned_to: clientName,
      priority: 'normal',
      raw_input: taskTitle
    });
    return true;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case 'q':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setShowQuickAdd(true);
          }
          break;
        case 'r':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setShowMorningRitual(true);
          }
          break;
        case '/':
          e.preventDefault();
          document.getElementById('search-input')?.focus();
          break;
        case '1':
          setCurrentView('musts');
          break;
        case '2':
          setCurrentView('open-loops');
          break;
        case '3':
          setCurrentView('week');
          break;
        case '4':
          setCurrentView('backlog');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loading state
  if (loading && todos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-4">{error}</p>
        <button
          onClick={refreshTodos}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {viewMode === 'coach' ? 'Coach Dashboard' : 'My Tasks'}
              </h1>
              
              {/* View mode toggle */}
              {userRole === 'coach' && (
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('personal')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'personal' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Personal
                  </button>
                  <button
                    onClick={() => setViewMode('coach')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'coach' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-1" />
                    Coach
                  </button>
                </div>
              )}
            </div>
            
            {/* Center - Search */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks... (press /)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {/* Stats */}
              <div className="hidden lg:flex items-center gap-4 text-sm">
                {stats.todayMusts > 0 && (
                  <span className="text-gray-600">
                    <Star className="w-4 h-4 inline text-yellow-500" />
                    {stats.todayMusts} MUSTs
                  </span>
                )}
                {stats.openLoops > 0 && (
                  <span className="text-gray-600">
                    <RotateCw className="w-4 h-4 inline text-blue-500" />
                    {stats.openLoops} loops
                  </span>
                )}
                {stats.overdue > 0 && (
                  <span className="text-red-600 font-medium">
                    {stats.overdue} overdue
                  </span>
                )}
              </div>
              
              {/* Morning Ritual Button */}
              {viewMode === 'personal' && (
                <button
                  onClick={() => setShowMorningRitual(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Coffee className="w-4 h-4" />
                  <span className="hidden sm:inline">Morning Ritual</span>
                </button>
              )}
              
              {/* Quick Add Button */}
              <button
                onClick={() => setShowQuickAdd(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Add (Q)</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'coach' ? (
          // Coach Dashboard
          <CoachDashboard
            todos={filteredTodos}
            musts={musts}
            businessName="Your Business"
            onSuggestMust={handleCoachSuggestion}
            onAddTask={handleAddTaskForClient}
          />
        ) : (
          // Personal View
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - View Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="font-medium text-gray-900 mb-3">Views</h2>
                <nav className="space-y-1">
                  {Object.entries(VIEW_CONFIGS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setCurrentView(key as TodoView)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg transition-colors
                        ${currentView === key 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span className="mr-2">{config.emoji}</span>
                      {config.label}
                      {key === 'musts' && stats.todayMusts > 0 && (
                        <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          {stats.todayMusts}
                        </span>
                      )}
                      {key === 'open-loops' && stats.openLoops > 0 && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {stats.openLoops}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
                
                {/* Settings */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Options</h3>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideCompleted}
                      onChange={(e) => setHideCompleted(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Hide completed
                  </label>
                </div>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <TodoList
                todos={filteredTodos}
                view={currentView}
                onToggleStatus={handleToggleStatus}
                onComplete={completeTodo}
                onDelete={handleDeleteTodo}
                onEdit={setEditingTodo}
                onToggleMust={handleToggleMust}
                showAssignee={viewMode === 'coach'}
                groupBy={groupBy}
                sortBy={sortBy}
                hideCompleted={hideCompleted}
              />
            </div>
          </div>
        )}
      </main>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Task</h2>
            <QuickAdd
              onAdd={handleCreateTodo}
              assigneeOptions={assigneeOptions}
              defaultAssignee={userName}
              placeholder="What needs to be done?"
              autoFocus
              onClose={() => setShowQuickAdd(false)}
            />
          </div>
        </div>
      )}

      {/* Morning Ritual Modal */}
      {showMorningRitual && (
        <MorningRitual
          todos={todos}
          musts={musts}
          currentUserName={userName}
          onSelectMust={selectMust}
          onCompleteTodo={completeTodo}
          onUpdateTodo={updateTodo}
          onDeleteTodo={handleDeleteTodo}
          onEditTodo={setEditingTodo}
          onClose={() => setShowMorningRitual(false)}
        />
      )}

      {/* Edit Todo Modal */}
      {editingTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingTodo.description || ''}
                  onChange={(e) => setEditingTodo({...editingTodo, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editingTodo.due_date || ''}
                  onChange={(e) => setEditingTodo({...editingTodo, due_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={editingTodo.category || 'Other'}
                  onChange={(e) => setEditingTodo({...editingTodo, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(CATEGORIES).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.emoji} {config.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={editingTodo.priority || 'medium'}
                  onChange={(e) => setEditingTodo({...editingTodo, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">High (Important)</option>
                  <option value="medium">Medium (Normal)</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={editingTodo.assigned_to || ''}
                  onChange={(e) => setEditingTodo({...editingTodo, assigned_to: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setEditingTodo(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await updateTodo(editingTodo.id, {
                    title: editingTodo.title,
                    description: editingTodo.description,
                    due_date: editingTodo.due_date,
                    category: editingTodo.category,
                    priority: editingTodo.priority,
                    assigned_to: editingTodo.assigned_to
                  });
                  setEditingTodo(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}