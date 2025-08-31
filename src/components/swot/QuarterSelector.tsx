'use client';

import React, { useState, useRef, useEffect } from 'react';
import { QuarterInfo } from '@/lib/swot/types';
import { Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface QuarterSelectorProps {
  currentQuarter: QuarterInfo;
  onQuarterChange: (quarter: QuarterInfo) => void;
  minYear?: number;
  maxYear?: number;
}

export function QuarterSelector({
  currentQuarter,
  onQuarterChange,
  minYear = 2020,
  maxYear = 2030
}: QuarterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentQuarter.year);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Generate available years
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  );
  
  // Get quarter data
  const getQuarterData = (quarter: 1 | 2 | 3 | 4, year: number): QuarterInfo => {
    const now = new Date();
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, endMonth + 1, 0);
    
    return {
      quarter,
      year,
      label: `Q${quarter} ${year}`,
      startDate,
      endDate,
      isCurrent: now >= startDate && now <= endDate,
      isPast: endDate < now,
      isFuture: startDate > now
    };
  };
  
  // Handle quarter selection
  const handleQuarterSelect = (quarter: 1 | 2 | 3 | 4) => {
    const quarterData = getQuarterData(quarter, selectedYear);
    onQuarterChange(quarterData);
    setIsOpen(false);
  };
  
  // Handle year navigation
  const handleYearChange = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? selectedYear - 1 : selectedYear + 1;
    if (newYear >= minYear && newYear <= maxYear) {
      setSelectedYear(newYear);
    }
  };
  
  // Navigate to adjacent quarter
  const navigateQuarter = (direction: 'prev' | 'next') => {
    let newQuarter = currentQuarter.quarter;
    let newYear = currentQuarter.year;
    
    if (direction === 'prev') {
      if (newQuarter === 1) {
        newQuarter = 4;
        newYear--;
      } else {
        newQuarter--;
      }
    } else {
      if (newQuarter === 4) {
        newQuarter = 1;
        newYear++;
      } else {
        newQuarter++;
      }
    }
    
    if (newYear >= minYear && newYear <= maxYear) {
      const quarterData = getQuarterData(newQuarter as 1 | 2 | 3 | 4, newYear);
      onQuarterChange(quarterData);
    }
  };
  
  // Get quarter status style
  const getQuarterStyle = (quarter: 1 | 2 | 3 | 4) => {
    const quarterData = getQuarterData(quarter, selectedYear);
    
    if (quarterData.isCurrent) {
      return 'bg-blue-100 text-blue-700 border-blue-300';
    }
    if (quarterData.isPast) {
      return 'bg-gray-50 text-gray-600 hover:bg-gray-100';
    }
    return 'bg-white text-gray-500 hover:bg-gray-50';
  };
  
  // Check if quarter is selected
  const isQuarterSelected = (quarter: 1 | 2 | 3 | 4) => {
    return currentQuarter.quarter === quarter && currentQuarter.year === selectedYear;
  };
  
  // Format date range
  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <div className="flex items-center space-x-1">
        {/* Previous Quarter */}
        <button
          onClick={() => navigateQuarter('prev')}
          disabled={currentQuarter.year === minYear && currentQuarter.quarter === 1}
          className="p-1.5 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
          title="Previous Quarter"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {/* Quarter Selector Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium
            ${currentQuarter.isCurrent 
              ? 'border-blue-300 bg-blue-50 text-blue-700' 
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {currentQuarter.label}
          <span className="ml-2 text-xs text-gray-500">
            ({formatDateRange(currentQuarter.startDate, currentQuarter.endDate)})
          </span>
        </button>
        
        {/* Next Quarter */}
        <button
          onClick={() => navigateQuarter('next')}
          disabled={currentQuarter.year === maxYear && currentQuarter.quarter === 4}
          className="p-1.5 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
          title="Next Quarter"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Year Selector */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleYearChange('prev')}
                disabled={selectedYear === minYear}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">
                  {selectedYear}
                </span>
                {selectedYear === new Date().getFullYear() && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Current Year
                  </span>
                )}
              </div>
              
              <button
                onClick={() => handleYearChange('next')}
                disabled={selectedYear === maxYear}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Quarters Grid */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((quarter) => {
                const q = quarter as 1 | 2 | 3 | 4;
                const quarterData = getQuarterData(q, selectedYear);
                const isSelected = isQuarterSelected(q);
                
                return (
                  <button
                    key={quarter}
                    onClick={() => handleQuarterSelect(q)}
                    className={`
                      relative px-4 py-3 rounded-lg border transition-all
                      ${getQuarterStyle(q)}
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                    `}
                  >
                    <div className="text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Q{quarter}</span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="text-xs mt-1 opacity-75">
                        {formatDateRange(quarterData.startDate, quarterData.endDate)}
                      </div>
                      {quarterData.isCurrent && (
                        <div className="text-xs mt-1 font-medium">
                          Current Quarter
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between text-xs">
              <button
                onClick={() => {
                  const now = new Date();
                  const currentQ = Math.floor(now.getMonth() / 3) + 1 as 1 | 2 | 3 | 4;
                  const quarterData = getQuarterData(currentQ, now.getFullYear());
                  onQuarterChange(quarterData);
                  setIsOpen(false);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go to Current Quarter
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}