'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface VisionPurposeData {
  purpose_statement: string;
  vision_statement: string;
  core_values: string[];
}

export default function VisionPurposePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wheelId, setWheelId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<VisionPurposeData>({
    purpose_statement: '',
    vision_statement: '',
    core_values: ['', '', '', '', '', '', '', '']
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
        if (wheel.vision_purpose) {
          setFormData(wheel.vision_purpose as VisionPurposeData);
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
          vision_purpose: formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', wheelId);

      if (error) throw error;

      alert('Vision & Purpose saved successfully!');
      router.push('/strategic-wheel/strategy-market');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/strategic-wheel')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Wheel
            </button>
            <div className="text-sm text-gray-500">Component 1 of 6</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Vision & Purpose</h1>
          <p className="mt-2 text-gray-600">
            Let's start with WHY your business exists and WHERE it's going
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Purpose Statement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">🎯 Purpose Statement</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complete this sentence: Our business exists to...
            </label>
            <textarea
              value={formData.purpose_statement}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose_statement: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Example: ...help small businesses achieve sustainable growth through proven systems and personalized coaching."
              required
            />
          </div>

          {/* Vision Statement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">🚀 Vision Statement</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              In 3 years, our business will be...
            </label>
            <textarea
              value={formData.vision_statement}
              onChange={(e) => setFormData(prev => ({ ...prev, vision_statement: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Example: ...the leading business coaching platform in our region, serving 500+ clients with a team of 20 expert coaches."
              required
            />
          </div>

          {/* Core Values */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">💎 Core Values</h2>
            <p className="text-gray-600 mb-4">List your core values - the principles that guide every decision:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.core_values.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  value={value}
                  onChange={(e) => updateCoreValue(index, e.target.value)}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder={`Core Value ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push('/strategic-wheel')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back to Overview
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
