'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  ArrowLeft, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Target,
  Award,
  BarChart3,
  Users,
  DollarSign,
  Brain
} from 'lucide-react';

interface AssessmentResult {
  id: string;
  created_at: string;
  health_score: number;
  revenue_stage: string;
  foundation_score: number;
  strategic_wheel_score: number;
  profitability_score: number;
  engines_score: number;
  disciplines_score: number;
  answers: any;
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

  useEffect(() => {
    loadAssessment();
  }, []);

  async function loadAssessment() {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setAssessment(data);
    } catch (error) {
      console.error('Error loading assessment:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h2>
          <p className="text-gray-600 mb-4">This assessment could not be loaded.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate percentage and determine health status
  const healthPercentage = Math.round((assessment.health_score / 290) * 100);
  
  const getHealthStatus = (percentage: number) => {
    if (percentage >= 90) return { label: 'THRIVING', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 80) return { label: 'STRONG', color: 'text-green-500', bg: 'bg-green-50' };
    if (percentage >= 70) return { label: 'STABLE', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (percentage >= 60) return { label: 'BUILDING', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (percentage >= 50) return { label: 'STRUGGLING', color: 'text-red-500', bg: 'bg-red-50' };
    return { label: 'URGENT', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const healthStatus = getHealthStatus(healthPercentage);

  const getRevenueStageLabel = (stage: string) => {
    const stages: Record<string, string> = {
      'under_250k': 'Foundation Stage (Under $250K)',
      '250k_1m': 'Traction Stage ($250K - $1M)',
      '1m_3m': 'Scaling Stage ($1M - $3M)',
      '3m_5m': 'Optimization Stage ($3M - $5M)',
      '5m_10m': 'Leadership Stage ($5M - $10M)',
      'over_10m': 'Mastery Stage ($10M+)'
    };
    return stages[stage] || 'Unknown Stage';
  }; // FIXED: Added missing closing brace

  // Calculate section percentages
  const sections = [
    {
      name: 'Foundation',
      score: assessment.foundation_score || 0,
      max: 40,
      icon: Target,
      color: 'blue'
    },
    {
      name: 'Strategic Wheel',
      score: assessment.strategic_wheel_score || 0,
      max: 60,
      icon: Brain,
      color: 'purple'
    },
    {
      name: 'Profitability',
      score: assessment.profitability_score || 0,
      max: 30,
      icon: DollarSign,
      color: 'green'
    },
    {
      name: 'Business Engines',
      score: assessment.engines_score || 0,
      max: 100,
      icon: BarChart3,
      color: 'indigo'
    },
    {
      name: 'Success Disciplines',
      score: assessment.disciplines_score || 0,
      max: 60,
      icon: Award,
      color: 'yellow'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <div className="text-sm text-gray-500">
              Completed: {new Date(assessment.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Business Assessment Results
            </h1>
            <p className="text-gray-600">
              Comprehensive analysis of your business health and opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Score Circle */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${healthPercentage * 5.53} 553`}
                    className={healthStatus.color}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {healthPercentage}%
                  </div>
                  <div className={`text-sm font-semibold px-3 py-1 rounded-full ${healthStatus.bg} ${healthStatus.color}`}>
                    {healthStatus.label}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-lg font-semibold text-gray-900">
                  Overall Business Health
                </p>
                <p className="text-sm text-gray-600">
                  {assessment.health_score} out of 290 points
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {getRevenueStageLabel(assessment.revenue_stage)}
                </p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Score Breakdown</h3>
              {sections.map((section) => {
                const percentage = Math.round((section.score / section.max) * 100);
                const Icon = section.icon;
                
                return (
                  <div key={section.name} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Icon className={`w-5 h-5 mr-2 text-${section.color}-600`} />
                        <span className="font-medium text-gray-900">{section.name}</span>
                      </div>
                      <span className={`text-sm font-semibold ${
                        percentage >= 80 ? 'text-green-600' :
                        percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percentage >= 80 ? 'bg-green-500' :
                          percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {section.score}/{section.max} points
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <Target className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Key Recommendations</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Priority Areas */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-900">Priority Areas</h3>
              </div>
              <ul className="text-sm text-red-800 space-y-2">
                {sections
                  .filter(section => (section.score / section.max) < 0.6)
                  .map(section => (
                    <li key={section.name} className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                      Focus on {section.name}
                    </li>
                  ))
                }
              </ul>
            </div>

            {/* Strengths */}
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-900">Your Strengths</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-2">
                {sections
                  .filter(section => (section.score / section.max) >= 0.8)
                  .map(section => (
                    <li key={section.name} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Strong {section.name}
                    </li>
                  ))
                }
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <div className="flex items-center mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-900">Next Steps</h3>
              </div>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Set specific improvement goals
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Focus on priority areas first
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Schedule regular progress reviews
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Ready to Take Action?</h2>
            <p className="text-blue-100">
              Transform your assessment insights into actionable business improvements
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/strategic-goals')}
              className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Set Strategic Goals
            </button>
            <button
              onClick={() => router.push('/assessment')}
              className="bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}