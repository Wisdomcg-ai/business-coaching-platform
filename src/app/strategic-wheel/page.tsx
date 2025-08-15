'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ComponentStatus {
  vision_purpose: boolean;
  strategy_market: boolean;
  people_culture: boolean;
  systems_execution: boolean;
  money_metrics: boolean;
  communications_alignment: boolean;
}

export default function StrategicWheel() {
  const [currentSection, setCurrentSection] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [completionStatus, setCompletionStatus] = useState<ComponentStatus>({
    vision_purpose: false,
    strategy_market: false,
    people_culture: false,
    systems_execution: false,
    money_metrics: false,
    communications_alignment: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    checkCompletionStatus();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
    } else {
      setUser(user);
    }
  };

  const checkCompletionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user.id)
        .single();

      if (!profile?.business_id) {
        setLoading(false);
        return;
      }

      const { data: wheel } = await supabase
        .from('strategic_wheels')
        .select('*')
        .eq('business_id', profile.business_id)
        .single();

      if (wheel) {
        // Check each component - fix vision_purpose check
        const hasVisionPurpose = wheel.vision_purpose && 
          (typeof wheel.vision_purpose === 'object' && Object.keys(wheel.vision_purpose).length > 0);
        
        const hasStrategyMarket = wheel.strategy_market && 
          (typeof wheel.strategy_market === 'object' && Object.keys(wheel.strategy_market).length > 0);
        
        const hasPeopleCulture = wheel.people_culture && 
          (typeof wheel.people_culture === 'object' && Object.keys(wheel.people_culture).length > 0);
        
        const hasSystemsExecution = wheel.systems_execution && 
          (typeof wheel.systems_execution === 'object' && Object.keys(wheel.systems_execution).length > 0);
        
        const hasMoneyMetrics = wheel.money_metrics && 
          (typeof wheel.money_metrics === 'object' && Object.keys(wheel.money_metrics).length > 0);
        
        const hasCommunications = wheel.communications_alignment && 
          (typeof wheel.communications_alignment === 'object' && Object.keys(wheel.communications_alignment).length > 0);

        console.log('Vision Purpose data:', wheel.vision_purpose);
        console.log('Has Vision Purpose:', hasVisionPurpose);

        setCompletionStatus({
          vision_purpose: hasVisionPurpose,
          strategy_market: hasStrategyMarket,
          people_culture: hasPeopleCulture,
          systems_execution: hasSystemsExecution,
          money_metrics: hasMoneyMetrics,
          communications_alignment: hasCommunications
        });
      }
    } catch (error) {
      console.error('Error checking completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    const completed = Object.values(completionStatus).filter(Boolean).length;
    return Math.round((completed / 6) * 100);
  };

  const getStatusText = (isComplete: boolean) => {
    return isComplete ? '✓ Completed' : 'Not started';
  };

  const getStatusColor = (isComplete: boolean) => {
    return isComplete ? 'text-green-600' : 'text-gray-400';
  };

  const components = [
    {
      id: 1,
      title: 'Vision & Purpose',
      description: 'Define why your business exists and where it\'s going',
      icon: '💡',
      link: '/strategic-wheel/vision-purpose',
      field: 'vision_purpose' as keyof ComponentStatus
    },
    {
      id: 2,
      title: 'Strategy & Market',
      description: 'Identify your target market and competitive advantage',
      icon: '🎯',
      link: '/strategic-wheel/strategy-market',
      field: 'strategy_market' as keyof ComponentStatus
    },
    {
      id: 3,
      title: 'People & Culture',
      description: 'Build your team and define your culture',
      icon: '👥',
      link: '/strategic-wheel/people-culture',
      field: 'people_culture' as keyof ComponentStatus
    },
    {
      id: 4,
      title: 'Systems & Execution',
      description: 'Design your core processes and execution rhythm',
      icon: '⚙️',
      link: '/strategic-wheel/systems-execution',
      field: 'systems_execution' as keyof ComponentStatus
    },
    {
      id: 5,
      title: 'Money & Metrics',
      description: 'Set financial goals and key performance indicators',
      icon: '📊',
      link: '/strategic-wheel/money-metrics',
      field: 'money_metrics' as keyof ComponentStatus
    },
    {
      id: 6,
      title: 'Communications & Alignment',
      description: 'Establish team alignment and meeting rhythms',
      icon: '💬',
      link: '/strategic-wheel/communications-alignment',
      field: 'communications_alignment' as keyof ComponentStatus
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </Link>
            <div className="text-2xl font-bold text-blue-600">
              {getCompletionPercentage()}% Complete
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Strategic Wheel</h1>
          <p className="text-gray-600">Build your comprehensive business strategy across 6 key components</p>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {components.map((component) => (
            <Link
              key={component.id}
              href={component.link}
              className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${
                completionStatus[component.field] ? 'border-2 border-green-500' : 'border-2 border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{component.icon}</span>
                {completionStatus[component.field] && (
                  <span className="text-green-600 text-2xl">✓</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {component.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {component.description}
              </p>
              <div className="flex justify-end">
                <span className="text-blue-600 hover:text-blue-700">
                  {completionStatus[component.field] ? 'Edit →' : 'Start →'}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Progress List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <div className="space-y-3">
            {components.map((component) => (
              <div key={component.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    completionStatus[component.field] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {component.id}
                  </div>
                  <span className="font-medium">{component.title}</span>
                </div>
                <span className={`text-sm ${getStatusColor(completionStatus[component.field])}`}>
                  {getStatusText(completionStatus[component.field])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        {getCompletionPercentage() === 100 && (
          <div className="mt-8 bg-green-50 border-2 border-green-500 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              🎉 Congratulations! Strategic Wheel Complete!
            </h2>
            <p className="text-green-700 mb-4">
              You've completed all 6 components of your Strategic Wheel. Next steps:
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/success-disciplines')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Continue to Success Disciplines →
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
