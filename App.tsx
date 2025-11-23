
import React, { useState, useEffect, useRef } from 'react';
import { NodeData, MemoryBlock, OperationType, LogEntry } from './types';
import { LinkedListNode } from './components/LinkedListNode';
import { MemoryGrid } from './components/MemoryGrid';
import { CodeBlock } from './components/CodeBlock';
import { MEMORY_SIZE, ANIMATION_DELAY_MS, CPP_SNIPPETS, STRUCT_SNIPPET_BASE } from './constants';

// Utilities to generate random addresses
const generateAddress = () => '0x' + Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');

// Themes
type Theme = 'dark' | 'light' | 'midnight' | 'warm';

// Resizable Handle Component
const ResizeHandle = ({ onMouseDown, orientation = 'vertical' }: { onMouseDown: () => void, orientation?: 'vertical' | 'horizontal' }) => (
  <div 
    className={`hidden lg:flex items-center justify-center bg-panel border-x border-panel-border hover:bg-accent transition-colors z-30 group flex-shrink-0
      ${orientation === 'vertical' ? 'w-1 hover:w-1.5 cursor-col-resize' : 'h-1 hover:h-1.5 cursor-row-resize w-full border-y border-x-0'}
    `}
    onMouseDown={onMouseDown}
  >
    <div className={`bg-muted opacity-20 rounded-full group-hover:bg-white transition-colors ${orientation === 'vertical' ? 'w-0.5 h-8' : 'h-0.5 w-8'}`} />
  </div>
);

// Font Control Component
const FontControl = ({ onDecrease, onIncrease, label }: { onDecrease: () => void, onIncrease: () => void, label?: string }) => (
    <div className="flex items-center gap-1 bg-app/50 rounded border border-panel-border px-1">
        {label && <span className="text-[10px] text-muted px-1 uppercase">{label}</span>}
        <button onClick={onDecrease} className="p-1 text-muted hover:text-main hover:bg-accent/20 rounded transition-colors" title="Decrease Font Size">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
        </button>
        <button onClick={onIncrease} className="p-1 text-muted hover:text-main hover:bg-accent/20 rounded transition-colors" title="Increase Font Size">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        </button>
    </div>
);

function App() {
  // --- Core State ---
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [memory, setMemory] = useState<MemoryBlock[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // --- Theme State ---
  // Defaulting to 'warm' as requested
  const [theme, setTheme] = useState<Theme>('warm');

  // --- Visualization & UI State ---
  const [visualizerZoom, setVisualizerZoom] = useState(1);
  const [codeFontSize, setCodeFontSize] = useState(12);
  const [structFontSize, setStructFontSize] = useState(13); // Renamed from aiFontSize

  // --- Code Visualization State ---
  const [currentSnippet, setCurrentSnippet] = useState<string>('');
  const [activeLine, setActiveLine] = useState<number>(-1);

  // --- Layout State (Resizable) ---
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(384);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // --- Inputs ---
  const [inputValue, setInputValue] = useState<string>('');
  const [inputIndex, setInputIndex] = useState<string>('');

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Sync Tailwind Dark Mode Class
  useEffect(() => {
    if (theme === 'dark' || theme === 'midnight') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- Initialization & Layout Effects ---
  useEffect(() => {
    const initialMemory: MemoryBlock[] = Array.from({ length: MEMORY_SIZE }).map(() => ({
      address: generateAddress(),
      occupied: false,
      nodeId: null,
      value: null
    }));
    setMemory(initialMemory);
    addLog("内存堆已初始化完成。", 'info');

    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize(); // Init check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Dragging
  useEffect(() => {
    if (isDraggingLeft || isDraggingRight) {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingLeft) {
                const newWidth = Math.max(280, Math.min(600, e.clientX));
                setLeftPanelWidth(newWidth);
            } else if (isDraggingRight) {
                const newWidth = Math.max(300, Math.min(800, window.innerWidth - e.clientX));
                setRightPanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsDraggingLeft(false);
            setIsDraggingRight(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };
    }
  }, [isDraggingLeft, isDraggingRight]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Helpers
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { id: Date.now().toString(), message, type, timestamp: Date.now() }]);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getFreeMemoryBlockIndex = () => {
    const freeIndices = memory.map((m, i) => (!m.occupied ? i : -1)).filter(i => i !== -1);
    if (freeIndices.length === 0) return -1;
    return freeIndices[Math.floor(Math.random() * freeIndices.length)];
  };

  // --- Operations (Identical Logic to previous, preserved) ---

  const insertAtEnd = async () => {
    if (!inputValue || isAnimating) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    setIsAnimating(true);
    setCurrentSnippet(CPP_SNIPPETS.INSERT_TAIL);
    setActiveLine(0); 
    addLog(`开始执行: insertAtEnd(${val})`, 'info');

    const memIndex = getFreeMemoryBlockIndex();
    if (memIndex === -1) {
      addLog("内存溢出! 没有空闲块。", 'error');
      setIsAnimating(false);
      setActiveLine(-1);
      return;
    }

    await delay(ANIMATION_DELAY_MS / 2);
    setActiveLine(1); 
    
    const newAddr = memory[memIndex].address;
    const newNode: NodeData = {
      id: crypto.randomUUID(),
      value: val,
      address: newAddr,
      nextAddress: null,
      isHead: nodes.length === 0,
      highlighted: false,
      isTarget: false,
      isNew: true
    };

    await delay(ANIMATION_DELAY_MS);
    setActiveLine(2); 
    await delay(ANIMATION_DELAY_MS);

    if (nodes.length === 0) {
        setActiveLine(3); 
        setNodes([newNode]);
        setMemory(prev => {
            const copy = [...prev];
            copy[memIndex] = { ...copy[memIndex], occupied: true, nodeId: newNode.id, value: val };
            return copy;
        });
        await delay(ANIMATION_DELAY_MS);
    } else {
        setActiveLine(4); 
        await delay(ANIMATION_DELAY_MS / 2);
        setActiveLine(5); 
        addLog("head 不为空，开始遍历...", 'info');
        
        for (let i = 0; i < nodes.length; i++) {
            setNodes(prev => prev.map((n, idx) => idx === i ? { ...n, highlighted: true } : { ...n, highlighted: false }));
            setActiveLine(6); 
            addLog(`temp 指向地址: ${nodes[i].address}`, 'info');
            await delay(ANIMATION_DELAY_MS);

            if (i < nodes.length - 1) {
                 setActiveLine(7); 
                 await delay(ANIMATION_DELAY_MS);
            }
        }

        setActiveLine(9); 
        setNodes(prev => {
            const copy = [...prev];
            copy[copy.length - 1].nextAddress = newAddr;
            copy[copy.length - 1].highlighted = false;
            return [...copy, newNode];
        });
        
        setMemory(prev => {
            const copy = [...prev];
            copy[memIndex] = { ...copy[memIndex], occupied: true, nodeId: newNode.id, value: val };
            return copy;
        });
        await delay(ANIMATION_DELAY_MS);
    }

    setActiveLine(11); 
    await delay(ANIMATION_DELAY_MS / 2);

    addLog(`插入 ${val} 到地址 ${newAddr}`, 'success');
    setIsAnimating(false);
    setInputValue('');
    setActiveLine(-1);
  };

  const insertAtHead = async () => {
    if (!inputValue || isAnimating) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    setIsAnimating(true);
    setCurrentSnippet(CPP_SNIPPETS.INSERT_HEAD);
    setActiveLine(0);
    addLog(`开始执行: insertAtHead(${val})`, 'info');

    const memIndex = getFreeMemoryBlockIndex();
    if (memIndex === -1) { addLog("内存已满", 'error'); setIsAnimating(false); setActiveLine(-1); return; }
    
    await delay(ANIMATION_DELAY_MS / 2);
    setActiveLine(1); 

    const newAddr = memory[memIndex].address;
    const newNode: NodeData = {
      id: crypto.randomUUID(),
      value: val,
      address: newAddr,
      nextAddress: nodes.length > 0 ? nodes[0].address : null,
      isHead: true,
      highlighted: false,
      isTarget: false,
      isNew: true
    };
    await delay(ANIMATION_DELAY_MS);

    setActiveLine(2); 
    await delay(ANIMATION_DELAY_MS);

    if (nodes.length === 0) {
        setActiveLine(3); 
        setNodes([newNode]);
    } else {
        setActiveLine(5); 
        await delay(ANIMATION_DELAY_MS / 2);
        setActiveLine(6); 
        await delay(ANIMATION_DELAY_MS);
        setActiveLine(7); 

        setNodes(prev => {
            const updatedOldNodes = prev.map(n => ({...n, isHead: false}));
            return [newNode, ...updatedOldNodes];
        });
    }

    setMemory(prev => {
      const copy = [...prev];
      copy[memIndex] = { ...copy[memIndex], occupied: true, nodeId: newNode.id, value: val };
      return copy;
    });
    
    await delay(ANIMATION_DELAY_MS);
    setActiveLine(9); 
    
    addLog(`已在头部 (${newAddr}) 插入 ${val}`, 'success');
    setIsAnimating(false);
    setInputValue('');
    setActiveLine(-1);
  };

  const insertAtPosition = async () => {
      if (!inputValue || !inputIndex || isAnimating) return;
      const val = parseInt(inputValue);
      const pos = parseInt(inputIndex);
      if (isNaN(val) || isNaN(pos)) return;

      setIsAnimating(true);
      setCurrentSnippet(CPP_SNIPPETS.INSERT_AT);
      setActiveLine(0);
      addLog(`开始执行: insertByPosition(${pos}, ${val})`, 'info');
      await delay(ANIMATION_DELAY_MS);

      setActiveLine(1); 
      if (pos < 0 || pos > nodes.length) {
          addLog(`位置 ${pos} 无效 (当前长度: ${nodes.length})`, 'error');
          setIsAnimating(false);
          setActiveLine(-1);
          return;
      }
      await delay(ANIMATION_DELAY_MS);

      setActiveLine(2); 
      if (pos === 0) {
          setActiveLine(3); 
          await delay(ANIMATION_DELAY_MS);
          const memIndex = getFreeMemoryBlockIndex();
          if (memIndex === -1) { addLog("内存已满", 'error'); setIsAnimating(false); return; }
          const newAddr = memory[memIndex].address;
          const newNode: NodeData = {
            id: crypto.randomUUID(), value: val, address: newAddr,
            nextAddress: nodes.length > 0 ? nodes[0].address : null,
            isHead: true, highlighted: false, isTarget: false, isNew: true
          };
          setNodes(prev => [newNode, ...prev.map(n => ({...n, isHead: false}))]);
          setMemory(prev => {
              const copy = [...prev];
              copy[memIndex] = { ...copy[memIndex], occupied: true, nodeId: newNode.id, value: val };
              return copy;
          });
          addLog(`头部插入完成`, 'success');
          setActiveLine(4); 
          setIsAnimating(false);
          setActiveLine(-1);
          return;
      }

      await delay(ANIMATION_DELAY_MS);
      setActiveLine(6); 
      addLog("初始化 temp 指针...", 'info');
      
      let tempIndex = 0;
      for (let i = 0; i < pos - 1; i++) {
          setNodes(prev => prev.map((n, idx) => ({...n, highlighted: idx === i})));
          setActiveLine(7); 
          await delay(ANIMATION_DELAY_MS);
          setActiveLine(8); 
          addLog(`temp 移动到节点 ${i+1}`, 'info');
          await delay(ANIMATION_DELAY_MS);
          tempIndex = i + 1;
      }
      setNodes(prev => prev.map((n, idx) => ({...n, highlighted: idx === tempIndex})));
      
      setActiveLine(10); 
      const memIndex = getFreeMemoryBlockIndex();
      if (memIndex === -1) { addLog("内存已满", 'error'); setIsAnimating(false); return; }
      const newAddr = memory[memIndex].address;
      
      const tempNode = nodes[pos - 1];
      
      const newNode: NodeData = {
        id: crypto.randomUUID(),
        value: val,
        address: newAddr,
        nextAddress: tempNode.nextAddress,
        isHead: false,
        highlighted: false,
        isTarget: false,
        isNew: true
      };
      
      setMemory(prev => {
          const copy = [...prev];
          copy[memIndex] = { ...copy[memIndex], occupied: true, nodeId: newNode.id, value: val };
          return copy;
      });
      addLog(`新节点创建于 ${newAddr}`, 'info');
      await delay(ANIMATION_DELAY_MS);

      setActiveLine(11); 
      await delay(ANIMATION_DELAY_MS);

      setActiveLine(12); 
      setNodes(prev => {
          const copy = [...prev];
          copy.splice(pos, 0, newNode);
          copy[pos - 1].nextAddress = newAddr;
          copy[pos - 1].highlighted = false;
          return copy;
      });
      
      await delay(ANIMATION_DELAY_MS);
      setActiveLine(13); 
      addLog(`已在位置 ${pos} 插入 ${val}`, 'success');

      setActiveLine(14); 
      setIsAnimating(false);
      setInputValue('');
      setInputIndex('');
      setActiveLine(-1);
  };

  const deleteValue = async () => {
    if (!inputValue || isAnimating) return;
    const val = parseInt(inputValue);
    setIsAnimating(true);
    setCurrentSnippet(CPP_SNIPPETS.DELETE_VAL);
    setActiveLine(0);
    addLog(`开始执行: deleteNode(${val})`, 'info');
    await delay(ANIMATION_DELAY_MS);

    setActiveLine(1); 
    if (nodes.length === 0) {
        setIsAnimating(false);
        setActiveLine(-1);
        return;
    }

    setActiveLine(2); 
    await delay(ANIMATION_DELAY_MS);

    let found = false;
    let indexToDelete = -1;

    if (nodes[0].value === val) {
        setActiveLine(3); 
        addLog(`头节点匹配值 ${val}，执行删除`, 'success');
        const deletedNode = nodes[0];
        setNodes(prev => prev.slice(1).map((n, i) => i === 0 ? {...n, isHead: true} : n));
        setMemory(prev => prev.map(m => m.nodeId === deletedNode.id ? { ...m, occupied: false, value: null, nodeId: null } : m));
        setActiveLine(4); 
        found = true;
    } else {
        setActiveLine(6); 
        for (let i = 0; i < nodes.length - 1; i++) {
            setNodes(prev => prev.map((n, idx) => ({ ...n, highlighted: idx === i })));
            setActiveLine(7); 
            await delay(ANIMATION_DELAY_MS);
            
            if (nodes[i + 1].value === val) {
                indexToDelete = i + 1;
                found = true;
                break;
            }
            
            setActiveLine(8); 
            
        }

        if (found) {
            const prevNode = nodes[indexToDelete - 1];
            setNodes(prev => prev.map((n, idx) => idx === indexToDelete - 1 ? {...n, highlighted: true} : n));
            addLog(`找到值 ${val}，前驱节点在 ${prevNode.address}`, 'success');
            
            setActiveLine(13); 
            setNodes(prev => prev.map((n, idx) => idx === indexToDelete ? {...n, isTarget: true} : n));
            await delay(ANIMATION_DELAY_MS);

            setActiveLine(14); 
            const deletedNode = nodes[indexToDelete];
            setNodes(prev => {
                const copy = [...prev];
                copy[indexToDelete - 1].nextAddress = nodes[indexToDelete + 1] ? nodes[indexToDelete + 1].address : null;
                return copy.filter((_, idx) => idx !== indexToDelete);
            });
            await delay(ANIMATION_DELAY_MS);

            setActiveLine(15); 
            setMemory(prev => prev.map(m => m.nodeId === deletedNode.id ? { ...m, occupied: false, value: null, nodeId: null } : m));

            setActiveLine(16); 
        } else {
             setActiveLine(10); 
             addLog(`未找到值 ${val}`, 'warning');
             await delay(ANIMATION_DELAY_MS);
             setActiveLine(11); 
        }
    }

    setNodes(prev => prev.map(n => ({...n, highlighted: false, isTarget: false})));
    setIsAnimating(false);
    setInputValue('');
    setActiveLine(-1);
  };

  const deleteAtEnd = async () => {
      if (nodes.length === 0 || isAnimating) return;
      setIsAnimating(true);
      setCurrentSnippet(CPP_SNIPPETS.DELETE_TAIL);
      setActiveLine(0);
      addLog(`开始执行: deleteAtEnd()`, 'info');

      setActiveLine(1); 
      await delay(ANIMATION_DELAY_MS);

      setActiveLine(4); 
      
      if (nodes.length === 1) {
           const deletedNode = nodes[0];
           setNodes([]);
           setMemory(prev => prev.map(m => m.nodeId === deletedNode.id ? { ...m, occupied: false, value: null, nodeId: null } : m));
           addLog(`删除了最后一个节点`, 'success');
      } else {
          for (let i = 0; i < nodes.length - 1; i++) {
              setNodes(prev => prev.map((n, idx) => ({...n, highlighted: idx === i})));
              setActiveLine(5); 
              addLog(`遍历至 ${nodes[i].address}`, 'info');
              await delay(ANIMATION_DELAY_MS);
              if (i < nodes.length - 2) {
                  setActiveLine(6); 
                  await delay(ANIMATION_DELAY_MS);
              }
          }

          setActiveLine(8); 
          const lastNode = nodes[nodes.length - 1];
          
          setNodes(prev => {
              const copy = [...prev];
              copy.pop(); 
              copy[copy.length - 1].nextAddress = null; 
              copy[copy.length - 1].highlighted = false;
              return copy;
          });
          
          await delay(ANIMATION_DELAY_MS);
          setMemory(prev => prev.map(m => m.nodeId === lastNode.id ? { ...m, occupied: false, value: null, nodeId: null } : m));
          
          setActiveLine(9); 
      }

      addLog(`尾节点删除成功`, 'success');
      setIsAnimating(false);
      setActiveLine(-1);
  };

  const clearList = () => {
      setNodes([]);
      setMemory(prev => prev.map(m => ({...m, occupied: false, value: null, nodeId: null})));
      addLog("链表已清空", 'warning');
      setCurrentSnippet('');
      setActiveLine(-1);
  };

  // Generate dynamic struct code
  const getStructCode = () => {
    const headAddr = nodes.length > 0 ? nodes[0].address : 'nullptr';
    return STRUCT_SNIPPET_BASE
      .replace('{{HEAD_ADDR}}', headAddr)
      .replace('{{SIZE}}', nodes.length.toString());
  };

  // --- Render ---
  return (
    <div className="h-screen w-full flex flex-col font-sans overflow-hidden transition-colors duration-300 bg-app text-main">
        <style>{`
            :root {
                /* Default (WARM - "Mild/Cozy") */
                --bg-app: #f5f5f4; /* Stone 100 */
                --bg-panel: #fafaf9; /* Stone 50 */
                --bg-input: #e7e5e4; /* Stone 200 */
                --border: #d6d3d1; /* Stone 300 */
                --text-main: #292524; /* Stone 800 - Deep Charcoal */
                --text-muted: #78716c; /* Stone 500 */
                --accent: #d97706; /* Amber 600 */
                --accent-hover: #b45309;
                --accent-text: #92400e; /* Amber 800 */
                --success: #15803d; /* Green 700 */
                --error: #b91c1c; /* Red 700 */
                --warning: #b45309; /* Amber 700 */
            }

            [data-theme='dark'] {
                /* Deep Slate (Previous Default) */
                --bg-app: #020617;
                --bg-panel: #0f172a;
                --bg-input: #020617;
                --border: #1e293b;
                --text-main: #e2e8f0;
                --text-muted: #94a3b8;
                --accent: #4f46e5;
                --accent-hover: #4338ca;
                --accent-text: #818cf8;
                --success: #4ade80;
                --error: #f87171;
                --warning: #fbbf24;
            }

            [data-theme='light'] {
                /* Paper White (High Contrast) */
                --bg-app: #f8fafc;
                --bg-panel: #ffffff;
                --bg-input: #e2e8f0; 
                --border: #cbd5e1;
                --text-main: #020617; 
                --text-muted: #475569; 
                --accent: #2563eb;
                --accent-hover: #1d4ed8;
                --accent-text: #1e40af; 
                --success: #16a34a;
                --error: #dc2626;
                --warning: #d97706;
            }

            [data-theme='midnight'] {
                /* OLED Black */
                --bg-app: #000000;
                --bg-panel: #111111;
                --bg-input: #000000;
                --border: #333333;
                --text-main: #e4e4e7;
                --text-muted: #71717a;
                --accent: #059669;
                --accent-hover: #047857;
                --accent-text: #34d399;
                --success: #34d399;
                --error: #ef4444;
                --warning: #f59e0b;
            }

            body {
                background-color: var(--bg-app);
            }

            .btn-primary {
                @apply bg-accent hover:bg-accent-hover text-black dark:text-white py-3 px-4 rounded-full text-xs font-bold shadow-md transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2;
            }
            .btn-danger {
                @apply bg-app border-2 border-error/20 hover:bg-error hover:text-white text-black dark:text-error hover:border-error py-3 px-4 rounded-full text-xs font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm gap-2;
            }
            .btn-secondary {
                @apply bg-app border-2 border-panel-border hover:border-muted hover:text-main text-black dark:text-muted py-3 px-4 rounded-full text-xs font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm gap-2;
            }
            .input-field {
                @apply bg-input border-2 border-panel-border rounded-xl px-4 py-2.5 text-sm text-black dark:text-main placeholder-slate-500 dark:placeholder-muted focus:border-accent focus:outline-none transition-colors shadow-inner font-mono font-bold;
            }
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: var(--bg-app); 
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: var(--border); 
                border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: var(--text-muted); 
            }
        `}</style>
        
        <div data-theme={theme} className="flex flex-col h-full w-full">
            {/* Header */}
            <header className="bg-panel border-b border-panel-border p-4 shadow-md z-20 h-16 flex-shrink-0 transition-colors duration-300">
                <div className="max-w-full mx-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-accent/30 transition-colors">L</div>
                        <h1 className="text-xl font-bold tracking-tight text-main">LinkVis <span className="text-muted font-normal ml-2 text-sm hidden sm:inline">C++ 链表可视化</span></h1>
                    </div>
                    <div className="flex items-center gap-6">
                         <div className="flex gap-6 text-xs font-mono text-muted hidden md:flex">
                            <div className="bg-app/50 px-3 py-1 rounded-full border border-panel-border">Length: <span className="text-main font-bold">{nodes.length}</span></div>
                            <div className="bg-app/50 px-3 py-1 rounded-full border border-panel-border">Head: <span className="text-accent-text">{nodes[0]?.address || 'NULL'}</span></div>
                        </div>
                        
                        {/* Theme Switcher */}
                        <div className="flex bg-app rounded-full p-1 border border-panel-border shadow-inner">
                            <button 
                                onClick={() => setTheme('warm')}
                                className={`p-2 rounded-full transition-all ${theme === 'warm' ? 'bg-panel text-accent shadow-sm scale-105' : 'text-muted hover:text-main'}`}
                                title="Warm/Mild"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </button>
                            <button 
                                onClick={() => setTheme('dark')}
                                className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-panel text-accent shadow-sm scale-105' : 'text-muted hover:text-main'}`}
                                title="Dark Slate"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                            </button>
                            <button 
                                onClick={() => setTheme('light')}
                                className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-panel text-accent shadow-sm scale-105' : 'text-muted hover:text-main'}`}
                                title="Light Paper"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </button>
                             <button 
                                onClick={() => setTheme('midnight')}
                                className={`p-2 rounded-full transition-all ${theme === 'midnight' ? 'bg-panel text-accent shadow-sm scale-105' : 'text-muted hover:text-main'}`}
                                title="Midnight OLED"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden transition-colors duration-300">
                
                {/* Left Panel: Controls & Memory */}
                <aside 
                    className="bg-panel flex flex-col overflow-hidden flex-shrink-0 w-full border-r border-panel-border transition-colors duration-300"
                    style={{ width: isDesktop ? leftPanelWidth : '100%' }}
                >
                    <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                        
                        {/* Controls Section */}
                        <div className="mb-8">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2 pl-1">
                                <div className="w-1 h-4 bg-accent rounded-full"></div>
                                操作面板
                            </h2>
                            
                            <div className="flex flex-col gap-4">
                                {/* Input Layout */}
                                <div className="grid grid-cols-2 gap-3">
                                    <input 
                                        type="number" 
                                        placeholder="数值 (Val)" 
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="input-field"
                                    />
                                     <input 
                                        type="number" 
                                        placeholder="位置 (Pos)" 
                                        value={inputIndex}
                                        onChange={(e) => setInputIndex(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                
                                {/* Button Layout - Adaptive Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={insertAtHead} disabled={isAnimating} className="btn-primary">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                        头插法
                                    </button>
                                    <button onClick={insertAtEnd} disabled={isAnimating} className="btn-primary">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                                        尾插法
                                    </button>
                                    <button onClick={insertAtPosition} disabled={isAnimating} className="btn-primary col-span-2 opacity-90 bg-accent/90">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        指定位置插入
                                    </button>
                                    <div className="h-px bg-panel-border col-span-2 my-1"></div>
                                    <button onClick={deleteValue} disabled={isAnimating} className="btn-danger">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        按值删除
                                    </button>
                                    <button onClick={deleteAtEnd} disabled={isAnimating} className="btn-danger">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                        删尾
                                    </button>
                                    <button onClick={clearList} disabled={isAnimating} className="col-span-2 btn-secondary">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                        清空链表
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Memory Section */}
                        <div>
                            <MemoryGrid blocks={memory} />
                        </div>
                    </div>
                </aside>

                {/* Resizer Handle Left */}
                <ResizeHandle onMouseDown={() => setIsDraggingLeft(true)} />

                {/* Center Panel: Visualizer */}
                <div className="flex-1 flex flex-col bg-app relative overflow-hidden min-w-[300px] transition-colors duration-300 group">
                    
                    {/* Zoom Controls Overlay */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-panel/80 backdrop-blur border border-panel-border rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={() => setVisualizerZoom(Math.max(0.2, visualizerZoom - 0.1))}
                            className="p-1.5 text-muted hover:text-main hover:bg-accent/20 rounded-full transition-colors"
                            title="Zoom Out"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                        </button>
                        <span className="text-xs font-mono w-12 text-center select-none text-muted">{Math.round(visualizerZoom * 100)}%</span>
                        <button 
                            onClick={() => setVisualizerZoom(Math.min(2.0, visualizerZoom + 0.1))}
                            className="p-1.5 text-muted hover:text-main hover:bg-accent/20 rounded-full transition-colors"
                            title="Zoom In"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                        <div className="w-px h-4 bg-panel-border mx-1"></div>
                        <button 
                            onClick={() => setVisualizerZoom(1)}
                            className="p-1.5 text-muted hover:text-main hover:bg-accent/20 rounded-full transition-colors"
                            title="Reset Zoom"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </button>
                    </div>

                    {/* Visualizer Area */}
                    <div className="flex-1 overflow-auto p-8 flex items-center justify-center min-h-[300px] custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                        <div 
                            className="flex flex-wrap items-start justify-start gap-y-12 w-full transition-transform duration-200 origin-top-left"
                            style={{ transform: `scale(${visualizerZoom})`, width: `${100/visualizerZoom}%` }}
                        >
                            {nodes.length === 0 ? (
                                <div className="flex items-center justify-center w-full h-64">
                                    <div className="text-muted text-lg border-2 border-dashed border-panel-border rounded-xl p-12 flex flex-col items-center justify-center transition-colors bg-panel/50 backdrop-blur-sm">
                                        <span className="text-5xl mb-4 opacity-20">∅</span>
                                        <p>链表为空</p>
                                        <p className="text-sm mt-2 opacity-40 font-mono">head = nullptr</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start overflow-visible pb-20 mx-auto">
                                    {/* Head Pointer Visual */}
                                    <div className="mr-6 flex flex-col items-center pt-8 flex-shrink-0">
                                        <span className="text-xs font-bold text-accent-text mb-1 tracking-widest">HEAD</span>
                                        <div className="w-0.5 h-8 bg-accent"></div>
                                        <div className="w-2 h-2 bg-accent rounded-full -mt-1 shadow-[0_0_10px_rgba(var(--accent),0.5)]"></div>
                                    </div>
                                    <div className="flex flex-wrap gap-y-12 items-start">
                                        {nodes.map((node, index) => (
                                            <LinkedListNode 
                                                key={node.id} 
                                                node={node} 
                                                isLast={index === nodes.length - 1} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Console Logs (Bottom of Center) */}
                    <div className="h-40 bg-panel border-t border-panel-border flex flex-col flex-shrink-0 transition-colors duration-300">
                        <div className="px-4 py-1.5 border-b border-panel-border flex justify-between items-center bg-panel/90 sticky top-0 backdrop-blur-sm">
                            <span className="text-[10px] font-bold uppercase text-muted tracking-wider flex items-center gap-2">
                                 <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> 系统日志
                            </span>
                            <button onClick={() => setLogs([])} className="text-[10px] text-muted hover:text-main transition-colors">清除</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 custom-scrollbar">
                            {logs.map((log) => (
                                <div key={log.id} className={`flex gap-3 transition-all hover:bg-app/50 p-0.5 rounded ${
                                    log.type === 'error' ? 'text-error' : 
                                    log.type === 'success' ? 'text-success' : 
                                    log.type === 'warning' ? 'text-warning' : 'text-muted'
                                }`}>
                                    <span className="opacity-40 w-14 shrink-0">[{new Date(log.timestamp).toLocaleTimeString('zh-CN').split(' ')[0]}]</span>
                                    <span>{log.message}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>

                {/* Resizer Handle Right */}
                <ResizeHandle onMouseDown={() => setIsDraggingRight(true)} />

                {/* Right Panel: Code & Structs */}
                <aside 
                    className="bg-panel flex flex-col overflow-hidden flex-shrink-0 w-full border-l border-panel-border transition-colors duration-300"
                    style={{ width: isDesktop ? rightPanelWidth : '100%' }}
                >
                     {/* Code Display (Top Half) */}
                     <div className="flex-1 p-5 overflow-y-auto border-b border-panel-border flex flex-col custom-scrollbar min-h-0">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2 pl-1">
                                <div className="w-1 h-4 bg-accent rounded-full"></div>
                                <span>代码执行追踪</span>
                                {currentSnippet && <span className="text-[10px] bg-accent/10 text-accent-text px-2 py-0.5 rounded-full border border-accent/30">C++</span>}
                            </h2>
                            <FontControl 
                                onDecrease={() => setCodeFontSize(Math.max(10, codeFontSize - 1))}
                                onIncrease={() => setCodeFontSize(Math.min(24, codeFontSize + 1))}
                            />
                        </div>
                        
                        <div className="flex-1 overflow-auto">
                            {currentSnippet ? (
                                <CodeBlock code={currentSnippet} activeLine={activeLine} fontSize={codeFontSize} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted text-xs italic border border-dashed border-panel-border rounded-xl">
                                    等待操作指令...
                                </div>
                            )}
                        </div>
                     </div>

                     {/* Struct Display (Bottom Half) */}
                     <div className="flex-1 p-5 flex flex-col bg-app/50 min-h-0 overflow-hidden">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center justify-between pl-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-accent rounded-full"></div>
                                    <span>数据结构定义</span>
                                </div>
                                <span className="text-[10px] text-accent font-mono bg-accent/10 px-2 rounded-full">Live State</span>
                            </h2>
                             <FontControl 
                                onDecrease={() => setStructFontSize(Math.max(10, structFontSize - 1))}
                                onIncrease={() => setStructFontSize(Math.min(24, structFontSize + 1))}
                            />
                        </div>
                        
                        <div className="bg-panel border border-panel-border rounded-xl p-0 flex-1 overflow-hidden shadow-inner transition-all flex flex-col">
                             <div className="flex-1 overflow-auto custom-scrollbar">
                                <CodeBlock 
                                    code={getStructCode()} 
                                    activeLine={-1} 
                                    fontSize={structFontSize} 
                                />
                             </div>
                        </div>
                     </div>
                </aside>

            </main>
        </div>
    </div>
  );
}

export default App;
