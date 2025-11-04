'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CalendarDays,
  BarChart3,
  FileText,
  XCircle,
  CheckSquare,
  Eye,
  FileBarChart
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [businessName, setBusinessName] = useState('Building & Construction');

  useEffect(() => {
    setMounted(true);
    
    // Load business profile
    const savedProfile = localStorage.getItem('businessProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setBusinessName(profile.businessName || 'Building & Construction');
    }
  }, []);

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
    {
      id: 1,
      title: 'Launch new product line',
      owner: 'John',
      progress: 40,
      date: '31/3/2024',
      status: 'on-track'
    },
    {
      id: 2,
      title: 'Implement CRM system',
      owner: 'Sarah',
      progress: 65,
      date: '31/3/2024',
      status: 'on-track'
    },
    {
      id: 3,
      title: 'Hire 3 senior developers',
      owner: 'Mike',
      progress: 20,
      date: '31/3/2024',
      status: 'behind'
    },
    {
      id: 4,
      title: 'Complete Series A prep',
      owner: 'CEO',
      progress: 0,
      date: '31/3/2024',
      status: 'not-started'
    }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Business Name Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-7 h-7 text-gray-400" />
        <h1 className="text-3xl font-bold text-gray-900">{businessName}</h1>
        <p className="text-gray-500 ml-2">Wednesday 5 November 2025</p>
      </div>

      {/* Three Column Grid - Goals & Rocks */}
      <div className="grid grid-cols-3 gap-6">
        {/* Annual Goals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Annual Goals</h2>
          <div className="space-y-8">
            {annualGoals.map((goal, idx) => (
              <div key={idx}>
                <p className="text-sm font-medium text-gray-600 mb-2">{goal.label}</p>
                <p className="text-3xl font-bold text-gray-900">{goal.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 90-Day Goals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-8">90-Day Goals</h2>
          <div className="space-y-8">
            {quarterlyGoals.map((goal, idx) => (
              <div key={idx}>
                <p className="text-sm font-medium text-gray-600 mb-2">{goal.label}</p>
                <p className="text-3xl font-bold text-gray-900">{goal.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Q1 Rocks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Q1 Rocks</h2>
          <div className="space-y-5">
            {rocks.map((rock) => (
              <div key={rock.id} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1.5 leading-snug">
                      {rock.title}
                    </p>
                    <p className="text-xs text-gray-500">Owner: {rock.owner}</p>
                    <p className="text-xs text-gray-500">Due: {rock.date}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 ml-4">
                    {rock.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      rock.status === 'on-track' ? 'bg-green-500' :
                      rock.status === 'behind' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${rock.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Schedule */}
      <div className="grid grid-cols-3 gap-6">
        <div
          onClick={() => router.push('/weekly-review')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">Weekly Review</h3>
              <p className="text-sm text-gray-500">Next: Monday, Dec 30</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => router.push('/monthly-review')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
              <CalendarDays className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">Monthly Review</h3>
              <p className="text-sm text-gray-500">Next: Jan 3, 2025</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => router.push('/quarterly-review')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
              <FileBarChart className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">Quarterly Planning</h3>
              <p className="text-sm text-gray-500">Next: Mar 28, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-6">
        <div
          onClick={() => router.push('/financials')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors mb-4">
              <BarChart3 className="w-10 h-10 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Business Dashboard</h3>
          </div>
        </div>

        <div
          onClick={() => router.push('/stop-doing')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-gray-50 rounded-xl group-hover:bg-red-50 transition-colors mb-4">
              <XCircle className="w-10 h-10 text-gray-600 group-hover:text-red-600 transition-colors" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Stop Doing List</h3>
          </div>
        </div>

        <div
          onClick={() => router.push('/todo')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-gray-50 rounded-xl group-hover:bg-green-50 transition-colors mb-4">
              <CheckSquare className="w-10 h-10 text-gray-600 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">To-Do List</h3>
          </div>
        </div>

        <div
          onClick={() => router.push('/weekly-review')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-gray-50 rounded-xl group-hover:bg-purple-50 transition-colors mb-4">
              <Eye className="w-10 h-10 text-gray-600 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Weekly Review</h3>
          </div>
        </div>
      </div>
    </div>
  );
}