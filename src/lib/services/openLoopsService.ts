import { createClient } from '@/lib/supabase/client';

export interface OpenLoop {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  expected_completion_date: string | null;
  owner: string;
  status: 'in-progress' | 'stuck' | 'on-hold';
  blocker: string | null;
  completed_date: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOpenLoopInput {
  title: string;
  start_date: string;
  expected_completion_date: string | null;
  owner: string;
  status: 'in-progress' | 'stuck' | 'on-hold';
  blocker: string | null;
}

const supabase = createClient();

// Get all open loops for current user (not archived)
export async function getOpenLoops(status?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('open_loops')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as OpenLoop[];
  } catch (error) {
    console.error('Error fetching open loops:', error);
    throw error;
  }
}

// Get completed loops (archived)
export async function getCompletedLoops() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('open_loops')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', true)
      .order('completed_date', { ascending: false });

    if (error) throw error;
    return data as OpenLoop[];
  } catch (error) {
    console.error('Error fetching completed loops:', error);
    throw error;
  }
}

// Get all loops including archived
export async function getAllLoops() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('open_loops')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OpenLoop[];
  } catch (error) {
    console.error('Error fetching all loops:', error);
    throw error;
  }
}

// Create a new open loop
export async function createOpenLoop(input: CreateOpenLoopInput) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('open_loops')
      .insert([
        {
          user_id: user.id,
          ...input,
          archived: false
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as OpenLoop;
  } catch (error) {
    console.error('Error creating open loop:', error);
    throw error;
  }
}

// Update an open loop
export async function updateOpenLoop(id: string, updates: Partial<CreateOpenLoopInput>) {
  try {
    const { data, error } = await supabase
      .from('open_loops')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as OpenLoop;
  } catch (error) {
    console.error('Error updating open loop:', error);
    throw error;
  }
}

// Mark loop as completed and archived
export async function completeOpenLoop(id: string) {
  try {
    const { data, error } = await supabase
      .from('open_loops')
      .update({
        archived: true,
        completed_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as OpenLoop;
  } catch (error) {
    console.error('Error completing open loop:', error);
    throw error;
  }
}

// Delete an open loop
export async function deleteOpenLoop(id: string) {
  try {
    const { error } = await supabase
      .from('open_loops')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting open loop:', error);
    throw error;
  }
}

// Update status
export async function updateOpenLoopStatus(id: string, status: 'in-progress' | 'stuck' | 'on-hold') {
  try {
    return await updateOpenLoop(id, { status });
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
}

// Get stats
export async function getOpenLoopsStats() {
  try {
    const loops = await getOpenLoops();
    
    return {
      total: loops.length,
      inProgress: loops.filter(l => l.status === 'in-progress').length,
      stuck: loops.filter(l => l.status === 'stuck').length,
      onHold: loops.filter(l => l.status === 'on-hold').length
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
}

// Calculate days open
export function calculateDaysOpen(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Format date
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}