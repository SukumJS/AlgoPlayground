"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  title?: string;
  code?: string;
  language?: string;
  tutorialMode?: boolean;
  currentStep?: number;
  stepToCodeLine?: number[];
}

export default function CodeStack({
  title = "Code",
  code = "",
  language = "python",
  tutorialMode = false,
  currentStep,
  stepToCodeLine,
}: CodeBlockProps) {
  const [isCodeOpen, setIsCodeOpen] = useState<boolean>(false);
  const [internalStepIdx, setInternalStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const defaultCode: string = `ALGORITHM StackOperation(stack, operation, value)
    IF operation == "push" THEN
        IF stack is full THEN
            RETURN OVERFLOW
        END IF
        top = top + 1
        stack[top] = value
    ELSE IF operation == "pop" THEN
        IF stack is empty THEN
            RETURN UNDERFLOW
        END IF
        removed = stack[top]
        top = top - 1
        RETURN removed
    END IF
END ALGORITHM`;

  const displayCode = (code || defaultCode).trim();

  const executionPath = useMemo(() => {
    const lines = displayCode.split("\n");
    const path: number[] = [];
    lines.forEach((line, index) => {
      if (line.trim().length > 0) path.push(index + 1);
    });
    return path;
  }, [displayCode]);

  const [prevDisplayCode, setPrevDisplayCode] = useState(displayCode);
  if (displayCode !== prevDisplayCode) {
    setPrevDisplayCode(displayCode);
    setInternalStepIdx(0);
    setIsPlaying(false);
  }

  const isExternallyControlled = typeof currentStep === "number";
  const externallyActiveLine =
    isExternallyControlled && stepToCodeLine && stepToCodeLine.length > 0
      ? stepToCodeLine[currentStep as number]
      : undefined;

  const derivedExternalIdx = useMemo(() => {
    if (
      !isExternallyControlled ||
      typeof externallyActiveLine !== "number" ||
      executionPath.length === 0
    ) {
      return 0;
    }
    const idxInPath = executionPath.indexOf(externallyActiveLine);
    return idxInPath === -1 ? 0 : idxInPath;
  }, [isExternallyControlled, externallyActiveLine, executionPath]);

  const currentStepIdx = isExternallyControlled
    ? derivedExternalIdx
    : internalStepIdx;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (!isExternallyControlled && isPlaying && executionPath.length > 0) {
      interval = setInterval(() => {
        setInternalStepIdx((prev) => {
          if (prev < executionPath.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExternallyControlled, isPlaying, executionPath]);

  const handleClick = () => {
    if (!tutorialMode) {
      setIsCodeOpen(!isCodeOpen);
    }
  };

  return (
    <div className="border-b ">
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
              key={displayCode}
              language={language}
              style={oneDark}
              wrapLines={true}
              wrapLongLines={true}
              showLineNumbers={true}
              showInlineLineNumbers={false}
              useInlineStyles={true}
              lineNumberStyle={{
                minWidth: "2.2em",
                paddingRight: "0.65em",
                textAlign: "right",
                color: "#6b7280",
                fontSize: "0.75rem",
                userSelect: "none",
                paddingTop: "2px",
              }}
              lineProps={(lineNumber: number) => {
                const activeLine =
                  typeof externallyActiveLine === "number"
                    ? externallyActiveLine
                    : executionPath[currentStepIdx];
                const isActive = lineNumber === activeLine;
                return {
                  style: {
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: isActive
                      ? "rgba(59, 130, 246, 0.26)"
                      : "rgba(255, 255, 255, 0.055)",
                    borderLeft: isActive
                      ? "3px solid rgba(147, 197, 253, 0.95)"
                      : "3px solid transparent",
                  },
                };
              }}
              lineNumberContainerStyle={{
                float: "unset",
                minWidth: "2.8em",
                paddingRight: "0.65em",
              }}
              customStyle={{
                margin: 0,
                padding: "8px 0",
                fontSize: "0.85rem",
                lineHeight: "1.5",
                background: "transparent",
                width: "100%",
                display: "flex",
              }}
              codeTagProps={{
                style: {
                  display: "block",
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  paddingTop: "4px",
                  paddingLeft: "0.35rem",
                  paddingRight: "0.35rem",
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
