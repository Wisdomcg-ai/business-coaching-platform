'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Target, Users, TrendingUp, Calendar, CheckCircle, Building2, ArrowRight } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [strategicWheelProgress, setStrategicWheelProgress] = useState(0);

  useEffect(() => {
    checkUser();
    loadDashboardData();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }

      // Get business info
      const { data: business } = await supabase
        .from('businesses')
        .select('name')
        .eq('owner_id', session.user.id)
        .single();

      if (business?.name) {
        setBusinessName(business.name);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get latest assessment score
      const { data: assessment } = await supabase
        .from('assessments')
        .select('total_score')
        .eq('completed_by', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (assessment) {
        setAssessmentScore(Math.round((assessment.total_score / 290) * 100));
      }

      // Get strategic wheel progress
      const { data: strategicWheel } = await supabase
        .from('strategic_wheels')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (strategicWheel) {
        // Calculate completion based on filled sections
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
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">
                {assessmentScore || 0}%
              </span>
            </div>
            <p className="text-gray-600 mt-2">Health Score</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <Target className="w-10 h-10 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-gray-600 mt-2">Active Goals</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-10 h-10 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">--</span>
            </div>
            <p className="text-gray-600 mt-2">Growth Rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-10 h-10 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-gray-600 mt-2">Tasks Complete</p>
          </div>
        </div>

        {/* Methodology Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Diagnostic Assessment Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                {assessmentScore ? `${assessmentScore}% Complete` : 'Not Started'}
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
              {assessmentScore ? 'Update' : 'Start'} Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Strategic Wheel Card */}
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

          {/* 90-Day Goals Card */}
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

          {/* Business Profile Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">
                NEW
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Business Profile
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Complete your comprehensive business profile to unlock AI-powered insights
            </p>
            <Link
              href="/business-profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Complete Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
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