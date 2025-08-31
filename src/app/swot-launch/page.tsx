'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  CheckCircle, 
  TrendingUp,
  Edit2,
  Trash2,
  X,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function SwotLaunchPage() {
  const router = useRouter();
  
  // Get current quarter
  const getCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const quarter = Math.floor(month / 3) + 1;
    return { quarter, year };
  };

  const [currentQuarter, setCurrentQuarter] = useState(getCurrentQuarter());
  const [items, setItems] = useState({
    strength: [],
    weakness: [],
    opportunity: [],
    threat: []
  });
  const [inputText, setInputText] = useState({
    strength: '',
    weakness: '',
    opportunity: '',
    threat: ''
  });
  const [showInput, setShowInput] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);

  // Format quarter display
  const formatQuarter = (quarter, year) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;
    return `Q${quarter} ${year} (${monthNames[startMonth]} - ${monthNames[endMonth]})`;
  };

  // Load data for current quarter
  useEffect(() => {
    const storageKey = `swot_${currentQuarter.year}_Q${currentQuarter.quarter}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      setItems(data.items || {
        strength: [],
        weakness: [],
        opportunity: [],
        threat: []
      });
      setIsFinalized(data.finalized || false);
      if (data.updatedAt) {
        setLastSaved(new Date(data.updatedAt));
      }
    } else {
      setItems({
        strength: [],
        weakness: [],
        opportunity: [],
        threat: []
      });
      setIsFinalized(false);
    }
  }, [currentQuarter]);

  // Save data
  const saveData = (newItems) => {
    const storageKey = `swot_${currentQuarter.year}_Q${currentQuarter.quarter}`;
    const data = {
      quarter: currentQuarter.quarter,
      year: currentQuarter.year,
      items: newItems,
      finalized: isFinalized,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    setLastSaved(new Date());
    
    // Update list of quarters with data
    const quartersList = JSON.parse(localStorage.getItem('swot_quarters') || '[]');
    const quarterKey = `${currentQuarter.year}_Q${currentQuarter.quarter}`;
    if (!quartersList.includes(quarterKey)) {
      quartersList.push(quarterKey);
      localStorage.setItem('swot_quarters', JSON.stringify(quartersList));
    }
  };

  // Add item
  const addItem = (category) => {
    if (isFinalized) return;
    const text = inputText[category].trim();
    if (!text) return;
    
    const newItems = { ...items };
    newItems[category] = [...newItems[category], { 
      id: Date.now(), 
      text,
      createdAt: new Date().toISOString()
    }];
    setItems(newItems);
    saveData(newItems);
    setInputText({ ...inputText, [category]: '' });
    setShowInput(null);
  };

  // Update item
  const updateItem = (category, id) => {
    if (isFinalized || !editText.trim()) return;
    
    const newItems = { ...items };
    newItems[category] = newItems[category].map(item =>
      item.id === id ? { ...item, text: editText.trim() } : item
    );
    setItems(newItems);
    saveData(newItems);
    setEditingItem(null);
    setEditText('');
  };

  // Delete item
  const deleteItem = (category, id) => {
    if (isFinalized) return;
    if (!window.confirm('Delete this item?')) return;
    
    const newItems = { ...items };
    newItems[category] = newItems[category].filter(item => item.id !== id);
    setItems(newItems);
    saveData(newItems);
  };

  // Navigate quarters
  const navigateQuarter = (direction) => {
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

    setCurrentQuarter({ quarter: newQuarter, year: newYear });
  };

  // Finalize SWOT
  const finalizeSwot = () => {
    if (!window.confirm('Finalizing will lock this SWOT analysis. Continue?')) return;
    
    setIsFinalized(true);
    const storageKey = `swot_${currentQuarter.year}_Q${currentQuarter.quarter}`;
    const data = {
      quarter: currentQuarter.quarter,
      year: currentQuarter.year,
      items: items,
      finalized: true,
      finalizedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    setLastSaved(new Date());
  };

  // Unlock SWOT for editing
  const unlockSwot = () => {
    if (!window.confirm('Unlock this SWOT analysis for editing?')) return;
    
    setIsFinalized(false);
    const storageKey = `swot_${currentQuarter.year}_Q${currentQuarter.quarter}`;
    const data = {
      quarter: currentQuarter.quarter,
      year: currentQuarter.year,
      items: items,
      finalized: false,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    setLastSaved(new Date());
  };

  const categoryConfig = {
    strength: { 
      title: 'Strengths', 
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      description: 'Internal positive factors'
    },
    weakness: { 
      title: 'Weaknesses', 
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      description: 'Internal improvement areas'
    },
    opportunity: { 
      title: 'Opportunities', 
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      description: 'External growth potential'
    },
    threat: { 
      title: 'Threats', 
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      buttonBg: 'bg-orange-600 hover:bg-orange-700',
      description: 'External risk factors'
    }
  };

  const renderQuadrant = (category) => {
    const config = categoryConfig[category];
    const categoryItems = items[category] || [];
    const isAdding = showInput === category;
    
    return (
      <div className={`bg-white rounded-lg shadow-sm border-2 ${config.borderColor} p-6`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${config.textColor}`}>
              {config.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${config.textColor}`}>
              {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
            </span>
            {!isFinalized && (
              <button
                onClick={() => {
                  setShowInput(isAdding ? null : category);
                  setInputText({ ...inputText, [category]: '' });
                }}
                className={`p-1.5 rounded-md text-white ${config.buttonBg}`}
              >
                {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
        
        {isAdding && (
          <div className="mb-4">
            <input
              type="text"
              value={inputText[category]}
              onChange={(e) => setInputText({ ...inputText, [category]: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addItem(category);
                }
              }}
              placeholder="Type your item and press Enter..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowInput(null)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => addItem(category)}
                disabled={!inputText[category].trim()}
                className={`px-3 py-1 text-sm text-white rounded-md ${
                  inputText[category].trim() ? config.buttonBg : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Add
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-2 min-h-[100px]">
          {categoryItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No {config.title.toLowerCase()} identified</p>
              {!isFinalized && (
                <p className="text-xs mt-1">Click + to add</p>
              )}
            </div>
          ) : (
            categoryItems.map(item => (
              <div key={item.id} className={`p-3 rounded-lg ${config.bgColor} group`}>
                {editingItem === item.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateItem(category, item.id);
                        }
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => updateItem(category, item.id)}
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setEditText('');
                      }}
                      className="p-1 text-gray-600 hover:text-gray-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-700 flex-1">{item.text}</p>
                    {!isFinalized && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingItem(item.id);
                            setEditText(item.text);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteItem(category, item.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">SWOT Analysis</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Strategic analysis for {formatQuarter(currentQuarter.quarter, currentQuarter.year)}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Auto-save indicator */}
                {lastSaved && (
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </div>
                )}

                {/* Quarter Navigation */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => navigateQuarter('prev')}
                    className="p-1.5 text-gray-500 hover:text-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatQuarter(currentQuarter.quarter, currentQuarter.year)}
                  </button>
                  
                  <button
                    onClick={() => navigateQuarter('next')}
                    className="p-1.5 text-gray-500 hover:text-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push('/swot-compare')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Compare
                  </button>

                  {!isFinalized ? (
                    <button
                      onClick={finalizeSwot}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Finalize
                    </button>
                  ) : (
                    <button
                      onClick={unlockSwot}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {isFinalized && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    This SWOT analysis has been finalized. Click "Edit" to make changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SWOT Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderQuadrant('strength')}
          {renderQuadrant('weakness')}
          {renderQuadrant('opportunity')}
          {renderQuadrant('threat')}
        </div>
      </div>
    </div>
  );
}