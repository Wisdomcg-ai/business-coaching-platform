'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown, ChevronRight, Home, FileText, Target, BarChart3, DollarSign,
  TrendingUp, Calendar, Users, CheckSquare, XCircle, Map, Building, Link2,
  CircleDot, Grid3x3, ClipboardList, CreditCard, CalendarDays, UserCheck,
  ListTodo, Ban, MapPin, Eye, CalendarCheck, BarChart, Lightbulb, Megaphone,
  ShoppingCart, Settings, Route, MessageSquare, GraduationCap, Mail, Flame
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['DASHBOARD', 'STRATEGY', 'EXECUTE']);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 w-64 bg-white shadow-lg flex flex-col h-screen z-40">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-bold text-xl text-gray-900">Business Coaching Platform</h2>
          <p className="text-xs text-gray-500 mt-1">Your Growth Operating System</p>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {Object.entries(navigation).map(([section, { label, items }]) => (
            <div key={section} className="border-b border-gray-100">
              <button
                onClick={() => toggleSection(section)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
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
                        className={`flex items-center px-4 py-2 text-sm ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
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
          <p className="text-xs text-gray-500 text-center">© 2024 Business Coaching Platform</p>
        </div>
      </aside>

      {/* Main Content Area - MUST start at 256px from left */}
      <main className="ml-64">
        {children}
      </main>
    </div>
  );
}