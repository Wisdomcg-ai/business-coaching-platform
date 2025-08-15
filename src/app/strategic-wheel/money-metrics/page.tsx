'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface MoneyMetricsData {
  // Financial Goals (12 months)
  current_revenue: string;
  target_revenue: string;
  current_gross_profit: string;
  target_gross_profit: string;
  current_net_profit: string;
  target_net_profit: string;
  current_cash_flow: string;
  target_cash_flow: string;
  
  // The "1 Number"
  one_number_metric: string;
  one_number_current: string;
  one_number_target: string;
  one_number_why: string;
  
  // Supporting KPIs
  kpi_1_name: string;
  kpi_1_current: string;
  kpi_1_target: string;
  kpi_2_name: string;
  kpi_2_current: string;
  kpi_2_target: string;
  
  // Financial Priorities
  financial_challenge: string;
  pricing_strategy: string;
  cost_management: string;
  investment_priorities: string;
}

export default function MoneyMetricsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wheelId, setWheelId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<MoneyMetricsData>({
    current_revenue: '',
    target_revenue: '',
    current_gross_profit: '',
    target_gross_profit: '',
    current_net_profit: '',
    target_net_profit: '',
    current_cash_flow: '',
    target_cash_flow: '',
    one_number_metric: '',
    one_number_current: '',
    one_number_target: '',
    one_number_why: '',
    kpi_1_name: '',
    kpi_1_current: '',
    kpi_1_target: '',
    kpi_2_name: '',
    kpi_2_current: '',
    kpi_2_target: '',
    financial_challenge: '',
    pricing_strategy: '',
    cost_management: '',
    investment_priorities: ''
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
        if (wheel.money_metrics) {
          setFormData(wheel.money_metrics as MoneyMetricsData);
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
          money_metrics: formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', wheelId);

      if (error) throw error;

      alert('Money & Metrics saved successfully!');
      router.push('/strategic-wheel/communications-alignment');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof MoneyMetricsData, value: any) => {
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
            <div className="text-sm text-gray-500">Component 5 of 6</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Money & Metrics</h1>
          <p className="mt-2 text-gray-600">
            What are your financial goals and how will you track success
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Financial Goals */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">💰 Financial Goals (Next 12 Months)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">Revenue</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Current Annual</label>
                    <input
                      type="text"
                      value={formData.current_revenue}
                      onChange={(e) => handleChange('current_revenue', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="$500,000"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Target (12 months)</label>
                    <input
                      type="text"
                      value={formData.target_revenue}
                      onChange={(e) => handleChange('target_revenue', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="$750,000"
                    />
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">Gross Profit</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Current %</label>
                    <input
                      type="text"
                      value={formData.current_gross_profit}
                      onChange={(e) => handleChange('current_gross_profit', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="45%"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Target %</label>
                    <input
                      type="text"
                      value={formData.target_gross_profit}
                      onChange={(e) => handleChange('target_gross_profit', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="55%"
                    />
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">Net Profit</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Current %</label>
                    <input
                      type="text"
                      value={formData.current_net_profit}
                      onChange={(e) => handleChange('current_net_profit', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="10%"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Target %</label>
                    <input
                      type="text"
                      value={formData.target_net_profit}
                      onChange={(e) => handleChange('target_net_profit', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="20%"
                    />
                  </div>
                </div>
              </div>

              {/* Cash Flow */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">Monthly Cash Flow</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Current</label>
                    <input
                      type="text"
                      value={formData.current_cash_flow}
                      onChange={(e) => handleChange('current_cash_flow', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="$15,000"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Target</label>
                    <input
                      type="text"
                      value={formData.target_cash_flow}
                      onChange={(e) => handleChange('target_cash_flow', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="$25,000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The "1 Number" */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">🎯 Your "1 Number" - Most Important Metric</h2>
            <p className="text-gray-600 mb-4">
              If you could only track ONE number that drives everything else, what would it be?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Examples:</strong> New customers per month • Monthly recurring revenue • 
                Average transaction value • Customer lifetime value • Profit per customer • 
                Cash collected per week
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  My "1 Number" is:
                </label>
                <input
                  type="text"
                  value={formData.one_number_metric}
                  onChange={(e) => handleChange('one_number_metric', e.target.value)}
                  className="w-full p-3 border rounded-lg font-semibold"
                  placeholder="e.g., Monthly Recurring Revenue (MRR)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Value
                </label>
                <input
                  type="text"
                  value={formData.one_number_current}
                  onChange={(e) => handleChange('one_number_current', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="e.g., $42,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Value (12 months)
                </label>
                <input
                  type="text"
                  value={formData.one_number_target}
                  onChange={(e) => handleChange('one_number_target', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="e.g., $75,000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why this number matters most:
                </label>
                <textarea
                  value={formData.one_number_why}
                  onChange={(e) => handleChange('one_number_why', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="e.g., MRR drives predictable cash flow and shows true business growth..."
                />
              </div>
            </div>
          </div>

          {/* Supporting KPIs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">📊 Supporting KPIs</h2>
            <p className="text-gray-600 mb-4">What 2 other numbers support your "1 Number"?</p>
            <div className="space-y-4">
              {/* KPI 1 */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">KPI #1</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Metric Name</label>
                    <input
                      type="text"
                      value={formData.kpi_1_name}
                      onChange={(e) => handleChange('kpi_1_name', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., Customer Churn Rate"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Current</label>
                    <input
                      type="text"
                      value={formData.kpi_1_current}
                      onChange={(e) => handleChange('kpi_1_current', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., 5%"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Target</label>
                    <input
                      type="text"
                      value={formData.kpi_1_target}
                      onChange={(e) => handleChange('kpi_1_target', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., 2%"
                    />
                  </div>
                </div>
              </div>

              {/* KPI 2 */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">KPI #2</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Metric Name</label>
                    <input
                      type="text"
                      value={formData.kpi_2_name}
                      onChange={(e) => handleChange('kpi_2_name', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., Sales Conversion Rate"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Current</label>
                    <input
                      type="text"
                      value={formData.kpi_2_current}
                      onChange={(e) => handleChange('kpi_2_current', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., 20%"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Target</label>
                    <input
                      type="text"
                      value={formData.kpi_2_target}
                      onChange={(e) => handleChange('kpi_2_target', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., 35%"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Priorities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">🎯 Financial Priorities</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What financial challenge must you solve this year?
                </label>
                <textarea
                  value={formData.financial_challenge}
                  onChange={(e) => handleChange('financial_challenge', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="e.g., Improve cash flow timing, reduce dependency on one customer, increase profit margins..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Strategy
                </label>
                <textarea
                  value={formData.pricing_strategy}
                  onChange={(e) => handleChange('pricing_strategy', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="How will you optimize pricing for profitability?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Management
                </label>
                <textarea
                  value={formData.cost_management}
                  onChange={(e) => handleChange('cost_management', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="Where can you reduce costs without sacrificing quality?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Priorities
                </label>
                <textarea
                  value={formData.investment_priorities}
                  onChange={(e) => handleChange('investment_priorities', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                  placeholder="What will you invest in to drive growth?"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push('/strategic-wheel/systems-execution')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Previous: Systems & Execution
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
