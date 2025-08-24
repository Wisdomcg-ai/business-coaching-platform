// constants.ts - All constants and configuration for the todo system
// Location: /src/components/todos/utils/constants.ts

import { TodoCategory, TodoPriority, TodoStatus, EffortSize, SimplifiedPriority } from './types';

// Category definitions with metadata
export const CATEGORIES: Record<TodoCategory, {
  label: string;
  color: string;
  description: string;
  emoji: string;
  keywords: string[]; // For natural language detection
}> = {
  Operations: {
    label: 'Operations',
    color: 'bg-blue-500',
    description: 'Day-to-day business operations',
    emoji: '⚙️',
    keywords: ['operation', 'process', 'system', 'workflow', 'procedure']
  },
  Sales: {
    label: 'Sales',
    color: 'bg-green-500',
    description: 'Revenue generation and client acquisition',
    emoji: '💰',
    keywords: ['sale', 'client', 'customer', 'deal', 'proposal', 'quote', 'call', 'pitch']
  },
  Marketing: {
    label: 'Marketing',
    color: 'bg-purple-500',
    description: 'Growth, branding, and market presence',
    emoji: '📢',
    keywords: ['marketing', 'campaign', 'social', 'content', 'blog', 'email', 'newsletter', 'seo']
  },
  Finance: {
    label: 'Finance',
    color: 'bg-yellow-500',
    description: 'Financial management and planning',
    emoji: '💵',
    keywords: ['finance', 'budget', 'invoice', 'payment', 'expense', 'tax', 'accounting', 'pay']
  },
  Team: {
    label: 'Team',
    color: 'bg-indigo-500',
    description: 'People, culture, and team development',
    emoji: '👥',
    keywords: ['team', 'staff', 'hiring', 'meeting', 'culture', 'review', 'feedback', '1-on-1']
  },
  Strategy: {
    label: 'Strategy',
    color: 'bg-pink-500',
    description: 'Working ON the business - planning and vision',
    emoji: '🎯',
    keywords: ['strategy', 'plan', 'goal', 'vision', 'quarterly', 'annual', 'objective', 'kpi']
  },
  Personal: {
    label: 'Personal',
    color: 'bg-teal-500',
    description: 'Personal tasks and self-care',
    emoji: '🏠',
    keywords: ['personal', 'home', 'family', 'health', 'doctor', 'gym', 'lunch', 'break']
  },
  Admin: {
    label: 'Admin',
    color: 'bg-gray-500',
    description: 'Administrative tasks and compliance',
    emoji: '📋',
    keywords: ['admin', 'paperwork', 'compliance', 'filing', 'documentation', 'report']
  }
};

// Priority mapping (DB values to simplified UI)
export const PRIORITY_MAP: Record<TodoPriority, SimplifiedPriority> = {
  high: 'important',
  medium: 'normal',
  low: 'normal'
};

// Reverse mapping for saving to DB
export const PRIORITY_TO_DB: Record<SimplifiedPriority, TodoPriority> = {
  important: 'high',
  normal: 'medium'
};

// Priority display configuration
export const PRIORITIES = {
  important: {
    label: 'Important',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    emoji: '❗',
    indicator: '!!'
  },
  normal: {
    label: 'Normal',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    emoji: '',
    indicator: ''
  }
};

// Status display configuration
export const STATUSES: Record<TodoStatus, {
  label: string;
  icon: string;
  color: string;
}> = {
  'pending': {
    label: 'Not Started',
    icon: '○',
    color: 'text-gray-400'
  },
  'in-progress': {
    label: 'In Progress',
    icon: '◐',
    color: 'text-blue-500'
  },
  'completed': {
    label: 'Completed',
    icon: '✓',
    color: 'text-green-500'
  }
};

// Effort size configuration
export const EFFORT_SIZES: Record<EffortSize, {
  label: string;
  hours: number;
  color: string;
}> = {
  'quick-win': {
    label: '< 2 min',
    hours: 0.03,
    color: 'bg-green-100'
  },
  'half-day': {
    label: '2-4 hours',
    hours: 3,
    color: 'bg-yellow-100'
  },
  'full-day': {
    label: '4-8 hours',
    hours: 6,
    color: 'bg-orange-100'
  },
  'multi-day': {
    label: '> 8 hours',
    hours: 16,
    color: 'bg-red-100'
  }
};

// Must level indicators
export const MUST_LEVELS = {
  0: { icon: '', label: 'Regular task' },
  1: { icon: '⭐', label: 'TRUE MUST - Has to be done today' },
  2: { icon: '⭐⭐', label: 'TOP 3 MUST - Critical priority' }
};

// Open loop aging thresholds (in days)
export const OPEN_LOOP_AGING = {
  fresh: { max: 2, color: 'text-green-500', emoji: '🟢' },
  warning: { max: 4, color: 'text-yellow-500', emoji: '🟡' },
  critical: { max: 6, color: 'text-red-500', emoji: '🔴' },
  fire: { max: Infinity, color: 'text-red-700', emoji: '🔥' }
};

// Natural language date patterns
export const DATE_SHORTCUTS: Record<string, (today: Date) => Date> = {
  'today': (today) => today,
  'tomorrow': (today) => {
    const date = new Date(today);
    date.setDate(date.getDate() + 1);
    return date;
  },
  'yesterday': (today) => {
    const date = new Date(today);
    date.setDate(date.getDate() - 1);
    return date;
  },
  'monday': (today) => getNextWeekday(today, 1),
  'tuesday': (today) => getNextWeekday(today, 2),
  'wednesday': (today) => getNextWeekday(today, 3),
  'thursday': (today) => getNextWeekday(today, 4),
  'friday': (today) => getNextWeekday(today, 5),
  'saturday': (today) => getNextWeekday(today, 6),
  'sunday': (today) => getNextWeekday(today, 0),
  'next week': (today) => {
    const date = new Date(today);
    date.setDate(date.getDate() + 7);
    return date;
  },
  'eod': (today) => {
    const date = new Date(today);
    date.setHours(17, 0, 0, 0); // 5 PM
    return date;
  }
};

// Helper function for weekday calculation
function getNextWeekday(from: Date, dayOfWeek: number): Date {
  const date = new Date(from);
  const currentDay = date.getDay();
  const distance = (dayOfWeek + 7 - currentDay) % 7 || 7;
  date.setDate(date.getDate() + distance);
  return date;
}

// Recurring patterns
export const RECURRENCE_PATTERNS = {
  'daily': 'Every day',
  'weekdays': 'Every weekday (Mon-Fri)',
  'weekly': 'Every week',
  'monthly': 'Every month',
  'every monday': 'Every Monday',
  'every tuesday': 'Every Tuesday',
  'every wednesday': 'Every Wednesday',
  'every thursday': 'Every Thursday',
  'every friday': 'Every Friday',
  'every saturday': 'Every Saturday',
  'every sunday': 'Every Sunday'
};

// View configurations
export const VIEW_CONFIGS = {
  musts: {
    label: "Today's MUSTs",
    description: 'Your 3 most important tasks for today',
    emoji: '⭐',
    emptyMessage: 'No MUSTs selected yet. Start your morning ritual!'
  },
  'open-loops': {
    label: 'Open Loops',
    description: 'Started but not completed tasks',
    emoji: '🔄',
    emptyMessage: 'No open loops - great job staying on top of things!'
  },
  week: {
    label: 'This Week',
    description: 'Tasks due by Friday',
    emoji: '📅',
    emptyMessage: 'No tasks scheduled for this week'
  },
  backlog: {
    label: 'Backlog',
    description: 'Future tasks and someday/maybe items',
    emoji: '📚',
    emptyMessage: 'No backlog items'
  },
  all: {
    label: 'All Tasks',
    description: 'Everything in your system',
    emoji: '📋',
    emptyMessage: 'No tasks yet. Add your first task above!'
  }
};

// Morning ritual steps
export const MORNING_RITUAL_STEPS = {
  'quick-wins': {
    title: 'Step 1: Quick Wins',
    description: 'Complete any 2-minute tasks right now',
    emoji: '⚡'
  },
  'review': {
    title: 'Step 2: Review Today',
    description: 'Look at all tasks due today',
    emoji: '👀'
  },
  'identify-musts': {
    title: 'Step 3: Identify TRUE MUSTs',
    description: 'What absolutely HAS to be done today?',
    emoji: '🎯'
  },
  'select-top-3': {
    title: 'Step 4: Select Top 3',
    description: 'Choose your 3 most important MUSTs',
    emoji: '⭐'
  },
  'complete': {
    title: 'Ready for Today!',
    description: 'Your day is planned. Time to execute!',
    emoji: '🚀'
  }
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  'q': 'Quick add task',
  '/': 'Search tasks',
  'r': 'Start morning ritual',
  'n': 'New task',
  '1': 'View MUSTs',
  '2': 'View Open Loops',
  '3': 'View This Week',
  '4': 'View Backlog',
  'c': 'Toggle completed',
  'esc': 'Close dialog'
};

// API endpoints (relative to your base URL)
export const API_ENDPOINTS = {
  todos: '/api/todos',
  musts: '/api/musts',
  suggestions: '/api/coach-suggestions',
  stats: '/api/productivity-stats'
};

// Local storage keys
export const STORAGE_KEYS = {
  preferences: 'todo_user_preferences',
  morning_ritual: 'todo_morning_ritual_state',
  last_sync: 'todo_last_sync',
  draft_task: 'todo_draft_task'
};

// Time constants
export const TIME_CONSTANTS = {
  MORNING_RITUAL_RESET_HOUR: 4, // 4 AM
  QUICK_WIN_MAX_MINUTES: 2,
  DEFAULT_WORK_START: '09:00',
  DEFAULT_WORK_END: '17:00',
  SYNC_INTERVAL_MS: 30000, // 30 seconds
  DEBOUNCE_MS: 500
};

// Error messages
export const ERROR_MESSAGES = {
  LOAD_FAILED: 'Failed to load tasks. Please refresh the page.',
  SAVE_FAILED: 'Failed to save task. Please try again.',
  DELETE_FAILED: 'Failed to delete task. Please try again.',
  MUST_LIMIT: 'You can only select 3 TOP MUSTs per day.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_DATE: 'Invalid date format. Please use a valid date.',
  RECURRENCE_ERROR: 'Failed to create recurring task. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_DELETED: 'Task deleted successfully!',
  MUST_SELECTED: 'MUST selected for today!',
  RITUAL_COMPLETE: 'Morning ritual complete! Have a productive day!',
  SUGGESTION_SENT: 'Suggestion sent to client!',
  LOOP_CLOSED: 'Open loop closed! Great job!'
};