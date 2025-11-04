'use client';

import React, { useState, useMemo } from 'react';
import { Download, Eye, EyeOff, Info } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  type: 'action' | 'decision';
  swimlane: string;
  column: number;
  description?: string;
  duration?: string;
  decisionQuestion?: string;
  yesBranch?: string;
  noBranch?: string;
  nextActivityId?: string;
  successCriteria?: string;
  documents?: string[];
  systems?: string[];
  notes?: string;
}

interface ProcessData {
  id: string;
  name: string;
  trigger?: string;
  successOutcome?: string;
  swimlanes: string[];
  activities: Activity[];
  stage?: string;
}

interface ProcessDiagramRendererProps {
  processData: ProcessData;
  onActivityClick?: (activity: Activity) => void;
  onActivityHover?: (activity: Activity | null) => void;
  zoom?: number;
}

// Sidebar colors only
const FUNCTION_COLORS: { [key: string]: string } = {
  Sales: '#F9A825',
  Operations: '#00ACC1',
  Finance: '#FB8C00',
  Marketing: '#8E24AA',
  'Project Management': '#66BB6A',
  Admin: '#FB8C00',
  Director: '#F4511E',
  Billing: '#F9A825',
  Accounting: '#FB8C00',
};

export default function ProcessDiagramRenderer({
  processData,
  onActivityClick,
  onActivityHover,
  zoom = 1
}: ProcessDiagramRendererProps) {
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  if (!processData || !processData.activities || processData.activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 text-lg font-semibold">No Activities</p>
          <p className="text-gray-400 text-sm mt-1">Add activities to visualize the process flow</p>
        </div>
      </div>
    );
  }

  const metrics = useMemo(() => {
    const actionCount = processData.activities.filter(a => a.type === 'action').length;
    const decisionCount = processData.activities.filter(a => a.type === 'decision').length;
    
    let totalMinutes = 0;
    processData.activities.forEach(a => {
      if (a.duration) {
        const hourMatch = a.duration.match(/(\d+)\s*(?:hour|hr|h)/i);
        const minMatch = a.duration.match(/(\d+)\s*(?:minute|min|m)/i);
        const dayMatch = a.duration.match(/(\d+)\s*(?:day|d)/i);
        
        if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
        if (minMatch) totalMinutes += parseInt(minMatch[1]);
        if (dayMatch) totalMinutes += parseInt(dayMatch[1]) * 8 * 60;
      }
    });

    return { 
      actionCount, 
      decisionCount, 
      totalDuration: totalMinutes > 60 ? `${Math.round(totalMinutes / 60)}h` : `${totalMinutes}m`,
      swimlaneCount: processData.swimlanes.length 
    };
  }, [processData]);

  const layoutData = useMemo(() => {
    const maxColumn = Math.max(...processData.activities.map(a => a.column || 0));
    return { maxColumn };
  }, [processData]);

  // PDF-EXACT DIMENSIONS
  const FUNCTION_BAR_WIDTH = 40;
  const FUNCTION_HEIGHT = 180;
  const COLUMN_WIDTH = 130;
  const COLUMN_GAP = 45;
  const ACTIVITY_WIDTH = 120;
  const ACTIVITY_HEIGHT = 65;
  const HEADER_HEIGHT = 40;

  const svgWidth = FUNCTION_BAR_WIDTH + (layoutData.maxColumn + 1) * (COLUMN_WIDTH + COLUMN_GAP) + 100;
  const svgHeight = HEADER_HEIGHT + processData.swimlanes.length * FUNCTION_HEIGHT + 40;

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivityId(activity.id);
    onActivityClick?.(activity);
  };

  const handleActivityHover = (activity: Activity | null) => {
    setHoveredActivityId(activity?.id ?? null);
    onActivityHover?.(activity);
  };

  const getFunctionY = (swimlane: string): number => {
    const idx = processData.swimlanes.indexOf(swimlane);
    return HEADER_HEIGHT + idx * FUNCTION_HEIGHT;
  };

  const getColumnX = (column: number): number => {
    return FUNCTION_BAR_WIDTH + column * (COLUMN_WIDTH + COLUMN_GAP);
  };

  const getConnectorPath = (
    fromActivity: Activity, 
    toActivity: Activity,
    isYesBranch: boolean = false
  ): { path: string; labelX: number; labelY: number } => {
    const fromX = getColumnX(fromActivity.column) + ACTIVITY_WIDTH;
    const fromY = getFunctionY(fromActivity.swimlane) + FUNCTION_HEIGHT / 2;
    const toX = getColumnX(toActivity.column);
    const toY = getFunctionY(toActivity.swimlane) + FUNCTION_HEIGHT / 2;

    const midX = fromX + (toX - fromX) / 2;
    
    // For decision branches, create visual separation
    if (fromActivity.type === 'decision') {
      const verticalOffset = isYesBranch ? -20 : 20;
      
      if (Math.abs(fromY - toY) < 5) {
        // Same function - create curved path for separation
        return {
          path: `M ${fromX} ${fromY} L ${midX} ${fromY + verticalOffset} L ${toX} ${toY}`,
          labelX: midX - 30,
          labelY: fromY + verticalOffset
        };
      } else {
        return {
          path: `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`,
          labelX: fromX + 20,
          labelY: (fromY + toY) / 2
        };
      }
    }
    
    // Regular sequential flow
    if (Math.abs(fromY - toY) < 5) {
      return {
        path: `M ${fromX} ${fromY} L ${toX} ${toY}`,
        labelX: midX,
        labelY: fromY - 10
      };
    } else {
      return {
        path: `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`,
        labelX: fromX + 20,
        labelY: (fromY + toY) / 2
      };
    }
  };

  const getNextActivity = (activity: Activity): Activity | null => {
    if (activity.nextActivityId) {
      return processData.activities.find(a => a.id === activity.nextActivityId) || null;
    }
    return null;
  };

  // Find activity that connects TO this activity (for decision diamond entry)
  const getPreviousActivity = (activity: Activity): Activity | null => {
    return processData.activities.find(a => 
      a.nextActivityId === activity.id || 
      a.yesBranch === activity.id || 
      a.noBranch === activity.id
    ) || null;
  };

  const wrapText = (text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length * 5.5 > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines.slice(0, 3);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{processData.name}</h3>
            {processData.trigger && <p className="text-xs text-gray-500">Triggered by: {processData.trigger}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowMetrics(!showMetrics)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {showMetrics ? <Eye className="w-4 h-4 text-gray-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
          </button>
          <button onClick={() => setShowLegend(!showLegend)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Info className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => window.print()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Actions</p>
            <p className="text-2xl font-bold text-blue-900">{metrics.actionCount}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wide">Decisions</p>
            <p className="text-2xl font-bold text-yellow-900">{metrics.decisionCount}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Swimlanes</p>
            <p className="text-2xl font-bold text-green-900">{metrics.swimlaneCount}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Est. Duration</p>
            <p className="text-2xl font-bold text-purple-900">{metrics.totalDuration}</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">Legend</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 rounded bg-white border-2 border-blue-500"></div>
              <span className="text-sm text-gray-700">Action Activity</span>
            </div>
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <polygon points="16,4 28,16 16,28 4,16" fill="white" stroke="#fbbf24" strokeWidth="2"/>
              </svg>
              <span className="text-sm text-gray-700">Decision Point</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Diagram - WHITE BACKGROUND PDF STYLE */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto p-6" style={{ backgroundColor: '#ffffff', maxHeight: '800px' }}>
          <svg width={svgWidth} height={svgHeight} className="mx-auto" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            
            {/* Function Separators - WHITE BACKGROUND */}
            {processData.swimlanes.map((swimlane, idx) => {
              const yPos = getFunctionY(swimlane);
              const color = FUNCTION_COLORS[swimlane] || '#9E9E9E';

              return (
                <g key={`function-${swimlane}`}>
                  {/* Thin horizontal separator line */}
                  <line 
                    x1={FUNCTION_BAR_WIDTH} 
                    y1={yPos} 
                    x2={svgWidth - 10} 
                    y2={yPos} 
                    stroke="#e0e0e0" 
                    strokeWidth="1"
                  />
                  
                  {/* Colored sidebar bar */}
                  <rect 
                    x={0} 
                    y={yPos} 
                    width={FUNCTION_BAR_WIDTH} 
                    height={FUNCTION_HEIGHT} 
                    fill={color}
                  />
                  
                  {/* Function label (rotated) */}
                  <text 
                    x={FUNCTION_BAR_WIDTH / 2} 
                    y={yPos + FUNCTION_HEIGHT / 2} 
                    transform={`rotate(-90 ${FUNCTION_BAR_WIDTH / 2} ${yPos + FUNCTION_HEIGHT / 2})`}
                    className="font-bold" 
                    style={{ fontSize: '12px' }} 
                    textAnchor="middle" 
                    fill="white" 
                    dominantBaseline="middle"
                  >
                    {swimlane}
                  </text>
                </g>
              );
            })}

            {/* Connectors - ENTRY INTO DECISIONS + EXIT PATHS */}
            {processData.activities.map(activity => {
              const color = FUNCTION_COLORS[activity.swimlane] || '#9E9E9E';

              return (
                <g key={`conn-${activity.id}`}>
                  {/* ENTRY CONNECTOR for decisions (activity BEFORE the decision connects TO it) */}
                  {activity.type === 'decision' && (() => {
                    const prevActivity = getPreviousActivity(activity);
                    if (!prevActivity) return null;
                    
                    const fromX = getColumnX(prevActivity.column) + ACTIVITY_WIDTH;
                    const fromY = getFunctionY(prevActivity.swimlane) + FUNCTION_HEIGHT / 2;
                    const toX = getColumnX(activity.column);
                    const toY = getFunctionY(activity.swimlane) + FUNCTION_HEIGHT / 2;
                    const midX = fromX + (toX - fromX) / 2;
                    
                    const path = Math.abs(fromY - toY) < 5 
                      ? `M ${fromX} ${fromY} L ${toX} ${toY}`
                      : `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;
                    
                    return (
                      <g>
                        <path d={path} fill="none" stroke={color} strokeWidth="2.5" opacity="0.7" />
                        <polygon 
                          points={`${toX},${toY} ${toX - 8},${toY - 5} ${toX - 8},${toY + 5}`}
                          fill={color}
                        />
                      </g>
                    );
                  })()}

                  {/* YES branch EXIT from decision */}
                  {activity.type === 'decision' && activity.yesBranch && (() => {
                    const toActivity = processData.activities.find(a => a.id === activity.yesBranch);
                    if (!toActivity) return null;
                    
                    const { path, labelX, labelY } = getConnectorPath(activity, toActivity, true);
                    const toY = getFunctionY(toActivity.swimlane) + FUNCTION_HEIGHT / 2;
                    
                    return (
                      <g>
                        <path d={path} fill="none" stroke={color} strokeWidth="2.5" opacity="0.8" />
                        <text x={labelX} y={labelY} style={{ fontSize: '11px', fontWeight: '700' }} fill="#1a1a1a">
                          Yes
                        </text>
                        <polygon 
                          points={`${getColumnX(toActivity.column)},${toY} ${getColumnX(toActivity.column) - 8},${toY - 5} ${getColumnX(toActivity.column) - 8},${toY + 5}`}
                          fill={color}
                        />
                      </g>
                    );
                  })()}

                  {/* NO branch EXIT from decision */}
                  {activity.type === 'decision' && activity.noBranch && (() => {
                    const toActivity = processData.activities.find(a => a.id === activity.noBranch);
                    if (!toActivity) return null;
                    
                    const { path, labelX, labelY } = getConnectorPath(activity, toActivity, false);
                    const toY = getFunctionY(toActivity.swimlane) + FUNCTION_HEIGHT / 2;
                    
                    return (
                      <g>
                        <path d={path} fill="none" stroke={color} strokeWidth="2.5" opacity="0.7" />
                        <text x={labelX} y={labelY} style={{ fontSize: '11px', fontWeight: '700' }} fill="#1a1a1a">
                          No
                        </text>
                        <polygon 
                          points={`${getColumnX(toActivity.column)},${toY} ${getColumnX(toActivity.column) - 8},${toY - 5} ${getColumnX(toActivity.column) - 8},${toY + 5}`}
                          fill={color}
                          opacity="0.7"
                        />
                      </g>
                    );
                  })()}

                  {/* Sequential flow for non-decision activities */}
                  {activity.type !== 'decision' && (() => {
                    const nextActivity = getNextActivity(activity);
                    if (!nextActivity) return null;
                    
                    const { path } = getConnectorPath(activity, nextActivity);
                    const toY = getFunctionY(nextActivity.swimlane) + FUNCTION_HEIGHT / 2;
                    
                    return (
                      <g>
                        <path d={path} fill="none" stroke={color} strokeWidth="2.5" opacity="0.7" />
                        <polygon 
                          points={`${getColumnX(nextActivity.column)},${toY} ${getColumnX(nextActivity.column) - 8},${toY - 5} ${getColumnX(nextActivity.column) - 8},${toY + 5}`}
                          fill={color}
                        />
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* Activities */}
            {processData.activities.map(activity => {
              const x = getColumnX(activity.column);
              const y = getFunctionY(activity.swimlane) + (FUNCTION_HEIGHT - ACTIVITY_HEIGHT) / 2;
              const centerY = y + ACTIVITY_HEIGHT / 2;
              const color = FUNCTION_COLORS[activity.swimlane] || '#9E9E9E';
              const isHovered = hoveredActivityId === activity.id;
              const isSelected = selectedActivityId === activity.id;
              
              const lines = wrapText(activity.title, ACTIVITY_WIDTH - 12);

              return (
                <g key={activity.id}>
                  {activity.type === 'decision' ? (
                    <g onMouseEnter={() => handleActivityHover(activity)} onMouseLeave={() => handleActivityHover(null)} onClick={() => handleActivityClick(activity)} style={{ cursor: 'pointer' }}>
                      <polygon 
                        points={`${x + ACTIVITY_WIDTH / 2},${y} ${x + ACTIVITY_WIDTH},${centerY} ${x + ACTIVITY_WIDTH / 2},${y + ACTIVITY_HEIGHT} ${x},${centerY}`} 
                        fill="white" 
                        stroke={color} 
                        strokeWidth={isHovered || isSelected ? '2.5' : '2'} 
                      />
                      {lines.map((line, idx) => (
                        <text 
                          key={idx}
                          x={x + ACTIVITY_WIDTH / 2} 
                          y={centerY - ((lines.length - 1) * 5.5) + (idx * 11)} 
                          style={{ fontSize: '9px' }} 
                          className="font-medium" 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          fill="#1a1a1a"
                        >
                          {line}
                        </text>
                      ))}
                    </g>
                  ) : (
                    <g onMouseEnter={() => handleActivityHover(activity)} onMouseLeave={() => handleActivityHover(null)} onClick={() => handleActivityClick(activity)} style={{ cursor: 'pointer' }}>
                      <rect 
                        x={x} 
                        y={y} 
                        width={ACTIVITY_WIDTH} 
                        height={ACTIVITY_HEIGHT} 
                        rx={4} 
                        fill="white" 
                        stroke={color} 
                        strokeWidth={isHovered || isSelected ? '2.5' : '2'} 
                      />
                      {lines.map((line, idx) => (
                        <text 
                          key={idx}
                          x={x + ACTIVITY_WIDTH / 2} 
                          y={y + 20 + (idx * 11)} 
                          style={{ fontSize: '9px' }} 
                          className="font-medium" 
                          textAnchor="middle" 
                          fill="#1a1a1a"
                        >
                          {line}
                        </text>
                      ))}

                      {activity.duration && (
                        <g>
                          <rect x={x + 4} y={y + ACTIVITY_HEIGHT - 16} width={50} height={12} fill={color} rx={2} opacity="0.9" />
                          <text x={x + 29} y={y + ACTIVITY_HEIGHT - 10} style={{ fontSize: '8px' }} className="font-semibold" textAnchor="middle" fill="white" dominantBaseline="middle">
                            {activity.duration}
                          </text>
                        </g>
                      )}

                      {activity.notes && (
                        <text x={x + ACTIVITY_WIDTH / 2} y={y + ACTIVITY_HEIGHT + 12} style={{ fontSize: '7px' }} fill="#666666" textAnchor="middle">
                          {activity.notes.length > 25 ? activity.notes.substring(0, 23) + '...' : activity.notes}
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {processData.successOutcome && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-green-900 uppercase tracking-wide mb-1">Success Outcome</p>
          <p className="text-sm text-green-800 font-medium">{processData.successOutcome}</p>
        </div>
      )}
    </div>
  );
}