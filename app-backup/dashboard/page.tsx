'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sidebar navigation structure
  const navigation = {
    DASHBOARD: [
      { name: 'Command Centre', href: '/dashboard', icon: '🏠', active: true }
    ],
    STRATEGIES: [
      { name: 'Business Assessment', href: '/assessment', icon: '📋', active: false },
      { name: 'Strategic Wheel', href: '/strategic-wheel', icon: '☸️', active: false },
      { name: 'SWOT Analysis', href: '/swot', icon: '📊', active: false },
      { name: 'One-Page Plan', href: '/one-page-plan', icon: '📄', active: false },
      { name: 'Success Disciplines', href: '/success-disciplines', icon: '🎯', active: false },
      { name: 'Goals & Targets', href: '/goals', icon: '🎯', active: false }
    ],
    FINANCES: [
      { name: 'Business Dashboard', href: '/financials', icon: '📊', active: false },
      { name: 'Financial Forecast', href: '/forecast', icon: '📈', active: false },
      { name: 'Budget vs Actual', href: '/budget', icon: '💰', active: false },
      { name: '13-Week Cashflow', href: '/cashflow', icon: '💵', active: false }
    ],
    EXECUTE: [
      { name: '90 Day Planning', href: '/90-day', icon: '📅', active: false },
      { name: 'Accountability Chart', href: '/accountability', icon: '👥', active: false },
      { name: 'To-Do List', href: '/todo', icon: '✅', active: false },
      { name: 'Stop Doing List', href: '/stop-doing', icon: '🚫', active: false }
    ],
    GROW: [
      { name: 'Revenue Roadmap', href: '/revenue-roadmap', icon: '🗺️', active: false }
    ],
    INSIGHTS: [
      { name: 'Weekly Review', href: '/weekly-review', icon: '📝', active: false },
      { name: 'Monthly Review', href: '/monthly-review', icon: '📊', active: false },
      { name: 'Quarterly Review', href: '/quarterly-review', icon: '📈', active: false }
    ],
    BUSINESS: [
      { name: 'Business Profile', href: '/profile', icon: '🏢', active: false },
      { name: 'Xero Integration', href: '/integrations', icon: '🔗', active: false }
    ]
  };

  // Business data
  const businessData = {
    name: 'Building & Construction',
    assessmentScore: '--',
    stage: 'SCALING',
    arr: 750000,
    target: 5000000
  };

  // Goals data
  const annualGoals = {
    revenue: { target: 5000000, label: 'Revenue Target' },
    profit: { target: 20, label: 'Profit Margin', unit: '%' },
    team: { target: 25, label: 'Team Size', unit: ' people' }
  };

  const quarterlyGoals = {
    revenue: { target: 1300000, label: 'Q1 Revenue' },
    profit: { target: 18, label: 'Profit Margin', unit: '%' },
    cashDays: { target: 60, label: 'Cash Days', unit: ' days' }
  };

  // Q1 Rocks
  const rocks = [
    { id: 1, title: 'Launch new product line', owner: 'John', status: 'on-track', progress: 40 },
    { id: 2, title: 'Implement CRM system', owner: 'Sarah', status: 'on-track', progress: 65 },
    { id: 3, title: 'Hire 3 senior developers', owner: 'Mike', status: 'behind', progress: 20 },
    { id: 4, title: 'Complete Series A prep', owner: 'CEO', status: 'not-started', progress: 0 }
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const getRockStatus = (status: string) => {
    switch (status) {
      case 'on-track': return { color: 'bg-green-100 text-green-800', progress: 'bg-green-500' };
      case 'behind': return { color: 'bg-yellow-100 text-yellow-800', progress: 'bg-yellow-500' };
      case 'not-started': return { color: 'bg-gray-100 text-gray-800', progress: 'bg-gray-400' };
      default: return { color: 'bg-gray-100 text-gray-800', progress: 'bg-gray-400' };
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 overflow-y-auto`}>
        <div className="p-4 border-b">
          <h2 className={`font-bold text-xl ${sidebarOpen ? 'block' : 'hidden'}`}>Coach Portal</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="p-4">
          {Object.entries(navigation).map(([section, items]) => (
            <div key={section} className="mb-6">
              <h3 className={`text-xs font-semibold text-gray-400 uppercase mb-2 ${sidebarOpen ? 'block' : 'hidden'}`}>
                {section}
              </h3>
              {items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center py-2 px-3 rounded-lg mb-1 transition-colors ${
                    item.active 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm">{item.name}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar with Metrics */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Link href="/coach-dashboard" className="text-blue-200 text-sm hover:text-white">
                  ← Back to Coach Dashboard
                </Link>
                <span className="mx-3 text-blue-300">|</span>
                <span className="text-sm">Coach Mode Active</span>
              </div>
            </div>
            
            {/* Metrics Bar */}
            <div className="grid grid-cols-4 gap-6">
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
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Business Name */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center">
            <span className="text-2xl mr-3">🏗️</span>
            <h1 className="text-2xl font-bold">{businessData.name}</h1>
          </div>

          {/* Goals and Rocks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Annual Goals */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Annual Goals</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">{annualGoals.revenue.label}</p>
                  <p className="text-2xl font-bold">{formatCurrency(annualGoals.revenue.target)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{annualGoals.profit.label}</p>
                  <p className="text-2xl font-bold">{annualGoals.profit.target}{annualGoals.profit.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{annualGoals.team.label}</p>
                  <p className="text-2xl font-bold">{annualGoals.team.target}{annualGoals.team.unit}</p>
                </div>
              </div>
            </div>

            {/* 90-Day Goals */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">90-Day Goals</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">{quarterlyGoals.revenue.label}</p>
                  <p className="text-2xl font-bold">{formatCurrency(quarterlyGoals.revenue.target)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{quarterlyGoals.profit.label}</p>
                  <p className="text-2xl font-bold">{quarterlyGoals.profit.target}{quarterlyGoals.profit.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{quarterlyGoals.cashDays.label}</p>
                  <p className="text-2xl font-bold">{quarterlyGoals.cashDays.target}{quarterlyGoals.cashDays.unit}</p>
                </div>
              </div>
            </div>

            {/* Q1 Rocks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Q1 Rocks</h3>
              <div className="space-y-2">
                {rocks.map((rock) => {
                  const status = getRockStatus(rock.status);
                  return (
                    <div key={rock.id} className="bg-gray-50 p-2 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{rock.title}</span>
                        <span className="text-xs font-bold">{rock.progress}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{rock.owner}</span>
                        <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
                          {rock.status}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div 
                          className={`h-1 rounded-full ${status.progress}`}
                          style={{ width: `${rock.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <span className="text-2xl mr-3">📅</span>
              <div>
                <h4 className="font-semibold">Weekly Review</h4>
                <p className="text-sm text-gray-600">Next: Monday, Dec 30</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <h4 className="font-semibold">Monthly Review</h4>
                <p className="text-sm text-gray-600">Next: Jan 3, 2025</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <span className="text-2xl mr-3">📈</span>
              <div>
                <h4 className="font-semibold">Quarterly Planning</h4>
                <p className="text-sm text-gray-600">Next: Mar 28, 2025</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/financials" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center">
              <span className="text-3xl mb-2 block">📊</span>
              <span className="text-sm font-medium">Business Dashboard</span>
            </Link>
            <Link href="/stop-doing" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center">
              <span className="text-3xl mb-2 block">⛔</span>
              <span className="text-sm font-medium">Stop Doing List</span>
            </Link>
            <Link href="/todo" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center">
              <span className="text-3xl mb-2 block">✅</span>
              <span className="text-sm font-medium">To-Do List</span>
            </Link>
            <Link href="/weekly-review" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center">
              <span className="text-3xl mb-2 block">📝</span>
              <span className="text-sm font-medium">Weekly Review</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}