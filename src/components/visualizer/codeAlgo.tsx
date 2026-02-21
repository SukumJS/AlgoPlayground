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

  const defaultCode: string = `class Node:
    def __init__(self, key):
        self.left = None
        self.right = None
        self.val = key

def insert(root, key):
    # ถ้า Tree ว่าง ให้สร้าง Node ใหม่เป็น Root
    if root is None:
        return Node(key)
    
    # ถ้าค่าที่จะใส่ น้อยกว่าค่าใน Node ปัจจุบัน ให้ไปทางซ้าย
    if key < root.val:
        root.left = insert(root.left, key)
    # ถ้ามากกว่า ให้ไปทางขวา
    else:
        root.right = insert(root.right, key)
    return root

def inorder_traversal(root):
    # การอ่านค่าแบบเรียงจากน้อยไปมาก (ซ้าย -> ราก -> ขวา)
    res = []
    if root:
        res = inorder_traversal(root.left)
        res.append(root.val)
        res.extend(inorder_traversal(root.right))
    return res

# ตัวอย่างการใช้งาน
root = Node(50)
root = insert(root, 30)
root = insert(root, 20)
root = insert(root, 40)
root = insert(root, 70)

print("In-order traversal:", inorder_traversal(root))`;

  const displayCode = (code || defaultCode).trim();

  // เปลี่ยนเป็นระบบ Auto Step (รันตามบรรทัดที่มีเนื้อหาจริง)
  const executionPath = useMemo(() => {
    const lines = displayCode.split("\n");
    const path: number[] = [];
    lines.forEach((line, index) => {
      // เพิ่มบรรทัดเข้า Path เฉพาะบรรทัดที่มีข้อความ (ไม่ว่างเปล่า)
      if (line.trim().length > 0) {
        path.push(index + 1);
      }
    });
    return path;
  }, [displayCode]);

  useEffect(() => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [displayCode]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && executionPath.length > 0) {
      interval = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev < executionPath.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, executionPath]);

  return (
    <div className="border-b ">
     <button
        className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
          isCodeOpen ? "bg-gray-200 h-12" : "bg-white"
        }`}
        onClick={() => setIsCodeOpen(!isCodeOpen)}
      >
        <div className="flex items-center">
          {/* Blue highlight indicator */}
          <div
            className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${
              isCodeOpen ? "" : "hidden opacity-0"
            }`}
          ></div>
          <div className={`flex text-lg p-2`}>{title}</div>
        </div>
        <div className="mr-2 flex justify-end">
          {isCodeOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isCodeOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden bg-[#0d1117] flex flex-col">
          <div className="flex items-center gap-1 px-4 py-1 bg-[#161b22] border-b border-gray-800">
            <div className="flex items-center gap-1">
              <button onClick={() => { setCurrentStepIdx(0); setIsPlaying(false); }} className="p-1 text-gray-400 hover:text-white transition"><RotateCcw size={14} /></button>
              <button onClick={() => setCurrentStepIdx(Math.max(0, currentStepIdx - 1))} className="p-1 text-gray-400 hover:text-white transition"><SkipBack size={14} /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="p-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40 transition">
                {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              </button>
              <button onClick={() => setCurrentStepIdx(Math.min(executionPath.length - 1, currentStepIdx + 1))} className="p-1 text-gray-400 hover:text-white transition"><SkipForward size={14} /></button>
            </div>
            <div className="h-4 w-[1px] bg-gray-700 mx-2"></div>
            <span className="text-[10px] font-mono text-gray-400">
              Step: {currentStepIdx + 1}/{executionPath.length || 1}
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
                minWidth: '2.2em',
                paddingRight: '0.6em',
                textAlign: 'right',
                color: '#4b5563',
                fontSize: '0.75rem',
                userSelect: 'none',
                verticalAlign: 'top',
                paddingTop: '4px',
                display: 'table-cell',
              }}
              lineProps={(lineNumber) => {
                const activeLine = executionPath[currentStepIdx];
                return {
                  style: {
                    display: "table-row",
                    backgroundColor: lineNumber === activeLine ? "rgba(59, 130, 246, 0.2)" : "transparent",
                  },
                };
              }}
              customStyle={{
                margin: 0,
                padding: '8px 0',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                background: 'transparent',
                display: 'table',
                minWidth: '100%',
              }}
              codeTagProps={{
                style: {
                  display: 'table-cell',
                  width: '100%',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  paddingTop: '4px',
                  paddingLeft: '0.5rem',
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