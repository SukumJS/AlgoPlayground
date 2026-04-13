"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useCallback } from "react";
import { useReactFlow, XYPosition, Node, useNodes } from "@xyflow/react";
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
  setTargetValue?: (val: number | string) => void;

  // รับค่า isRunning มาจากหน้าหลัก
  isRunning?: boolean;
  algorithm?: string;
};

function Data_sort({
  nodeInput,
  setNodeInput,
  tutorialMode,
  onTutorialDropSuccess,
  targetValue,
  setTargetValue,
  isRunning,
  algorithm,
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

  const { setNodes, getNodes } = useReactFlow();
  const { onDragStart, isDragging } = useDnD();

  // ดึงข้อมูลกล่องแบบ Real-time มาเพื่อเช็คยอดรวม
  const nodes = useNodes();
  const isFull = nodes.length >= 50;
  // ถ้ากำลังรันอัลกออยู่ หรือ กล่องเต็ม 50 แล้ว ให้ล็อกการลาก
  const disableDrag = isRunning || isFull;

  const [type, setType] = useState<string | null>(null);
  const [draggedValue, setDraggedValue] = useState<number | null>(null);

  // สร้าง State สำหรับ Sample Nodes (เริ่มด้วยค่า 1-5 แบบเดิม หรือค่าสุ่มก็ได้)
  const [sampleNodes, setSampleNodes] = useState<number[]>([1, 2, 3, 4, 5]);

  const createAddNewNode = useCallback(
    (sampleValue: number, sampleIndex?: number): OnDropAction => {
      return ({ position }: { position: XYPosition }) => {
        setNodes((prev) => {
          // ถ้าเต็ม 50 แล้ว ให้ยกเลิกการวางกล่อง
          if (prev.length >= 50) return prev;

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

        // สุ่มค่าใหม่มาแทนที่ใน Sample Nodes ถ้ามีการลากจากกล่อง Sample
        if (sampleIndex !== undefined) {
          setSampleNodes((prev) => {
            const newSamples = [...prev];
            newSamples[sampleIndex] = Math.floor(Math.random() * 99) + 1;
            return newSamples;
          });
        }

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

  // ฟังก์ชันสุ่มตัวเลขสำหรับ Binary Search (ห้ามซ้ำ และ เรียงจากน้อยไปมาก)
  // รับ existingValues มาเช็คด้วย
  const generateBinarySearchArray = (
    count: number,
    existingValues: Set<number>,
  ) => {
    const uniqueNumbers = new Set<number>();

    // สุ่มไปเรื่อยๆ จนกว่าจะได้เลขครบจำนวน
    while (uniqueNumbers.size < count) {
      // สุ่มเลข 1 - 100
      const randomNum = Math.floor(Math.random() * 100) + 1;

      // เช็คว่าเลขนี้ต้อง "ไม่ซ้ำกับของเก่าบนจอ" ถึงจะเอาเข้า Set ได้
      if (!existingValues.has(randomNum)) {
        uniqueNumbers.add(randomNum);
      }
    }

    // แปลง Set เป็น Array แล้วเรียงจากน้อยไปมาก
    return Array.from(uniqueNumbers).sort((a, b) => a - b);
  };

  // generate random nodes
  const handleGenerateRandomNodes = useCallback(
    (count: number) => {
      if (count <= 0) return;

      const currentNodes = getNodes();

      // คำนวณพื้นที่ที่เหลืออยู่ (รับได้สูงสุด 50)
      const availableSpace = 50 - currentNodes.length;

      if (availableSpace <= 0) return;

      // สร้างกล่องเท่าที่พื้นที่เหลือรับไหว (เช่น ขอ 10 แต่เหลือที่แค่ 2 ก็สร้าง 2)
      const actualCount = Math.min(count, availableSpace);

      // สกัดเอาเฉพาะ "ตัวเลข" จากกล่องบนจอมาเก็บไว้ใน Set
      const existingValues = new Set(
        currentNodes.map((node) => Number(node.data.value)),
      );

      // ใช้ actualCount แทน
      const randomNumbers =
        algorithm === "binary-search"
          ? generateBinarySearchArray(actualCount, existingValues)
          : generateDiverseArray(actualCount);

      // ดึงข้อมูลกล่องทั้งหมดที่มีอยู่บนจอตอนนี้
      setNodes((prev) => {
        const startIndex = prev.length; // นับว่ามีกล่องอยู่แล้วกี่ใบ จะได้ไปต่อคิวถูก

        const newNodes: Node[] = randomNumbers.map((num, i) => {
          const currentIndex = startIndex + i; // รัน index ต่อจากของเดิม

          return {
            id: getId(),
            type: "custom",
            position: { x: currentIndex * 65, y: 5 }, // คำนวณพิกัด X ต่อจากกล่องสุดท้าย
            data: {
              value: num,
              status: "idle",
              index: currentIndex,
            },
          };
        });

        return [...prev, ...newNodes];
      });
    },
    [setNodes, getNodes, algorithm],
  );

  // reset nodes
  const handleResetNodes = useCallback(() => {
    setNodes([]);
  }, [setNodes]);

  // ฟังก์ชันสำหรับเรียงลำดับกล่องที่มีอยู่บนจอแบบอัตโนมัติ (จากน้อยไปมาก)
  const handleAutoSort = useCallback(() => {
    setNodes((prev) => {
      if (prev.length === 0) return prev; // ถ้าไม่มีกล่องเลยก็ไม่ต้องทำอะไร

      const sortedNodes = [...prev].sort((a, b) => {
        return Number(a.data.value) - Number(b.data.value);
      });

      return sortedNodes.map((node, i) => ({
        ...node,
        position: { x: i * 65, y: 5 },
        data: {
          ...node.data,
          index: i,
        },
      }));
    });
  }, [setNodes]);

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
            // ใช้ disableDrag เพื่อเปลี่ยนเป็นสีเทา (grayscale) กลืนไปกับพื้นหลังเวลากดไม่ได้
            className={`shrink-0 flex justify-center items-center border-2 bg-[#D9E363] w-14 h-14 rounded-lg transition-all ${
              disableDrag
                ? "cursor-not-allowed opacity-50 grayscale border-gray-400"
                : "cursor-grab border-[#5D5D5D]"
            }`}
            onPointerDown={(event) => {
              if (disableDrag) return; // กันไม่ให้คลิกลาก
              const value = Number(nodeInput) || 0;
              setType("input");
              setDraggedValue(value);
              onDragStart(event, createAddNewNode(value));
            }}
          >
            <input
              type="number"
              placeholder="N"
              disabled={disableDrag} //ปิดการพิมพ์ถ้าเต็ม
              className={`w-10 h-full rounded-lg bg-transparent text-center text-[#222121] font-semibold text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                disableDrag ? "cursor-not-allowed" : ""
              }`}
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
          {sampleNodes.map((num, index) => (
            <div
              key={index}
              //เปลี่ยนเป็นสีเทาเวลากดไม่ได้เหมือนกัน
              className={`shrink-0 w-14 h-14 rounded-lg flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 bg-[#D9E363] transition-all ${
                disableDrag
                  ? "cursor-not-allowed opacity-50 grayscale border-gray-400"
                  : "cursor-grab border-[#5D5D5D]"
              }`}
              onPointerDown={(event) => {
                if (disableDrag) return;
                setType("custom");
                setDraggedValue(num);
                onDragStart(event, createAddNewNode(num, index));
              }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Auto Sort */}
        {algorithm === "binary-search" && (
          <div
            className={`flex justify-center px-2 pb-2 transition-all ${
              isRunning ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <button
              onClick={handleAutoSort}
              disabled={isRunning}
              className="w-full bg-[#222121] text-white text-center p-2 rounded-lg  font-medium"
            >
              Auto Sort Data
            </button>
          </div>
        )}

        {/* Random generator */}
        <div
          className={`flex justify-center items-center text-center p-2 w-full transition-all ${
            isRunning ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <RandomSize
            onAdd={handleGenerateRandomNodes}
            onReset={handleResetNodes}
            isDisabled={disableDrag}
          />
        </div>

        {/* Target Value (ใช้เฉพาะ Search) */}
        {targetValue !== undefined && setTargetValue && (
          <div className="p-3 border-t border-gray-300">
            <label
              className={`font-bold text-md mb-2 text-start m-1 gap-2 ${
                isRunning ? "text-gray-400" : ""
              }`}
            >
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
              className={`mt-2 border p-2 rounded-lg w-full transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                isRunning
                  ? "border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border-gray-200"
              }`}
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
