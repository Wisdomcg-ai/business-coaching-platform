import { createClient } from '@/lib/supabase'

export class AssessmentService {
  private supabase = createClient()

  async saveAssessment(data: any) {
    console.log('=== SAVING ASSESSMENT ===');
    
    try {
      // Get user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError) {
        console.error('User error:', userError);
        throw userError;
      }
      
      if (!user) {
        console.error('No user found');
        throw new Error('No user');
      }
      
      console.log('✓ User found:', user.id);
      console.log('✓ User email:', user.email);
      
      // Create record with minimal data
      const record = {
        user_id: user.id,
        status: 'completed',
        total_score: 50
      };
      
      console.log('Record to insert:', JSON.stringify(record, null, 2));
      
      // Try insert
      const { data: result, error } = await this.supabase
        .from('assessments')
        .insert(record)
        .select();
      
      if (error) {
        console.error('=== INSERT ERROR DETAILS ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('✓✓✓ SUCCESS! Assessment saved:', result);
      return result;
      
    } catch (err: any) {
      console.error('=== CATCH BLOCK ERROR ===');
      console.error('Error type:', typeof err);
      console.error('Error name:', err?.name);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      console.error('Full error:', err);
      throw err;
    }
  }

  async loadAssessment() {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return null;

    const { data } = await this.supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  }
}