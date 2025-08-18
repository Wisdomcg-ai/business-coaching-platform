import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export interface AssessmentSummary {
  id: string;
  user_id: string;
  status: string;
  answers: any;
  total_score: number;
  percentage: number;
  health_status: string;
  revenue_stage: string;
  created_at: string;
  business_foundation_score: number;
  strategic_wheel_score: number;
  profitability_health_score: number;
  business_engines_score: number;
  success_disciplines_score: number;
  biggest_constraint?: string;
  biggest_opportunity?: string;
  ninety_day_priority?: string;
}

export interface DashboardData {
  assessments: AssessmentSummary[];
  latestAssessment: AssessmentSummary | null;
  totalAssessments: number;
  averageScore: number;
  scoreImprovement: number;
  healthTrend: 'improving' | 'declining' | 'stable';
}

// Score calculation functions for each section
function calculateBusinessFoundationScore(answers: any): number {
  if (!answers) return 0;
  
  let score = 0;
  
  // Section 1 scoring (Questions 1-6) - Max 40 points
  if (answers?.q1) {
    const revenueScores: {[key: string]: number} = {
      'under_250k': 2,
      '250k_1m': 4,
      '1m_3m': 6,
      '3m_5m': 8,
      '5m_10m': 9,
      '10m_plus': 10
    };
    score += revenueScores[answers.q1] || 0;
  }
  
  if (answers?.q2) {
    const profitScores: {[key: string]: number} = {
      'losing': 0,
      'breakeven': 2,
      'small_profit': 4,
      'healthy_profit': 6,
      'strong_profit': 8,
      'exceptional_profit': 10
    };
    score += profitScores[answers.q2] || 0;
  }
  
  if (answers?.q3) {
    const salaryScores: {[key: string]: number} = {
      'no_salary': 0,
      'sometimes': 2,
      'below_market': 3,
      'market_rate': 4,
      'plus_distributions': 5
    };
    score += salaryScores[answers.q3] || 0;
  }
  
  if (answers?.q5) {
    const dependencyScores: {[key: string]: number} = {
      'completely': 0,
      'very': 2,
      'somewhat': 4,
      'minimal': 5
    };
    score += dependencyScores[answers.q5] || 0;
  }
  
  if (answers?.q6) {
    const predictabilityScores: {[key: string]: number} = {
      'unpredictable': 0,
      'somewhat_predictable': 3,
      'very_predictable': 7,
      'extremely_predictable': 10
    };
    score += predictabilityScores[answers.q6] || 0;
  }
  
  return score;
}

function calculateStrategicWheelScore(answers: any): number {
  if (!answers) return 0;
  
  let score = 0;
  
  // Section 2 scoring (Questions 7-20) - Max 60 points
  const scoreMap: {[key: string]: number} = {
    'very_unclear': 0,
    'no_understanding': 0,
    'serve_anyone': 0,
    'price_competition': 0,
    'struggling': 0,
    'no_values': 0,
    'ad_hoc': 0,
    'irregular': 0,
    'no_tracking': 0,
    'no_idea': 0,
    'no_alignment': 0,
    'scattered': 0,
    
    'somewhat_clear': 2,
    'some_understanding': 2,
    'general_market': 2,
    'some_differentiation': 2,
    'adequate': 2,
    'values_exist': 2,
    'some_systems': 2,
    'some_meetings': 2,
    'basic_monthly': 2,
    'many_metrics': 2,
    'some_alignment': 2,
    'multiple_channels': 2,
    
    'clear': 4,
    'good_understanding': 4,
    'specific_customer': 4,
    'clear_value': 4,
    'good_team': 4,
    'values_guide': 4,
    'good_systems': 4,
    'weekly_meetings': 4,
    'weekly_dashboard': 4,
    'key_metric': 4,
    'good_alignment': 4,
    'streamlined': 4,
    
    'crystal_clear': 5,
    'complete_alignment': 5,
    'laser_focused': 5,
    'dominant_position': 5,
    'a_players': 5,
    'values_drive': 5,
    'exceptional_systems': 5,
    'daily_weekly_monthly': 5,
    'realtime_dashboard': 5,
    'one_number_drives': 5,
    'perfect_alignment': 5,
    'one_platform': 5
  };
  
  // Questions 7-20
  for (let i = 7; i <= 20; i++) {
    const answer = answers?.[`q${i}`];
    if (answer && scoreMap[answer] !== undefined) {
      score += scoreMap[answer];
    }
  }
  
  // Add USP scoring for q11
  if (answers?.q11) {
    const uspScores: {[key: string]: number} = {
      'dont_know': 0,
      'some_ideas': 1,
      'defined_not_used': 2,
      'clear_used': 4,
      'powerful_usps': 5
    };
    score += uspScores[answers.q11] || 0;
  }
  
  return Math.min(score, 60); // Cap at max 60
}

function calculateProfitabilityScore(answers: any): number {
  if (!answers) return 0;
  
  let score = 0;
  
  // Section 3 scoring (Questions 22-26) - Max 30 points
  if (answers?.q22) {
    const priceIncreaseScores: {[key: string]: number} = {
      'never': 0,
      '1_2_years': 2,
      '6_12_months': 4,
      'within_6_months': 5
    };
    score += priceIncreaseScores[answers.q22] || 0;
  }
  
  if (answers?.q23) {
    const confidenceScores: {[key: string]: number} = {
      'very_unsure': 0,
      'somewhat_confident': 2,
      'confident': 4,
      'very_confident': 5
    };
    score += confidenceScores[answers.q23] || 0;
  }
  
  if (answers?.q24) {
    const reviewScores: {[key: string]: number} = {
      'never': 0,
      'annually': 2,
      'quarterly': 4,
      'monthly': 5
    };
    score += reviewScores[answers.q24] || 0;
  }
  
  if (answers?.q25) {
    const auditScores: {[key: string]: number} = {
      'no_probably': 0,
      'occasionally': 2,
      'annual': 4,
      'quarterly': 5
    };
    score += auditScores[answers.q25] || 0;
  }
  
  if (answers?.q26) {
    const negotiationScores: {[key: string]: number} = {
      'never': 0,
      'within_2_years': 3,
      'within_year': 7,
      'within_6_months': 10
    };
    score += negotiationScores[answers.q26] || 0;
  }
  
  return score;
}

function calculateBusinessEnginesScore(answers: any): number {
  if (!answers) return 0;
  
  let score = 0;
  
  // Section 4 - Business Engines (Max 100 points, 20 per engine)
  
  // Attract Engine (Q27-Q30)
  const leadScores: {[key: string]: number} = {
    'under_20': 1,
    '20_50': 2,
    '50_100': 4,
    '100_plus': 5
  };
  score += leadScores[answers?.q27] || 0;
  
  const channelScores: {[key: string]: number} = {
    'no_consistent': 0,
    '1_2_inconsistent': 2,
    '3_4_regular': 4,
    '5_plus': 5
  };
  score += channelScores[answers?.q28] || 0;
  
  // Process documentation scores
  const processScores: {[key: string]: number} = {
    'no_process': 0,
    'have_dont_follow': 1,
    'follow_sometimes': 3,
    'follow_consistently': 5
  };
  score += processScores[answers?.q29] || 0;
  score += processScores[answers?.q32] || 0;
  score += processScores[answers?.q37] || 0;
  
  // Yes/No questions (Q30, Q33, Q34, Q39, Q42, Q45, Q49)
  const yesNoQuestions = ['q30', 'q33', 'q34', 'q39', 'q42', 'q45', 'q49'];
  yesNoQuestions.forEach(q => {
    if (answers?.[q]) {
      const yesCount = (answers[q].match(/yes/gi) || []).length;
      score += yesCount * 1.25;
    }
  });
  
  // Convert Engine scores
  const conversionScores: {[key: string]: number} = {
    'under_15': 1,
    '15_25': 2,
    '25_40': 4,
    'over_40': 5
  };
  score += conversionScores[answers?.q31] || 0;
  
  // Deliver Engine scores
  const satisfactionScores: {[key: string]: number} = {
    'under_60': 1,
    '60_75': 2,
    '75_90': 4,
    'over_90': 5
  };
  score += satisfactionScores[answers?.q35] || 0;
  
  const measureScores: {[key: string]: number} = {
    'dont_measure': 0,
    'informal': 2,
    'regular_surveys': 4,
    'comprehensive': 5
  };
  score += measureScores[answers?.q38] || 0;
  
  // People & Team scores
  const talentScores: {[key: string]: number} = {
    'reactive': 0,
    'basic': 2,
    'good_hiring': 4,
    'systematic': 5
  };
  score += talentScores[answers?.q40] || 0;
  
  const performanceScores: {[key: string]: number} = {
    'no_formal': 0,
    'informal': 2,
    'regular_no_criteria': 3,
    'systematic': 5
  };
  score += performanceScores[answers?.q41] || 0;
  
  // Systems scores
  const documentationScores: {[key: string]: number} = {
    'in_heads': 0,
    'some_documented': 2,
    'most_documented': 4,
    'all_documented': 5
  };
  score += documentationScores[answers?.q43] || 0;
  
  const auditScores: {[key: string]: number} = {
    'never_audit': 0,
    'when_problems': 2,
    'annual': 3,
    'quarterly': 5
  };
  score += auditScores[answers?.q44] || 0;
  
  // Finance Engine scores
  const budgetScores: {[key: string]: number} = {
    'no_budget': 0,
    'basic_tracking': 2,
    'annual_budget': 3,
    'detailed_variance': 5
  };
  score += budgetScores[answers?.q46] || 0;
  
  const cashFlowScores: {[key: string]: number} = {
    'no_forecast': 0,
    'check_when_needed': 2,
    'monthly_review': 3,
    '13_week_rolling': 5
  };
  score += cashFlowScores[answers?.q47] || 0;
  
  const pricingScores: {[key: string]: number} = {
    'not_sure': 0,
    'understand_difference': 2,
    'calculate_both': 3,
    'optimize_pricing': 5
  };
  score += pricingScores[answers?.q48] || 0;
  
  return Math.min(score, 100); // Cap at max 100
}

function calculateSuccessDisciplinesScore(answers: any): number {
  if (!answers) return 0;
  
  let score = 0;
  
  // Section 5 - Success Disciplines (12 disciplines × 5 questions = 60 max)
  for (let d = 1; d <= 12; d++) {
    const disciplineKey = `discipline_${d}`;
    if (answers?.[disciplineKey]) {
      const yesCount = (answers[disciplineKey].match(/yes/gi) || []).length;
      score += yesCount; // 1 point per yes, max 5 per discipline
    }
  }
  
  return Math.min(score, 60);
}

// Estimate section scores from total score if answers are missing
function estimateSectionScores(totalScore: number) {
  const percentage = totalScore / 290;
  
  return {
    business_foundation_score: Math.round(40 * percentage),
    strategic_wheel_score: Math.round(60 * percentage),
    profitability_health_score: Math.round(30 * percentage),
    business_engines_score: Math.round(100 * percentage),
    success_disciplines_score: Math.round(60 * percentage)
  };
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = createClientComponentClient<Database>();

  try {
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return {
        assessments: [],
        latestAssessment: null,
        totalAssessments: 0,
        averageScore: 0,
        scoreImprovement: 0,
        healthTrend: 'stable'
      };
    }

    if (!assessments || assessments.length === 0) {
      return {
        assessments: [],
        latestAssessment: null,
        totalAssessments: 0,
        averageScore: 0,
        scoreImprovement: 0,
        healthTrend: 'stable'
      };
    }

    // Process assessments and calculate section scores
    const processedAssessments = assessments.map(a => {
      let business_foundation_score = 0;
      let strategic_wheel_score = 0;
      let profitability_health_score = 0;
      let business_engines_score = 0;
      let success_disciplines_score = 0;
      let biggest_constraint = '';
      let biggest_opportunity = '';
      let ninety_day_priority = '';
      
      // If answers exist, calculate actual scores
      if (a.answers && typeof a.answers === 'object' && Object.keys(a.answers).length > 0) {
        business_foundation_score = calculateBusinessFoundationScore(a.answers);
        strategic_wheel_score = calculateStrategicWheelScore(a.answers);
        profitability_health_score = calculateProfitabilityScore(a.answers);
        business_engines_score = calculateBusinessEnginesScore(a.answers);
        success_disciplines_score = calculateSuccessDisciplinesScore(a.answers);
        
        // Extract open-ended answers
        biggest_constraint = a.answers?.q50 || '';
        biggest_opportunity = a.answers?.q51 || '';
        ninety_day_priority = a.answers?.q52 || '';
      } else {
        // If no answers, estimate based on total score
        console.warn('Assessment has no answers data, estimating section scores from total score');
        const estimated = estimateSectionScores(a.total_score || 0);
        business_foundation_score = estimated.business_foundation_score;
        strategic_wheel_score = estimated.strategic_wheel_score;
        profitability_health_score = estimated.profitability_health_score;
        business_engines_score = estimated.business_engines_score;
        success_disciplines_score = estimated.success_disciplines_score;
      }
      
      // Calculate percentage
      const calculatedPercentage = Math.round((a.total_score / 290) * 100);
      
      return {
        ...a,
        business_foundation_score,
        strategic_wheel_score,
        profitability_health_score,
        business_engines_score,
        success_disciplines_score,
        biggest_constraint,
        biggest_opportunity,
        ninety_day_priority,
        percentage: a.percentage || calculatedPercentage
      };
    });

    // Calculate metrics
    const totalAssessments = processedAssessments.length;
    const latestAssessment = processedAssessments[0];
    
    // Calculate average score
    const totalScores = processedAssessments.reduce((sum, a) => sum + (a.percentage || 0), 0);
    const averageScore = Math.round(totalScores / totalAssessments);
    
    // Calculate improvement and trend
    let scoreImprovement = 0;
    let healthTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (processedAssessments.length > 1) {
      const firstAssessment = processedAssessments[processedAssessments.length - 1];
      scoreImprovement = (latestAssessment.percentage || 0) - (firstAssessment.percentage || 0);
      
      if (processedAssessments.length >= 2) {
        const secondLatest = processedAssessments[1];
        const latestScore = latestAssessment.percentage || 0;
        const secondScore = secondLatest.percentage || 0;
        
        if (latestScore > secondScore + 2) {
          healthTrend = 'improving';
        } else if (latestScore < secondScore - 2) {
          healthTrend = 'declining';
        }
      }
    }

    console.log('Latest assessment:', {
      hasAnswers: !!latestAssessment?.answers,
      totalScore: latestAssessment?.total_score,
      percentage: latestAssessment?.percentage,
      foundation: latestAssessment?.business_foundation_score,
      strategic: latestAssessment?.strategic_wheel_score,
      profitability: latestAssessment?.profitability_health_score,
      engines: latestAssessment?.business_engines_score,
      disciplines: latestAssessment?.success_disciplines_score
    });

    return {
      assessments: processedAssessments,
      latestAssessment,
      totalAssessments,
      averageScore,
      scoreImprovement,
      healthTrend
    };
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    return {
      assessments: [],
      latestAssessment: null,
      totalAssessments: 0,
      averageScore: 0,
      scoreImprovement: 0,
      healthTrend: 'stable'
    };
  }
}

export function getRecommendations(assessment: AssessmentSummary | null): string[] {
  if (!assessment) {
    return [
      'Complete your first business assessment to get personalized recommendations',
      'Set up your business profile for better insights',
      'Review the Strategic Wheel framework to understand key business components'
    ];
  }

  // If we don't have detailed scores, provide general recommendations
  if (!assessment.answers || Object.keys(assessment.answers || {}).length === 0) {
    return [
      'Complete a new assessment with all questions to get detailed section scores',
      'Your current assessment data is incomplete - retake for personalized insights',
      'Visit the assessment page to complete a comprehensive business evaluation'
    ];
  }

  const recommendations: string[] = [];
  
  const scores = [
    { 
      area: 'Business Foundation', 
      score: assessment.business_foundation_score || 0, 
      max: 40,
      action: 'Focus on revenue predictability and reducing owner dependency'
    },
    { 
      area: 'Strategic Wheel', 
      score: assessment.strategic_wheel_score || 0, 
      max: 60,
      action: 'Clarify your vision, strategy, and team alignment'
    },
    { 
      area: 'Profitability Health', 
      score: assessment.profitability_health_score || 0, 
      max: 30,
      action: 'Review pricing strategy and implement cost management'
    },
    { 
      area: 'Business Engines', 
      score: assessment.business_engines_score || 0, 
      max: 100,
      action: 'Optimize marketing, sales, and delivery systems'
    },
    { 
      area: 'Success Disciplines', 
      score: assessment.success_disciplines_score || 0, 
      max: 60,
      action: 'Prioritize your top 3 disciplines for 90-day focus'
    }
  ];
  
  // Sort by percentage score (lowest first)
  scores.sort((a, b) => {
    const aPercent = a.max > 0 ? (a.score / a.max) : 0;
    const bPercent = b.max > 0 ? (b.score / b.max) : 0;
    return aPercent - bPercent;
  });
  
  const lowestScores = scores.slice(0, 3);
  
  lowestScores.forEach(item => {
    const percentage = item.max > 0 ? Math.round((item.score / item.max) * 100) : 0;
    recommendations.push(`${item.area} (${percentage}%): ${item.action}`);
  });
  
  return recommendations;
}

export function getHealthStatusColor(status: string): string {
  const statusColors: { [key: string]: string } = {
    'THRIVING': 'text-green-600 bg-green-100',
    'STRONG': 'text-emerald-600 bg-emerald-100',
    'STABLE': 'text-yellow-600 bg-yellow-100',
    'BUILDING': 'text-orange-600 bg-orange-100',
    'STRUGGLING': 'text-red-600 bg-red-100',
    'URGENT': 'text-red-700 bg-red-200'
  };
  return statusColors[status] || 'text-gray-600 bg-gray-100';
}

export function getRevenueStageColor(stage: string): string {
  const stageColors: { [key: string]: string } = {
    'FOUNDATION': 'text-blue-600 bg-blue-100',
    'TRACTION': 'text-indigo-600 bg-indigo-100',
    'SCALING': 'text-purple-600 bg-purple-100',
    'OPTIMIZATION': 'text-pink-600 bg-pink-100',
    'LEADERSHIP': 'text-amber-600 bg-amber-100',
    'MASTERY': 'text-green-600 bg-green-100'
  };
  return stageColors[stage] || 'text-gray-600 bg-gray-100';
}