'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  TrendingUp
} from 'lucide-react';

export default function SwotComparePage() {
  const router = useRouter();
  const [availableQuarters, setAvailableQuarters] = useState([]);
  const [leftQuarter, setLeftQuarter] = useState(null);
  const [rightQuarter, setRightQuarter] = useState(null);
  const [leftData, setLeftData] = useState(null);
  const [rightData, setRightData] = useState(null);

  // Load available quarters
  useEffect(() => {
    const quarters = JSON.parse(localStorage.getItem('swot_quarters') || '[]');
    const formattedQuarters = quarters.map(q => {
      const [year, quarter] = q.split('_Q');
      return {
        key: q,
        year: parseInt(year),
        quarter: parseInt(quarter),
        label: `Q${quarter} ${year}`
      };
    }).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.quarter - a.quarter;
    });
    
    setAvailableQuarters(formattedQuarters);
    
    // Auto-select two most recent
    if (formattedQuarters.length > 0) {
      setLeftQuarter(formattedQuarters[1] || formattedQuarters[0]);
      setRightQuarter(formattedQuarters[0]);
    }
  }, []);

  // Load data when quarters change
  useEffect(() => {
    if (leftQuarter) {
      const data = localStorage.getItem(`swot_${leftQuarter.year}_Q${leftQuarter.quarter}`);
      setLeftData(data ? JSON.parse(data) : null);
    }
  }, [leftQuarter]);

  useEffect(() => {
    if (rightQuarter) {
      const data = localStorage.getItem(`swot_${rightQuarter.year}_Q${rightQuarter.quarter}`);
      setRightData(data ? JSON.parse(data) : null);
    }
  }, [rightQuarter]);

  // Compare items between quarters
  const compareCategory = (category) => {
    const leftItems = leftData?.items?.[category] || [];
    const rightItems = rightData?.items?.[category] || [];
    
    const leftTexts = leftItems.map(item => item.text.toLowerCase());
    const rightTexts = rightItems.map(item => item.text.toLowerCase());
    
    const added = rightItems.filter(item => !leftTexts.includes(item.text.toLowerCase()));
    const removed = leftItems.filter(item => !rightTexts.includes(item.text.toLowerCase()));
    const kept = rightItems.filter(item => leftTexts.includes(item.text.toLowerCase()));
    
    return { added, removed, kept, leftItems, rightItems };
  };

  const categoryConfig = {
    strength: { 
      title: 'Strengths',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    weakness: { 
      title: 'Weaknesses',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    opportunity: { 
      title: 'Opportunities',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    threat: { 
      title: 'Threats',
      borderColor: 'border-orange-200',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  };

  const renderComparison = (category) => {
    const config = categoryConfig[category];
    const { added, removed, kept, leftItems, rightItems } = compareCategory(category);
    
    return (
      <div className={`bg-white rounded-lg shadow-sm border-2 ${config.borderColor} overflow-hidden`}>
        <div className={`px-6 py-3 ${config.bgColor} border-b ${config.borderColor}`}>
          <h3 className={`text-lg font-semibold ${config.textColor}`}>
            {config.title}
          </h3>
        </div>
        
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {/* Left Quarter */}
          <div className="p-4">
            <div className="text-xs font-medium text-gray-500 mb-2">
              {leftQuarter?.label || 'Select Quarter'}
            </div>
            {leftItems.length === 0 ? (
              <p className="text-sm text-gray-400">No items</p>
            ) : (
              <div className="space-y-2">
                {leftItems.map(item => {
                  const isRemoved = removed.some(r => r.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className={`text-sm p-2 rounded ${
                        isRemoved ? 'bg-red-50 text-red-700 line-through' : 'text-gray-700'
                      }`}
                    >
                      {item.text}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Changes */}
          <div className="p-4 bg-gray-50">
            <div className="text-xs font-medium text-gray-500 mb-2">Changes</div>
            {added.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center text-xs font-medium text-green-600 mb-1">
                  <Plus className="h-3 w-3 mr-1" />
                  Added ({added.length})
                </div>
                {added.slice(0, 3).map(item => (
                  <div key={item.id} className="text-xs text-green-700 bg-green-50 p-1 rounded mt-1">
                    {item.text}
                  </div>
                ))}
                {added.length > 3 && (
                  <div className="text-xs text-gray-500 mt-1">
                    +{added.length - 3} more
                  </div>
                )}
              </div>
            )}
            
            {removed.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center text-xs font-medium text-red-600 mb-1">
                  <Minus className="h-3 w-3 mr-1" />
                  Removed ({removed.length})
                </div>
                {removed.slice(0, 3).map(item => (
                  <div key={item.id} className="text-xs text-red-700 bg-red-50 p-1 rounded mt-1">
                    {item.text}
                  </div>
                ))}
                {removed.length > 3 && (
                  <div className="text-xs text-gray-500 mt-1">
                    +{removed.length - 3} more
                  </div>
                )}
              </div>
            )}
            
            {kept.length > 0 && (
              <div className="text-xs text-gray-500">
                {kept.length} unchanged
              </div>
            )}
            
            {added.length === 0 && removed.length === 0 && (
              <p className="text-sm text-gray-400">No changes</p>
            )}
          </div>

          {/* Right Quarter */}
          <div className="p-4">
            <div className="text-xs font-medium text-gray-500 mb-2">
              {rightQuarter?.label || 'Select Quarter'}
            </div>
            {rightItems.length === 0 ? (
              <p className="text-sm text-gray-400">No items</p>
            ) : (
              <div className="space-y-2">
                {rightItems.map(item => {
                  const isNew = added.some(a => a.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className={`text-sm p-2 rounded ${
                        isNew ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {item.text}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Calculate stats
  const calculateStats = () => {
    let totalAdded = 0;
    let totalRemoved = 0;
    let totalKept = 0;
    
    ['strength', 'weakness', 'opportunity', 'threat'].forEach(category => {
      const { added, removed, kept } = compareCategory(category);
      totalAdded += added.length;
      totalRemoved += removed.length;
      totalKept += kept.length;
    });
    
    return { totalAdded, totalRemoved, totalKept };
  };

  const stats = leftData && rightData ? calculateStats() : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/swot-launch')}
                  className="mr-4 p-2 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">SWOT Comparison</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Compare SWOT analyses across quarters
                  </p>
                </div>
              </div>

              {/* Quarter Selectors */}
              <div className="flex items-center space-x-4">
                <select
                  value={leftQuarter?.key || ''}
                  onChange={(e) => {
                    const selected = availableQuarters.find(q => q.key === e.target.value);
                    setLeftQuarter(selected);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select Quarter</option>
                  {availableQuarters.map(q => (
                    <option key={q.key} value={q.key}>
                      {q.label}
                    </option>
                  ))}
                </select>

                <ArrowRight className="h-5 w-5 text-gray-400" />

                <select
                  value={rightQuarter?.key || ''}
                  onChange={(e) => {
                    const selected = availableQuarters.find(q => q.key === e.target.value);
                    setRightQuarter(selected);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select Quarter</option>
                  {availableQuarters.map(q => (
                    <option key={q.key} value={q.key}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center text-green-600 mb-1">
                  <Plus className="h-5 w-5 mr-1" />
                  <span className="text-2xl font-bold">{stats.totalAdded}</span>
                </div>
                <p className="text-sm text-gray-500">Items Added</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-gray-600 mb-1">
                  <ArrowRight className="h-5 w-5 mr-1" />
                  <span className="text-2xl font-bold">{stats.totalKept}</span>
                </div>
                <p className="text-sm text-gray-500">Items Unchanged</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-red-600 mb-1">
                  <Minus className="h-5 w-5 mr-1" />
                  <span className="text-2xl font-bold">{stats.totalRemoved}</span>
                </div>
                <p className="text-sm text-gray-500">Items Removed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
        <div className="space-y-6">
          {renderComparison('strength')}
          {renderComparison('weakness')}
          {renderComparison('opportunity')}
          {renderComparison('threat')}
        </div>
      </div>
    </div>
  );
}