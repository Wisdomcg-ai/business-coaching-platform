'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  // Navigation Icons
  LayoutDashboard,
  ClipboardCheck,
  Target,
  FileText,
  Brain,
  Mountain,
  TrendingUp,
  BarChart3,
  DollarSign,
  Banknote,
  Calendar,
  CalendarDays,
  CalendarCheck,
  CheckSquare,
  ListTodo,
  XCircle,
  AlertCircle,
  Layers,
  Eye,
  Activity,
  Users,
  Building2,
  Settings,
  Zap,
  HelpCircle,
  MessageSquare,
  LineChart,
  MessageCircle,
  FileQuestion,
  FolderOpen,
  CalendarClock,
  Compass,
  Award,
  Network,
  BookOpen,
  // UI Control Icons
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Menu,
  X,
  LogOut,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface NavItem {
  label: string
  href: string
  icon: any
  badge?: string
  disabled?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
  roleRequired?: 'coach' | 'client' | 'all'
}

interface BusinessData {
  name: string
  assessmentScore: string
  stage: string
  revenueTarget: number
  profitTarget: number
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Helper function to determine user role (placeholder - integrate with real auth)
function getUserRole(email: string | null): 'coach' | 'client' {
  if (email && email.includes('@wisdomcoaching.com.au')) {
    return 'coach'
  }
  return 'client'
}

// Main navigation structure - organized by coaching methodology
const getNavigation = (userRole: 'coach' | 'client'): NavSection[] => {
  const navigation: NavSection[] = [
    // COMMAND CENTRE - Quick access to main dashboard
    {
      title: 'DASHBOARD',
      defaultOpen: true,
      items: [{ label: 'Command Centre', href: '/dashboard', icon: LayoutDashboard }],
    },

    // START HERE - Onboarding and foundational setup
    {
      title: 'START HERE',
      defaultOpen: true,
      items: [
        { label: 'Business Profile', href: '/business-profile', icon: Building2 },
        { label: 'Business Assessment', href: '/assessment', icon: ClipboardCheck },
      ],
    },

    // STRATEGY - All strategic planning and vision tools
    {
      title: 'STRATEGY',
      defaultOpen: true,
      items: [
        { label: 'Vision, Mission & Values', href: '/vision-mission', icon: Target },
        { label: 'Business Roadmap', href: '/business-roadmap', icon: Compass },
        { label: 'SWOT Analysis', href: '/swot-launch', icon: FileText },
        { label: 'Goals & Targets', href: '/goals', icon: Award },
        { label: '90-Day Planning', href: '/90-day-planning', icon: Mountain },
        { label: 'One-Page Plan', href: '/one-page-plan', icon: FileText },
        { label: 'Success Disciplines', href: '/success-disciplines', icon: Brain },
      ],
    },

    // FINANCES - Financial tracking and forecasting
    {
      title: 'FINANCES',
      defaultOpen: true,
      items: [
        { label: 'Business Dashboard', href: '/finances/dashboard', icon: BarChart3 },
        { label: 'Financial Forecast', href: '/finances/forecast', icon: TrendingUp },
        { label: 'Budget vs Actual', href: '/finances/budget', icon: FileText },
        { label: '13-Week Cashflow', href: '/finances/cashflow', icon: Banknote, disabled: true },
      ],
    },

    // EXECUTE & GROW - Daily execution, Open Loops, Issues, KPIs
    {
      title: 'EXECUTE & GROW',
      defaultOpen: true,
      items: [
        { label: 'Daily Disciplines', href: '/daily-disciplines', icon: CheckSquare },
        { label: 'Business Dashboard', href: '/business-dashboard', icon: BarChart3 },
        { label: 'Open Loops', href: '/open-loops', icon: Layers },
        { label: 'Issues List', href: '/issues-list', icon: AlertCircle },
        { label: 'To-Do List', href: '/todo-list', icon: ListTodo },
        { label: 'Stop Doing List', href: '/stop-doing', icon: XCircle },
        { label: 'Accountability Chart', href: '/accountability-chart', icon: Network },
      ],
    },

    // REVIEWS - Weekly, monthly, quarterly reflection
    {
      title: 'REVIEWS',
      defaultOpen: false,
      items: [
        { label: 'Weekly Review', href: '/reviews/weekly', icon: Calendar },
        { label: 'Monthly Review', href: '/reviews/monthly', icon: CalendarDays },
        { label: 'Quarterly Review', href: '/reviews/quarterly', icon: CalendarCheck },
      ],
    },

    // GROW - KPIs, scorecards, team performance
    {
      title: 'INSIGHTS',
      defaultOpen: false,
      items: [
        { label: 'Scorecards & KPIs', href: '/scorecards', icon: Activity },
        { label: 'Team Performance', href: '/team-performance', icon: Users },
        { label: 'Training Library', href: '/training', icon: BookOpen, disabled: true },
      ],
    },

    // MARKETING - Marketing strategy and content
    {
      title: 'MARKETING',
      defaultOpen: false,
      items: [
        { label: 'Value Proposition & USP', href: '/marketing/value-prop', icon: Target },
        { label: 'Marketing Channels', href: '/marketing/channels', icon: LineChart },
        { label: 'Content Planner', href: '/marketing/content', icon: FileText },
      ],
    },

    // TEAM - Organizational structure and team management
    {
      title: 'TEAM',
      defaultOpen: false,
      items: [
        { label: 'Accountability Chart', href: '/team/accountability', icon: Network },
        { label: 'Org Chart Builder', href: '/team/org-chart', icon: Users },
        { label: 'Hiring Roadmap', href: '/team/hiring-roadmap', icon: Building2 },
      ],
    },
  ]

  // Add role-specific sections (Coach vs Client)
  if (userRole === 'coach') {
    navigation.push({
      title: 'COACH TOOLS',
      defaultOpen: false,
      items: [
        { label: 'Coach Notes', href: '/coach/notes', icon: MessageSquare, badge: 'Private' },
        { label: 'Client Overview', href: '/coach/clients', icon: Eye },
        { label: 'Engagement Tracking', href: '/coach/engagement', icon: LineChart },
        { label: 'Client Questions', href: '/coach/questions', icon: FileQuestion, badge: '3 New' },
      ],
    })
  } else {
    navigation.push({
      title: 'SUPPORT',
      defaultOpen: false,
      items: [
        { label: 'Questions for Coach', href: '/support/questions', icon: MessageCircle },
        { label: 'Session Notes', href: '/support/notes', icon: FileText },
        { label: 'Resources', href: '/support/resources', icon: FolderOpen },
        { label: 'Next Session', href: '/support/schedule', icon: CalendarClock },
      ],
    })
  }

  return navigation
}

// Bottom navigation items (Settings & Help)
const bottomNavigation: NavItem[] = [
  { label: 'Account Settings', href: '/account', icon: Settings },
  { label: 'Integrations', href: '/integrations', icon: Zap },
  { label: 'Help & Support', href: '/help', icon: HelpCircle },
]

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SidebarLayoutProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  // State Management
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'DASHBOARD',
    'START HERE',
    'STRATEGY',
    'FINANCES',
    'EXECUTE & GROW',
  ])
  const [navigation, setNavigation] = useState<NavSection[]>([])
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: 'My Business',
    assessmentScore: '--',
    stage: 'BUILDING',
    revenueTarget: 0,
    profitTarget: 0,
  })

  // Load business data on component mount
  useEffect(() => {
    loadBusinessData()
  }, [])

  // Load business data from localStorage (placeholder until Supabase is ready)
  async function loadBusinessData() {
    try {
      // Try to load from localStorage first (for now)
      const storedBusinessName = localStorage.getItem('businessName')
      const storedAssessmentScore = localStorage.getItem('assessmentScore')
      const storedStage = localStorage.getItem('businessStage')
      const storedRevenueTarget = localStorage.getItem('revenueTarget')
      const storedProfitTarget = localStorage.getItem('profitTarget')

      if (storedBusinessName || storedAssessmentScore) {
        setBusinessData({
          name: storedBusinessName || 'My Business',
          assessmentScore: storedAssessmentScore || '--',
          stage: storedStage || 'BUILDING',
          revenueTarget: storedRevenueTarget ? parseFloat(storedRevenueTarget) : 0,
          profitTarget: storedProfitTarget ? parseFloat(storedProfitTarget) : 0,
        })
      }

      // Set navigation (currently defaulting to client role)
      setNavigation(getNavigation('client'))
    } catch (error) {
      console.error('Error loading business data:', error)
      setNavigation(getNavigation('client'))
    }
  }

  // Toggle section expanded/collapsed
  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    )
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  // Handle sign out
  async function handleSignOut() {
    localStorage.clear()
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ═════════════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR - Hidden on mobile, shown on lg+ screens
          ═════════════════════════════════════════════════════════════════════ */}
      <div
        className={`
        ${sidebarOpen ? 'w-64' : 'w-20'}
        bg-white border-r border-gray-200 flex flex-col h-screen
        transition-all duration-200 ease-in-out
        hidden lg:flex fixed left-0 top-0 z-40
      `}
      >
        {/* SIDEBAR HEADER - Logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
          {sidebarOpen ? (
            <div>
              <h1 className="text-sm font-bold text-gray-900 truncate">Business Coaching</h1>
              {businessData.name && businessData.name !== 'My Business' && (
                <p className="text-xs text-gray-500 truncate">{businessData.name}</p>
              )}
            </div>
          ) : (
            <div className="text-xs font-bold text-gray-900">BC</div>
          )}

          {/* Sidebar collapse/expand button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* NAVIGATION SECTIONS */}
        <nav className="flex-1 overflow-y-auto">
          {navigation.map((section) => (
            <div key={section.title} className="border-b border-gray-100">
              {sidebarOpen ? (
                <>
                  {/* Expanded view - show section title and toggle */}
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </span>
                    {expandedSections.includes(section.title) ? (
                      <ChevronUp className="h-3 w-3 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    )}
                  </button>

                  {/* Navigation items for this section */}
                  {expandedSections.includes(section.title) && (
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                          <Link
                            key={item.href}
                            href={item.disabled ? '#' : item.href}
                            className={`
                              flex items-center px-4 py-2 text-sm
                              ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }
                              ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={(e) => item.disabled && e.preventDefault()}
                          >
                            <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  item.badge === 'Private'
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Collapsed view - show only icons */}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href

                      return (
                        <Link
                          key={item.href}
                          href={item.disabled ? '#' : item.href}
                          className={`
                            flex items-center justify-center py-2 px-1
                            ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }
                            ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          title={item.label}
                          onClick={(e) => item.disabled && e.preventDefault()}
                        >
                          <Icon className="h-5 w-5" />
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>

        {/* SIDEBAR FOOTER - Account info and sign out */}
        <div className="border-t border-gray-200 p-4">
          {sidebarOpen ? (
            <div className="space-y-2">
              {bottomNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 py-1"
                  >
                    <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={handleSignOut}
                className="flex items-center text-sm text-gray-600 hover:text-red-600 py-1 w-full transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>Sign Out</span>
              </button>
              <div className="pt-2 mt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">User Account</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          MOBILE SIDEBAR - Overlay sidebar for mobile devices
          ═════════════════════════════════════════════════════════════════════ */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Mobile sidebar panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-lg">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Mobile sidebar header */}
            <div className="h-16 border-b border-gray-200 flex items-center px-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Business Portal</h1>
                {businessData.name && businessData.name !== 'My Business' && (
                  <p className="text-xs text-gray-500 truncate">{businessData.name}</p>
                )}
              </div>
            </div>

            {/* Mobile navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              {navigation.map((section) => (
                <div key={section.title} className="mb-2">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50"
                  >
                    <span>{section.title}</span>
                    {expandedSections.includes(section.title) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  {expandedSections.includes(section.title) && (
                    <div className="mt-1">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                          <Link
                            key={item.href}
                            href={item.disabled ? '#' : item.href}
                            className={`
                              flex items-center px-4 py-2 text-sm
                              ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }
                              ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={(e) => {
                              if (!item.disabled) {
                                setMobileSidebarOpen(false)
                              } else {
                                e.preventDefault()
                              }
                            }}
                          >
                            <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  item.badge === 'Private'
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile footer */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleSignOut}
                className="flex items-center text-sm text-gray-600 hover:text-red-600 w-full transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* MOBILE HEADER - Menu button and title for mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4 gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            title="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Business Portal</h1>
        </div>

        {/* METRICS BAR - Shows key business metrics */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-6 py-4 hidden md:block">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">Assessment</p>
              <p className="text-2xl font-bold">{businessData.assessmentScore}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">Stage</p>
              <p className="text-2xl font-bold">{businessData.stage}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">Rev Target</p>
              <p className="text-2xl font-bold">{formatCurrency(businessData.revenueTarget)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">Net Profit Target</p>
              <p className="text-2xl font-bold">{formatCurrency(businessData.profitTarget)}</p>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT - Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}