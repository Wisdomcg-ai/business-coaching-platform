'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  FileText,
  Target,
  ClipboardCheck,
  Brain,
  TrendingUp,
  DollarSign,
  BarChart3,
  FileBarChart,
  Banknote,
  Mountain,
  ListTodo,
  XCircle,
  Activity,
  Users,
  Building2,
  Settings,
  Calendar,
  CalendarDays,
  CalendarCheck,
  Eye,
  BookOpen,
  MessageSquare,
  UserCheck,
  LineChart,
  HelpCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronUp,
  Award,
  ClipboardList,
  CheckSquare,
  Network,
  MessageCircle,
  FileQuestion,
  FolderOpen,
  CalendarClock
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: any
  badge?: string
  disabled?: boolean
}

interface NavSection {
  title: string
  icon?: any
  items: NavItem[]
  defaultOpen?: boolean
  roleRequired?: 'coach' | 'client' | 'all'
}

// Determine user role based on email or profile data
function getUserRole(email: string | null): 'coach' | 'client' {
  // For now, use email domain to determine role
  // In production, this would come from the database
  if (email && email.includes('@wisdomcoaching.com.au')) {
    return 'coach'
  }
  return 'client'
}

const getNavigation = (userRole: 'coach' | 'client'): NavSection[] => {
  const navigation: NavSection[] = [
    {
      title: 'DASHBOARD',
      defaultOpen: true,
      roleRequired: 'all',
      items: [
        { label: 'Command Centre', href: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'STRATEGISE',
      defaultOpen: true,
      roleRequired: 'all',
      items: [
        { label: 'Business Assessment', href: '/assessment', icon: ClipboardCheck },
        { label: 'Strategic Wheel', href: '/strategic-wheel', icon: Target },
        { label: 'SWOT Analysis', href: '/swot', icon: FileText },
        { label: 'One-Page Plan', href: '/one-page-plan', icon: FileText },
        { label: 'Success Disciplines', href: '/success-disciplines', icon: Brain },
        { label: 'Goals & Targets', href: '/goals', icon: Award }
      ]
    },
    {
      title: 'FINANCES',
      defaultOpen: true,
      roleRequired: 'all',
      items: [
        { label: 'Business Dashboard', href: '/finances/dashboard', icon: BarChart3 },
        { label: 'Financial Forecast', href: '/finances/forecast', icon: TrendingUp },
        { label: 'Budget vs Actual', href: '/finances/budget', icon: FileBarChart },
        { label: '13-Week Cashflow', href: '/finances/cashflow', icon: Banknote }
      ]
    },
    {
      title: 'EXECUTE',
      defaultOpen: true,
      roleRequired: 'all',
      items: [
        { label: '90-Day Planning', href: '/90-day-planning', icon: Mountain },
        { label: 'Accountability Chart', href: '/accountability-chart', icon: Network },
        { label: 'To-Do List', href: '/todo-list', icon: CheckSquare },
        { label: 'Stop Doing List', href: '/stop-doing', icon: XCircle }
      ]
    },
    {
      title: 'GROW',
      defaultOpen: false,
      roleRequired: 'all',
      items: [
        { label: 'Scorecards/KPIs', href: '/scorecards', icon: Activity },
        { label: 'Team Performance', href: '/team-performance', icon: UserCheck },
        { label: 'Training Library', href: '/training', icon: BookOpen, disabled: true }
      ]
    },
    {
      title: 'INSIGHTS',
      defaultOpen: false,
      roleRequired: 'all',
      items: [
        { label: 'Weekly Review', href: '/reviews/weekly', icon: Calendar },
        { label: 'Monthly Review', href: '/reviews/monthly', icon: CalendarDays },
        { label: 'Quarterly Review', href: '/reviews/quarterly', icon: CalendarCheck }
      ]
    },
    {
      title: 'BUSINESS',
      defaultOpen: false,
      roleRequired: 'all',
      items: [
        { label: 'Business Profile', href: '/business-profile', icon: Building2 },
        { label: 'Team Members', href: '/team', icon: Users },
        { label: 'Company Settings', href: '/settings', icon: Settings }
      ]
    }
  ]

  // Add role-specific sections
  if (userRole === 'coach') {
    navigation.push({
      title: 'COACH TOOLS',
      defaultOpen: false,
      roleRequired: 'coach',
      items: [
        { label: 'Coach Notes', href: '/coach/notes', icon: MessageSquare, badge: 'Private' },
        { label: 'Client Overview', href: '/coach/clients', icon: Eye },
        { label: 'Engagement Tracking', href: '/coach/engagement', icon: LineChart },
        { label: 'Client Questions', href: '/coach/questions', icon: FileQuestion, badge: '3 New' }
      ]
    })
  } else {
    navigation.push({
      title: 'SUPPORT',
      defaultOpen: false,
      roleRequired: 'client',
      items: [
        { label: 'Questions for Coach', href: '/support/questions', icon: MessageCircle },
        { label: 'Session Notes', href: '/support/notes', icon: FileText },
        { label: 'Resources', href: '/support/resources', icon: FolderOpen },
        { label: 'Next Session', href: '/support/schedule', icon: CalendarClock }
      ]
    })
  }

  return navigation
}

const bottomNavigation: NavItem[] = [
  { label: 'Account Settings', href: '/account', icon: Settings },
  { label: 'Integrations', href: '/integrations', icon: Zap },
  { label: 'Help & Support', href: '/help', icon: HelpCircle }
]

interface SidebarLayoutProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['DASHBOARD', 'STRATEGISE', 'FINANCES', 'EXECUTE'])
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'coach' | 'client'>('client')
  const [businessName, setBusinessName] = useState<string>('')
  const [navigation, setNavigation] = useState<NavSection[]>([])

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Auth error:', error)
        return
      }
      
      if (user) {
        setUser(user)
        
        // Determine user role
        const role = getUserRole(user.email)
        setUserRole(role)
        
        // Set navigation based on role
        setNavigation(getNavigation(role))
        
        // Load business name - with error handling
        try {
          const { data: business } = await supabase
            .from('businesses')
            .select('business_name')
            .eq('owner_id', user.id)
            .single()
          
          if (business) {
            setBusinessName(business.business_name)
          }
        } catch (businessError) {
          console.log('No business found for user')
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex lg:flex-col ${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300`}>
        {/* Logo/Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen ? (
            <>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {userRole === 'coach' ? 'Coach Portal' : 'Business Portal'}
                </h1>
                {businessName && (
                  <p className="text-xs text-gray-500 truncate">{businessName}</p>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 hover:bg-gray-100 rounded mx-auto"
            >
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Role Indicator */}
        {sidebarOpen && userRole === 'coach' && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
            <p className="text-xs font-medium text-blue-700">Coach View Active</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigation.map((section) => (
            <div key={section.title} className="mb-2">
              {sidebarOpen ? (
                <>
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
                              ${isActive 
                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                                : 'text-gray-700 hover:bg-gray-50'
                              }
                              ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={(e) => item.disabled && e.preventDefault()}
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                item.badge === 'Private' 
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
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
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.disabled ? '#' : item.href}
                        className={`
                          flex items-center justify-center py-2
                          ${isActive 
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
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
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
                    <Icon className="h-4 w-4 mr-3" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={handleSignOut}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 py-1 w-full"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span>Sign Out</span>
              </button>
              {user && (
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {userRole === 'coach' ? 'Coach Account' : 'Client Account'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            {/* Mobile nav content */}
            <div className="h-16 border-b border-gray-200 flex items-center px-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {userRole === 'coach' ? 'Coach Portal' : 'Business Portal'}
                </h1>
                {businessName && (
                  <p className="text-xs text-gray-500 truncate">{businessName}</p>
                )}
              </div>
            </div>

            {/* Role Indicator */}
            {userRole === 'coach' && (
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <p className="text-xs font-medium text-blue-700">Coach View Active</p>
              </div>
            )}
            
            <nav className="flex-1 overflow-y-auto py-4">
              {navigation.map((section) => (
                <div key={section.title} className="mb-2">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider"
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
                              ${isActive 
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
                            <Icon className="h-4 w-4 mr-3" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                item.badge === 'Private' 
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
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
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-lg font-semibold">
            {userRole === 'coach' ? 'Coach Portal' : 'Business Portal'}
          </h1>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}