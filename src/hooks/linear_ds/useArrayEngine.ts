import { useState, useCallback } from "react";
import { Node } from "@xyflow/react";
import { LinearNodeData } from "@/src/components/shared/linearDSNode";

let tempId = 1000;
const getNewId = () => `array_node_${tempId++}`;

export const useArrayEngine = (
  nodes: Node<LinearNodeData>[],
  setNodes: React.Dispatch<React.SetStateAction<Node<LinearNodeData>[]>>,
  speed: number = 1000, // ความเร็วแอนิเมชัน
) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // State สำหรับเก็บข้อความแจ้งเตือน
  const [warningText, setWarningText] = useState<string | null>(null);

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
      // เช็คความถูกต้องของ Index และจำนวนกล่อง
      if (targetIndex < 0 || targetIndex > nodes.length || nodes.length >= 50) {
        setWarningText(
          "Invalid index or array has reached the maximum size of 50.",
        );
        setTimeout(() => setWarningText(null), 3000);
        return;
      }

      setIsAnimating(true);
      setWarningText(null); // ล้างข้อความเก่าทิ้งถ้าทำรายการผ่าน

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

      setIsAnimating(false);
    },
    [nodes, setNodes, speed, getSyncedNodes],
  );

  // ฟังก์ชันลบข้อมูล (Delete)
  const deleteAtIndex = useCallback(
    async (targetIndex: number) => {
      // เช็คว่ามี Index ให้ลบไหม
      if (targetIndex < 0 || targetIndex >= nodes.length) {
        setWarningText("Invalid index. No element to delete.");
        setTimeout(() => setWarningText(null), 3000);
        return;
      }

      setIsAnimating(true);
      setWarningText(null); // ล้างข้อความเก่าทิ้งถ้าทำรายการผ่าน

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

      await sleep(speed);

      setIsAnimating(false);
    },
    [nodes, setNodes, speed, getSyncedNodes],
  );

  return { insertAtIndex, deleteAtIndex, isAnimating, warningText };
};
