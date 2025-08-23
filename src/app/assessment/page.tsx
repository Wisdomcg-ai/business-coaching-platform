'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'radio' | 'checkbox' | 'text' | 'multiselect' | 'yesno-group';
  options?: { value: string; label: string; points?: number }[];
  questions?: { id: string; text: string }[]; // For grouped yes/no questions
  section: string;
  subsection?: string;
}

const questions: Question[] = [
  // SECTION 1: BUSINESS FOUNDATION (6 questions)
  {
    id: 'q1',
    text: "What's your current annual revenue?",
    type: 'radio',
    section: 'Business Foundation',
    options: [
      { value: 'under_250k', label: 'Under $250K (Foundation Stage)', points: 2 },
      { value: '250k_1m', label: '$250K - $1M (Traction Stage)', points: 4 },
      { value: '1m_3m', label: '$1M - $3M (Scaling Stage)', points: 6 },
      { value: '3m_5m', label: '$3M - $5M (Optimization Stage)', points: 8 },
      { value: '5m_10m', label: '$5M - $10M (Leadership Stage)', points: 9 },
      { value: 'over_10m', label: '$10M+ (Mastery Stage)', points: 10 }
    ]
  },
  {
    id: 'q2',
    text: "What's your current profit margin?",
    type: 'radio',
    section: 'Business Foundation',
    options: [
      { value: 'losing', label: 'Losing money', points: 0 },
      { value: 'breakeven', label: 'Breaking even (0-5%)', points: 2 },
      { value: 'small_5_10', label: 'Small profit (5-10%)', points: 4 },
      { value: 'healthy_10_15', label: 'Healthy profit (10-15%)', points: 6 },
      { value: 'strong_15_20', label: 'Strong profit (15-20%)', points: 8 },
      { value: 'exceptional_20_plus', label: 'Exceptional profit (20%+)', points: 10 }
    ]
  },
  {
    id: 'q3',
    text: 'Are you paying yourself a market-rate salary consistently?',
    type: 'radio',
    section: 'Business Foundation',
    options: [
      { value: 'no_rarely', label: 'No - rarely take money out', points: 0 },
      { value: 'sometimes', label: 'Sometimes - when cash flow allows', points: 2 },
      { value: 'yes_below', label: 'Yes - regular salary below market', points: 3 },
      { value: 'yes_full', label: 'Yes - full market-rate salary', points: 4 },
      { value: 'yes_plus_profit', label: 'Yes - salary plus profit distributions', points: 5 }
    ]
  },
  {
    id: 'q4',
    text: 'How many people work in your business?',
    type: 'radio',
    section: 'Business Foundation',
    options: [
      { value: 'just_me', label: 'Just me', points: 1 },
      { value: '2_5', label: '2-5 people', points: 2 },
      { value: '6_15', label: '6-15 people', points: 3 },
      { value: '16_50', label: '16-50 people', points: 4 },
      { value: '50_plus', label: '50+ people', points: 5 }
    ]
  },
  {
    id: 'q5',
    text: 'How dependent is the business on you personally?',
    type: 'radio',
    section: 'Business Foundation',
    options: [
      { value: 'completely', label: 'Completely - stops without me', points: 0 },
      { value: 'very', label: 'Very - needs me for most decisions', points: 2 },
      { value: 'somewhat', label: 'Somewhat - can run for short periods', points: 4 },
      { value: 'minimal', label: 'Minimal - runs well without me', points: 5 }
    ]
  },
  {
    id: 'q6',
    text: 'How predictable is your monthly revenue?',
    type: 'radio',
    section: 'Business Foundation',
    options: [
      { value: 'unpredictable', label: 'Completely unpredictable - varies wildly', points: 0 },
      { value: 'somewhat_50', label: 'Somewhat predictable - within 50%', points: 3 },
      { value: 'very_25', label: 'Very predictable - within 25%', points: 7 },
      { value: 'extremely_recurring', label: 'Extremely predictable - recurring revenue', points: 10 }
    ]
  },

  // SECTION 2: STRATEGIC WHEEL (14 questions)
  {
    id: 'q7',
    text: 'How clear and compelling is your business vision?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'Vision & Purpose',
    options: [
      { value: 'very_unclear', label: 'Very unclear - no defined direction', points: 0 },
      { value: 'somewhat_clear', label: 'Somewhat clear - general idea', points: 3 },
      { value: 'clear', label: 'Clear - team understands it', points: 7 },
      { value: 'crystal_clear', label: 'Crystal clear - guides all decisions', points: 10 }
    ]
  },
  {
    id: 'q8',
    text: 'Does your team understand and believe in your purpose?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'Vision & Purpose',
    options: [
      { value: 'no_understanding', label: 'No understanding or buy-in', points: 0 },
      { value: 'some_understanding', label: 'Some understanding, limited buy-in', points: 3 },
      { value: 'good_understanding', label: 'Good understanding and buy-in', points: 7 },
      { value: 'complete_alignment', label: 'Complete alignment and passion', points: 10 }
    ]
  },
  {
    id: 'q9',
    text: 'How well-defined is your target market and positioning?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'Strategy & Market',
    options: [
      { value: 'anyone', label: 'Serve anyone who will pay', points: 0 },
      { value: 'general', label: 'General target market defined', points: 3 },
      { value: 'specific', label: 'Specific ideal customer profile', points: 7 },
      { value: 'laser_focused', label: 'Laser-focused with clear differentiation', points: 10 }
    ]
  },
  {
    id: 'q10',
    text: 'Do you have a sustainable competitive advantage?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'Strategy & Market',
    options: [
      { value: 'price_only', label: 'Compete mainly on price', points: 0 },
      { value: 'some_differentiation', label: 'Some differentiation', points: 3 },
      { value: 'clear_value', label: 'Clear unique value proposition', points: 7 },
      { value: 'dominant', label: 'Dominant market position', points: 10 }
    ]
  },
  {
    id: 'q11',
    text: 'Have you clearly defined and do you actively use your Unique Selling Propositions (USPs)?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'Strategy & Market',
    options: [
      { value: 'dont_know', label: "Don't know what makes us different", points: 0 },
      { value: 'some_ideas', label: 'Have some ideas but not clearly defined', points: 3 },
      { value: 'defined_not_used', label: 'USPs defined but not consistently used in marketing', points: 5 },
      { value: 'clear_used', label: 'Clear USPs used across all marketing materials', points: 8 },
      { value: 'powerful', label: 'Powerful USPs that immediately resonate with ideal clients', points: 10 }
    ]
  },
  {
    id: 'q13',
    text: 'How strong is your team and culture?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'People & Culture',
    options: [
      { value: 'struggling', label: 'Struggling with people issues', points: 0 },
      { value: 'adequate', label: 'Adequate team, developing culture', points: 3 },
      { value: 'good', label: 'Good team, positive culture', points: 7 },
      { value: 'excellent', label: 'A-players with exceptional culture', points: 10 }
    ]
  },
  {
    id: 'q14',
    text: 'How well-defined and lived are your core values?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'People & Culture',
    options: [
      { value: 'none', label: 'No defined core values', points: 0 },
      { value: 'exist_unused', label: "Values exist but aren't used", points: 3 },
      { value: 'guide_some', label: 'Values guide some decisions', points: 7 },
      { value: 'drive_all', label: 'Values drive all decisions and hiring', points: 10 }
    ]
  },
  {
    id: 'q15',
    text: 'How systematic is your business execution?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'Systems & Execution',
    options: [
      { value: 'adhoc', label: 'Ad hoc, reactive approach', points: 0 },
      { value: 'some_systems', label: 'Some systems, inconsistent execution', points: 3 },
      { value: 'good_systems', label: 'Good systems, reliable execution', points: 7 },
      { value: 'exceptional', label: 'Exceptional systems and execution', points: 10 }
    ]
  },
  {
    id: 'q16',
    text: 'Do you have effective meeting rhythms?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'Systems & Execution',
    options: [
      { value: 'irregular', label: 'Irregular, unproductive meetings', points: 0 },
      { value: 'some_meetings', label: 'Some meetings, limited value', points: 3 },
      { value: 'weekly', label: 'Weekly team meetings with agendas', points: 7 },
      { value: 'comprehensive', label: 'Daily huddles, weekly tactical, monthly strategic', points: 10 }
    ]
  },
  {
    id: 'q17',
    text: 'How well do you track business performance with a dashboard?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'Money & Metrics',
    options: [
      { value: 'dont_track', label: "Don't track metrics systematically", points: 0 },
      { value: 'monthly', label: 'Track basic metrics monthly', points: 3 },
      { value: 'weekly', label: 'Weekly dashboard review', points: 7 },
      { value: 'daily', label: 'Real-time dashboard reviewed daily', points: 10 }
    ]
  },
  {
    id: 'q18',
    text: 'Have you identified your "1 Number" that drives everything?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'Money & Metrics',
    options: [
      { value: 'no_idea', label: 'No idea what this means', points: 0 },
      { value: 'many_metrics', label: 'Track many metrics, no focus', points: 3 },
      { value: 'identified', label: 'Have identified key metric', points: 7 },
      { value: 'drives_all', label: '"1 Number" drives all decisions', points: 10 }
    ]
  },
  {
    id: 'q19',
    text: 'How aligned is your team around priorities?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'Communications & Alignment',
    options: [
      { value: 'no_alignment', label: 'Little to no alignment', points: 0 },
      { value: 'some_alignment', label: 'Some alignment, poor communication', points: 3 },
      { value: 'good_alignment', label: 'Good alignment and communication', points: 7 },
      { value: 'perfect', label: 'Perfect alignment and rhythm', points: 10 }
    ]
  },
  {
    id: 'q20',
    text: 'How organized are your team communications?',
    type: 'radio',
    section: 'Strategic Wheel',
    subsection: 'Communications & Alignment',
    options: [
      { value: 'scattered', label: 'Scattered across email, texts, calls, and apps - very inefficient', points: 0 },
      { value: 'multiple', label: 'Multiple channels but manageable', points: 3 },
      { value: 'streamlined', label: 'Streamlined to 2-3 main channels', points: 7 },
      { value: 'unified', label: 'One primary platform for all team communication', points: 10 }
    ]
  },

  // SECTION 3: PROFITABILITY HEALTH (6 questions)
  {
    id: 'q22',
    text: 'When did you last increase prices?',
    type: 'radio',
    section: 'Profitability Health',
    options: [
      { value: 'never_2years', label: 'Never or over 2 years ago', points: 0 },
      { value: '1_2_years', label: '1-2 years ago', points: 3 },
      { value: '6_12_months', label: '6-12 months ago', points: 7 },
      { value: 'within_6', label: 'Within last 6 months', points: 10 }
    ]
  },
  {
    id: 'q23',
    text: 'How confident are you in your pricing strategy?',
    type: 'radio',
    section: 'Profitability Health',
    options: [
      { value: 'very_unsure', label: 'Very unsure - often discount or apologize', points: 0 },
      { value: 'somewhat', label: 'Somewhat confident - occasional doubts', points: 3 },
      { value: 'confident', label: 'Confident - rarely questioned', points: 7 },
      { value: 'very_confident', label: 'Very confident - optimal pricing achieved', points: 10 }
    ]
  },
  {
    id: 'q24',
    text: 'How often do you review and audit your business expenses?',
    type: 'radio',
    section: 'Profitability Health',
    options: [
      { value: 'never_tight', label: 'Never or only when cash is tight', points: 0 },
      { value: 'annually', label: 'Annually', points: 3 },
      { value: 'quarterly', label: 'Quarterly', points: 7 },
      { value: 'monthly', label: 'Monthly with action taken on findings', points: 10 }
    ]
  },
  {
    id: 'q25',
    text: 'Do you regularly review and cancel unused subscriptions/services?',
    type: 'radio',
    section: 'Profitability Health',
    options: [
      { value: 'no_probably', label: "No - probably paying for things we don't use", points: 0 },
      { value: 'occasionally', label: 'Occasionally when I notice something', points: 3 },
      { value: 'annual', label: 'Annual review of all subscriptions', points: 7 },
      { value: 'quarterly', label: 'Quarterly audit with immediate cancellations', points: 10 }
    ]
  },
  {
    id: 'q26',
    text: 'When did you last negotiate with suppliers for better pricing?',
    type: 'radio',
    section: 'Profitability Health',
    options: [
      { value: 'never_2years', label: 'Never or over 2 years ago', points: 0 },
      { value: 'within_2years', label: 'Within the last 2 years', points: 3 },
      { value: 'within_year', label: 'Within the last year', points: 7 },
      { value: 'within_6months', label: 'Within the last 6 months', points: 10 }
    ]
  },

  // SECTION 4: BUSINESS ENGINES - ATTRACT ENGINE
  {
    id: 'q27',
    text: 'How many qualified leads do you generate monthly?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Attract Engine',
    options: [
      { value: 'under_20', label: 'Under 20 leads', points: 2 },
      { value: '20_50', label: '20-50 leads', points: 5 },
      { value: '50_100', label: '50-100 leads', points: 8 },
      { value: 'over_100', label: '100+ leads', points: 10 }
    ]
  },
  {
    id: 'q28',
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
    id: 'q30',
    text: 'How systematic is your lead generation? (Answer Yes or No to each)',
    type: 'yesno-group',
    section: 'Business Engines',
    subsection: 'Attract Engine',
    questions: [
      { id: 'q30a', text: 'We have a referral system generating 30%+ of business' },
      { id: 'q30b', text: 'We email our database/leads regularly to nurture relationships' },
      { id: 'q30c', text: 'We track ROI for each marketing channel' },
      { id: 'q30d', text: 'We know our cost per lead and customer acquisition cost' }
    ]
  },

  // CONVERT ENGINE
  {
    id: 'q31',
    text: "What's your lead-to-customer conversion rate?",
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Convert Engine',
    options: [
      { value: 'under_15', label: "Under 15% or don't track", points: 2 },
      { value: '15_25', label: '15-25%', points: 5 },
      { value: '25_40', label: '25-40%', points: 8 },
      { value: 'over_40', label: 'Over 40%', points: 10 }
    ]
  },
  {
    id: 'q33',
    text: 'How effective is your sales capability? (Answer Yes or No to each)',
    type: 'yesno-group',
    section: 'Business Engines',
    subsection: 'Convert Engine',
    questions: [
      { id: 'q33a', text: 'We follow up multiple times with interested prospects' },
      { id: 'q33b', text: "We contact prospects who didn't sign after receiving proposals" },
      { id: 'q33c', text: 'We have ready answers for common objections' },
      { id: 'q33d', text: 'We always ask for the business rather than waiting' }
    ]
  },
  {
    id: 'q34',
    text: 'Do you maximize transaction value? (Answer Yes or No to each)',
    type: 'yesno-group',
    section: 'Business Engines',
    subsection: 'Convert Engine',
    questions: [
      { id: 'q34a', text: 'We offer different price points (basic, standard, premium)' },
      { id: 'q34b', text: 'We regularly offer additional products/services to clients' },
      { id: 'q34c', text: 'We can confidently explain our pricing without apologizing' },
      { id: 'q34d', text: 'Our prices are based on value, not just costs' }
    ]
  },

  // DELIVER ENGINE - CUSTOMER EXPERIENCE
  {
    id: 'q35',
    text: 'What percentage of customers are delighted with your delivery?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Deliver Engine - Customer',
    options: [
      { value: 'under_60', label: 'Under 60%', points: 0 },
      { value: '60_75', label: '60-75%', points: 3 },
      { value: '75_90', label: '75-90%', points: 7 },
      { value: 'over_90', label: 'Over 90%', points: 10 }
    ]
  },
  {
    id: 'q39',
    text: 'How exceptional is your customer journey? (Answer Yes or No to each)',
    type: 'yesno-group',
    section: 'Business Engines',
    subsection: 'Deliver Engine - Customer',
    questions: [
      { id: 'q39a', text: 'Our onboarding experience impresses new customers' },
      { id: 'q39b', text: "We've mapped every customer touchpoint" },
      { id: 'q39c', text: 'Customers can easily reach us when needed' },
      { id: 'q39d', text: 'We systematically review and improve the experience' }
    ]
  },

  // DELIVER ENGINE - PEOPLE & TEAM
  {
    id: 'q40',
    text: 'How strategic is your approach to talent?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Deliver Engine - People',
    options: [
      { value: 'reactive', label: 'Reactive hiring when desperate', points: 0 },
      { value: 'basic', label: 'Basic hiring process', points: 3 },
      { value: 'good', label: 'Good hiring with defined criteria', points: 7 },
      { value: 'systematic', label: 'Systematic recruitment of A-players', points: 10 }
    ]
  },
  {
    id: 'q42',
    text: 'How effectively do you develop and leverage your team? (Answer Yes or No to each)',
    type: 'yesno-group',
    section: 'Business Engines',
    subsection: 'Deliver Engine - People',
    questions: [
      { id: 'q42a', text: 'Every role has documented responsibilities and KPIs' },
      { id: 'q42b', text: 'We invest in team training and development' },
      { id: 'q42c', text: 'We strategically outsource non-core activities' },
      { id: 'q42d', text: 'Team is accountable for results' }
    ]
  },

  // DELIVER ENGINE - SYSTEMS & PROCESS
  {
    id: 'q43',
    text: 'How comprehensive is your process documentation?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Deliver Engine - Systems',
    options: [
      { value: 'in_heads', label: "Most processes exist only in people's heads", points: 0 },
      { value: 'some_documented', label: 'Some processes documented', points: 3 },
      { value: 'most_documented', label: 'Most key processes documented', points: 7 },
      { value: 'all_optimized', label: 'All processes documented and optimized', points: 10 }
    ]
  },
  {
    id: 'q45',
    text: 'How advanced is your operational infrastructure? (Answer Yes or No to each)',
    type: 'yesno-group',
    section: 'Business Engines',
    subsection: 'Deliver Engine - Systems',
    questions: [
      { id: 'q45a', text: 'We have robust data backup and security systems' },
      { id: 'q45b', text: 'We have documented customer retention/delight processes' },
      { id: 'q45c', text: 'Our technology infrastructure is current and integrated' },
      { id: 'q45d', text: 'We measure process efficiency and cycle times' }
    ]
  },

  // FINANCE ENGINE
  {
    id: 'q46',
    text: 'Do you have a comprehensive P&L budget/forecast?',
    type: 'radio',
    section: 'Business Engines',
    subsection: 'Finance Engine',
    options: [
      { value: 'no_budget', label: 'No budget or forecast', points: 0 },
      { value: 'basic', label: 'Basic revenue/expense tracking', points: 3 },
      { value: 'annual', label: 'Annual budget created', points: 7 },
      { value: 'detailed', label: 'Detailed budget with monthly variance analysis', points: 10 }
    ]
  },
  {
    id: 'q49',
    text: 'How well do you manage profitability and working capital? (Answer Yes or No to each)',
    type: 'yesno-group',
    section: 'Business Engines',
    subsection: 'Finance Engine',
    questions: [
      { id: 'q49a', text: 'We maintain sufficient cash reserves (3+ months expenses)' },
      { id: 'q49b', text: 'We actively manage our cash conversion cycle' },
      { id: 'q49c', text: 'We know which products/services are most profitable' },
      { id: 'q49d', text: 'We have increased prices in the last 12 months' }
    ]
  },

  // SECTION 5: SUCCESS DISCIPLINES - Each discipline gets 5 yes/no questions on one page
  {
    id: 'q50',
    text: 'Decision-Making Frameworks',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Decision-Making',
    questions: [
      { id: 'q50a', text: 'I have clear criteria for different types of decisions' },
      { id: 'q50b', text: 'I make small decisions quickly without overthinking' },
      { id: 'q50c', text: 'I know which decisions need deep analysis vs quick action' },
      { id: 'q50d', text: 'I rarely procrastinate on important decisions' },
      { id: 'q50e', text: 'I have defined decision-making authority levels' }
    ]
  },
  {
    id: 'q51',
    text: 'Technology & AI Integration',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Technology & AI',
    questions: [
      { id: 'q51a', text: 'We use technology effectively for marketing automation' },
      { id: 'q51b', text: 'We track and manage all customer interactions systematically' },
      { id: 'q51c', text: 'We use AI for content creation or customer service' },
      { id: 'q51d', text: 'We use AI for data analysis or insights' },
      { id: 'q51e', text: 'We regularly evaluate new technology opportunities' }
    ]
  },
  {
    id: 'q52',
    text: 'Growth Mindset & Learning',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Growth Mindset',
    questions: [
      { id: 'q52a', text: 'I dedicate time weekly to learning new business skills' },
      { id: 'q52b', text: 'I read business books or listen to podcasts regularly' },
      { id: 'q52c', text: 'Our team has learning and development plans' },
      { id: 'q52d', text: 'We document and share lessons from wins and failures' },
      { id: 'q52e', text: 'We have a culture of continuous improvement' }
    ]
  },
  {
    id: 'q53',
    text: 'Leadership Development',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Leadership',
    questions: [
      { id: 'q53a', text: 'Others naturally follow my vision and direction' },
      { id: 'q53b', text: "I'm developing other leaders in the business" },
      { id: 'q53c', text: 'I delegate effectively and empower my team' },
      { id: 'q53d', text: 'I regularly assess and improve my leadership skills' },
      { id: 'q53e', text: 'I spend time working ON the business, not just IN it' }
    ]
  },
  {
    id: 'q54',
    text: 'Personal Mastery',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Personal Mastery',
    questions: [
      { id: 'q54a', text: 'I have a morning ritual including planning and goals review' },
      { id: 'q54b', text: 'I can maintain deep focus for 2+ hours on important work' },
      { id: 'q54c', text: 'I take at least 30 minutes daily for exercise/physical activity' },
      { id: 'q54d', text: 'I plan each day in advance with specific outcomes' },
      { id: 'q54e', text: 'I consistently maintain high energy throughout the workday' }
    ]
  },
  {
    id: 'q55',
    text: 'Operational Excellence',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Operational Excellence',
    questions: [
      { id: 'q55a', text: 'We have standard operating procedures that everyone follows' },
      { id: 'q55b', text: 'Our business could operate effectively without me for 6 weeks' },
      { id: 'q55c', text: 'We regularly review and optimize our systems' },
      { id: 'q55d', text: 'We measure and improve operational efficiency metrics' },
      { id: 'q55e', text: 'We have quality control systems in place' }
    ]
  },
  {
    id: 'q56',
    text: 'Resource Optimization',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Resource Optimization',
    questions: [
      { id: 'q56a', text: 'We maximize utilization of physical assets and space' },
      { id: 'q56b', text: 'Our people are deployed in their highest-value roles' },
      { id: 'q56c', text: "We've eliminated or outsourced non-core activities" },
      { id: 'q56d', text: 'We regularly review and optimize all resource allocation' },
      { id: 'q56e', text: 'We track ROI on all major investments and decisions' }
    ]
  },
  {
    id: 'q57',
    text: 'Financial Acumen',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Financial Acumen',
    questions: [
      { id: 'q57a', text: 'I review financial metrics weekly' },
      { id: 'q57b', text: 'I understand my profit per customer/job/unit sold' },
      { id: 'q57c', text: 'We track budget vs actual with variance analysis' },
      { id: 'q57d', text: 'I make decisions based on financial impact' },
      { id: 'q57e', text: 'We actively manage cash flow to avoid surprises' }
    ]
  },
  {
    id: 'q58',
    text: 'Accountability & Performance Management',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Accountability',
    questions: [
      { id: 'q58a', text: 'Every team member has clear KPIs and scorecards' },
      { id: 'q58b', text: 'We conduct regular performance reviews' },
      { id: 'q58c', text: 'People consistently do what they say they will do' },
      { id: 'q58d', text: 'I hold myself accountable to my commitments' },
      { id: 'q58e', text: 'We have a culture of ownership and responsibility' }
    ]
  },
  {
    id: 'q59',
    text: 'Customer Experience',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Customer Experience',
    questions: [
      { id: 'q59a', text: 'Customers are delighted and become advocates (referrals/reviews)' },
      { id: 'q59b', text: 'We systematically gather and act on customer feedback' },
      { id: 'q59c', text: 'We maintain strong relationships beyond the initial transaction' },
      { id: 'q59d', text: 'We exceed expectations at every touchpoint' },
      { id: 'q59e', text: 'We have a customer success process, not just customer service' }
    ]
  },
  {
    id: 'q60',
    text: 'Resilience & Renewal',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Resilience & Renewal',
    questions: [
      { id: 'q60a', text: 'I have scheduled breaks and renewal time' },
      { id: 'q60b', text: 'I work less than 50 hours per week consistently' },
      { id: 'q60c', text: "I've scheduled time off in the next 12 months" },
      { id: 'q60d', text: 'I bounce back quickly from setbacks' },
      { id: 'q60e', text: 'I maintain work-life integration that energizes me' }
    ]
  },
  {
    id: 'q61',
    text: 'Time Management & Effectiveness',
    type: 'yesno-group',
    section: 'Success Disciplines',
    subsection: 'Time Management',
    questions: [
      { id: 'q61a', text: 'I use a prioritization system (urgent/important matrix or similar)' },
      { id: 'q61b', text: 'I maintain and work from organized to-do lists daily' },
      { id: 'q61c', text: 'I calendar-block my most important activities' },
      { id: 'q61d', text: 'I have a "Stop Doing List" to eliminate low-value activities' },
      { id: 'q61e', text: 'I protect my time by saying no to non-essential requests' }
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
  
  // Get unique sections and current section info
  const sections = ['Business Foundation', 'Strategic Wheel', 'Profitability Health', 'Business Engines', 'Success Disciplines'];
  const currentSection = currentQuestion.section;
  const currentSectionIndex = sections.indexOf(currentSection);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (currentQuestion.type === 'yesno-group') {
          // Check if all sub-questions are answered
          const allAnswered = currentQuestion.questions?.every(q => answers[q.id]) || false;
          if (allAnswered) {
            if (currentQuestionIndex < questions.length - 1) {
              goToNext();
            } else {
              handleSubmit();
            }
          }
        } else if (answers[currentQuestion.id]) {
          if (currentQuestionIndex < questions.length - 1) {
            goToNext();
          } else {
            handleSubmit();
          }
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentQuestionIndex, answers, currentQuestion]);

  function handleAnswer(value: string, points?: number) {
    setAnswers({
      ...answers,
      [currentQuestion.id]: { 
        value, 
        points: points || 0,
        question: currentQuestion.text 
      }
    });
  }

  function handleYesNoGroup(questionId: string, value: 'yes' | 'no') {
    const points = value === 'yes' ? 1.25 : 0; // Each yes/no in a group worth 1.25 points
    setAnswers({
      ...answers,
      [questionId]: { 
        value, 
        points,
        question: currentQuestion.questions?.find(q => q.id === questionId)?.text || ''
      }
    });
  }

  function goToPrevious() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }

  function goToNext() {
    if (currentQuestion.type === 'yesno-group') {
      // Check if all sub-questions are answered
      const allAnswered = currentQuestion.questions?.every(q => answers[q.id]) || false;
      if (allAnswered && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } else if (answers[currentQuestion.id] && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  function isCurrentQuestionAnswered(): boolean {
    if (currentQuestion.type === 'yesno-group') {
      return currentQuestion.questions?.every(q => answers[q.id]) || false;
    }
    return !!answers[currentQuestion.id];
  }

  function calculateSectionScores() {
    const sectionScores: Record<string, number> = {
      foundation: 0,
      strategic_wheel: 0,
      profitability: 0,
      engines: 0,
      disciplines: 0
    };

    // Calculate scores for each section based on answers
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId || 
        q.questions?.some(sq => sq.id === questionId));
      
      if (question) {
        const points = answer.points || 0;
        
        switch(question.section) {
          case 'Business Foundation':
            sectionScores.foundation += points;
            break;
          case 'Strategic Wheel':
            sectionScores.strategic_wheel += points;
            break;
          case 'Profitability Health':
            sectionScores.profitability += points;
            break;
          case 'Business Engines':
            sectionScores.engines += points;
            break;
          case 'Success Disciplines':
            sectionScores.disciplines += points;
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
      // Calculate scores for each section
      const sectionScores = calculateSectionScores();
      
      // Calculate total score
      const totalScore = Object.values(sectionScores).reduce((sum, score) => sum + score, 0);
      const maxScore = 290; // Maximum possible score
      const percentage = Math.round((totalScore / maxScore) * 100);
      
      // Determine health status
      let healthStatus = '';
      if (percentage >= 90) healthStatus = 'THRIVING';
      else if (percentage >= 80) healthStatus = 'STRONG';
      else if (percentage >= 70) healthStatus = 'STABLE';
      else if (percentage >= 60) healthStatus = 'BUILDING';
      else if (percentage >= 50) healthStatus = 'STRUGGLING';
      else healthStatus = 'URGENT';
      
      // Get revenue stage from first question
      const revenueStage = answers['q1']?.label || 'unknown';
      
      // Create assessment result object
      const assessmentResult = {
        id: `assessment-${Date.now()}`,
        userId: 'temp-user-001',
        completedAt: new Date().toISOString(),
        totalScore,
        maxScore,
        percentage,
        healthStatus,
        revenueStage,
        sectionScores,
        answers
      };
      
      // Save to localStorage
      localStorage.setItem('latestAssessment', JSON.stringify(assessmentResult));
      localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
      localStorage.setItem('assessmentResults', JSON.stringify({
        totalScore,
        percentage,
        healthStatus,
        revenueStage,
        sections: [
          { name: 'Business Foundation', score: sectionScores.foundation, max: 40, percentage: Math.round((sectionScores.foundation / 40) * 100) },
          { name: 'Strategic Wheel', score: sectionScores.strategic_wheel, max: 60, percentage: Math.round((sectionScores.strategic_wheel / 60) * 100) },
          { name: 'Profitability Health', score: sectionScores.profitability, max: 30, percentage: Math.round((sectionScores.profitability / 30) * 100) },
          { name: 'Business Engines', score: sectionScores.engines, max: 100, percentage: Math.round((sectionScores.engines / 100) * 100) },
          { name: 'Success Disciplines', score: sectionScores.disciplines, max: 60, percentage: Math.round((sectionScores.disciplines / 60) * 100) }
        ]
      }));
      
      // Get all assessments and add this one
      const existingAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
      existingAssessments.push(assessmentResult);
      localStorage.setItem('assessments', JSON.stringify(existingAssessments));
      
      // Redirect to results page
      router.push('/assessment/results');
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setError('Failed to save assessment. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with exit button */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Development Assessment</h1>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive evaluation of your business health and opportunities
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100"
            >
              Exit
            </button>
          </div>

          {/* Progress Information */}
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

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Question Header */}
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

          {/* Answer Options */}
          <div className="p-8">
            {currentQuestion.type === 'radio' && currentQuestion.options && (
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
            )}

            {currentQuestion.type === 'yesno-group' && currentQuestion.questions && (
              <div className="space-y-4">
                {currentQuestion.questions.map((q) => (
                  <div key={q.id} className="flex items-center justify-between py-4 px-5 rounded-xl bg-gray-50/70 hover:bg-gray-100/70 transition-all border border-gray-200/50">
                    <p className="text-gray-700 text-lg flex-1 pr-6">{q.text}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleYesNoGroup(q.id, 'yes')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          answers[q.id]?.value === 'yes'
                            ? 'bg-green-500 text-white shadow-md transform scale-105'
                            : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-600'
                        }`}
                      >
                        YES
                      </button>
                      <button
                        onClick={() => handleYesNoGroup(q.id, 'no')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          answers[q.id]?.value === 'no'
                            ? 'bg-red-500 text-white shadow-md transform scale-105'
                            : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600'
                        }`}
                      >
                        NO
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
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
                      Analyzing...
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