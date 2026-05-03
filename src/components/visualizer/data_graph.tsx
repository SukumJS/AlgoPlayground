"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useCallback } from "react";
import { useReactFlow, XYPosition } from "@xyflow/react";
import { OnDropAction, useDnD, useDnDPosition } from "./useDnD";
import RandomSize from "../shared/randomSize";

let id = 0;
const getId = () => `dndnode_${id++}`;

/** Algorithms that only need a Start Vertex (MST algorithms) */
const START_ONLY_ALGORITHMS = ["prims"];
/** Algorithms that need no vertex input at all (auto-start MST) */
const AUTO_ALGORITHMS = ["kruskals"];

interface DataGraphProps {
  /** Called when user clicks Search — starts the algorithm */
  onSearch?: (startLabel: string, endLabel: string) => void;
  /** Algorithm slug from URL (e.g. "breadth-first-search") */
  algorithm?: string;
  /** Whether the component is in tutorial mode */
  tutorialMode?: boolean;
  /** Callback to update explanation text */
  setExplanation?: React.Dispatch<React.SetStateAction<string>>;
  /** True while the algorithm animation is running — locks all interactions */
  isAnimating?: boolean;
  /** Called when user clicks + in Random Size — generates random graph */
  onRandomGenerate?: (count: number) => void;
  /** Called when user clicks Reset All */
  onResetGraph?: () => void;
}

function Data_graph({
  onSearch,
  algorithm = "",
  isAnimating = false,
  onRandomGenerate,
  onResetGraph,
}: DataGraphProps) {
  const [isDataSortOpen, setIsDataSortOpen] = useState(false);
  const { onDragStart, isDragging } = useDnD();
  // The type of the node that is being dragged.
  const [type, setType] = useState<string | null>(null);
  const { setNodes, getNodes } = useReactFlow();
  const [inputValue, setInputValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [removeValue, setRemoveValue] = useState<string>("");
  const [nodeInput, setNodeInput] = useState<string>("");
  const [draggedValue, setDraggedValue] = useState<number | null>(null); // Added draggedValue state

  const needsEndVertex =
    !START_ONLY_ALGORITHMS.includes(algorithm) &&
    !AUTO_ALGORITHMS.includes(algorithm);
  const needsStartVertex = !AUTO_ALGORITHMS.includes(algorithm);
  const isMST =
    START_ONLY_ALGORITHMS.includes(algorithm) ||
    AUTO_ALGORITHMS.includes(algorithm);

  const generateSingleSampleNumber = useCallback(
    (currentSamples: { number: string }[]) => {
      const usedLabels = new Set(getNodes().map((n) => String(n.data?.label)));
      // Also avoid other sample numbers
      for (const s of currentSamples) usedLabels.add(s.number);
      let candidate: number;
      let tries = 0;
      do {
        candidate = Math.floor(Math.random() * 99) + 1;
        tries++;
      } while (usedLabels.has(String(candidate)) && tries < 500);
      return String(candidate);
    },
    [getNodes],
  );

  const [sampleNumbers, setSampleNumbers] = useState(() => {
    const nums = new Set<number>();
    while (nums.size < 5) {
      nums.add(Math.floor(Math.random() * 99) + 1);
    }
    return Array.from(nums).map((n) => ({ number: String(n) }));
  });

  const createAddNewNode = useCallback(
    (value: number, sampleIndex?: number): OnDropAction => {
      return ({ position }: { position: XYPosition }) => {
        // Block drag-drop during animation
        if (isAnimating) return;

        // Prevent duplicate labels
        const existingLabels = new Set(
          getNodes().map((n) => String(n.data?.label)),
        );
        if (existingLabels.has(value.toString())) return;

        const newNode = {
          id: getId(),
          type: "custom",
          position,
          data: { label: value.toString(), variant: "circle" },
        };

        setNodes((nds) => nds.concat(newNode));
        setType(null);

        // Regenerate only the dragged sample number
        if (sampleIndex !== undefined) {
          setSampleNumbers((prev) =>
            prev.map((item, i) =>
              i === sampleIndex
                ? { number: generateSingleSampleNumber(prev) }
                : item,
            ),
          );
        }
      };
    },
    [setNodes, setType, isAnimating, getNodes, generateSingleSampleNumber],
  );

  //reset all of value in input data
  const handleReset = () => {
    setInputValue("");
    setSearchValue("");
    setRemoveValue("");
    onResetGraph?.();
  };

  const handleSearch = () => {
    if (isAnimating) return;
    // Kruskal's doesn't need any vertex input; Prim's only needs start
    if (needsStartVertex && !inputValue) return;
    onSearch?.(inputValue, searchValue);
  };

  return (
    <>
      {/* The ghost node will be rendered at pointer position when dragging. */}
      {isDragging && <DragGhost type={type} value={draggedValue} />}{" "}
      {/* Pass draggedValue */}
      <button
        className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${isDataSortOpen ? "bg-gray-200 h-12" : "bg-white"}`}
        onClick={() => setIsDataSortOpen(!isDataSortOpen)}
      >
        <div className="flex items-center">
          <div
            className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${isDataSortOpen ? "" : "hidden opacity-100"}`}
          ></div>
          <div className={`flex text-lg p-2`}>Data</div>
        </div>
        <div className="mr-2 flex justify-end">
          {isDataSortOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </button>
      {/* map drag and drop data */}
      <div
        className={`flex-col ${isAnimating ? "pointer-events-none" : ""}`}
        style={{
          opacity: isAnimating ? 0.2 : isDataSortOpen ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <div
          className={`transition-all duration-300 ease-in-out overflow-x-auto flex gap-2 mb-2 px-2 py-2`}
        >
          <div
            className="shrink-0 flex justify-center items-center border-2 border-[#5D5D5D] bg-[#D9E363] w-16 h-16 rounded-full cursor-grab"
            onPointerDown={(event) => {
              setType("custom"); // Changed drag ghost type to "custom"
              setDraggedValue(parseInt(nodeInput) || 0); // Set dragged value
              onDragStart(event, createAddNewNode(parseInt(nodeInput) || 0));
            }}
          >
            <input
              type="number"
              placeholder="N"
              className="w-10 h-full rounded-lg bg-transparent text-center text-[#222121] font-semibold text-2xl focus:outline-none placeholder:text-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={nodeInput}
              onChange={(e) => setNodeInput(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
          {sampleNumbers.map((item, index) => (
            <div
              key={index}
              className="shrink-0 w-16 h-16 rounded-full flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 border-[#5D5D5D] bg-[#D9E363]"
              onPointerDown={(event) => {
                setType("custom"); // Changed drag ghost type to "custom"
                setDraggedValue(parseInt(item.number)); // Set dragged value
                onDragStart(
                  event,
                  createAddNewNode(parseInt(item.number), index),
                );
              }}
            >
              {item.number}
            </div>
          ))}
        </div>
        <RandomSize onReset={handleReset} onAdd={onRandomGenerate} />
        <hr className="border-t border-[#5D5D5D]/20 my-6 mx-2" />
        <div className="flex flex-col gap-2 px-2">
          {needsStartVertex && (
            <div className="flex flex-col gap-1 text-start">
              <p className="font-bold text-md">Start Vertex</p>
              <input
                type="number"
                className="border border-gray-200 p-2 rounded-lg w-full placeholder:text-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isAnimating}
                placeholder="e.g. 1"
              />
            </div>
          )}
          {needsEndVertex && (
            <div className="flex flex-col gap-1 text-start">
              <p className="font-bold text-md">End Vertex</p>
              <input
                type="number"
                className="border border-gray-200 p-2 rounded-lg w-full placeholder:text-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                disabled={isAnimating}
                placeholder="e.g. 5"
              />
            </div>
          )}
          <button
            className="bg-[#222121] rounded-lg p-2 mt-1 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSearch}
            disabled={
              isAnimating ||
              (needsEndVertex
                ? !inputValue || !searchValue
                : needsStartVertex
                  ? !inputValue
                  : false)
            }
          >
            {isMST ? "Find MST" : "Search"}
          </button>
        </div>
      </div>
    </>
  );
}

export default Data_graph;

interface DragGhostProps {
  type: string | null;
  value: number | null; // Added value prop
}

// The DragGhost component is used to display a ghost node when dragging a node into the flow.
export function DragGhost({ type, value }: DragGhostProps) {
  // Added value prop
  const { position } = useDnDPosition();

  if (!position || !type) return null; // Added !type check

  return (
    <div
      className={`fixed top-0 left-0 pointer-events-none z-1000 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#5D5D5D] bg-[#D9E363] text-center text-2xl font-semibold text-[#222121] shadow-lg`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
      }}
    >
      {value} {/* Display value */}
    </div>
  );
}
