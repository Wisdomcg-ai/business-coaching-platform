'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface PeopleCultureData {
  // Core Values
  core_values: string[];
  
  // Functional Accountability Chart
  roles: {
    function: string;
    person: string;
    responsibilities: string;
    success_metric: string;
  }[];
  
  // Culture Design
  culture_description: string;
  
  // Hiring Priorities
  hiring_priority_1: string;
  hiring_priority_2: string;
  
  // Retention Strategy
  recognition_rewards: string;
  growth_opportunities: string;
  work_environment: string;
  compensation_strategy: string;
}

export default function PeopleCulturePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wheelId, setWheelId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<PeopleCultureData>({
    core_values: ['', '', '', '', '', '', '', ''],
    roles: [
      { function: 'Sales & Business Development', person: '', responsibilities: '', success_metric: '' },
      { function: 'Marketing & Lead Generation', person: '', responsibilities: '', success_metric: '' },
      { function: 'Operations & Delivery', person: '', responsibilities: '', success_metric: '' },
      { function: 'Finance & Administration', person: '', responsibilities: '', success_metric: '' },
      { function: 'Customer Success', person: '', responsibilities: '', success_metric: '' },
      { function: 'Leadership & Strategy', person: '', responsibilities: '', success_metric: '' }
    ],
    culture_description: '',
    hiring_priority_1: '',
    hiring_priority_2: '',
    recognition_rewards: '',
    growth_opportunities: '',
    work_environment: '',
    compensation_strategy: ''
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
        if (wheel.people_culture) {
          setFormData(wheel.people_culture as PeopleCultureData);
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
          people_culture: formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', wheelId);

      if (error) throw error;

      alert('People & Culture saved successfully!');
      router.push('/strategic-wheel/systems-execution');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateCoreValue = (index: number, value: string) => {
    const newValues = [...formData.core_values];
    newValues[index] = value;
    setFormData(prev => ({ ...prev, core_values: newValues }));
  };

  const updateRole = (index: number, field: string, value: string) => {
    const newRoles = [...formData.roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setFormData(prev => ({ ...prev, roles: newRoles }));
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
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/strategic-wheel')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Wheel
            </button>
            <div className="text-sm text-gray-500">Component 3 of 6</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">People & Culture</h1>
          <p className="mt-2 text-gray-600">
            WHO is on your team and HOW do you work together
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Core Values */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">🌟 Core Values</h2>
            <p className="text-gray-600 mb-4">List up to 8 core values that guide every decision:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.core_values.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  value={value}
                  onChange={(e) => updateCoreValue(index, e.target.value)}
                  className="p-3 border rounded-lg"
                  placeholder={`Core Value ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Functional Accountability Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">📊 Functional Accountability Chart</h2>
            <p className="text-gray-600 mb-4">Map your key roles and responsibilities:</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Function/Role</th>
                    <th className="text-left p-2 font-medium">Person Responsible</th>
                    <th className="text-left p-2 font-medium">Key Responsibilities</th>
                    <th className="text-left p-2 font-medium">Success Metric</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.roles.map((role, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium text-sm">{role.function}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={role.person}
                          onChange={(e) => updateRole(index, 'person', e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="Name"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={role.responsibilities}
                          onChange={(e) => updateRole(index, 'responsibilities', e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="Main duties"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={role.success_metric}
                          onChange={(e) => updateRole(index, 'success_metric', e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="KPI"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Culture Design */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">🎯 Culture Design</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How do you want people to feel working with/for you?
            </label>
            <textarea
              value={formData.culture_description}
              onChange={(e) => setFormData(prev => ({ ...prev, culture_description: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="Describe your ideal workplace culture, team dynamics, and working environment..."
            />
          </div>

          {/* Hiring Priorities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">👥 Hiring Priorities</h2>
            <p className="text-gray-600 mb-4">What 2 roles do you need to hire in the next 12 months?</p>
            <div className="space-y-3">
              <input
                type="text"
                value={formData.hiring_priority_1}
                onChange={(e) => setFormData(prev => ({ ...prev, hiring_priority_1: e.target.value }))}
                className="w-full p-3 border rounded-lg"
                placeholder="Priority Role #1 (e.g., Sales Manager, Operations Lead)"
              />
              <input
                type="text"
                value={formData.hiring_priority_2}
                onChange={(e) => setFormData(prev => ({ ...prev, hiring_priority_2: e.target.value }))}
                className="w-full p-3 border rounded-lg"
                placeholder="Priority Role #2"
              />
            </div>
          </div>

          {/* Retention Strategy */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">💪 Retention Strategy</h2>
            <p className="text-gray-600 mb-4">What will you do to keep your best people?</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recognition & Rewards
                </label>
                <textarea
                  value={formData.recognition_rewards}
                  onChange={(e) => setFormData(prev => ({ ...prev, recognition_rewards: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="How will you recognize and reward great performance?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Growth Opportunities
                </label>
                <textarea
                  value={formData.growth_opportunities}
                  onChange={(e) => setFormData(prev => ({ ...prev, growth_opportunities: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="What development and advancement opportunities will you offer?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Environment
                </label>
                <textarea
                  value={formData.work_environment}
                  onChange={(e) => setFormData(prev => ({ ...prev, work_environment: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="What kind of workplace will you create?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compensation Strategy
                </label>
                <textarea
                  value={formData.compensation_strategy}
                  onChange={(e) => setFormData(prev => ({ ...prev, compensation_strategy: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="How will you structure pay and benefits?"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push('/strategic-wheel/strategy-market')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Previous: Strategy & Market
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
