import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export function swapByIndex(
  arr: Node<SortNodeData>[],
  i: number,
  j: number,
  positionFromIndex: (index: number) => { x: number; y: number },
) {
  const newArr = [...arr];

  const nodeA = newArr[i];
  const nodeB = newArr[j];

  // swap in array
  newArr[i] = nodeB;
  newArr[j] = nodeA;

  // update only swapped nodes
  newArr[i] = {
    ...newArr[i],
    position: positionFromIndex(i),
    data: {
      ...newArr[i].data,
      index: i,
    },
  };

  newArr[j] = {
    ...newArr[j],
    position: positionFromIndex(j),
    data: {
      ...newArr[j].data,
      index: j,
    },
  };

  return newArr;
}
