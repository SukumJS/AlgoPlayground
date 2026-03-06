"use client";
import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  title?: string;
  code?: string;
  language?: string;
  tutorialMode?: boolean;
  algorithm?: string | null;
  externalStep?: number | null;
  externalTotalSteps?: number | null;
  externalStepType?: "idle" | "compare" | "swap" | null;
}

export default function CodeAlgo({
  title = "Code",
  code = "",
  language = "python",
  tutorialMode = false,
  algorithm = null,
  externalStep = null,
  externalTotalSteps = null,
  externalStepType = null,
}: CodeBlockProps) {
  const [isCodeOpen, setIsCodeOpen] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const bubbleSortCode: string = `ALGORITHM BubbleSort(list)
    n = length of list
    FOR i FROM 0 TO n - 1 DO
        FOR j FROM 0 TO n - i - 2 DO
            IF list[j] > list[j + 1] THEN
                SWAP list[j] WITH list[j + 1]`;

  const pickDefaultCodeByAlgorithm = () => {
    return bubbleSortCode;
  };

  const displayCode = (code || pickDefaultCodeByAlgorithm()).trim();

  // --- ส่วนแก้ไข: State Reset Pattern (สมบูรณ์) ---
  const [prevDisplayCode, setPrevDisplayCode] = useState(displayCode);

  // เช็คและ Reset ค่าทันทีระหว่าง Render
  if (displayCode !== prevDisplayCode) {
    setPrevDisplayCode(displayCode);
    setCurrentStepIdx(0);
  }
  // --------------------------------------------------

  // เตรียม path ของบรรทัด
  const executionPath = useMemo(() => {
    const lines = displayCode.split("\n");
    const path: number[] = [];
    lines.forEach((line, index) => {
      if (line.trim().length > 0) {
        path.push(index + 1);
      }
    });
    return path;
  }, [displayCode]);

  // คำนวณ activeLines
  const activeLines = useMemo(() => {
    if (algorithm === "bubble-sort" && externalStepType) {
      switch (externalStepType) {
        case "compare":
          return [3, 4, 5];
        case "swap":
          return [6];
        case "idle":
        default:
          return [1, 2];
      }
    }

    const activeLine = executionPath[currentStepIdx];
    return activeLine ? [activeLine] : [];
  }, [algorithm, externalStepType, executionPath, currentStepIdx]);

  const handleClick = () => {
    if (!tutorialMode) {
      setIsCodeOpen(!isCodeOpen);
    }
  };

  return (
    <div className="border-b">
      <button
        className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
          isCodeOpen ? "bg-gray-200 h-12" : "bg-white"
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center">
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
          isCodeOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden bg-[#0d1117] flex flex-col">
          <div className="relative">
            <SyntaxHighlighter
              key={`${displayCode}-${currentStepIdx}`}
              language={language}
              style={oneDark}
              wrapLongLines={true}
              showLineNumbers={true}
              useInlineStyles={true}
              lineNumberStyle={{
                minWidth: "2.2em",
                paddingRight: "0.6em",
                textAlign: "right",
                color: "#4b5563",
                fontSize: "0.75rem",
                userSelect: "none",
                verticalAlign: "top",
                paddingTop: "4px",
                display: "table-cell",
              }}
              lineProps={(lineNumber: number) => {
                const isActive = activeLines.includes(lineNumber);
                return {
                  style: {
                    display: "table-row",
                    backgroundColor: isActive
                      ? "rgba(59, 130, 246, 0.2)"
                      : "transparent",
                  },
                };
              }}
              customStyle={{
                margin: 0,
                padding: "8px 0",
                fontSize: "0.85rem",
                lineHeight: "1.5",
                background: "transparent",
                display: "table",
                minWidth: "100%",
              }}
              codeTagProps={{
                style: {
                  display: "table-cell",
                  width: "100%",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  paddingTop: "4px",
                  paddingLeft: "0.5rem",
                },
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
