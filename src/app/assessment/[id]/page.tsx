'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
  const supabase = createClientComponentClient();

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
  };

  // Calculate section percentages
  const sections = [
    { 
      name: 'Business Foundation', 
      score: assessment.foundation_score || 0, 
      max: 40,
      icon: <Target className="w-5 h-5" />,
      color: 'blue'
    },
    { 
      name: 'Strategic Wheel', 
      score: assessment.strategic_wheel_score || 0, 
      max: 60,
      icon: <Brain className="w-5 h-5" />,
      color: 'purple'
    },
    { 
      name: 'Profitability Health', 
      score: assessment.profitability_score || 0, 
      max: 30,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green'
    },
    { 
      name: 'Business Engines', 
      score: assessment.engines_score || 0, 
      max: 100,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'indigo'
    },
    { 
      name: 'Success Disciplines', 
      score: assessment.disciplines_score || 0, 
      max: 60,
      icon: <Award className="w-5 h-5" />,
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
                    {health