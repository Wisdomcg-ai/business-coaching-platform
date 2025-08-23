'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

// Map question IDs to Success Disciplines
const disciplineMapping = {
  'q50': 'Decision-Making',
  'q51': 'Technology & AI',
  'q52': 'Growth Mindset',
  'q53': 'Leadership',
  'q54': 'Personal Mastery',
  'q55': 'Operational Excellence',
  'q56': 'Resource Optimization',
  'q57': 'Financial Acumen',
  'q58': 'Accountability',
  'q59': 'Customer Experience',
  'q60': 'Resilience & Renewal',
  'q61': 'Time Management'
};

// Revenue roadmap recommendations
const recommendationsByStage = {
  'foundation': [
    { title: 'Define Your Ideal Customer', area: 'Marketing', action: 'Interview your 3 best customers this week' },
    { title: 'Document Sales Process', area: 'Sales', action: 'Write your sales steps in 5 bullet points' },
    { title: 'Weekly Money Meeting', area: 'Finance', action: 'Schedule 30 minutes weekly to review finances' }
  ],
  'traction': [
    { title: 'Focus Marketing Channels', area: 'Marketing', action: 'Double down on your best performing channel' },
    { title: 'Hire Key Person', area: 'Team', action: 'List top 5 tasks to delegate' },
    { title: 'Create SOPs', area: 'Systems', action: 'Document your most important process' }
  ],
  'scaling': [
    { title: 'Build Sales System', area: 'Sales', action: 'Script your discovery call questions' },
    { title: 'Team Performance Rhythms', area: 'Team', action: 'Schedule weekly 1-on-1s with direct reports' },
    { title: 'Operations Manual', area: 'Systems', action: 'List your top 10 processes to document' }
  ],
  'optimization': [
    { title: 'Marketing Automation', area: 'Marketing', action: 'Set up one email automation sequence' },
    { title: 'Sales Team Structure', area: 'Sales', action: 'Define ideal sales hire profile' },
    { title: 'Leadership Development', area: 'Team', action: 'Assess each leader strengths and gaps' }
  ]
};

export default function SimplifiedResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showDisciplines, setShowDisciplines] = useState(false);
  const [showEngines, setShowEngines] = useState(false);
  
  // Core data
  const [score, setScore] = useState(0);
  const [revenueStage, setRevenueStage] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [engines, setEngines] = useState<any[]>([]);
  const [contextMessage, setContextMessage] = useState('');

  useEffect(() => {
    loadAndProcessResults();
  }, []);

  const loadAndProcessResults = () => {
    try {
      // Load data from localStorage
      const answersData = localStorage.getItem('assessmentAnswers');
      const resultsData = localStorage.getItem('assessmentResults');
      
      if (!answersData || !resultsData) {
        setLoading(false);
        return;
      }
      
      const answers = JSON.parse(answersData);
      const results = JSON.parse(resultsData);
      
      // Fix percentage calculation (use corrected scoring)
      const correctedScore = calculateCorrectedScore(answers);
      setScore(correctedScore);
      
      // Get revenue stage from q1
      const revenueAnswer = answers.q1?.label || answers.q1?.value || 'Unknown';
      setRevenueStage(formatRevenueStage(revenueAnswer));
      
      // Recalculate sections with correct scoring
      const correctedSections = calculateSectionScores(answers);
      setSections(correctedSections);
      
      // Calculate Success Disciplines scores
      const disciplineScores = calculateDisciplineScores(answers);
      setDisciplines(disciplineScores);
      
      // Calculate Business Engines breakdown
      const engineBreakdown = calculateEngineBreakdown(answers);
      setEngines(engineBreakdown);
      
      // Generate context message
      const message = generateContextMessage(revenueAnswer, correctedScore);
      setContextMessage(message);
      
    } catch (error) {
      console.error('Error processing results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate corrected score (1 point per yes, not 1.25)
  const calculateCorrectedScore = (answers: any): number => {
    let totalPoints = 0;
    let maxPoints = 290; // Fixed maximum
    
    // Get all section scores
    const sections = calculateSectionScores(answers);
    
    // Sum up all section scores
    sections.forEach(section => {
      totalPoints += section.score;
    });
    
    // Calculate percentage
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    return percentage;
  };

  // Calculate section scores with correct maximums
  const calculateSectionScores = (answers: any): any[] => {
    const sections: any[] = [
      {
        name: 'Business Foundation',
        questions: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'],
        max: 40
      },
      {
        name: 'Strategic Wheel',
        questions: ['q7', 'q8', 'q9', 'q10', 'q11', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20'],
        max: 60
      },
      {
        name: 'Profitability Health',
        questions: ['q22', 'q23', 'q24', 'q25', 'q26'],
        max: 30
      },
      {
        name: 'Business Engines',
        questions: ['q27', 'q28', 'q30', 'q31', 'q33', 'q34', 'q35', 'q39', 'q40', 'q42', 'q43', 'q45', 'q46', 'q49'],
        subQuestions: ['q30a', 'q30b', 'q30c', 'q30d', 'q33a', 'q33b', 'q33c', 'q33d', 'q34a', 'q34b', 'q34c', 'q34d', 'q39a', 'q39b', 'q39c', 'q39d', 'q42a', 'q42b', 'q42c', 'q42d', 'q45a', 'q45b', 'q45c', 'q45d', 'q49a', 'q49b', 'q49c', 'q49d'],
        max: 100
      },
      {
        name: 'Success Disciplines',
        questions: ['q50', 'q51', 'q52', 'q53', 'q54', 'q55', 'q56', 'q57', 'q58', 'q59', 'q60', 'q61'],
        subQuestions: [], // Handled separately
        max: 60
      }
    ];

    return sections.map(section => {
      let sectionScore = 0;
      let maxPossible = 0;
      
      // Handle Success Disciplines differently
      if (section.name === 'Success Disciplines') {
        section.questions.forEach(qBase => {
          ['a', 'b', 'c', 'd', 'e'].forEach(letter => {
            const qId = `${qBase}${letter}`;
            if (answers[qId]?.value === 'yes') {
              sectionScore += 1; // 1 point per yes
            }
          });
        });
        maxPossible = section.max;
      } else {
        // Handle regular questions
        section.questions.forEach(qId => {
          const answer = answers[qId];
          if (answer?.points !== undefined) {
            sectionScore += answer.points;
          }
          // Track maximum possible for scaling
          maxPossible += 10; // Assume each question has max 10 points
        });
        
        // Handle sub-questions (yes/no)
        if (section.subQuestions) {
          section.subQuestions.forEach(qId => {
            const answer = answers[qId];
            if (answer?.value === 'yes') {
              sectionScore += 1; // 1 point per yes, not 1.25
            }
            maxPossible += 1; // Each yes/no has max 1 point
          });
        }
      }
      
      // Scale Strategic Wheel to fit 60 points max
      if (section.name === 'Strategic Wheel') {
        // Scale the score: (actual/maxPossible) * desiredMax
        const scaledScore = (sectionScore / maxPossible) * section.max;
        sectionScore = Math.round(scaledScore);
      }
      
      // For other sections, if maxPossible doesn't match section.max, scale appropriately
      if (section.name !== 'Success Disciplines' && section.name !== 'Strategic Wheel' && maxPossible !== section.max) {
        const scaledScore = (sectionScore / maxPossible) * section.max;
        sectionScore = Math.round(scaledScore);
      }
      
      // Calculate percentage
      const percentage = Math.round((sectionScore / section.max) * 100);
      
      return {
        name: section.name,
        score: sectionScore,
        max: section.max,
        percentage: Math.min(percentage, 100) // Cap at 100%
      };
    });
  };

  // Calculate Success Disciplines scores
  const calculateDisciplineScores = (answers: any): any[] => {
    const scores: any[] = [];
    
    Object.entries(disciplineMapping).forEach(([qId, disciplineName]) => {
      let yesCount = 0;
      let totalCount = 5;
      
      // Check each sub-question (a, b, c, d, e)
      ['a', 'b', 'c', 'd', 'e'].forEach(letter => {
        const questionKey = `${qId}${letter}`;
        if (answers[questionKey]?.value === 'yes') {
          yesCount++;
        }
      });
      
      const percentage = Math.round((yesCount / totalCount) * 100);
      scores.push({
        name: disciplineName,
        score: yesCount,
        percentage,
        status: percentage >= 60 ? 'good' : percentage >= 40 ? 'medium' : 'needs-work'
      });
    });
    
    return scores.sort((a, b) => a.percentage - b.percentage);
  };

  // Calculate Business Engines breakdown
  const calculateEngineBreakdown = (answers: any): any[] => {
    const engines = [
      {
        name: 'Attract Engine',
        questions: ['q27', 'q28'], // Lead volume, marketing channels
        subQuestions: ['q30a', 'q30b', 'q30c', 'q30d'],
        max: 20
      },
      {
        name: 'Convert Engine',
        questions: ['q31'], // Conversion rate
        subQuestions: ['q33a', 'q33b', 'q33c', 'q33d', 'q34a', 'q34b', 'q34c', 'q34d'],
        max: 20
      },
      {
        name: 'Deliver - Customer',
        questions: ['q35'], // Customer delight
        subQuestions: ['q39a', 'q39b', 'q39c', 'q39d'],
        max: 20
      },
      {
        name: 'Deliver - People',
        questions: ['q40'], // Talent strategy
        subQuestions: ['q42a', 'q42b', 'q42c', 'q42d'],
        max: 15
      },
      {
        name: 'Deliver - Systems',
        questions: ['q43'], // Process documentation
        subQuestions: ['q45a', 'q45b', 'q45c', 'q45d'],
        max: 15
      },
      {
        name: 'Finance Engine',
        questions: ['q46'], // Budget/forecast
        subQuestions: ['q49a', 'q49b', 'q49c', 'q49d'],
        max: 10
      }
    ];

    return engines.map(engine => {
      let engineScore = 0;
      let maxPossible = 0;
      
      // Calculate score from regular questions
      engine.questions.forEach(qId => {
        const answer = answers[qId];
        if (answer?.points !== undefined) {
          engineScore += answer.points;
          maxPossible += 10; // Each question typically has max 10
        }
      });
      
      // Calculate score from sub-questions (yes/no)
      if (engine.subQuestions) {
        engine.subQuestions.forEach(qId => {
          const answer = answers[qId];
          if (answer) {
            if (answer.value === 'yes') {
              engineScore += 1; // 1 point per yes
            }
            maxPossible += 1;
          }
        });
      }
      
      // Scale to the engine's max points if we have any questions answered
      const scaledScore = maxPossible > 0 ? (engineScore / maxPossible) * engine.max : 0;
      const finalScore = Math.round(scaledScore);
      const percentage = Math.round((finalScore / engine.max) * 100);
      
      return {
        name: engine.name,
        score: finalScore,
        max: engine.max,
        percentage: Math.min(percentage, 100)
      };
    });
  };

  // Format revenue stage for display
  const formatRevenueStage = (value: string): string => {
    const stageMap: { [key: string]: string } = {
      'under_250k': 'Under $250K',
      '250k_1m': '$250K - $1M',
      '1m_3m': '$1M - $3M',
      '3m_5m': '$3M - $5M',
      '5m_10m': '$5M - $10M',
      'over_10m': 'Over $10M'
    };
    return stageMap[value] || value;
  };

  // Generate context message based on revenue and score
  const generateContextMessage = (revenue: string, score: number): string => {
    const revenueLevel = revenue.includes('3m') || revenue.includes('5m') || revenue.includes('10m') ? 'high' :
                         revenue.includes('1m') ? 'medium' : 'low';
    const scoreLevel = score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low';
    
    const messages: { [key: string]: string } = {
      'high-high': 'Excellent foundations at scale. Ready for exponential growth.',
      'high-medium': 'Good business at scale. Strengthen foundations to reduce risk.',
      'high-low': '⚠️ Vulnerable at scale. Critical to strengthen foundations.',
      'medium-high': 'Strong foundations with traction. Time to accelerate.',
      'medium-medium': 'Scaling steadily. Keep strengthening while you grow.',
      'medium-low': 'Found product-market fit. Build systems to scale sustainably.',
      'low-high': 'Exceptional foundations. Focus on revenue generation.',
      'low-medium': 'Building momentum. Good progress, keep going.',
      'low-low': 'Foundation stage. Perfect time to build right.'
    };
    
    return messages[`${revenueLevel}-${scoreLevel}`] || 'Building your business foundation.';
  };

  // Get score color and emoji
  const getScoreDisplay = (score: number) => {
    if (score >= 70) return { color: 'text-green-600', emoji: '🟢', label: 'STRONG' };
    if (score >= 50) return { color: 'text-yellow-600', emoji: '🟡', label: 'DEVELOPING' };
    return { color: 'text-red-600', emoji: '🔴', label: 'NEEDS FOCUS' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  const scoreDisplay = getScoreDisplay(score);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-lg font-medium text-gray-900">Assessment Results</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content - Simple and Clean */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Score Card - The Main Focus */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            YOUR BUSINESS SCORE
          </h2>
          
          <div className="mb-6">
            <span className={`text-6xl font-bold ${scoreDisplay.color}`}>
              {score}%
            </span>
            <span className="text-4xl ml-3">{scoreDisplay.emoji}</span>
          </div>
          
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-900 mb-2">
              Revenue Stage: {revenueStage}
            </p>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {contextMessage}
            </p>
          </div>
          
          <div className={`inline-block px-4 py-2 rounded-full ${
            score >= 70 ? 'bg-green-100 text-green-800' :
            score >= 50 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <span className="font-medium">{scoreDisplay.label}</span>
          </div>
        </div>



        {/* Expandable Details Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Detailed Section Analysis
            </h3>
            {showDetails ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {showDetails && (
            <div className="mt-6 space-y-6">
              {/* Main Sections Overview */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">5 Core Sections</h4>
                {sections.map((section) => (
                  <div key={section.name} className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700">{section.name}</span>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium mr-2 ${
                          section.percentage >= 70 ? 'text-green-600' :
                          section.percentage >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {section.percentage}%
                        </span>
                        <span className="text-xs text-gray-500">
                          ({section.score}/{section.max} pts)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          section.percentage >= 70 ? 'bg-green-500' :
                          section.percentage >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${section.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Strategic Wheel Components */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Strategic Wheel Components</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vision & Purpose</span>
                    <span className="font-medium">Q7-8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Strategy & Market</span>
                    <span className="font-medium">Q9-11</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">People & Culture</span>
                    <span className="font-medium">Q13-14</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Systems & Execution</span>
                    <span className="font-medium">Q15-16</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Money & Metrics</span>
                    <span className="font-medium">Q17-18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Communications</span>
                    <span className="font-medium">Q19-20</span>
                  </div>
                </div>
              </div>

              {/* Score Summary */}
              <div className="border-t pt-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Score:</span>
                    <span className="text-lg font-bold text-gray-900">{score}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Business Engines - Expandable */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <button
            onClick={() => setShowEngines(!showEngines)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Business Engines Breakdown
            </h3>
            {showEngines ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {showEngines && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-4">
                Your 6 Business Engines performance - focus on areas below 50%
              </p>
              
              <div className="space-y-3">
                {engines.map((engine) => (
                  <div key={engine.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {engine.name}
                      </span>
                      <div className="flex items-center">
                        <span className={`text-sm font-bold mr-2 ${
                          engine.percentage >= 70 ? 'text-green-600' :
                          engine.percentage >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {engine.percentage}%
                        </span>
                        <span className="text-xs text-gray-500">
                          ({engine.score}/{engine.max} pts)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          engine.percentage >= 70 ? 'bg-green-500' :
                          engine.percentage >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${engine.percentage}%` }}
                      />
                    </div>
                    {engine.percentage < 50 && (
                      <p className="text-xs text-red-600 mt-1">Priority area for improvement</p>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Summary box */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Engines Needing Attention:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  {engines
                    .filter(e => e.percentage < 50)
                    .sort((a, b) => a.percentage - b.percentage)
                    .slice(0, 3)
                    .map((e, i) => (
                      <li key={i}>
                        • {e.name} ({e.percentage}%)
                      </li>
                    ))}
                  {engines.filter(e => e.percentage < 50).length === 0 && (
                    <li>All engines performing above 50% - well done!</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Success Disciplines - Expandable */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <button
            onClick={() => setShowDisciplines(!showDisciplines)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Success Disciplines Analysis
            </h3>
            {showDisciplines ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {showDisciplines && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-4">
                Focus on disciplines scoring below 60% for maximum impact
              </p>
              
              <div className="space-y-2">
                {disciplines.map((discipline) => (
                  <div key={discipline.name} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{discipline.name}</span>
                    <div className="flex items-center">
                      <span className={`text-sm font-medium mr-2 ${
                        discipline.percentage >= 60 ? 'text-green-600' :
                        discipline.percentage >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {discipline.percentage}%
                      </span>
                      <span className="text-xs text-gray-500">
                        ({discipline.score}/5)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Top 3 disciplines to focus on */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Top 3 Disciplines to Focus On:
                </p>
                <ol className="text-sm text-blue-800 space-y-1">
                  {disciplines.slice(0, 3).map((d, i) => (
                    <li key={i}>
                      {i + 1}. {d.name} ({d.percentage}%)
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps Call to Action */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">
            Now Let's Set Your Goals
          </h3>
          <p className="mb-6 opacity-90">
            You know where you are. Let's define where you want to be in 90 days.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => router.push('/goals')}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium flex items-center"
            >
              Set My Goals
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}