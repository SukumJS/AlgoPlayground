import { Node, OnNodeDrag } from "@xyflow/react";

const NODE_WIDTH = 63;
const NODE_MARGIN = 2;
const NODE_GAP = NODE_WIDTH + NODE_MARGIN;
const SORT_Y = 6;

export const positionFromIndex = (index: number) => ({
  x: index * NODE_GAP,
  y: SORT_Y,
});

export const indexFromX = (x: number) =>
  Math.round(x / NODE_GAP);


export function useSortingDrag(
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
) {
  const onSortDrag: OnNodeDrag = (_, draggedNode) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === draggedNode.id
          ? {
              ...n,
              position: {
                x: draggedNode.position.x,
                y: SORT_Y,
              },
            }
          : n
      )
    );
  };

  const onSortDragStop: OnNodeDrag = (_, draggedNode) => {
    setNodes((prev) => {
      const sorted = [...prev].sort(
        (a, b) => a.position.x - b.position.x
      );

      const oldIndex = sorted.findIndex(
        (n) => n.id === draggedNode.id
      );

      let newIndex = Math.round(
        draggedNode.position.x / NODE_GAP
      );

      newIndex = Math.max(
        0,
        Math.min(sorted.length - 1, newIndex)
      );

      if (oldIndex !== newIndex) {
        const [moved] = sorted.splice(oldIndex, 1);
        sorted.splice(newIndex, 0, moved);
      }

      return sorted.map((n, i) => ({
        ...n,
        position: positionFromIndex(i),
      }));
    });
  };

  return { onSortDrag, onSortDragStop };
}
