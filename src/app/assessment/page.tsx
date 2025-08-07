'use client';

import { useState } from 'react';

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const questions = [
    {
      id: 'revenue_stage',
      question: "What's your current annual revenue?",
      options: [
        { value: 'under_250k', label: 'Under $250K (Foundation Stage)' },
        { value: '250k_1m', label: '$250K - $1M (Traction Stage)' },
        { value: '1m_3m', label: '$1M - $3M (Scaling Stage)' },
        { value: '3m_5m', label: '$3M - $5M (Optimization Stage)' },
        { value: '5m_10m', label: '$5M - $10M (Leadership Stage)' },
        { value: '10m_plus', label: '$10M+ (Mastery Stage)' }
      ]
    },
    {
      id: 'profit_margin',
      question: "What's your current profit margin?",
      options: [
        { value: 'losing_money', label: 'Losing money' },
        { value: 'breaking_even', label: 'Breaking even (0-5%)' },
        { value: 'small_profit', label: 'Small profit (5-10%)' },
        { value: 'healthy_profit', label: 'Healthy profit (10-15%)' },
        { value: 'strong_profit', label: 'Strong profit (15-20%)' },
        { value: 'exceptional_profit', label: 'Exceptional profit (20%+)' }
      ]
    },
    {
      id: 'owner_salary',
      question: "Are you paying yourself a market-rate salary consistently?",
      options: [
        { value: 'rarely_take_money', label: 'No - rarely take money out' },
        { value: 'when_cash_allows', label: 'Sometimes - when cash flow allows' },
        { value: 'below_market', label: 'Yes - regular salary below market' },
        { value: 'market_rate', label: 'Yes - full market-rate salary' },
        { value: 'salary_plus_profit', label: 'Yes - salary plus profit distributions' }
      ]
    },
    {
      id: 'team_size',
      question: "How many people work in your business?",
      options: [
        { value: 'just_me', label: 'Just me' },
        { value: '2_5_people', label: '2-5 people' },
        { value: '6_15_people', label: '6-15 people' },
        { value: '16_50_people', label: '16-50 people' },
        { value: '50_plus', label: '50+ people' }
      ]
    },
    {
      id: 'business_dependency',
      question: "How dependent is the business on you personally?",
      options: [
        { value: 'completely_dependent', label: 'Completely - stops without me' },
        { value: 'very_dependent', label: 'Very - needs me for most decisions' },
        { value: 'somewhat_dependent', label: 'Somewhat - can run for short periods' },
        { value: 'minimal_dependency', label: 'Minimal - runs well without me' }
      ]
    },
    {
      id: 'revenue_predictability',
      question: "How predictable is your monthly revenue?",
      options: [
        { value: 'unpredictable', label: 'Completely unpredictable - varies wildly' },
        { value: 'somewhat_predictable', label: 'Somewhat predictable - within 50%' },
        { value: 'very_predictable', label: 'Very predictable - within 25%' },
        { value: 'extremely_predictable', label: 'Extremely predictable - recurring revenue' }
      ]
    }
  ];

  const totalQuestions = questions.length;
  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      alert('Assessment completed! Your responses: ' + JSON.stringify(responses, null, 2));
      window.location.href = '/dashboard';
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Business Foundation Assessment
          </h1>
          <p className="text-gray-600">
            Understanding your current position and fundamentals
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestionData.question}
          </h2>

          <div className="space-y-3">
            {currentQuestionData.options.map((option) => (
              <label 
                key={option.value}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={currentQuestionData.id}
                  value={option.value}
                  checked={responses[currentQuestionData.id] === option.value}
                  onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!responses[currentQuestionData.id]}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === totalQuestions - 1 ? 'Complete Assessment' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}