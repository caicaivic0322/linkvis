import React from 'react';
import { MemoryBlock } from '../types';

interface MemoryGridProps {
  blocks: MemoryBlock[];
}

export const MemoryGrid: React.FC<MemoryGridProps> = ({ blocks }) => {
  return (
    <div className="bg-input p-4 rounded-xl border border-panel-border shadow-inner transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-muted uppercase tracking-wider">内存堆视图 (Heap)</h3>
        <div className="flex gap-4 text-xs text-muted">
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-panel border border-panel-border rounded-sm"></span> 空闲</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-accent rounded-sm"></span> 占用</div>
        </div>
      </div>
      
      {/* Dynamic grid that adapts to container width */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(28px,1fr))] gap-1.5 font-mono text-[10px]">
        {blocks.map((block) => (
          <div
            key={block.address}
            title={block.occupied ? `地址: ${block.address}\n数值: ${block.value}` : `地址: ${block.address}\n状态: 空闲`}
            className={`
              relative aspect-square flex flex-col items-center justify-center rounded-md border transition-all duration-500 cursor-help
              ${block.occupied 
                ? 'bg-accent/20 border-accent text-accent-text shadow-[0_0_8px_rgba(var(--accent),0.2)]' 
                : 'bg-panel border-panel-border text-muted hover:border-muted'}
            `}
          >
            {/* Memory Address Label (Last 2 digits) */}
            <span className="absolute top-0.5 left-0.5 text-[7px] leading-none opacity-60 select-none font-sans tracking-tighter">
                {block.address.slice(-2)}
            </span>
            
            {block.occupied ? (
              <span className="font-bold text-xs text-accent z-10">{block.value}</span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted italic">
        *注意链表节点在内存中是分散存储的（非连续）。悬停查看完整地址。
      </p>
    </div>
  );
};