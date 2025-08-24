// recurringTasks.ts - Handle recurring task patterns and generation
// Location: /src/components/todos/utils/recurringTasks.ts

import { TodoItem, TodoTags, RecurrenceInfo } from './types';

/**
 * Calculate the next occurrence date based on recurrence pattern
 */
export function getNextOccurrence(
  pattern: string,
  fromDate: Date = new Date()
): Date | null {
  const date = new Date(fromDate);
  const lowerPattern = pattern.toLowerCase().trim();
  
  switch (lowerPattern) {
    case 'daily':
    case 'every day':
      date.setDate(date.getDate() + 1);
      return date;
    
    case 'weekdays':
    case 'every weekday':
      // Move to next weekday
      do {
        date.setDate(date.getDate() + 1);
      } while (date.getDay() === 0 || date.getDay() === 6); // Skip weekends
      return date;
    
    case 'weekly':
    case 'every week':
      date.setDate(date.getDate() + 7);
      return date;
    
    case 'monthly':
    case 'every month':
      date.setMonth(date.getMonth() + 1);
      return date;
    
    // Specific day patterns
    case 'every monday':
      return getNextWeekday(date, 1);
    case 'every tuesday':
      return getNextWeekday(date, 2);
    case 'every wednesday':
      return getNextWeekday(date, 3);
    case 'every thursday':
      return getNextWeekday(date, 4);
    case 'every friday':
      return getNextWeekday(date, 5);
    case 'every saturday':
      return getNextWeekday(date, 6);
    case 'every sunday':
      return getNextWeekday(date, 0);
    
    default:
      // Try to parse custom patterns like "every 3 days"
      const customMatch = lowerPattern.match(/every\s+(\d+)\s+days?/);
      if (customMatch) {
        const days = parseInt(customMatch[1]);
        date.setDate(date.getDate() + days);
        return date;
      }
      
      return null;
  }
}

/**
 * Get next occurrence of a specific weekday
 */
function getNextWeekday(from: Date, targetDay: number): Date {
  const date = new Date(from);
  const currentDay = date.getDay();
  
  // Calculate days until target
  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7; // Next week
  }
  
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

/**
 * Create a new task from a completed recurring task
 */
export function createNextRecurrence(
  originalTask: TodoItem,
  completedDate: Date = new Date()
): Partial<TodoItem> | null {
  // Check if task has recurrence info
  const tags = originalTask.tags as TodoTags | null;
  if (!tags?.recurrence?.pattern) {
    return null;
  }
  
  const nextDate = getNextOccurrence(tags.recurrence.pattern, completedDate);
  if (!nextDate) {
    return null;
  }
  
  // Format date for database
  const formattedDate = formatDateForDB(nextDate);
  
  // Create new task with updated dates
  const newTask: Partial<TodoItem> = {
    business_id: originalTask.business_id,
    title: originalTask.title,
    description: originalTask.description,
    assigned_to: originalTask.assigned_to,
    priority: originalTask.priority,
    status: 'pending',
    due_date: formattedDate,
    scheduled_date: formattedDate,
    category: originalTask.category,
    effort_size: originalTask.effort_size,
    is_published: originalTask.is_published,
    tags: {
      ...tags,
      recurrence: {
        ...tags.recurrence,
        created_from: originalTask.id,
        last_completed: formatDateForDB(completedDate)
      }
    }
  };
  
  return newTask;
}

/**
 * Parse a recurrence pattern from user input
 */
export function parseRecurrencePattern(input: string): RecurrenceInfo | null {
  const pattern = detectRecurrencePattern(input);
  if (!pattern) return null;
  
  return {
    pattern,
    skip_weekends: pattern === 'weekdays'
  };
}

/**
 * Detect recurrence pattern in text
 */
function detectRecurrencePattern(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  // Check for common patterns
  const patterns = [
    { keywords: ['every day', 'daily'], pattern: 'daily' },
    { keywords: ['every weekday', 'weekdays'], pattern: 'weekdays' },
    { keywords: ['every week', 'weekly'], pattern: 'weekly' },
    { keywords: ['every month', 'monthly'], pattern: 'monthly' },
    { keywords: ['every monday'], pattern: 'every monday' },
    { keywords: ['every tuesday'], pattern: 'every tuesday' },
    { keywords: ['every wednesday'], pattern: 'every wednesday' },
    { keywords: ['every thursday'], pattern: 'every thursday' },
    { keywords: ['every friday'], pattern: 'every friday' },
    { keywords: ['every saturday'], pattern: 'every saturday' },
    { keywords: ['every sunday'], pattern: 'every sunday' },
  ];
  
  for (const { keywords, pattern } of patterns) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return pattern;
    }
  }
  
  // Check for custom interval pattern (e.g., "every 3 days")
  const intervalMatch = lowerText.match(/every\s+(\d+)\s+days?/);
  if (intervalMatch) {
    return `every ${intervalMatch[1]} days`;
  }
  
  return null;
}

/**
 * Format date for database storage
 */
function formatDateForDB(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get human-readable description of recurrence
 */
export function getRecurrenceDescription(pattern: string): string {
  const descriptions: Record<string, string> = {
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
    'every sunday': 'Every Sunday',
  };
  
  if (descriptions[pattern]) {
    return descriptions[pattern];
  }
  
  // Handle custom patterns
  const intervalMatch = pattern.match(/every\s+(\d+)\s+days?/);
  if (intervalMatch) {
    const days = intervalMatch[1];
    return `Every ${days} day${days === '1' ? '' : 's'}`;
  }
  
  return pattern;
}

/**
 * Check if a date falls on a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Get all occurrence dates for a pattern within a date range
 */
export function getOccurrencesInRange(
  pattern: string,
  startDate: Date,
  endDate: Date,
  maxOccurrences: number = 100
): Date[] {
  const occurrences: Date[] = [];
  let currentDate = new Date(startDate);
  let count = 0;
  
  while (currentDate <= endDate && count < maxOccurrences) {
    const nextDate = getNextOccurrence(pattern, currentDate);
    if (!nextDate || nextDate > endDate) {
      break;
    }
    
    occurrences.push(new Date(nextDate));
    currentDate = nextDate;
    count++;
  }
  
  return occurrences;
}

/**
 * Validate if a recurrence pattern is valid
 */
export function isValidRecurrencePattern(pattern: string): boolean {
  // Try to get next occurrence - if it returns null, pattern is invalid
  const testDate = getNextOccurrence(pattern);
  return testDate !== null;
}

/**
 * Check if a task should recur based on its tags
 */
export function shouldTaskRecur(task: TodoItem): boolean {
  const tags = task.tags as TodoTags | null;
  return !!(tags?.recurrence?.pattern && isValidRecurrencePattern(tags.recurrence.pattern));
}

/**
 * Update recurrence info after task completion
 */
export function updateRecurrenceInfo(
  currentInfo: RecurrenceInfo,
  completedDate: Date = new Date()
): RecurrenceInfo {
  const nextDate = getNextOccurrence(currentInfo.pattern, completedDate);
  
  return {
    ...currentInfo,
    last_completed: formatDateForDB(completedDate),
    next_due: nextDate ? formatDateForDB(nextDate) : undefined
  };
}