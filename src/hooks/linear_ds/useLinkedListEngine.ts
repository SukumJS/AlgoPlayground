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
const INSERT_LINES_SLL = [2, 8, 12];
const DELETE_LINES_SLL = [14, 18, 22];
const INSERT_LINES_DLL = [2, 7, 12];
const DELETE_LINES_DLL = [14, 17, 21];
const IDLE_CODE_HIGHLIGHT = {
  currentStep: 0,
  stepToCodeLine: [1],
};

export type LinkedListCodeDrive = typeof IDLE_CODE_HIGHLIGHT;

export const useLinkedListEngine = (
  nodes: Node<LinearNodeData>[],
  setNodes: React.Dispatch<React.SetStateAction<Node<LinearNodeData>[]>>,
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  speed: number = 1000,
  algorithm?: string,
) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [codeDrive, setCodeDrive] =
    useState<LinkedListCodeDrive>(IDLE_CODE_HIGHLIGHT);

  // เพิ่ม State สำหรับเก็บข้อความแจ้งเตือน
  const [warningText, setWarningText] = useState<string | null>(null);

  const isDLL = algorithm === "doubly-linked-list";
  const insertLines = isDLL ? INSERT_LINES_DLL : INSERT_LINES_SLL;
  const deleteLines = isDLL ? DELETE_LINES_DLL : DELETE_LINES_SLL;

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const getLogicalNodes = useCallback(() => {
    return [...nodes].sort(
      (a, b) => (a.data.index as number) - (b.data.index as number),
    );
  }, [nodes]);

  const insertAtIndex = useCallback(
    async (targetIndex: number, value: number) => {
      const normalizedIndex = Number(targetIndex);
      const normalizedValue = Number(value);
      const currentNodesLength = getLogicalNodes().length;

      if (
        !Number.isInteger(normalizedIndex) ||
        !Number.isFinite(normalizedValue)
      ) {
        setWarningText("Please enter a valid integer index and numeric value.");
        setTimeout(() => setWarningText(null), 3000);
        return;
      }

      // เปลี่ยนเป็นแจ้งเตือนภาษาอังกฤษแทน alert
      if (
        normalizedIndex < 0 ||
        normalizedIndex > currentNodesLength ||
        currentNodesLength >= 50
      ) {
        setWarningText(
          "Invalid index or linked list has reached the maximum size of 50.",
        );
        setTimeout(() => setWarningText(null), 3000);
        return;
      }

      setIsAnimating(true);
      setCodeDrive({ currentStep: 0, stepToCodeLine: insertLines });
      setWarningText(null); // ล้างข้อความเก่าทิ้งถ้าผ่านเงื่อนไข

      let currentNodes = getLogicalNodes();
      let currentEdges = [...edges];

      const prevNodeForPos =
        normalizedIndex > 0
          ? currentNodes.find((n) => n.data.index === normalizedIndex - 1)
          : null;

      const startX = prevNodeForPos
        ? prevNodeForPos.position.x + NODE_DISTANCE
        : 0;

      const newNode: Node<LinearNodeData> = {
        id: getNewId(),
        type: "custom",
        position: { x: startX, y: -80 },
        data: {
          value: normalizedValue,
          status: "processing" as const,
          index: normalizedIndex,
        },
      };

      currentNodes.push(newNode);
      setNodes([...currentNodes]);
      await sleep(speed * 1.5);
      setCodeDrive({ currentStep: 1, stepToCodeLine: insertLines });

      //อัปเดตตำแหน่ง (Visual) และ Index (Logical) แบบแยกออกจากกัน
      currentNodes = currentNodes.map((node): Node<LinearNodeData> => {
        if (node.id !== newNode.id) {
          let newX = node.position.x;
          let newIdx = node.data.index as number;

          if (node.position.x >= startX) {
            newX += NODE_DISTANCE;
          }
          if (newIdx >= normalizedIndex) {
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
        (n) => n.data.index === normalizedIndex - 1,
      );
      const nextNode = currentNodes.find(
        (n) => n.data.index === normalizedIndex + 1 && n.id !== newNode.id,
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
      setCodeDrive({ currentStep: 2, stepToCodeLine: insertLines });

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
      setCodeDrive(IDLE_CODE_HIGHLIGHT);
      setIsAnimating(false);
    },
    [
      nodes,
      setNodes,
      edges,
      setEdges,
      speed,
      getLogicalNodes,
      isDLL,
      insertLines,
    ],
  );

  const deleteAtIndex = useCallback(
    async (targetIndex: number) => {
      //  เปลี่ยนเป็นแจ้งเตือนภาษาอังกฤษแทน alert
      if (targetIndex < 0 || targetIndex >= nodes.length) {
        setWarningText("Invalid index. No element to delete.");
        setTimeout(() => setWarningText(null), 3000);
        return;
      }

      setIsAnimating(true);
      setCodeDrive({ currentStep: 0, stepToCodeLine: deleteLines });
      setWarningText(null); // ล้างข้อความเก่าทิ้งถ้าผ่านเงื่อนไข

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
      setCodeDrive({ currentStep: 1, stepToCodeLine: deleteLines });

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
      setCodeDrive({ currentStep: 2, stepToCodeLine: deleteLines });
      await sleep(speed);
      setCodeDrive(IDLE_CODE_HIGHLIGHT);
      setIsAnimating(false);
    },
    [
      nodes,
      setNodes,
      edges,
      setEdges,
      speed,
      getLogicalNodes,
      isDLL,
      deleteLines,
    ],
  );

  return {
    insertAtIndex,
    deleteAtIndex,
    isAnimating,
    warningText,
    codeDrive,
  };
};
