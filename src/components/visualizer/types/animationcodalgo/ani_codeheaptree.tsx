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
  currentStep?: number;
  stepToCodeLine?: number[];
  treeAction?: string | null;
}

export default function CodeHeapTreeView({
  title = "Code",
  code = "",
  language = "python",
  tutorialMode = false,
  currentStep,
  stepToCodeLine,
  treeAction,
}: CodeBlockProps) {
  const [isCodeOpen, setIsCodeOpen] = useState<boolean>(false);

  const defaultCode = useMemo(() => {
    const action = treeAction ?? "heap";
    if (action === "heap-insert") {
      return `ALGORITHM HeapInsert(heap, value)
    PLACE value at next empty position (level-order)
    i = index of inserted node
    WHILE i > 0 AND heap property violated DO
        SWAP heap[i] with heap[parent(i)]
        i = parent(i)
    END WHILE
END ALGORITHM`;
    }
    if (action === "heap-search") {
      return `ALGORITHM HeapSearch(heap, value)
    QUEUE = [root]
    WHILE QUEUE is not empty DO
        node = POP_FRONT(QUEUE)
        IF node.value == value THEN
            RETURN FOUND
        END IF
        PUSH children into QUEUE
    END WHILE
    RETURN NOT_FOUND
END ALGORITHM`;
    }
    if (action === "heap-remove") {
      return `ALGORITHM HeapRemove(heap, value)
    SEARCH target by level-order
    REPLACE target with last node
    i = index of replaced node
    WHILE heap property violated DO
        SWAP with best child (or parent)
        i = new index
    END WHILE
END ALGORITHM`;
    }

    return `ALGORITHM Heap(heap)
    INSERT / SEARCH / REMOVE
END ALGORITHM`;
  }, [treeAction]);

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
