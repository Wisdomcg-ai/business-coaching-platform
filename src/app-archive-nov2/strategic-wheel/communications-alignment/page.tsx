'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

interface CommunicationsAlignmentData {
  // Communication Strategy
  team_meetings_frequency: string;
  team_meetings_format: string;
  customer_communication: string;
  progress_updates: string;
  
  // Alignment Tools
  goal_visibility: string;
  priority_alignment: string;
  decision_making: string;
  information_flow: string;
  
  // Meeting Rhythms
  daily_huddle: boolean;
  daily_huddle_details: string;
  weekly_meeting: boolean;
  weekly_meeting_details: string;
  monthly_meeting: boolean;
  monthly_meeting_details: string;
  quarterly_planning: boolean;
  quarterly_planning_details: string;
  
  // Communication Channels
  internal_tools: string;
  external_tools: string;
  documentation_system: string;
  feedback_system: string;
  
  // Alignment Metrics
  team_alignment_score: string;
  communication_effectiveness: string;
  decision_speed: string;
}

export default function CommunicationsAlignmentPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wheelId, setWheelId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CommunicationsAlignmentData>({
    team_meetings_frequency: '',
    team_meetings_format: '',
    customer_communication: '',
    progress_updates: '',
    goal_visibility: '',
    priority_alignment: '',
    decision_making: '',
    information_flow: '',
    daily_huddle: false,
    daily_huddle_details: '',
    weekly_meeting: false,
    weekly_meeting_details: '',
    monthly_meeting: false,
    monthly_meeting_details: '',
    quarterly_planning: false,
    quarterly_planning_details: '',
    internal_tools: '',
    external_tools: '',
    documentation_system: '',
    feedback_system: '',
    team_alignment_score: '',
    communication_effectiveness: '',
    decision_speed: ''
  });

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user.id)
        .single();

      if (!profile?.business_id) {
        alert('No business found. Please complete setup first.');
        router.push('/dashboard');
        return;
      }

      const { data: wheel } = await supabase
        .from('strategic_wheels')
        .select('*')
        .eq('business_id', profile.business_id)
        .single();

      if (wheel) {
        setWheelId(wheel.id);
        if (wheel.communications_alignment) {
          setFormData(wheel.communications_alignment as CommunicationsAlignmentData);
        }
      }
    } catch (error) {
      console.error('Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wheelId) {
      alert('No strategic wheel found. Please try again.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('strategic_wheels')
        .update({
          communications_alignment: formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', wheelId);

      if (error) throw error;

      alert('Strategic Wheel Complete! All 6 components saved successfully!');
      router.push('/strategic-wheel');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof CommunicationsAlignmentData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/strategic-wheel')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Wheel
            </button>
            <div className="text-sm text-gray-500">Component 6 of 6 - Final!</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Communications & Alignment</h1>
          <p className="mt-2 text-gray-600">
            HOW do you keep everyone moving in the same direction
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Communication Strategy */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">📢 Communication Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Meetings - How Often?
                </label>
                <input
                  type="text"
                  value={formData.team_meetings_frequency}
                  onChange={(e) => handleChange('team_meetings_frequency', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="e.g., Daily huddles, weekly team meetings"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Format
                </label>
                <input
                  type="text"
                  value={formData.team_meetings_format}
                  onChange={(e) => handleChange('team_meetings_format', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="e.g., In-person, video, hybrid"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Communication
                </label>
                <textarea
                  value={formData.customer_communication}
                  onChange={(e) => handleChange('customer_communication', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="How do you keep customers informed and engaged?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Updates
                </label>
                <textarea
                  value={formData.progress_updates}
                  onChange={(e) => handleChange('progress_updates', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="How do you share progress and wins?"
                />
              </div>
            </div>
          </div>

          {/* Meeting Rhythms */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">🗓️ Meeting Rhythms</h2>
            <p className="text-gray-600 mb-4">Check the meetings you have and describe their purpose:</p>
            
            <div className="space-y-4">
              {/* Daily Huddle */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="daily_huddle"
                    checked={formData.daily_huddle}
                    onChange={(e) => handleChange('daily_huddle', e.target.checked)}
                    className="h-5 w-5 text-purple-600 rounded mr-3"
                  />
                  <label htmlFor="daily_huddle" className="font-semibold">
                    Daily Huddle (5-15 minutes)
                  </label>
                </div>
                {formData.daily_huddle && (
                  <input
                    type="text"
                    value={formData.daily_huddle_details}
                    onChange={(e) => handleChange('daily_huddle_details', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="What's covered? e.g., Top priorities, blockers, wins"
                  />
                )}
              </div>

              {/* Weekly Meeting */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="weekly_meeting"
                    checked={formData.weekly_meeting}
                    onChange={(e) => handleChange('weekly_meeting', e.target.checked)}
                    className="h-5 w-5 text-purple-600 rounded mr-3"
                  />
                  <label htmlFor="weekly_meeting" className="font-semibold">
                    Weekly Team Meeting (30-60 minutes)
                  </label>
                </div>
                {formData.weekly_meeting && (
                  <input
                    type="text"
                    value={formData.weekly_meeting_details}
                    onChange={(e) => handleChange('weekly_meeting_details', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="What's covered? e.g., Metrics review, issues, priorities"
                  />
                )}
              </div>

              {/* Monthly Meeting */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="monthly_meeting"
                    checked={formData.monthly_meeting}
                    onChange={(e) => handleChange('monthly_meeting', e.target.checked)}
                    className="h-5 w-5 text-purple-600 rounded mr-3"
                  />
                  <label htmlFor="monthly_meeting" className="font-semibold">
                    Monthly Strategic Meeting (2-4 hours)
                  </label>
                </div>
                {formData.monthly_meeting && (
                  <input
                    type="text"
                    value={formData.monthly_meeting_details}
                    onChange={(e) => handleChange('monthly_meeting_details', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="What's covered? e.g., Financial review, strategic adjustments"
                  />
                )}
              </div>

              {/* Quarterly Planning */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="quarterly_planning"
                    checked={formData.quarterly_planning}
                    onChange={(e) => handleChange('quarterly_planning', e.target.checked)}
                    className="h-5 w-5 text-purple-600 rounded mr-3"
                  />
                  <label htmlFor="quarterly_planning" className="font-semibold">
                    Quarterly Planning Session (1-2 days)
                  </label>
                </div>
                {formData.quarterly_planning && (
                  <input
                    type="text"
                    value={formData.quarterly_planning_details}
                    onChange={(e) => handleChange('quarterly_planning_details', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="What's covered? e.g., 90-day goals, annual plan review"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Alignment Tools */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">🎯 Alignment Tools</h2>
            <p className="text-gray-600 mb-4">How does everyone know what's most important?</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Visibility
                </label>
                <textarea
                  value={formData.goal_visibility}
                  onChange={(e) => handleChange('goal_visibility', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="How are goals shared and tracked? e.g., Dashboard, scorecard, OKRs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Alignment
                </label>
                <textarea
                  value={formData.priority_alignment}
                  onChange={(e) => handleChange('priority_alignment', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="How do you ensure everyone focuses on the right priorities?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision Making Process
                </label>
                <textarea
                  value={formData.decision_making}
                  onChange={(e) => handleChange('decision_making', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="How are decisions made and communicated?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Information Flow
                </label>
                <textarea
                  value={formData.information_flow}
                  onChange={(e) => handleChange('information_flow', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="How does information move through your organization?"
                />
              </div>
            </div>
          </div>

          {/* Communication Channels */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">💬 Communication Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Communication Tools
                </label>
                <textarea
                  value={formData.internal_tools}
                  onChange={(e) => handleChange('internal_tools', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="e.g., Slack, Teams, Email, WhatsApp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External Communication Tools
                </label>
                <textarea
                  value={formData.external_tools}
                  onChange={(e) => handleChange('external_tools', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="e.g., Email, CRM, social media, newsletters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documentation System
                </label>
                <textarea
                  value={formData.documentation_system}
                  onChange={(e) => handleChange('documentation_system', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="Where do you store important docs? e.g., Google Drive, Notion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback System
                </label>
                <textarea
                  value={formData.feedback_system}
                  onChange={(e) => handleChange('feedback_system', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="How do you gather and act on feedback?"
                />
              </div>
            </div>
          </div>

          {/* Navigation - Final Component! */}
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              🎉 Final Component - You're About to Complete Your Strategic Wheel!
            </h3>
            <p className="text-green-700 mb-4">
              Once you save this, all 6 components of your Strategic Wheel will be complete.
            </p>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/strategic-wheel/money-metrics')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-white"
              >
                ← Previous: Money & Metrics
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
              >
                {saving ? 'Saving...' : '✅ Complete Strategic Wheel!'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
