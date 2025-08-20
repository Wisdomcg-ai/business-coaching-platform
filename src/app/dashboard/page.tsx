'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import { calculateSectionScores } from '@/lib/assessment-scoring';
import { 
  LayoutDashboard, 
  FileText, 
  Target, 
  TrendingUp, 
  Users, 
  Settings,
  ChevronRight,
  Plus,
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Eye
} from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Assessment = Database['public']['Tables']['assessments']['Row'];

interface SectionScore {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [latestScores, setLatestScores] = useState<SectionScore[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Get assessments
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (assessmentData) {
        setAssessments(assessmentData);
        
        // Calculate scores for the latest assessment
        if (assessmentData.length > 0 && assessmentData[0].answers) {
          const scores = calculateSectionScores(assessmentData[0].answers);
          setLatestScores(scores);
        }
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  function getHealthStatus(scores: SectionScore[]) {
    if (scores.length === 0) return { status: 'No Data', color: 'gray' };
    
    const avgPercentage = scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length;
    
    if (avgPercentage >= 80) return { status: 'Thriving', color: 'emerald' };
    if (avgPercentage >= 60) return { status: 'Stable', color: 'green' };
    if (avgPercentage >= 40) return { status: 'Building', color: 'yellow' };
    return { status: 'Needs Attention', color: 'red' };
  }

  function getActionableInsights() {
    const insights = [];
    
    if (latestScores.length > 0) {
      const lowestScore = [...latestScores].sort((a, b) => a.percentage - b.percentage)[0];
      if (lowestScore && lowestScore.percentage < 60) {
        insights.push({
          type: 'warning',
          title: `${lowestScore.name} needs attention`,
          description: `Currently at ${lowestScore.percentage}%. Focus here for quick wins.`,
          action: 'Create Action Plan'
        });
      }
      
      const highestScore = [...latestScores].sort((a, b) => b.percentage - a.percentage)[0];
      if (highestScore && highestScore.percentage >= 80) {
        insights.push({
          type: 'success',
          title: `${highestScore.name} is a strength`,
          description: `Performing at ${highestScore.percentage}%. Leverage this advantage.`,
          action: 'View Details'
        });
      }
    }
    
    if (assessments.length === 0) {
      insights.push({
        type: 'info',
        title: 'Complete your first assessment',
        description: 'Get a comprehensive view of your business health.',
        action: 'Start Assessment'
      });
    }
    
    return insights;
  }

  const healthStatus = getHealthStatus(latestScores);
  const insights = getActionableInsights();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Business Coaching Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {profile?.full_name || profile?.email || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Business Health Status</h2>
              <p className="text-gray-600 mt-1">Based on your latest assessment</p>
            </div>
            <div className={`px-6 py-3 rounded-full bg-${healthStatus.color}-100 text-${healthStatus.color}-700 font-semibold text-lg`}>
              {healthStatus.status}
            </div>
          </div>

          {/* Score Overview */}
          {latestScores.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              {latestScores.map((score, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{score.percentage}%</div>
                  <div className="text-xs text-gray-600 mt-1">{score.name}</div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${score.percentage >= 60 ? 'green' : 'yellow'}-500 transition-all duration-500`}
                      style={{ width: `${score.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => router.push('/assessment')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <Plus className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-1">New Assessment</h3>
            <p className="text-sm opacity-90">Start comprehensive evaluation</p>
          </button>

          <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
            <Target className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-1">Set Goals</h3>
            <p className="text-sm opacity-90">Define 90-day objectives</p>
          </button>

          <button className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
            <Users className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-1">Team Review</h3>
            <p className="text-sm opacity-90">Evaluate team performance</p>
          </button>

          <button className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
            <BarChart3 className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-1">View Analytics</h3>
            <p className="text-sm opacity-90">Deep dive into metrics</p>
          </button>
        </div>

        {/* Insights & Recommendations */}
        {insights.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actionable Insights</h2>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className={`flex items-start p-4 rounded-lg border ${
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  insight.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex-shrink-0 mr-3">
                    {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                    {insight.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {insight.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  </div>
                  <button className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-700">
                    {insight.action} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Assessment History</h2>
            <button
              onClick={() => router.push('/assessment')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All →
            </button>
          </div>

          {assessments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No assessments yet</p>
              <button
                onClick={() => router.push('/assessment')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Your First Assessment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.slice(0, 5).map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-12 rounded-full bg-${assessment.completion_percentage === 100 ? 'green' : 'yellow'}-500`} />
                    <div>
                      <p className="font-medium text-gray-900">
                        Assessment #{assessments.length - assessments.indexOf(assessment)}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {assessment.completion_percentage}% complete
                        </span>
                        {assessment.health_score && (
                          <span className="text-sm font-medium text-gray-700 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Score: {assessment.health_score}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/assessment/${assessment.id}`)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Results
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coaching Methodology Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Strategic Wheel</h3>
              <span className="text-xs text-gray-500">0% Complete</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Build your 6-component strategic foundation</p>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Success Disciplines</h3>
              <span className="text-xs text-gray-500">Not Started</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select your top 3 focus areas from 12 disciplines</p>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">90-Day Plan</h3>
              <span className="text-xs text-gray-500">Locked</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Create your Achievement Engine action plan</p>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Complete Assessment First
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}