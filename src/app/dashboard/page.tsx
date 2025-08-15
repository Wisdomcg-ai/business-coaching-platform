'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    assessment: 0,
    strategicWheel: 0,
    successDisciplines: 0,
    achievementEngine: 0
  });

  useEffect(() => {
    checkUser();
    calculateProgress();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Error:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile and business
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user.id)
        .single();

      if (!profile?.business_id) return;

      // Check Assessment completion
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id')
        .eq('business_id', profile.business_id)
        .limit(1);

      const assessmentComplete = assessments && assessments.length > 0;

      // Check Strategic Wheel completion
      const { data: wheel } = await supabase
        .from('strategic_wheels')
        .select('*')
        .eq('business_id', profile.business_id)
        .single();

      let strategicWheelProgress = 0;
      if (wheel) {
        const components = [
          'vision_purpose',
          'strategy_market',
          'people_culture',
          'systems_execution',
          'money_metrics',
          'communications_alignment'
        ];

        const completed = components.filter(comp => {
          const data = wheel[comp];
          return data && typeof data === 'object' && Object.keys(data).length > 0;
        }).length;

        strategicWheelProgress = Math.round((completed / 6) * 100);
      }

      // Update progress state
      setProgress({
        assessment: assessmentComplete ? 100 : 0,
        strategicWheel: strategicWheelProgress,
        successDisciplines: 0, // Not built yet
        achievementEngine: 0 // Not built yet
      });
    } catch (error) {
      console.error('Error calculating progress:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Business Coaching Platform</h1>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Track your business development journey through our proven methodology.
          </p>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Diagnostic Assessment */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📊</span>
              <span className="text-2xl font-bold text-blue-600">{progress.assessment}%</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Diagnostic Assessment</h3>
            <p className="text-sm text-gray-600 mb-4">Comprehensive business evaluation</p>
            <button
              onClick={() => router.push('/assessment')}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                progress.assessment === 100
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {progress.assessment === 100 ? '✓ Completed' : 'Start Assessment'}
            </button>
          </div>

          {/* Strategic Wheel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🎯</span>
              <span className="text-2xl font-bold text-purple-600">{progress.strategicWheel}%</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Strategic Wheel</h3>
            <p className="text-sm text-gray-600 mb-4">6-component strategic planning</p>
            <button
              onClick={() => router.push('/strategic-wheel')}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                progress.strategicWheel === 100
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : progress.strategicWheel > 0
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {progress.strategicWheel === 100 
                ? '✓ Completed' 
                : progress.strategicWheel > 0 
                ? `Continue (${progress.strategicWheel}%)`
                : 'Start Planning'}
            </button>
          </div>

          {/* Success Disciplines */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🎯</span>
              <span className="text-2xl font-bold text-gray-400">{progress.successDisciplines}%</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Success Disciplines</h3>
            <p className="text-sm text-gray-600 mb-4">Focus on top 3 disciplines</p>
            <button
              disabled
              className="w-full py-2 px-4 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          {/* Achievement Engine */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🚀</span>
              <span className="text-2xl font-bold text-gray-400">{progress.achievementEngine}%</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Achievement Engine</h3>
            <p className="text-sm text-gray-600 mb-4">90-day implementation plan</p>
            <button
              disabled
              className="w-full py-2 px-4 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push(progress.assessment === 100 ? '/assessment/results' : '/assessment')}
              className="bg-white rounded-lg shadow-sm p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📝</span>
                <div>
                  <div className="font-semibold">Assessment</div>
                  <div className="text-sm text-gray-600">
                    {progress.assessment === 100 ? 'View your results' : 'Take your first diagnostic'}
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/strategic-wheel')}
              className="bg-white rounded-lg shadow-sm p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-semibold">Strategic Planning</div>
                  <div className="text-sm text-gray-600">
                    {progress.strategicWheel === 100 ? 'Review your strategy' : 'Continue building your wheel'}
                  </div>
                </div>
              </div>
            </button>

            <button
              disabled
              className="bg-white rounded-lg shadow-sm p-4 text-left opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👥</span>
                <div>
                  <div className="font-semibold">Team</div>
                  <div className="text-sm text-gray-600">Coming soon</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Overall Progress</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Diagnostic Assessment</span>
                <span className="font-medium">{progress.assessment}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress.assessment}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Strategic Wheel</span>
                <span className="font-medium">{progress.strategicWheel}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress.strategicWheel}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Success Disciplines</span>
                <span className="font-medium">{progress.successDisciplines}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress.successDisciplines}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Achievement Engine</span>
                <span className="font-medium">{progress.achievementEngine}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress.achievementEngine}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
