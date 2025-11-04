'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, TrendingUp, Target, AlertCircle, CheckCircle, Zap, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Assessment {
  id: string;
  created_at: string;
  total_score: number;
  percentage: number;
  health_status: string;
  foundation_score: number;
  strategic_wheel_score: number;
  engines_score: number;
  answers: Record<string, any>;
}

export default function AssessmentResultsPage() {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');

  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    } else {
      setError('No assessment ID provided');
      setLoading(false);
    }
  }, [assessmentId]);

  async function loadAssessment() {
    try {
      const supabase = createClient();
      
      const { data, error: dbError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        setError('Failed to load assessment results');
      } else {
        setAssessment(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load assessment results');
    } finally {
      setLoading(false);
    }
  }

  function getHealthStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'THRIVING': return 'bg-emerald-500';
      case 'STRONG': return 'bg-green-500';
      case 'STABLE': return 'bg-yellow-500';
      case 'BUILDING': return 'bg-orange-500';
      case 'STRUGGLING': return 'bg-red-400';
      case 'URGENT': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  }

  function getHealthStatusText(status: string): { title: string; description: string } {
    switch (status?.toUpperCase()) {
      case 'THRIVING':
        return {
          title: 'Thriving',
          description: 'Your business is firing on all cylinders! Let\'s focus on maintaining excellence and scaling strategically.'
        };
      case 'STRONG':
        return {
          title: 'Strong',
          description: 'Solid foundation in place. We\'ll work together to optimize key areas and accelerate growth.'
        };
      case 'STABLE':
        return {
          title: 'Stable',
          description: 'Good progress with clear improvement opportunities. Let\'s prioritize the highest-impact areas.'
        };
      case 'BUILDING':
        return {
          title: 'Building',
          description: 'Foundation developing. We\'ll focus on strengthening critical business fundamentals together.'
        };
      case 'STRUGGLING':
        return {
          title: 'Struggling',
          description: 'Significant gaps identified. Let\'s create an action plan to address the most critical areas first.'
        };
      case 'URGENT':
        return {
          title: 'Urgent',
          description: 'Critical issues identified. We\'ll work closely together to stabilize and strengthen your foundation.'
        };
      default:
        return { title: 'Unknown', description: 'Assessment status not available' };
    }
  }

  function getSectionRecommendations(section: string, score: number, max: number): string[] {
    const percentage = (score / max) * 100;
    
    if (percentage >= 80) {
      return [`Excellent! Let's maintain this strength and look for optimization opportunities.`];
    } else if (percentage >= 60) {
      return [`Good progress. We'll focus on refining and optimizing these areas.`];
    } else if (percentage >= 40) {
      return [`Priority improvement area. We'll create a focused action plan for this section.`];
    } else {
      return [`Critical gap. This will be a primary focus in our coaching sessions.`];
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Results</h2>
          <p className="text-gray-600 mb-6">{error || 'Assessment not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const healthStatus = getHealthStatusText(assessment.health_status);
  const sections = [
    {
      name: 'Business Foundation',
      score: assessment.foundation_score,
      max: 50,
      icon: Target,
      color: 'blue',
      description: 'Core business fundamentals and readiness'
    },
    {
      name: 'Strategic Clarity',
      score: assessment.strategic_wheel_score,
      max: 70,
      icon: TrendingUp,
      color: 'purple',
      description: 'Vision, strategy, and execution systems'
    },
    {
      name: 'Business Engines',
      score: assessment.engines_score,
      max: 180,
      icon: Zap,
      color: 'green',
      description: 'Marketing, sales, delivery, and finance operations'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Business Assessment Results
            </h1>
            <p className="text-gray-600">
              Completed on {new Date(assessment.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Overall Score Circle */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
            <div className="relative">
              <svg className="w-64 h-64 transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className={getHealthStatusColor(assessment.health_status)}
                  strokeDasharray={`${(assessment.percentage / 100) * 704} 704`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-gray-900">{assessment.percentage}%</div>
                <div className="text-gray-600 text-lg mt-2">{assessment.total_score}/300</div>
              </div>
            </div>

            <div className="text-center md:text-left max-w-md">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-white font-semibold mb-4 ${getHealthStatusColor(assessment.health_status)}`}>
                <Award className="w-5 h-5 mr-2" />
                {healthStatus.title}
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {healthStatus.description}
              </p>
            </div>
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
            Section Breakdown
          </h2>

          <div className="space-y-6">
            {sections.map((section) => {
              const percentage = Math.round((section.score / section.max) * 100);
              const Icon = section.icon;
              
              return (
                <div key={section.name} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-${section.color}-100`}>
                        <Icon className={`w-6 h-6 text-${section.color}-600`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{section.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{section.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{section.score}/{section.max}</div>
                      <div className={`text-sm font-medium ${
                        percentage >= 80 ? 'text-green-600' :
                        percentage >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          percentage >= 80 ? 'bg-green-500' :
                          percentage >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {percentage >= 80 ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p>{getSectionRecommendations(section.name, section.score, section.max)[0]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Your Next Steps</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-full p-2 mt-1">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Review & Discuss</h3>
                <p className="text-blue-100">We'll review these results together in your next coaching session and identify quick wins.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-full p-2 mt-1">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Prioritize Actions</h3>
                <p className="text-blue-100">We'll create a focused 90-day action plan targeting your highest-impact opportunities.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-full p-2 mt-1">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Track Progress</h3>
                <p className="text-blue-100">Use the platform tools to implement changes and measure improvement over time.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full md:w-auto px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}