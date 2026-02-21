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
        <button className={`flex border-b border-black text-lg p-2 justify-between transition-all duration-300 ease-in-out z-50 ${isCodeOpen ? "h-120" : "h-10" }`} onClick={() => setIsCodeOpen(!isCodeOpen)}>
            Code
            {isCodeOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
    )
}