import { Node, OnNodeDrag } from "@xyflow/react";

const NODE_GAP = 65;
const SORT_Y = 5;
const START_X = -50;

export const positionFromIndex = (index: number) => ({
  x: START_X + index * NODE_GAP,
  y: SORT_Y,
});

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
      const others = prev.filter(
        (n) => n.id !== draggedNode.id
      );

      const draggedCenterX =
        draggedNode.position.x + NODE_GAP / 2;

      const sortedOthers = [...others].sort(
        (a, b) =>
          a.position.x - b.position.x
      );

      let insertIndex = sortedOthers.findIndex((n) => {
        const centerX =
          n.position.x + NODE_GAP / 2;
        return draggedCenterX < centerX;
      });

      if (insertIndex === -1) {
        insertIndex = sortedOthers.length;
      }

      sortedOthers.splice(insertIndex, 0, draggedNode);

      return sortedOthers.map((n, i) => ({
        ...n,
        position: positionFromIndex(i),
      }));
    });
  };

  return { onSortDrag, onSortDragStop };
}
