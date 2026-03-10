import { useState, useCallback, useEffect } from "react";
import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

interface ScreenPosition {
  x: number;
  y: number;
}

interface UseSearchTutorialProps {
  nodes: Node<SortNodeData>[];
  flowToScreenPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  isSearch: boolean;
}

export function useSearchTutorial({
  nodes,
  flowToScreenPosition,
  setNodes,
  isSearch,
}: UseSearchTutorialProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [droppedNodeScreenPos, setDroppedNodeScreenPos] =
    useState<ScreenPosition | null>(null);
  const [node2ScreenPos, setNode2ScreenPos] = useState<ScreenPosition | null>(
    null,
  ); // แทน 34
  const [node3ScreenPos, setNode3ScreenPos] = useState<ScreenPosition | null>(
    null,
  ); // แทน 64
  const [node1ScreenPos, setNode1ScreenPos] = useState<ScreenPosition | null>(
    null,
  ); // แทน 3
  const [sidebarNodePos, setSidebarNodePos] = useState<ScreenPosition | null>(
    null,
  );
  const [trashBinPos, setTrashBinPos] = useState<ScreenPosition | null>(null);
  const [isTrashActive, setIsTrashActive] = useState(false);
  const [dropZoneScreenPos, setDropZoneScreenPos] =
    useState<ScreenPosition | null>(null);
  const [nodeMaskSize, setNodeMaskSize] = useState<number>(85);

  const updateTutorialPositions = useCallback(() => {
    if (!showTutorial) return;

    const p1 = flowToScreenPosition({ x: 0, y: 0 });
    const p2 = flowToScreenPosition({ x: 56, y: 0 });
    const actualNodeSizeOnScreen = Math.abs(p2.x - p1.x);
    setNodeMaskSize(actualNodeSizeOnScreen + 20);

    const offset = 28;

    // หาเลข 2 (ใช้สลับ)
    const node2 = nodes.find((n) => String(n.data.value) === "2");
    if (node2)
      setNode2ScreenPos(
        flowToScreenPosition({
          x: node2.position.x + offset,
          y: node2.position.y + offset,
        }),
      );

    // หาเลข 3 (เป้าหมายสลับ)
    const node3 = nodes.find((n) => String(n.data.value) === "3");
    if (node3)
      setNode3ScreenPos(
        flowToScreenPosition({
          x: node3.position.x + offset,
          y: node3.position.y + offset,
        }),
      );

    // หาเลข 1 (เป้าหมายลงถังขยะ)
    const node1 = nodes.find((n) => String(n.data.value) === "1");
    if (node1)
      setNode1ScreenPos(
        flowToScreenPosition({
          x: node1.position.x + offset,
          y: node1.position.y + offset,
        }),
      );

    // หาเลข 5 เพื่อวางเป้าหมาย Drop Zone ต่อท้าย
    const node5 = nodes.find((n) => String(n.data.value) === "5");
    if (node5) {
      setDropZoneScreenPos(
        flowToScreenPosition({
          x: node5.position.x + 65 + offset,
          y: node5.position.y + offset,
        }),
      );
    }

    // หากล่องที่เพิ่ง Drop ลงมา (เช็คจาก id ที่สร้างใหม่)
    const droppedNode = nodes.find((n) => n.id.startsWith("dndnode_"));
    if (droppedNode)
      setDroppedNodeScreenPos(
        flowToScreenPosition({
          x: droppedNode.position.x + offset,
          y: droppedNode.position.y + offset,
        }),
      );

    setTimeout(() => {
      const targetSidebarNode = document.querySelector(
        '[data-tutorial-target="sidebar-sort-node"]',
      );
      if (targetSidebarNode) {
        const rect = targetSidebarNode.getBoundingClientRect();
        setSidebarNodePos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    }, 100);

    setTrashBinPos({ x: window.innerWidth / 2, y: window.innerHeight - 140 });
  }, [nodes, showTutorial, flowToScreenPosition]);

  // 🎯 แก้บั๊ก Cascading Renders ด้วย requestAnimationFrame
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      updateTutorialPositions();
    });
    window.addEventListener("resize", updateTutorialPositions);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateTutorialPositions);
    };
  }, [updateTutorialPositions]);

  // 🎯 แก้บั๊กเปิด Tutorial โต้งๆ ด้วย setTimeout
  useEffect(() => {
    if (isSearch) {
      const timer = setTimeout(() => setShowTutorial(true), 0);
      return () => clearTimeout(timer);
    }
  }, [isSearch]);

  useEffect(() => {
    if (showTutorial) {
      const timer = setTimeout(() => updateTutorialPositions(), 500);
      return () => clearTimeout(timer);
    }
  }, [showTutorial, updateTutorialPositions]);

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

  const handleTutorialDropSuccess = useCallback(() => {
    if (showTutorial && tutorialStep === 0) setTutorialStep(1);
  }, [showTutorial, tutorialStep]);

  const onNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node<SortNodeData>) => {
      if (
        showTutorial &&
        tutorialStep === 3 &&
        String(node.data.value) === "1"
      ) {
        setTutorialStep(4);
      }
    },
    [showTutorial, tutorialStep],
  );

  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node<SortNodeData>) => {
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
    (event: React.MouseEvent, node: Node<SortNodeData>) => {
      if (!showTutorial) return;

      if (tutorialStep === 1 && String(node.data.value) === "2")
        setTutorialStep(2);

      if (tutorialStep === 4) {
        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        if (
          Math.sqrt(
            Math.pow(event.clientX - trashX, 2) +
              Math.pow(event.clientY - trashY, 2),
          ) < 60
        ) {
          setNodes((nds) => {
            const remainingNodes = nds.filter((n) => n.id !== node.id);
            remainingNodes.sort((a, b) => a.data.index - b.data.index);
            return remainingNodes.map((n, i) => ({
              ...n,
              data: { ...n.data, index: i },
              position: { x: i * 65, y: 5 },
            }));
          });
          setIsTrashActive(false);
          handleTutorialComplete();
        }
      }
    },
    [showTutorial, tutorialStep, setNodes, handleTutorialComplete],
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
