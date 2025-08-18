'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, Target, Users, TrendingUp, Calendar, CheckCircle, 
  Building2, ArrowRight, AlertCircle, RefreshCw, Activity,
  BarChart3, Lightbulb, Clock
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { 
  getDashboardData, 
  getRecommendations,
  getHealthStatusColor,
  getRevenueStageColor,
  type DashboardData 
} from '@/lib/dashboard-service';
import ProgressChart from '@/components/dashboard/ProgressChart';
import AssessmentHistory from '@/components/dashboard/AssessmentHistory';

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    assessments: [],
    latestAssessment: null,
    totalAssessments: 0,
    averageScore: 0,
    scoreImprovement: 0,
    healthTrend: 'stable'
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [strategicWheelProgress, setStrategicWheelProgress] = useState(0);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }

      // Load business info
      const { data: business } = await supabase
        .from('businesses')
        .select('name')
        .eq('owner_id', session.user.id)
        .single();

      if (business?.name) {
        setBusinessName(business.name);
      }

      // Load dashboard data
      const data = await getDashboardData(session.user.id);
      setDashboardData(data);
      
      // Get recommendations based on latest assessment
      const recs = getRecommendations(data.latestAssessment);
      setRecommendations(recs);

      // Load strategic wheel progress
      const { data: strategicWheel } = await supabase
        .from('strategic_wheels')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (strategicWheel) {
        const sections = [
          strategicWheel.vision_purpose,
          strategicWheel.strategy_market,
          strategicWheel.people_culture,
          strategicWheel.systems_execution,
          strategicWheel.money_metrics,
          strategicWheel.communications_alignment
        ];
        
        const completedSections = sections.filter(section => 
          section && Object.keys(section).length > 0
        ).length;
        
        setStrategicWheelProgress(Math.round((completedSections / 6) * 100));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getTrendIcon = () => {
    if (dashboardData.healthTrend === 'improving') {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else if (dashboardData.healthTrend === 'declining') {
      return <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />;
    }
    return <Activity className="w-5 h-5 text-gray-600" />;
  };

  const getTrendText = () => {
    if (dashboardData.healthTrend === 'improving') return 'Improving';
    if (dashboardData.healthTrend === 'declining') return 'Declining';
    return 'Stable';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">Business Coaching Platform</h1>
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-gray-900 hover:text-gray-600">Dashboard</Link>
                <Link href="/assessment" className="text-gray-600 hover:text-gray-900">Assessment</Link>
                <Link href="/strategic-wheel" className="text-gray-600 hover:text-gray-900">Strategic Wheel</Link>
                <Link href="/business-profile" className="text-gray-600 hover:text-gray-900">Business Profile</Link>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="text-gray-600 mt-2">
            {businessName ? `${businessName} Dashboard` : 'Your Business Dashboard'}
          </p>
        </div>

        {/* Current Status Summary */}
        {dashboardData.latestAssessment && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Current Business Status</h2>
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <span className="text-sm font-medium text-gray-600">{getTrendText()}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData.latestAssessment.percentage}%
                </p>
                <p className="text-sm text-gray-600 mt-1">Health Score</p>
                {dashboardData.scoreImprovement !== 0 && (
                  <p className={`text-xs mt-1 ${dashboardData.scoreImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardData.scoreImprovement > 0 ? '+' : ''}{dashboardData.scoreImprovement}% overall
                  </p>
                )}
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${getHealthStatusColor(dashboardData.latestAssessment.health_status)}`}>
                  {dashboardData.latestAssessment.health_status}
                </p>
                <p className="text-sm text-gray-600 mt-2">Health Status</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Building2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${getRevenueStageColor(dashboardData.latestAssessment.revenue_stage)}`}>
                  {dashboardData.latestAssessment.revenue_stage}
                </p>
                <p className="text-sm text-gray-600 mt-2">Revenue Stage</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">
                  {dashboardData.totalAssessments}
                </p>
                <p className="text-sm text-gray-600 mt-1">Assessments</p>
                <p className="text-xs text-gray-500 mt-1">Avg: {dashboardData.averageScore}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Top Recommendations for Growth
                </h3>
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">{index + 1}.</span>
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Chart and Assessment History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProgressChart assessments={dashboardData.assessments} />
          <AssessmentHistory assessments={dashboardData.assessments} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/assessment"
            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-blue-600" />
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h4 className="font-medium text-gray-900">
              {dashboardData.totalAssessments > 0 ? 'Retake' : 'Start'} Assessment
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {dashboardData.totalAssessments > 0 ? 'Track your progress' : 'Get your baseline'}
            </p>
          </Link>

          <Link
            href="/strategic-wheel"
            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-green-600" />
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h4 className="font-medium text-gray-900">Strategic Planning</h4>
            <p className="text-xs text-gray-500 mt-1">{strategicWheelProgress}% complete</p>
          </Link>

          <Link
            href="/business-profile"
            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-6 h-6 text-purple-600" />
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h4 className="font-medium text-gray-900">Business Profile</h4>
            <p className="text-xs text-gray-500 mt-1">Complete for AI insights</p>
          </Link>

          <button className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all group text-left">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 text-orange-600" />
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
            </div>
            <h4 className="font-medium text-gray-900">90-Day Goals</h4>
            <p className="text-xs text-gray-500 mt-1">Coming soon</p>
          </button>
        </div>

        {/* Methodology Cards */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue Your Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Keep your existing methodology cards here */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                {dashboardData.latestAssessment ? `${dashboardData.latestAssessment.percentage}% Score` : 'Not Started'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Diagnostic Assessment
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Comprehensive business health check across all key areas
            </p>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {dashboardData.totalAssessments > 0 ? 'Update' : 'Start'} Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                {strategicWheelProgress}% Complete
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Strategic Wheel
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Build your 6-component strategic foundation for success
            </p>
            <Link
              href="/strategic-wheel"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue Planning
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">
                Q{Math.ceil((new Date().getMonth() + 1) / 3)} {new Date().getFullYear()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              90-Day Goals
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Set and track your quarterly priorities and key results
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Set Goals
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 bg-gray-100 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            More Features Coming Soon
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're building additional modules including Success Disciplines, Achievement Engine, 
            Daily Excellence Tracker, and more to help you build a thriving business.
          </p>
        </div>
      </main>
    </div>
  );
}