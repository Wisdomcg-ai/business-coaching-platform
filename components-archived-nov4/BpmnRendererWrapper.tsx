'use client';

import React from 'react';
import { BpmnRenderer } from './BpmnRenderer';
import type { ProcessData } from '@/lib/types';

interface BpmnRendererWrapperProps {
  processData: ProcessData;
  readonly?: boolean;
  showGrid?: boolean;
  onExportPDF?: () => void;
}

export const BpmnRendererWrapper: React.FC<BpmnRendererWrapperProps> = ({
  processData,
  readonly = true,
  showGrid = true,
  onExportPDF,
}) => {
  return (
    <div className="w-full h-full">
      <BpmnRenderer
        processData={processData}
        readonly={readonly}
        showGrid={showGrid}
        onExportPDF={onExportPDF}
      />
    </div>
  );
};

export default BpmnRendererWrapper;