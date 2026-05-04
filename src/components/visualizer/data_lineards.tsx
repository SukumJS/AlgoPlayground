"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
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
  engineWarningText?: string | null;

  tutorialMode?: boolean;
  onTutorialDropSuccess?: () => void;
  onTutorialInsert?: () => void;
  onTutorialDelete?: () => void;
  onExplainAction?: (message: string) => void;
};

function Data_Linear_DS({
  nodeInput,
  setNodeInput,
  isRunning,
  algorithm,
  onInsert,
  onDelete,
  isAnimating,
  engineWarningText,
  tutorialMode,
  onTutorialDropSuccess,
  onTutorialInsert,
  onTutorialDelete,
  onExplainAction,
}: DataLinearProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isPanelOpen = tutorialMode || isOpen;

  const { setNodes, getNodes } = useReactFlow();
  const { onDragStart, isDragging } = useDnD();

  const nodes = useNodes();
  const isFull = nodes.length >= 50;
  const disableDrag = isRunning || isAnimating || isFull;

  const [type, setType] = useState<string | null>(null);
  const [draggedValue, setDraggedValue] = useState<number | null>(null);
  const [warningText, setWarningText] = useState<string | null>(null); // ของ Random

  const [sampleNodes, setSampleNodes] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const randomNodes = Array.from(
        { length: 5 },
        () => Math.floor(Math.random() * 99) + 1,
      );
      setSampleNodes(randomNodes);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const [insertIndex, setInsertIndex] = useState<number | string>("");
  const [insertValue, setInsertValue] = useState<number | string>("");
  const [deleteIndex, setDeleteIndex] = useState<number | string>("");

  const explainAction = useCallback(
    (message: string) => {
      if (onExplainAction) onExplainAction(message);
    },
    [onExplainAction],
  );

  const createAddNewNode = useCallback(
    (sampleValue: number, sampleIndex?: number): OnDropAction => {
      return () => {
        setNodes((prev) => {
          if (prev.length >= 50) return prev;

          const currentIndex = prev.length;
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

        if (onTutorialDropSuccess) {
          onTutorialDropSuccess();
        }
      };
    },
    [setNodes, algorithm, onTutorialDropSuccess],
  );

  const handleGenerateRandomNodes = useCallback(
    (count: number) => {
      if (count <= 0) return;

      const currentNodes = getNodes();
      const availableSpace = 50 - currentNodes.length;
      if (availableSpace <= 0) {
        setWarningText("Maximum limit of 50 nodes reached. Cannot add more.");
        setTimeout(() => setWarningText(null), 5000);
        return;
      }

      if (count > availableSpace) {
        setWarningText(
          `Only space for ${availableSpace} more nodes. Added ${availableSpace} nodes.`,
        );
        setTimeout(() => setWarningText(null), 5000);
      } else {
        setWarningText(null);
      }

      const actualCount = Math.min(count, availableSpace);

      const randomNumbers = Array.from(
        { length: actualCount },
        () => Math.floor(Math.random() * 99) + 1,
      );

      setNodes((prev) => {
        const startIndex = prev.length;
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
    setWarningText(null);
  }, [setNodes]);

  return (
    <>
      {isDragging && <DragGhost type={type} value={draggedValue} />}

      <button
        className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
          isPanelOpen ? "bg-gray-200 h-12" : "bg-white"
        }`}
        onClick={() => {
          if (!tutorialMode) {
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="flex items-center">
          <div
            className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${
              isPanelOpen ? "" : "hidden opacity-0"
            }`}
          ></div>
          <div className="flex text-lg p-2">Data</div>
        </div>
        <div className="mr-2 flex justify-end">
          {isPanelOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </button>

      <div
        className={`tutorial-data-panel flex-col transition-opacity duration-300 ${
          isPanelOpen ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
        }`}
      >
        <div className="overflow-x-auto flex gap-2 mb-2 p-2">
          {/* Input Node */}
          <div
            data-tutorial-target="sidebar-linear-node"
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
              placeholder="N"
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
            warningText={warningText}
          />
        </div>

        {/* UI ของ Array และ Linked List */}
        {(algorithm === "array" ||
          algorithm === "singly-linked-list" ||
          algorithm === "doubly-linked-list") && (
          <div className="p-4 border-t border-gray-300 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-md mb-2 text-gray-800 flex items-center gap-2">
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
                    className="w-full placeholder:text-gray-300 border border-gray-300 p-2 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    className="w-full placeholder:text-gray-300 border border-gray-300 p-2 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button
                  onClick={() => {
                    explainAction(
                      "Insert adds your value at that index. All values after it shift right to make room.",
                    );
                    if (onInsert)
                      onInsert(Number(insertIndex), Number(insertValue));
                    setInsertValue("");
                    if (onTutorialInsert) onTutorialInsert();
                  }}
                  disabled={
                    isAnimating ||
                    disableDrag ||
                    insertIndex === "" ||
                    insertValue === ""
                  }
                  className="bg-[#222121] text-white px-4 py-2 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50 "
                >
                  Insert
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-md mb-2 text-gray-800 flex items-center gap-2">
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
                    className="w-full placeholder:text-gray-300 border border-gray-300 p-2 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button
                  onClick={() => {
                    explainAction(
                      "Delete removes your value at that index. All values after it shift left to close the gap.",
                    );
                    if (onDelete) onDelete(Number(deleteIndex));
                    setDeleteIndex("");
                    if (onTutorialDelete) onTutorialDelete();
                  }}
                  disabled={isAnimating || deleteIndex === ""}
                  className="flex-1 bg-[#222121] text-white py-2 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50 "
                >
                  Delete
                </button>
              </div>
            </div>
            {/* แสดงข้อความแจ้งเตือนจาก Engine (Insert/Delete)*/}
            {engineWarningText && (
              <div className="text-red-600 text-sm font-medium  transition-all">
                {engineWarningText}
              </div>
            )}
          </div>
        )}

        {/* UI ของ Stack (LIFO) */}
        {algorithm === "stack" && (
          <div className="p-4 border-t border-gray-300 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-md mb-3 text-gray-800 flex items-center gap-2">
                Stack Operations (LIFO)
              </h3>

              <div className="flex items-center gap-3">
                <div
                  id="tutorial-insert-zone"
                  className="flex items-center gap-2"
                >
                  <input
                    type="number"
                    placeholder="e.g. 99"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    disabled={isAnimating || isFull}
                    className="w-38 placeholder:text-gray-300 border border-gray-300 p-2 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button
                  onClick={() => {
                    explainAction(
                      "Push adds your value to the top. The newest value is always removed first (LIFO).",
                    );
                    if (onInsert) onInsert(nodes.length, Number(insertValue));
                    setInsertValue("");
                    if (onTutorialInsert) onTutorialInsert();
                  }}
                  disabled={isAnimating || disableDrag || insertValue === ""}
                  className="flex-1 bg-[#222121] text-white py-2 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50 "
                >
                  Push
                </button>
                <button
                  id="tutorial-delete-zone"
                  onClick={() => {
                    explainAction(
                      "Pop removes the top value and tosses it away. The newest value gets removed first (LIFO).",
                    );
                    if (onDelete && nodes.length > 0)
                      onDelete(nodes.length - 1);
                    if (onTutorialDelete) onTutorialDelete();
                  }}
                  disabled={isAnimating || nodes.length === 0}
                  className="bg-[#222121] text-white px-5 py-2 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
                >
                  Pop
                </button>
              </div>
            </div>
            {/* แสดงข้อความแจ้งเตือนจาก Engine (Insert/Delete)*/}
            {engineWarningText && (
              <div className="text-red-600 text-sm font-medium  transition-all">
                {engineWarningText}
              </div>
            )}
          </div>
        )}

        {/* UI ของ Queue (FIFO) */}
        {algorithm === "queue" && (
          <div className="p-4 border-t border-gray-300 flex flex-col gap-3">
            <div>
              <h3 className="font-bold text-md mb-3 text-gray-800 flex items-center gap-2">
                Queue Operations (FIFO)
              </h3>

              <div className="flex items-center gap-3">
                <div
                  id="tutorial-insert-zone"
                  className="flex items-center gap-2"
                >
                  <input
                    type="number"
                    placeholder="e.g. 99"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    disabled={isAnimating || isFull}
                    className="w-24 placeholder:text-gray-300 border border-gray-300 p-2 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:border-gray-500 transition-colors"
                  />
                </div>
                <button
                  onClick={() => {
                    explainAction(
                      "Enqueue adds your value to the back. It waits its turn in line like a real queue (FIFO).",
                    );
                    if (onInsert) onInsert(nodes.length, Number(insertValue));
                    setInsertValue("");
                    if (onTutorialInsert) onTutorialInsert();
                  }}
                  disabled={isAnimating || disableDrag || insertValue === ""}
                  className="flex-1 bg-[#222121] text-white py-2 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50"
                >
                  Enqueue
                </button>
                <button
                  id="tutorial-delete-zone"
                  onClick={() => {
                    explainAction(
                      "Dequeue removes the front value—the one that arrived first. First in gets served first (FIFO).",
                    );
                    if (onDelete && nodes.length > 0) onDelete(0);
                    if (onTutorialDelete) onTutorialDelete();
                  }}
                  disabled={isAnimating || nodes.length === 0}
                  className="bg-[#222121] text-white px-5 py-2 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
                >
                  Dequeue
                </button>
              </div>
            </div>
            {/* แสดงข้อความแจ้งเตือนจาก Engine (Insert/Delete)*/}
            {engineWarningText && (
              <div className="text-red-600 text-sm font-medium  transition-all">
                {engineWarningText}
              </div>
            )}
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
