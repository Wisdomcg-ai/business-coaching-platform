'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  StrategicInitiative,
  InitiativeCategory,
  categoryInfo
} from '@/types/strategic-initiatives';
import { 
  Plus, X, ChevronDown, ChevronUp, Check, CheckCircle2,
  Target, TrendingUp, Package, Heart, Settings, Users, 
  DollarSign, Brain, AlertCircle, Lightbulb, User, Bot,
  Building, CheckSquare, Square
} from 'lucide-react';

// Revenue stage definitions with enhanced roadmap items
const REVENUE_STAGES = [
  {
    id: 'foundation',
    name: 'Foundation',
    range: '$0-250K',
    min: 0,
    max: 250000,
    priorities: {
      attract: [
        'Define ideal customer profile',
        'Create basic brand identity',
        'Build simple website with clear value proposition',
        'Choose 1-2 primary marketing channels',
        'Set up Google My Business profile'
      ],
      convert: [
        'Create basic pricing strategy',
        'Develop simple sales process',
        'Design quote/proposal templates',
        'Establish payment terms and methods',
        'Create basic sales tracking system'
      ],
      deliver: [
        'Define core service/product standards',
        'Create basic delivery process',
        'Develop quality control checklist',
        'Set up customer communication system',
        'Document service delivery workflow'
      ],
      delight: [
        'Implement customer feedback system',
        'Set response time goals',
        'Create testimonial collection process',
        'Develop customer complaint resolution process',
        'Establish follow-up communication schedule'
      ],
      systems: [
        'Document core business processes',
        'Create basic file organization system',
        'Implement simple project management workflow',
        'Set up basic accounting system',
        'Create backup and security procedures'
      ],
      people: [
        'Define company core values',
        'Create basic job descriptions',
        'Establish hiring criteria',
        'Develop basic training materials',
        'Set up employee communication systems'
      ],
      profit: [
        'Track basic cash flow',
        'Implement expense tracking system',
        'Calculate gross profit margins',
        'Set up basic financial reporting',
        'Create monthly budget process'
      ],
      strategy: [
        'Write basic business plan',
        'Define 3-year vision',
        'Conduct basic market research',
        'Set annual goals and targets',
        'Create monthly review process'
      ]
    }
  },
  {
    id: 'traction',
    name: 'Traction',
    range: '$250K-1M',
    min: 250000,
    max: 1000000,
    priorities: {
      attract: [
        'Implement marketing ROI tracking',
        'Develop content marketing strategy',
        'Create referral program',
        'Optimize website for search engines',
        'Build email marketing system'
      ],
      convert: [
        'Implement CRM system',
        'Create sales scripts and templates',
        'Develop pipeline management process',
        'Set up sales performance tracking',
        'Create territory/customer segmentation'
      ],
      deliver: [
        'Create detailed service agreements',
        'Develop customer onboarding process',
        'Implement project management system',
        'Create service level standards',
        'Develop quality assurance process'
      ],
      delight: [
        'Implement customer satisfaction surveys',
        'Create customer success program',
        'Develop retention strategies',
        'Set up proactive communication system',
        'Create loyalty/rewards program'
      ],
      systems: [
        'Standardize all core processes',
        'Implement basic automation tools',
        'Create KPI tracking dashboards',
        'Develop reporting systems',
        'Create process improvement methodology'
      ],
      people: [
        'Create organizational structure',
        'Implement performance review system',
        'Develop training programs',
        'Create employee handbook',
        'Set up team communication tools'
      ],
      profit: [
        'Implement profit margin analysis',
        'Create monthly financial reports',
        'Develop budget planning process',
        'Set up cost center tracking',
        'Create cash flow forecasting'
      ],
      strategy: [
        'Implement strategic planning process',
        'Conduct competitive analysis',
        'Develop growth strategy',
        'Create market expansion plan',
        'Set up strategic review meetings'
      ]
    }
  },
  {
    id: 'scaling',
    name: 'Scaling',
    range: '$1M-3M',
    min: 1000000,
    max: 3000000,
    priorities: {
      attract: [
        'Implement advanced marketing automation',
        'Develop multi-channel marketing strategy',
        'Create advanced SEO/content strategy',
        'Build strategic partnerships',
        'Implement advanced analytics tracking'
      ],
      convert: [
        'Build dedicated sales team',
        'Implement advanced CRM features',
        'Create territory management system',
        'Develop sales coaching program',
        'Implement advanced sales analytics'
      ],
      deliver: [
        'Scale operations infrastructure',
        'Implement advanced technology solutions',
        'Create quality management system',
        'Develop capacity planning process',
        'Implement customer success platform'
      ],
      delight: [
        'Create comprehensive customer journey mapping',
        'Implement advanced loyalty programs',
        'Develop proactive customer success team',
        'Create customer advocacy program',
        'Implement advanced feedback systems'
      ],
      systems: [
        'Implement enterprise-level automation',
        'Create integrated technology platform',
        'Develop real-time reporting systems',
        'Implement advanced security measures',
        'Create disaster recovery systems'
      ],
      people: [
        'Create management development program',
        'Implement advanced HR systems',
        'Develop leadership pipeline',
        'Create career advancement paths',
        'Implement culture measurement tools'
      ],
      profit: [
        'Implement advanced financial modeling',
        'Create investment planning system',
        'Develop scenario planning tools',
        'Implement cost optimization programs',
        'Create advanced profitability analysis'
      ],
      strategy: [
        'Develop market expansion strategy',
        'Create innovation pipeline',
        'Build strategic partnership program',
        'Implement advanced competitive intelligence',
        'Create acquisition/merger planning'
      ]
    }
  }
];

const categoryIcons: Record<InitiativeCategory, React.ElementType> = {
  attract: Target,
  convert: TrendingUp,
  deliver: Package,
  delight: Heart,
  systems: Settings,
  people: Users,
  profit: DollarSign,
  strategy: Brain
};

// Assessment-based suggestions mapping
const ASSESSMENT_SUGGESTIONS = {
  foundation_low: {
    title: 'Foundation Building Priority',
    description: 'Your Foundation score indicates these areas need immediate attention',
    initiatives: [
      { title: 'Document all core business processes', category: 'systems' as InitiativeCategory },
      { title: 'Create standard operating procedures', category: 'systems' as InitiativeCategory },
      { title: 'Implement quality control systems', category: 'deliver' as InitiativeCategory },
      { title: 'Establish clear roles and responsibilities', category: 'people' as InitiativeCategory }
    ]
  },
  strategic_wheel_low: {
    title: 'Strategic Planning Priority',
    description: 'Your Strategic Wheel score suggests strengthening strategic foundation',
    initiatives: [
      { title: 'Define clear target market segments', category: 'attract' as InitiativeCategory },
      { title: 'Develop competitive differentiation strategy', category: 'strategy' as InitiativeCategory },
      { title: 'Create customer journey mapping', category: 'convert' as InitiativeCategory },
      { title: 'Implement regular strategic planning sessions', category: 'strategy' as InitiativeCategory }
    ]
  },
  engines_low: {
    title: 'Business Engines Priority',
    description: 'Your Engines score indicates core business processes need improvement',
    initiatives: [
      { title: 'Implement CRM automation', category: 'convert' as InitiativeCategory },
      { title: 'Create sales process documentation', category: 'convert' as InitiativeCategory },
      { title: 'Develop customer onboarding systems', category: 'deliver' as InitiativeCategory },
      { title: 'Build performance reporting dashboards', category: 'systems' as InitiativeCategory }
    ]
  },
  disciplines_low: {
    title: 'Success Disciplines Priority',
    description: 'Your Disciplines score suggests focusing on execution consistency',
    initiatives: [
      { title: 'Implement daily planning routine', category: 'systems' as InitiativeCategory },
      { title: 'Create accountability tracking system', category: 'people' as InitiativeCategory },
      { title: 'Develop performance measurement tools', category: 'systems' as InitiativeCategory },
      { title: 'Build team communication protocols', category: 'people' as InitiativeCategory }
    ]
  },
  profitability_low: {
    title: 'Profitability Priority',
    description: 'Your Profitability score indicates financial management needs attention',
    initiatives: [
      { title: 'Implement comprehensive cost tracking', category: 'profit' as InitiativeCategory },
      { title: 'Create profit margin analysis tools', category: 'profit' as InitiativeCategory },
      { title: 'Develop pricing optimization strategy', category: 'profit' as InitiativeCategory },
      { title: 'Build financial forecasting system', category: 'profit' as InitiativeCategory }
    ]
  }
};

interface RoadmapCompletion {
  id: string;
  stage: string;
  category: string;
  item_text: string;
  completed: boolean;
  completed_at?: string;
}

interface AssessmentData {
  foundation_score?: number;
  strategic_wheel_score?: number;
  engines_score?: number;
  disciplines_score?: number;
  profitability_score?: number;
  health_score?: number;
}

export default function StrategicInitiatives() {
  const [initiatives, setInitiatives] = useState<StrategicInitiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInitiative, setNewInitiative] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InitiativeCategory | null>(null);
  const [filterCategory, setFilterCategory] = useState<InitiativeCategory | 'all'>('all');
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showAssessmentSuggestions, setShowAssessmentSuggestions] = useState(false);
  const [showInitiatives, setShowInitiatives] = useState(true);
  const [currentStage, setCurrentStage] = useState(REVENUE_STAGES[1]);
  const [roadmapCompletions, setRoadmapCompletions] = useState<RoadmapCompletion[]>([]);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User error:', userError);
        setError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }

      if (!user) {
        console.log('No user found');
        setLoading(false);
        return;
      }

      // Load business profile and determine revenue stage
      const storedProfile = localStorage.getItem('businessProfile');
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          const revenue = profile.annual_revenue || 500000;
          const stage = REVENUE_STAGES.find(s => revenue >= s.min && revenue < s.max) || REVENUE_STAGES[1];
          setCurrentStage(stage);
        } catch (e) {
          console.error('Error parsing business profile:', e);
        }
      }

      // Load assessment data for suggestions
      const { data: latestAssessment } = await supabase
        .from('assessments')
        .select('foundation_score, strategic_wheel_score, engines_score, disciplines_score, profitability_score, health_score')
        .eq('completed_by', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestAssessment) {
        setAssessmentData(latestAssessment);
      }

      // Load user's initiatives (including coach suggestions)
      const { data: initiativesData, error: dbError } = await supabase
        .from('strategic_initiatives')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('Database error:', dbError);
        setError('Error loading initiatives. Please refresh the page.');
      } else {
        setInitiatives(initiativesData || []);
      }

      // Load roadmap completions
      const { data: completionsData } = await supabase
        .from('roadmap_completions')
        .select('*')
        .eq('user_id', user.id);

      if (completionsData) {
        setRoadmapCompletions(completionsData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('An unexpected error occurred. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const addInitiative = async (sourceType: 'client' | 'coach' | 'ai' | 'roadmap' = 'client', suggestionType?: string) => {
    if (!newInitiative.trim() || !selectedCategory) return;
    
    setError(null);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError('Please log in to add initiatives');
        return;
      }

      const initiative = {
        user_id: user.id,
        title: newInitiative.trim(),
        category: selectedCategory,
        priority: 'medium',
        source_type: sourceType,
        assessment_suggestion_type: suggestionType,
        selected_for_action: false,
        selected_for_annual_plan: false
      };

      const { data, error: insertError } = await supabase
        .from('strategic_initiatives')
        .insert(initiative)
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        setError('Failed to add initiative. Please try again.');
      } else if (data) {
        setInitiatives([data, ...initiatives]);
        setNewInitiative('');
        setSelectedCategory(null); // Reset category selection
      }
    } catch (error) {
      console.error('Error adding initiative:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const addFromAssessment = async (suggestionItem: any, suggestionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const initiative = {
        user_id: user.id,
        title: suggestionItem.title,
        category: suggestionItem.category,
        priority: 'high',
        source_type: 'ai',
        assessment_suggestion_type: suggestionType,
        selected_for_action: false,
        selected_for_annual_plan: false
      };

      const { data, error } = await supabase
        .from('strategic_initiatives')
        .insert(initiative)
        .select()
        .single();

      if (!error && data) {
        setInitiatives([data, ...initiatives]);
      }
    } catch (error) {
      console.error('Error adding from assessment:', error);
    }
  };

  const addFromRoadmap = async (task: string, category: InitiativeCategory, stage: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const initiative = {
        user_id: user.id,
        title: task,
        category: category,
        priority: 'medium',
        source_type: 'roadmap',
        roadmap_item_id: `${stage}_${category}_${task.toLowerCase().replace(/\s+/g, '_')}`,
        selected_for_action: false,
        selected_for_annual_plan: false
      };

      const { data, error } = await supabase
        .from('strategic_initiatives')
        .insert(initiative)
        .select()
        .single();

      if (!error && data) {
        setInitiatives([data, ...initiatives]);
      }
    } catch (error) {
      console.error('Error adding from roadmap:', error);
    }
  };

  const toggleRoadmapCompletion = async (stage: string, category: string, itemText: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const existing = roadmapCompletions.find(
        r => r.stage === stage && r.category === category && r.item_text === itemText
      );

      if (existing) {
        // Toggle completion status
        const { error } = await supabase
          .from('roadmap_completions')
          .update({ 
            completed: !existing.completed,
            completed_at: !existing.completed ? new Date().toISOString() : null
          })
          .eq('id', existing.id);

        if (!error) {
          setRoadmapCompletions(prev => prev.map(r => 
            r.id === existing.id 
              ? { ...r, completed: !r.completed, completed_at: !r.completed ? new Date().toISOString() : undefined }
              : r
          ));
        }
      } else {
        // Create new completion record
        const { data, error } = await supabase
          .from('roadmap_completions')
          .insert({
            user_id: user.id,
            stage,
            category,
            item_text: itemText,
            completed: true,
            completed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (!error && data) {
          setRoadmapCompletions(prev => [...prev, data]);
        }
      }
    } catch (error) {
      console.error('Error toggling roadmap completion:', error);
    }
  };

  const toggleAnnualPlan = async (id: string) => {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return;

    const selectedCount = initiatives.filter(i => i.selected_for_annual_plan).length;
    if (!initiative.selected_for_annual_plan && selectedCount >= 12) return;

    try {
      const { error } = await supabase
        .from('strategic_initiatives')
        .update({ selected_for_annual_plan: !initiative.selected_for_annual_plan })
        .eq('id', id);

      if (!error) {
        setInitiatives(prev => prev.map(i => 
          i.id === id ? { ...i, selected_for_annual_plan: !i.selected_for_annual_plan } : i
        ));
      }
    } catch (error) {
      console.error('Error updating initiative:', error);
    }
  };

  const deleteInitiative = async (id: string) => {
    try {
      const { error } = await supabase
        .from('strategic_initiatives')
        .delete()
        .eq('id', id);

      if (!error) {
        setInitiatives(prev => prev.filter(i => i.id !== id));
      }
    } catch (error) {
      console.error('Error deleting initiative:', error);
    }
  };

  // Helper functions
  const getAssessmentSuggestions = () => {
    if (!assessmentData) return [];

    const suggestions = [];
    const maxScores = { foundation: 40, strategic_wheel: 60, engines: 100, disciplines: 60, profitability: 30 };

    Object.entries(assessmentData).forEach(([key, score]) => {
      if (key.endsWith('_score') && score !== undefined) {
        const sectionKey = key.replace('_score', '');
        const maxScore = maxScores[sectionKey as keyof typeof maxScores];
        if (maxScore && score < maxScore * 0.6) { // Less than 60% of max score
          const suggestionKey = `${sectionKey}_low` as keyof typeof ASSESSMENT_SUGGESTIONS;
          if (ASSESSMENT_SUGGESTIONS[suggestionKey]) {
            suggestions.push({
              key: suggestionKey,
              ...ASSESSMENT_SUGGESTIONS[suggestionKey],
              currentScore: score,
              maxScore: maxScore
            });
          }
        }
      }
    });

    return suggestions;
  };

  const getRoadmapItemsToShow = () => {
    const currentStageIndex = REVENUE_STAGES.findIndex(s => s.id === currentStage.id);
    const stagesToShow = REVENUE_STAGES.slice(0, currentStageIndex + 1);
    
    const itemsToShow: any[] = [];
    
    stagesToShow.forEach(stage => {
      Object.entries(stage.priorities).forEach(([category, tasks]) => {
        (tasks as string[]).forEach(task => {
          const completion = roadmapCompletions.find(
            r => r.stage === stage.id && r.category === category && r.item_text === task
          );
          
          const exists = initiatives.some(i => 
            i.title.toLowerCase() === task.toLowerCase() && 
            i.category === category
          );

          itemsToShow.push({
            stage: stage.id,
            stageName: stage.name,
            category,
            task,
            completed: completion?.completed || false,
            exists,
            isCurrentStage: stage.id === currentStage.id
          });
        });
      });
    });

    return itemsToShow;
  };

  const filteredInitiatives = initiatives.filter(i => 
    filterCategory === 'all' || i.category === filterCategory
  );

  const selectedCount = initiatives.filter(i => i.selected_for_annual_plan).length;
  const maxReached = selectedCount >= 12;
  const assessmentSuggestions = getAssessmentSuggestions();
  const roadmapItems = getRoadmapItemsToShow();
  const incompleteRoadmapItems = roadmapItems.filter(item => !item.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading initiatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* COMPLETELY DROPDOWN-FREE INPUT SECTION */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What needs to get done to reach your 3-year targets?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Brain dump everything - big projects, small improvements, new systems, key hires. 
                <span className="font-medium text-blue-700"> Don't filter now, prioritise later.</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Input Section */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Step 1: Initiative Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">Step 1: What needs to get done?</span>
              </div>
              
              <div className="space-y-3">
                <input
                  id="initiative-input"
                  type="text"
                  value={newInitiative}
                  onChange={(e) => setNewInitiative(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && newInitiative.trim() && selectedCategory && addInitiative()}
                  placeholder="Type your initiative (e.g., 'Implement CRM system', 'Hire sales manager', 'Create customer onboarding process')"
                  className="w-full px-4 py-4 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 text-lg bg-white border-gray-300"
                />
                
                {newInitiative.trim() && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Initiative entered: "{newInitiative}"
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Category Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-semibold ${newInitiative.trim() ? 'text-gray-900' : 'text-gray-400'}`}>
                  Step 2: Choose a category
                </span>
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">Required</span>
                {selectedCategory && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {categoryInfo[selectedCategory].label}
                  </div>
                )}
              </div>
              
              {!newInitiative.trim() && (
                <p className="text-sm text-gray-500 italic">Enter your initiative above first, then choose its category.</p>
              )}
              
              <div className={`flex flex-wrap gap-2 ${!newInitiative.trim() ? 'opacity-50 pointer-events-none' : ''}`}>
                {Object.entries(categoryInfo).map(([key, info]) => {
                  const Icon = categoryIcons[key as InitiativeCategory];
                  const isSelected = key === selectedCategory;
                  
                  return (
                    <div key={key} className="relative group">
                      <button
                        onClick={() => setSelectedCategory(key as InitiativeCategory)}
                        disabled={!newInitiative.trim()}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md scale-105'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {info.label}
                      </button>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {info.description}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Button */}
            <div className="flex justify-end">
              <button
                onClick={() => addInitiative()}
                disabled={!newInitiative.trim() || !selectedCategory}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-sm text-lg ${
                  !newInitiative.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : !selectedCategory
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl'
                }`}
              >
                <Plus className="w-6 h-6" />
                {!newInitiative.trim() ? 'Enter Initiative First' : !selectedCategory ? 'Choose Category' : 'Add Initiative'}
              </button>
            </div>
          </div>
          
          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-blue-800 leading-relaxed">
                <span className="font-bold">Pro tip:</span> Start with what keeps you up at night, 
                then add the exciting opportunities. You can organize and prioritize everything later.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Annual Focus Counter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`text-lg font-semibold ${maxReached ? 'text-orange-600' : 'text-gray-900'}`}>
              Annual Focus: {selectedCount}/12 selected
            </div>
            {maxReached && (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                Maximum reached - deselect one to add another
              </div>
            )}
          </div>
          
          {/* Filter Pills */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterCategory === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {Object.entries(categoryInfo).map(([key, info]) => {
              const Icon = categoryIcons[key as InitiativeCategory];
              return (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key as InitiativeCategory)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    filterCategory === key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Your Initiatives List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setShowInitiatives(!showInitiatives)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Your Initiatives</h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredInitiatives.length} initiatives • {selectedCount} selected for annual plan
              </p>
            </div>
          </div>
          {showInitiatives ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
        </button>
        
        {showInitiatives && (
          <div className="border-t border-gray-200 p-6">
            {filteredInitiatives.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {filterCategory === 'all' 
                  ? "No initiatives yet. Start adding what needs to get done!"
                  : `No initiatives in ${categoryInfo[filterCategory as InitiativeCategory]?.label}. Try another category or add one above.`
                }
              </div>
            ) : (
              <div className="space-y-2">
                {filteredInitiatives.map((initiative) => {
                  const Icon = categoryIcons[initiative.category];
                  const info = categoryInfo[initiative.category];
                  const isDisabled = !initiative.selected_for_annual_plan && maxReached;
                  
                  // Source icon
                  const SourceIcon = initiative.source_type === 'coach' ? User :
                                    initiative.source_type === 'ai' ? Bot :
                                    initiative.source_type === 'roadmap' ? Building :
                                    User;
                  
                  return (
                    <div
                      key={initiative.id}
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                        isDisabled ? 'opacity-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={initiative.selected_for_annual_plan || false}
                        onChange={() => toggleAnnualPlan(initiative.id)}
                        disabled={isDisabled}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
                      />
                      
                      <div className="flex-1 text-gray-900">
                        {initiative.title}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700`}>
                          <Icon className="w-3.5 h-3.5" />
                          {info?.label}
                        </div>
                        
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          initiative.source_type === 'coach' ? 'bg-purple-100 text-purple-700' :
                          initiative.source_type === 'ai' ? 'bg-yellow-100 text-yellow-700' :
                          initiative.source_type === 'roadmap' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          <SourceIcon className="w-3 h-3" />
                          {initiative.source_type === 'coach' ? 'Coach' :
                           initiative.source_type === 'ai' ? 'AI' :
                           initiative.source_type === 'roadmap' ? 'Roadmap' :
                           'You'}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteInitiative(initiative.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assessment-Based Suggestions */}
      {assessmentSuggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => setShowAssessmentSuggestions(!showAssessmentSuggestions)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Assessment-Based Suggestions</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Based on your assessment results, these areas need attention ({assessmentSuggestions.length} recommendations)
                </p>
              </div>
            </div>
            {showAssessmentSuggestions ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
          </button>
          
          {showAssessmentSuggestions && (
            <div className="border-t border-gray-200 p-6">
              <div className="space-y-6">
                {assessmentSuggestions.map((suggestion) => (
                  <div key={suggestion.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Score: {suggestion.currentScore}/{suggestion.maxScore} ({Math.round((suggestion.currentScore / suggestion.maxScore) * 100)}%)
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2 pl-4">
                      {suggestion.initiatives.map((item, idx) => {
                        const exists = initiatives.some(i => 
                          i.title.toLowerCase() === item.title.toLowerCase() && 
                          i.category === item.category
                        );
                        
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-3">
                              <Bot className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm text-gray-700">{item.title}</span>
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {React.createElement(categoryIcons[item.category], { className: "w-3 h-3" })}
                                {categoryInfo[item.category]?.label}
                              </div>
                            </div>
                            {exists ? (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                Added
                              </span>
                            ) : (
                              <button
                                onClick={() => addFromAssessment(item, suggestion.key)}
                                className="text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                              >
                                Add to List
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Foundation-First Roadmap */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setShowRoadmap(!showRoadmap)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Building className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Foundation-First Roadmap</h3>
              <p className="text-sm text-gray-600 mt-1">
                {currentStage.name} ({currentStage.range}) • {incompleteRoadmapItems.length} items remaining across all levels
              </p>
            </div>
          </div>
          {showRoadmap ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
        </button>
        
        {showRoadmap && (
          <div className="border-t border-gray-200 p-6">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <strong>Foundation-First Approach:</strong> Complete lower levels before advancing. Showing all levels through {currentStage.name}.
              </div>
            </div>
            
            <div className="space-y-6">
              {REVENUE_STAGES.slice(0, REVENUE_STAGES.findIndex(s => s.id === currentStage.id) + 1).map((stage) => {
                const stageItems = roadmapItems.filter(item => item.stage === stage.id);
                const completedCount = stageItems.filter(item => item.completed).length;
                const totalCount = stageItems.length;
                const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                
                return (
                  <div key={stage.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${stage.id === currentStage.id ? 'text-blue-700' : 'text-gray-700'}`}>
                        {stage.name} ({stage.range})
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {completedCount}/{totalCount} completed ({completionPercent}%)
                        </span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              completionPercent === 100 ? 'bg-green-500' : 
                              completionPercent > 50 ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      {Object.entries(stage.priorities).map(([category, tasks]) => {
                        const Icon = categoryIcons[category as InitiativeCategory];
                        const info = categoryInfo[category as InitiativeCategory];
                        const categoryItems = stageItems.filter(item => item.category === category);
                        const categoryCompleted = categoryItems.filter(item => item.completed).length;
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-gray-600" />
                              <h5 className="font-medium text-gray-900">{info?.label}</h5>
                              <span className="text-xs text-gray-500">
                                ({categoryCompleted}/{categoryItems.length})
                              </span>
                            </div>
                            <div className="grid gap-2 pl-6">
                              {(tasks as string[]).map((task, idx) => {
                                const item = stageItems.find(si => si.task === task && si.category === category);
                                const completed = item?.completed || false;
                                const exists = item?.exists || false;
                                
                                return (
                                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => toggleRoadmapCompletion(stage.id, category, task)}
                                        className="flex-shrink-0"
                                      >
                                        {completed ? (
                                          <CheckSquare className="w-5 h-5 text-green-600" />
                                        ) : (
                                          <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                      </button>
                                      <span className={`text-sm ${completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                        {task}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {exists && (
                                        <span className="text-xs text-blue-600 flex items-center gap-1">
                                          <Check className="w-3.5 h-3.5" />
                                          In List
                                        </span>
                                      )}
                                      {!exists && !completed && (
                                        <button
                                          onClick={() => addFromRoadmap(task, category as InitiativeCategory, stage.id)}
                                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                          Add to List
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}