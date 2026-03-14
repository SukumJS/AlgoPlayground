// "use client";
// import React, { useState, useEffect, useMemo } from "react";
// import { ChevronDown, ChevronUp } from "lucide-react";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// interface CodeBlockProps {
//   title?: string;
//   code?: string;
//   language?: string;
//   tutorialMode?: boolean;
//   /** If provided, drive the current step from an external sort engine */
//   currentStep?: number;
//   /** Optional mapping from step index -> code line number (1-based) */
//   stepToCodeLine?: number[];
// }

// export default function CodeAlgo({
//   title = "Code",
//   code = "",
//   language = "python", // ไม่เป็นปัญหากับ Pseudo Code เอาแค่สีกับ format มา
//   tutorialMode = false,
//   currentStep,
//   stepToCodeLine,
// }: CodeBlockProps) {
//   const [isCodeOpen, setIsCodeOpen] = useState<boolean>(false);
//   const [internalStepIdx, setInternalStepIdx] = useState<number>(0);
//   const [isPlaying, setIsPlaying] = useState<boolean>(false);

//   const defaultCode: string = `ALGORITHM BubbleSort(list)
//     n = length of list
//     FOR i FROM 0 TO n - 1 DO
//         FOR j FROM 0 TO n - i - 2 DO
//             IF list[j] > list[j + 1] THEN
//                 SWAP list[j] WITH list[j + 1]
//             END IF
//         END FOR
//     END FOR
// END ALGORITHM`;

//   const displayCode = (code || defaultCode).trim();

//   // เปลี่ยนเป็นระบบ Auto Step (รันตามบรรทัดที่มีเนื้อหาจริง)
//   const executionPath = useMemo(() => {
//     const lines = displayCode.split("\n");
//     const path: number[] = [];
//     lines.forEach((line, index) => {
//       // เพิ่มบรรทัดเข้า Path เฉพาะบรรทัดที่มีข้อความ (ไม่ว่างเปล่า)
//       if (line.trim().length > 0) {
//         path.push(index + 1);
//       }
//     });
//     return path;
//   }, [displayCode]);

//   const [prevDisplayCode, setPrevDisplayCode] = useState(displayCode);
//   if (displayCode !== prevDisplayCode) {
//     setPrevDisplayCode(displayCode);
//     setInternalStepIdx(0);
//     setIsPlaying(false);
//   }

//   const isExternallyControlled = typeof currentStep === "number";
//   const externallyActiveLine =
//     isExternallyControlled && stepToCodeLine && stepToCodeLine.length > 0
//       ? stepToCodeLine[currentStep as number]
//       : undefined;

//   // คำนวณ index ของบรรทัดที่ active จากภายนอกแบบ derived state (ไม่ใช้ setState ใน effect)
//   const derivedExternalIdx = useMemo(() => {
//     if (
//       !isExternallyControlled ||
//       typeof externallyActiveLine !== "number" ||
//       executionPath.length === 0
//     ) {
//       return 0;
//     }
//     const lineNumber = externallyActiveLine;
//     const idxInPath = executionPath.indexOf(lineNumber);
//     return idxInPath === -1 ? 0 : idxInPath;
//   }, [isExternallyControlled, externallyActiveLine, executionPath]);

//   const currentStepIdx = isExternallyControlled
//     ? derivedExternalIdx
//     : internalStepIdx;

//   // ถ้าไม่ได้ถูกควบคุมจากภายนอก ให้ใช้ระบบ Auto-play ภายใน
//   useEffect(() => {
//     let interval: ReturnType<typeof setInterval> | undefined;
//     if (!isExternallyControlled && isPlaying && executionPath.length > 0) {
//       interval = setInterval(() => {
//         setInternalStepIdx((prev) => {
//           if (prev < executionPath.length - 1) return prev + 1;
//           setIsPlaying(false);
//           return prev;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [isExternallyControlled, isPlaying, executionPath]);

//   const handleClick = () => {
//     if (!tutorialMode) {
//       setIsCodeOpen(!isCodeOpen);
//     }
//   };

//   return (
//     <div className="border-b ">
//       <button
//         className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
//           isCodeOpen ? "bg-gray-200 h-12" : "bg-white"
//         }`}
//         onClick={handleClick}
//       >
//         <div className="flex items-center">
//           <div
//             className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${
//               isCodeOpen ? "" : "hidden opacity-0"
//             }`}
//           ></div>
//           <div className={`flex text-lg p-2`}>{title}</div>
//         </div>
//         <div className="mr-2 flex justify-end">
//           {isCodeOpen ? <ChevronUp /> : <ChevronDown />}
//         </div>
//       </button>

//       <div
//         className={`grid transition-all duration-300 ease-in-out ${
//           isCodeOpen
//             ? "grid-rows-[1fr] opacity-100"
//             : "grid-rows-[0fr] opacity-0"
//         }`}
//       >
//         <div className="overflow-hidden bg-[#0d1117] flex flex-col">
//           <div className="relative">
//             <SyntaxHighlighter
//               key={`${displayCode}-${currentStepIdx}`}
//               language={language}
//               style={oneDark}
//               wrapLongLines={true}
//               showLineNumbers={true}
//               useInlineStyles={true}
//               lineNumberStyle={{
//                 minWidth: "2.2em",
//                 paddingRight: "0.6em",
//                 textAlign: "right",
//                 color: "#4b5563",
//                 fontSize: "0.75rem",
//                 userSelect: "none",
//                 verticalAlign: "top",
//                 paddingTop: "4px",
//                 display: "table-cell",
//               }}
//               lineProps={(lineNumber: number) => {
//                 // ถ้ามี mapping จาก progress ให้ไฮไลต์ตาม line นั้นเลย
//                 const activeLine =
//                   typeof externallyActiveLine === "number"
//                     ? externallyActiveLine
//                     : executionPath[currentStepIdx];
//                 return {
//                   style: {
//                     display: "table-row",
//                     backgroundColor:
//                       lineNumber === activeLine
//                         ? "rgba(59, 130, 246, 0.2)"
//                         : "transparent",
//                   },
//                 };
//               }}
//               customStyle={{
//                 margin: 0,
//                 padding: "8px 0",
//                 fontSize: "0.85rem",
//                 lineHeight: "1.5",
//                 background: "transparent",
//                 display: "table",
//                 minWidth: "100%",
//               }}
//               codeTagProps={{
//                 style: {
//                   display: "table-cell",
//                   width: "100%",
//                   whiteSpace: "pre-wrap",
//                   wordBreak: "break-all",
//                   paddingTop: "4px",
//                   paddingLeft: "0.5rem",
//                 },
//               }}
//             >
//               {displayCode}
//             </SyntaxHighlighter>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
