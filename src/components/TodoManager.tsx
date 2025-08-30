// /src/components/TodoManager.tsx
// COMPLETE PRODUCTION-READY TODO MANAGER WITH ALL PHASE 1 FEATURES

'use client'

import React, { useState, useEffect, useCallback } from 'react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type TodoPriority = 'high' | 'medium' | 'low'
type TodoStatus = 'pending' | 'in-progress' | 'completed'
type TodoCategory = 'Operations' | 'Finance' | 'Marketing' | 'Leadership' | 'Admin' | 'Personal'
type TodoEffortSize = 'quick_win' | 'project' | 'initiative'
type TodoView = 'all' | 'today' | 'week' | 'overdue' | 'upcoming'

interface Todo {
  id: string
  business_id: string
  title: string
  description?: string | null
  assigned_to?: string | null
  priority: TodoPriority
  status: TodoStatus
  category?: TodoCategory
  effort_size?: TodoEffortSize
  due_date?: string | null
  completed_at?: string | null
  created_by: string
  created_at: string
  updated_at: string
  is_published?: boolean
  is_private_note?: boolean
  notes?: string | null
}

interface TodoStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  overdue_tasks: number
  due_today: number
  due_this_week: number
  completion_rate: number
}

interface TodoManagerProps {
  businessId: string
  userId: string
  userRole: 'coach' | 'client'
  clientName?: string
  supabase: any
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  high: 'Critical',
  medium: 'Important',
  low: 'Good-to-do'
}

const PRIORITY_COLORS: Record<TodoPriority, string> = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300'
}

const STATUS_LABELS: Record<TodoStatus, string> = {
  pending: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Done'
}

const CATEGORY_COLORS: Record<TodoCategory, string> = {
  Operations: 'bg-purple-100 text-purple-700',
  Finance: 'bg-green-100 text-green-700',
  Marketing: 'bg-blue-100 text-blue-700',
  Leadership: 'bg-orange-100 text-orange-700',
  Admin: 'bg-gray-100 text-gray-700',
  Personal: 'bg-pink-100 text-pink-700'
}

const EFFORT_LABELS: Record<TodoEffortSize, string> = {
  quick_win: 'Quick Win (<30 min)',
  project: 'Project (hours)',
  initiative: 'Initiative (weeks)'
}

const EFFORT_COLORS: Record<TodoEffortSize, string> = {
  quick_win: 'bg-emerald-100 text-emerald-700',
  project: 'bg-sky-100 text-sky-700',
  initiative: 'bg-indigo-100 text-indigo-700'
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < today
}

function isDueToday(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due.getTime() === today.getTime()
}

function isDueThisWeek(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekFromNow = new Date(today)
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due >= today && due <= weekFromNow
}

function formatDueDate(dueDate: string | null | undefined): string {
  if (!dueDate) return ''
  
  const date = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  
  if (compareDate.getTime() === today.getTime()) {
    return 'Today'
  } else if (compareDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  } else if (compareDate < today) {
    const daysOverdue = Math.floor((today.getTime() - compareDate.getTime()) / (1000 * 60 * 60 * 24))
    return `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TodoManager({ businessId, userId, userRole, clientName, supabase }: TodoManagerProps) {
  // State management
  const [todos, setTodos] = useState<Todo[]>([])
  const [stats, setStats] = useState<TodoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // UI state
  const [view, setView] = useState<TodoView>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<TodoStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<TodoPriority | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<TodoCategory | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [quickAddText, setQuickAddText] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TodoPriority,
    category: 'Operations' as TodoCategory,
    effort_size: 'quick_win' as TodoEffortSize,
    due_date: '',
    is_published: true,
    is_private_note: false,
    notes: ''
  })
  
  // Load todos and stats
  const loadTodos = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load todos
      let query = supabase
        .from('todo_items')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
      
      // Client only sees published non-private tasks
      if (userRole === 'client') {
        query = query.eq('is_published', true).eq('is_private_note', false)
      }
      
      const { data: todosData, error: todosError } = await query
      
      if (todosError) throw todosError
      setTodos(todosData || [])
      
      // Calculate stats manually since RPC might not exist
      if (todosData) {
        const completed = todosData.filter(t => t.status === 'completed').length
        const pending = todosData.filter(t => t.status === 'pending').length
        const inProgress = todosData.filter(t => t.status === 'in-progress').length
        const overdue = todosData.filter(t => t.status !== 'completed' && isOverdue(t.due_date)).length
        const dueToday = todosData.filter(t => isDueToday(t.due_date)).length
        const dueWeek = todosData.filter(t => isDueThisWeek(t.due_date)).length
        
        setStats({
          total_tasks: todosData.length,
          completed_tasks: completed,
          pending_tasks: pending,
          in_progress_tasks: inProgress,
          overdue_tasks: overdue,
          due_today: dueToday,
          due_this_week: dueWeek,
          completion_rate: todosData.length > 0 ? Math.round((completed / todosData.length) * 100) : 0
        })
      }
      
    } catch (error) {
      console.error('Error loading todos:', error)
    } finally {
      setLoading(false)
    }
  }, [businessId, userRole, supabase])
  
  useEffect(() => {
    loadTodos()
  }, [loadTodos])
  
  // Quick add todo
  const handleQuickAdd = async () => {
    if (!quickAddText.trim()) return
    
    try {
      setSaving(true)
      
      const newTodo = {
        business_id: businessId,
        title: quickAddText,
        description: null,
        assigned_to: userId,
        priority: 'medium',
        status: 'pending',
        category: 'Operations',
        effort_size: 'quick_win',
        due_date: null,
        created_by: userId,
        is_published: true,
        is_private_note: false,
        source: 'manual',
        order_index: 0,
        tags: [],
        notes: null
      }
      
      const { error } = await supabase
        .from('todo_items')
        .insert([newTodo])
      
      if (error) throw error
      
      setQuickAddText('')
      await loadTodos()
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('Failed to add task. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  
  // Save todo (add or edit)
  const handleSaveTodo = async () => {
    try {
      setSaving(true)
      
      const todoData = {
        business_id: businessId,
        title: formData.title,
        description: formData.description || null,
        assigned_to: userId,
        priority: formData.priority,
        status: editingId ? undefined : 'pending', // Don't change status when editing
        category: formData.category,
        effort_size: formData.effort_size,
        due_date: formData.due_date || null,
        created_by: userId,
        is_published: formData.is_published,
        is_private_note: formData.is_private_note,
        source: 'manual',
        notes: formData.notes || null
      }
      
      if (editingId) {
        const { error } = await supabase
          .from('todo_items')
          .update(todoData)
          .eq('id', editingId)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('todo_items')
          .insert([todoData])
        
        if (error) throw error
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'Operations',
        effort_size: 'quick_win',
        due_date: '',
        is_published: true,
        is_private_note: false,
        notes: ''
      })
      setShowAddForm(false)
      setEditingId(null)
      
      await loadTodos()
    } catch (error) {
      console.error('Error saving todo:', error)
      alert('Failed to save task. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  
  // Update todo status
  const updateTodoStatus = async (id: string, newStatus: TodoStatus) => {
    try {
      const updateData: any = { status: newStatus }
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('todo_items')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
      await loadTodos()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }
  
  // Delete todo
  const deleteTodo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      const { error } = await supabase
        .from('todo_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await loadTodos()
    } catch (error) {
      console.error('Error deleting todo:', error)
      alert('Failed to delete task. Please try again.')
    }
  }
  
  // Edit todo
  const startEdit = (todo: Todo) => {
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      category: todo.category || 'Operations',
      effort_size: todo.effort_size || 'quick_win',
      due_date: todo.due_date ? todo.due_date.split('T')[0] : '',
      is_published: todo.is_published !== false,
      is_private_note: todo.is_private_note || false,
      notes: todo.notes || ''
    })
    setEditingId(todo.id)
    setShowAddForm(true)
  }
  
  // Filter todos based on current filters
  const getFilteredTodos = () => {
    let filtered = [...todos]
    
    // View filter
    if (view === 'today') {
      filtered = filtered.filter(todo => isDueToday(todo.due_date))
    } else if (view === 'week') {
      filtered = filtered.filter(todo => isDueThisWeek(todo.due_date))
    } else if (view === 'overdue') {
      filtered = filtered.filter(todo => isOverdue(todo.due_date) && todo.status !== 'completed')
    } else if (view === 'upcoming') {
      filtered = filtered.filter(todo => {
        if (!todo.due_date) return false
        const due = new Date(todo.due_date)
        const weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        return due > weekFromNow
      })
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(todo => todo.status === filterStatus)
    }
    
    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(todo => todo.priority === filterPriority)
    }
    
    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(todo => todo.category === filterCategory)
    }
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(search) ||
        (todo.description && todo.description.toLowerCase().includes(search)) ||
        (todo.notes && todo.notes.toLowerCase().includes(search))
      )
    }
    
    // Sort by priority and due date
    filtered.sort((a, b) => {
      // Overdue first
      const aOverdue = isOverdue(a.due_date) && a.status !== 'completed'
      const bOverdue = isOverdue(b.due_date) && b.status !== 'completed'
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      // Then by due date
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }
      if (a.due_date && !b.due_date) return -1
      if (!a.due_date && b.due_date) return 1
      
      return 0
    })
    
    return filtered
  }
  
  const filteredTodos = getFilteredTodos()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {userRole === 'coach' && clientName ? `${clientName}'s Tasks` : 'My Tasks'}
            </h2>
            <p className="text-gray-600 mt-1">Stay organized and focused on what matters most</p>
          </div>
          
          {stats && (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.completion_rate}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total_tasks}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              {stats.overdue_tasks > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.overdue_tasks}</div>
                  <div className="text-sm text-gray-600">Overdue</div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        {stats && stats.total_tasks > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.completion_rate}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Quick add */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={quickAddText}
            onChange={(e) => setQuickAddText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleQuickAdd()
              }
            }}
            placeholder="Quick add a task... (press Enter to add)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleQuickAdd}
            disabled={!quickAddText.trim() || saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Task
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Advanced
          </button>
        </div>
      </div>
      
      {/* Advanced add/edit form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Task' : 'Add New Task'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="What needs to be done?"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add more details..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TodoPriority })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">Critical</option>
                <option value="medium">Important</option>
                <option value="low">Good-to-do</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TodoCategory })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Leadership">Leadership</option>
                <option value="Admin">Admin</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effort Size</label>
              <select
                value={formData.effort_size}
                onChange={(e) => setFormData({ ...formData, effort_size: e.target.value as TodoEffortSize })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="quick_win">Quick Win (&lt;30 min)</option>
                <option value="project">Project (hours)</option>
                <option value="initiative">Initiative (weeks)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {userRole === 'coach' && (
              <>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Published to client</span>
                  </label>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_private_note}
                      onChange={(e) => setFormData({ ...formData, is_private_note: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Private coach note</span>
                  </label>
                </div>
              </>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingId(null)
                setFormData({
                  title: '',
                  description: '',
                  priority: 'medium',
                  category: 'Operations',
                  effort_size: 'quick_win',
                  due_date: '',
                  is_published: true,
                  is_private_note: false,
                  notes: ''
                })
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTodo}
              disabled={!formData.title.trim() || saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? 'Update' : 'Save'} Task
            </button>
          </div>
        </div>
      )}
      
      {/* View tabs and filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* View tabs */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'today', 'week', 'overdue', 'upcoming'] as TodoView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === v
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
                {v === 'today' && stats && stats.due_today > 0 && (
                  <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs">
                    {stats.due_today}
                  </span>
                )}
                {v === 'overdue' && stats && stats.overdue_tasks > 0 && (
                  <span className="ml-2 bg-white text-red-600 px-2 py-0.5 rounded-full text-xs">
                    {stats.overdue_tasks}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">Critical</option>
              <option value="medium">Important</option>
              <option value="low">Good-to-do</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Leadership">Leadership</option>
              <option value="Admin">Admin</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Todo list */}
      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {view === 'today' ? "No tasks due today. Great job staying on top of things!" :
               view === 'overdue' ? "No overdue tasks. You're all caught up!" :
               searchTerm ? "No tasks match your search." :
               "Click 'Add Task' to create your first task."}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const overdueFlag = isOverdue(todo.due_date) && todo.status !== 'completed'
            
            return (
              <div
                key={todo.id}
                className={`bg-white rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${
                  overdueFlag ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } ${todo.is_private_note ? 'bg-yellow-50 border-yellow-300' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Status button */}
                  <button
                    onClick={() => {
                      const nextStatus: TodoStatus = 
                        todo.status === 'pending' ? 'in-progress' :
                        todo.status === 'in-progress' ? 'completed' : 'pending'
                      updateTodoStatus(todo.id, nextStatus)
                    }}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      todo.status === 'completed' 
                        ? 'bg-green-500 border-green-500' 
                        : todo.status === 'in-progress'
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {todo.status === 'completed' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`font-medium text-gray-900 ${
                          todo.status === 'completed' ? 'line-through opacity-60' : ''
                        }`}>
                          {todo.title}
                        </h4>
                        
                        {todo.description && (
                          <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                        )}
                        
                        {/* Meta badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* Priority */}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            PRIORITY_COLORS[todo.priority]
                          }`}>
                            {PRIORITY_LABELS[todo.priority]}
                          </span>
                          
                          {/* Category */}
                          {todo.category && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              CATEGORY_COLORS[todo.category]
                            }`}>
                              {todo.category}
                            </span>
                          )}
                          
                          {/* Effort */}
                          {todo.effort_size && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              EFFORT_COLORS[todo.effort_size]
                            }`}>
                              {EFFORT_LABELS[todo.effort_size]}
                            </span>
                          )}
                          
                          {/* Due date */}
                          {todo.due_date && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              overdueFlag 
                                ? 'bg-red-100 text-red-800' 
                                : isDueToday(todo.due_date)
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              📅 {formatDueDate(todo.due_date)}
                            </span>
                          )}
                          
                          {/* Coach badges */}
                          {userRole === 'coach' && (
                            <>
                              {!todo.is_published && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  👁️ Draft
                                </span>
                              )}
                              {todo.is_private_note && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  🔒 Private Note
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        
                        {todo.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">Note: {todo.notes}</p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(todo)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}