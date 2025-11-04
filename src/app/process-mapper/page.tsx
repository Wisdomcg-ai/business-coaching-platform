// ============================================================================
// PROCESS MAPPER PAGE
// Location: /src/app/process-mapper/page.tsx
// Purpose: Display the bathroom renovation process diagram
// Status: Uses mock data for testing with visual rendering
// ============================================================================

'use client'; // Client component

import React, { useEffect, useState } from 'react';
import { ProcessDiagramRenderer } from '@/components/ProcessDiagram/ProcessDiagramRenderer';
import { getMockProcessData } from '@/lib/mockProcessData';
import { processLayoutEngine } from '@/lib/services/process-layout.service';

interface PageState {
  loading: boolean;
  error: string | null;
  diagramLayout: any | null;
  processName: string;
  stepsMap: Map<string, any> | null;
}

export default function ProcessMapperPage() {
  const [state, setState] = useState<PageState>({
    loading: true,
    error: null,
    diagramLayout: null,
    processName: 'Loading...',
    stepsMap: null,
  });

  // ────────────────────────────────────────────────────────────────────
  // LOAD AND RENDER DIAGRAM
  // ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadAndRenderProcess();
  }, []);

  async function loadAndRenderProcess() {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // STEP 1: Get mock process data
      console.log('📥 Loading mock process data...');
      const process = getMockProcessData();

      if (!process.diagram) {
        throw new Error('Process not found');
      }

      console.log('✅ Mock data loaded:', {
        processName: process.diagram.process_name,
        stepCount: process.steps.length,
        flowCount: process.flows.length,
        phaseCount: process.phases.length,
      });

      // STEP 2: Convert steps array to a Map for the renderer
      const stepsMap = new Map(process.steps.map(s => [s.id, { 
        ...s, 
        action_name: s.activity_name 
      }]));

      console.log('📐 Calculating diagram layout...');
      
      // STEP 3: Calculate layout using the layout engine
      const diagramLayout = processLayoutEngine.calculate(
        process.steps,
        process.flows,
        process.phases
      );

      console.log('✅ Layout calculated:', {
        activitiesCount: diagramLayout.activities.size,
        connectorsCount: diagramLayout.connectors.length,
        swimlanesCount: diagramLayout.swimlanes.length,
        totalWidth: diagramLayout.totalWidth,
        totalHeight: diagramLayout.totalHeight,
      });

      // STEP 4: Update state with all data
      setState({
        loading: false,
        error: null,
        diagramLayout: diagramLayout,
        processName: process.diagram.process_name,
        stepsMap: stepsMap,
      });

    } catch (error) {
      console.error('❌ Error loading process:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  // ────────────────────────────────────────────────────────────────────
  // RENDER PAGE
  // ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-full mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {state.processName}
          </h1>
          <p className="text-gray-600">
            Visualize and manage your business processes
          </p>
        </div>

        {/* Loading State */}
        {state.loading && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading and rendering diagram...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-red-900 font-bold mb-2">Error Loading Process</h3>
            <p className="text-red-700">{state.error}</p>
            <button
              onClick={loadAndRenderProcess}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success State - Show Diagram */}
        {!state.loading && !state.error && state.diagramLayout && state.stepsMap && (
          <>
            {/* Process Diagram */}
            <div className="mb-8">
              <ProcessDiagramRenderer
                layout={state.diagramLayout}
                steps={state.stepsMap}
                title={state.processName}
                interactive={true}
              />
            </div>

            {/* Debug Info */}
            <details className="bg-gray-100 rounded-lg p-4 text-sm font-mono">
              <summary className="cursor-pointer font-bold text-gray-700 hover:text-gray-900">
                📊 Diagram Information
              </summary>
              <pre className="mt-4 text-gray-700 overflow-auto max-h-64">
                {JSON.stringify({
                  totalWidth: state.diagramLayout.totalWidth,
                  totalHeight: state.diagramLayout.totalHeight,
                  activities: state.diagramLayout.activities.size,
                  connectors: state.diagramLayout.connectors.length,
                  swimlanes: state.diagramLayout.swimlanes.length,
                  swimlaneNames: state.diagramLayout.swimlanes.map((s: any) => s.name),
                }, null, 2)}
              </pre>
            </details>
          </>
        )}

        {/* Empty State */}
        {!state.loading && !state.error && !state.diagramLayout && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 mb-4">No process loaded</p>
            <button
              onClick={loadAndRenderProcess}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Load Process
            </button>
          </div>
        )}
      </div>
    </div>
  );
}