"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  title?: string;
  code?: string;
  language?: string;
}

export default function CodeAlgo({
  title = "Code",
  code = "",
  language = "python",
}: CodeBlockProps) {
  const [isCodeOpen, setIsCodeOpen] = useState<boolean>(true);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const defaultCode: string = `
   function inorder(root):
    if root is not null:
        inorder(root.left)
        print(root.val)
        inorder(root.right)
`;
  const displayCode = (code || defaultCode).trim();
  // คำนวณหาจำนวนบรรทัดทั้งหมดจากโค้ดจริง
  const steps = useMemo(() => {
    const lineCount = displayCode.split("\n").length;
    // สร้าง array [1, 2, 3, ..., lineCount]
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  }, [displayCode]);

  // รีเซ็ตตำแหน่งเมื่อเปลี่ยนโค้ดใหม่
  useEffect(() => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [displayCode]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps]);

  return (
    <div className="border-b border-black">
      <button
        onClick={() => setIsCodeOpen(!isCodeOpen)}
        className={`w-full flex items-center justify-between p-2 py-2 transition-all duration-500 border-l-3 ${
          isCodeOpen
            ? "bg-[#eeeeee] border-[#3b82f6] text-black"
            : "bg-white border-transparent text-black hover:bg-gray-50"
        }`}
      >
        <span className="text-lg">{title}</span>
        {isCodeOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isCodeOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden bg-[#0d1117] flex flex-col">
          <div className="flex items-center gap-1 px-4 py-1 bg-[#161b22] border-b border-gray-800">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => { setCurrentStepIdx(0); setIsPlaying(false); }}
                className="p-0 text-gray-400 hover:text-white transition"
              >
                <RotateCcw size={14} />
              </button>
              <button 
                onClick={() => setCurrentStepIdx(Math.max(0, currentStepIdx - 1))}
                className="p-1 text-gray-400 hover:text-white transition"
              >
                <SkipBack size={14} />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40 transition"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              </button>
              <button 
                onClick={() => setCurrentStepIdx(Math.min(steps.length - 1, currentStepIdx + 1))}
                className="p-1 text-gray-400 hover:text-white transition"
              >
                <SkipForward size={14} />
              </button>
            </div>
            <div className="h-4 w-[1px] bg-gray-700"></div>
            <span className="text-[10px] font-mono text-gray-400">
              Line: {steps[currentStepIdx]} ({currentStepIdx + 1}/{steps.length})
            </span>
          </div>

         <div className="relative">
            <SyntaxHighlighter
                key={`${displayCode}-${currentStepIdx}`}
                language={language}
                style={oneDark}
                wrapLongLines={true}
                showLineNumbers={true}
                useInlineStyles={true}
                lineNumberStyle={{
                  minWidth: '1', 
                  paddingRight: '0.5rem',
                  textAlign: 'right',
                  color: '#4b5563',
                  fontSize: '0.75rem',
                  userSelect: 'none',
                  verticalAlign: 'top',
                  paddingTop: '4px',
                  display: 'table-cell', // บังคับสถานะ cell
                }}
                lineProps={(lineNumber) => {
                  const activeLine = steps[currentStepIdx];
                  const isHighlighted = lineNumber === activeLine;
                  return {
                    style: {
                      backgroundColor: isHighlighted ? "rgba(59, 130, 246, 0.2)" : "transparent",
                    },
                  };
                }}
                customStyle={{
                  margin: 0,
                  padding: '4px 0',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  background: 'transparent',
                  overflowX: 'auto', 
                  borderLeft: 'none',
                  display: 'table',   
                  minWidth: '100%',    // ยืดตารางให้เต็มความกว้างขอบขวาสุด
                }}
                codeTagProps={{
                  style: {
                    display: 'table-cell',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    paddingTop: '4px',
                    paddingLeft: '0.4rem',
                    margin: 0,
                    width: '100%', 
                  }
                }}
              >
                {displayCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}