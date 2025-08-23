'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface SwotItem {
  id: string;
  category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats';
  content: string;
  position: number;
}

interface SwotAnalysis {
  id: string;
  title: string;
  quarter: string;
  year: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Tooltip component
function InfoTooltip({ text }: { text: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs text-gray-500 bg-gray-200 rounded-full hover:bg-gray-300 hover:text-gray-700"
      >
        ?
      </button>
      {showTooltip && (
        <div className="absolute z-10 w-64 p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg -top-2 left-8">
          <div className="relative">
            {text}
            <div className="absolute w-2 h-2 bg-white border-l border-b border-gray-200 transform rotate-45 -left-1 top-3"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SwotEditPage() {
  const [swotAnalysis, setSwotAnalysis] = useState<SwotAnalysis | null>(null);
  const [swotItems, setSwotItems] = useState<SwotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'strengths' | 'weaknesses' | 'opportunities' | 'threats'>('strengths');
  const [newItemContent, setNewItemContent] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const swotId = params.id as string;
  const supabase = createClient();

  const categories = [
    { 
      key: 'strengths', 
      label: 'Strengths', 
      icon: '💪',
      tooltip: 'Internal positive factors that give your business an advantage. Examples: Strong brand reputation, skilled team, unique technology, efficient processes, strong cash position.'
    },
    { 
      key: 'weaknesses', 
      label: 'Weaknesses', 
      icon: '⚠️',
      tooltip: 'Internal factors that need improvement or put you at a disadvantage. Examples: Limited resources, skills gaps, poor location, outdated technology, weak online presence.'
    },
    { 
      key: 'opportunities', 
      label: 'Opportunities', 
      icon: '🚀',
      tooltip: 'External factors you could leverage for growth. Examples: Emerging markets, new technologies, competitor weaknesses, regulatory changes in your favor, economic trends.'
    },
    { 
      key: 'threats', 
      label: 'Threats', 
      icon: '⚡',
      tooltip: 'External challenges that could negatively impact your business. Examples: New competitors, economic downturns, changing regulations, supply chain issues, shifting customer preferences.'
    }
  ] as const;

  useEffect(() => {
    fetchSwotData();
  }, [swotId]);

  const fetchSwotData = async () => {
    try {
      setError(null);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get the user's business - check both tables
      let foundBusinessId = null;
      
      // First check if user owns a business
      const { data: ownedBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (ownedBusiness) {
        foundBusinessId = ownedBusiness.id;
      } else {
        // Check business_members table
        const { data: memberData } = await supabase
          .from('business_members')
          .select('business_id')
          .eq('user_id', user.id)
          .single();

        if (memberData) {
          foundBusinessId = memberData.business_id;
        }
      }

      if (foundBusinessId) {
        setBusinessId(foundBusinessId);
      }

      // Fetch SWOT analysis
      const { data: swotData, error: swotError } = await supabase
        .from('swot_analyses')
        .select('*')
        .eq('id', swotId)
        .single();

      if (swotError) {
        console.error('Error fetching SWOT:', swotError);
        setError('SWOT analysis not found');
        setTimeout(() => {
          router.push('/swot');
        }, 2000);
        return;
      }

      setSwotAnalysis(swotData);

      // Fetch SWOT items
      const { data: itemsData, error: itemsError } = await supabase
        .from('swot_items')
        .select('*')
        .eq('swot_analysis_id', swotId)
        .order('position', { ascending: true });

      if (!itemsError && itemsData) {
        setSwotItems(itemsData);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while loading the SWOT analysis');
    } finally {
      setLoading(false);
    }
  };

  const saveAndExit = async () => {
    setSaving(true);
    await updateSwotStatus('draft');
    router.push('/swot');
  };

  const completeSwot = async () => {
    setSaving(true);
    await updateSwotStatus('active');
    router.push('/swot');
  };

  const updateSwotStatus = async (status: string) => {
    if (!swotAnalysis) return;

    const { error } = await supabase
      .from('swot_analyses')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', swotId);

    if (error) {
      console.error('Error updating SWOT:', error);
      alert('Failed to update SWOT analysis');
    }
  };

  const addSwotItem = async () => {
    if (!newItemContent.trim()) return;

    const maxPosition = Math.max(...swotItems.filter(i => i.category === activeCategory).map(i => i.position), -1);
    
    const { data, error } = await supabase
      .from('swot_items')
      .insert({
        swot_analysis_id: swotId,
        category: activeCategory,
        content: newItemContent,
        position: maxPosition + 1
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    } else if (data) {
      setSwotItems([...swotItems, data]);
      setNewItemContent('');
      // Auto-update the timestamp
      updateSwotStatus(swotAnalysis?.status || 'draft');
    }
  };

  const updateSwotItem = async (id: string) => {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from('swot_items')
      .update({
        content: editContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    } else {
      setSwotItems(swotItems.map(item => 
        item.id === id ? { ...item, content: editContent } : item
      ));
      setEditingItem(null);
      setEditContent('');
      // Auto-update the timestamp
      updateSwotStatus(swotAnalysis?.status || 'draft');
    }
  };

  const deleteSwotItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase
      .from('swot_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } else {
      setSwotItems(swotItems.filter(item => item.id !== id));
      // Auto-update the timestamp
      updateSwotStatus(swotAnalysis?.status || 'draft');
    }
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600">Redirecting to SWOT list...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!swotAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <p>SWOT analysis not found</p>
        </div>
      </div>
    );
  }

  const isComplete = swotAnalysis.status === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/swot"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to SWOT List
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{swotAnalysis.title}</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span>Created: {formatDate(swotAnalysis.created_at)}</span>
                  <span>•</span>
                  <span>Last Updated: {formatDate(swotAnalysis.updated_at)}</span>
                  {isComplete && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">✓ Completed</span>
                    </>
                  )}
                </div>
              </div>
              
              <button
                onClick={saveAndExit}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>

        {/* SWOT Matrix - Simplified colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const categoryItems = swotItems.filter(item => item.category === category.key);
            
            return (
              <div key={category.key} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-100 p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="ml-2">{category.label}</span>
                    <InfoTooltip text={category.tooltip} />
                    <span className="ml-auto bg-gray-600 text-white px-2 py-1 rounded-full text-sm">
                      {categoryItems.length}
                    </span>
                  </h3>
                </div>
                
                <div className="p-4">
                  {/* Add new item */}
                  {activeCategory === category.key && (
                    <div className="mb-4 flex gap-2">
                      <input
                        type="text"
                        value={newItemContent}
                        onChange={(e) => setNewItemContent(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSwotItem()}
                        placeholder={`Add ${category.label.toLowerCase().slice(0, -1)}...`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={addSwotItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  
                  {activeCategory !== category.key && (
                    <button
                      onClick={() => setActiveCategory(category.key)}
                      className="mb-4 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-600"
                    >
                      + Add {category.label.toLowerCase().slice(0, -1)}
                    </button>
                  )}

                  {/* Items list */}
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        {editingItem === item.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && updateSwotItem(item.id)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => updateSwotItem(item.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(null);
                                setEditContent('');
                              }}
                              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-800">{item.content}</p>
                            <div className="flex gap-3 mt-2">
                              <button
                                onClick={() => {
                                  setEditingItem(item.id);
                                  setEditContent(item.content);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteSwotItem(item.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Balance Check - helps ensure comprehensive analysis */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Balance Check</h3>
          <p className="text-sm text-gray-600 mb-4">
            A balanced SWOT should have items in all four categories. Aim for at least 3-5 items per category.
          </p>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">{swotItems.filter(i => i.category === 'strengths').length}</p>
              <p className="text-sm text-gray-600">Strengths</p>
              {swotItems.filter(i => i.category === 'strengths').length < 3 && (
                <p className="text-xs text-orange-600 mt-1">Add more</p>
              )}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">{swotItems.filter(i => i.category === 'weaknesses').length}</p>
              <p className="text-sm text-gray-600">Weaknesses</p>
              {swotItems.filter(i => i.category === 'weaknesses').length < 3 && (
                <p className="text-xs text-orange-600 mt-1">Add more</p>
              )}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">{swotItems.filter(i => i.category === 'opportunities').length}</p>
              <p className="text-sm text-gray-600">Opportunities</p>
              {swotItems.filter(i => i.category === 'opportunities').length < 3 && (
                <p className="text-xs text-orange-600 mt-1">Add more</p>
              )}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">{swotItems.filter(i => i.category === 'threats').length}</p>
              <p className="text-sm text-gray-600">Threats</p>
              {swotItems.filter(i => i.category === 'threats').length < 3 && (
                <p className="text-xs text-orange-600 mt-1">Add more</p>
              )}
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <div className="mt-8 text-center">
          {!isComplete ? (
            <button
              onClick={completeSwot}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
              disabled={swotItems.length < 4}
            >
              Mark as Complete
            </button>
          ) : (
            <div className="text-green-600 font-medium text-lg">
              ✓ This SWOT Analysis is Complete
            </div>
          )}
          {swotItems.length < 4 && !isComplete && (
            <p className="text-sm text-gray-500 mt-2">
              Add at least one item to each category before completing
            </p>
          )}
        </div>
      </div>
    </div>
  );
}