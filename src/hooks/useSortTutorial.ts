import { useState, useCallback, useEffect } from "react";
import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

interface ScreenPosition {
  x: number;
  y: number;
}

interface UseSortTutorialProps {
  nodes: Node<SortNodeData>[];
  flowToScreenPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  isSort: boolean;
}

export function useSortTutorial({
  nodes,
  flowToScreenPosition,
  setNodes,
  isSort,
}: UseSortTutorialProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [droppedNodeScreenPos, setDroppedNodeScreenPos] =
    useState<ScreenPosition | null>(null);
  const [node34ScreenPos, setNode34ScreenPos] = useState<ScreenPosition | null>(
    null,
  );
  const [node64ScreenPos, setNode64ScreenPos] = useState<ScreenPosition | null>(
    null,
  );
  const [node3ScreenPos, setNode3ScreenPos] = useState<ScreenPosition | null>(
    null,
  );
  const [sidebarNodePos, setSidebarNodePos] = useState<ScreenPosition | null>(
    null,
  );
  const [trashBinPos, setTrashBinPos] = useState<ScreenPosition | null>(null);
  const [isTrashActive, setIsTrashActive] = useState(false);
  const [dropZoneScreenPos, setDropZoneScreenPos] =
    useState<ScreenPosition | null>(null);

  // เพิ่ม State เก็บขนาดกล่องแบบไดนามิก
  const [nodeMaskSize, setNodeMaskSize] = useState<number>(85);

  const updateTutorialPositions = useCallback(() => {
    if (!showTutorial) return;

    // คำนวณขนาดซูม (Zoom Scale) ของ React Flow ณ ตอนนั้น
    // โดยการวัดระยะห่างบนหน้าจอระหว่างจุด 0 และจุด 56 (ขนาดฐานของกล่อง)
    const p1 = flowToScreenPosition({ x: 0, y: 0 });
    const p2 = flowToScreenPosition({ x: 56, y: 0 }); // กล่องกว้าง 56px (w-14)
    const actualNodeSizeOnScreen = Math.abs(p2.x - p1.x);

    // บวกพื้นที่ขอบ (Padding) เข้าไปอีก 20px ให้เห็นเงาสวยๆ
    setNodeMaskSize(actualNodeSizeOnScreen + 20);

    const offset = 28;

    const node34 = nodes.find((n) => String(n.data.value) === "34");
    if (node34)
      setNode34ScreenPos(
        flowToScreenPosition({
          x: node34.position.x + offset,
          y: node34.position.y + offset,
        }),
      );

    const node64 = nodes.find((n) => String(n.data.value) === "64");
    if (node64)
      setNode64ScreenPos(
        flowToScreenPosition({
          x: node64.position.x + offset,
          y: node64.position.y + offset,
        }),
      );

    const node3 = nodes.find((n) => String(n.data.value) === "3");
    if (node3)
      setNode3ScreenPos(
        flowToScreenPosition({
          x: node3.position.x + offset,
          y: node3.position.y + offset,
        }),
      );

    const node25 = nodes.find((n) => String(n.data.value) === "25");
    if (node25) {
      // ช่องถัดไปขยับไป 65px (ระยะห่างระหว่าง node)
      setDropZoneScreenPos(
        flowToScreenPosition({
          x: node25.position.x + 65 + offset,
          y: node25.position.y + offset,
        }),
      );
    }

    const droppedNode = nodes.find((n) => String(n.data.value) === "11");
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

  // แก้บั๊ก Cascading Renders ด้วย requestAnimationFrame
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

  // แก้บั๊กเปิด Tutorial โต้งๆ ด้วย setTimeout
  useEffect(() => {
    if (isSort) {
      const timer = setTimeout(() => setShowTutorial(true), 0);
      return () => clearTimeout(timer);
    }
  }, [isSort]);

  useEffect(() => {
    if (showTutorial) {
      const timer = setTimeout(() => updateTutorialPositions(), 500);
      return () => clearTimeout(timer);
    }
  }, [showTutorial, updateTutorialPositions]);

  useEffect(() => {
    if (tutorialStep === 2) {
      const timer = setTimeout(() => {
        setTutorialStep(3);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [tutorialStep]);

  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    setShowCompletionModal(true);
  }, []);

  // เพิ่ม useEffect ตัวนี้เพื่อดักจับว่า "กล่องถูกลบไปจริงๆ หรือยัง"
  // และแก้บั๊ก Cascading Renders ด้วย setTimeout
  useEffect(() => {
    if (!showTutorial) return;

    if (tutorialStep === 4) {
      // สำหรับหน้า Sort เป้าหมายที่จะถูกลบคือกล่องเลข "3"
      const isNode3Alive = nodes.some((n) => String(n.data.value) === "3");

      if (!isNode3Alive) {
        const timer = setTimeout(() => {
          setIsTrashActive(false);
          handleTutorialComplete();
        }, 0);

        return () => clearTimeout(timer);
      }
    }
  }, [nodes, tutorialStep, showTutorial, handleTutorialComplete]);

  const handleTutorialDropSuccess = useCallback(() => {
    if (showTutorial && tutorialStep === 0) {
      setTutorialStep(1);
    }
  }, [showTutorial, tutorialStep]);

  const onNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node<SortNodeData>) => {
      if (showTutorial && tutorialStep === 3) {
        if (String(node.data.value) === "3") {
          setTutorialStep(4);
        }
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

      if (tutorialStep === 1) {
        if (String(node.data.value) === "34") {
          setTutorialStep(2);
        }
      }

      if (tutorialStep === 4) {
        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        if (
          Math.sqrt(
            Math.pow(event.clientX - trashX, 2) +
              Math.pow(event.clientY - trashY, 2),
          ) < 60
        ) {
          // ลงถังขยะ ให้ลบทิ้ง พร้อมจัดแถวกล่องที่เหลือใหม่ให้ชิดกัน!
          setNodes((nds) => {
            // 1. คัดเอาตัวที่ถูกลบออกไป
            const remainingNodes = nds.filter((n) => n.id !== node.id);

            // 2. เรียงลำดับกล่องตาม index เดิม เพื่อรักษาลำดับที่มันสลับกันไว้แล้ว
            remainingNodes.sort((a, b) => a.data.index - b.data.index);

            // 3. รัน Index ใหม่ให้ต่อเนื่อง (0, 1, 2...) และอัปเดตพิกัด X ให้เข้าแถวชิดกัน (index * 65)
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
    node34ScreenPos,
    node64ScreenPos,
    node3ScreenPos,
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
