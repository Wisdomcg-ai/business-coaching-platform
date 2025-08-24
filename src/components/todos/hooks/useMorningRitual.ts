// useMorningRitual.ts - Hook for managing the morning ritual flow
// Location: /src/components/todos/hooks/useMorningRitual.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MorningRitualState, 
  EnhancedTodoItem,
  DailyMust 
} from '../utils/types';
import { STORAGE_KEYS, TIME_CONSTANTS } from '../utils/constants';
import { toast } from 'sonner';

interface UseMorningRitualOptions {
  todos: EnhancedTodoItem[];
  musts: DailyMust[];
  currentUserName: string;
  onSelectMust: (todoId: string, level: 1 | 2) => Promise<boolean>;
  onCompleteTodo: (todoId: string) => Promise<boolean>;
  onClose?: () => void;
}

interface UseMorningRitualReturn {
  state: MorningRitualState;
  isActive: boolean;
  shouldShowRitual: boolean;
  quickWinTodos: EnhancedTodoItem[];
  todayTodos: EnhancedTodoItem[];
  identifiedMusts: Set<string>;
  selectedTop3: Set<string>;
  canProceed: boolean;
  startRitual: () => void;
  completeQuickWin: (todoId: string) => Promise<void>;
  toggleMustIdentification: (todoId: string) => void;
  toggleTop3Selection: (todoId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  completeRitual: () => Promise<void>;
  dismissRitual: () => void;
}

export function useMorningRitual({
  todos,
  musts,
  currentUserName,
  onSelectMust,
  onCompleteTodo,
  onClose
}: UseMorningRitualOptions): UseMorningRitualReturn {
  // Load saved state from localStorage
  const loadSavedState = (): MorningRitualState | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.morning_ritual);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if it's from today
        const today = new Date().toISOString().split('T')[0];
        if (parsed.date === today) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading morning ritual state:', err);
    }
    return null;
  };

  // Initialize state
  const getInitialState = (): MorningRitualState => {
    const saved = loadSavedState();
    if (saved) return saved;
    
    return {
      step: 'quick-wins',
      quick_wins_completed: [],
      identified_musts: [],
      selected_top_3: [],
      date: new Date().toISOString().split('T')[0]
    };
  };

  const [state, setState] = useState<MorningRitualState>(getInitialState);
  const [isActive, setIsActive] = useState(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isActive) {
      localStorage.setItem(STORAGE_KEYS.morning_ritual, JSON.stringify(state));
    }
  }, [state, isActive]);

  // Check if ritual should be shown
  const shouldShowRitual = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getHours();
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    
    // Check if it's a work day and morning time
    if (!isWeekday || currentHour < 6 || currentHour > 12) {
      return false;
    }
    
    // Check if user has already selected TOP 3 MUSTs today
    const todayTop3Musts = musts.filter(m => 
      m.must_date === today && 
      m.must_level === 2 &&
      m.user_name === currentUserName
    );
    
    // If no TOP 3 MUSTs selected today, show ritual
    return todayTop3Musts.length === 0;
  }, [musts, currentUserName]);

  // Filter quick-win todos (2 minutes or less, not completed)
  const quickWinTodos = useMemo(() => {
    return todos.filter(todo => 
      todo.assigned_to === currentUserName &&
      todo.effort_size === 'quick-win' &&
      todo.status !== 'completed' &&
      !state.quick_wins_completed.includes(todo.id)
    );
  }, [todos, currentUserName, state.quick_wins_completed]);

  // Filter today's todos
  const todayTodos = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return todos.filter(todo => {
      const isAssignedToUser = todo.assigned_to === currentUserName;
      const isDueToday = todo.due_date === today;
      const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && todo.status !== 'completed';
      const isNotCompleted = todo.status !== 'completed';
      
      return isAssignedToUser && (isDueToday || isOverdue) && isNotCompleted;
    });
  }, [todos, currentUserName]);

  // Convert arrays to Sets for easier manipulation
  const identifiedMusts = useMemo(() => new Set(state.identified_musts), [state.identified_musts]);
  const selectedTop3 = useMemo(() => new Set(state.selected_top_3), [state.selected_top_3]);

  // Check if user can proceed to next step
  const canProceed = useMemo(() => {
    switch (state.step) {
      case 'quick-wins':
        return true; // Can always skip quick wins
      case 'review':
        return true; // Just a review step
      case 'identify-musts':
        return identifiedMusts.size > 0; // Need at least one MUST
      case 'select-top-3':
        return selectedTop3.size === 3; // Exactly 3
      case 'complete':
        return true;
      default:
        return false;
    }
  }, [state.step, identifiedMusts, selectedTop3]);

  // Start the ritual
  const startRitual = useCallback(() => {
    setIsActive(true);
    setState(getInitialState());
    toast.info('Starting your morning ritual! Let\'s plan your day.');
  }, []);

  // Complete a quick win
  const completeQuickWin = useCallback(async (todoId: string) => {
    const success = await onCompleteTodo(todoId);
    if (success) {
      setState(prev => ({
        ...prev,
        quick_wins_completed: [...prev.quick_wins_completed, todoId]
      }));
      toast.success('Quick win completed! ⚡');
    }
  }, [onCompleteTodo]);

  // Toggle MUST identification
  const toggleMustIdentification = useCallback((todoId: string) => {
    setState(prev => {
      const musts = new Set(prev.identified_musts);
      if (musts.has(todoId)) {
        musts.delete(todoId);
      } else {
        musts.add(todoId);
      }
      return {
        ...prev,
        identified_musts: Array.from(musts)
      };
    });
  }, []);

  // Toggle TOP 3 selection
  const toggleTop3Selection = useCallback((todoId: string) => {
    setState(prev => {
      const top3 = new Set(prev.selected_top_3);
      
      // Only allow selection from identified MUSTs
      if (!prev.identified_musts.includes(todoId)) {
        toast.error('You can only select from identified MUSTs');
        return prev;
      }
      
      if (top3.has(todoId)) {
        top3.delete(todoId);
      } else {
        if (top3.size >= 3) {
          toast.error('You can only select 3 TOP MUSTs');
          return prev;
        }
        top3.add(todoId);
      }
      
      return {
        ...prev,
        selected_top_3: Array.from(top3)
      };
    });
  }, []);

  // Move to next step
  const nextStep = useCallback(() => {
    setState(prev => {
      const steps: MorningRitualState['step'][] = [
        'quick-wins',
        'review',
        'identify-musts',
        'select-top-3',
        'complete'
      ];
      
      const currentIndex = steps.indexOf(prev.step);
      if (currentIndex < steps.length - 1) {
        return {
          ...prev,
          step: steps[currentIndex + 1]
        };
      }
      return prev;
    });
  }, []);

  // Move to previous step
  const previousStep = useCallback(() => {
    setState(prev => {
      const steps: MorningRitualState['step'][] = [
        'quick-wins',
        'review',
        'identify-musts',
        'select-top-3',
        'complete'
      ];
      
      const currentIndex = steps.indexOf(prev.step);
      if (currentIndex > 0) {
        return {
          ...prev,
          step: steps[currentIndex - 1]
        };
      }
      return prev;
    });
  }, []);

  // Skip current step
  const skipStep = useCallback(() => {
    if (state.step === 'identify-musts') {
      toast.warning('You need to identify at least one MUST task');
      return;
    }
    if (state.step === 'select-top-3' && selectedTop3.size === 0) {
      toast.warning('You need to select your TOP 3 MUSTs');
      return;
    }
    nextStep();
  }, [state.step, selectedTop3, nextStep]);

  // Complete the ritual
  const completeRitual = useCallback(async () => {
    try {
      // Save identified MUSTs (level 1)
      for (const todoId of state.identified_musts) {
        if (!state.selected_top_3.includes(todoId)) {
          await onSelectMust(todoId, 1);
        }
      }
      
      // Save TOP 3 MUSTs (level 2)
      for (const todoId of state.selected_top_3) {
        await onSelectMust(todoId, 2);
      }
      
      // Clear state
      localStorage.removeItem(STORAGE_KEYS.morning_ritual);
      setState(getInitialState());
      setIsActive(false);
      
      toast.success('Morning ritual complete! Have a productive day! 🚀');
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error completing ritual:', err);
      toast.error('Failed to save your MUSTs. Please try again.');
    }
  }, [state, onSelectMust, onClose]);

  // Dismiss ritual (save for later)
  const dismissRitual = useCallback(() => {
    setIsActive(false);
    toast.info('Morning ritual saved. Come back when you\'re ready!');
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  return {
    state,
    isActive,
    shouldShowRitual,
    quickWinTodos,
    todayTodos,
    identifiedMusts,
    selectedTop3,
    canProceed,
    startRitual,
    completeQuickWin,
    toggleMustIdentification,
    toggleTop3Selection,
    nextStep,
    previousStep,
    skipStep,
    completeRitual,
    dismissRitual
  };
}