<<<<<<< HEAD
'use client';

=======
// app/layout.tsx
>>>>>>> 0d18a6a9a2c74811fe3ea5ca9a4527e23ecef037
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
<<<<<<< HEAD
import { KPIInitializer } from '@/components/KPIInitializer';
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
  Users,
  Building,
  Link2,
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
  Settings,
  Route,
  MessageSquare,
  GraduationCap,
  Mail,
  Flame
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const inter = Inter({ subsets: ['latin'] });

interface BusinessData {
  name: string;
  assessmentScore: string;
  stage: string;
  revenueTarget: number;
  profitTarget: number;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  disabled?: boolean;
}

function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'DASHBOARD',
    'START_HERE',
    'STRATEGY', 
    'EXECUTE'
  ]);
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: 'My Business',
    assessmentScore: '--',
    stage: 'BUILDING',
    revenueTarget: 0,
    profitTarget: 0
  });

  // Don't show dashboard layout on auth pages
  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    setMounted(true);
    if (!isAuthPage) {
      loadBusinessData();
    }
  }, [isAuthPage]);

  async function loadBusinessData() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: assessments } = await supabase
        .from('assessments')
        .select('percentage, health_status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (assessments && assessments.length > 0) {
        setBusinessData(prev => ({
          ...prev,
          assessmentScore: assessments[0].percentage.toString()
        }));
      }

      const { data: profile } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setBusinessData(prev => ({
          ...prev,
          name: profile.business_name || prev.name,
          stage: profile.stage || prev.stage,
          revenueTarget: profile.revenue_target || prev.revenueTarget,
          profitTarget: profile.profit_target || prev.profitTarget
        }));
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const navigation = {
    DASHBOARD: {
      label: 'Dashboard',
      items: [
        { name: 'Command Centre', href: '/dashboard', icon: Home }
      ]
    },
    START_HERE: {
      label: 'Start Here',
      items: [
        { name: 'Business Profile', href: '/business-profile', icon: Building },
        { name: 'Business Assessment', href: '/assessment', icon: ClipboardList }
      ]
    },
    STRATEGY: {
      label: 'Strategy',
      items: [
        { name: 'Vision, Mission & Values', href: '/vision-mission', icon: Lightbulb },
        { name: 'SWOT Analysis', href: '/swot-launch', icon: Grid3x3 },
        { name: 'Goals & Targets', href: '/goals', icon: Target },
        { name: 'Business Roadmap', href: '/revenue-roadmap', icon: MapPin },
        { name: 'Success Disciplines', href: '/success-disciplines', icon: Target },
        { name: 'One-Page Plan', href: '/one-page-plan', icon: FileText }
      ]
    },
    FINANCE: {
      label: 'Finance',
      items: [
        { name: 'Financial Forecast', href: '/forecast', icon: TrendingUp },
        { name: 'Budget vs Actual', href: '/budget', icon: CreditCard },
        { name: '13-Week Rolling Cashflow', href: '#', icon: DollarSign, disabled: true }
      ]
    },
    MARKETING: {
      label: 'Marketing',
      items: [
        { name: 'Value Proposition & USP', href: '/marketing/value-prop', icon: Lightbulb },
        { name: 'Marketing Channels & Tactics', href: '/marketing/channels', icon: Megaphone },
        { name: 'Content Planner', href: '/marketing/content', icon: FileText }
      ]
    },
    SALES: {
      label: 'Sales',
      items: [
        { name: 'Sales Process Designer', href: '#', icon: Route, disabled: true }
      ]
    },
    OPERATIONS: {
      label: 'Operations',
      items: [
        { name: 'Systems Roadmap', href: '#', icon: Building, disabled: true }
      ]
    },
    TEAM: {
      label: 'Team',
      items: [
        { name: 'Accountability Chart', href: '/accountability', icon: UserCheck },
        { name: 'Org Chart Builder', href: '/team/org-chart', icon: Users },
        { name: 'Hiring Roadmap', href: '/team/hiring-roadmap', icon: UserCheck },
        { name: 'Team Scorecard', href: '#', icon: BarChart3, disabled: true }
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

  // If auth page or not mounted, show children without dashboard wrapper
  if (!mounted || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col h-screen fixed left-0 top-0">
        <div className="p-6 border-b">
          <h2 className="font-bold text-2xl text-gray-900">Business Coaching Platform</h2>
          <p className="text-xs text-gray-500 mt-1">Your Growth Operating System</p>
        </div>
        
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
                    const isActive = pathname === item.href && !item.disabled;
                    
                    if (item.disabled) {
                      return (
                        <div
                          key={item.name}
                          className="relative flex items-center px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                          title="Coming Soon"
                        >
                          <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>{item.name}</span>
                        </div>
                      );
                    }
                    
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

        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            © 2024 Business Coaching Platform
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Blue Metrics Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="grid grid-cols-4 gap-6">
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

        {/* Main Content */}
        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
=======

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Business Coaching Platform',
  description: 'Strategic planning and coaching platform with world-class KPI system',
};
>>>>>>> 0d18a6a9a2c74811fe3ea5ca9a4527e23ecef037

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
<<<<<<< HEAD
        <KPIInitializer />
        <DashboardWrapper>
          {children}
        </DashboardWrapper>
=======
        {children}
>>>>>>> 0d18a6a9a2c74811fe3ea5ca9a4527e23ecef037
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'white',
              color: 'black',
              border: '1px solid #e5e7eb',
            },
            className: 'toast',
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}