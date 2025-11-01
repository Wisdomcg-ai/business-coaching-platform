'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type VisionTargets = {
  three_year_revenue: number;
  three_year_gross_profit_percent: number;
  three_year_net_profit_percent: number;
  one_year_revenue: number;
  one_year_gross_profit_percent: number;
  one_year_net_profit_percent: number;
};

type QuarterlyForecast = {
  quarter_year: number;
  quarter_number: number;
  total_revenue: number;
  total_gross_profit_percent: number;
  total_net_profit_percent: number;
  revenue_gap: number;
  revenue_gap_percent: number;
};

type QuarterlyPriority = {
  id: string;
  priority_order: number;
  strategic_todo_id: string;
  why_critical: string;
  success_metric: string;
  progress_percentage: number;
  status: string;
  strategic_todo?: {
    title: string;
    engine: string;
    impact_level: string;
    owner_name: string;
  };
};

export default function GoalsPage() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [visionTargets, setVisionTargets] = useState<VisionTargets | null>(null);
  const [currentForecast, setCurrentForecast] = useState<QuarterlyForecast | null>(null);
  const [priorities, setPriorities] = useState<QuarterlyPriority[]>([]);
  const [todoCount, setTodoCount] = useState<Record<string, number>>({});
  const router = useRouter();
  const supabase = createClient();

  // Get current quarter
  const getCurrentQuarter = () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return { year: now.getFullYear(), quarter };
  };

  useEffect(() => {
    loadGoalData();
  }, []);

  async function loadGoalData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get user's business
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!business) {
        const { data: member } = await supabase
          .from('business_members')
          .select('business_id')
          .eq('user_id', user.id)
          .single();

        if (!member) {
          router.push('/business-profile');
          return;
        }
        setBusinessId(member.business_id);
      } else {
        setBusinessId(business.id);
      }

      const bizId = business?.id || businessId;
      if (!bizId) return;

      // Load vision & targets
      const { data: vision } = await supabase
        .from('vision_targets')
        .select('*')
        .eq('business_id', bizId)
        .single();

      setVisionTargets(vision);

      // Load current quarter forecast
      const { year, quarter } = getCurrentQuarter();
      const { data: forecast } = await supabase
        .from('quarterly_forecasts')
        .select('*')
        .eq('business_id', bizId)
        .eq('quarter_year', year)
        .eq('quarter_number', quarter)
        .single();

      setCurrentForecast(forecast);

      // Load current priorities with their todos
      const { data: prioritiesData } = await supabase
        .from('quarterly_priorities')
        .select(`
          *,
          strategic_todo:strategic_todos(
            title,
            engine,
            impact_level,
            owner_name
          )
        `)
        .eq('business_id', bizId)
        .eq('quarter_year', year)
        .eq('quarter_number', quarter)
        .order('priority_order');

      setPriorities(prioritiesData || []);

      // Count todos by engine
      const { data: todos } = await supabase
        .from('strategic_todos')
        .select('engine')
        .eq('business_id', bizId)
        .eq('status', 'backlog');

      const counts: Record<string, number> = {};
      todos?.forEach((todo) => {
        counts[todo.engine] = (counts[todo.engine] || 0) + 1;
      });
      setTodoCount(counts);

    } catch (error) {
      console.error('Error loading goal data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getEngineColor(engine: string) {
    const colors: Record<string, string> = {
      attract: 'bg-blue-100 text-blue-800',
      convert: 'bg-purple-100 text-purple-800',
      deliver_customer: 'bg-green-100 text-green-800',
      deliver_operations: 'bg-yellow-100 text-yellow-800',
      scale: 'bg-indigo-100 text-indigo-800',
      finance: 'bg-red-100 text-red-800'
    };
    return colors[engine] || 'bg-gray-100 text-gray-800';
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      not_started: 'bg-gray-100 text-gray-800',
      on_track: 'bg-green-100 text-green-800',
      at_risk: 'bg-yellow-100 text-yellow-800',
      behind: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function formatCurrency(amount: number | null) {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { year, quarter } = getCurrentQuarter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Strategic Planning & Execution</h1>
              <p className="text-gray-600 mt-1">Financial forecasts drive priorities</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vision & Targets Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Vision & Targets</h2>
            <Link
              href="/goals/vision"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {visionTargets ? 'Edit' : 'Set'} Targets →
            </Link>
          </div>

          {visionTargets ? (
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">3-Year Vision</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Revenue:</span>
                    <span className="font-medium">{formatCurrency(visionTargets.three_year_revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Gross Profit:</span>
                    <span className="font-medium">{visionTargets.three_year_gross_profit_percent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Net Profit:</span>
                    <span className="font-medium">{visionTargets.three_year_net_profit_percent}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">1-Year Plan</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Revenue:</span>
                    <span className="font-medium">{formatCurrency(visionTargets.one_year_revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Gross Profit:</span>
                    <span className="font-medium">{visionTargets.one_year_gross_profit_percent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Net Profit:</span>
                    <span className="font-medium">{visionTargets.one_year_net_profit_percent}%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No vision & targets set yet. 
              <Link href="/goals/vision" className="text-blue-600 hover:text-blue-700 ml-1">
                Set them now →
              </Link>
            </p>
          )}
        </div>

        {/* Current Quarter Forecast & Gaps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Q{quarter} {year} Forecast</h2>
            <Link
              href="/goals/forecast"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {currentForecast ? 'Update' : 'Create'} Forecast →
            </Link>
          </div>

          {currentForecast ? (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(currentForecast.total_revenue)}
                  </div>
                  <div className="text-sm text-gray-500">Revenue Target</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {currentForecast.total_gross_profit_percent}%
                  </div>
                  <div className="text-sm text-gray-500">Gross Margin</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {currentForecast.total_net_profit_percent}%
                  </div>
                  <div className="text-sm text-gray-500">Net Margin</div>
                </div>
              </div>

              {currentForecast.revenue_gap && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="font-medium text-red-900">Revenue Gap: </span>
                      <span className="text-red-700">
                        {formatCurrency(Math.abs(currentForecast.revenue_gap))} 
                        ({Math.abs(currentForecast.revenue_gap_percent || 0).toFixed(1)}% behind pace)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No forecast for current quarter. 
              <Link href="/goals/forecast" className="text-blue-600 hover:text-blue-700 ml-1">
                Create forecast →
              </Link>
            </p>
          )}
        </div>

        {/* 90-Day Priorities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900">90-Day Priorities</h2>
            <Link
              href="/goals/priorities"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Manage Priorities →
            </Link>
          </div>

          {priorities.length > 0 ? (
            <div className="space-y-4">
              {priorities.map((priority) => (
                <div key={priority.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                          #{priority.priority_order}. {priority.strategic_todo?.title}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getEngineColor(priority.strategic_todo?.engine || '')}`}>
                          {priority.strategic_todo?.engine.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(priority.status)}`}>
                          {priority.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{priority.why_critical}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Success Metric: {priority.success_metric}</span>
                        {priority.strategic_todo?.owner_name && (
                          <span>Owner: {priority.strategic_todo.owner_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{priority.progress_percentage}%</div>
                      <div className="text-xs text-gray-500">Complete</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${priority.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No priorities set for this quarter. 
              <Link href="/goals/priorities" className="text-blue-600 hover:text-blue-700 ml-1">
                Select priorities →
              </Link>
            </p>
          )}
        </div>

        {/* Strategic To-Do Master List Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Strategic To-Do List</h2>
            <Link
              href="/goals/todos"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Manage List →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{todoCount.attract || 0}</div>
              <div className="text-sm text-blue-800">Attract Engine</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{todoCount.convert || 0}</div>
              <div className="text-sm text-purple-800">Convert Engine</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{todoCount.deliver_customer || 0}</div>
              <div className="text-sm text-green-800">Deliver - Customer</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{todoCount.deliver_operations || 0}</div>
              <div className="text-sm text-yellow-800">Deliver - Operations</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{todoCount.scale || 0}</div>
              <div className="text-sm text-indigo-800">Scale Engine</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{todoCount.finance || 0}</div>
              <div className="text-sm text-red-800">Finance Engine</div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/goals/todos/add"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Strategic Initiative
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}