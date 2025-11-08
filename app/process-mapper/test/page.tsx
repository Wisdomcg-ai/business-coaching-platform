'use client';

import React from 'react';
import { ProcessDiagramRenderer } from '@/components/process-mapper/ProcessDiagramRenderer';
import { ProcessData } from '@/lib/process-mapper/types';

// Test data: Bathroom Renovation Process (End-to-End Example)
const bathroomeRenovationProcess: ProcessData = {
  name: 'Bathroom Renovation Process - Matrix View',
  description: 'Professional bathroom renovation process mapped across key business functions and roles',
  
  // 4 core functions only (removed PEOPLE and SYSTEMS)
  roles: ['Sales', 'Operations', 'Finance', 'Admin', 'Director', 'Project Management'],
  functions: ['MARKETING', 'SALES', 'OPERATIONS', 'FINANCE'],
  
  activities: [
    // SALES function - activities in the SALES column
    { id: '1', title: 'Customer Enquiry', role: 'Sales', function: 'SALES', type: 'action', order: 1 },
    { id: '2', title: 'Needs Assessment', role: 'Sales', function: 'SALES', type: 'action', order: 2 },
    { id: '3', title: 'Prepare Quote', role: 'Sales', function: 'SALES', type: 'action', order: 3 },
    { id: '4', title: 'Customer Decision', role: 'Sales', function: 'SALES', type: 'decision', order: 4 },
    
    // OPERATIONS function - activities in the OPERATIONS column
    { id: '5', title: 'Schedule Site Visit', role: 'Operations', function: 'OPERATIONS', type: 'action', order: 5 },
    { id: '6', title: 'Order Materials', role: 'Operations', function: 'OPERATIONS', type: 'action', order: 6 },
    { id: '7', title: 'Day 1 Onsite', role: 'Operations', function: 'OPERATIONS', type: 'action', order: 7 },
    { id: '8', title: 'Progress Photos', role: 'Operations', function: 'OPERATIONS', type: 'action', order: 8 },
    { id: '9', title: 'Final QA Check', role: 'Operations', function: 'OPERATIONS', type: 'action', order: 9 },
    
    // FINANCE function - activities in the FINANCE column
    { id: '10', title: 'Invoice Deposit (50%)', role: 'Finance', function: 'FINANCE', type: 'action', order: 10 },
    { id: '11', title: 'Invoice Progress (30%)', role: 'Finance', function: 'FINANCE', type: 'action', order: 11 },
    { id: '12', title: 'Final Invoice (20%)', role: 'Finance', function: 'FINANCE', type: 'action', order: 12 },
    
    // DIRECTOR activities - cross-functional oversight
    { id: '13', title: 'Approve Job', role: 'Director', function: 'OPERATIONS', type: 'action', order: 13 },
    { id: '14', title: 'Review Process', role: 'Director', function: 'FINANCE', type: 'decision', order: 14 },
  ],
  
  connections: [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '3', to: '4' },
    { from: '4', to: '5', label: 'Yes' },
    { from: '5', to: '6' },
    { from: '5', to: '10' },
    { from: '6', to: '7' },
    { from: '7', to: '8' },
    { from: '8', to: '9' },
    { from: '9', to: '13' },
    { from: '10', to: '11' },
    { from: '11', to: '12' },
    { from: '13', to: '14' },
  ],
};

// Simple example: Sales-only process
const simpleServiceProcess: ProcessData = {
  name: 'Simple Service Sale Process',
  description: 'Minimal example - just Sales function with 3 roles',
  
  roles: ['Sales Rep', 'Sales Manager', 'Director'],
  functions: ['SALES'],
  
  activities: [
    { id: '1', title: 'Lead Arrives', role: 'Sales Rep', function: 'SALES', type: 'action', order: 1 },
    { id: '2', title: 'Presentation', role: 'Sales Rep', function: 'SALES', type: 'action', order: 2 },
    { id: '3', title: 'Objection?', role: 'Sales Rep', function: 'SALES', type: 'decision', order: 3 },
    { id: '4', title: 'Manager Review', role: 'Sales Manager', function: 'SALES', type: 'action', order: 4 },
    { id: '5', title: 'Approval', role: 'Director', function: 'SALES', type: 'decision', order: 5 },
  ],
  
  connections: [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '3', to: '4', label: 'No' },
    { from: '4', to: '5' },
  ],
};

export default function ProcessMapperTestPage() {
  const [activeExample, setActiveExample] = React.useState<'bathroom' | 'simple'>('bathroom');

  const processData = activeExample === 'bathroom' ? bathroomeRenovationProcess : simpleServiceProcess;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Process Mapper Test</h1>
          <p className="text-slate-300">
            Professional swimlane diagrams with 4 core business functions
          </p>
        </div>

        {/* Example selector */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setActiveExample('bathroom')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeExample === 'bathroom'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Bathroom Renovation (4×6 Grid)
          </button>
          <button
            onClick={() => setActiveExample('simple')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeExample === 'simple'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Simple Service (1×3 Grid)
          </button>
        </div>

        {/* Process Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Activities</div>
            <div className="text-2xl font-bold text-white">{processData.activities.length}</div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Grid Size</div>
            <div className="text-2xl font-bold text-white">
              {processData.functions.length} × {processData.roles.length}
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Connections</div>
            <div className="text-2xl font-bold text-white">{processData.connections.length}</div>
          </div>
        </div>

        {/* Diagram */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
          <ProcessDiagramRenderer data={processData} title={processData.name} />
        </div>

        {/* Info boxes */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-white font-bold mb-3">Current Configuration</h3>
            <div className="text-slate-300 space-y-2 text-sm">
              <div>
                <span className="text-slate-400">Roles:</span>
                <div className="text-slate-200 mt-1">{processData.roles.join(', ')}</div>
              </div>
              <div className="mt-3">
                <span className="text-slate-400">Functions:</span>
                <div className="text-slate-200 mt-1">{processData.functions.join(', ')}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-white font-bold mb-3">Why 4 Functions?</h3>
            <div className="text-slate-300 space-y-2 text-sm">
              <div>✅ <span>Core business operations</span></div>
              <div>✅ <span>Clean, focused diagrams</span></div>
              <div>✅ <span>Professional appearance</span></div>
              <div>✅ <span>Easy to understand</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}