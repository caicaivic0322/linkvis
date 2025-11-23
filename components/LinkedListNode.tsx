import React from 'react';
import { NodeData } from '../types';

interface LinkedListNodeProps {
  node: NodeData;
  isLast: boolean;
}

export const LinkedListNode: React.FC<LinkedListNodeProps> = ({ node, isLast }) => {
  return (
    <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
      {/* Node Box */}
      <div 
        className={`
          relative flex flex-col w-28 h-24 rounded-lg border-2 shadow-xl transition-all duration-500
          ${node.highlighted ? 'scale-110 ring-4 ring-warning/50 z-10' : ''}
          ${node.isTarget ? 'bg-error/10 border-error' : 
            node.isNew ? 'bg-success/10 border-success' :
            node.highlighted ? 'bg-warning/10 border-warning' : 'bg-panel border-accent'}
        `}
      >
        {/* Memory Address Tag */}
        <div className="absolute -top-3 left-2 px-1.5 py-0.5 bg-app border border-panel-border rounded text-[10px] font-mono text-muted transition-colors">
          {node.address}
        </div>

        {/* Value Section */}
        <div className="flex-1 flex items-center justify-center border-b border-inherit">
          <span className={`text-2xl font-bold font-mono ${node.highlighted ? 'text-warning' : 'text-main'}`}>
            {node.value}
          </span>
        </div>

        {/* Pointer Section */}
        <div className="h-8 bg-app/50 flex items-center justify-between px-2 text-[10px] font-mono rounded-b-lg transition-colors">
          <span className="text-muted">next:</span>
          <span className={isLast ? 'text-error' : 'text-accent-text'}>
            {node.nextAddress || 'NULL'}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center justify-center w-12 text-muted">
        <svg width="100%" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="0" y1="12" x2="20" y2="12" />
          <polyline points="14 6 20 12 14 18" />
        </svg>
      </div>

      {/* NULL Indicator if last */}
      {isLast && (
        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-panel-border bg-panel/50">
          <span className="text-xs font-bold text-muted">NULL</span>
        </div>
      )}
    </div>
  );
};