import { useCallback, useState } from "react";
import type { Node, OnNodeDrag } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

const NODE_WIDTH = 65;

export function useSortableDrag(
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>,
  positionFromIndex: (index: number) => { x: number; y: number }
) {
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [isTrashActive, setIsTrashActive] = useState(false);

  const onNodeDragStart: OnNodeDrag = useCallback(() => {
    setIsDraggingNode(true);
  }, []);

  /* ระหว่างลาก */
  const onNodeDrag: OnNodeDrag = useCallback(
    (event, dragged) => {
      let clientX = 0;
      let clientY = 0;

      const e = event as unknown as MouseEvent | TouchEvent;

      if ('touches' in e) {
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        }
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      if (clientX && clientY) {
        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        const dist = Math.sqrt(Math.pow(clientX - trashX, 2) + Math.pow(clientY - trashY, 2));
        setIsTrashActive(dist < 150);
      }

      setNodes((prev) => {
        const draggedNode = prev.find((n) => n.id === dragged.id);
        if (!draggedNode) return prev;

        // คำนวณ index ใหม่จากตำแหน่ง X
        let newIndex = Math.floor(
          (dragged.position.x + NODE_WIDTH / 2) / NODE_WIDTH
        );

        newIndex = Math.max(0, Math.min(prev.length - 1, newIndex));
        const currentIndex = draggedNode.data.index;

        // ถ้า index ไม่เปลี่ยน ไม่ต้อง reorder
        if (newIndex === currentIndex) {
          return prev.map((n) =>
            n.id === dragged.id
              ? { ...n, position: dragged.position }
              : n
          );
        }

        // เอา node ออกก่อน
        const filtered = prev
          .filter((n) => n.id !== dragged.id)
          .sort((a, b) => a.data.index - b.data.index);

        // แทรกเข้า index ใหม่
        filtered.splice(newIndex, 0, draggedNode);

        // อัปเดต index และตำแหน่ง
        return filtered.map((node, index) => ({
          ...node,
          data: { ...node.data, index },
          position:
            node.id === dragged.id
              ? dragged.position
              : positionFromIndex(index),
        }));
      });
    },
    [setNodes, positionFromIndex]
  );

  /* ตอนปล่อยเมาส์ */
  const onNodeDragStop: OnNodeDrag = useCallback(
    (event, dragged) => {
      setIsDraggingNode(false);
      setIsTrashActive(false);

      let clientX = 0;
      let clientY = 0;
      let droppedInTrash = false;

      const e = event as unknown as MouseEvent | TouchEvent;

      if ('changedTouches' in e) {
        if (e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        }
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      if (clientX && clientY) {
        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        const dist = Math.sqrt(Math.pow(clientX - trashX, 2) + Math.pow(clientY - trashY, 2));
        droppedInTrash = dist < 100;
      }

      if (droppedInTrash) {
        // 1. บอก React Flow ให้ลบ Node นี้ออกแบบเป็นทางการ (ล้าง Highlight/Internal State)
        setNodes((prev) => {
          // กรองตัวที่เหลือ
          const remainingNodes = prev.filter((n) => n.id !== dragged.id);

          // จัด Index และตำแหน่งใหม่
          remainingNodes.sort((a, b) => a.data.index - b.data.index);

          return remainingNodes.map((n, i) => ({
            ...n,
            selected: false,
            dragging: false,
            data: { ...n.data, index: i },
            position: positionFromIndex(i),
          }));
        });
      } else {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === dragged.id
              ? {
                ...n,
                position: positionFromIndex(n.data.index),
                selected: false, // ปล่อยแล้วให้หายเลือก
                dragging: false
              }
              : { ...n, selected: false } // ตัวอื่นๆ ก็ให้หายเลือกด้วยเพื่อความชัวร์
          )
        );
      }
    },
    [setNodes, positionFromIndex]
  );

  return { onNodeDragStart, onNodeDrag, onNodeDragStop, isDraggingNode, isTrashActive };
}