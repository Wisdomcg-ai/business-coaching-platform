'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, 
  ChevronRight,
  Home,
  FileText,
  Target,
  BarChart3,
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  CheckSquare,
  XCircle,
  Map,
  Building,
  Link2,
  CircleDot,
  Grid3x3,
  ClipboardList,
  CreditCard,
  CalendarDays,
  UserCheck,
  ListTodo,
  Ban,
  MapPin,
  Eye,
  CalendarCheck,
  BarChart,
  Lightbulb,
  Megaphone,
  ShoppingCart,
  Settings,
  Package,
  Route,
  MessageSquare,
  GraduationCap,
  Mail,
  Flame
} from 'lucide-react';

// Define the business data interface
interface BusinessData {
  name: string;
  assessmentScore: string;
  stage: string;
  arr: number;
  target: number;
  focusMetric: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'DASHBOARD', 
    'STRATEGY', 
    'EXECUTE'
  ]);
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: 'My Business',
    assessmentScore: '--',
    stage: 'SCALING',
    arr: 750000,
    target: 5000000,
    focusMetric: '$320K'
  });

  useEffect(() => {
    setMounted(true);
    
    // Load business data from localStorage
    const savedProfile = localStorage.getItem('businessProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setBusinessData(prev => ({
        ...prev,
        name: profile.businessName || prev.name
      }));
    }

    // Load assessment score from localStorage
    const savedAssessment = localStorage.getItem('assessmentResults');
    if (savedAssessment) {
      const assessment = JSON.parse(savedAssessment);
      if (assessment.overallScore) {
        setBusinessData(prev => ({
          ...prev,
          assessmentScore: assessment.overallScore.toString()
        }));
      }
    }
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Finalized navigation structure - LOCKED IN
  const navigation = {
    DASHBOARD: {
      label: 'Dashboard',
      items: [
        { name: 'Command Centre', href: '/dashboard', icon: Home }
      ]
    },
    STRATEGY: {
      label: 'Strategy',
      items: [
        { name: 'Vision, Mission & Values', href: '/vision-mission', icon: Lightbulb },
        { name: 'Business Assessment', href: '/assessment', icon: ClipboardList },
        { name: 'Strategic Wheel', href: '/strategic-wheel', icon: CircleDot },
        { name: 'Business Roadmap', href: '/revenue-roadmap', icon: MapPin },
        { name: 'Success Disciplines', href: '/success-disciplines', icon: Target },
        { name: 'SWOT Analysis', href: '/swot-launch', icon: Grid3x3 },
        { name: 'Goals & Targets', href: '/goals', icon: Target },
        { name: 'One-Page Plan', href: '/one-page-plan', icon: FileText }
      ]
    },
    FINANCE: {
      label: 'Finance',
      items: [
        { name: 'Financial Forecast', href: '/forecast', icon: TrendingUp },
        { name: 'Budget vs Actual', href: '/budget', icon: CreditCard },
        { name: '13-Week Rolling Cashflow', href: '/cashflow', icon: DollarSign }
      ]
    },
    MARKETING: {
      label: 'Marketing',
      items: [
        { name: 'Ideal Customer Profile', href: '/marketing/icp', icon: Users },
        { name: 'Value Proposition & USP', href: '/marketing/value-prop', icon: Lightbulb },
        { name: 'Marketing Channels & Tactics', href: '/marketing/channels', icon: Megaphone },
        { name: 'Content Planner', href: '/marketing/content', icon: FileText }
      ]
    },
    SALES: {
      label: 'Sales',
      items: [
        { name: 'Sales Process Designer', href: '/sales/process', icon: Route },
        { name: 'Pipeline Management', href: '/sales/pipeline', icon: ShoppingCart }
      ]
    },
    OPERATIONS: {
      label: 'Operations',
      items: [
        { name: 'Systems Roadmap', href: '/operations/systems', icon: Map },
        { name: 'Customer Journey Map', href: '/operations/journey', icon: Route }
      ]
    },
    TEAM: {
      label: 'Team',
      items: [
        { name: 'Accountability Chart', href: '/accountability', icon: UserCheck },
        { name: 'Org Chart Builder', href: '/team/org-chart', icon: Users },
        { name: 'Hiring Roadmap', href: '/team/hiring', icon: UserCheck },
        { name: 'Team Scorecard', href: '/team/scorecard', icon: BarChart3 }
      ]
    },
    EXECUTE: {
      label: 'Execute & Grow',
      items: [
        { name: '90-Day Planning', href: '/90-day', icon: CalendarDays },
        { name: 'Business Dashboard', href: '/financials', icon: BarChart3 },
        { name: 'Daily Disciplines', href: '/daily-disciplines', icon: Flame },
        { name: 'To-Do List', href: '/todo', icon: ListTodo },
        { name: 'Stop Doing List', href: '/stop-doing', icon: Ban }
      ]
    },
    REVIEWS: {
      label: 'Reviews',
      items: [
        { name: 'Weekly Review', href: '/weekly-review', icon: Eye },
        { name: 'Monthly Review', href: '/monthly-review', icon: CalendarCheck },
        { name: 'Quarterly Review', href: '/quarterly-review', icon: BarChart }
      ]
    },
    COACHING: {
      label: 'Coaching & Community',
      items: [
        { name: 'My Coach', href: '/coaching/sessions', icon: GraduationCap },
        { name: 'Community', href: '/community/forums', icon: MessageSquare },
        { name: 'Messages', href: '/community/messages', icon: Mail }
      ]
    },
    SETTINGS: {
      label: 'Settings',
      items: [
        { name: 'Business Profile', href: '/business-profile', icon: Building },
        { name: 'Account Settings', href: '/settings/account', icon: Settings },
        { name: 'Integrations', href: '/integrations', icon: Link2 }
      ]
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col h-screen fixed left-0 top-0">
        {/* Sidebar Header */}
        <div className="p-6 border-b">
          <h2 className="font-bold text-2xl text-gray-900">Business Coaching Platform</h2>
          <p className="text-xs text-gray-500 mt-1">Your Growth Operating System</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          {Object.entries(navigation).map(([section, { label, items }]) => (
            <div key={section} className="border-b border-gray-100">
              <button
                onClick={() => toggleSection(section)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {label}
                </span>
                {expandedSections.includes(section) ? (
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                )}
              </button>
              
              {expandedSections.includes(section) && (
                <div className="pb-2">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-4 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            © 2024 Business Coaching Platform
          </p>
        </div>
      </div>

      {/* Main Content Area - with left margin to account for fixed sidebar */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Blue Metrics Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">Assessment</p>
              <p className="text-2xl font-bold">{businessData.assessmentScore}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">Stage</p>
              <p className="text-2xl font-bold">{businessData.stage}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">ARR</p>
              <p className="text-2xl font-bold">{formatCurrency(businessData.arr)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">Target</p>
              <p className="text-2xl font-bold">{formatCurrency(businessData.target)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">Focus Metric</p>
              <p className="text-2xl font-bold">{businessData.focusMetric}</p>
            </div>
          </div>
        </div>

        {/* Main Content - Pages render here */}
        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}