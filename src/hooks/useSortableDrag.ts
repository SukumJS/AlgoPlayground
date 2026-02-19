import { useCallback } from "react";
import type { Node, OnNodeDrag } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

const NODE_WIDTH = 65;

export function useSortableDrag(
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>,
  positionFromIndex: (index: number) => { x: number; y: number }
) {
  /* ระหว่างลาก */
  const onNodeDrag: OnNodeDrag = useCallback(
    (_, dragged) => {
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
    (_, dragged) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === dragged.id
            ? { ...n, position: positionFromIndex(n.data.index) }
            : n
        )
      );
    },
    [setNodes, positionFromIndex]
  );

  return { onNodeDrag, onNodeDragStop };
}
