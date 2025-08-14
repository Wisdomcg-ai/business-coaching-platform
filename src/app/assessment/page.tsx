'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

type Question = {
  id: string
  section: string
  sectionTitle: string
  question: string
  type: 'radio' | 'checkbox' | 'text' | 'multicheck' | 'yesno'
  options?: { value: string; label: string; points?: number }[]
  subQuestions?: string[] // For Yes/No questions
}

const questions: Question[] = [
  // SECTION 1: BUSINESS FOUNDATION (6 questions)
  {
    id: 'revenue_stage',
    section: '1',
    sectionTitle: 'BUSINESS FOUNDATION',
    question: "What's your current annual revenue?",
    type: 'radio',
    options: [
      { value: 'foundation', label: 'Under $250K (Foundation Stage)', points: 2 },
      { value: 'traction', label: '$250K - $1M (Traction Stage)', points: 4 },
      { value: 'scaling', label: '$1M - $3M (Scaling Stage)', points: 6 },
      { value: 'optimization', label: '$3M - $5M (Optimization Stage)', points: 8 },
      { value: 'leadership', label: '$5M - $10M (Leadership Stage)', points: 9 },
      { value: 'mastery', label: '$10M+ (Mastery Stage)', points: 10 }
    ]
  },
  {
    id: 'profit_margin',
    section: '1',
    sectionTitle: 'BUSINESS FOUNDATION',
    question: "What's your current profit margin?",
    type: 'radio',
    options: [
      { value: 'losing', label: 'Losing money', points: 0 },
      { value: 'breakeven', label: 'Breaking even (0-5%)', points: 2 },
      { value: 'small', label: 'Small profit (5-10%)', points: 4 },
      { value: 'healthy', label: 'Healthy profit (10-15%)', points: 6 },
      { value: 'strong', label: 'Strong profit (15-20%)', points: 8 },
      { value: 'exceptional', label: 'Exceptional profit (20%+)', points: 10 }
    ]
  },
  {
    id: 'owner_salary',
    section: '1',
    sectionTitle: 'BUSINESS FOUNDATION',
    question: 'Are you paying yourself a market-rate salary consistently?',
    type: 'radio',
    options: [
      { value: 'no_rarely', label: 'No - rarely take money out', points: 0 },
      { value: 'sometimes', label: 'Sometimes - when cash flow allows', points: 2 },
      { value: 'below_market', label: 'Yes - regular salary below market', points: 3 },
      { value: 'market_rate', label: 'Yes - full market-rate salary', points: 4 },
      { value: 'plus_distributions', label: 'Yes - salary plus profit distributions', points: 5 }
    ]
  },
  {
    id: 'team_size',
    section: '1',
    sectionTitle: 'BUSINESS FOUNDATION',
    question: 'How many people work in your business?',
    type: 'radio',
    options: [
      { value: 'solo', label: 'Just me', points: 0 },
      { value: 'small', label: '2-5 people', points: 0 },
      { value: 'medium', label: '6-15 people', points: 0 },
      { value: 'large', label: '16-50 people', points: 0 },
      { value: 'enterprise', label: '50+ people', points: 0 }
    ]
  },
  {
    id: 'business_dependency',
    section: '1',
    sectionTitle: 'BUSINESS FOUNDATION',
    question: 'How dependent is the business on you personally?',
    type: 'radio',
    options: [
      { value: 'completely', label: 'Completely - stops without me', points: 0 },
      { value: 'very', label: 'Very - needs me for most decisions', points: 2 },
      { value: 'somewhat', label: 'Somewhat - can run for short periods', points: 4 },
      { value: 'minimal', label: 'Minimal - runs well without me', points: 5 }
    ]
  },
  {
    id: 'revenue_predictability',
    section: '1',
    sectionTitle: 'BUSINESS FOUNDATION',
    question: 'How predictable is your monthly revenue?',
    type: 'radio',
    options: [
      { value: 'unpredictable', label: 'Completely unpredictable - varies wildly', points: 0 },
      { value: 'somewhat', label: 'Somewhat predictable - within 50%', points: 3 },
      { value: 'very', label: 'Very predictable - within 25%', points: 7 },
      { value: 'recurring', label: 'Extremely predictable - recurring revenue', points: 10 }
    ]
  },

  // SECTION 2: STRATEGIC WHEEL (14 questions)
  {
    id: 'vision_clarity',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'How clear and compelling is your business vision?',
    type: 'radio',
    options: [
      { value: 'unclear', label: 'Very unclear - no defined direction', points: 0 },
      { value: 'somewhat', label: 'Somewhat clear - general idea', points: 2 },
      { value: 'clear', label: 'Clear - team understands it', points: 4 },
      { value: 'crystal', label: 'Crystal clear - guides all decisions', points: 5 }
    ]
  },
  {
    id: 'team_alignment',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'Does your team understand and believe in your purpose?',
    type: 'radio',
    options: [
      { value: 'no_understanding', label: 'No understanding or buy-in', points: 0 },
      { value: 'some', label: 'Some understanding, limited buy-in', points: 2 },
      { value: 'good', label: 'Good understanding and buy-in', points: 4 },
      { value: 'complete', label: 'Complete alignment and passion', points: 5 }
    ]
  },
  {
    id: 'target_market',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'How well-defined is your target market and positioning?',
    type: 'radio',
    options: [
      { value: 'anyone', label: 'Serve anyone who will pay', points: 0 },
      { value: 'general', label: 'General target market defined', points: 2 },
      { value: 'specific', label: 'Specific ideal customer profile', points: 4 },
      { value: 'laser', label: 'Laser-focused with clear differentiation', points: 5 }
    ]
  },
  {
    id: 'competitive_advantage',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'Do you have a sustainable competitive advantage?',
    type: 'radio',
    options: [
      { value: 'price_only', label: 'Compete mainly on price', points: 0 },
      { value: 'some', label: 'Some differentiation', points: 2 },
      { value: 'clear', label: 'Clear unique value proposition', points: 4 },
      { value: 'dominant', label: 'Dominant market position', points: 5 }
    ]
  },
  {
    id: 'usp_usage',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'Have you clearly defined and do you actively use your Unique Selling Propositions (USPs)?',
    type: 'radio',
    options: [
      { value: 'none', label: "Don't know what makes us different", points: 0 },
      { value: 'ideas', label: 'Have some ideas but not clearly defined', points: 1 },
      { value: 'defined_not_used', label: 'USPs defined but not consistently used in marketing', points: 3 },
      { value: 'clear_used', label: 'Clear USPs used across all marketing materials', points: 4 },
      { value: 'powerful', label: 'Powerful USPs that immediately resonate with ideal clients', points: 5 }
    ]
  },
  {
    id: 'team_culture',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'How strong is your team and culture?',
    type: 'radio',
    options: [
      { value: 'struggling', label: 'Struggling with people issues', points: 0 },
      { value: 'adequate', label: 'Adequate team, developing culture', points: 2 },
      { value: 'good', label: 'Good team, positive culture', points: 4 },
      { value: 'exceptional', label: 'A-players with exceptional culture', points: 5 }
    ]
  },
  {
    id: 'core_values',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'How well-defined and lived are your core values?',
    type: 'radio',
    options: [
      { value: 'none', label: 'No defined core values', points: 0 },
      { value: 'exist', label: "Values exist but aren't used", points: 2 },
      { value: 'some', label: 'Values guide some decisions', points: 4 },
      { value: 'all', label: 'Values drive all decisions and hiring', points: 5 }
    ]
  },
  {
    id: 'business_execution',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'How systematic is your business execution?',
    type: 'radio',
    options: [
      { value: 'adhoc', label: 'Ad hoc, reactive approach', points: 0 },
      { value: 'some', label: 'Some systems, inconsistent execution', points: 2 },
      { value: 'good', label: 'Good systems, reliable execution', points: 4 },
      { value: 'exceptional', label: 'Exceptional systems and execution', points: 5 }
    ]
  },
  {
    id: 'meeting_rhythms',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'Do you have effective meeting rhythms?',
    type: 'radio',
    options: [
      { value: 'irregular', label: 'Irregular, unproductive meetings', points: 0 },
      { value: 'some', label: 'Some meetings, limited value', points: 2 },
      { value: 'weekly', label: 'Weekly team meetings with agendas', points: 4 },
      { value: 'comprehensive', label: 'Daily huddles, weekly tactical, monthly strategic', points: 5 }
    ]
  },
  {
    id: 'performance_tracking',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'How well do you track business performance with a dashboard?',
    type: 'radio',
    options: [
      { value: 'none', label: "Don't track metrics systematically", points: 0 },
      { value: 'monthly', label: 'Track basic metrics monthly', points: 2 },
      { value: 'weekly', label: 'Weekly dashboard review', points: 4 },
      { value: 'realtime', label: 'Real-time dashboard reviewed daily', points: 5 }
    ]
  },
  {
    id: 'one_number',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'Have you identified your "1 Number" that drives everything?',
    type: 'radio',
    options: [
      { value: 'no_idea', label: 'No idea what this means', points: 0 },
      { value: 'many', label: 'Track many metrics, no focus', points: 2 },
      { value: 'identified', label: 'Have identified key metric', points: 4 },
      { value: 'drives_all', label: '"1 Number" drives all decisions', points: 5 }
    ]
  },
  {
    id: 'team_alignment_priorities',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'How aligned is your team around priorities?',
    type: 'radio',
    options: [
      { value: 'none', label: 'Little to no alignment', points: 0 },
      { value: 'some', label: 'Some alignment, poor communication', points: 2 },
      { value: 'good', label: 'Good alignment and communication', points: 4 },
      { value: 'perfect', label: 'Perfect alignment and rhythm', points: 5 }
    ]
  },
  {
    id: 'team_communications',
    section: '2',
    sectionTitle: 'STRATEGIC WHEEL',
    question: 'How organized are your team communications?',
    type: 'radio',
    options: [
      { value: 'scattered', label: 'Scattered across email, texts, calls, and apps - very inefficient', points: 0 },
      { value: 'multiple', label: 'Multiple channels but manageable', points: 2 },
      { value: 'streamlined', label: 'Streamlined to 2-3 main channels', points: 4 },
      { value: 'unified', label: 'One primary platform for all team communication', points: 5 }
    ]
  },

  // SECTION 3: PROFITABILITY HEALTH CHECK (6 questions)
  {
    id: 'profit_blockers',
    section: '3',
    sectionTitle: 'PROFITABILITY HEALTH CHECK',
    question: 'What prevents you from achieving your target profit margin? (Check all that apply)',
    type: 'multicheck',
    options: [
      { value: 'low_prices', label: 'Prices are too low for the value delivered', points: 0 },
      { value: 'poor_cost_control', label: 'Costs are not well controlled', points: 0 },
      { value: 'no_profit_visibility', label: "Don't know true profit by product/service", points: 0 },
      { value: 'too_many_discounts', label: 'Too many discounts given', points: 0 },
      { value: 'inefficient_operations', label: 'Inefficient operations increase costs', points: 0 },
      { value: 'high_acquisition_costs', label: 'High customer acquisition costs', points: 0 },
      { value: 'poor_cash_flow', label: 'Poor cash flow management', points: 0 },
      { value: 'high_overhead', label: 'Overhead too high for revenue', points: 0 }
    ]
  },
  {
    id: 'last_price_increase',
    section: '3',
    sectionTitle: 'PROFITABILITY HEALTH CHECK',
    question: 'When did you last increase prices?',
    type: 'radio',
    options: [
      { value: 'never', label: 'Never or over 2 years ago', points: 0 },
      { value: '1_2_years', label: '1-2 years ago', points: 2 },
      { value: '6_12_months', label: '6-12 months ago', points: 4 },
      { value: 'within_6_months', label: 'Within last 6 months', points: 5 }
    ]
  },
  {
    id: 'pricing_confidence',
    section: '3',
    sectionTitle: 'PROFITABILITY HEALTH CHECK',
    question: 'How confident are you in your pricing strategy?',
    type: 'radio',
    options: [
      { value: 'very_unsure', label: 'Very unsure - often discount or apologize', points: 0 },
      { value: 'somewhat', label: 'Somewhat confident - occasional doubts', points: 2 },
      { value: 'confident', label: 'Confident - rarely questioned', points: 4 },
      { value: 'very_confident', label: 'Very confident - optimal pricing achieved', points: 5 }
    ]
  },
  {
    id: 'expense_review',
    section: '3',
    sectionTitle: 'PROFITABILITY HEALTH CHECK',
    question: 'How often do you review and audit your business expenses?',
    type: 'radio',
    options: [
      { value: 'never', label: 'Never or only when cash is tight', points: 0 },
      { value: 'annually', label: 'Annually', points: 2 },
      { value: 'quarterly', label: 'Quarterly', points: 4 },
      { value: 'monthly', label: 'Monthly with action taken on findings', points: 5 }
    ]
  },
  {
    id: 'subscription_audit',
    section: '3',
    sectionTitle: 'PROFITABILITY HEALTH CHECK',
    question: 'Do you regularly review and cancel unused subscriptions/services?',
    type: 'radio',
    options: [
      { value: 'no', label: "No - probably paying for things we don't use", points: 0 },
      { value: 'occasionally', label: 'Occasionally when I notice something', points: 2 },
      { value: 'annually', label: 'Annual review of all subscriptions', points: 4 },
      { value: 'quarterly', label: 'Quarterly audit with immediate cancellations', points: 5 }
    ]
  },
  {
    id: 'supplier_negotiation',
    section: '3',
    sectionTitle: 'PROFITABILITY HEALTH CHECK',
    question: 'When did you last negotiate with suppliers for better pricing?',
    type: 'radio',
    options: [
      { value: 'never', label: 'Never or over 2 years ago', points: 0 },
      { value: 'within_2_years', label: 'Within the last 2 years', points: 3 },
      { value: 'within_year', label: 'Within the last year', points: 7 },
      { value: 'within_6_months', label: 'Within the last 6 months', points: 10 }
    ]
  },

  // SECTION 4: BUSINESS ENGINES (23 questions)
  // Attract Engine
  {
    id: 'monthly_leads',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - ATTRACT',
    question: 'How many qualified leads do you generate monthly?',
    type: 'radio',
    options: [
      { value: 'under_20', label: 'Under 20 leads', points: 0 },
      { value: '20_50', label: '20-50 leads', points: 2 },
      { value: '50_100', label: '50-100 leads', points: 4 },
      { value: 'over_100', label: '100+ leads', points: 5 }
    ]
  },
  {
    id: 'marketing_channels',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - ATTRACT',
    question: 'How many reliable marketing channels generate leads?',
    type: 'radio',
    options: [
      { value: 'none', label: 'No consistent channels', points: 0 },
      { value: '1_2', label: '1-2 inconsistent sources', points: 2 },
      { value: '3_4', label: '3-4 regular sources', points: 4 },
      { value: '5_plus', label: '5+ systematic channels', points: 5 }
    ]
  },
  {
    id: 'marketing_process',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - ATTRACT',
    question: 'Do you have a documented marketing process?',
    type: 'radio',
    options: [
      { value: 'none', label: 'No process at all', points: 0 },
      { value: 'have_not_follow', label: "Have a process but don't follow it", points: 1 },
      { value: 'sometimes_follow', label: 'Have a process and follow it sometimes', points: 3 },
      { value: 'consistently_follow', label: 'Have a documented process and follow it consistently', points: 5 }
    ]
  },
  {
    id: 'lead_generation_systems',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - ATTRACT',
    question: 'How systematic is your lead generation? (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'We have a referral system generating 30%+ of business',
      'We email our database/leads regularly to nurture relationships',
      'We track ROI for each marketing channel',
      'We know our cost per lead and customer acquisition cost'
    ]
  },

  // Convert Engine
  {
    id: 'conversion_rate',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - CONVERT',
    question: "What's your lead-to-customer conversion rate?",
    type: 'radio',
    options: [
      { value: 'under_15', label: "Under 15% or don't track", points: 0 },
      { value: '15_25', label: '15-25%', points: 2 },
      { value: '25_40', label: '25-40%', points: 4 },
      { value: 'over_40', label: 'Over 40%', points: 5 }
    ]
  },
  {
    id: 'sales_process',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - CONVERT',
    question: 'Do you have a documented sales process that you follow?',
    type: 'radio',
    options: [
      { value: 'none', label: 'No process at all', points: 0 },
      { value: 'have_not_follow', label: "Have a process but don't follow it", points: 1 },
      { value: 'sometimes_follow', label: 'Have a process and follow it sometimes', points: 3 },
      { value: 'consistently_follow', label: 'Have a process and follow it consistently', points: 5 }
    ]
  },
  {
    id: 'sales_capability',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - CONVERT',
    question: 'How effective is your sales capability? (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'We follow up multiple times with interested prospects',
      'We contact prospects who didn\'t sign after receiving proposals',
      'We have ready answers for common objections',
      'We always ask for the business rather than waiting'
    ]
  },
  {
    id: 'transaction_value',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - CONVERT',
    question: 'Do you maximize transaction value? (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'We offer different price points (basic, standard, premium)',
      'We regularly offer additional products/services to clients',
      'We can confidently explain our pricing without apologizing',
      'Our prices are based on value, not just costs'
    ]
  },

  // Deliver - Customer Experience
  {
    id: 'customer_delight',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - DELIVER',
    question: 'What percentage of customers are delighted with your delivery?',
    type: 'radio',
    options: [
      { value: 'under_60', label: 'Under 60%', points: 0 },
      { value: '60_75', label: '60-75%', points: 2 },
      { value: '75_90', label: '75-90%', points: 4 },
      { value: 'over_90', label: 'Over 90%', points: 5 }
    ]
  },
  {
    id: 'supporting_data',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - DELIVER',
    question: 'How do you know this? (What data supports your answer?)',
    type: 'text'
  },
  {
    id: 'delivery_process',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - DELIVER',
    question: 'Do you have a documented delivery process that you follow?',
    type: 'radio',
    options: [
      { value: 'none', label: 'No process at all', points: 0 },
      { value: 'have_not_follow', label: "Have a process but don't follow it", points: 1 },
      { value: 'sometimes_follow', label: 'Have a process and follow it sometimes', points: 3 },
      { value: 'consistently_follow', label: 'Have a documented process and follow it consistently', points: 5 }
    ]
  },
  {
    id: 'satisfaction_tracking',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - DELIVER',
    question: 'How do you measure and track customer satisfaction?',
    type: 'radio',
    options: [
      { value: 'none', label: "Don't measure systematically", points: 0 },
      { value: 'informal', label: 'Occasional informal feedback', points: 2 },
      { value: 'regular', label: 'Regular satisfaction surveys', points: 4 },
      { value: 'comprehensive', label: 'Comprehensive feedback system with action plans', points: 5 }
    ]
  },
  {
    id: 'customer_journey',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - DELIVER',
    question: 'How exceptional is your customer journey? (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'Our onboarding experience impresses new customers',
      'We\'ve mapped every customer touchpoint',
      'Customers can easily reach us when needed',
      'We systematically review and improve the experience'
    ]
  },

  // Deliver - People & Team
  {
    id: 'talent_strategy',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - PEOPLE',
    question: 'How strategic is your approach to talent?',
    type: 'radio',
    options: [
      { value: 'reactive', label: 'Reactive hiring when desperate', points: 0 },
      { value: 'basic', label: 'Basic hiring process', points: 2 },
      { value: 'good', label: 'Good hiring with defined criteria', points: 4 },
      { value: 'systematic', label: 'Systematic recruitment of A-players', points: 5 }
    ]
  },
  {
    id: 'performance_management',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - PEOPLE',
    question: 'Do you have a performance management system?',
    type: 'radio',
    options: [
      { value: 'none', label: 'No formal performance management', points: 0 },
      { value: 'informal', label: 'Occasional informal feedback', points: 2 },
      { value: 'regular_no_criteria', label: 'Regular reviews without clear criteria', points: 3 },
      { value: 'systematic', label: 'Systematic reviews against core values and job KPIs', points: 5 }
    ]
  },
  {
    id: 'team_development',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - PEOPLE',
    question: 'How effectively do you develop and leverage your team? (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'Every role has documented responsibilities and KPIs',
      'We invest in team training and development',
      'We strategically outsource non-core activities',
      'Team is accountable for results'
    ]
  },

  // Deliver - Systems & Process
  {
    id: 'process_documentation',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - SYSTEMS',
    question: 'How comprehensive is your process documentation?',
    type: 'radio',
    options: [
      { value: 'none', label: "Most processes exist only in people's heads", points: 0 },
      { value: 'some', label: 'Some processes documented', points: 2 },
      { value: 'most', label: 'Most key processes documented', points: 4 },
      { value: 'all', label: 'All processes documented and optimized', points: 5 }
    ]
  },
  {
    id: 'system_audits',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - SYSTEMS',
    question: 'How often do you audit if systems are being followed?',
    type: 'radio',
    options: [
      { value: 'never', label: 'Never audit compliance', points: 0 },
      { value: 'problems_only', label: 'Only when problems arise', points: 2 },
      { value: 'annual', label: 'Annual system audits', points: 4 },
      { value: 'quarterly', label: 'Quarterly audits with improvements', points: 5 }
    ]
  },
  {
    id: 'operational_infrastructure',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - SYSTEMS',
    question: 'How advanced is your operational infrastructure? (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'We have robust data backup and security systems',
      'We have documented customer retention/delight processes',
      'Our technology infrastructure is current and integrated',
      'We measure process efficiency and cycle times'
    ]
  },

  // Finance Engine
  {
    id: 'budget_forecast',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - FINANCE',
    question: 'Do you have a comprehensive P&L budget/forecast?',
    type: 'radio',
    options: [
      { value: 'none', label: 'No budget or forecast', points: 0 },
      { value: 'basic', label: 'Basic revenue/expense tracking', points: 2 },
      { value: 'annual', label: 'Annual budget created', points: 4 },
      { value: 'detailed', label: 'Detailed budget with monthly variance analysis', points: 5 }
    ]
  },
  {
    id: 'cash_flow_forecast',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - FINANCE',
    question: 'Do you maintain cash flow forecasts?',
    type: 'radio',
    options: [
      { value: 'none', label: 'No cash flow forecasting', points: 0 },
      { value: 'check_balance', label: 'Check bank balance when needed', points: 2 },
      { value: 'monthly', label: 'Monthly cash flow review', points: 4 },
      { value: '13_week', label: '13-week rolling cash flow forecast', points: 5 }
    ]
  },
  {
    id: 'pricing_understanding',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - FINANCE',
    question: 'Which statement best describes your understanding of pricing?',
    type: 'radio',
    options: [
      { value: 'unsure', label: "I'm not sure of the difference between markup and margin", points: 0 },
      { value: 'understand', label: "I understand the difference but don't use it strategically", points: 2 },
      { value: 'calculate', label: 'I calculate both and understand their impact', points: 4 },
      { value: 'optimize', label: 'I optimize pricing using both markup and margin analysis', points: 5 }
    ]
  },
  {
    id: 'working_capital',
    section: '4',
    sectionTitle: 'BUSINESS ENGINES - FINANCE',
    question: 'How well do you manage profitability and working capital? (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'We maintain sufficient cash reserves (3+ months expenses)',
      'We actively manage our cash conversion cycle',
      'We know which products/services are most profitable',
      'We have increased prices in the last 12 months'
    ]
  },

  // SECTION 5: SUCCESS DISCIPLINES (12 questions - all yes/no)
  {
    id: 'discipline_decision_making',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 1: Decision-Making Frameworks (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'I have clear criteria for different types of decisions',
      'I make small decisions quickly without overthinking',
      'I know which decisions need deep analysis vs quick action',
      'I rarely procrastinate on important decisions',
      'I have defined decision-making authority levels'
    ]
  },
  {
    id: 'discipline_technology',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 2: Technology & AI Integration (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'We use technology effectively for marketing automation',
      'We track and manage all customer interactions systematically',
      'We use AI for content creation or customer service',
      'We use AI for data analysis or insights',
      'We regularly evaluate new technology opportunities'
    ]
  },
  {
    id: 'discipline_growth_mindset',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 3: Growth Mindset & Learning (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'I dedicate time weekly to learning new business skills',
      'I read business books or listen to podcasts regularly',
      'Our team has learning and development plans',
      'We document and share lessons from wins and failures',
      'We have a culture of continuous improvement'
    ]
  },
  {
    id: 'discipline_leadership',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 4: Leadership Development (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'Others naturally follow my vision and direction',
      "I'm developing other leaders in the business",
      'I delegate effectively and empower my team',
      'I regularly assess and improve my leadership skills',
      'I spend time working ON the business, not just IN it'
    ]
  },
  {
    id: 'discipline_personal_mastery',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 5: Personal Mastery (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'I have a morning ritual including planning and goals review',
      'I can maintain deep focus for 2+ hours on important work',
      'I take at least 30 minutes daily for exercise/physical activity',
      'I plan each day in advance with specific outcomes',
      'I consistently maintain high energy throughout the workday'
    ]
  },
  {
    id: 'discipline_operational',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 6: Operational Excellence (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'We have standard operating procedures that everyone follows',
      'Our business could operate effectively without me for 6 weeks',
      'We regularly review and optimize our systems',
      'We measure and improve operational efficiency metrics',
      'We have quality control systems in place'
    ]
  },
  {
    id: 'discipline_resource',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 7: Resource Optimization (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'We maximize utilization of physical assets and space',
      'Our people are deployed in their highest-value roles',
      "We've eliminated or outsourced non-core activities",
      'We regularly review and optimize all resource allocation',
      'We track ROI on all major investments and decisions'
    ]
  },
  {
    id: 'discipline_financial',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 8: Financial Acumen (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'I review financial metrics weekly',
      'I understand my profit per customer/job/unit sold',
      'We track budget vs actual with variance analysis',
      'I make decisions based on financial impact',
      'We actively manage cash flow to avoid surprises'
    ]
  },
  {
    id: 'discipline_accountability',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 9: Accountability & Performance Management (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'Every team member has clear KPIs and scorecards',
      'We conduct regular performance reviews',
      'People consistently do what they say they will do',
      'I hold myself accountable to my commitments',
      'We have a culture of ownership and responsibility'
    ]
  },
  {
    id: 'discipline_customer',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 10: Customer Experience (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'Customers are delighted and become advocates (referrals/reviews)',
      'We systematically gather and act on customer feedback',
      'We maintain strong relationships beyond the initial transaction',
      'We exceed expectations at every touchpoint',
      'We have a customer success process, not just customer service'
    ]
  },
  {
    id: 'discipline_resilience',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 11: Resilience & Renewal (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'I have scheduled breaks and renewal time',
      'I work less than 50 hours per week consistently',
      "I've scheduled time off in the next 12 months",
      'I bounce back quickly from setbacks',
      'I maintain work-life integration that energizes me'
    ]
  },
  {
    id: 'discipline_time',
    section: '5',
    sectionTitle: 'SUCCESS DISCIPLINES',
    question: 'DISCIPLINE 12: Time Management & Effectiveness (Answer Yes or No)',
    type: 'yesno',
    subQuestions: [
      'I use a prioritization system (urgent/important matrix or similar)',
      'I maintain and work from organized to-do lists daily',
      'I calendar-block my most important activities',
      'I have a "Stop Doing List" to eliminate low-value activities',
      'I protect my time by saying no to non-essential requests'
    ]
  },

  // SECTION 6: STRATEGIC PRIORITIES & GOALS (5 questions)
  {
    id: 'biggest_constraint',
    section: '6',
    sectionTitle: 'STRATEGIC PRIORITIES & GOALS',
    question: "What's the single biggest constraint holding your business back?",
    type: 'text'
  },
  {
    id: 'biggest_opportunity',
    section: '6',
    sectionTitle: 'STRATEGIC PRIORITIES & GOALS',
    question: "What's your biggest opportunity for growth right now?",
    type: 'text'
  },
  {
    id: 'ninety_day_fix',
    section: '6',
    sectionTitle: 'STRATEGIC PRIORITIES & GOALS',
    question: 'If you could fix ONE thing in the next 90 days for maximum impact, what would it be?',
    type: 'text'
  },
  {
    id: 'help_needed',
    section: '6',
    sectionTitle: 'STRATEGIC PRIORITIES & GOALS',
    question: 'Where do you need the most help to achieve your goals?',
    type: 'text'
  },
  {
    id: 'twelve_month_targets',
    section: '6',
    sectionTitle: 'STRATEGIC PRIORITIES & GOALS',
    question: 'What are your 12-month targets? (Enter numbers only)',
    type: 'text'
  }
]

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  // Check authentication on component mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUserId(user.id)
      }
    }
    checkUser()
  }, [router, supabase])

  const handleAnswer = (value: string | string[]) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: value
    })
  }

  const handleMultiCheck = (value: string) => {
    const current = answers[questions[currentQuestion].id] || []
    if (current.includes(value)) {
      setAnswers({
        ...answers,
        [questions[currentQuestion].id]: current.filter((v: string) => v !== value)
      })
    } else {
      setAnswers({
        ...answers,
        [questions[currentQuestion].id]: [...current, value]
      })
    }
  }

  const handleYesNo = (index: number, value: boolean) => {
    const current = answers[questions[currentQuestion].id] || []
    const newAnswers = [...current]
    newAnswers[index] = value
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: newAnswers
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleComplete = async () => {
    if (!userId) {
      console.error('No user ID found')
      router.push('/auth/login')
      return
    }

    setLoading(true)

    try {
      // Calculate total score
      let totalScore = 0
      questions.forEach(q => {
        const answer = answers[q.id]
        if (answer && q.options) {
          if (q.type === 'multicheck' || q.type === 'text') {
            // Don't add points for these
          } else if (q.type === 'yesno') {
            // Each yes is worth 1 point
            const yesCount = (answer as boolean[]).filter(a => a === true).length
            totalScore += yesCount
          } else {
            const option = q.options.find(o => o.value === answer)
            if (option?.points) {
              totalScore += option.points
            }
          }
        }
      })

      // Save to database
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: userId,
          revenue_stage: answers.revenue_stage || 'foundation',
          assessment_data: answers,
          total_score: totalScore,
          completion_percentage: 100,
          completed_at: new Date().toISOString(),
          completed_by: userId
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving assessment:', error)
        alert('Error saving assessment. Please try again.')
      } else {
        console.log('Assessment saved:', data)
        router.push(`/assessment/results?id=${data.id}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndExit = async () => {
    if (!userId) {
      router.push('/auth/login')
      return
    }

    // Calculate completion percentage
    const completionPercentage = Math.round((Object.keys(answers).length / questions.length) * 100)

    try {
      // Save partial assessment
      await supabase
        .from('assessments')
        .insert({
          user_id: userId,
          revenue_stage: answers.revenue_stage || 'foundation',
          assessment_data: answers,
          total_score: 0,
          completion_percentage: completionPercentage,
          completed_by: userId
        })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving partial assessment:', error)
      alert('Error saving progress. Please try again.')
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentQ = questions[currentQuestion]
  const hasAnswer = () => {
    if (currentQ.type === 'multicheck') {
      return answers[currentQ.id] && answers[currentQ.id].length > 0
    } else if (currentQ.type === 'yesno') {
      return answers[currentQ.id] && answers[currentQ.id].length === currentQ.subQuestions?.length
    } else if (currentQ.type === 'text') {
      return answers[currentQ.id] && answers[currentQ.id].trim() !== ''
    }
    return answers[currentQ.id] !== undefined
  }

  if (!userId) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Business Diagnostic</h1>
            <button
              onClick={handleSaveAndExit}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
            >
              💾 Save & Exit
            </button>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="text-sm font-semibold text-blue-600 mb-2">
              SECTION {currentQ.section}: {currentQ.sectionTitle}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {currentQ.question}
            </h2>

            {/* Options based on question type */}
            {currentQ.type === 'multicheck' && (
              <div className="space-y-3">
                {currentQ.options?.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: answers[currentQ.id]?.includes(option.value) ? '#2563eb' : '#e5e7eb',
                      backgroundColor: answers[currentQ.id]?.includes(option.value) ? '#eff6ff' : 'white'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={answers[currentQ.id]?.includes(option.value) || false}
                      onChange={() => handleMultiCheck(option.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-800">{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQ.type === 'yesno' && (
              <div className="space-y-4">
                {currentQ.subQuestions?.map((subQ, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="mb-2 text-gray-700">{subQ}</div>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`${currentQ.id}_${index}`}
                          checked={answers[currentQ.id]?.[index] === true}
                          onChange={() => handleYesNo(index, true)}
                          className="mr-2"
                        />
                        <span className="text-green-600 font-medium">YES</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`${currentQ.id}_${index}`}
                          checked={answers[currentQ.id]?.[index] === false}
                          onChange={() => handleYesNo(index, false)}
                          className="mr-2"
                        />
                        <span className="text-red-600 font-medium">NO</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentQ.type === 'text' && (
              <div>
                {currentQ.id === 'twelve_month_targets' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Annual Revenue
                      </label>
                      <input
                        type="text"
                        placeholder="$"
                        className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                        value={answers[`${currentQ.id}_current_revenue`] || ''}
                        onChange={(e) => setAnswers({
                          ...answers,
                          [`${currentQ.id}_current_revenue`]: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Annual Revenue (12 months)
                      </label>
                      <input
                        type="text"
                        placeholder="$"
                        className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                        value={answers[`${currentQ.id}_target_revenue`] || ''}
                        onChange={(e) => setAnswers({
                          ...answers,
                          [`${currentQ.id}_target_revenue`]: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Profit Margin %
                      </label>
                      <input
                        type="text"
                        placeholder="%"
                        className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleAnswer(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <textarea
                    className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                    rows={4}
                    placeholder="Type your answer here..."
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                  />
                )}
              </div>
            )}

            {currentQ.type === 'radio' && (
              <div className="space-y-3">
                {currentQ.options?.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: answers[currentQ.id] === option.value ? '#2563eb' : '#e5e7eb',
                      backgroundColor: answers[currentQ.id] === option.value ? '#eff6ff' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name={currentQ.id}
                      value={option.value}
                      checked={answers[currentQ.id] === option.value}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-800">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentQuestion === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={!hasAnswer() || loading}
                className={`px-8 py-3 rounded-lg font-medium ${
                  !hasAnswer() || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading ? 'Saving...' : 'Complete Assessment →'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!hasAnswer()}
                className={`px-8 py-3 rounded-lg font-medium ${
                  !hasAnswer()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}