'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SystemsExecutionData {
  // 4 Core Business Processes
  attract_process: string;
  convert_process: string;
  deliver_process: string;
  retain_grow_process: string;
  
  // System Priorities
  system_priority_1: string;
  system_priority_2: string;
  system_priority_3: string;
  
  // Execution Rhythm
  daily_rhythm: string;
  weekly_rhythm: string;
  monthly_rhythm: string;
  quarterly_rhythm: string;
  
  // Process Documentation
  processes_documented: boolean;
  training_systems: string;
  quality_standards: string;
  improvement_approach: string;
}

export default function SystemsExecutionPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wheelId, setWheelId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SystemsExecutionData>({
    attract_process: '',
    convert_process: '',
    deliver_process: '',
    retain_grow_process: '',
    system_priority_1: '',
    system_priority_2: '',
    system_priority_3: '',
    daily_rhythm: '',
    weekly_rhythm: '',
    monthly_rhythm: '',
    quarterly_rhythm: '',
    processes_documented: false,
    training_systems: '',
    quality_standards: '',
    improvement_approach: ''
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
        if (wheel.systems_execution) {
          setFormData(wheel.systems_execution as SystemsExecutionData);
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
          systems_execution: formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', wheelId);

      if (error) throw error;

      alert('Systems & Execution saved successfully!');
      router.push('/strategic-wheel/money-metrics');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SystemsExecutionData, value: any) => {
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
            <div className="text-sm text-gray-500">Component 4 of 6</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Systems & Execution</h1>
          <p className="mt-2 text-gray-600">
            HOW does work actually get done in your business
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 4 Core Business Processes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">⚙️ 4 Core Business Processes</h2>
            <p className="text-gray-600 mb-6">Define how each critical process works in your business:</p>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <label className="block font-semibold text-gray-900 mb-2">
                  1. ATTRACT (Lead Generation/Marketing Process)
                </label>
                <p className="text-sm text-gray-600 mb-2">How do you consistently generate qualified prospects?</p>
                <textarea
                  value={formData.attract_process}
                  onChange={(e) => handleChange('attract_process', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="Example: Content marketing → Social media → Email nurture campaigns → Webinars..."
                />
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <label className="block font-semibold text-gray-900 mb-2">
                  2. CONVERT (Sales/Conversion Process)
                </label>
                <p className="text-sm text-gray-600 mb-2">How do you turn prospects into paying customers?</p>
                <textarea
                  value={formData.convert_process}
                  onChange={(e) => handleChange('convert_process', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="Example: Discovery call → Needs assessment → Proposal → Negotiation → Close..."
                />
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <label className="block font-semibold text-gray-900 mb-2">
                  3. DELIVER (Fulfillment/Service Delivery Process)
                </label>
                <p className="text-sm text-gray-600 mb-2">How do you consistently deliver your product/service?</p>
                <textarea
                  value={formData.deliver_process}
                  onChange={(e) => handleChange('deliver_process', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="Example: Onboarding → Project kickoff → Delivery milestones → Quality check → Completion..."
                />
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <label className="block font-semibold text-gray-900 mb-2">
                  4. RETAIN & GROW (Customer Success/Expansion Process)
                </label>
                <p className="text-sm text-gray-600 mb-2">How do you keep customers happy and increase their value?</p>
                <textarea
                  value={formData.retain_grow_process}
                  onChange={(e) => handleChange('retain_grow_process', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="Example: Regular check-ins → Success metrics review → Upsell opportunities → Referral requests..."
                />
              </div>
            </div>
          </div>

          {/* System Priorities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">🎯 System Priorities</h2>
            <p className="text-gray-600 mb-4">What 3 systems would make your business run smoother?</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority System #1</label>
                <input
                  type="text"
                  value={formData.system_priority_1}
                  onChange={(e) => handleChange('system_priority_1', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Example: CRM system, project management tool, automated invoicing..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority System #2</label>
                <input
                  type="text"
                  value={formData.system_priority_2}
                  onChange={(e) => handleChange('system_priority_2', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Example: Customer portal, inventory management, scheduling system..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority System #3</label>
                <input
                  type="text"
                  value={formData.system_priority_3}
                  onChange={(e) => handleChange('system_priority_3', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Example: Marketing automation, reporting dashboard, quality control..."
                />
              </div>
            </div>
          </div>

          {/* Execution Rhythm */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">📅 Execution Rhythm</h2>
            <p className="text-gray-600 mb-4">How often do you review progress and make decisions?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily
                </label>
                <textarea
                  value={formData.daily_rhythm}
                  onChange={(e) => handleChange('daily_rhythm', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="Example: Morning huddle, priority review..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly
                </label>
                <textarea
                  value={formData.weekly_rhythm}
                  onChange={(e) => handleChange('weekly_rhythm', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="Example: Team meeting, metrics review..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly
                </label>
                <textarea
                  value={formData.monthly_rhythm}
                  onChange={(e) => handleChange('monthly_rhythm', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="Example: Financial review, goal tracking..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quarterly
                </label>
                <textarea
                  value={formData.quarterly_rhythm}
                  onChange={(e) => handleChange('quarterly_rhythm', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="Example: Strategic planning, goal setting..."
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push('/strategic-wheel/people-culture')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Previous
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Continue →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
