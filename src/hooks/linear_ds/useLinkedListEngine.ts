import { useState, useCallback } from "react";
import { Node, Edge, MarkerType } from "@xyflow/react";
import { LinearNodeData } from "@/src/components/shared/linearDSNode";

let tempId = 2000;
const getNewId = () => `ll_node_${tempId++}`;

const createEdge = (
  source: string,
  target: string,
  isPrev: boolean = false,
): Edge => ({
  id: `edge_${source}_to_${target}${isPrev ? "_prev" : "_next"}`,
  source: source,
  sourceHandle: isPrev ? "s-prev" : "s-next",
  target: target,
  targetHandle: isPrev ? "t-prev" : "t-next",
  type: "smoothstep",
  animated: false,
  style: { stroke: isPrev ? "#3182CE" : "#5D5D5D", strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: isPrev ? "#3182CE" : "#5D5D5D",
  },
});

const NODE_DISTANCE = 120;

export const useLinkedListEngine = (
  nodes: Node<LinearNodeData>[],
  setNodes: React.Dispatch<React.SetStateAction<Node<LinearNodeData>[]>>,
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  speed: number = 1000,
  algorithm?: string,
) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const isDLL = algorithm === "doubly-linked-list";

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const getLogicalNodes = useCallback(() => {
    return [...nodes].sort(
      (a, b) => (a.data.index as number) - (b.data.index as number),
    );
  }, [nodes]);

  const insertAtIndex = useCallback(
    async (targetIndex: number, value: number) => {
      if (targetIndex < 0 || targetIndex > nodes.length || nodes.length >= 50) {
        alert("Index ไม่ถูกต้อง หรือโหนดเต็มแล้วครับ");
        return;
      }

      setIsAnimating(true);
      let currentNodes = getLogicalNodes();
      let currentEdges = [...edges];

      const prevNodeForPos =
        targetIndex > 0
          ? currentNodes.find((n) => n.data.index === targetIndex - 1)
          : null;

      const startX = prevNodeForPos
        ? prevNodeForPos.position.x + NODE_DISTANCE
        : 0;

      const newNode: Node<LinearNodeData> = {
        id: getNewId(),
        type: "custom",
        position: { x: startX, y: -80 },
        data: { value, status: "processing" as const, index: targetIndex },
      };

      currentNodes.push(newNode);
      setNodes([...currentNodes]);
      await sleep(speed * 1.5);

      //อัปเดตตำแหน่ง (Visual) และ Index (Logical) แบบแยกออกจากกัน
      currentNodes = currentNodes.map((node): Node<LinearNodeData> => {
        if (node.id !== newNode.id) {
          let newX = node.position.x;
          let newIdx = node.data.index as number;

          if (node.position.x >= startX) {
            newX += NODE_DISTANCE;
          }
          if (newIdx >= targetIndex) {
            newIdx += 1;
          }

          return {
            ...node,
            position: { ...node.position, x: newX },
            data: { ...node.data, index: newIdx },
          };
        }
        return node;
      });

      setNodes([...currentNodes]);
      await sleep(speed);

      const prevNode = currentNodes.find(
        (n) => n.data.index === targetIndex - 1,
      );
      const nextNode = currentNodes.find(
        (n) => n.data.index === targetIndex + 1 && n.id !== newNode.id,
      );

      if (prevNode) {
        currentEdges = currentEdges.filter(
          (e) => !(e.source === prevNode.id && e.id.includes("_next")),
        );
      }

      if (isDLL && nextNode) {
        currentEdges = currentEdges.filter(
          (e) => !(e.source === nextNode.id && e.id.includes("_prev")),
        );
      }

      if (prevNode) {
        currentEdges.push(createEdge(prevNode.id, newNode.id, false));
        if (isDLL) currentEdges.push(createEdge(newNode.id, prevNode.id, true));
      }

      if (nextNode) {
        currentEdges.push(createEdge(newNode.id, nextNode.id, false));
        if (isDLL) currentEdges.push(createEdge(nextNode.id, newNode.id, true));
      }

      setEdges([...currentEdges]);
      await sleep(speed * 1.5);

      currentNodes = currentNodes.map((node): Node<LinearNodeData> => {
        if (node.id === newNode.id) {
          return {
            ...node,
            position: { ...node.position, y: 5 },
            data: { ...node.data, status: "idle" as const },
          };
        }
        return node;
      });

      setNodes([...currentNodes]);
      await sleep(speed * 1.5);
      setIsAnimating(false);
    },
    [nodes, setNodes, edges, setEdges, speed, getLogicalNodes, isDLL],
  );

  const deleteAtIndex = useCallback(
    async (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= nodes.length) {
        alert("ไม่มี Index นี้ให้ลบครับ");
        return;
      }

      setIsAnimating(true);
      let currentNodes = getLogicalNodes();
      let currentEdges = [...edges];

      const targetNode = currentNodes.find((n) => n.data.index === targetIndex);
      if (!targetNode) {
        setIsAnimating(false);
        return;
      }

      const deletedX = targetNode.position.x;

      currentNodes = currentNodes.map((node): Node<LinearNodeData> => {
        if (node.id === targetNode.id)
          return { ...node, data: { ...node.data, status: "delete" as const } };
        return node;
      });
      setNodes([...currentNodes]);
      await sleep(speed * 1.5);

      const prevNode = currentNodes.find(
        (n) => n.data.index === targetIndex - 1,
      );
      const nextNode = currentNodes.find(
        (n) => n.data.index === targetIndex + 1,
      );

      currentEdges = currentEdges.filter(
        (e) => e.source !== targetNode.id && e.target !== targetNode.id,
      );

      if (prevNode && nextNode) {
        currentEdges.push(createEdge(prevNode.id, nextNode.id, false));
        if (isDLL)
          currentEdges.push(createEdge(nextNode.id, prevNode.id, true));
      }
      setEdges([...currentEdges]);
      await sleep(speed * 1.5);

      currentNodes = currentNodes.map((node): Node<LinearNodeData> => {
        if (node.id === targetNode.id)
          return { ...node, position: { ...node.position, y: 80 } };
        return node;
      });
      setNodes([...currentNodes]);
      await sleep(speed * 1.5);

      currentNodes = currentNodes.filter((node) => node.id !== targetNode.id);

      currentNodes = currentNodes.map((node): Node<LinearNodeData> => {
        let newX = node.position.x;
        let newIdx = node.data.index as number;

        if (node.position.x > deletedX) {
          newX -= NODE_DISTANCE;
        }

        if (newIdx > targetIndex) {
          newIdx -= 1;
        }

        return {
          ...node,
          position: { ...node.position, x: newX },
          data: { ...node.data, index: newIdx },
        };
      });

      setNodes([...currentNodes]);

      await sleep(speed * 1.5);
      setIsAnimating(false);
    },
    [nodes, setNodes, edges, setEdges, speed, getLogicalNodes, isDLL],
  );

  return { insertAtIndex, deleteAtIndex, isAnimating };
};
