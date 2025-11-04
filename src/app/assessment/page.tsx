'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Question {
  id: string;
  text: string;
  type: 'radio';
  options: { value: string; label: string; points: number }[];
  section: string;
  subsection?: string;
}

const questions: Question[] = [
  // ==========================================
  // SECTION 1: BUSINESS FOUNDATION (5 questions, 50 points)
  // ==========================================
  
  {
    id: 'q1',
    text: 'Are you paying yourself a market-rate salary consistently?',
    type: 'radio',
    section: 'Business Foundation',
    options: [
      { value: 'no_rarely', label: 'No - rarely take money out', points: 0 },
      { value: 'sometimes', label: 'Sometimes - when cash flow allows', points: 3 },
      { value: 'yes_below', label: 'Yes - regular salary below market', points: 5 },
      { value: 'yes_full', label: 'Yes - full market-rate salary', points: 8 },
      { value: 'yes_plus_profit', label: 'Yes - salary plus profit distributions', points: 10 }
    ]
  },
  {
    id: 'q2',
    text: 'How many people work in your business?',
    type: 'radio',
    section: 'Business Foundation',
    options: [
      { value: 'just_me', label: 'Just me', points: 2 },
      { value: '2_5', label: '2-5 people', points: 4 },
      { value: '6_15', label: '6-15 people', points: 6 },
      { value: '16_50', label: '16-50 people', points: 8 },
      { value: '50_plus', label: '50+ people', points: 10 }
    ]
  },
  {
    id: 'q3',
    text: 'How dependent is the business on you personally?',
    type: 'radio',
    section: 'Business Foundation',
    options: [
      { value: 'completely', label: 'Completely - stops without me', points: 0 },
      { value: 'very', label: 'Very - needs me for most decisions', points: 3 },
      { value: 'somewhat', label: 'Somewhat - can run for short periods', points: 7 },
      { value: 'minimal', label: 'Minimal - runs well without me for weeks', points: 10 }
    ]
  },
  {
    id: 'q4',
    text: 'How predictable is your monthly revenue?',
    type: 'radio',
    section: 'Business Foundation',
    options: [
      { value: 'unpredictable', label: 'Completely unpredictable - varies wildly', points: 0 },
      { value: 'somewhat_50', label: 'Somewhat predictable - within 50%', points: 3 },
      { value: 'very_25', label: 'Very predictable - within 25%', points: 7 },
      { value: 'extremely_recurring', label: 'Extremely predictable - recurring revenue model', points: 10 }
    ]
  },
  {
    id: 'q5',
    text: 'If you wanted to sell your business tomorrow, could you?',
    type: 'radio',
    section: 'Business Foundation',
    options: [
      { value: 'no_dependent', label: 'No - too dependent on me', points: 0 },
      { value: 'maybe_work', label: 'Maybe - but needs significant work', points: 3 },
      { value: 'probably_prep', label: 'Probably - would need 6-12 months prep', points: 7 },
      { value: 'yes_ready', label: 'Yes - it\'s sale-ready today', points: 10 }
    ]
  },

  // ==========================================
  // SECTION 2: STRATEGIC CLARITY (7 questions, 70 points)
  // ==========================================
  
  {
    id: 'q6',
    text: 'How clear and compelling is your business vision?',
    type: 'radio',
    section: 'Strategic Clarity',
    options: [
      { value: 'very_unclear', label: 'Very unclear - no defined direction', points: 0 },
      { value: 'somewhat_clear', label: 'Somewhat clear - general idea only', points: 3 },
      { value: 'clear', label: 'Clear - team understands it', points: 7 },
      { value: 'crystal_clear', label: 'Crystal clear - guides all decisions', points: 10 }
    ]
  },
  {
    id: 'q7',
    text: 'How well-defined is your target market and ideal customer?',
    type: 'radio',
    section: 'Strategic Clarity',
    options: [
      { value: 'anyone', label: 'Serve anyone who will pay', points: 0 },
      { value: 'general', label: 'General target market defined', points: 3 },
      { value: 'specific', label: 'Specific ideal customer profile', points: 7 },
      { value: 'laser_focused', label: 'Laser-focused with clear differentiation', points: 10 }
    ]
  },
  {
    id: 'q8',
    text: 'Do you have a sustainable competitive advantage?',
    type: 'radio',
    section: 'Strategic Clarity',
    options: [
      { value: 'price_only', label: 'Compete mainly on price', points: 0 },
      { value: 'some_differentiation', label: 'Some differentiation', points: 3 },
      { value: 'clear_value', label: 'Clear unique value proposition', points: 7 },
      { value: 'dominant', label: 'Dominant position with defensible moats', points: 10 }
    ]
  },
  {
    id: 'q9',
    text: 'When did you last launch a new product/service/offering?',
    type: 'radio',
    section: 'Strategic Clarity',
    options: [
      { value: 'over_2years', label: 'Over 2 years ago or never', points: 0 },
      { value: '1_2_years', label: '1-2 years ago', points: 3 },
      { value: 'last_year', label: 'Within the last year', points: 7 },
      { value: 'last_6months', label: 'Within the last 6 months', points: 10 }
    ]
  },
  {
    id: 'q10',
    text: 'How strong is your team and culture?',
    type: 'radio',
    section: 'Strategic Clarity',
    options: [
      { value: 'struggling', label: 'Struggling with people issues', points: 0 },
      { value: 'adequate', label: 'Adequate team, developing culture', points: 3 },
      { value: 'good', label: 'Good team, positive culture', points: 7 },
      { value: 'excellent', label: 'A-players with exceptional culture', points: 10 }
    ]
  },
  {
    id: 'q11',
    text: 'How systematic is your business execution?',
    type: 'radio',
    section: 'Strategic Clarity',
    options: [
      { value: 'adhoc', label: 'Ad hoc, reactive approach', points: 0 },
      { value: 'some_systems', label: 'Some systems, inconsistent execution', points: 3 },
      { value: 'good_systems', label: 'Good systems, reliable execution', points: 7 },
      { value: 'exceptional', label: 'Exceptional systems and execution', points: 10 }
    ]
  },
  {
    id: 'q12',
    text: 'How well do you track business performance with metrics?',
    type: 'radio',
    section: 'Strategic Clarity',
    options: [
      { value: 'dont_track', label: 'Don\'t track metrics systematically', points: 0 },
      { value: 'monthly', label: 'Track basic metrics monthly', points: 3 },
      { value: 'weekly', label: 'Weekly dashboard review', points: 7 },
      { value: 'daily', label: 'Real-time dashboard reviewed daily', points: 10 }
    ]
  },

  // ==========================================
  // SECTION 3: BUSINESS ENGINES (18 questions, 180 points)
  // ==========================================

  // ATTRACT ENGINE (3 questions, 30 points)
  {
    id: 'q13',
    text: 'How many qualified leads do you generate monthly?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Attract Engine',
    options: [
      { value: 'under_20', label: 'Under 20 leads or don\'t track', points: 2 },
      { value: '20_50', label: '20-50 leads', points: 5 },
      { value: '50_100', label: '50-100 leads', points: 8 },
      { value: 'over_100', label: '100+ leads', points: 10 }
    ]
  },
  {
    id: 'q14',
    text: 'How many reliable marketing channels generate leads?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Attract Engine',
    options: [
      { value: 'none', label: 'No consistent channels', points: 0 },
      { value: '1_2', label: '1-2 inconsistent sources', points: 3 },
      { value: '3_4', label: '3-4 regular sources', points: 7 },
      { value: '5_plus', label: '5+ systematic channels', points: 10 }
    ]
  },
  {
    id: 'q15',
    text: 'How sophisticated is your lead generation system?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Attract Engine',
    options: [
      { value: 'adhoc', label: 'Ad hoc/inconsistent', points: 0 },
      { value: 'track_no_nurture', label: 'Track leads but no nurture system', points: 3 },
      { value: 'crm_nurture', label: 'Have CRM + email nurture sequences', points: 7 },
      { value: 'full_automation', label: 'Full marketing automation with attribution', points: 10 }
    ]
  },

  // CONVERT ENGINE (3 questions, 30 points)
  {
    id: 'q16',
    text: 'What\'s your lead-to-customer conversion rate?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Convert Engine',
    options: [
      { value: 'under_15', label: 'Under 15% or don\'t track', points: 2 },
      { value: '15_25', label: '15-25%', points: 5 },
      { value: '25_40', label: '25-40%', points: 8 },
      { value: 'over_40', label: 'Over 40%', points: 10 }
    ]
  },
  {
    id: 'q17',
    text: 'How long is your average sales cycle?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Convert Engine',
    options: [
      { value: 'dont_know', label: 'Don\'t know/varies wildly', points: 0 },
      { value: 'over_6months', label: 'Over 6 months (long, complex)', points: 3 },
      { value: '1_6months', label: '1-6 months (moderate)', points: 6 },
      { value: 'under_1month', label: 'Under 1 month (efficient)', points: 8 },
      { value: 'same_day', label: 'Same day/week (transactional)', points: 10 }
    ]
  },
  {
    id: 'q18',
    text: 'How effective is your sales process?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Convert Engine',
    options: [
      { value: 'no_process', label: 'No formal sales process', points: 0 },
      { value: 'basic', label: 'Basic process, inconsistent follow-up', points: 3 },
      { value: 'documented', label: 'Documented process with objection handling', points: 7 },
      { value: 'optimized', label: 'Optimized process with upsells and tracking', points: 10 }
    ]
  },

  // DELIVER ENGINE (5 questions, 50 points)
  {
    id: 'q19',
    text: 'What percentage of customers are delighted with your delivery?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Deliver Engine',
    options: [
      { value: 'under_60', label: 'Under 60% or don\'t know', points: 0 },
      { value: '60_75', label: '60-75%', points: 3 },
      { value: '75_90', label: '75-90%', points: 7 },
      { value: 'over_90', label: 'Over 90%', points: 10 }
    ]
  },
  {
    id: 'q20',
    text: 'How systematized is your customer experience?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Deliver Engine',
    options: [
      { value: 'wing_it', label: 'Wing it, reactive service', points: 0 },
      { value: 'basic_onboarding', label: 'Basic onboarding process', points: 3 },
      { value: 'mapped_journey', label: 'Mapped customer journey with touchpoints', points: 7 },
      { value: 'measure_improve', label: 'Systematically measure and improve NPS', points: 10 }
    ]
  },
  {
    id: 'q21',
    text: 'What % of your revenue comes from repeat customers?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Deliver Engine',
    options: [
      { value: 'dont_know', label: 'I don\'t know', points: 0 },
      { value: 'under_20', label: 'Under 20% (mostly transactional)', points: 2 },
      { value: '20_40', label: '20-40% (some repeat business)', points: 5 },
      { value: '40_60', label: '40-60% (good retention)', points: 8 },
      { value: 'over_60', label: 'Over 60% (strong loyalty)', points: 10 }
    ]
  },
  {
    id: 'q22',
    text: 'How strategic is your approach to talent?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Deliver Engine',
    options: [
      { value: 'reactive', label: 'Reactive hiring when desperate', points: 0 },
      { value: 'basic', label: 'Basic hiring process', points: 3 },
      { value: 'good', label: 'Good hiring with defined criteria', points: 7 },
      { value: 'systematic', label: 'Systematic recruitment of A-players', points: 10 }
    ]
  },
  {
    id: 'q23',
    text: 'How comprehensive is your process documentation?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Deliver Engine',
    options: [
      { value: 'in_heads', label: 'Most processes exist only in people\'s heads', points: 0 },
      { value: 'some_documented', label: 'Some processes documented', points: 3 },
      { value: 'most_documented', label: 'Most key processes documented', points: 7 },
      { value: 'all_optimized', label: 'All processes documented and optimized', points: 10 }
    ]
  },

  // FINANCE ENGINE (7 questions, 70 points)
  {
    id: 'q24',
    text: 'How would you describe your cash flow situation?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Finance Engine',
    options: [
      { value: 'stressed', label: 'Constantly stressed about paying bills', points: 0 },
      { value: 'occasional_crunches', label: 'Occasional cash crunches, tight months', points: 3 },
      { value: 'stable', label: 'Generally stable, manageable fluctuations', points: 7 },
      { value: 'strong_reserves', label: 'Strong reserves, never worry about cash', points: 10 }
    ]
  },
  {
    id: 'q25',
    text: 'What % of revenue comes from your top 3 customers?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Finance Engine',
    options: [
      { value: 'dont_know', label: 'I don\'t know', points: 0 },
      { value: 'over_50', label: 'More than 50% (high concentration risk)', points: 2 },
      { value: '30_50', label: '30-50% (moderate concentration)', points: 5 },
      { value: '20_30', label: '20-30% (healthy diversification)', points: 8 },
      { value: 'under_20', label: 'Less than 20% (excellent diversification)', points: 10 }
    ]
  },
  {
    id: 'q26',
    text: 'When did you last increase prices?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Finance Engine',
    options: [
      { value: 'never_2years', label: 'Never or over 2 years ago', points: 0 },
      { value: '1_2_years', label: '1-2 years ago', points: 3 },
      { value: '6_12_months', label: '6-12 months ago', points: 7 },
      { value: 'within_6', label: 'Within last 6 months', points: 10 }
    ]
  },
  {
    id: 'q27',
    text: 'What\'s your revenue growth rate over the past 12 months?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Finance Engine',
    options: [
      { value: 'declining', label: 'Declining revenue', points: 0 },
      { value: 'flat', label: 'Flat or minimal growth (0-10%)', points: 3 },
      { value: 'moderate', label: 'Moderate growth (10-25%)', points: 6 },
      { value: 'strong', label: 'Strong growth (25-50%)', points: 8 },
      { value: 'rapid', label: 'Rapid growth (50%+)', points: 10 }
    ]
  },
  {
    id: 'q28',
    text: 'What % of revenue do you invest in marketing?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Finance Engine',
    options: [
      { value: '0_2', label: '0-2% or don\'t know', points: 0 },
      { value: '3_5', label: '3-5% (survival mode)', points: 3 },
      { value: '6_10', label: '6-10% (growth oriented)', points: 7 },
      { value: 'over_10', label: '10%+ (aggressive growth)', points: 10 }
    ]
  },
  {
    id: 'q29',
    text: 'Do you know your Customer Acquisition Cost (CAC) vs Lifetime Value (LTV)?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Finance Engine',
    options: [
      { value: 'no_idea', label: 'No idea what these mean', points: 0 },
      { value: 'heard_dont_track', label: 'Heard of them but don\'t track', points: 2 },
      { value: 'track_poor', label: 'Track but ratio isn\'t great', points: 5 },
      { value: 'yes_3x', label: 'Yes - LTV is 3x+ CAC', points: 10 }
    ]
  },
  {
    id: 'q30',
    text: 'How sophisticated is your financial management?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Finance Engine',
    options: [
      { value: 'react_balance', label: 'React to bank balance, no forecasting or expense control', points: 0 },
      { value: 'track_basic', label: 'Track P&L monthly, basic budgeting and expense reviews', points: 3 },
      { value: 'forecast_variance', label: '13-week cash flow forecast, variance analysis, disciplined expenses', points: 7 },
      { value: 'rolling_profitability', label: 'Rolling forecasts, profitability by product/customer, full visibility', points: 10 }
    ]
  }
];

export default function AssessmentPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  const sections = ['Business Foundation', 'Strategic Clarity', 'Business Engines'];
  const currentSection = currentQuestion.section;
  const currentSectionIndex = sections.indexOf(currentSection);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && answers[currentQuestion.id]) {
        if (currentQuestionIndex < questions.length - 1) {
          goToNext();
        } else {
          handleSubmit();
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentQuestionIndex, answers, currentQuestion]);

  function handleAnswer(value: string, points: number) {
    setAnswers({
      ...answers,
      [currentQuestion.id]: { 
        value, 
        points,
        question: currentQuestion.text 
      }
    });
  }

  function goToPrevious() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }

  function goToNext() {
    if (answers[currentQuestion.id] && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  function isCurrentQuestionAnswered(): boolean {
    return !!answers[currentQuestion.id];
  }

  function calculateSectionScores() {
    const sectionScores: Record<string, number> = {
      foundation: 0,      // Max: 50 points
      strategic: 0,       // Max: 70 points
      engines: 0          // Max: 180 points
    };

    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      
      if (question) {
        const points = answer.points || 0;
        
        switch(question.section) {
          case 'Business Foundation':
            sectionScores.foundation += points;
            break;
          case 'Strategic Clarity':
            sectionScores.strategic += points;
            break;
          case 'Business Engines':
            sectionScores.engines += points;
            break;
        }
      }
    });

    return sectionScores;
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError('Please log in to save your assessment');
        setIsSubmitting(false);
        return;
      }

      // Calculate scores
      const sectionScores = calculateSectionScores();
      const totalScore = Object.values(sectionScores).reduce((sum, score) => sum + score, 0);
      const maxScore = 300;
      const percentage = Math.round((totalScore / maxScore) * 100);
      
      // Determine health status
      let healthStatus = '';
      if (percentage >= 90) healthStatus = 'THRIVING';
      else if (percentage >= 80) healthStatus = 'STRONG';
      else if (percentage >= 70) healthStatus = 'STABLE';
      else if (percentage >= 60) healthStatus = 'BUILDING';
      else if (percentage >= 50) healthStatus = 'STRUGGLING';
      else healthStatus = 'URGENT';

      // Save to Supabase - using existing database columns
      const { data: assessment, error: dbError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          answers: answers,
          total_score: Math.round(totalScore),
          percentage: percentage,
          health_status: healthStatus,
          foundation_score: Math.round(sectionScores.foundation),
          strategic_wheel_score: Math.round(sectionScores.strategic),
          profitability_score: 0,
          engines_score: Math.round(sectionScores.engines),
          disciplines_score: 0,
          foundation_max: 50,
          strategic_wheel_max: 70,
          profitability_max: 0,
          engines_max: 180,
          disciplines_max: 0,
          total_max: maxScore,
          completed_at: new Date().toISOString(),
          status: 'completed'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        setError('Failed to save assessment: ' + dbError.message);
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Assessment saved:', assessment.id);
      router.push(`/dashboard/assessment-results?id=${assessment.id}`);
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setError('Failed to save assessment. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Assessment</h1>
              <p className="text-sm text-gray-600 mt-1">
                30 questions • 12-15 minutes
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100"
            >
              Exit
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">
                Section {currentSectionIndex + 1} of {sections.length}: <span className="font-medium">{currentSection}</span>
              </span>
              <span className="text-gray-900 font-medium">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-center text-xs text-gray-500 mt-1">
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 text-sm font-medium">
                {currentQuestion.subsection || currentSection}
              </span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="p-8">
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value, option.points)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group ${
                    answers[currentQuestion.id]?.value === option.value
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg transform scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                      answers[currentQuestion.id]?.value === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400 group-hover:border-gray-500'
                    }`}>
                      {answers[currentQuestion.id]?.value === option.value && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className={`text-lg ${
                      answers[currentQuestion.id]?.value === option.value
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow'
                }`}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </button>

              <span className="text-sm text-gray-500">
                Press <kbd className="px-2 py-1 bg-white rounded border border-gray-300 text-xs">Enter</kbd> to continue
              </span>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!isCurrentQuestionAnswered() || isSubmitting}
                  className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all ${
                    !isCurrentQuestionAnswered() || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Assessment
                      <Check className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={goToNext}
                  disabled={!isCurrentQuestionAnswered()}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                    !isCurrentQuestionAnswered()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}