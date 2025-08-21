'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Goal = {
  id: string;
  title: string;
  goal_type: 'annual' | '90_day_rock';
  status: string;
  progress_percentage: number;
  end_date: string;
  owner_name: string | null;
  target_metric: string | null;
  target_value: number | null;
  current_value: number | null;
  category: string | null;
  priority: number | null;
  is_critical: boolean;
};

export default function GoalsPage() {
  const [loading, setLoading] = useState(true);
  const [annualGoals, setAnnualGoals] = useState<Goal[]>([]);
  const [ninetyDayRocks, setNinetyDayRocks] = useState<Goal[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get user's business
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (bizError || !business) {
        // Check if user is a team member
        const { data: member } = await supabase
          .from('business_members')
          .select('business_id')
          .eq('user_id', user.id)
          .single();

        if (member) {
          setBusinessId(member.business_id);
        } else {
          setError('No business found. Please create a business profile first.');
          setLoading(false);
          return;
        }
      } else {
        setBusinessId(business.id);
      }

      const bizId = business?.id || businessId;

      // Load annual goals
      const { data: annualData, error: annualError } = await supabase
        .from('goals')
        .select('*')
        .eq('business_id', bizId)
        .eq('goal_type', 'annual')
        .order('priority', { ascending: true });

      if (annualError) throw annualError;

      // Load 90-day rocks
      const { data: rocksData, error: rocksError } = await supabase
        .from('goals')
        .select('*')
        .eq('business_id', bizId)
        .eq('goal_type', '90_day_rock')
        .order('priority', { ascending: true });

      if (rocksError) throw rocksError;

      setAnnualGoals(annualData || []);
      setNinetyDayRocks(rocksData || []);
    } catch (err) {
      console.error('Error loading goals:', err);
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'at_risk': return 'text-red-600 bg-red-50';
      case 'not_started': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  function getCategoryColor(category: string | null) {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'operations': return 'bg-purple-100 text-purple-800';
      case 'team': return 'bg-yellow-100 text-yellow-800';
      case 'strategic': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <Link 
              href="/business-profile" 
              className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Create Business Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Goal Setting & Tracking</h1>
              <p className="text-gray-600 mt-1">Cascade from annual goals to daily execution</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/goals/create"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Create Goal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Cascade Visualization */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Goal Cascade Framework</h2>
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="bg-blue-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">{annualGoals.length}</div>
                <div className="text-sm text-blue-800 mt-1">Annual Goals</div>
              </div>
            </div>
            <div className="text-gray-400 text-2xl px-4">→</div>
            <div className="flex-1 text-center">
              <div className="bg-purple-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600">{ninetyDayRocks.length}</div>
                <div className="text-sm text-purple-800 mt-1">90-Day Rocks</div>
              </div>
            </div>
            <div className="text-gray-400 text-2xl px-4">→</div>
            <div className="flex-1 text-center">
              <div className="bg-green-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-sm text-green-800 mt-1">Monthly Milestones</div>
              </div>
            </div>
            <div className="text-gray-400 text-2xl px-4">→</div>
            <div className="flex-1 text-center">
              <div className="bg-yellow-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-yellow-800 mt-1">Weekly Priorities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Annual Goals Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Annual Goals</h2>
            <span className="text-sm text-gray-500">Year-long strategic objectives</span>
          </div>
          
          {annualGoals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No annual goals yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first annual goal.</p>
              <Link
                href="/goals/create?type=annual"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Annual Goal
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {annualGoals.map((goal) => (
                <div key={goal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                        {goal.is_critical && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">CRITICAL</span>
                        )}
                        {goal.category && (
                          <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(goal.category)}`}>
                            {goal.category}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>Due: {formatDate(goal.end_date)}</span>
                        {goal.owner_name && <span>Owner: {goal.owner_name}</span>}
                        {goal.priority && <span>Priority: {goal.priority}</span>}
                      </div>

                      {goal.target_metric && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress: {goal.target_metric}</span>
                            <span className="font-medium">{goal.current_value || 0} / {goal.target_value}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${goal.progress_percentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(goal.status)}`}>
                          {goal.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <Link
                          href={`/goals/${goal.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-gray-900">{goal.progress_percentage || 0}%</div>
                      <div className="text-xs text-gray-500">Complete</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 90-Day Rocks Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">90-Day Rocks</h2>
            <span className="text-sm text-gray-500">Quarterly priorities driving annual goals</span>
          </div>
          
          {ninetyDayRocks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No 90-day rocks yet</h3>
              <p className="mt-1 text-sm text-gray-500">Break down your annual goals into quarterly rocks.</p>
              <Link
                href="/goals/create?type=90_day_rock"
                className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Create 90-Day Rock
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {ninetyDayRocks.map((rock) => (
                <div key={rock.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{rock.title}</h3>
                        {rock.is_critical && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">CRITICAL</span>
                        )}
                        {rock.category && (
                          <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(rock.category)}`}>
                            {rock.category}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>Due: {formatDate(rock.end_date)}</span>
                        {rock.owner_name && <span>Owner: {rock.owner_name}</span>}
                        {rock.priority && <span>Priority: {rock.priority}</span>}
                      </div>

                      {rock.target_metric && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress: {rock.target_metric}</span>
                            <span className="font-medium">{rock.current_value || 0} / {rock.target_value}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${rock.progress_percentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(rock.status)}`}>
                          {rock.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <Link
                          href={`/goals/${rock.id}`}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-gray-900">{rock.progress_percentage || 0}%</div>
                      <div className="text-xs text-gray-500">Complete</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}