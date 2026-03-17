"use client";
import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  title?: string;
  code?: string;
  language?: string;
  tutorialMode?: boolean;
  algoType?: string | null;
  currentStep?: number;
  stepToCodeLine?: number[];
}

export default function CodePrimGraph({
  title = "Code",
  code = "",
  language = "python",
  tutorialMode = false,
  currentStep,
  stepToCodeLine,
}: CodeBlockProps) {
  const [isCodeOpen, setIsCodeOpen] = useState<boolean>(false);

  const defaultCode = useMemo(() => {
    return `ALGORITHM PrimMST(graph, start)
    MST = empty
    visited = {start}
    WHILE MST is not complete DO
        pick the minimum-weight edge that connects visited to unvisited
        add that edge to MST
        add the new node to visited
    END WHILE
    RETURN MST
END ALGORITHM`;
  }, []);

  const displayCode = (code || defaultCode).trim();

  const executionPath = useMemo(() => {
    const lines = displayCode.split("\n");
    const path: number[] = [];
    lines.forEach((line, index) => {
      if (line.trim().length > 0) path.push(index + 1);
    });
    return path;
  }, [displayCode]);

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

  const currentStepIdx = isExternallyControlled ? derivedExternalIdx : 0;

  const handleClick = () => {
    if (!tutorialMode) setIsCodeOpen(!isCodeOpen);
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
                const activeLine =
                  typeof externallyActiveLine === "number"
                    ? externallyActiveLine
                    : executionPath[currentStepIdx];
                return {
                  style: {
                    display: "table-row",
                    backgroundColor:
                      lineNumber === activeLine
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
