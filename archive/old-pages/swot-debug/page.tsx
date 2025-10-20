'use client';

import React from 'react';

export default function SwotDebugPage() {
  // Try importing each component one by one
  let components = {
    SwotGrid: null as any,
    QuarterSelector: null as any,
    SwotActionPanel: null as any,
    SwotStatisticsCard: null as any,
    SwotItem: null as any,
  };

  // Test each import
  try {
    const { SwotGrid } = require('@/components/swot/SwotGrid');
    components.SwotGrid = SwotGrid ? '✅ Loaded' : '❌ Undefined';
  } catch (e: any) {
    components.SwotGrid = `❌ Error: ${e.message}`;
  }

  try {
    const { QuarterSelector } = require('@/components/swot/QuarterSelector');
    components.QuarterSelector = QuarterSelector ? '✅ Loaded' : '❌ Undefined';
  } catch (e: any) {
    components.QuarterSelector = `❌ Error: ${e.message}`;
  }

  try {
    const { SwotActionPanel } = require('@/components/swot/SwotActionPanel');
    components.SwotActionPanel = SwotActionPanel ? '✅ Loaded' : '❌ Undefined';
  } catch (e: any) {
    components.SwotActionPanel = `❌ Error: ${e.message}`;
  }

  try {
    const { SwotStatisticsCard } = require('@/components/swot/SwotStatisticsCard');
    components.SwotStatisticsCard = SwotStatisticsCard ? '✅ Loaded' : '❌ Undefined';
  } catch (e: any) {
    components.SwotStatisticsCard = `❌ Error: ${e.message}`;
  }

  try {
    const { SwotItem } = require('@/components/swot/SwotItem');
    components.SwotItem = SwotItem ? '✅ Loaded' : '❌ Undefined';
  } catch (e: any) {
    components.SwotItem = `❌ Error: ${e.message}`;
  }

  // Test types import
  let typesStatus = '';
  try {
    const types = require('@/lib/swot/types');
    typesStatus = types ? '✅ Types loaded' : '❌ Types undefined';
  } catch (e: any) {
    typesStatus = `❌ Types error: ${e.message}`;
  }

  // Test Supabase import
  let supabaseStatus = '';
  try {
    const { createClientComponentClient } = require('@/lib/supabase');
    supabaseStatus = createClientComponentClient ? '✅ Supabase loaded' : '❌ Supabase undefined';
  } catch (e: any) {
    supabaseStatus = `❌ Supabase error: ${e.message}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">SWOT Component Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Component Status:</h2>
          <div className="space-y-2 font-mono">
            {Object.entries(components).map(([name, status]) => (
              <div key={name} className="flex justify-between">
                <span>{name}:</span>
                <span>{status}</span>
              </div>
            ))}
          </div>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">Other Imports:</h2>
          <div className="space-y-2 font-mono">
            <div className="flex justify-between">
              <span>Types:</span>
              <span>{typesStatus}</span>
            </div>
            <div className="flex justify-between">
              <span>Supabase:</span>
              <span>{supabaseStatus}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm">
            Any component showing ❌ needs to be fixed. Check that:
          </p>
          <ol className="list-decimal list-inside text-sm mt-2">
            <li>The file exists at the correct path</li>
            <li>The component is exported with: export function ComponentName</li>
            <li>There are no syntax errors in the file</li>
          </ol>
        </div>
      </div>
    </div>
  );
}