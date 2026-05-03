import { useCallback, useState } from "react";
import type { Node, OnNodeDrag } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

const NODE_WIDTH = 65;

export function useSortableDrag(
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>,
  positionFromIndex: (index: number) => { x: number; y: number },
  isLinkedList: boolean = false,
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
      let isOverTrash = false; // ⭐️ เพิ่มตัวแปรเก็บสถานะการชนถังขยะ

      const e = event as unknown as MouseEvent | TouchEvent;

      if ("touches" in e) {
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
        const dist = Math.sqrt(
          Math.pow(clientX - trashX, 2) + Math.pow(clientY - trashY, 2),
        );
        isOverTrash = dist < 150; // ⭐️ เช็คชนตรงนี้
        setIsTrashActive(isOverTrash);
      }

      setNodes((prev) => {
        const draggedNode = prev.find((n) => n.id === dragged.id);
        if (!draggedNode) return prev;

        // คำนวณระยะห่าง (spacing) ตามโหมดจริงๆ
        const spacing =
          positionFromIndex(1).x - positionFromIndex(0).x || NODE_WIDTH;

        // คำนวณ Slot ใหม่บนหน้าจอจากตำแหน่ง X
        let newIndex = Math.floor((dragged.position.x + spacing / 2) / spacing);
        newIndex = Math.max(0, Math.min(prev.length - 1, newIndex));

        // หา Slot ปัจจุบันบนหน้าจอ (เรียงตามพิกัด X ไม่ใช่ Index)
        const sortedByX = [...prev].sort((a, b) => a.position.x - b.position.x);
        const currentIndex = sortedByX.findIndex((n) => n.id === dragged.id);

        // ⭐️ สร้าง Node ใหม่พร้อมกำหนดสี deleting ถ้าจ่อถังขยะ
        const newDraggedNode = {
          ...draggedNode,
          position: dragged.position,
          data: {
            ...draggedNode.data,
            // ถ้าลากจ่อถังขยะ เปลี่ยนสีแดง ถ้าไม่ใช่เอาสถานะลบออก
            status: isOverTrash
              ? "deleting"
              : draggedNode.data.status === "deleting"
                ? "idle"
                : draggedNode.data.status,
          },
        } as Node<SortNodeData>; // จำเป็นต้อง Cast Type

        // ถ้าตำแหน่งช่องไม่เปลี่ยน ไม่ต้องขยับ
        if (newIndex === currentIndex) {
          return prev.map((n) => (n.id === dragged.id ? newDraggedNode : n));
        }

        // เอา node ออกก่อน แล้วจัดเรียงตัวที่เหลือตามพิกัด X
        const filtered = prev
          .filter((n) => n.id !== dragged.id)
          .sort((a, b) => a.position.x - b.position.x);

        // แทรกเข้าช่องใหม่
        filtered.splice(newIndex, 0, newDraggedNode);

        return filtered.map((node, visualSlot) => ({
          ...node,
          // ถ้าเป็น Linked List ห้ามแก้ Index! ให้แก้เฉพาะโหมด Array
          data: isLinkedList ? node.data : { ...node.data, index: visualSlot },
          position:
            node.id === dragged.id
              ? dragged.position
              : positionFromIndex(visualSlot),
        }));
      });
    },
    [setNodes, positionFromIndex, isLinkedList],
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

      if ("changedTouches" in e) {
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
        const dist = Math.sqrt(
          Math.pow(clientX - trashX, 2) + Math.pow(clientY - trashY, 2),
        );
        // ⭐️ ระยะปล่อยลงถัง ผมปรับให้เป็น 150 เท่ากับตอน Hover จะได้ลื่นไหลขึ้น
        droppedInTrash = dist < 150;
      }

      if (droppedInTrash) {
        setNodes((prev) => {
          const remainingNodes = prev.filter((n) => n.id !== dragged.id);

          // เรียงตามพิกัด X เสมอเวลาโดนลบ
          remainingNodes.sort((a, b) => a.position.x - b.position.x);

          return remainingNodes.map((n, visualSlot) => ({
            ...n,
            selected: false,
            dragging: false,
            // ห้ามรีเซ็ต Index ถ้าเป็น Linked List
            data: isLinkedList ? n.data : { ...n.data, index: visualSlot },
            position: positionFromIndex(visualSlot),
          }));
        });
      } else {
        setNodes((prev) => {
          // ตอนปล่อยเมาส์ ให้กล่อง Snap เข้า Grid ตามตำแหน่ง X (Visual Slot) ล่าสุด
          const sortedByX = [...prev].sort(
            (a, b) => a.position.x - b.position.x,
          );
          return prev.map((n) => {
            if (n.id === dragged.id) {
              const visualSlot = sortedByX.findIndex((s) => s.id === n.id);
              return {
                ...n,
                position: positionFromIndex(visualSlot),
                selected: false,
                dragging: false,
                // ⭐️ ถ้ายกเลิกลบ (ปล่อยพลาด) ให้เปลี่ยนสีกลับเป็น idle
                data: {
                  ...n.data,
                  status: n.data.status === "deleting" ? "idle" : n.data.status,
                },
              };
            }
            return { ...n, selected: false };
          });
        });
      }
    },
    [setNodes, positionFromIndex, isLinkedList],
  );

  return {
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    isDraggingNode,
    isTrashActive,
  };
}
