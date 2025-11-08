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
  LogOut,
  User,
  ChevronDown as DropdownChevron,
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
        { label: 'SWOT Analysis', href: '/swot', icon: FileText },
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
        { label: 'Financial Forecast', href: '/finances/forecast', icon: TrendingUp },
        { label: 'Budget vs Actual', href: '/finances/budget', icon: FileText },
        { label: '13-Week Cashflow', href: '/finances/cashflow', icon: Banknote, disabled: true },
      ],
    },

    // EXECUTE & GROW - Daily execution, KPIs, accountability
    {
      title: 'EXECUTE & GROW',
      defaultOpen: true,
      items: [
        { label: 'Daily Disciplines', href: '/daily-disciplines', icon: CheckSquare },
        { label: 'Business Dashboard', href: '/business-dashboard', icon: BarChart3 },
        { label: 'Accountability Chart', href: '/accountability-chart', icon: Network },
      ],
    },

    // PRODUCTIVITY - Task and workflow management
    {
      title: 'PRODUCTIVITY',
      defaultOpen: true,
      items: [
        { label: 'Open Loops', href: '/open-loops', icon: Layers },
        { label: 'Issues List', href: '/issues-list', icon: AlertCircle },
        { label: 'To-Do List', href: '/todo/client', icon: ListTodo },
        { label: 'Stop Doing List', href: '/stop-doing', icon: XCircle },
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

    // INSIGHTS - KPIs, scorecards, team performance
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

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT COMPONENT - DESKTOP ONLY
// ═══════════════════════════════════════════════════════════════════════════

interface SidebarLayoutProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  // State Management
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'DASHBOARD',
    'START HERE',
    'STRATEGY',
    'FINANCES',
    'EXECUTE & GROW',
    'PRODUCTIVITY',
  ])
  const [navigation, setNavigation] = useState<NavSection[]>([])
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: 'My Business',
    assessmentScore: '--',
    stage: 'BUILDING',
    revenueTarget: 0,
    profitTarget: 0,
  })
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
          DESKTOP SIDEBAR - Always visible, fixed width 64 or 20
          ═════════════════════════════════════════════════════════════════════ */}
      <div
        className={`
        ${sidebarOpen ? 'w-64' : 'w-20'}
        bg-white border-r border-gray-200 flex flex-col h-screen
        transition-all duration-200 ease-in-out
        fixed left-0 top-0 z-40
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

        {/* SIDEBAR FOOTER - Sign Out Only */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleSignOut}
            className="flex items-center text-sm text-gray-600 hover:text-red-600 py-1 w-full transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA - Desktop layout with fixed sidebar
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarOpen ? '16rem' : '5rem' }}>
        {/* TOP BAR - Metrics and User Menu */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* METRICS BAR */}
            <div className="grid grid-cols-4 gap-6 flex-1">
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

            {/* USER MENU */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-500 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <DropdownChevron className="h-4 w-4" />
              </button>

              {/* USER DROPDOWN MENU */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">User Account</p>
                    <p className="text-xs text-gray-500">user@example.com</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      href="/account"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Account Settings
                    </Link>
                    <Link
                      href="/integrations"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Zap className="h-4 w-4 mr-3" />
                      Integrations
                    </Link>
                    <Link
                      href="/help"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <HelpCircle className="h-4 w-4 mr-3" />
                      Help & Support
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        handleSignOut()
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {/* Backdrop to close menu */}
              {userMenuOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
              )}
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