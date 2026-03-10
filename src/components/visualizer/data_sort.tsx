"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useCallback } from "react";
import { useReactFlow, XYPosition, Node } from "@xyflow/react";
import { OnDropAction, useDnD, useDnDPosition } from "./useDnD";
import RandomSize from "../shared/randomSize";

let id = 0;
const getId = () => `dndnode_${id++}`;

type nodeProps = {
  nodeInput: number | string;
  setNodeInput:
    | React.Dispatch<React.SetStateAction<number | string>>
    | ((val: number | string) => void);

  // tutorial
  tutorialMode?: boolean;
  onTutorialDropSuccess?: () => void;

  // search
  targetValue?: number | string;
  // รับค่า isRunning มาจากหน้าหลัก
  setTargetValue?: (val: number | string) => void;

  isRunning?: boolean;
};

function Data_sort({
  nodeInput,
  setNodeInput,
  tutorialMode,
  onTutorialDropSuccess,
  targetValue,
  setTargetValue,
  isRunning,
}: nodeProps) {
  // ตั้งค่าเริ่มต้นให้เปิดแท็บอัตโนมัติถ้าเป็น Tutorial
  const [isDataSortOpen, setIsDataSortOpen] = useState(
    tutorialMode ? true : false,
  );
  const [prevTutorialMode, setPrevTutorialMode] = useState(tutorialMode);

  // ดักจับเผื่อค่า tutorialMode โหลดตามมาทีหลัง
  if (tutorialMode !== prevTutorialMode) {
    setPrevTutorialMode(tutorialMode);
    if (tutorialMode) {
      setIsDataSortOpen(true);
    }
  }

  const { setNodes } = useReactFlow();
  const { onDragStart, isDragging } = useDnD();

  const [type, setType] = useState<string | null>(null);
  const [draggedValue, setDraggedValue] = useState<number | null>(null);

  const createAddNewNode = useCallback(
    (sampleValue: number): OnDropAction => {
      return ({ position }: { position: XYPosition }) => {
        setNodes((prev) => {
          const currentIndex = prev.length;

          const newNode: Node = {
            id: getId(),
            type: "custom",
            position: { x: currentIndex * 65, y: 5 },
            data: {
              value: sampleValue,
              status: "idle",
              index: currentIndex,
            },
          };

          return prev.concat(newNode);
        });

        setType(null);
        setDraggedValue(null);

        // tutorial step
        if (onTutorialDropSuccess) {
          onTutorialDropSuccess();
        }
      };
    },
    [setNodes, onTutorialDropSuccess],
  );

  const generateDiverseArray = (count: number) => {
    const scenario = Math.floor(Math.random() * 4);
    let arr: number[] = [];

    switch (scenario) {
      case 0: // 1. Reversed: เรียงจากมากไปน้อย (Worst Case)
        arr = Array.from(
          { length: count },
          (_, i) => Math.floor(((count - i) / count) * 90) + 10,
        );
        break;

      case 1: // 2. Nearly Sorted: เรียงเกือบเป๊ะ (สลับแค่บางตัว)
        arr = Array.from(
          { length: count },
          (_, i) => Math.floor((i / count) * 90) + 10,
        );

        for (let i = 0; i < Math.max(1, count * 0.2); i++) {
          const idx1 = Math.floor(Math.random() * count);
          const idx2 = Math.floor(Math.random() * count);
          [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
        }
        break;

      case 2: // 3. Few Unique: มีตัวเลขซ้ำกันเยอะๆ
        const uniquePool = [10, 40, 70, 90];
        arr = Array.from(
          { length: count },
          () => uniquePool[Math.floor(Math.random() * uniquePool.length)],
        );
        break;

      default: // 4. Random: สุ่มมั่วกระจายตัวปกติ
        arr = Array.from(
          { length: count },
          () => Math.floor(Math.random() * 95) + 5,
        );
        break;
    }

    return arr;
  };

  // generate random nodes
  const handleGenerateRandomNodes = useCallback(
    (count: number) => {
      if (count <= 0) return;

      const randomNumbers = generateDiverseArray(count);

      const newNodes: Node[] = randomNumbers.map((num, i) => ({
        id: getId(),
        type: "custom",
        position: { x: i * 65, y: 5 },
        data: {
          value: num,
          status: "idle",
          index: i,
        },
      }));

      setNodes(newNodes);
    },
    [setNodes],
  );

  // reset nodes
  const handleResetNodes = useCallback(() => {
    setNodes([]);
  }, [setNodes]);

  const Sample = [
    { number: "1" },
    { number: "2" },
    { number: "3" },
    { number: "4" },
    { number: "5" },
  ];

  return (
    <>
      {/* Ghost node following the pointer */}
      {isDragging && <DragGhost type={type} value={draggedValue} />}

      <button
        className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
          isDataSortOpen ? "bg-gray-200 h-12" : "bg-white"
        }`}
        onClick={() => setIsDataSortOpen(!isDataSortOpen)}
      >
        <div className="flex items-center">
          <div
            className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${
              isDataSortOpen ? "" : "hidden opacity-0"
            }`}
          ></div>

          <div className="flex text-lg p-2">Data</div>
        </div>

        <div className="mr-2 flex justify-end">
          {isDataSortOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </button>

      <div
        className={`flex-col transition-opacity duration-300 ${
          isDataSortOpen
            ? "opacity-100 h-auto"
            : "opacity-0 h-0 overflow-hidden"
        }`}
      >
        <div className="overflow-x-auto flex gap-2 mb-2 p-2">
          {/* Input Node */}
          <div
            data-tutorial-target="sidebar-sort-node"
            className="shrink-0 flex justify-center items-center border-2 border-[#5D5D5D] bg-[#D9E363] w-14 h-14 rounded-lg cursor-grab"
            onPointerDown={(event) => {
              if (isRunning) return;
              const value = Number(nodeInput) || 0;
              setType("input");
              setDraggedValue(value);
              onDragStart(event, createAddNewNode(value));
            }}
          >
            <input
              type="number"
              placeholder="0"
              disabled={isRunning}
              className="w-10 h-full rounded-lg bg-transparent text-center text-[#222121] font-semibold text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={nodeInput}
              onChange={(e) => {
                if (typeof setNodeInput === "function") {
                  setNodeInput(
                    e.target.value === "" ? "" : Number(e.target.value),
                  );
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>

          {/* Sample nodes */}
          {Sample.map((item, index) => (
            <div
              key={index}
              className="shrink-0 w-14 h-14 rounded-lg flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 border-[#5D5D5D] bg-[#D9E363] cursor-grab"
              onPointerDown={(event) => {
                if (isRunning) return;
                const value = parseInt(item.number);
                setType("custom");
                setDraggedValue(value);
                onDragStart(event, createAddNewNode(value));
              }}
            >
              {item.number}
            </div>
          ))}
        </div>

        {/* Random generator */}
        <div
          className={`flex justify-center items-center text-center p-2 w-full transition-all ${
            isRunning ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <RandomSize
            onAdd={handleGenerateRandomNodes}
            onReset={handleResetNodes}
          />
        </div>

        {/* Target Value (ใช้เฉพาะ Search) */}
        {targetValue !== undefined && setTargetValue && (
          <div className="p-3 border-t border-gray-300">
            <label className="font-bold text-md mb-2 text-start m-1 gap-2">
              Target Value
            </label>

            <input
              type="number"
              value={targetValue}
              disabled={isRunning}
              onChange={(e) =>
                setTargetValue(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="mt-2 border border-gray-200 p-2 rounded-lg w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        )}
      </div>
    </>
  );
}

export default Data_sort;

interface DragGhostProps {
  type: string | null;
  value: number | null;
}

export function DragGhost({ type, value }: DragGhostProps) {
  const { position } = useDnDPosition();

  if (!position || !type) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[1000] flex h-14 w-14 items-center justify-center rounded-lg border-2 border-[#5D5D5D] bg-[#D9E363] text-center text-2xl font-semibold text-[#222121] shadow-lg"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
      }}
    >
      {value}
    </div>
  );
}
