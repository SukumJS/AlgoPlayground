"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useCallback } from "react";
import { useReactFlow, XYPosition, Node, useNodes } from "@xyflow/react";
import { OnDropAction, useDnD, useDnDPosition } from "./useDnD";
import RandomSize from "../shared/randomSize";

let id = 0;
const getId = () => `linear_node_${id++}`;

type DataLinearProps = {
  nodeInput: number | string;
  setNodeInput:
    | React.Dispatch<React.SetStateAction<number | string>>
    | ((val: number | string) => void);
  isRunning?: boolean;
  algorithm?: string;

  onInsert?: (index: number, value: number) => void;
  onDelete?: (index: number) => void;
  isAnimating?: boolean;
};

function Data_Linear_DS({
  nodeInput,
  setNodeInput,
  isRunning,
  algorithm,
  onInsert,
  onDelete,
  isAnimating,
}: DataLinearProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { setNodes, getNodes } = useReactFlow();
  const { onDragStart, isDragging } = useDnD();

  const nodes = useNodes();
  const isFull = nodes.length >= 50;
  // ล็อกปุ่มถ้ากำลังรันแอนิเมชันอยู่ หรือกล่องเต็ม
  const disableDrag = isRunning || isAnimating || isFull;

  const [type, setType] = useState<string | null>(null);
  const [draggedValue, setDraggedValue] = useState<number | null>(null);

  const [sampleNodes, setSampleNodes] = useState<number[]>([1, 2, 3, 4, 5]);

  //State สำหรับเก็บค่าตอนพิมพ์ Insert/Delete
  const [insertIndex, setInsertIndex] = useState<number | string>("");
  const [insertValue, setInsertValue] = useState<number | string>("");
  const [deleteIndex, setDeleteIndex] = useState<number | string>("");

  const createAddNewNode = useCallback(
    (sampleValue: number, sampleIndex?: number): OnDropAction => {
      return ({ position }: { position: XYPosition }) => {
        setNodes((prev) => {
          if (prev.length >= 50) return prev;

          const currentIndex = prev.length;

          // เช็คว่าโหมดอะไร เพื่อคำนวณระยะตกของกล่องให้ตรงกับระยะที่แสดงผล
          const isLL =
            algorithm === "singly-linked-list" ||
            algorithm === "doubly-linked-list";
          const spacing = isLL ? 120 : 65;

          const newNode: Node = {
            id: getId(),
            type: "custom",
            position: { x: currentIndex * spacing, y: 5 },
            data: {
              value: sampleValue,
              status: "idle",
              index: currentIndex,
            },
          };

          return prev.concat(newNode);
        });

        if (sampleIndex !== undefined) {
          setSampleNodes((prev) => {
            const newSamples = [...prev];
            newSamples[sampleIndex] = Math.floor(Math.random() * 99) + 1;
            return newSamples;
          });
        }

        setType(null);
        setDraggedValue(null);
      };
    },
    [setNodes, algorithm],
  );

  const handleGenerateRandomNodes = useCallback(
    (count: number) => {
      if (count <= 0) return;

      const currentNodes = getNodes();
      const availableSpace = 50 - currentNodes.length;
      if (availableSpace <= 0) return;

      const actualCount = Math.min(count, availableSpace);

      const randomNumbers = Array.from(
        { length: actualCount },
        () => Math.floor(Math.random() * 99) + 1,
      );

      setNodes((prev) => {
        const startIndex = prev.length;

        //เผื่อระยะการ Generate สุ่มกล่อง
        const isLL =
          algorithm === "singly-linked-list" ||
          algorithm === "doubly-linked-list";
        const spacing = isLL ? 120 : 65;

        const newNodes: Node[] = randomNumbers.map((num, i) => {
          const currentIndex = startIndex + i;

          return {
            id: getId(),
            type: "custom",
            position: { x: currentIndex * spacing, y: 5 },
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

  const handleResetNodes = useCallback(() => {
    setNodes([]);
  }, [setNodes]);

  return (
    <>
      {isDragging && <DragGhost type={type} value={draggedValue} />}

      <button
        className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
          isOpen ? "bg-gray-200 h-12" : "bg-white"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div
            className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${
              isOpen ? "" : "hidden opacity-0"
            }`}
          ></div>
          <div className="flex text-lg p-2">Data Operations</div>
        </div>
        <div className="mr-2 flex justify-end">
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </button>

      <div
        className={`flex-col transition-opacity duration-300 ${
          isOpen ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
        }`}
      >
        <div className="overflow-x-auto flex gap-2 mb-2 p-2">
          {/* Input Node */}
          <div
            className={`shrink-0 flex justify-center items-center border-2 bg-[#D9E363] w-14 h-14 rounded-lg transition-all ${
              disableDrag
                ? "cursor-not-allowed opacity-50 grayscale border-gray-400"
                : "cursor-grab border-[#5D5D5D]"
            }`}
            onPointerDown={(event) => {
              if (disableDrag) return;
              const value = Number(nodeInput) || 0;
              setType("input");
              setDraggedValue(value);
              onDragStart(event, createAddNewNode(value));
            }}
          >
            <input
              type="number"
              placeholder="0"
              disabled={disableDrag}
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

        {/* Random generator */}
        <div
          className={`flex justify-center items-center text-center p-2 w-full transition-all ${
            isAnimating ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <RandomSize
            onAdd={handleGenerateRandomNodes}
            onReset={handleResetNodes}
            isDisabled={disableDrag}
          />
        </div>

        {/*UI ของ Array และ Linked List*/}
        {(algorithm === "array" ||
          algorithm === "singly-linked-list" ||
          algorithm === "doubly-linked-list") && (
          <div className="p-4 border-t border-gray-300 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-sm mb-2 text-gray-800 flex items-center gap-2">
                Insert Element
              </h3>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">
                    Index
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={insertIndex}
                    onChange={(e) => setInsertIndex(e.target.value)}
                    disabled={isAnimating}
                    className="w-full border border-gray-300 p-2 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">
                    Value
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 99"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    disabled={isAnimating}
                    className="w-full border border-gray-300 p-2 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (onInsert)
                      onInsert(Number(insertIndex), Number(insertValue));
                    setInsertValue("");
                  }}
                  disabled={
                    isAnimating ||
                    disableDrag ||
                    insertIndex === "" ||
                    insertValue === ""
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Insert
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-2 text-gray-800 flex items-center gap-2">
                Delete by Index
              </h3>
              <div className="flex gap-2 items-end">
                <div className="flex-[2]">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">
                    Target Index
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={deleteIndex}
                    onChange={(e) => setDeleteIndex(e.target.value)}
                    disabled={isAnimating}
                    className="w-full border border-gray-300 p-2 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (onDelete) onDelete(Number(deleteIndex));
                    setDeleteIndex("");
                  }}
                  disabled={isAnimating || deleteIndex === ""}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UI ของ Stack (LIFO) */}
        {algorithm === "stack" && (
          <div className="p-4 border-t border-gray-300 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-sm mb-2 text-gray-800 flex items-center gap-2">
                Stack Operations (LIFO)
              </h3>
              <div className="flex gap-2 items-end">
                <div className="flex-[2]">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">
                    Value
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 99"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    disabled={isAnimating || isFull}
                    className="w-full border border-gray-300 p-2 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (onInsert) onInsert(nodes.length, Number(insertValue));
                    setInsertValue("");
                  }}
                  disabled={isAnimating || disableDrag || insertValue === ""}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  Push
                </button>
                <button
                  onClick={() => {
                    if (onDelete && nodes.length > 0)
                      onDelete(nodes.length - 1);
                  }}
                  disabled={isAnimating || nodes.length === 0}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Pop
                </button>
              </div>
            </div>
          </div>
        )}

        {/*UI ของ Queue (FIFO)*/}
        {algorithm === "queue" && (
          <div className="p-4 border-t border-gray-300 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-sm mb-2 text-gray-800 flex items-center gap-2">
                Queue Operations (FIFO)
              </h3>
              <div className="flex gap-2 items-end">
                <div className="flex-[2]">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">
                    Value
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 99"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    disabled={isAnimating || isFull}
                    className="w-full border border-gray-300 p-2 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (onInsert) onInsert(nodes.length, Number(insertValue));
                    setInsertValue("");
                  }}
                  disabled={isAnimating || disableDrag || insertValue === ""}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Enqueue
                </button>
                <button
                  onClick={() => {
                    if (onDelete && nodes.length > 0) onDelete(0);
                  }}
                  disabled={isAnimating || nodes.length === 0}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Dequeue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Data_Linear_DS;

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
