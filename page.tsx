'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface StrategyMarketData {
  target_demographics: string;
  target_problems: string;
  target_location: string;
  uvp_statement: string;
  uvp_framework_choice: 'option1' | 'option2' | '';
  competitive_advantage: string;
  market_size: string;
  market_approach: string;
  key_differentiators: string;
  market_leadership_path: string;
  competitor_1_name: string;
  competitor_1_advantage: string;
  competitor_2_name: string;
  competitor_2_advantage: string;
  competitor_3_name: string;
  competitor_3_advantage: string;
  usp_defined: boolean;
  usps_list: string;
}

export default function StrategyMarketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [wheelId, setWheelId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<StrategyMarketData>({
    target_demographics: '',
    target_problems: '',
    target_location: '',
    uvp_statement: '',
    uvp_framework_choice: '',
    competitive_advantage: '',
    market_size: '',
    market_approach: '',
    key_differentiators: '',
    market_leadership_path: '',
    competitor_1_name: '',
    competitor_1_advantage: '',
    competitor_2_name: '',
    competitor_2_advantage: '',
    competitor_3_name: '',
    competitor_3_advantage: '',
    usp_defined: false,
    usps_list: ''
  });

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
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
        alert('No business found. Please complete your profile first.');
        router.push('/dashboard');
        return;
      }

      setBusinessId(profile.business_id);

      const { data: wheel } = await supabase
        .from('strategic_wheels')
        .select('*')
        .eq('business_id', profile.business_id)
        .single();

      if (wheel) {
        setWheelId(wheel.id);
        if (wheel.strategy_market) {
          setFormData(wheel.strategy_market as StrategyMarketData);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('strategic_wheels')
        .update({
          strategy_market: formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', wheelId);

      if (error) throw error;

      router.push('/strategic-wheel/people-culture');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof StrategyMarketData, value: any) => {
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/strategic-wheel')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Wheel
            </button>
            <div className="text-sm text-gray-500">
              Component 2 of 6
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Strategy & Market</h1>
          <p className="mt-2 text-gray-600">
            Define HOW you win in your market
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              🎯 Target Market
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demographics
                </label>
                <textarea
                  value={formData.target_demographics}
                  onChange={(e) => handleChange('target_demographics', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="Age, income, location, industry..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problems they have
                </label>
                <textarea
                  value={formData.target_problems}
                  onChange={(e) => handleChange('target_problems', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="What problems do you solve?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where to find them
                </label>
                <textarea
                  value={formData.target_location}
                  onChange={(e) => handleChange('target_location', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="LinkedIn, associations, networks..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push('/strategic-wheel/vision-purpose')}
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
