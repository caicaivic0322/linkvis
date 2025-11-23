import React from 'react';

interface CodeBlockProps {
  code: string;
  activeLine: number; // 0-based index in logic from App.tsx
  fontSize?: number;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, activeLine, fontSize = 12 }) => {
  const lines = code.split('\n');

  return (
    <div 
      className="font-mono overflow-x-auto bg-app p-2 rounded-lg border border-panel-border transition-colors duration-300"
      style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.5}px` }}
    >
      {lines.map((line, index) => {
        const isActive = index === activeLine;
        
        return (
          <div 
            key={index} 
            className={`px-2 py-0.5 rounded flex transition-colors duration-300 min-w-max ${
              isActive ? 'bg-accent/20 text-main border-l-2 border-accent' : 'text-muted'
            }`}
          >
            <span className="select-none text-right mr-3 opacity-50 inline-block min-w-[1.5em]">{index + 1}</span>
            <span className={`${isActive ? 'text-accent-text font-bold' : ''} whitespace-pre`}>
              {line}
            </span>
          </div>
        );
      })}
    </div>
  );
};