import { useState, useCallback } from "react";
import { Node } from "@xyflow/react";
import { LinearNodeData } from "@/src/components/shared/linearDSNode";

let tempId = 1000;
const getNewId = () => `array_node_${tempId++}`;

/** Animation phases → 1-based lines (must match default pseudocode in each Code* component) */
const INSERT_LINES_ARRAY = [2, 4, 6];
const DELETE_LINES_ARRAY = [7, 9, 11];
/** Push / Enqueue: push branch → increment top/rear → assign slot */
const INSERT_LINES_STACK_QUEUE = [2, 6, 7];
/** Pop / Dequeue: pop/dequeue branch → decrement top/front → return */
const DELETE_LINES_STACK_QUEUE = [8, 13, 14];

export type LinearDsCodeKind = "array" | "stack" | "queue";

const IDLE_CODE_HIGHLIGHT = {
  currentStep: 0,
  stepToCodeLine: [1],
};

export type ArrayCodeDrive = typeof IDLE_CODE_HIGHLIGHT;

function insertLinesFor(kind: LinearDsCodeKind): number[] {
  return kind === "array" ? INSERT_LINES_ARRAY : INSERT_LINES_STACK_QUEUE;
}

function deleteLinesFor(kind: LinearDsCodeKind): number[] {
  return kind === "array" ? DELETE_LINES_ARRAY : DELETE_LINES_STACK_QUEUE;
}

export const useArrayEngine = (
  nodes: Node<LinearNodeData>[],
  setNodes: React.Dispatch<React.SetStateAction<Node<LinearNodeData>[]>>,
  speed: number = 1000, // ความเร็วแอนิเมชัน
  codeKind: LinearDsCodeKind = "array",
) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [codeDrive, setCodeDrive] =
    useState<ArrayCodeDrive>(IDLE_CODE_HIGHLIGHT);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const getSyncedNodes = useCallback(() => {
    return [...nodes]
      .sort((a, b) => a.position.x - b.position.x)
      .map((node, i) => ({
        ...node,
        data: { ...node.data, index: i },
      }));
  }, [nodes]);

  // ฟังก์ชันแทรกข้อมูล (Insert)
  const insertAtIndex = useCallback(
    async (targetIndex: number, value: number) => {
      if (targetIndex < 0 || targetIndex > nodes.length || nodes.length >= 50) {
        alert("Index ไม่ถูกต้อง หรือกล่องเต็ม 50 แล้วครับ");
        return;
      }

      setIsAnimating(true);
      const insertLines = insertLinesFor(codeKind);
      setCodeDrive({ currentStep: 0, stepToCodeLine: insertLines });

      // ดึงข้อมูลที่ซิงค์ตำแหน่งแล้วมาใช้งาน ป้องกัน index รวน
      let currentNodes = getSyncedNodes();

      // สร้างกล่องใหม่ ลอยอยู่ด้านบนก่อน (y: -80)
      const newNode: Node<LinearNodeData> = {
        id: getNewId(),
        type: "custom",
        position: { x: targetIndex * 65, y: -80 },
        data: { value, status: "processing" as const, index: targetIndex },
      };

      currentNodes.push(newNode);
      setNodes([...currentNodes]);

      await sleep(speed * 1);
      setCodeDrive({ currentStep: 1, stepToCodeLine: insertLines });

      // --- กระเถิบกล่องที่อยู่ข้างหลังไปทางขวา (+65px) ---
      currentNodes = currentNodes.map((node) => {
        if (
          node.id !== newNode.id &&
          (node.data.index as number) >= targetIndex
        ) {
          return {
            ...node,
            position: { ...node.position, x: node.position.x + 65 },
            data: { ...node.data, index: (node.data.index as number) + 1 },
          };
        }
        return node;
      });
      setNodes([...currentNodes]);

      // รอให้กล่องข้างล่างหลบทางให้เสร็จแบบชิลๆ
      await sleep(speed * 1.5);
      setCodeDrive({ currentStep: 2, stepToCodeLine: insertLines });

      // ดึงกล่องใหม่ลงมาเข้าแถว (y: 5)
      currentNodes = currentNodes.map((node) => {
        if (node.id === newNode.id) {
          return {
            ...node,
            position: { ...node.position, y: 5 },
            data: { ...node.data, status: "idle" as const },
          };
        }
        return node;
      });

      currentNodes.sort(
        (a, b) => (a.data.index as number) - (b.data.index as number),
      );
      setNodes([...currentNodes]);

      // รอให้แอนิเมชันลอยลงมาเสร็จสมบูรณ์ก่อน ค่อยปลดล็อก
      await sleep(speed);

      setCodeDrive(IDLE_CODE_HIGHLIGHT);
      setIsAnimating(false);
    },
    [nodes, setNodes, speed, getSyncedNodes, codeKind],
  );

  // ฟังก์ชันลบข้อมูล (Delete)
  const deleteAtIndex = useCallback(
    async (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= nodes.length) {
        alert("ไม่มี Index นี้ให้ลบครับ");
        return;
      }

      setIsAnimating(true);
      const deleteLines = deleteLinesFor(codeKind);
      setCodeDrive({ currentStep: 0, stepToCodeLine: deleteLines });

      // ดึงข้อมูลที่ซิงค์ตำแหน่งแล้วมาใช้งาน
      let currentNodes = getSyncedNodes();

      // ทำให้กล่องที่โดนลบเป็นสีแดง แล้วหล่นลงไปข้างล่าง ---
      currentNodes = currentNodes.map((node) => {
        if (node.data.index === targetIndex) {
          return {
            ...node,
            data: { ...node.data, status: "delete" as const },
            position: { ...node.position, y: 80 },
          };
        }
        return node;
      });
      setNodes([...currentNodes]);

      await sleep(speed);
      setCodeDrive({ currentStep: 1, stepToCodeLine: deleteLines });

      // ลบกล่องนั้นทิ้งออกจาก Array และขยับซ้าย
      currentNodes = currentNodes.filter(
        (node) => node.data.index !== targetIndex,
      );

      currentNodes = currentNodes.map((node) => {
        if ((node.data.index as number) > targetIndex) {
          return {
            ...node,
            position: { ...node.position, x: node.position.x - 65 },
            data: { ...node.data, index: (node.data.index as number) - 1 },
          };
        }
        return node;
      });
      setNodes([...currentNodes]);

      setCodeDrive({ currentStep: 2, stepToCodeLine: deleteLines });
      await sleep(speed);

      setCodeDrive(IDLE_CODE_HIGHLIGHT);
      setIsAnimating(false);
    },
    [nodes, setNodes, speed, getSyncedNodes, codeKind],
  );

  return { insertAtIndex, deleteAtIndex, isAnimating, codeDrive };
};
