'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { assessmentQuestions, successDisciplines } from './questions-data';

interface AssessmentResponses {
  [key: string]: any;
}

export default function AssessmentPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponses>({});
  const [showDisciplines, setShowDisciplines] = useState(false);
  const [currentDisciplineIndex, setCurrentDisciplineIndex] = useState(0);
  const [disciplineResponses, setDisciplineResponses] = useState<{[key: string]: (boolean | null)[]}>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Total questions including success disciplines section
  const totalQuestions = 54;
  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const currentSection = currentQuestion?.section;
  
  // Get section name
  const getSectionName = () => {
    if (showDisciplines) return 'Success Disciplines';
    const sectionNames = {
      1: 'Business Foundation',
      2: 'Strategic Wheel Assessment',
      3: 'Profitability Health Check',
      4: 'Business Engines Assessment',
      6: 'Strategic Priorities & Goals'
    };
    return sectionNames[currentSection as keyof typeof sectionNames] || '';
  };

  const questionsInCurrentSection = assessmentQuestions.filter(q => q.section === currentSection).length;
  const questionNumberInSection = assessmentQuestions
    .filter(q => q.section === currentSection)
    .findIndex(q => q.id === currentQuestion?.id) + 1;

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUser(user);
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_id')
      .eq('id', user.id)
      .single();
    
    if (profile?.business_id) {
      setBusinessId(profile.business_id);
    }
  };

  const isCurrentQuestionComplete = () => {
    if (showDisciplines) {
      const disciplineName = successDisciplines[currentDisciplineIndex].name;
      const answers = disciplineResponses[disciplineName] || [];
      return answers.length === 5 && answers.every(a => a !== null && a !== undefined);
    }
    
    const response = responses[`q${currentQuestion.id}`];
    
    if (currentQuestion.type === 'competitor') {
      // Only require 2 out of 3 competitors
      let filledCompetitors = 0;
      if (response?.competitor1?.name && response?.competitor1?.advantage) filledCompetitors++;
      if (response?.competitor2?.name && response?.competitor2?.advantage) filledCompetitors++;
      if (response?.competitor3?.name && response?.competitor3?.advantage) filledCompetitors++;
      return filledCompetitors >= 2;
    }
    
    if (currentQuestion.type === 'multiple') {
      return response && response.length > 0;
    }
    
    if (currentQuestion.type === 'yesno' && currentQuestion.subQuestions) {
      if (!response) return false;
      return currentQuestion.subQuestions.every(sub => 
        response[sub.id] === true || response[sub.id] === false
      );
    }
    
    if (currentQuestion.type === 'text') {
      return response && response.trim().length > 0;
    }
    
    return response !== undefined && response !== null && response !== '';
  };

  const handleResponse = (value: any) => {
    const newResponses = { ...responses };
    newResponses[`q${currentQuestion.id}`] = value;
    setResponses(newResponses);
    setShowIncompleteWarning(false);
    autoSave(newResponses);
  };

  const handleCompetitorResponse = (competitorNum: number, field: 'name' | 'advantage', value: string) => {
    const newResponses = { ...responses };
    if (!newResponses[`q${currentQuestion.id}`]) {
      newResponses[`q${currentQuestion.id}`] = {
        competitor1: { name: '', advantage: '' },
        competitor2: { name: '', advantage: '' },
        competitor3: { name: '', advantage: '' }
      };
    }
    newResponses[`q${currentQuestion.id}`][`competitor${competitorNum}`][field] = value;
    setResponses(newResponses);
    autoSave(newResponses);
  };

  const handleSubQuestionResponse = (subQuestionId: string, value: boolean) => {
    const newResponses = { ...responses };
    if (!newResponses[`q${currentQuestion.id}`]) {
      newResponses[`q${currentQuestion.id}`] = {};
    }
    newResponses[`q${currentQuestion.id}`][subQuestionId] = value;
    setResponses(newResponses);
    setShowIncompleteWarning(false);
    autoSave(newResponses);
  };

  const handleDisciplineResponse = (disciplineIndex: number, questionIndex: number, value: boolean) => {
    const newDisciplineResponses = { ...disciplineResponses };
    const disciplineName = successDisciplines[disciplineIndex].name;
    
    if (!newDisciplineResponses[disciplineName]) {
      newDisciplineResponses[disciplineName] = new Array(5).fill(null);
    }
    
    newDisciplineResponses[disciplineName] = [...newDisciplineResponses[disciplineName]];
    newDisciplineResponses[disciplineName][questionIndex] = value;
    setDisciplineResponses(newDisciplineResponses);
    setShowIncompleteWarning(false);
  };

  const autoSave = async (currentResponses: AssessmentResponses) => {
    if (!businessId || !user) return;
    
    setSaving(true);
    try {
      const completionPercentage = Math.round(
        (Object.keys(currentResponses).length / totalQuestions) * 100
      );
      
      await supabase
        .from('assessments')
        .upsert({
          business_id: businessId,
          completed_by: user.id,
          responses: currentResponses,
          completion_percentage: completionPercentage,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'business_id,completed_by'
        });
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (!isCurrentQuestionComplete()) {
      setShowIncompleteWarning(true);
      return;
    }
    
    setShowIncompleteWarning(false);
    
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (!showDisciplines) {
      setShowDisciplines(true);
      setCurrentDisciplineIndex(0);
    } else if (currentDisciplineIndex < successDisciplines.length - 1) {
      setCurrentDisciplineIndex(currentDisciplineIndex + 1);
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    setShowIncompleteWarning(false);
    
    if (showDisciplines) {
      if (currentDisciplineIndex > 0) {
        setCurrentDisciplineIndex(currentDisciplineIndex - 1);
      } else {
        setShowDisciplines(false);
        setCurrentQuestionIndex(assessmentQuestions.length - 1);
      }
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const completeAssessment = async () => {
    if (!businessId || !user) return;
    
    setLoading(true);
    try {
      const scores = calculateDetailedScores();
      
      const allResponses = {
        ...responses,
        disciplines: disciplineResponses
      };
      
      await supabase
        .from('assessments')
        .upsert({
          business_id: businessId,
          completed_by: user.id,
          responses: allResponses,
          score: scores.total,
          completion_percentage: 100,
          revenue_stage: getRevenueStage(responses.q1),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'business_id,completed_by'
        });
      
      setShowResults(true);
    } catch (error) {
      console.error('Error completing assessment:', error);
      alert('Error saving assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDetailedScores = () => {
    const scores = {
      foundation: 0,
      strategic: 0,
      profitability: 0,
      engines: {
        attract: 0,
        convert: 0,
        deliver: 0,
        finance: 0
      },
      disciplines: {} as any,
      priorities: 0,
      total: 0
    };

    // Section 1: Foundation (40 points max)
    for (let i = 1; i <= 6; i++) {
      const response = responses[`q${i}`];
      if (response) {
        const options = assessmentQuestions[i-1].options || [];
        const index = options.indexOf(response);
        scores.foundation += Math.max(0, (index / (options.length - 1)) * 6.67);
      }
    }

    // Section 2: Strategic Wheel (60 points max)
    for (let i = 7; i <= 20; i++) {
      const response = responses[`q${i}`];
      if (response && i !== 12) { // Skip competitor question
        const options = assessmentQuestions[i-1].options || [];
        const index = options.indexOf(response);
        scores.strategic += Math.max(0, (index / (options.length - 1)) * 4.3);
      }
    }

    // Section 3: Profitability (30 points max)
    for (let i = 21; i <= 26; i++) {
      const response = responses[`q${i}`];
      if (response) {
        if (i === 21) { // Multiple choice
          scores.profitability += response.length * 0.5;
        } else {
          const options = assessmentQuestions[i-1].options || [];
          const index = options.indexOf(response);
          scores.profitability += Math.max(0, (index / (options.length - 1)) * 5);
        }
      }
    }

    // Section 4: Business Engines
    // Attract (Q27-30)
    for (let i = 27; i <= 30; i++) {
      const response = responses[`q${i}`];
      if (i === 30 && response) {
        scores.engines.attract += Object.values(response).filter((v: any) => v === true).length * 1.25;
      } else if (response) {
        const options = assessmentQuestions[i-1].options || [];
        const index = options.indexOf(response);
        scores.engines.attract += Math.max(0, (index / (options.length - 1)) * 5);
      }
    }

    // Convert (Q31-34)
    for (let i = 31; i <= 34; i++) {
      const response = responses[`q${i}`];
      if ((i === 33 || i === 34) && response) {
        scores.engines.convert += Object.values(response).filter((v: any) => v === true).length * 1.25;
      } else if (response) {
        const options = assessmentQuestions[i-1].options || [];
        const index = options.indexOf(response);
        scores.engines.convert += Math.max(0, (index / (options.length - 1)) * 5);
      }
    }

    // Deliver (Q35-45)
    for (let i = 35; i <= 45; i++) {
      const response = responses[`q${i}`];
      if ((i === 39 || i === 42 || i === 45) && response) {
        scores.engines.deliver += Object.values(response).filter((v: any) => v === true).length * 1.25;
      } else if (i !== 36 && response) { // Skip text question
        const options = assessmentQuestions[i-1].options || [];
        const index = options.indexOf(response);
        scores.engines.deliver += Math.max(0, (index / (options.length - 1)) * 5);
      }
    }

    // Finance (Q46-49)
    for (let i = 46; i <= 49; i++) {
      const response = responses[`q${i}`];
      if (i === 49 && response) {
        scores.engines.finance += Object.values(response).filter((v: any) => v === true).length * 1.25;
      } else if (response) {
        const options = assessmentQuestions[i-1].options || [];
        const index = options.indexOf(response);
        scores.engines.finance += Math.max(0, (index / (options.length - 1)) * 5);
      }
    }

    // Success Disciplines (60 points max)
    Object.entries(disciplineResponses).forEach(([discipline, answers]: [string, any]) => {
      const score = answers.filter((a: boolean) => a === true).length;
      scores.disciplines[discipline] = score;
      scores.total += score;
    });

    // Calculate total
    scores.total = Math.round(
      scores.foundation + 
      scores.strategic + 
      scores.profitability + 
      scores.engines.attract + 
      scores.engines.convert + 
      scores.engines.deliver + 
      scores.engines.finance +
      Object.values(scores.disciplines).reduce((a: number, b: any) => a + b, 0)
    );

    return scores;
  };

  const getRevenueStage = (response: string) => {
    if (!response) return 'foundation';
    if (response.includes('Foundation')) return 'foundation';
    if (response.includes('Traction')) return 'traction';
    if (response.includes('Scaling')) return 'scaling';
    if (response.includes('Optimization')) return 'optimization';
    if (response.includes('Leadership')) return 'leadership';
    if (response.includes('Mastery')) return 'mastery';
    return 'foundation';
  };

  const getHealthStatus = (score: number) => {
    const percentage = (score / 290) * 100;
    if (percentage >= 90) return { status: 'THRIVING', color: 'bg-gradient-to-br from-green-500 to-emerald-600', textColor: 'text-white', description: 'Your business is firing on all cylinders!' };
    if (percentage >= 80) return { status: 'STRONG', color: 'bg-gradient-to-br from-green-400 to-green-500', textColor: 'text-white', description: 'Solid foundation with clear growth path' };
    if (percentage >= 70) return { status: 'STABLE', color: 'bg-gradient-to-br from-yellow-400 to-amber-500', textColor: 'text-white', description: 'Good progress with opportunities to optimize' };
    if (percentage >= 60) return { status: 'BUILDING', color: 'bg-gradient-to-br from-orange-400 to-orange-500', textColor: 'text-white', description: 'Foundation developing, focused effort needed' };
    if (percentage >= 50) return { status: 'STRUGGLING', color: 'bg-gradient-to-br from-red-400 to-red-500', textColor: 'text-white', description: 'Major gaps requiring immediate attention' };
    return { status: 'URGENT', color: 'bg-gradient-to-br from-red-600 to-red-700', textColor: 'text-white', description: 'Critical issues need urgent action' };
  };

  const progressPercentage = showDisciplines 
    ? Math.round(((assessmentQuestions.length + currentDisciplineIndex + 1) / (assessmentQuestions.length + successDisciplines.length)) * 100)
    : Math.round(((currentQuestionIndex + 1) / (assessmentQuestions.length + successDisciplines.length)) * 100);

  if (showResults) {
    const scores = calculateDetailedScores();
    const healthStatus = getHealthStatus(scores.total);
    const percentage = Math.round((scores.total / 290) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h1 className="text-4xl font-bold text-center mb-2">Business Assessment Report</h1>
            <p className="text-center text-gray-600">Comprehensive analysis of your business health</p>
          </div>

          {/* Overall Score Card */}
          <div className={`rounded-2xl shadow-xl p-8 mb-8 ${healthStatus.color} ${healthStatus.textColor}`}>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Overall Business Health</h2>
              <div className="text-7xl font-bold my-6">{healthStatus.status}</div>
              <div className="text-5xl font-bold">{scores.total}/290</div>
              <div className="text-2xl mt-2 opacity-90">({percentage}%)</div>
              <p className="text-lg mt-4 opacity-90">{healthStatus.description}</p>
            </div>
          </div>

          {/* Section Scores */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Foundation Score */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Business Foundation</h3>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className="font-bold">{Math.round(scores.foundation)}/40</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${(scores.foundation / 40) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {scores.foundation >= 32 ? 'Excellent foundation in place' : 
                 scores.foundation >= 24 ? 'Good foundation with room to grow' :
                 scores.foundation >= 16 ? 'Foundation needs strengthening' :
                 'Critical foundation gaps to address'}
              </p>
            </div>

            {/* Strategic Wheel Score */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Strategic Wheel</h3>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className="font-bold">{Math.round(scores.strategic)}/60</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full"
                    style={{ width: `${(scores.strategic / 60) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {scores.strategic >= 48 ? 'Strategic clarity and alignment excellent' : 
                 scores.strategic >= 36 ? 'Good strategic direction' :
                 scores.strategic >= 24 ? 'Strategic planning needs focus' :
                 'Major strategic gaps to address'}
              </p>
            </div>

            {/* Profitability Score */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Profitability Health</h3>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className="font-bold">{Math.round(scores.profitability)}/30</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${(scores.profitability / 30) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {scores.profitability >= 24 ? 'Excellent profit management' : 
                 scores.profitability >= 18 ? 'Good profitability practices' :
                 scores.profitability >= 12 ? 'Profit optimization needed' :
                 'Critical profit issues to address'}
              </p>
            </div>

            {/* Business Engines Combined */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Business Engines</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Attract</span>
                    <span className="text-sm font-bold">{Math.round(scores.engines.attract)}/20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(scores.engines.attract / 20) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Convert</span>
                    <span className="text-sm font-bold">{Math.round(scores.engines.convert)}/20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(scores.engines.convert / 20) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Deliver</span>
                    <span className="text-sm font-bold">{Math.round(scores.engines.deliver)}/60</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(scores.engines.deliver / 60) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Finance</span>
                    <span className="text-sm font-bold">{Math.round(scores.engines.finance)}/20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(scores.engines.finance / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Disciplines */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Success Disciplines Performance</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(scores.disciplines).map(([discipline, score]: [string, any]) => (
                <div key={discipline} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{discipline}</span>
                    <span className={`font-bold ${
                      score >= 4 ? 'text-green-600' : 
                      score >= 2 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>{score}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        score >= 4 ? 'bg-green-500' : 
                        score >= 2 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Business Profile</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Revenue Stage:</span>
                  <p className="font-bold text-blue-600">{responses.q1 || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Profit Margin:</span>
                  <p className="font-bold text-green-600">{responses.q2 || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Team Size:</span>
                  <p className="font-bold text-purple-600">{responses.q4 || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Strategic Priorities</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Biggest Constraint:</span>
                  <p className="text-sm font-medium">{responses.q50 || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Biggest Opportunity:</span>
                  <p className="text-sm font-medium">{responses.q51 || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">90-Day Priority:</span>
                  <p className="text-sm font-medium">{responses.q52 || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.print()}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-lg"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion && !showDisciplines) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Assessment</h1>
              <p className="text-sm text-gray-600 mt-1">
                Section {showDisciplines ? 5 : currentSection} of 6: {getSectionName()}
                {showDisciplines 
                  ? ` (${currentDisciplineIndex + 1} of ${successDisciplines.length})`
                  : ` - Question ${questionNumberInSection} of ${questionsInCurrentSection}`}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Save & Exit
            </button>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            {progressPercentage}% Complete
            {saving && <span className="ml-2 text-green-600">Saving...</span>}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {showIncompleteWarning && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">
                {currentQuestion?.type === 'competitor' 
                  ? 'Please complete at least 2 competitors before continuing.'
                  : 'Please answer all parts of this question before continuing.'}
              </p>
            </div>
          )}
          
          {showDisciplines ? (
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {successDisciplines[currentDisciplineIndex].name}
              </h2>
              <p className="text-gray-600 mb-6">
                Answer Yes or No for each statement:
              </p>
              
              <div className="space-y-4">
                {successDisciplines[currentDisciplineIndex].questions.map((question, index) => {
                  const disciplineName = successDisciplines[currentDisciplineIndex].name;
                  const currentValue = disciplineResponses[disciplineName]?.[index];
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <p className="mb-3">{question}</p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleDisciplineResponse(currentDisciplineIndex, index, true)}
                          className={`px-6 py-2 rounded-lg font-medium transition-all ${
                            currentValue === true
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleDisciplineResponse(currentDisciplineIndex, index, false)}
                          className={`px-6 py-2 rounded-lg font-medium transition-all ${
                            currentValue === false
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-2">{currentQuestion.sectionName}</h2>
              <p className="text-lg mb-6">{currentQuestion.question}</p>
              
              {currentQuestion.type === 'single' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleResponse(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        responses[`q${currentQuestion.id}`] === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              
              {currentQuestion.type === 'competitor' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 italic">* Please complete at least 2 competitors</p>
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">Competitor {num} {num <= 2 && <span className="text-red-500">*</span>}</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Competitor name..."
                          value={responses[`q${currentQuestion.id}`]?.[`competitor${num}`]?.name || ''}
                          onChange={(e) => handleCompetitorResponse(num, 'name', e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="What makes you different from them..."
                          value={responses[`q${currentQuestion.id}`]?.[`competitor${num}`]?.advantage || ''}
                          onChange={(e) => handleCompetitorResponse(num, 'advantage', e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {currentQuestion.type === 'multiple' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isChecked = responses[`q${currentQuestion.id}`]?.includes(option);
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          const current = responses[`q${currentQuestion.id}`] || [];
                          const updated = isChecked
                            ? current.filter((item: string) => item !== option)
                            : [...current, option];
                          handleResponse(updated);
                        }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center">
                          <span className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                            isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                          }`}>
                            {isChecked && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              
              {currentQuestion.type === 'yesno' && currentQuestion.subQuestions && (
                <div className="space-y-4">
                  {currentQuestion.subQuestions.map((subQ) => (
                    <div key={subQ.id} className="border rounded-lg p-4">
                      <p className="mb-3">{subQ.text}</p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleSubQuestionResponse(subQ.id, true)}
                          className={`px-6 py-2 rounded-lg font-medium transition-all ${
                            responses[`q${currentQuestion.id}`]?.[subQ.id] === true
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleSubQuestionResponse(subQ.id, false)}
                          className={`px-6 py-2 rounded-lg font-medium transition-all ${
                            responses[`q${currentQuestion.id}`]?.[subQ.id] === false
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {currentQuestion.type === 'text' && (
                <textarea
                  value={responses[`q${currentQuestion.id}`] || ''}
                  onChange={(e) => handleResponse(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Type your answer here..."
                />
              )}
            </div>
          )}
          
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 && !showDisciplines && currentDisciplineIndex === 0}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 
               (showDisciplines && currentDisciplineIndex === successDisciplines.length - 1) ? 'Complete Assessment' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}