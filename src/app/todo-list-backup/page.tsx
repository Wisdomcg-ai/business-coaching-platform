'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trash2, 
  Edit2, 
  User,
  Flag,
  X,
  Check,
  Menu,
  Home,
  ClipboardList,
  LogOut,
  Building2
} from 'lucide-react';
import { format, isPast, isToday, addDays, isTomorrow } from 'date-fns';
import { useRouter } from 'next/navigation';

// Type definitions for our data
type TodoPriority = 'high' | 'medium' | 'low';
type TodoStatus = 'pending' | 'in-progress' | 'completed';

interface TodoItem {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  priority: TodoPriority;
  status: TodoStatus;
  due_date?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Business {
  id: string;
  name: string;
  owner_id: string;
  industry?: string;
  created_at: string;
  updated_at: string;
}

interface NewTodoForm {
  title: string;
  description: string;
  assigned_to: string;
  priority: TodoPriority;
  due_date: string;
}

export default function TodoListPage() {
  const router = useRouter();
  
  // Core state management
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoItem[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'owner' | 'coach' | 'member'>('member');
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TodoStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TodoPriority>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at'>('due_date');
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new/edit todo
  const [formData, setFormData] = useState<NewTodoForm>({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    due_date: ''
  });

  // Load user and businesses on mount
  useEffect(() => {
    loadUserAndBusinesses();
  }, []);

  // Load todos when business changes
  useEffect(() => {
    if (selectedBusinessId) {
      loadTodos();
    }
  }, [selectedBusinessId]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...todos];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(todo => todo.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(todo => todo.priority === priorityFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredTodos(filtered);
  }, [todos, searchTerm, statusFilter, priorityFilter, sortBy]);

  // Load user and their businesses
  const loadUserAndBusinesses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('No user logged in');
        router.push('/auth/login');
        return;
      }
      
      setCurrentUser(user);

      // Get businesses where user is owner
      const { data: ownedBusinesses, error: ownedError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) {
        console.error('Error loading owned businesses:', ownedError);
      }

      // Get businesses where user is a member
      const { data: memberBusinesses, error: memberError } = await supabase
        .from('user_businesses')
        .select(`
          business_id,
          role,
          businesses (*)
        `)
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error loading member businesses:', memberError);
      }

      // Combine and deduplicate businesses
      const allBusinesses = [
        ...(ownedBusinesses || []),
        ...(memberBusinesses?.map(mb => (mb as any).businesses).filter(Boolean) || [])
      ];

      // Remove duplicates
      const uniqueBusinesses = Array.from(
        new Map(allBusinesses.map(b => [b.id, b])).values()
      );

      setBusinesses(uniqueBusinesses);

      // Select the first business if available
      if (uniqueBusinesses.length > 0) {
        const firstBusiness = uniqueBusinesses[0];
        setSelectedBusinessId(firstBusiness.id);
        
        // Determine user role for the first business
        if (firstBusiness.owner_id === user.id) {
          setUserRole('owner');
        } else {
          const membership = memberBusinesses?.find(
            mb => mb.business_id === firstBusiness.id
          );
          setUserRole((membership?.role as any) || 'member');
        }
      } else {
        setError('No businesses found. Please create a business first.');
      }
    } catch (error) {
      console.error('Error in loadUserAndBusinesses:', error);
      setError('Failed to load your businesses. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load todos for selected business
  const loadTodos = async () => {
    if (!selectedBusinessId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('todo_items')
        .select('*')
        .eq('business_id', selectedBusinessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading todos:', error);
        setError('Failed to load tasks. Please try refreshing.');
      } else {
        setTodos(data || []);
      }
    } catch (error) {
      console.error('Error in loadTodos:', error);
      setError('An unexpected error occurred while loading tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new todo
  const handleAddTodo = async () => {
    if (!formData.title.trim() || !currentUser || !selectedBusinessId) {
      alert('Please enter a task title');
      return;
    }

    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('todo_items')
        .insert([{
          business_id: selectedBusinessId,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          assigned_to: formData.assigned_to.trim() || null,
          priority: formData.priority,
          status: 'pending',
          due_date: formData.due_date || null,
          created_by: currentUser.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding todo:', error);
        alert('Failed to add task. Please try again.');
      } else if (data) {
        setTodos([data, ...todos]);
        setIsAddModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error in handleAddTodo:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Update todo
  const handleUpdateTodo = async () => {
    if (!editingTodo || !formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('todo_items')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          assigned_to: formData.assigned_to.trim() || null,
          priority: formData.priority,
          due_date: formData.due_date || null
        })
        .eq('id', editingTodo.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update task. Please try again.');
      } else if (data) {
        setTodos(todos.map(todo => todo.id === editingTodo.id ? data : todo));
        setEditingTodo(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error in handleUpdateTodo:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Toggle todo status
  const handleToggleStatus = async (todo: TodoItem) => {
    try {
      const newStatus: TodoStatus = 
        todo.status === 'pending' ? 'in-progress' :
        todo.status === 'in-progress' ? 'completed' : 'pending';

      const updateData: any = {
        status: newStatus
      };

      // Add completed_at timestamp if completing, remove if uncompleting
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      const { data, error } = await supabase
        .from('todo_items')
        .update(updateData)
        .eq('id', todo.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating todo status:', error);
        alert('Failed to update task status. Please try again.');
      } else if (data) {
        setTodos(todos.map(t => t.id === todo.id ? data : t));
      }
    } catch (error) {
      console.error('Error in handleToggleStatus:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Delete todo(s)
  const handleDeleteTodos = async (todoIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${todoIds.length} task(s)?`)) return;

    try {
      setError(null);
      
      const { error } = await supabase
        .from('todo_items')
        .delete()
        .in('id', todoIds);

      if (error) {
        console.error('Error deleting todos:', error);
        alert('Failed to delete tasks. Please try again.');
      } else {
        setTodos(todos.filter(todo => !todoIds.includes(todo.id)));
        setSelectedTodos([]);
      }
    } catch (error) {
      console.error('Error in handleDeleteTodos:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Bulk complete selected todos
  const handleBulkComplete = async () => {
    if (selectedTodos.length === 0) return;

    try {
      setError(null);
      
      const { error } = await supabase
        .from('todo_items')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .in('id', selectedTodos);

      if (error) {
        console.error('Error completing todos:', error);
        alert('Failed to complete tasks. Please try again.');
      } else {
        await loadTodos(); // Reload to get updated data
        setSelectedTodos([]);
      }
    } catch (error) {
      console.error('Error in handleBulkComplete:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assigned_to: '',
      priority: 'medium',
      due_date: ''
    });
  };

  // Handle checkbox selection
  const handleSelectTodo = (todoId: string) => {
    setSelectedTodos(prev => 
      prev.includes(todoId) 
        ? prev.filter(id => id !== todoId)
        : [...prev, todoId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedTodos.length === filteredTodos.length) {
      setSelectedTodos([]);
    } else {
      setSelectedTodos(filteredTodos.map(todo => todo.id));
    }
  };

  // Get priority color classes
  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: TodoStatus) => {
    switch (status) {
      case 'pending': return <Circle className="h-5 w-5 text-gray-400" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  // Format due date display
  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    if (isToday(dueDate)) return 'Today';
    if (isTomorrow(dueDate)) return 'Tomorrow';
    if (isPast(dueDate)) return `Overdue (${format(dueDate, 'dd MMM')})`;
    return format(dueDate, 'dd MMM yyyy');
  };

  // Check if date is overdue
  const isOverdue = (date: string) => {
    return isPast(new Date(date)) && !isToday(new Date(date));
  };

  // Handle business change
  const handleBusinessChange = (businessId: string) => {
    setSelectedBusinessId(businessId);
    const business = businesses.find(b => b.id === businessId);
    if (business && currentUser) {
      if (business.owner_id === currentUser.id) {
        setUserRole('owner');
      } else {
        setUserRole('member');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Logo/Title */}
              <div className="flex items-center ml-4 md:ml-0">
                <Building2 className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">Business Coaching Platform</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                <Home className="inline h-4 w-4 mr-1" />
                Dashboard
              </a>
              <a href="/todo-list" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                <ClipboardList className="inline h-4 w-4 mr-1" />
                To-Do List
              </a>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="inline h-4 w-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isSidebarOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="/dashboard" className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                Dashboard
              </a>
              <a href="/todo-list" className="block text-blue-600 px-3 py-2 rounded-md text-base font-medium">
                To-Do List
              </a>
              <button
                onClick={handleSignOut}
                className="block w-full text-left text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">To-Do List</h1>
          <p className="text-gray-600">
            Manage tasks and priorities for {userRole === 'owner' ? 'your business' : 'this business'}
          </p>
        </div>

        {/* Business Selector (if multiple businesses) */}
        {businesses.length > 1 && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Business
            </label>
            <select
              value={selectedBusinessId}
              onChange={(e) => handleBusinessChange(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name || 'Unnamed Business'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : !selectedBusinessId ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No business selected. Please create or join a business first.</p>
          </div>
        ) : (
          <>
            {/* Filters and Actions Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | TodoStatus)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  {/* Priority Filter */}
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as 'all' | TodoPriority)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'due_date' | 'priority' | 'created_at')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="due_date">Sort by Due Date</option>
                    <option value="priority">Sort by Priority</option>
                    <option value="created_at">Sort by Created</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {selectedTodos.length > 0 && (
                    <>
                      <button
                        onClick={handleBulkComplete}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Complete ({selectedTodos.length})
                      </button>
                      <button
                        onClick={() => handleDeleteTodos(selectedTodos)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete ({selectedTodos.length})
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold">{todos.length}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Circle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">
                      {todos.filter(t => t.status === 'pending').length}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold">
                      {todos.filter(t => t.status === 'in-progress').length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">
                      {todos.filter(t => t.status === 'completed').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Todo List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* List Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedTodos.length === filteredTodos.length && filteredTodos.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedTodos.length > 0 
                      ? `${selectedTodos.length} selected`
                      : `${filteredTodos.length} tasks`
                    }
                  </span>
                </div>
              </div>

              {/* List Items */}
              <div className="divide-y divide-gray-200">
                {filteredTodos.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                        ? 'No tasks found matching your filters' 
                        : 'No tasks yet. Click "Add Task" to create your first task.'}
                    </p>
                  </div>
                ) : (
                  filteredTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                        todo.status === 'completed' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedTodos.includes(todo.id)}
                          onChange={() => handleSelectTodo(todo.id)}
                          className="h-4 w-4 mt-1 text-blue-600 rounded focus:ring-blue-500"
                        />

                        {/* Status Icon */}
                        <button
                          onClick={() => handleToggleStatus(todo)}
                          className="mt-0.5 hover:scale-110 transition-transform"
                          title="Click to change status"
                        >
                          {getStatusIcon(todo.status)}
                        </button>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`font-medium text-gray-900 ${
                                todo.status === 'completed' ? 'line-through' : ''
                              }`}>
                                {todo.title}
                              </h3>
                              {todo.description && (
                                <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                              )}
                              
                              {/* Meta Info */}
                              <div className="flex flex-wrap items-center gap-4 mt-3">
                                {/* Priority Badge */}
                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(todo.priority)}`}>
                                  <Flag className="h-3 w-3" />
                                  {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                                </span>

                                {/* Assignee */}
                                {todo.assigned_to && (
                                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                    <User className="h-3 w-3" />
                                    {todo.assigned_to}
                                  </span>
                                )}

                                {/* Due Date */}
                                {todo.due_date && (
                                  <span className={`inline-flex items-center gap-1 text-sm ${
                                    isOverdue(todo.due_date) && todo.status !== 'completed'
                                      ? 'text-red-600 font-medium' 
                                      : 'text-gray-600'
                                  }`}>
                                    <Calendar className="h-3 w-3" />
                                    {formatDueDate(todo.due_date)}
                                  </span>
                                )}

                                {/* Completed Date */}
                                {todo.completed_at && (
                                  <span className="text-sm text-green-600">
                                    Completed {format(new Date(todo.completed_at), 'dd MMM yyyy')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setEditingTodo(todo);
                                  setFormData({
                                    title: todo.title,
                                    description: todo.description || '',
                                    assigned_to: todo.assigned_to || '',
                                    priority: todo.priority,
                                    due_date: todo.due_date || ''
                                  });
                                }}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit task"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTodos([todo.id])}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Add/Edit Modal */}
        {(isAddModalOpen || editingTodo) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingTodo ? 'Edit Task' : 'Add New Task'}
                </h2>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTodo(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter task description (optional)"
                  />
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter assignee name (optional)"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TodoPriority })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTodo(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTodo ? handleUpdateTodo : handleAddTodo}
                  disabled={!formData.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editingTodo ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}