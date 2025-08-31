'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  SwotAnalysis, 
  SwotItem, 
  SwotGridData, 
  SwotCategory,
  QuarterInfo, 
  getCurrentQuarter,
  getCategoryColor,
  getCategoryIcon 
} from '@/lib/swot/types';
import { SwotGrid } from '@/components/swot/SwotGrid';
import { QuarterSelector } from '@/components/swot/QuarterSelector';
import { SwotActionPanel } from '@/components/swot/SwotActionPanel';
import { SwotStatisticsCard } from '@/components/swot/SwotStatisticsCard';
import { createClientComponentClient } from '@/lib/supabase';
import { Plus, Save, FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Users, Download, History } from 'lucide-react';

// Test user ID - replace with actual auth in production
const TEST_USER_ID = 'test-user-123';
const TEST_BUSINESS_ID = 'test-business-123';

export default function SwotTestPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // State management
  const [currentQuarter, setCurrentQuarter] = useState<QuarterInfo>(getCurrentQuarter());
  const [swotAnalysis, setSwotAnalysis] = useState<SwotAnalysis | null>(null);
  const [swotItems, setSwotItems] = useState<SwotGridData>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SwotCategory | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Get or create SWOT analysis for the selected quarter
  const loadSwotAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using test IDs instead of auth
      const businessId = TEST_BUSINESS_ID;
      const userId = TEST_USER_ID;
      
      // Check if SWOT exists for this quarter
      const { data: existingSwot, error: fetchError } = await supabase
        .from('swot_analyses')
        .select(`
          *,
          swot_items (
            id,
            category,
            title,
            description,
            impact_level,
            likelihood,
            priority_order,
            status,
            tags,
            created_at,
            updated_at
          )
        `)
        .eq('business_id', businessId)
        .eq('quarter', currentQuarter.quarter)
        .eq('year', currentQuarter.year)
        .eq('type', 'quarterly')
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine
        console.log('No existing SWOT found, will create new one');
      }
      
      if (existingSwot) {
        setSwotAnalysis(existingSwot);
        organizeSwotItems(existingSwot.swot_items || []);
      } else {
        // Create new SWOT analysis directly
        const { data: newSwot, error: createError } = await supabase
          .from('swot_analyses')
          .insert({
            business_id: businessId,
            quarter: currentQuarter.quarter,
            year: currentQuarter.year,
            type: 'quarterly',
            status: 'draft',
            title: `Q${currentQuarter.quarter} ${currentQuarter.year} SWOT Analysis`,
            created_by: userId
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating SWOT:', createError);
          setError('Failed to create SWOT analysis');
          return;
        }
        
        if (newSwot) {
          setSwotAnalysis(newSwot);
          setSwotItems({
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: []
          });
        }
      }
    } catch (err) {
      console.error('Error loading SWOT analysis:', err);
      setError('Failed to load SWOT analysis. Please check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  }, [currentQuarter, supabase]);
  
  // Organize items into grid categories
  const organizeSwotItems = (items: SwotItem[]) => {
    const organized: SwotGridData = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    };
    
    items.forEach(item => {
      if (item.status === 'active' || item.status === 'carried-forward') {
        switch (item.category) {
          case 'strength':
            organized.strengths.push(item);
            break;
          case 'weakness':
            organized.weaknesses.push(item);
            break;
          case 'opportunity':
            organized.opportunities.push(item);
            break;
          case 'threat':
            organized.threats.push(item);
            break;
        }
      }
    });
    
    // Sort by priority order
    Object.keys(organized).forEach(key => {
      organized[key as keyof SwotGridData].sort((a, b) => a.priority_order - b.priority_order);
    });
    
    setSwotItems(organized);
  };
  
  // Load data on component mount and quarter change
  useEffect(() => {
    loadSwotAnalysis();
  }, [loadSwotAnalysis]);
  
  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !swotAnalysis || saving) return;
    
    const saveTimer = setTimeout(async () => {
      await handleSave();
    }, 5000); // Auto-save after 5 seconds of inactivity
    
    return () => clearTimeout(saveTimer);
  }, [swotItems, autoSaveEnabled]);
  
  // Handle adding new item
  const handleAddItem = async (category: SwotCategory, title: string, description?: string) => {
    if (!swotAnalysis) return;
    
    try {
      const { data: newItem, error } = await supabase
        .from('swot_items')
        .insert({
          swot_analysis_id: swotAnalysis.id,
          category,
          title,
          description,
          impact_level: 3,
          likelihood: category === 'opportunity' || category === 'threat' ? 3 : null,
          priority_order: swotItems[`${category}s` as keyof SwotGridData].length,
          status: 'active',
          created_by: TEST_USER_ID
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const updatedItems = { ...swotItems };
      const categoryKey = `${category}s` as keyof SwotGridData;
      updatedItems[categoryKey] = [...updatedItems[categoryKey], newItem];
      setSwotItems(updatedItems);
      
      // Show success message
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item. Please try again.');
    }
  };
  
  // Handle updating item
  const handleUpdateItem = async (itemId: string, updates: Partial<SwotItem>) => {
    try {
      const { error } = await supabase
        .from('swot_items')
        .update(updates)
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Update local state
      const updatedItems = { ...swotItems };
      Object.keys(updatedItems).forEach(key => {
        const categoryKey = key as keyof SwotGridData;
        updatedItems[categoryKey] = updatedItems[categoryKey].map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        );
      });
      setSwotItems(updatedItems);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item. Please try again.');
    }
  };
  
  // Handle deleting item
  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('swot_items')
        .update({ status: 'archived' })
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Update local state
      const updatedItems = { ...swotItems };
      Object.keys(updatedItems).forEach(key => {
        const categoryKey = key as keyof SwotGridData;
        updatedItems[categoryKey] = updatedItems[categoryKey].filter(item => item.id !== itemId);
      });
      setSwotItems(updatedItems);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };
  
  // Handle reordering items
  const handleReorderItems = async (category: SwotCategory, items: SwotItem[]) => {
    try {
      // Update priority order for all items in the category
      const updates = items.map((item, index) => ({
        id: item.id,
        priority_order: index
      }));
      
      // Batch update
      for (const update of updates) {
        await supabase
          .from('swot_items')
          .update({ priority_order: update.priority_order })
          .eq('id', update.id);
      }
      
      // Update local state
      const updatedItems = { ...swotItems };
      const categoryKey = `${category}s` as keyof SwotGridData;
      updatedItems[categoryKey] = items;
      setSwotItems(updatedItems);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error reordering items:', err);
      setError('Failed to reorder items. Please try again.');
    }
  };
  
  // Handle saving SWOT
  const handleSave = async () => {
    if (!swotAnalysis) return;
    
    try {
      setSaving(true);
      
      // Calculate SWOT score
      const totalItems = Object.values(swotItems).flat().length;
      const strengthsScore = swotItems.strengths.length * 2;
      const weaknessesScore = swotItems.weaknesses.length * -1;
      const opportunitiesScore = swotItems.opportunities.length * 1.5;
      const threatsScore = swotItems.threats.length * -1.5;
      const rawScore = strengthsScore + weaknessesScore + opportunitiesScore + threatsScore;
      const normalizedScore = Math.max(0, Math.min(100, 50 + (rawScore / Math.max(totalItems, 1)) * 10));
      
      // Update SWOT analysis
      const { error } = await supabase
        .from('swot_analyses')
        .update({
          swot_score: Math.round(normalizedScore),
          status: 'in-progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', swotAnalysis.id);
      
      if (error) throw error;
      
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving SWOT:', err);
      setError('Failed to save SWOT analysis. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle finalizing SWOT
  const handleFinalize = async () => {
    if (!swotAnalysis) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to finalize this SWOT analysis? This will lock it from further edits.'
    );
    
    if (!confirmed) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('swot_analyses')
        .update({
          status: 'final',
          finalized_at: new Date().toISOString()
        })
        .eq('id', swotAnalysis.id);
      
      if (error) throw error;
      
      setSwotAnalysis({ ...swotAnalysis, status: 'final' });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error finalizing SWOT:', err);
      setError('Failed to finalize SWOT analysis. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle exporting SWOT
  const handleExport = () => {
    // This would trigger the export component
    console.log('Exporting SWOT analysis...');
    alert('Export functionality will be implemented next!');
  };
  
  // Calculate statistics
  const calculateStats = () => {
    const total = Object.values(swotItems).flat().length;
    const byCategory = {
      strengths: swotItems.strengths.length,
      weaknesses: swotItems.weaknesses.length,
      opportunities: swotItems.opportunities.length,
      threats: swotItems.threats.length
    };
    
    return {
      total,
      byCategory,
      score: swotAnalysis?.swot_score || 0
    };
  };
  
  const stats = calculateStats();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SWOT Analysis...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Mode Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <p className="text-sm text-yellow-800 text-center">
          ⚠️ Test Mode - Using test user ID. In production, this will use actual authentication.
        </p>
      </div>
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">SWOT Analysis</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Strategic analysis for {currentQuarter.label}
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
                
                {/* Quarter Selector */}
                <QuarterSelector
                  currentQuarter={currentQuarter}
                  onQuarterChange={setCurrentQuarter}
                />
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => alert('History page coming soon!')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <History className="h-4 w-4 mr-2" />
                    History
                  </button>
                  
                  <button
                    onClick={() => alert('Compare feature coming soon!')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Compare
                  </button>
                  
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  
                  {swotAnalysis?.status !== 'final' && (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      
                      <button
                        onClick={handleFinalize}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Finalize
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Status Banner */}
      {swotAnalysis?.status === 'final' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  This SWOT analysis has been finalized and is read-only.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SwotStatisticsCard
            title="Total Items"
            value={stats.total}
            icon={<FileText className="h-6 w-6" />}
            color="gray"
          />
          <SwotStatisticsCard
            title="SWOT Score"
            value={`${stats.score}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            color="blue"
            trend={stats.score > 50 ? 'up' : 'down'}
          />
          <SwotStatisticsCard
            title="Strengths"
            value={stats.byCategory.strengths}
            icon={<span className="text-2xl">{getCategoryIcon('strength')}</span>}
            color="green"
          />
          <SwotStatisticsCard
            title="Threats"
            value={stats.byCategory.threats}
            icon={<span className="text-2xl">{getCategoryIcon('threat')}</span>}
            color="orange"
          />
        </div>
      </div>
      
      {/* Main SWOT Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
        <SwotGrid
          items={swotItems}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onReorderItems={handleReorderItems}
          isReadOnly={swotAnalysis?.status === 'final'}
        />
      </div>
      
      {/* Action Panel (for converting items to actions) */}
      {swotAnalysis && (
        <SwotActionPanel
          swotAnalysisId={swotAnalysis.id}
          swotItems={Object.values(swotItems).flat()}
        />
      )}
    </div>
  );
}