'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  SwotItem, 
  SwotCategory, 
  SwotGridData,
  getCategoryColor,
  getCategoryIcon 
} from '@/lib/swot/types';
import { SwotItem as SwotItemComponent } from './SwotItem';
import { Plus, Lightbulb, AlertTriangle, Target, Shield } from 'lucide-react';

interface SwotGridProps {
  items: SwotGridData;
  onAddItem: (category: SwotCategory, title: string, description?: string) => void;
  onUpdateItem: (itemId: string, updates: Partial<SwotItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onReorderItems: (category: SwotCategory, items: SwotItem[]) => void;
  isReadOnly?: boolean;
}

interface CategorySection {
  category: SwotCategory;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function SwotGrid({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onReorderItems,
  isReadOnly = false
}: SwotGridProps) {
  const [activeCategory, setActiveCategory] = useState<SwotCategory | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState<SwotCategory | null>(null);
  const [draggedItem, setDraggedItem] = useState<SwotItem | null>(null);
  const [draggedOverCategory, setDraggedOverCategory] = useState<SwotCategory | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  
  // Define category sections with their properties
  const categorySections: CategorySection[] = [
    {
      category: 'strength',
      title: 'Strengths',
      description: 'Internal positive factors that give you an advantage',
      icon: <Shield className="h-5 w-5" />,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      category: 'weakness',
      title: 'Weaknesses',
      description: 'Internal negative factors that need improvement',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      category: 'opportunity',
      title: 'Opportunities',
      description: 'External positive factors you can capitalize on',
      icon: <Target className="h-5 w-5" />,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      category: 'threat',
      title: 'Threats',
      description: 'External negative factors that could cause problems',
      icon: <Lightbulb className="h-5 w-5" />,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];
  
  // Handle adding new item
  const handleSubmitNewItem = (category: SwotCategory) => {
    if (newItemTitle.trim()) {
      onAddItem(category, newItemTitle.trim(), newItemDescription.trim());
      setNewItemTitle('');
      setNewItemDescription('');
      setShowAddForm(null);
    }
  };
  
  // Handle drag start
  const handleDragStart = (item: SwotItem, category: SwotCategory) => {
    if (isReadOnly) return;
    setDraggedItem(item);
    setActiveCategory(category);
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, category: SwotCategory, index?: number) => {
    e.preventDefault();
    if (isReadOnly) return;
    setDraggedOverCategory(category);
    if (index !== undefined) {
      setDraggedOverIndex(index);
    }
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent, targetCategory: SwotCategory, targetIndex?: number) => {
    e.preventDefault();
    if (isReadOnly || !draggedItem || !activeCategory) return;
    
    const categoryKey = `${targetCategory}s` as keyof SwotGridData;
    const sourceCategoryKey = `${activeCategory}s` as keyof SwotGridData;
    
    if (activeCategory === targetCategory) {
      // Reordering within the same category
      const categoryItems = [...items[categoryKey]];
      const draggedIndex = categoryItems.findIndex(item => item.id === draggedItem.id);
      
      if (draggedIndex !== -1 && targetIndex !== undefined && draggedIndex !== targetIndex) {
        categoryItems.splice(draggedIndex, 1);
        categoryItems.splice(targetIndex, 0, draggedItem);
        onReorderItems(targetCategory, categoryItems);
      }
    } else {
      // Moving between categories
      const updatedItem = { ...draggedItem, category: targetCategory };
      onUpdateItem(draggedItem.id, { category: targetCategory });
    }
    
    // Reset drag state
    setDraggedItem(null);
    setActiveCategory(null);
    setDraggedOverCategory(null);
    setDraggedOverIndex(null);
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
    setActiveCategory(null);
    setDraggedOverCategory(null);
    setDraggedOverIndex(null);
  };
  
  // Get items for a category
  const getCategoryItems = (category: SwotCategory): SwotItem[] => {
    const categoryKey = `${category}s` as keyof SwotGridData;
    return items[categoryKey] || [];
  };
  
  // Render category section
  const renderCategorySection = (section: CategorySection) => {
    const categoryItems = getCategoryItems(section.category);
    const isAddingItem = showAddForm === section.category;
    const isDraggedOver = draggedOverCategory === section.category;
    
    return (
      <div
        key={section.category}
        className={`
          bg-white rounded-lg shadow-sm border-2 p-6 relative
          ${isDraggedOver ? 'border-blue-400 bg-blue-50' : section.borderColor}
          ${!isReadOnly ? 'hover:shadow-md transition-shadow' : ''}
        `}
        onDragOver={(e) => handleDragOver(e, section.category)}
        onDrop={(e) => handleDrop(e, section.category, categoryItems.length)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${section.bgColor}`}>
              {section.icon}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${section.color}`}>
                {section.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {section.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${section.color}`}>
              {categoryItems.length} items
            </span>
            {!isReadOnly && (
              <button
                onClick={() => setShowAddForm(isAddingItem ? null : section.category)}
                className={`
                  p-1.5 rounded-md transition-colors
                  ${isAddingItem 
                    ? 'bg-gray-200 text-gray-600' 
                    : `${section.bgColor} ${section.color} hover:opacity-80`
                  }
                `}
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Add Item Form */}
        {isAddingItem && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="text"
              placeholder="Title (required)"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitNewItem(section.category)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 resize-none"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAddForm(null);
                  setNewItemTitle('');
                  setNewItemDescription('');
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitNewItem(section.category)}
                disabled={!newItemTitle.trim()}
                className={`
                  px-3 py-1 text-sm text-white rounded-md
                  ${newItemTitle.trim() 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Add Item
              </button>
            </div>
          </div>
        )}
        
        {/* Items List */}
        <div className="space-y-2 min-h-[100px]">
          {categoryItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No {section.title.toLowerCase()} identified</p>
              {!isReadOnly && (
                <p className="text-xs mt-1">Click + to add your first item</p>
              )}
            </div>
          ) : (
            categoryItems.map((item, index) => (
              <div
                key={item.id}
                draggable={!isReadOnly}
                onDragStart={() => handleDragStart(item, section.category)}
                onDragOver={(e) => handleDragOver(e, section.category, index)}
                onDrop={(e) => handleDrop(e, section.category, index)}
                onDragEnd={handleDragEnd}
                className={`
                  ${draggedOverIndex === index ? 'opacity-50' : ''}
                  ${!isReadOnly ? 'cursor-move' : ''}
                `}
              >
                <SwotItemComponent
                  item={item}
                  onUpdate={(updates) => onUpdateItem(item.id, updates)}
                  onDelete={() => onDeleteItem(item.id)}
                  isReadOnly={isReadOnly}
                  color={section.color}
                  bgColor={section.bgColor}
                />
              </div>
            ))
          )}
        </div>
        
        {/* Drop zone indicator */}
        {isDraggedOver && categoryItems.length === 0 && (
          <div className="absolute inset-0 rounded-lg border-2 border-dashed border-blue-400 pointer-events-none">
            <div className="flex items-center justify-center h-full">
              <p className="text-blue-600 font-medium">Drop here</p>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strengths - Top Left */}
      {renderCategorySection(categorySections[0])}
      
      {/* Weaknesses - Top Right */}
      {renderCategorySection(categorySections[1])}
      
      {/* Opportunities - Bottom Left */}
      {renderCategorySection(categorySections[2])}
      
      {/* Threats - Bottom Right */}
      {renderCategorySection(categorySections[3])}
    </div>
  );
}