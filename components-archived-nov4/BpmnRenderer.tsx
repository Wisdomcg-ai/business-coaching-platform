'use client';

import React, { useMemo, useRef, useState } from 'react';
import type { ProcessData } from '@/lib/types';

interface BpmnRendererProps {
  processData: ProcessData;
  readonly?: boolean;
  showGrid?: boolean;
  onExportPDF?: () => void;
}

// Colors for swimlanes
const SWIMLANE_COLORS: { [key: string]: string } = {
  Sales: '#FDB913',
  Operations: '#4A90E2',
  Finance: '#7ED321',
  'Project Management': '#FF6B6B',
  Director: '#9013FE',
  Admin: '#FF6B9D',
};

const ACTIVITY_BOX_WIDTH = 100;
const ACTIVITY_BOX_HEIGHT = 60;
const SWIMLANE_HEIGHT = 120;
const COLUMN_WIDTH = 140;
const MARGIN_TOP = 40;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;

interface Position {
  x: number;
  y: number;
}

interface ActivityLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  swimlane: string;
  title: string;
  type: 'action' | 'decision' | 'automation';
}

export const BpmnRenderer: React.FC<BpmnRendererProps> = ({
  processData,
  readonly = true,
  showGrid = true,
  onExportPDF,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Calculate layout
  const layout = useMemo(() => {
    const activities: ActivityLayout[] = [];
    const swimlaneIndex: { [key: string]: number } = {};

    // Build swimlane index
    processData.swimlanes.forEach((lane, idx) => {
      swimlaneIndex[lane] = idx;
    });

    // Position activities
    processData.activities.forEach((activity) => {
      const swimlaneIdx = swimlaneIndex[activity.swimlane] || 0;
      const columnNum = activity.column || 1;

      const x = MARGIN_LEFT + (columnNum - 1) * COLUMN_WIDTH;
      const y =
        MARGIN_TOP +
        swimlaneIdx * SWIMLANE_HEIGHT +
        SWIMLANE_HEIGHT / 2 -
        ACTIVITY_BOX_HEIGHT / 2;

      activities.push({
        id: activity.id,
        x,
        y,
        width: ACTIVITY_BOX_WIDTH,
        height: ACTIVITY_BOX_HEIGHT,
        swimlane: activity.swimlane,
        title: activity.title,
        type: activity.type,
      });
    });

    const maxColumn = Math.max(...processData.activities.map((a) => a.column || 1));
    const width =
      MARGIN_LEFT +
      maxColumn * COLUMN_WIDTH +
      ACTIVITY_BOX_WIDTH +
      MARGIN_RIGHT;
    const height =
      MARGIN_TOP +
      processData.swimlanes.length * SWIMLANE_HEIGHT +
      20;

    return { activities, swimlaneIndex, width, height };
  }, [processData]);

  // Draw a connector line between two activities
  const drawConnector = (
    fromActivity: ActivityLayout,
    toActivity: ActivityLayout,
    label?: string,
    isDashed = false
  ) => {
    const fromX = fromActivity.x + fromActivity.width / 2;
    const fromY = fromActivity.y + fromActivity.height / 2;
    const toX = toActivity.x + toActivity.width / 2;
    const toY = toActivity.y + toActivity.height / 2;

    // Create path with routing
    const midX = (fromX + toX) / 2;
    const pathData = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;

    return (
      <g key={`connector-${fromActivity.id}-${toActivity.id}`}>
        <path
          d={pathData}
          stroke="#666"
          strokeWidth="2"
          fill="none"
          strokeDasharray={isDashed ? '5,5' : '0'}
        />
        {/* Arrowhead */}
        <polygon points={`${toX - 6},${toY - 6} ${toX},${toY} ${toX - 6},${toY + 6}`} fill="#666" />
        {/* Label */}
        {label && (
          <text
            x={midX}
            y={fromY - 10}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#d9534f"
          >
            {label}
          </text>
        )}
      </g>
    );
  };

  // Draw activity box
  const drawActivity = (activity: ActivityLayout) => {
    const isDecision = activity.type === 'decision';
    const bgColor = SWIMLANE_COLORS[activity.swimlane] || '#E8E8E8';
    const opacity = 0.3;

    if (isDecision) {
      // Diamond shape for decision
      const points = [
        [activity.x + activity.width / 2, activity.y],
        [activity.x + activity.width, activity.y + activity.height / 2],
        [activity.x + activity.width / 2, activity.y + activity.height],
        [activity.x, activity.y + activity.height / 2],
      ]
        .map((p) => p.join(','))
        .join(' ');

      return (
        <g key={activity.id}>
          <polygon
            points={points}
            fill={bgColor}
            fillOpacity={opacity}
            stroke="#333"
            strokeWidth="2"
          />
          <text
            x={activity.x + activity.width / 2}
            y={activity.y + activity.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#000"
          >
            {activity.title}
          </text>
        </g>
      );
    } else {
      // Rectangle for regular activity
      return (
        <g key={activity.id}>
          <rect
            x={activity.x}
            y={activity.y}
            width={activity.width}
            height={activity.height}
            fill={bgColor}
            fillOpacity={opacity}
            stroke="#333"
            strokeWidth="2"
            rx="4"
          />
          <text
            x={activity.x + activity.width / 2}
            y={activity.y + activity.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#000"
          >
            {activity.title}
          </text>
        </g>
      );
    }
  };

  // Draw swimlanes
  const drawSwimlanes = () => {
    return processData.swimlanes.map((lane, idx) => {
      const y = MARGIN_TOP + idx * SWIMLANE_HEIGHT;
      const bgColor = SWIMLANE_COLORS[lane] || '#E8E8E8';

      return (
        <g key={`swimlane-${lane}`}>
          {/* Swimlane background */}
          <rect
            x={0}
            y={y}
            width={layout.width}
            height={SWIMLANE_HEIGHT}
            fill={bgColor}
            fillOpacity="0.15"
            stroke="#999"
            strokeWidth="1"
          />
          {/* Swimlane label */}
          <rect
            x={0}
            y={y}
            width={MARGIN_LEFT - 5}
            height={SWIMLANE_HEIGHT}
            fill={bgColor}
            fillOpacity="0.4"
            stroke="#999"
            strokeWidth="1"
          />
          <text
            x={MARGIN_LEFT / 2}
            y={y + SWIMLANE_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#000"
            transform={`rotate(-90 ${MARGIN_LEFT / 2} ${y + SWIMLANE_HEIGHT / 2})`}
          >
            {lane}
          </text>
        </g>
      );
    });
  };

  // Draw all connectors
  const drawConnectors = () => {
    const connectors: JSX.Element[] = [];
    const activityMap: { [key: string]: ActivityLayout } = {};

    layout.activities.forEach((a) => {
      activityMap[a.id] = a;
    });

    processData.activities.forEach((activity) => {
      const fromActivity = activityMap[activity.id];
      if (!fromActivity) return;

      if (activity.type === 'decision') {
        // YES branch
        if (activity.yesBranch) {
          const toActivity = activityMap[activity.yesBranch];
          if (toActivity) {
            connectors.push(drawConnector(fromActivity, toActivity, 'YES'));
          }
        }

        // NO branch
        if (activity.noBranch) {
          const toActivity = activityMap[activity.noBranch];
          if (toActivity) {
            connectors.push(drawConnector(fromActivity, toActivity, 'NO'));
          }
        }
      } else {
        // Regular flow
        if (activity.nextActivityId) {
          const toActivity = activityMap[activity.nextActivityId];
          if (toActivity) {
            connectors.push(drawConnector(fromActivity, toActivity));
          }
        } else {
          // Find next by column
          const nextByColumn = processData.activities.find(
            (a) => a.column === (activity.column || 1) + 1
          );
          if (nextByColumn) {
            const toActivity = activityMap[nextByColumn.id];
            if (toActivity) {
              connectors.push(drawConnector(fromActivity, toActivity));
            }
          }
        }
      }
    });

    return connectors;
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomFit = () => {
    setZoomLevel(1);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <button
          onClick={handleZoomOut}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Zoom out"
        >
          −
        </button>
        <span className="text-sm text-gray-600 w-12 text-center font-medium">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomFit}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Fit to view"
        >
          Fit
        </button>

        <div className="flex-1" />

        {onExportPDF && (
          <button
            onClick={onExportPDF}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Export PDF
          </button>
        )}
      </div>

      <div className="flex-1 relative w-full overflow-auto bg-white min-h-0">
        <svg
          ref={svgRef}
          width={layout.width}
          height={layout.height}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            minWidth: '100%',
            minHeight: '100%',
          }}
          className="bg-white"
        >
          {/* Swimlanes */}
          {drawSwimlanes()}

          {/* Connectors (draw first so they're behind activities) */}
          {drawConnectors()}

          {/* Activities */}
          {layout.activities.map((activity) => drawActivity(activity))}
        </svg>
      </div>
    </div>
  );
};

export default BpmnRenderer;