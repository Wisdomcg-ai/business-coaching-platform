'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get user's business
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

      // Get strategic wheel
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
          strategy_market: formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', wheelId);

      if (error) throw error;

      alert('Strategy & Market saved successfully!');
      router.push('/strategic-wheel');
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/strategic-wheel')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Wheel
            </button>
            <div className="text-sm text-gray-500">Component 2 of 6</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Strategy & Market</h1>
          <p className="mt-2 text-gray-600">
            Define HOW you win in your market - your target customers, unique value, and competitive strategy.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Market */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">🎯 Target Market</h2>
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
                  placeholder="What problems do you solve for them?"
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

          {/* UVP */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">💎 Unique Value Proposition</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleChange('uvp_framework_choice', 'option1')}
                  className={`p-4 border-2 rounded-lg text-left ${
                    formData.uvp_framework_choice === 'option1' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium">Framework 1</div>
                  <div className="text-sm text-gray-600 mt-1">
                    We help [who] achieve [what] by [how] so they can [result]
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('uvp_framework_choice', 'option2')}
                  className={`p-4 border-2 rounded-lg text-left ${
                    formData.uvp_framework_choice === 'option2' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium">Framework 2</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Unlike [competitors], we [unique approach] which means [benefit]
                  </div>
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your UVP Statement
                </label>
                <textarea
                  value={formData.uvp_statement}
                  onChange={(e) => handleChange('uvp_statement', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="Write your UVP using the framework above..."
                />
              </div>
            </div>
          </div>

          {/* Competitive Advantage */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">🏆 Competitive Advantage</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you do better than anyone else?
                </label>
                <textarea
                  value={formData.competitive_advantage}
                  onChange={(e) => handleChange('competitive_advantage', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="Your unique strengths and advantages..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top 3 Competitors & Your Advantage
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formData.competitor_1_name}
                      onChange={(e) => handleChange('competitor_1_name', e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder="Competitor 1"
                    />
                    <input
                      type="text"
                      value={formData.competitor_1_advantage}
                      onChange={(e) => handleChange('competitor_1_advantage', e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder="Your advantage"
                    />
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formData.competitor_2_name}
                      onChange={(e) => handleChange('competitor_2_name', e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder="Competitor 2"
                    />
                    <input
                      type="text"
                      value={formData.competitor_2_advantage}
                      onChange={(e) => handleChange('competitor_2_advantage', e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder="Your advantage"
                    />
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formData.competitor_3_name}
                      onChange={(e) => handleChange('competitor_3_name', e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder="Competitor 3"
                    />
                    <input
                      type="text"
                      value={formData.competitor_3_advantage}
                      onChange={(e) => handleChange('competitor_3_advantage', e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder="Your advantage"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Strategy */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">📈 Market Strategy</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Size/Opportunity
                </label>
                <textarea
                  value={formData.market_size}
                  onChange={(e) => handleChange('market_size', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="Total addressable market, growth potential..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Approach to Winning
                </label>
                <textarea
                  value={formData.market_approach}
                  onChange={(e) => handleChange('market_approach', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="How will you capture market share?"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push('/strategic-wheel')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back to Wheel
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
