'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import { 
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Target,
  CheckCircle,
  Circle,
  AlertCircle,
  Zap,
  Building2,
  Rocket,
  Crown,
  Trophy,
  Star,
  Megaphone,
  ShoppingCart,
  Heart,
  Settings,
  Calculator,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square
} from 'lucide-react'

type Business = Database['public']['Tables']['businesses']['Row']

// Revenue stages with their characteristics - matching your methodology
const REVENUE_STAGES = [
  {
    id: 'foundation',
    name: 'Foundation',
    range: '$0-250K',
    min: 0,
    max: 250000,
    icon: Building2,
    color: 'from-gray-500 to-gray-600',
    borderColor: 'border-gray-500',
    bgColor: 'bg-gray-50',
    iconBg: 'bg-gray-100',
    focus: 'Prove concept & reach breakeven',
    keyChallenge: 'Finding product-market fit',
    primaryGoal: 'Consistent revenue + breakeven',
    profitTarget: 'Breakeven to 5%',
    successDisciplines: ['Time Management', 'Financial Acumen', 'Decision-Making'],
  },
  {
    id: 'traction',
    name: 'Traction',
    range: '$250K-1M',
    min: 250000,
    max: 1000000,
    icon: Rocket,
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    focus: 'Scale & systematize + pay owner',
    keyChallenge: 'Building repeatable systems',
    primaryGoal: 'Owner salary + 10-15% profit',
    profitTarget: '10-15% net profit',
    successDisciplines: ['Operational Excellence', 'Strategic Marketing', 'Leadership Development'],
  },
  {
    id: 'scaling',
    name: 'Scaling',
    range: '$1M-3M',
    min: 1000000,
    max: 3000000,
    icon: TrendingUp,
    color: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    focus: 'Optimize & grow + healthy margins',
    keyChallenge: 'Managing complexity',
    primaryGoal: 'Scalable operations + 15-20% profit',
    profitTarget: '15-20% net profit',
    successDisciplines: ['Leadership Development', 'Accountability', 'Technology & AI'],
  },
  {
    id: 'optimization',
    name: 'Optimization',
    range: '$3M-5M',
    min: 3000000,
    max: 5000000,
    icon: Zap,
    color: 'from-green-500 to-green-600',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100',
    focus: 'Perfect & expand + maximize profit',
    keyChallenge: 'System efficiency',
    primaryGoal: 'Excellence + 20%+ profit',
    profitTarget: '20%+ net profit',
    successDisciplines: ['Strategic Excellence', 'Growth Mindset', 'Systems Thinking'],
  },
  {
    id: 'leadership',
    name: 'Leadership',
    range: '$5M-10M',
    min: 5000000,
    max: 10000000,
    icon: Crown,
    color: 'from-yellow-500 to-yellow-600',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-50',
    iconBg: 'bg-yellow-100',
    focus: 'Lead & innovate + strategic profit',
    keyChallenge: 'Market positioning',
    primaryGoal: 'Market leadership + strategic growth',
    profitTarget: 'Strategic profit optimization',
    successDisciplines: ['Visionary Leadership', 'Strategic Partnerships', 'Market Innovation'],
  },
  {
    id: 'mastery',
    name: 'Mastery',
    range: '$10M+',
    min: 10000000,
    max: Infinity,
    icon: Trophy,
    color: 'from-red-500 to-red-600',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50',
    iconBg: 'bg-red-100',
    focus: 'Empire building + wealth creation',
    keyChallenge: 'Building lasting value',
    primaryGoal: 'Legacy + diversification',
    profitTarget: 'Maximum profitability + wealth',
    successDisciplines: ['Strategic Acquisitions', 'Enterprise Leadership', 'Wealth Creation'],
  },
]

// Business engines with stage-specific priorities - from your methodology
const BUSINESS_ENGINES = [
  {
    id: 'attract',
    name: 'Attract Engine',
    subtitle: 'Marketing & Lead Generation',
    icon: Megaphone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    stages: {
      foundation: {
        priorities: [
          'Identify target market',
          'Create basic marketing message',
          'Choose 1-2 marketing channels',
          'Build simple website',
          'Basic social media presence',
          'Local networking',
        ],
        metrics: ['Website visitors', 'Lead inquiries', 'Conversion rate', 'Cost per lead'],
      },
      traction: {
        priorities: [
          'Track marketing ROI',
          'Develop 2-3 marketing strategies',
          'Build client database',
          'Create referral system',
          'Email marketing setup',
          'Content creation basics',
        ],
        metrics: ['Cost per lead', 'Lead quality score', 'Monthly leads', 'Channel ROI'],
      },
      scaling: {
        priorities: [
          'Comprehensive marketing plan',
          'Build marketing team',
          'Marketing automation',
          'Content marketing strategy',
          'SEO optimization',
          'Paid advertising campaigns',
        ],
        metrics: ['Marketing ROI', 'Pipeline value', 'Channel performance', 'Brand awareness'],
      },
      optimization: {
        priorities: [
          'Multi-channel marketing',
          'Advanced analytics',
          'Brand authority building',
          'Partnership development',
          'Influencer relationships',
          'Speaking engagements',
        ],
        metrics: ['Customer acquisition cost', 'Lifetime value', 'Brand awareness', 'Market share'],
      },
      leadership: {
        priorities: [
          'Market authority position',
          'Thought leadership',
          'Strategic partnerships',
          'Innovation in marketing',
          'Industry publications',
          'Conference keynotes',
        ],
        metrics: ['Market share', 'Industry recognition', 'Partnership revenue', 'Thought leadership'],
      },
      mastery: {
        priorities: [
          'National market expansion',
          'Industry thought leadership',
          'Platform/franchise development',
          'Category leadership',
          'Strategic acquisition marketing',
          'Global market entry',
        ],
        metrics: ['National penetration', 'Category leadership', 'Acquisition pipeline', 'Platform scalability'],
      },
    },
  },
  {
    id: 'convert',
    name: 'Convert Engine',
    subtitle: 'Sales & Conversion',
    icon: ShoppingCart,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    stages: {
      foundation: {
        priorities: [
          'Define sales process',
          'Create pricing strategy',
          'Develop basic proposals',
          'Follow-up system',
          'Objection handling',
          'Close techniques',
        ],
        metrics: ['Conversion rate', 'Average deal size', 'Sales cycle length', 'Proposals sent'],
      },
      traction: {
        priorities: [
          'Sales scripts & tools',
          'CRM implementation',
          'Sales training',
          'Pipeline management',
          'Proposal templates',
          'Win/loss analysis',
        ],
        metrics: ['Monthly sales', 'Pipeline velocity', 'Win rate', 'Sales qualified leads'],
      },
      scaling: {
        priorities: [
          'Sales team hiring',
          'Advanced CRM',
          'Sales methodology',
          'Performance tracking',
          'Territory planning',
          'Compensation plans',
        ],
        metrics: ['Sales per rep', 'Quota attainment', 'Forecast accuracy', 'Territory performance'],
      },
      optimization: {
        priorities: [
          'Sales team optimization',
          'Advanced forecasting',
          'Key account management',
          'Sales enablement',
          'Strategic pricing',
          'Channel partnerships',
        ],
        metrics: ['Revenue per employee', 'Customer segments', 'Upsell/cross-sell', 'Account penetration'],
      },
      leadership: {
        priorities: [
          'Strategic sales approach',
          'Enterprise sales',
          'Partnership sales',
          'Sales leadership',
          'Solution selling',
          'Consultative approach',
        ],
        metrics: ['Strategic deal size', 'Market positioning', 'Partnership revenue', 'Enterprise accounts'],
      },
      mastery: {
        priorities: [
          'National sales strategy',
          'Strategic partnerships',
          'Acquisition deal-making',
          'Enterprise-level sales',
          'Industry consolidation',
          'International expansion',
        ],
        metrics: ['National revenue', 'Acquisition deals', 'Strategic partnerships', 'Market consolidation'],
      },
    },
  },
  {
    id: 'deliver-cx',
    name: 'Deliver Engine - CX',
    subtitle: 'Customer Experience',
    icon: Heart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    stages: {
      foundation: {
        priorities: [
          'Define service standards',
          'Basic delivery process',
          'Customer feedback system',
          'Quality checklist',
          'Response time goals',
          'Issue resolution',
        ],
        metrics: ['Customer satisfaction', 'Delivery time', 'Quality score', 'Response time'],
      },
      traction: {
        priorities: [
          'Service level agreements',
          'Customer onboarding',
          'Satisfaction surveys',
          'Complaint resolution',
          'Customer success basics',
          'Testimonial collection',
        ],
        metrics: ['Net Promoter Score', 'Retention rate', 'Repeat business', 'Customer complaints'],
      },
      scaling: {
        priorities: [
          'Customer success team',
          'Retention programs',
          'Loyalty initiatives',
          'Service automation',
          'Proactive support',
          'Customer education',
        ],
        metrics: ['Customer lifetime value', 'Churn rate', 'Upsell success', 'Support tickets'],
      },
      optimization: {
        priorities: [
          'Customer journey mapping',
          'Experience optimization',
          'Predictive service',
          'Value-added services',
          'Customer segmentation',
          'Personalization',
        ],
        metrics: ['Experience scores', 'Service efficiency', 'Innovation adoption', 'Customer effort'],
      },
      leadership: {
        priorities: [
          'Industry-leading experience',
          'Innovation in service',
          'Customer advisory board',
          'Thought leadership',
          'Best practice sharing',
          'Awards & recognition',
        ],
        metrics: ['Industry recognition', 'Customer advocacy', 'Service leadership', 'Innovation metrics'],
      },
      mastery: {
        priorities: [
          'National service standards',
          'Acquisition integration',
          'Strategic customer programs',
          'Industry benchmark service',
          'Business model innovation',
          'Global service delivery',
        ],
        metrics: ['National satisfaction', 'Integration success', 'Industry leadership', 'Innovation adoption'],
      },
    },
  },
  {
    id: 'deliver-people',
    name: 'Deliver Engine - People',
    subtitle: 'People & Team',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    stages: {
      foundation: {
        priorities: [
          'Hire first employees',
          'Basic job descriptions',
          'Simple onboarding',
          'Core values definition',
          'Basic training',
          'Team communication',
        ],
        metrics: ['Employee count', 'Basic productivity', 'Turnover rate', 'Time to hire'],
      },
      traction: {
        priorities: [
          'Team structure design',
          'Performance reviews',
          'Training programs',
          'Culture development',
          'Recognition systems',
          'Team building',
        ],
        metrics: ['Employee satisfaction', 'Productivity/person', 'Training completion', 'Culture scores'],
      },
      scaling: {
        priorities: [
          'Management layer',
          'Leadership development',
          'Succession planning',
          'Advanced training',
          'Career paths',
          'Compensation strategy',
        ],
        metrics: ['Leadership bench', 'Engagement scores', 'Performance ratings', 'Promotion rate'],
      },
      optimization: {
        priorities: [
          'Organizational design',
          'Talent management',
          'Culture optimization',
          'Leadership pipeline',
          'Executive coaching',
          'Innovation programs',
        ],
        metrics: ['Talent retention', 'Leadership effectiveness', 'Culture scores', 'Innovation index'],
      },
      leadership: {
        priorities: [
          'Executive team',
          'Board development',
          'Strategic leadership',
          'Innovation culture',
          'Industry leadership',
          'Thought leadership',
        ],
        metrics: ['Leadership pipeline', 'Innovation metrics', 'Strategic capability', 'Industry rankings'],
      },
      mastery: {
        priorities: [
          'Strategic talent acquisition',
          'Acquisition team integration',
          'Leadership legacy',
          'National talent strategy',
          'Cultural scalability',
          'Global workforce',
        ],
        metrics: ['Strategic talent', 'Integration success', 'Leadership impact', 'Cultural coherence'],
      },
    },
  },
  {
    id: 'deliver-systems',
    name: 'Deliver Engine - Systems',
    subtitle: 'Systems & Process',
    icon: Settings,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    stages: {
      foundation: {
        priorities: [
          'Document core processes',
          'Basic quality systems',
          'Essential tools',
          'File organization',
          'Basic workflows',
          'Manual checklists',
        ],
        metrics: ['Process documentation %', 'Error rates', 'Efficiency gains', 'Manual tasks'],
      },
      traction: {
        priorities: [
          'Process standardization',
          'Quality management',
          'Technology integration',
          'Workflow optimization',
          'Basic automation',
          'System documentation',
        ],
        metrics: ['Process compliance', 'System uptime', 'Productivity metrics', 'Automation %'],
      },
      scaling: {
        priorities: [
          'Process automation',
          'Advanced systems',
          'Integration platforms',
          'Continuous improvement',
          'KPI dashboards',
          'Real-time reporting',
        ],
        metrics: ['Automation percentage', 'System integration', 'Process efficiency', 'Cycle times'],
      },
      optimization: {
        priorities: [
          'Operational excellence',
          'Advanced analytics',
          'Predictive systems',
          'Innovation processes',
          'AI implementation',
          'Digital transformation',
        ],
        metrics: ['Operational metrics', 'Innovation rate', 'System optimization', 'Digital maturity'],
      },
      leadership: {
        priorities: [
          'Industry-leading systems',
          'AI/ML integration',
          'Process innovation',
          'Operational leadership',
          'Best practice creation',
          'Industry standards',
        ],
        metrics: ['Industry benchmarks', 'Innovation leadership', 'System excellence', 'Best practices'],
      },
      mastery: {
        priorities: [
          'National systems architecture',
          'Acquisition integration systems',
          'Strategic automation',
          'Platform scalability',
          'Industry consolidation systems',
          'Global operations',
        ],
        metrics: ['National efficiency', 'Integration success', 'Platform performance', 'Strategic systems'],
      },
    },
  },
  {
    id: 'finance',
    name: 'Finance Engine',
    subtitle: 'Financial Management',
    icon: Calculator,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    stages: {
      foundation: {
        priorities: [
          'Basic bookkeeping',
          'Cash flow tracking',
          'Pricing strategy',
          'Tax compliance',
          'Invoice management',
          'Expense tracking',
        ],
        metrics: ['Monthly revenue', 'Basic profitability', 'Cash position', 'Burn rate'],
      },
      traction: {
        priorities: [
          'Monthly financial reports',
          'Budget vs actual',
          'Profit margin analysis',
          'Growth funding',
          'Financial controls',
          'Working capital',
        ],
        metrics: ['Gross margin', 'Operating margin', 'Cash flow positive', 'Runway months'],
      },
      scaling: {
        priorities: [
          'Advanced reporting',
          'Financial forecasting',
          'Investment planning',
          'Risk management',
          'Scenario planning',
          'Capital raising',
        ],
        metrics: ['EBITDA', 'ROI metrics', 'Financial ratios', 'Working capital'],
      },
      optimization: {
        priorities: [
          'Strategic financial planning',
          'Capital optimization',
          'Performance analytics',
          'Investor relations',
          'M&A readiness',
          'Wealth building',
        ],
        metrics: ['Return on equity', 'Capital efficiency', 'Financial performance', 'Debt ratios'],
      },
      leadership: {
        priorities: [
          'Strategic investments',
          'Market leadership funding',
          'Advanced analytics',
          'Financial innovation',
          'Portfolio management',
          'Exit planning',
        ],
        metrics: ['Strategic ROI', 'Market valuation', 'Financial leadership', 'Investment returns'],
      },
      mastery: {
        priorities: [
          'Strategic acquisitions',
          'Business valuation optimization',
          'Wealth diversification',
          'Investment portfolios',
          'Legacy financial planning',
          'Global finance',
        ],
        metrics: ['Acquisition ROI', 'Business valuation', 'Wealth creation', 'Portfolio performance'],
      },
    },
  },
]

export default function RevenueRoadmap() {
  const router = useRouter()
  const supabase = createClient()
  const [business, setBusiness] = useState<Business | null>(null)
  const [currentStage, setCurrentStage] = useState<typeof REVENUE_STAGES[0] | null>(null)
  const [expandedEngines, setExpandedEngines] = useState<string[]>(['attract'])
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBusiness()
  }, [])

  const loadBusiness = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (data) {
        setBusiness(data)
        
        // Determine current stage based on revenue
        const revenue = data.annual_revenue || 0
        const stage = REVENUE_STAGES.find(s => revenue >= s.min && revenue < s.max) || REVENUE_STAGES[0]
        setCurrentStage(stage)
      }
    } catch (error) {
      console.error('Error loading business:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate progress to next stage
  const calculateProgress = () => {
    if (!business || !currentStage) return 0
    const revenue = business.annual_revenue || 0
    
    if (currentStage.max === Infinity) return 100
    
    const stageProgress = ((revenue - currentStage.min) / (currentStage.max - currentStage.min)) * 100
    return Math.min(100, Math.max(0, stageProgress))
  }

  // Get next stage
  const getNextStage = () => {
    if (!currentStage) return null
    const currentIndex = REVENUE_STAGES.findIndex(s => s.id === currentStage.id)
    return REVENUE_STAGES[currentIndex + 1] || null
  }

  // Toggle engine expansion
  const toggleEngine = (engineId: string) => {
    setExpandedEngines(prev => 
      prev.includes(engineId) 
        ? prev.filter(id => id !== engineId)
        : [...prev, engineId]
    )
  }

  // Toggle task completion
  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading revenue roadmap...</div>
      </div>
    )
  }

  const nextStage = getNextStage()
  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Revenue Stage Roadmap</h1>
              <p className="text-gray-600 mt-2">
                Your comprehensive growth path with stage-specific priorities
              </p>
            </div>
            
            {business && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Current Revenue</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${(business.annual_revenue || 0).toLocaleString()}
                </div>
                {business.net_margin && (
                  <div className="text-sm text-gray-600 mt-1">
                    Net Margin: <span className={`font-medium ${
                      business.net_margin >= 15 ? 'text-green-600' : 
                      business.net_margin >= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{business.net_margin}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stage Progress Visual */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            {REVENUE_STAGES.map((stage, index) => {
              const Icon = stage.icon
              const isCurrent = currentStage?.id === stage.id
              const isPast = (business?.annual_revenue || 0) > stage.max
              const isFuture = (business?.annual_revenue || 0) < stage.min
              
              return (
                <div key={stage.id} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCurrent 
                          ? `bg-gradient-to-r ${stage.color} text-white shadow-lg scale-110` 
                          : isPast 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-xs font-medium ${
                        isCurrent ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {stage.name}
                      </div>
                      <div className={`text-xs ${
                        isCurrent ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {stage.range}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection line */}
                  {index < REVENUE_STAGES.length - 1 && (
                    <div 
                      className={`absolute top-6 left-1/2 w-full h-0.5 ${
                        isPast ? 'bg-green-300' : 'bg-gray-200'
                      }`}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Stage Details - Redesigned */}
        {currentStage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Current Stage Card - More Compact */}
            <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${currentStage.borderColor}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${currentStage.iconBg} flex-shrink-0`}>
                  <currentStage.icon className={`w-6 h-6 text-${currentStage.id}-600`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Current Stage</div>
                  <div className={`text-2xl font-bold bg-gradient-to-r ${currentStage.color} bg-clip-text text-transparent mb-3`}>
                    {currentStage.name}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{currentStage.focus}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-green-600">{currentStage.profitTarget}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">Top Success Disciplines</div>
                    <div className="flex flex-wrap gap-1">
                      {currentStage.successDisciplines.map((discipline, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {discipline}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Stage Info - Compact */}
            {nextStage ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Path to {nextStage.name}</h3>
                  <span className="text-2xl font-bold text-gray-900">
                    ${(nextStage.min - (business?.annual_revenue || 0)).toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${nextStage.color} h-2 rounded-full transition-all`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Target Margin</span>
                    <span className="text-sm font-medium text-green-600">{nextStage.profitTarget}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-6 text-white">
                <Trophy className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Mastery Achieved!</h3>
                <p className="text-sm opacity-90">
                  Focus on empire building, strategic acquisitions, and wealth creation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Business Engines Section - With Checklists */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Engines - Stage Priorities</h2>
            <p className="text-gray-600">Track your progress by checking off completed priorities</p>
          </div>
          
          {/* All Engines Accordion with Checklists */}
          <div className="space-y-3">
            {BUSINESS_ENGINES.map((engine) => {
              const Icon = engine.icon
              const isExpanded = expandedEngines.includes(engine.id)
              const stageData = currentStage ? engine.stages[currentStage.id as keyof typeof engine.stages] : null
              
              return (
                <div key={engine.id} className={`border ${engine.borderColor} rounded-lg overflow-hidden`}>
                  <button
                    onClick={() => toggleEngine(engine.id)}
                    className={`w-full px-6 py-4 ${engine.bgColor} hover:opacity-90 transition-all flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${engine.color}`} />
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{engine.name}</h3>
                        <p className="text-sm text-gray-600">{engine.subtitle}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {isExpanded && stageData && (
                    <div className="p-6 bg-white border-t">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Priorities as Checklist */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Priorities Checklist</h4>
                          <div className="space-y-2">
                            {stageData.priorities.map((priority, index) => {
                              const taskId = `${engine.id}-${index}`
                              return (
                                <label key={index} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                  <input
                                    type="checkbox"
                                    checked={completedTasks[taskId] || false}
                                    onChange={() => toggleTask(taskId)}
                                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className={`text-sm ${completedTasks[taskId] ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                    {priority}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                        
                        {/* Metrics */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Key Metrics to Track</h4>
                          <div className="flex flex-wrap gap-2">
                            {stageData.metrics.map((metric, index) => (
                              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {metric}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Strategic Wheel Focus - Compact Grid */}
        {currentStage && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Strategic Wheel Focus Areas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Vision & Purpose', focus: currentStage.id === 'foundation' ? 'Clarify why you exist' : currentStage.id === 'traction' ? 'Communicate vision consistently' : currentStage.id === 'scaling' ? 'Align team with vision' : currentStage.id === 'optimization' ? 'Evolve vision for scale' : currentStage.id === 'leadership' ? 'Lead industry vision' : 'Create lasting legacy' },
                { name: 'Strategy & Market', focus: currentStage.id === 'foundation' ? 'Define target market' : currentStage.id === 'traction' ? 'Refine positioning' : currentStage.id === 'scaling' ? 'Market expansion' : currentStage.id === 'optimization' ? 'Competitive dominance' : currentStage.id === 'leadership' ? 'Market leadership' : 'Global leadership' },
                { name: 'People & Culture', focus: currentStage.id === 'foundation' ? 'Hire right people' : currentStage.id === 'traction' ? 'Build culture' : currentStage.id === 'scaling' ? 'Develop leaders' : currentStage.id === 'optimization' ? 'Optimize talent' : currentStage.id === 'leadership' ? 'Strategic leadership' : 'Legacy leadership' },
                { name: 'Systems & Execution', focus: currentStage.id === 'foundation' ? 'Document processes' : currentStage.id === 'traction' ? 'Systematize operations' : currentStage.id === 'scaling' ? 'Scale systems' : currentStage.id === 'optimization' ? 'Optimize performance' : currentStage.id === 'leadership' ? 'Innovation systems' : 'Enterprise systems' },
                { name: 'Financial Management', focus: currentStage.id === 'foundation' ? 'Track cash flow' : currentStage.id === 'traction' ? 'Manage profitability' : currentStage.id === 'scaling' ? 'Plan investments' : currentStage.id === 'optimization' ? 'Optimize returns' : currentStage.id === 'leadership' ? 'Strategic finance' : 'Wealth creation' },
                { name: 'Communications', focus: currentStage.id === 'foundation' ? 'Regular meetings' : currentStage.id === 'traction' ? 'Structured comms' : currentStage.id === 'scaling' ? 'Alignment systems' : currentStage.id === 'optimization' ? 'Performance comms' : currentStage.id === 'leadership' ? 'Strategic comms' : 'Legacy comms' },
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-600">{item.focus}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push('/assessment')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Take Full Assessment
          </button>
          <button
            onClick={() => router.push('/swot')}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            SWOT Analysis
          </button>
        </div>
      </div>
    </div>
  )
}