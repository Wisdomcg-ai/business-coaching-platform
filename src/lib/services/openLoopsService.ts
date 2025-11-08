import { createClient } from '@/lib/supabase/client';
import type { WeeklyReview, WeeklyReviewGoal } from '@/lib/types/weekly-review';

/**
 * Get current week's dates (Monday to Sunday)
 */
export function getWeekDates(date: Date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  
  const formatDate = (dateObj: Date) => dateObj.toISOString().split('T')[0];
  
  return {
    week_starting: formatDate(monday),
    week_ending: formatDate(sunday),
  };
}

/**
 * Fetch this week's review for a business
 */
export async function getThisWeeksReview(businessId: string): Promise<WeeklyReview | null> {
  try {
    const supabase = createClient();
    const { week_starting } = getWeekDates();
    
    const { data, error } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('business_id', businessId)
      .eq('week_starting', week_starting)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching this week review:', error);
      return null;
    }

    return data as WeeklyReview;
  } catch (error) {
    console.error('Error in getThisWeeksReview:', error);
    return null;
  }
}

/**
 * Fetch review history (last 8 weeks)
 */
export async function getReviewHistory(businessId: string, limit: number = 8): Promise<WeeklyReview[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('week_starting', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching review history:', error);
      return [];
    }

    return (data || []) as WeeklyReview[];
  } catch (error) {
    console.error('Error in getReviewHistory:', error);
    return [];
  }
}

/**
 * Create or update a weekly review
 */
export async function saveWeeklyReview(
  businessId: string,
  userId: string,
  review: Partial<WeeklyReview>
): Promise<{ success: boolean; data?: WeeklyReview; error?: string }> {
  try {
    const supabase = createClient();
    const existing = await getThisWeeksReview(businessId);

    if (existing) {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .update({
          ...review,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating review:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as WeeklyReview };
    } else {
      const { week_starting, week_ending } = getWeekDates();

      const { data, error } = await supabase
        .from('weekly_reviews')
        .insert([
          {
            business_id: businessId,
            user_id: userId,
            week_starting,
            week_ending,
            ...review,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating review:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as WeeklyReview };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in saveWeeklyReview:', error);
    return { success: false, error: message };
  }
}

/**
 * Delete a weekly review
 */
export async function deleteWeeklyReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('weekly_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in deleteWeeklyReview:', error);
    return { success: false, error: message };
  }
}

/**
 * Format goals for display
 */
export function formatGoals(goals: WeeklyReviewGoal[] | null): WeeklyReviewGoal[] {
  if (!goals || !Array.isArray(goals)) {
    return [
      { order: 1, goal: '', achieved: false, comment: '' },
      { order: 2, goal: '', achieved: false, comment: '' },
      { order: 3, goal: '', achieved: false, comment: '' },
    ];
  }
  return goals;
}

/**
 * Validate review before saving
 */
export function validateWeeklyReview(review: Partial<WeeklyReview>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!review.wins || review.wins.length < 3) {
    errors.push('Please add at least 3 wins');
  }

  if (!review.challenges || review.challenges.trim() === '') {
    errors.push('Please describe at least 1 challenge');
  }

  if (!review.week_quality_score || review.week_quality_score < 1 || review.week_quality_score > 10) {
    errors.push('Please rate your week 1-10');
  }

  if (!review.next_week_focus_goals || review.next_week_focus_goals.length < 3) {
    errors.push('Please add 3 focus goals for next week');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}