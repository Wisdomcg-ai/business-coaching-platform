'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'
import { getNextSection, getPreviousSection, strategicWheelSections } from '@/lib/strategic-wheel-navigation';

interface StrategyMarketData {
  target_demographics: string;
  target_problems: string;
  target_location: string;
  uvp_statement: string;
  uvp_framework_choice: 'option1' | 'option2' | '';
  competitive_advantage: string;
  market_size: string;
  market_approach: string;
  key_differentiators: string;
  market_leadership_path: string;
  competitor_1_name: string;
  competitor_1_advantage: string;
  competitor_2_name: string;
  competitor_2_advantage: string;
  competitor_3_name: string;
  competitor_3_advantage: string;
  usp_defined: boolean;
  usps_list: string;
}

interface AISuggestions {
  [key: string]: string;
}

export default function StrategyMarketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions>({});
  const [businessContext, setBusinessContext] = useState<any>({
    name: 'Your Business',
    industry: 'business',
    size: 'small'
  });
  const currentSection = 'strategy-market';
  
  const [formData, setFormData] = useState<StrategyMarketData>({
    target_demographics: '',
    target_problems: '',
    target_location: '',
    uvp_statement: '',
    uvp_framework_choice: '',
    competitive_advantage: '',
    market_size: '',
    market_approach: '',
    key_differentiators: '',
    market_leadership_path: '',
    competitor_1_name: '',
    competitor_1_advantage: '',
    competitor_2_name: '',
    competitor_2_advantage: '',
    competitor_3_name: '',
    competitor_3_advantage: '',
    usp_defined: false,
    usps_list: ''
  });

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('strategyMarketData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('strategyMarketData', JSON.stringify(formData));
      setLastSaved(new Date());
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  const getAISuggestion = async (fieldType: string) => {
    setAiLoading(fieldType);
    setAiSuggestions(prev => ({ ...prev, [fieldType]: '' }));

    try {
      // Simulate AI suggestion
      setTimeout(() => {
        const suggestions: { [key: string]: string } = {
          target_demographics: "Business owners aged 35-55 with annual revenues between $1M-$10M in professional services, manufacturing, or technology sectors. They are growth-minded entrepreneurs who have achieved initial success but are now facing scaling challenges.",
          target_problems: "Struggling to scale beyond owner involvement, experiencing cash flow inconsistencies, lacking systematic processes, working 60+ hours per week, difficulty finding and retaining quality talent, and unclear on strategic direction for sustainable growth.",
          uvp_statement: "We help established business owners achieve predictable growth and operational excellence by implementing proven systems and frameworks, so they can scale confidently while reclaiming their time and achieving the lifestyle they envisioned when starting their business.",
          competitive_advantage: "Our unique combination of 20+ years industry experience, proprietary diagnostic tools, hands-on implementation support, and guaranteed results within 90 days sets us apart from traditional consultants who only provide advice.",
          market_size: "The local SMB market represents approximately $50M in potential annual consulting revenue, with over 5,000 businesses in our target range. The market is growing at 12% annually as more businesses seek professional guidance.",
          market_approach: "Focus on becoming the recognized authority through thought leadership content, strategic partnerships with complementary service providers, and a systematic referral program leveraging our successful client base."
        };
        
        setAiSuggestions(prev => ({ ...prev, [fieldType]: suggestions[fieldType] || 'Consider your unique market position and customer needs.' }));
        setAiLoading(null);
      }, 1500);
    } catch (error) {
      console.error('AI suggestion error:', error);
      setAiSuggestions(prev => ({ ...prev, [fieldType]: 'Error getting suggestion. Please try again.' }));
      setAiLoading(null);
    }
  };

  const applySuggestion = (fieldName: keyof StrategyMarketData, suggestion: string) => {
    handleChange(fieldName, suggestion);
    setAiSuggestions(prev => {
      const newSuggestions = { ...prev };
      delete newSuggestions[fieldName];
      return newSuggestions;
    });
  };

  const handleNext = () => {
    const nextSection = getNextSection(currentSection);
    if (nextSection) {
      router.push(`/strategic-wheel/${nextSection}`);
    } else {
      router.push('/strategic-wheel');
    }
  };

  const handlePrevious = () => {
    const prevSection = getPreviousSection(currentSection);
    if (prevSection) {
      router.push(`/strategic-wheel/${prevSection}`);
    } else {
      router.push('/strategic-wheel/vision-purpose');
    }
  };

  const handleChange = (field: keyof StrategyMarketData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return formData.target_demographics.length > 0 &&
           formData.target_problems.length > 0 &&
           formData.uvp_statement.length > 0 &&
           formData.competitor_1_name.length > 0 &&
           formData.competitor_1_advantage.length > 0 &&
           formData.competitor_2_name.length > 0 &&
           formData.competitor_2_advantage.length > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Strategic Wheel Progress</span>
            <span>Section 2 of 6</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '33%' }}></div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/strategic-wheel')}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <span>←</span> Back to Overview
            </button>
            {lastSaved && (
              <span className="text-sm text-green-600">
                ✓ Auto-saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Strategy & Market</h1>
          <p className="mt-2 text-gray-600">
            Define HOW you win in your market - your target customers, unique value, and competitive strategy.
          </p>
        </div>

        <div className="space-y-6">
          {/* Target Market */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-blue-600">◆</span> Target Market
            </h2>
            <p className="text-sm text-gray-600 mb-4">Who is your ideal customer? Be specific.</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Demographics <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => getAISuggestion('target_demographics')}
                    disabled={aiLoading === 'target_demographics'}
                    className="text-sm px-3 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 disabled:opacity-50"
                  >
                    {aiLoading === 'target_demographics' ? '...' : '✨ AI Help'}
                  </button>
                </div>
                <textarea
                  value={formData.target_demographics}
                  onChange={(e) => handleChange('target_demographics', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Example: Business owners aged 35-55, $1-10M revenue, professional services industry, growth-minded..."
                  required
                />
                {aiSuggestions.target_demographics && (
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">{aiSuggestions.target_demographics}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => applySuggestion('target_demographics', aiSuggestions.target_demographics)}
                        className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Use This
                      </button>
                      <button
                        onClick={() => setAiSuggestions(prev => ({ ...prev, target_demographics: '' }))}
                        className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Problems They Have <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => getAISuggestion('target_problems')}
                    disabled={aiLoading === 'target_problems'}
                    className="text-sm px-3 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 disabled:opacity-50"
                  >
                    {aiLoading === 'target_problems' ? '...' : '✨ AI Help'}
                  </button>
                </div>
                <textarea
                  value={formData.target_problems}
                  onChange={(e) => handleChange('target_problems', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Example: Struggling with cash flow, can't scale operations, working too many hours, no clear strategy..."
                  required
                />
                {aiSuggestions.target_problems && (
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">{aiSuggestions.target_problems}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => applySuggestion('target_problems', aiSuggestions.target_problems)}
                        className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Use This
                      </button>
                      <button
                        onClick={() => setAiSuggestions(prev => ({ ...prev, target_problems: '' }))}
                        className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where You Find Them
                </label>
                <textarea
                  value={formData.target_location}
                  onChange={(e) => handleChange('target_location', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Example: LinkedIn groups, industry associations, local business networks, trade shows..."
                />
              </div>
            </div>
          </div>

          {/* Unique Value Proposition */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-blue-600">◆</span> Unique Value Proposition
            </h2>
            <p className="text-sm text-gray-600 mb-4">What makes you different and better?</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose a framework to craft your UVP:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('uvp_framework_choice', 'option1')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.uvp_framework_choice === 'option1'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Framework Option 1</div>
                    <div className="text-sm text-gray-600 mt-1">
                      "We help [who] achieve [what] by [how] so they can [result]"
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleChange('uvp_framework_choice', 'option2')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.uvp_framework_choice === 'option2'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Framework Option 2</div>
                    <div className="text-sm text-gray-600 mt-1">
                      "Unlike [competitors], we [unique approach] which means [benefit]"
                    </div>
                  </button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Your UVP Statement <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => getAISuggestion('uvp_statement')}
                    disabled={aiLoading === 'uvp_statement'}
                    className="text-sm px-3 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 disabled:opacity-50"
                  >
                    {aiLoading === 'uvp_statement' ? '...' : '✨ AI Help'}
                  </button>
                </div>
                <textarea
                  value={formData.uvp_statement}
                  onChange={(e) => handleChange('uvp_statement', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder={formData.uvp_framework_choice === 'option2'
                    ? "Example: Unlike traditional consultants, we provide hands-on implementation support which means you see results in weeks, not months."
                    : "Example: We help growing businesses achieve predictable revenue by implementing proven systems so they can scale without burning out."}
                  required
                />
                {aiSuggestions.uvp_statement && (
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">{aiSuggestions.uvp_statement}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => applySuggestion('uvp_statement', aiSuggestions.uvp_statement)}
                        className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Use This
                      </button>
                      <button
                        onClick={() => setAiSuggestions(prev => ({ ...prev, uvp_statement: '' }))}
                        className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Competitive Advantage */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-blue-600">◆</span> Competitive Advantage
            </h2>
            <p className="text-sm text-gray-600 mb-4">What do you do better than anyone else?</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Competitive Advantage
                  </label>
                  <button
                    type="button"
                    onClick={() => getAISuggestion('competitive_advantage')}
                    disabled={aiLoading === 'competitive_advantage'}
                    className="text-sm px-3 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 disabled:opacity-50"
                  >
                    {aiLoading === 'competitive_advantage' ? '...' : '✨ AI Help'}
                  </button>
                </div>
                <textarea
                  value={formData.competitive_advantage}
                  onChange={(e) => handleChange('competitive_advantage', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Example: 20 years industry experience, proprietary methodology, fastest implementation time, best customer success rate..."
                />
                {aiSuggestions.competitive_advantage && (
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">{aiSuggestions.competitive_advantage}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => applySuggestion('competitive_advantage', aiSuggestions.competitive_advantage)}
                        className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Use This
                      </button>
                      <button
                        onClick={() => setAiSuggestions(prev => ({ ...prev, competitive_advantage: '' }))}
                        className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Top Competitors <span className="text-red-500">*</span>
                  <span className="text-sm font-normal text-gray-500 block mt-1">
                    List at least 2 competitors and explain how customers perceive you as different
                  </span>
                </label>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex gap-3 mb-2">
                      <input
                        type="text"
                        value={formData.competitor_1_name}
                        onChange={(e) => handleChange('competitor_1_name', e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Competitor 1 name *"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.competitor_1_advantage}
                      onChange={(e) => handleChange('competitor_1_advantage', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="How do customers see you as different? (e.g., 'We're faster', 'More personal service', 'Better value')"
                      required
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex gap-3 mb-2">
                      <input
                        type="text"
                        value={formData.competitor_2_name}
                        onChange={(e) => handleChange('competitor_2_name', e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Competitor 2 name *"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.competitor_2_advantage}
                      onChange={(e) => handleChange('competitor_2_advantage', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="How do customers see you as different? (e.g., 'More experienced', 'Local presence', 'Specialized expertise')"
                      required
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex gap-3 mb-2">
                      <input
                        type="text"
                        value={formData.competitor_3_name}
                        onChange={(e) => handleChange('competitor_3_name', e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Competitor 3 name (optional)"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.competitor_3_advantage}
                      onChange={(e) => handleChange('competitor_3_advantage', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="How do customers see you as different? (optional)"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Think from the customer's perspective: Why would they choose you over this competitor?
                </p>
              </div>
            </div>
          </div>

          {/* Market Strategy */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-blue-600">◆</span> Market Strategy
            </h2>
            <p className="text-sm text-gray-600 mb-4">How will you capture and dominate your market share?</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Market Size/Opportunity
                  </label>
                  <button
                    type="button"
                    onClick={() => getAISuggestion('market_size')}
                    disabled={aiLoading === 'market_size'}
                    className="text-sm px-3 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 disabled:opacity-50"
                  >
                    {aiLoading === 'market_size' ? '...' : '✨ AI Help'}
                  </button>
                </div>
                <textarea
                  value={formData.market_size}
                  onChange={(e) => handleChange('market_size', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Example: $50M local market, growing 15% annually, only 20% currently served well..."
                />
                {aiSuggestions.market_size && (
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">{aiSuggestions.market_size}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => applySuggestion('market_size', aiSuggestions.market_size)}
                        className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Use This
                      </button>
                      <button
                        onClick={() => setAiSuggestions(prev => ({ ...prev, market_size: '' }))}
                        className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Approach to Winning
                  </label>
                  <button
                    type="button"
                    onClick={() => getAISuggestion('market_approach')}
                    disabled={aiLoading === 'market_approach'}
                    className="text-sm px-3 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 disabled:opacity-50"
                  >
                    {aiLoading === 'market_approach' ? '...' : '✨ AI Help'}
                  </button>
                </div>
                <textarea
                  value={formData.market_approach}
                  onChange={(e) => handleChange('market_approach', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Example: Focus on underserved segment, premium positioning, strategic partnerships, thought leadership..."
                />
                {aiSuggestions.market_approach && (
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">{aiSuggestions.market_approach}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => applySuggestion('market_approach', aiSuggestions.market_approach)}
                        className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Use This
                      </button>
                      <button
                        onClick={() => setAiSuggestions(prev => ({ ...prev, market_approach: '' }))}
                        className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Differentiators
                </label>
                <textarea
                  value={formData.key_differentiators}
                  onChange={(e) => handleChange('key_differentiators', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Example: Only provider with guarantee, fastest implementation, most experienced team..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Path to Market Leadership
                </label>
                <textarea
                  value={formData.market_leadership_path}
                  onChange={(e) => handleChange('market_leadership_path', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Example: Become the go-to expert, build strategic partnerships, expand geographically..."
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 pb-12">
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <span>←</span> Previous Section
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              disabled={!isFormValid()}
              className={`px-8 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                isFormValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to People & Culture <span>→</span>
            </button>
          </div>
          
          {!isFormValid() && (
            <div className="text-center text-sm text-gray-500 -mt-6 mb-6">
              Please complete required fields (*) to continue
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
