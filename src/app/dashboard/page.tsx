'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  FileCheck,
  PieChart,
  Building,
  Link2,
  Briefcase,
  CircleDot,
  Grid3x3,
  ClipboardList,
  CreditCard,
  LineChart,
  CalendarDays,
  UserCheck,
  ListTodo,
  Ban,
  MapPin,
  Eye,
  CalendarCheck,
  BarChart
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['DASHBOARD', 'STRATEGIES', 'FINANCES', 'EXECUTE']);

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

  // Navigation structure with lucide icons
  const navigation = {
    DASHBOARD: {
      items: [
        { name: 'Command Centre', href: '/dashboard', icon: Home, active: true }
      ]
    },
    STRATEGIES: {
      items: [
        { name: 'Business Assessment', href: '/assessment', icon: ClipboardList },
        { name: 'Strategic Wheel', href: '/strategic-wheel', icon: CircleDot },
        { name: 'SWOT Analysis', href: '/swot-launch', icon: Grid3x3 },
        { name: 'One-Page Plan', href: '/one-page-plan', icon: FileText },
        { name: 'Success Disciplines', href: '/success-disciplines', icon: Target },
        { name: 'Goals & Targets', href: '/goals', icon: Target }
      ]
    },
    FINANCES: {
      items: [
        { name: 'Business Dashboard', href: '/financials', icon: BarChart3 },
        { name: 'Financial Forecast', href: '/forecast', icon: TrendingUp },
        { name: 'Budget vs Actual', href: '/budget', icon: CreditCard },
        { name: '13-Week Cashflow', href: '/cashflow', icon: DollarSign }
      ]
    },
    EXECUTE: {
      items: [
        { name: '90 Day Planning', href: '/90-day', icon: CalendarDays },
        { name: 'Accountability Chart', href: '/accountability', icon: UserCheck },
        { name: 'To-Do List', href: '/todo', icon: ListTodo },
        { name: 'Stop Doing List', href: '/stop-doing', icon: Ban }
      ]
    },
    GROW: {
      items: [
        { name: 'Revenue Roadmap', href: '/revenue-roadmap', icon: MapPin }
      ]
    },
    INSIGHTS: {
      items: [
        { name: 'Weekly Review', href: '/weekly-review', icon: Eye },
        { name: 'Monthly Review', href: '/monthly-review', icon: CalendarCheck },
        { name: 'Quarterly Review', href: '/quarterly-review', icon: BarChart }
      ]
    },
    BUSINESS: {
      items: [
        { name: 'Business Profile', href: '/business-profile', icon: Building },
        { name: 'Xero Integration', href: '/integrations', icon: Link2 }
      ]
    }
  };

  const businessData = {
    name: 'Building & Construction',
    assessmentScore: '--',
    stage: 'SCALING',
    arr: 750000,
    target: 5000000
  };

  const annualGoals = [
    { label: 'Revenue Target', value: '$5.0M' },
    { label: 'Profit Margin', value: '20%' },
    { label: 'Team Size', value: '25 people' }
  ];

  const quarterlyGoals = [
    { label: 'Q1 Revenue', value: '$1.3M' },
    { label: 'Profit Margin', value: '18%' },
    { label: 'Cash Days', value: '60 days' }
  ];

  const rocks = [
    { id: 1, title: 'Launch new product line', owner: 'John', status: 'on-track', progress: 40, date: '31/3/2024' },
    { id: 2, title: 'Implement CRM system', owner: 'Sarah', status: 'on-track', progress: 65, date: '31/3/2024' },
    { id: 3, title: 'Hire 3 senior developers', owner: 'Mike', status: 'behind', progress: 20, date: '31/3/2024' },
    { id: 4, title: 'Complete Series A prep', owner: 'CEO', status: 'not-started', progress: 0, date: '31/3/2024' }
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col h-screen">
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <h2 className="font-bold text-xl">Coach Portal</h2>
        </div>

        {/* View Toggle */}
        <div className="px-4 py-2 border-b">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Coach View Active
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          {Object.entries(navigation).map(([section, { items }]) => (
            <div key={section} className="border-b border-gray-100">
              <button
                onClick={() => toggleSection(section)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section}
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
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-4 py-2 text-sm transition-colors ${
                          item.active 
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center space-x-4">
            <Link href="/coach/dashboard" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Coach Dashboard
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-600">Coach Mode Active</span>
          </div>
        </div>

        {/* Blue Metrics Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">ASSESSMENT</p>
              <p className="text-2xl font-bold">{businessData.assessmentScore}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">STAGE</p>
              <p className="text-2xl font-bold">{businessData.stage}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">ARR</p>
              <p className="text-2xl font-bold">{formatCurrency(businessData.arr)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">TARGET</p>
              <p className="text-2xl font-bold">{formatCurrency(businessData.target)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-blue-200 mb-1">FOCUS METRIC</p>
              <p className="text-2xl font-bold">$320K</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 bg-gray-50">
          {/* Business Name Card */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center">
            <Building className="h-6 w-6 text-gray-400 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">{businessData.name}</h1>
          </div>

          {/* Goals and Rocks Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Annual Goals */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Annual Goals</h3>
              <div className="space-y-4">
                {annualGoals.map((goal, idx) => (
                  <div key={idx}>
                    <p className="text-sm text-gray-600">{goal.label}</p>
                    <p className="text-2xl font-bold">{goal.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 90-Day Goals */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">90-Day Goals</h3>
              <div className="space-y-4">
                {quarterlyGoals.map((goal, idx) => (
                  <div key={idx}>
                    <p className="text-sm text-gray-600">{goal.label}</p>
                    <p className="text-2xl font-bold">{goal.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Q1 Rocks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Q1 Rocks</h3>
              <div className="space-y-3">
                {rocks.map((rock) => (
                  <div key={rock.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rock.title}</p>
                        <p className="text-xs text-gray-500">Owner: {rock.owner}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-700">{rock.progress}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">Due: {rock.date}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          rock.status === 'on-track' ? 'bg-green-500' :
                          rock.status === 'behind' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${rock.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <h4 className="font-semibold">Weekly Review</h4>
                <p className="text-sm text-gray-600">Next: Monday, Dec 30</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <CalendarCheck className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <h4 className="font-semibold">Monthly Review</h4>
                <p className="text-sm text-gray-600">Next: Jan 3, 2025</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <BarChart className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <h4 className="font-semibold">Quarterly Planning</h4>
                <p className="text-sm text-gray-600">Next: Mar 28, 2025</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-4">
            <Link href="/financials" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center">
              <BarChart3 className="h-8 w-8 text-gray-400 mb-2 mx-auto" />
              <span className="text-sm font-medium text-gray-700">Business Dashboard</span>
            </Link>

            <Link href="/stop-doing" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center">
              <XCircle className="h-8 w-8 text-gray-400 mb-2 mx-auto" />
              <span className="text-sm font-medium text-gray-700">Stop Doing List</span>
            </Link>

            <Link href="/todo" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center">
              <CheckSquare className="h-8 w-8 text-gray-400 mb-2 mx-auto" />
              <span className="text-sm font-medium text-gray-700">To-Do List</span>
            </Link>

            <Link href="/weekly-review" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center">
              <FileCheck className="h-8 w-8 text-gray-400 mb-2 mx-auto" />
              <span className="text-sm font-medium text-gray-700">Weekly Review</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}