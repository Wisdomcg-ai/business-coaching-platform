'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Question {
  id: string
  text: string
  type: 'single' | 'multiple' | 'text' | 'number' | 'scale' | 'discipline_group' | 'yes_no_group' | 'competitors'
  options?: string[]
  disciplineQuestions?: Array<{
    id: string
    text: string
  }>
  yesNoQuestions?: Array<{
    id: string
    text: string
  }>
  section: string
  subsection?: string
}

// Define sections for progress tracking
const sections = [
  { name: 'Business Foundation', questions: 6 },
  { name: 'Strategic Wheel', questions: 14 },
  { name: 'Profitability Health', questions: 6 },
  { name: 'Business Engines', questions: 23 },
  { name: 'Success Disciplines', questions: 12 },
  { name: 'Strategic Priorities', questions: 5 }
]

const questions: Question[] = [
  // Section 1: Business Foundation (6 questions)
  {
    id: 'revenue',
    text: "What's your current annual revenue?",
    type: 'single',
    options: [
      'Under $250K',
      '$250K - $1M',
      '$1M - $3M',
      '$3M - $5M',
      '$5M - $10M',
      '$10M+'
    ],
    section: 'Business Foundation'
  },
  {
    id: 'profitMargin',
    text: "What's your current profit margin?",
    type: 'single',
    options: [
      'Losing money',
      'Breaking even (0-5%)',
      'Small profit (5-10%)',
      'Healthy profit (10-15%)',
      'Strong profit (15-20%)',
      'Exceptional profit (20%+)'
    ],
    section: 'Business Foundation'
  },
  {
    id: 'ownerSalary',
    text: 'Are you paying yourself a market-rate salary consistently?',
    type: 'single',
    options: [
      'No - rarely take money out',
      'Sometimes - when cash flow allows',
      'Yes - regular salary below market',
      'Yes - full market-rate salary',
      'Yes - salary plus profit distributions'
    ],
    section: 'Business Foundation'
  },
  {
    id: 'teamSize',
    text: 'How many people work in your business?',
    type: 'single',
    options: [
      'Just me',
      '2-5 people',
      '6-15 people',
      '16-50 people',
      '50+ people'
    ],
    section: 'Business Foundation'
  },
  {
    id: 'businessDependency',
    text: 'How dependent is the business on you personally?',
    type: 'single',
    options: [
      'Completely - stops without me',
      'Very - needs me for most decisions',
      'Somewhat - can run for short periods',
      'Minimal - runs well without me'
    ],
    section: 'Business Foundation'
  },
  {
    id: 'revenuePredictability',
    text: 'How predictable is your monthly revenue?',
    type: 'single',
    options: [
      'Completely unpredictable - varies wildly',
      'Somewhat predictable - within 50%',
      'Very predictable - within 25%',
      'Extremely predictable - recurring revenue'
    ],
    section: 'Business Foundation'
  },

  // Section 2: Strategic Wheel (14 questions)
  {
    id: 'visionClarity',
    text: 'How clear and compelling is your business vision?',
    type: 'single',
    options: [
      'Very unclear - no defined direction',
      'Somewhat clear - general idea',
      'Clear - team understands it',
      'Crystal clear - guides all decisions'
    ],
    section: 'Strategic Wheel',
    subsection: 'Vision & Purpose'
  },
  {
    id: 'teamBuyIn',
    text: 'Does your team understand and believe in your purpose?',
    type: 'single',
    options: [
      'No understanding or buy-in',
      'Some understanding, limited buy-in',
      'Good understanding and buy-in',
      'Complete alignment and passion'
    ],
    section: 'Strategic Wheel',
    subsection: 'Vision & Purpose'
  },
  {
    id: 'targetMarket',
    text: 'How well-defined is your target market and positioning?',
    type: 'single',
    options: [
      'Serve anyone who will pay',
      'General target market defined',
      'Specific ideal customer profile',
      'Laser-focused with clear differentiation'
    ],
    section: 'Strategic Wheel',
    subsection: 'Strategy & Market'
  },
  {
    id: 'competitiveAdvantage',
    text: 'Do you have a sustainable competitive advantage?',
    type: 'single',
    options: [
      'Compete mainly on price',
      'Some differentiation',
      'Clear unique value proposition',
      'Dominant market position'
    ],
    section: 'Strategic Wheel',
    subsection: 'Strategy & Market'
  },
  {
    id: 'uniqueSellingProps',
    text: 'Have you clearly defined and do you actively use your Unique Selling Propositions (USPs)?',
    type: 'single',
    options: [
      "Don't know what makes us different",
      'Have some ideas but not clearly defined',
      'USPs defined but not consistently used in marketing',
      'Clear USPs used across all marketing materials',
      'Powerful USPs that immediately resonate with ideal clients'
    ],
    section: 'Strategic Wheel',
    subsection: 'Strategy & Market'
  },
  {
    id: 'competitors',
    text: 'Who are your top 3 competitors and what makes you different?',
    type: 'competitors',
    section: 'Strategic Wheel',
    subsection: 'Strategy & Market'
  },
  {
    id: 'teamCulture',
    text: 'How strong is your team and culture?',
    type: 'single',
    options: [
      'Struggling with people issues',
      'Adequate team, developing culture',
      'Good team, positive culture',
      'A-players with exceptional culture'
    ],
    section: 'Strategic Wheel',
    subsection: 'People & Culture'
  },
  {
    id: 'coreValues',
    text: 'How well-defined and lived are your core values?',
    type: 'single',
    options: [
      'No defined core values',
      "Values exist but aren't used",
      'Values guide some decisions',
      'Values drive all decisions and hiring'
    ],
    section: 'Strategic Wheel',
    subsection: 'People & Culture'
  },
  {
    id: 'businessExecution',
    text: 'How systematic is your business execution?',
    type: 'single',
    options: [
      'Ad hoc, reactive approach',
      'Some systems, inconsistent execution',
      'Good systems, reliable execution',
      'Exceptional systems and execution'
    ],
    section: 'Strategic Wheel',
    subsection: 'Systems & Execution'
  },
  {
    id: 'meetingRhythms',
    text: 'Do you have effective meeting rhythms?',
    type: 'single',
    options: [
      'Irregular, unproductive meetings',
      'Some meetings, limited value',
      'Weekly team meetings with agendas',
      'Daily huddles, weekly tactical, monthly strategic'
    ],
    section: 'Strategic Wheel',
    subsection: 'Systems & Execution'
  },
  {
    id: 'performanceTracking',
    text: 'How well do you track business performance with a dashboard?',
    type: 'single',
    options: [
      "Don't track metrics systematically",
      'Track basic metrics monthly',
      'Weekly dashboard review',
      'Real-time dashboard reviewed daily'
    ],
    section: 'Strategic Wheel',
    subsection: 'Money & Metrics'
  },
  {
    id: 'oneNumber',
    text: 'Have you identified your "1 Number" that drives everything?',
    type: 'single',
    options: [
      'No idea what this means',
      'Track many metrics, no focus',
      'Have identified key metric',
      '"1 Number" drives all decisions'
    ],
    section: 'Strategic Wheel',
    subsection: 'Money & Metrics'
  },
  {
    id: 'teamAlignment',
    text: 'How aligned is your team around priorities?',
    type: 'single',
    options: [
      'Little to no alignment',
      'Some alignment, poor communication',
      'Good alignment and communication',
      'Perfect alignment and rhythm'
    ],
    section: 'Strategic Wheel',
    subsection: 'Communications'
  },
  {
    id: 'teamCommunications',
    text: 'How organized are your team communications?',
    type: 'single',
    options: [
      'Scattered across email, texts, calls, and apps',
      'Multiple channels but manageable',
      'Streamlined to 2-3 main channels',
      'One primary platform for all team communication'
    ],
    section: 'Strategic Wheel',
    subsection: 'Communications'
  },

  // Section 3: Profitability Health (6 questions)
  {
    id: 'profitBarriers',
    text: 'What prevents you from achieving your target profit margin?',
    type: 'multiple',
    options: [
      'Prices are too low for the value delivered',
      'Costs are not well controlled',
      "Don't know true profit by product/service",
      'Too many discounts given',
      'Inefficient operations increase costs',
      'High customer acquisition costs',
      'Poor cash flow management',
      'Overhead too high for revenue'
    ],
    section: 'Profitability Health'
  },
  {
    id: 'lastPriceIncrease',
    text: 'When did you last increase prices?',
    type: 'single',
    options: [
      'Never or over 2 years ago',
      '1-2 years ago',
      '6-12 months ago',
      'Within last 6 months'
    ],
    section: 'Profitability Health'
  },
  {
    id: 'pricingConfidence',
    text: 'How confident are you in your pricing strategy?',
    type: 'single',
    options: [
      'Very unsure - often discount or apologize',
      'Somewhat confident - occasional doubts',
      'Confident - rarely questioned',
      'Very confident - optimal pricing achieved'
    ],
    section: 'Profitability Health'
  },
  {
    id: 'expenseReview',
    text: 'How often do you review and audit your business expenses?',
    type: 'single',
    options: [
      'Never or only when cash is tight',
      'Annually',
      'Quarterly',
      'Monthly with action taken on findings'
    ],
    section: 'Profitability Health'
  },
  {
    id: 'subscriptionAudit',
    text: 'Do you regularly review and cancel unused subscriptions/services?',
    type: 'single',
    options: [
      "No - probably paying for things we don't use",
      'Occasionally when I notice something',
      'Annual review of all subscriptions',
      'Quarterly audit with immediate cancellations'
    ],
    section: 'Profitability Health'
  },
  {
    id: 'supplierNegotiation',
    text: 'When did you last negotiate with suppliers for better pricing?',
    type: 'single',
    options: [
      'Never or over 2 years ago',
      'Within the last 2 years',
      'Within the last year',
      'Within the last 6 months'
    ],
    section: 'Profitability Health'
  },

  // Section 4: Business Engines (23 questions total)
  // Attract Engine
  {
    id: 'monthlyLeads',
    text: 'How many qualified leads do you generate monthly?',
    type: 'single',
    options: [
      'Under 20 leads',
      '20-50 leads',
      '50-100 leads',
      '100+ leads'
    ],
    section: 'Business Engines',
    subsection: 'Attract Engine'
  },
  {
    id: 'marketingChannels',
    text: 'How many reliable marketing channels generate leads?',
    type: 'single',
    options: [
      'No consistent channels',
      '1-2 inconsistent sources',
      '3-4 regular sources',
      '5+ systematic channels'
    ],
    section: 'Business Engines',
    subsection: 'Attract Engine'
  },
  {
    id: 'marketingProcess',
    text: 'Do you have a documented marketing process?',
    type: 'single',
    options: [
      'No process at all',
      "Have a process but don't follow it",
      'Have a process and follow it sometimes',
      'Have a documented process and follow it consistently'
    ],
    section: 'Business Engines',
    subsection: 'Attract Engine'
  },
  {
    id: 'attract_systems',
    text: 'How systematic is your lead generation?',
    type: 'yes_no_group',
    yesNoQuestions: [
      { id: 'q1', text: 'We have a referral system generating 30%+ of business' },
      { id: 'q2', text: 'We email our database/leads regularly to nurture relationships' },
      { id: 'q3', text: 'We track ROI for each marketing channel' },
      { id: 'q4', text: 'We know our cost per lead and customer acquisition cost' }
    ],
    section: 'Business Engines',
    subsection: 'Attract Engine'
  },

  // Convert Engine
  {
    id: 'conversionRate',
    text: "What's your lead-to-customer conversion rate?",
    type: 'single',
    options: [
      "Under 15% or don't track",
      '15-25%',
      '25-40%',
      'Over 40%'
    ],
    section: 'Business Engines',
    subsection: 'Convert Engine'
  },
  {
    id: 'salesProcess',
    text: 'Do you have a documented sales process that you follow?',
    type: 'single',
    options: [
      'No process at all',
      "Have a process but don't follow it",
      'Have a process and follow it sometimes',
      'Have a process and follow it consistently'
    ],
    section: 'Business Engines',
    subsection: 'Convert Engine'
  },
  {
    id: 'sales_capability',
    text: 'How effective is your sales capability?',
    type: 'yes_no_group',
    yesNoQuestions: [
      { id: 'q1', text: 'We follow up multiple times with interested prospects' },
      { id: 'q2', text: 'We contact prospects who didn\'t sign after receiving proposals' },
      { id: 'q3', text: 'We have ready answers for common objections' },
      { id: 'q4', text: 'We always ask for the business rather than waiting' }
    ],
    section: 'Business Engines',
    subsection: 'Convert Engine'
  },
  {
    id: 'transaction_value',
    text: 'Do you maximize transaction value?',
    type: 'yes_no_group',
    yesNoQuestions: [
      { id: 'q1', text: 'We offer different price points (basic, standard, premium)' },
      { id: 'q2', text: 'We regularly offer additional products/services to clients' },
      { id: 'q3', text: 'We can confidently explain our pricing without apologizing' },
      { id: 'q4', text: 'Our prices are based on value, not just costs' }
    ],
    section: 'Business Engines',
    subsection: 'Convert Engine'
  },

  // Deliver - Customer
  {
    id: 'customerDelight',
    text: 'What percentage of customers are delighted with your delivery?',
    type: 'single',
    options: [
      'Under 60%',
      '60-75%',
      '75-90%',
      'Over 90%'
    ],
    section: 'Business Engines',
    subsection: 'Deliver - Customer'
  },
  {
    id: 'deliveryProcess',
    text: 'Do you have a documented delivery process that you follow?',
    type: 'single',
    options: [
      'No process at all',
      "Have a process but don't follow it",
      'Have a process and follow it sometimes',
      'Have a documented process and follow it consistently'
    ],
    section: 'Business Engines',
    subsection: 'Deliver - Customer'
  },
  {
    id: 'satisfactionTracking',
    text: 'How do you measure and track customer satisfaction?',
    type: 'single',
    options: [
      "Don't measure systematically",
      'Occasional informal feedback',
      'Regular satisfaction surveys',
      'Comprehensive feedback system with action plans'
    ],
    section: 'Business Engines',
    subsection: 'Deliver - Customer'
  },
  {
    id: 'customer_journey',
    text: 'How exceptional is your customer journey?',
    type: 'yes_no_group',
    yesNoQuestions: [
      { id: 'q1', text: 'Our onboarding experience impresses new customers' },
      { id: 'q2', text: "We've mapped every customer touchpoint" },
      { id: 'q3', text: 'Customers can easily reach us when needed' },
      { id: 'q4', text: 'We systematically review and improve the experience' }
    ],
    section: 'Business Engines',
    subsection: 'Deliver - Customer'
  },

  // Deliver - People
  {
    id: 'talentStrategy',
    text: 'How strategic is your approach to talent?',
    type: 'single',
    options: [
      'Reactive hiring when desperate',
      'Basic hiring process',
      'Good hiring with defined criteria',
      'Systematic recruitment of A-players'
    ],
    section: 'Business Engines',
    subsection: 'Deliver - People'
  },
  {
    id: 'performanceManagement',
    text: 'Do you have a performance management system?',
    type: 'single',
    options: [
      'No formal performance management',
      'Occasional informal feedback',
      'Regular reviews without clear criteria',
      'Systematic reviews against core values and job KPIs'
    ],
    section: 'Business Engines',
    subsection: 'Deliver - People'
  },
  {
    id: 'team_development',
    text: 'How effectively do you develop and leverage your team?',
    type: 'yes_no_group',
    yesNoQuestions: [
      { id: 'q1', text: 'Every role has documented responsibilities and KPIs' },
      { id: 'q2', text: 'We invest in team training and development' },
      { id: 'q3', text: 'We strategically outsource non-core activities' },
      { id: 'q4', text: 'Team is accountable for results' }
    ],
    section: 'Business Engines',
    subsection: 'Deliver - People'
  },

  // Deliver - Systems
  {
    id: 'processDocumentation',
    text: 'How comprehensive is your process documentation?',
    type: 'single',
    options: [
      "Most processes exist only in people's heads",
      'Some processes documented',
      'Most key processes documented',
      'All processes documented and optimized'
    ],
    section: 'Business Engines',
    subsection: 'Deliver - Systems'
  },
  {
    id: 'systemAudits',
    text: 'How often do you audit if systems are being followed?',
    type: 'single',
    options: [
      'Never audit compliance',
      'Only when problems arise',
      'Annual system audits',
      'Quarterly audits with improvements'
    ],
    section: 'Business Engines',
    subsection: 'Deliver - Systems'
  },
  {
    id: 'operational_infrastructure',
    text: 'How advanced is your operational infrastructure?',
    type: 'yes_no_group',
    yesNoQuestions: [
      { id: 'q1', text: 'We have robust data backup and security systems' },
      { id: 'q2', text: 'We have documented customer retention/delight processes' },
      { id: 'q3', text: 'Our technology infrastructure is current and integrated' },
      { id: 'q4', text: 'We measure process efficiency and cycle times' }
    ],
    section: 'Business Engines',
    subsection: 'Deliver - Systems'
  },

  // Finance Engine
  {
    id: 'budgetForecast',
    text: 'Do you have a comprehensive P&L budget/forecast?',
    type: 'single',
    options: [
      'No budget or forecast',
      'Basic revenue/expense tracking',
      'Annual budget created',
      'Detailed budget with monthly variance analysis'
    ],
    section: 'Business Engines',
    subsection: 'Finance Engine'
  },
  {
    id: 'cashFlowForecast',
    text: 'Do you maintain cash flow forecasts?',
    type: 'single',
    options: [
      'No cash flow forecasting',
      'Check bank balance when needed',
      'Monthly cash flow review',
      '13-week rolling cash flow forecast'
    ],
    section: 'Business Engines',
    subsection: 'Finance Engine'
  },
  {
    id: 'pricingUnderstanding',
    text: 'Which statement best describes your understanding of pricing?',
    type: 'single',
    options: [
      "I'm not sure of the difference between markup and margin",
      "I understand the difference but don't use it strategically",
      'I calculate both and understand their impact',
      'I optimize pricing using both markup and margin analysis'
    ],
    section: 'Business Engines',
    subsection: 'Finance Engine'
  },
  {
    id: 'working_capital',
    text: 'How well do you manage profitability and working capital?',
    type: 'yes_no_group',
    yesNoQuestions: [
      { id: 'q1', text: 'We maintain sufficient cash reserves (3+ months expenses)' },
      { id: 'q2', text: 'We actively manage our cash conversion cycle' },
      { id: 'q3', text: 'We know which products/services are most profitable' },
      { id: 'q4', text: 'We have increased prices in the last 12 months' }
    ],
    section: 'Business Engines',
    subsection: 'Finance Engine'
  },

  // Section 5: Success Disciplines (12 questions - one per discipline)
  {
    id: 'discipline_decision',
    text: 'Decision-Making Frameworks',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'I have clear criteria for different types of decisions' },
      { id: 'q2', text: 'I make small decisions quickly without overthinking' },
      { id: 'q3', text: 'I know which decisions need deep analysis vs quick action' },
      { id: 'q4', text: 'I rarely procrastinate on important decisions' },
      { id: 'q5', text: 'I have defined decision-making authority levels' }
    ],
    section: 'Success Disciplines'
  },
  {
    id: 'discipline_technology',
    text: 'Technology & AI Integration',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'We use technology effectively for marketing automation' },
      { id: 'q2', text: 'We track and manage all customer interactions systematically' },
      { id: 'q3', text: 'We use AI for content creation or customer service' },
      { id: 'q4', text: 'We use AI for data analysis or insights' },
      { id: 'q5', text: 'We regularly evaluate new technology opportunities' }
    ],
    section: 'Success Disciplines'
  },
  {
    id: 'discipline_growth',
    text: 'Growth Mindset & Learning',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'I dedicate time weekly to learning new business skills' },
      { id: 'q2', text: 'I read business books or listen to podcasts regularly' },
      { id: 'q3', text: 'Our team has learning and development plans' },
      { id: 'q4', text: 'We document and share lessons from wins and failures' },
      { id: 'q5', text: 'We have a culture of continuous improvement' }
    ],
    section: 'Success Disciplines'
  },
  {
    id: 'discipline_leadership',
    text: 'Leadership Development',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'Others naturally follow my vision and direction' },
      { id: 'q2', text: "I'm developing other leaders in the business" },
      { id: 'q3', text: 'I delegate effectively and empower my team' },
      { id: 'q4', text: 'I regularly assess and improve my leadership skills' },
      { id: 'q5', text: 'I spend time working ON the business, not just IN it' }
    ],
    section: 'Success Disciplines'
  },
  {
    id: 'discipline_personal',
    text: 'Personal Mastery',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'I have a morning ritual including planning and goals review' },
      { id: 'q2', text: 'I can maintain deep focus for 2+ hours on important work' },
      { id: 'q3', text: 'I take at least 30 minutes daily for exercise/physical activity' },
      { id: 'q4', text: 'I plan each day in advance with specific outcomes' },
      { id: 'q5', text: 'I consistently maintain high energy throughout the workday' }
    ],
    section: 'Success Disciplines'
  },
  {
    id: 'discipline_operational',
    text: 'Operational Excellence',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'We have standard operating procedures that everyone follows' },
      { id: 'q2', text: 'Our business could operate effectively without me for 6 weeks' },
      { id: 'q3', text: 'We regularly review and optimize our systems' },
      { id: 'q4', text: 'We measure and improve operational efficiency metrics' },
      { id: 'q5', text: 'We have quality control systems in place' }
    ],
    section: 'Success Disciplines'
  },
  {
    id: 'discipline_resource',
    text: 'Resource Optimization',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'We maximize utilization of physical assets and space' },
      { id: 'q2', text: 'Our people are deployed in their highest-value roles' },
      { id: 'q3', text: "We've eliminated or outsourced non-core activities" },
      { id: 'q4', text: 'We regularly review and optimize all resource allocation' },
      { id: 'q5', text: 'We track ROI on all major investments and decisions' }
    ],
    section: 'Success Disciplines'
  },
  {
    id: 'discipline_financial',
    text: 'Financial Acumen',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'I review financial metrics weekly' },
      { id: 'q2', text: 'I understand my profit per customer/job/unit sold' },
      { id: 'q3', text: 'We track budget vs actual with variance analysis' },
      { id: 'q4', text: 'I make decisions based on financial impact' },
      { id: 'q5', text: 'We actively manage cash flow to avoid surprises' }
    ],
    section: 'Success Disciplines'
  },
  {
    id: 'discipline_accountability',
    text: 'Accountability & Performance',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'Every team member has clear KPIs and scorecards' },
      { id: 'q2', text: 'We conduct regular performance reviews' },
      { id: 'q3', text: 'People consistently do what they say they will do' },
      { id: 'q4', text: 'I hold myself accountable to my commitments' },
      { id: 'q5', text: 'We have a culture of ownership and responsibility' }
    ],
    section: 'Success Disciplines'
  },
  {
    id: 'discipline_customer',
    text: 'Customer Experience',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'Customers are delighted and become advocates' },
      { id: 'q2', text: 'We systematically gather and act on customer feedback' },
      { id: 'q3', text: 'We maintain strong relationships beyond the initial transaction' },
      { id: 'q4', text: 'We exceed expectations at every touchpoint' },
      { id: 'q5', text: 'We have a customer success process, not just customer service' }
    ],
    section: 'Success Disciplines'
  },
  {
    id: 'discipline_resilience',
    text: 'Resilience & Renewal',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'I have scheduled breaks and renewal time' },
      { id: 'q2', text: 'I work less than 50 hours per week consistently' },
      { id: 'q3', text: "I've scheduled time off in the next 12 months" },
      { id: 'q4', text: 'I bounce back quickly from setbacks' },
      { id: 'q5', text: 'I maintain work-life integration that energizes me' }
    ],
    section: 'Success Disciplines'
  },
  {
    id: 'discipline_time',
    text: 'Time Management & Effectiveness',
    type: 'discipline_group',
    disciplineQuestions: [
      { id: 'q1', text: 'I use a prioritization system (urgent/important matrix)' },
      { id: 'q2', text: 'I maintain and work from organized to-do lists daily' },
      { id: 'q3', text: 'I calendar-block my most important activities' },
      { id: 'q4', text: 'I have a "Stop Doing List" to eliminate low-value activities' },
      { id: 'q5', text: 'I protect my time by saying no to non-essential requests' }
    ],
    section: 'Success Disciplines'
  },

  // Section 6: Strategic Priorities (5 questions)
  {
    id: 'biggestConstraint',
    text: "What's the single biggest constraint holding your business back?",
    type: 'text',
    section: 'Strategic Priorities'
  },
  {
    id: 'biggestOpportunity',
    text: "What's your biggest opportunity for growth right now?",
    type: 'text',
    section: 'Strategic Priorities'
  },
  {
    id: 'ninetyDayPriority',
    text: 'If you could fix ONE thing in the next 90 days for maximum impact, what would it be?',
    type: 'text',
    section: 'Strategic Priorities'
  },
  {
    id: 'helpNeeded',
    text: 'Where do you need the most help to achieve your goals?',
    type: 'text',
    section: 'Strategic Priorities'
  },
  {
    id: 'financialTargets',
    text: 'What are your 12-month financial targets?',
    type: 'text',
    section: 'Strategic Priorities'
  }
]

export default function AssessmentPage() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClientComponentClient()

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  // Get current section info
  const getCurrentSectionInfo = () => {
    let questionCount = 0
    let currentSectionIndex = 0
    let questionsInCurrentSection = 0
    
    for (let i = 0; i < sections.length; i++) {
      if (currentQuestionIndex < questionCount + sections[i].questions) {
        currentSectionIndex = i
        questionsInCurrentSection = currentQuestionIndex - questionCount + 1
        break
      }
      questionCount += sections[i].questions
    }
    
    return {
      sectionNumber: currentSectionIndex + 1,
      sectionName: sections[currentSectionIndex].name,
      questionInSection: questionsInCurrentSection,
      totalInSection: sections[currentSectionIndex].questions,
      sectionProgress: (questionsInCurrentSection / sections[currentSectionIndex].questions) * 100
    }
  }

  const sectionInfo = getCurrentSectionInfo()

  // Load saved answers on mount
  useEffect(() => {
    loadSavedAnswers()
  }, [])

  const loadSavedAnswers = async () => {
    try {
      const savedAnswers = localStorage.getItem('assessmentAnswers')
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers))
      }
    } catch (error) {
      console.error('Error loading saved answers:', error)
    }
  }

  // Auto-save answers
  const autoSave = async () => {
    try {
      localStorage.setItem('assessmentAnswers', JSON.stringify(answers))
      setSaving(true)
      setTimeout(() => setSaving(false), 1000)
    } catch (error) {
      console.error('Error auto-saving:', error)
    }
  }

  // Validate discipline group - ALL 5 questions must be answered
  const validateDisciplineGroup = (disciplineAnswers: any) => {
    if (!disciplineAnswers) return false
    
    const questions = ['q1', 'q2', 'q3', 'q4', 'q5']
    for (const q of questions) {
      if (disciplineAnswers[q] === undefined || disciplineAnswers[q] === null || disciplineAnswers[q] === '') {
        return false
      }
    }
    return true
  }

  // Validate yes/no group - ALL questions must be answered
  const validateYesNoGroup = (yesNoAnswers: any, questionCount: number) => {
    if (!yesNoAnswers) return false
    
    for (let i = 1; i <= questionCount; i++) {
      const q = `q${i}`
      if (yesNoAnswers[q] === undefined || yesNoAnswers[q] === null || yesNoAnswers[q] === '') {
        return false
      }
    }
    return true
  }

  // Validate competitors - at least 2 required
  const validateCompetitors = (competitorAnswers: any) => {
    if (!competitorAnswers) return false
    
    let validCount = 0
    for (let i = 1; i <= 3; i++) {
      if (competitorAnswers[`competitor${i}`] && 
          competitorAnswers[`competitor${i}`].trim() !== '' &&
          competitorAnswers[`advantage${i}`] && 
          competitorAnswers[`advantage${i}`].trim() !== '') {
        validCount++
      }
    }
    return validCount >= 2
  }

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const handleNext = async () => {
    // Validate current answer
    if (currentQuestion.type === 'discipline_group') {
      if (!validateDisciplineGroup(answers[currentQuestion.id])) {
        alert('Please answer all 5 questions (Yes or No) before proceeding')
        return
      }
    } else if (currentQuestion.type === 'yes_no_group') {
      const questionCount = currentQuestion.yesNoQuestions?.length || 4
      if (!validateYesNoGroup(answers[currentQuestion.id], questionCount)) {
        alert(`Please answer all ${questionCount} questions (Yes or No) before proceeding`)
        return
      }
    } else if (currentQuestion.type === 'competitors') {
      if (!validateCompetitors(answers[currentQuestion.id])) {
        alert('Please provide at least 2 competitors with their advantages')
        return
      }
    } else if (!answers[currentQuestion.id] || 
               (currentQuestion.type === 'multiple' && answers[currentQuestion.id]?.length === 0)) {
      alert('Please answer the current question before proceeding')
      return
    }

    // Auto-save on next
    await autoSave()

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Assessment complete
      calculateAndShowResults()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSaveAndExit = async () => {
    await autoSave()
    alert('Your progress has been saved. You can continue later.')
    router.push('/dashboard')
  }

  const calculateAndShowResults = async () => {
    setLoading(true)
    
    // Calculate scores
    const results = calculateScores(answers)
    
    // Store results
    localStorage.setItem('assessmentResults', JSON.stringify(results))
    localStorage.setItem('assessmentAnswers', JSON.stringify(answers))
    
    // Navigate to results
    router.push('/assessment/results')
  }

  const calculateScores = (answers: Record<string, any>) => {
    // Simplified scoring logic
    let scores = {
      foundation: 0,
      strategicWheel: 0,
      profitability: 0,
      engines: 0,
      disciplines: 0
    }

    // Calculate scores based on answers...
    // (keeping this simple for brevity)
    
    const totalScore = 65 // Placeholder
    
    let healthStatus = 'BUILDING'
    if (totalScore >= 90) healthStatus = 'THRIVING'
    else if (totalScore >= 80) healthStatus = 'STRONG'
    else if (totalScore >= 70) healthStatus = 'STABLE'
    else if (totalScore >= 60) healthStatus = 'BUILDING'
    else if (totalScore >= 50) healthStatus = 'STRUGGLING'
    else healthStatus = 'URGENT'

    return {
      totalScore,
      maxScore: 100,
      percentage: totalScore,
      healthStatus,
      revenueStage: answers.revenue || 'Foundation',
      sections: [
        { name: 'Business Foundation', score: 47, maxScore: 100, percentage: 47 },
        { name: 'Strategic Wheel', score: 43, maxScore: 100, percentage: 43 },
        { name: 'Profitability Health', score: 65, maxScore: 100, percentage: 65 },
        { name: 'Business Engines', score: 70, maxScore: 100, percentage: 70 },
        { name: 'Success Disciplines', score: 25, maxScore: 100, percentage: 25 }
      ],
      topStrengths: [
        'Clear business vision and direction',
        'Strong customer satisfaction',
        'Effective team collaboration'
      ],
      improvementAreas: [
        'Financial planning and budgeting',
        'Marketing automation',
        'Process documentation'
      ],
      insights: {
        biggestConstraint: answers.biggestConstraint,
        biggestOpportunity: answers.biggestOpportunity,
        ninetyDayPriority: answers.ninetyDayPriority,
        helpNeeded: answers.helpNeeded
      }
    }
  }

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'single':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="sr-only"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'multiple':
        return (
          <div className="space-y-3">
            <p className="text-sm text-blue-600 font-medium mb-3 bg-blue-50 p-2 rounded">
              ✓ Select all that apply (you can choose multiple options)
            </p>
            {currentQuestion.options?.map((option) => {
              const isSelected = answers[currentQuestion.id]?.includes(option)
              return (
                <label
                  key={option}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={option}
                    checked={isSelected}
                    onChange={(e) => {
                      const currentAnswers = answers[currentQuestion.id] || []
                      if (e.target.checked) {
                        handleAnswer([...currentAnswers, option])
                      } else {
                        handleAnswer(currentAnswers.filter((a: string) => a !== option))
                      }
                    }}
                    className="mt-1 mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              )
            })}
          </div>
        )

      case 'competitors':
        // Initialize with empty strings to prevent controlled/uncontrolled error
        const competitorData = answers[currentQuestion.id] || {
          competitor1: '',
          advantage1: '',
          website1: '',
          competitor2: '',
          advantage2: '',
          website2: '',
          competitor3: '',
          advantage3: '',
          website3: ''
        }
        
        return (
          <div className="space-y-4">
            <p className="text-sm text-blue-600 font-medium bg-blue-50 p-2 rounded">
              Please provide at least 2 competitors (3rd is optional)
            </p>
            {[1, 2, 3].map(num => (
              <div key={num} className={`p-4 rounded-lg border-2 ${num <= 2 ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'}`}>
                <h4 className="font-medium text-gray-700 mb-3">
                  Competitor {num} {num <= 2 && <span className="text-red-500">*</span>}
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Competitor name"
                    value={competitorData[`competitor${num}`] || ''}
                    onChange={(e) => handleAnswer({
                      ...competitorData,
                      [`competitor${num}`]: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="What makes you different/better?"
                    value={competitorData[`advantage${num}`] || ''}
                    onChange={(e) => handleAnswer({
                      ...competitorData,
                      [`advantage${num}`]: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Competitor website (optional)"
                    value={competitorData[`website${num}`] || ''}
                    onChange={(e) => handleAnswer({
                      ...competitorData,
                      [`website${num}`]: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )

      case 'discipline_group':
        return (
          <div className="space-y-4">
            <p className="text-sm text-blue-600 font-medium mb-4 bg-blue-50 p-3 rounded">
              Answer all 5 questions below (Yes or No required for each)
            </p>
            {currentQuestion.disciplineQuestions?.map((dq) => {
              const currentAnswers = answers[currentQuestion.id] || {}
              const questionAnswered = currentAnswers[dq.id] !== undefined && currentAnswers[dq.id] !== ''
              
              return (
                <div key={dq.id} className={`p-4 rounded-lg border-2 transition-all ${
                  questionAnswered ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                }`}>
                  <p className="text-gray-700 mb-3">{dq.text}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAnswer({
                        ...currentAnswers,
                        [dq.id]: 'yes'
                      })}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        currentAnswers[dq.id] === 'yes'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleAnswer({
                        ...currentAnswers,
                        [dq.id]: 'no'
                      })}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        currentAnswers[dq.id] === 'no'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )

      case 'yes_no_group':
        return (
          <div className="space-y-4">
            <p className="text-sm text-blue-600 font-medium mb-4 bg-blue-50 p-3 rounded">
              Answer all {currentQuestion.yesNoQuestions?.length} questions below (Yes or No required for each)
            </p>
            {currentQuestion.yesNoQuestions?.map((q) => {
              const currentAnswers = answers[currentQuestion.id] || {}
              const questionAnswered = currentAnswers[q.id] !== undefined && currentAnswers[q.id] !== ''
              
              return (
                <div key={q.id} className={`p-4 rounded-lg border-2 transition-all ${
                  questionAnswered ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                }`}>
                  <p className="text-gray-700 mb-3">{q.text}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAnswer({
                        ...currentAnswers,
                        [q.id]: 'yes'
                      })}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        currentAnswers[q.id] === 'yes'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleAnswer({
                        ...currentAnswers,
                        [q.id]: 'no'
                      })}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        currentAnswers[q.id] === 'no'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )

      case 'text':
        return (
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            rows={4}
            placeholder="Type your answer here..."
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header with Save & Exit */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Business Assessment</h1>
          <button
            onClick={handleSaveAndExit}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <span>💾</span> Save & Exit
          </button>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Section Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-600">
                Section {sectionInfo.sectionNumber} of 6: {sectionInfo.sectionName}
              </span>
              <span className="text-sm text-gray-600">
                Question {sectionInfo.questionInSection} of {sectionInfo.totalInSection}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${sectionInfo.sectionProgress}%` }}
              />
            </div>
          </div>

          {/* Overall Progress */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall: Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Auto-save indicator */}
        {saving && (
          <div className="mb-4 text-sm text-green-600 flex items-center gap-2">
            <span>✓</span> Saving your progress...
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestion.text}
          </h2>
          
          {renderQuestion()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentQuestionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-colors"
          >
            {loading ? 'Processing...' : currentQuestionIndex === totalQuestions - 1 ? 'Complete Assessment' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}