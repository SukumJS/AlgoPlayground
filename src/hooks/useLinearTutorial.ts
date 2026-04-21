import { useState, useCallback, useEffect } from "react";
import type { Node } from "@xyflow/react";
import type { LinearNodeData } from "@/src/components/shared/linearDSNode";

interface ScreenPosition {
  x: number;
  y: number;
}

interface UseLinearDSTutorialProps {
  nodes: Node<LinearNodeData>[];
  flowToScreenPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  setNodes: React.Dispatch<React.SetStateAction<Node<LinearNodeData>[]>>;
  isLinearDS: boolean;
  isLinkedList: boolean;
}

export function useLinearDSTutorial({
  nodes,
  flowToScreenPosition,
  setNodes,
  isLinearDS,
  isLinkedList,
}: UseLinearDSTutorialProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [droppedNodeScreenPos, setDroppedNodeScreenPos] =
    useState<ScreenPosition | null>(null);
  const [node2ScreenPos, setNode2ScreenPos] = useState<ScreenPosition | null>(
    null,
  );
  const [node3ScreenPos, setNode3ScreenPos] = useState<ScreenPosition | null>(
    null,
  );
  const [node1ScreenPos, setNode1ScreenPos] = useState<ScreenPosition | null>(
    null,
  );
  const [sidebarNodePos, setSidebarNodePos] = useState<ScreenPosition | null>(
    null,
  );
  const [trashBinPos, setTrashBinPos] = useState<ScreenPosition | null>(null);
  const [isTrashActive, setIsTrashActive] = useState(false);
  const [dropZoneScreenPos, setDropZoneScreenPos] =
    useState<ScreenPosition | null>(null);

  // กลับไปใช้ขนาด 85 ตามเดิม
  const [nodeMaskSize, setNodeMaskSize] = useState<number>(85);

  const updateTutorialPositions = useCallback(() => {
    if (!showTutorial || nodes.length === 0) return;

    // กลับไปใช้ offset 28 ตามเดิม
    const offset = 28;

    // ฟังก์ชันช่วยหา Node (รองรับทั้งลิสต์ 3 และ 5 ตัว)
    const findNodeByVal = (val: string | number) =>
      nodes.find((n) => String(n.data.value) === String(val));

    const node1 = findNodeByVal(1);
    if (node1)
      setNode1ScreenPos(
        flowToScreenPosition({
          x: node1.position.x + offset,
          y: node1.position.y + offset,
        }),
      );

    const node2 = findNodeByVal(2);
    if (node2)
      setNode2ScreenPos(
        flowToScreenPosition({
          x: node2.position.x + offset,
          y: node2.position.y + offset,
        }),
      );

    const node3 = findNodeByVal(3);
    if (node3)
      setNode3ScreenPos(
        flowToScreenPosition({
          x: node3.position.x + offset,
          y: node3.position.y + offset,
        }),
      );

    // Drop Zone: คำนวณจากโหนดตัวสุดท้ายในลิสต์เสมอ
    const lastNode = nodes[nodes.length - 1];
    if (lastNode) {
      setDropZoneScreenPos(
        flowToScreenPosition({
          x: lastNode.position.x + (isLinkedList ? 120 : 65) + offset,
          y: lastNode.position.y + offset,
        }),
      );
    }

    const droppedNode = findNodeByVal(6);
    if (droppedNode)
      setDroppedNodeScreenPos(
        flowToScreenPosition({
          x: droppedNode.position.x + offset,
          y: droppedNode.position.y + offset,
        }),
      );

    const timer = setTimeout(() => {
      const targetSidebarNode = document.querySelector(
        '[data-tutorial-target="sidebar-linear-node"]',
      );
      if (targetSidebarNode) {
        const rect = targetSidebarNode.getBoundingClientRect();
        setSidebarNodePos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    }, 50);

    setTrashBinPos({ x: window.innerWidth / 2, y: window.innerHeight - 140 });
    return () => clearTimeout(timer);
  }, [nodes, showTutorial, flowToScreenPosition, isLinkedList]);

  useEffect(() => {
    let frameId: number;
    const loop = () => {
      updateTutorialPositions();
      frameId = requestAnimationFrame(loop);
    };
    if (showTutorial) frameId = requestAnimationFrame(loop);
    window.addEventListener("resize", updateTutorialPositions);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateTutorialPositions);
    };
  }, [showTutorial, updateTutorialPositions]);

  useEffect(() => {
    if (isLinearDS) {
      const timer = setTimeout(() => setShowTutorial(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isLinearDS]);

  useEffect(() => {
    if (tutorialStep === 2) {
      const timer = setTimeout(() => setTutorialStep(3), 1500);
      return () => clearTimeout(timer);
    }
  }, [tutorialStep]);

  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    setShowCompletionModal(true);
  }, []);

  useEffect(() => {
    if (showTutorial && tutorialStep === 4) {
      const isNode1Alive = nodes.some((n) => String(n.data.value) === "1");

      if (!isNode1Alive) {
        queueMicrotask(() => {
          setIsTrashActive(false);
          setTutorialStep(5);
        });
      }
    }
  }, [nodes, tutorialStep, showTutorial, handleTutorialComplete]);

  const handleTutorialDropSuccess = useCallback(() => {
    if (showTutorial && tutorialStep === 0) setTutorialStep(1);
  }, [showTutorial, tutorialStep]);

  const onNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node<LinearNodeData>) => {
      if (showTutorial && tutorialStep === 3) {
        if (String(node.data.value) === "1") setTutorialStep(4);
      }
    },
    [showTutorial, tutorialStep],
  );

  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node<LinearNodeData>) => {
      if (showTutorial && tutorialStep === 4) {
        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        const dist = Math.sqrt(
          Math.pow(event.clientX - trashX, 2) +
            Math.pow(event.clientY - trashY, 2),
        );
        setIsTrashActive(dist < 150);
      }
    },
    [showTutorial, tutorialStep],
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node<LinearNodeData>) => {
      if (!showTutorial) return;
      if (tutorialStep === 1 && String(node.data.value) === "2")
        setTutorialStep(2);

      if (tutorialStep === 4) {
        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        const dist = Math.sqrt(
          Math.pow(event.clientX - trashX, 2) +
            Math.pow(event.clientY - trashY, 2),
        );
        if (dist < 80) {
          const spacing = isLinkedList ? 120 : 65;
          setNodes((nds) => {
            const remainingNodes = nds.filter((n) => n.id !== node.id);
            remainingNodes.sort((a, b) => a.data.index - b.data.index);
            return remainingNodes.map((n, i) => ({
              ...n,
              data: { ...n.data, index: i },
              position: { x: i * spacing, y: 5 },
            }));
          });
          setIsTrashActive(false);
        }
      }
    },
    [showTutorial, tutorialStep, setNodes, isLinkedList],
  );

  return {
    showTutorial,
    tutorialStep,
    showCompletionModal,
    isTrashActive,
    droppedNodeScreenPos,
    node2ScreenPos,
    node3ScreenPos,
    node1ScreenPos,
    sidebarNodePos,
    trashBinPos,
    dropZoneScreenPos,
    nodeMaskSize,
    setShowTutorial,
    setTutorialStep,
    setShowCompletionModal,
    handleTutorialComplete,
    handleTutorialDropSuccess,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
  };
}
