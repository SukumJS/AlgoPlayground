import { useState, useCallback, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";

interface ScreenPosition {
  x: number;
  y: number;
}

interface UseTreeTutorialProps {
  nodes: Node[];
  flowToScreenPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  isTree: boolean;
}

export function useTreeTutorial({
  nodes,
  flowToScreenPosition,
  setNodes,
  setEdges,
  isTree,
}: UseTreeTutorialProps) {
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Dynamic screen positions for tutorial spotlight/tooltips
  const [droppedNodeScreenPos, setDroppedNodeScreenPos] =
    useState<ScreenPosition | null>(null);
  const [glowZoneScreenPos, setGlowZoneScreenPos] =
    useState<ScreenPosition | null>(null);
  const [node30ScreenPos, setNode30ScreenPos] = useState<ScreenPosition | null>(
    null,
  );
  const [node90ScreenPos, setNode90ScreenPos] = useState<ScreenPosition | null>(
    null,
  );
  const [sidebarNode3Pos, setSidebarNode3Pos] = useState<ScreenPosition | null>(
    null,
  );
  const [trashBinPos, setTrashBinPos] = useState<ScreenPosition | null>(null);
  const [isTrashActive, setIsTrashActive] = useState(false);

  // Track selected node for linking in tutorial
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Compute screen positions for nodes when nodes change or window resizes
  const updateTutorialPositions = useCallback(() => {
    if (!showTutorial) return;

    // Find dropped node 3 (id starts with 'dndnode_')
    const droppedNode = nodes.find((n) => n.id.startsWith("dndnode_"));
    if (droppedNode) {
      const screenPos = flowToScreenPosition({
        x: droppedNode.position.x + 28, // Center of node (56px / 2)
        y: droppedNode.position.y + 28,
      });
      setDroppedNodeScreenPos(screenPos);
    }

    // Drop Zone Position (Step 1)
    // 5 and 285 correspond to GLOW_ZONE.x and GLOW_ZONE.y imported from tutorial_tree later,
    // we'll just hardcode them right here for projection to avoid circular imports.
    const glowPos = flowToScreenPosition({ x: 5 + 28, y: 285 + 28 });
    setGlowZoneScreenPos(glowPos);

    // Find node 30 (label === "30")
    const node30 = nodes.find(
      (n) => n.data?.label === "30" || n.data?.label === 30,
    );
    if (node30) {
      const screenPos = flowToScreenPosition({
        x: node30.position.x + 28, // Center of node
        y: node30.position.y + 28,
      });
      setNode30ScreenPos(screenPos);
    }

    // Find node 90 (label === "90") for step 5
    const node90 = nodes.find(
      (n) => n.data?.label === "90" || n.data?.label === 90,
    );
    if (node90) {
      const screenPos = flowToScreenPosition({
        x: node90.position.x + 28, // Center of node
        y: node90.position.y + 28,
      });
      setNode90ScreenPos(screenPos);
    }

    // Find Sidebar Node 3 for Step 1 spotlight
    // Use data-tutorial-target attribute for reliable selection
    const targetNode = document.querySelector(
      '[data-tutorial-target="sidebar-node-3"]',
    );
    if (targetNode) {
      const rect = targetNode.getBoundingClientRect();
      setSidebarNode3Pos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    // Trash bin position logic (matches tutorial.tsx CSS)
    // bottom: 140px, left: 50%
    setTrashBinPos({
      x: window.innerWidth / 2,
      y: window.innerHeight - 140,
    });
  }, [nodes, showTutorial, flowToScreenPosition]);

  // Initial position update & Resize listener
  useEffect(() => {
    //  ครอบด้วย requestAnimationFrame เพื่อให้ React ไม่มองว่าเป็นการอัปเดตแบบ Synchronous ทันที
    const frameId = requestAnimationFrame(() => {
      updateTutorialPositions();
    });

    window.addEventListener("resize", updateTutorialPositions);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateTutorialPositions);
    };
  }, [updateTutorialPositions]);

  // Check if user needs to see tutorial (default: show if tree type)
  useEffect(() => {
    if (isTree) {
      // TODO: Check Firebase here
      // ใช้ setTimeout เพื่อจำลองการรอข้อมูลจาก Firebase และแก้ Error Cascading Renders
      const timer = setTimeout(() => {
        // Default: show tutorial since backend not ready
        setShowTutorial(true);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isTree]);

  // Trigger position update when tutorial becomes active
  // Larger delay to ensure sidebar DOM elements are rendered
  useEffect(() => {
    if (showTutorial) {
      const timer = setTimeout(() => {
        updateTutorialPositions();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showTutorial, updateTutorialPositions]);

  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    setShowCompletionModal(true);
    // TODO: POST to Firebase to mark tutorial as completed
  }, []);

  // Handle node click for tutorial
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (showTutorial) {
        if (tutorialStep === 1) {
          // Step 2: Accept any node dragged from the panel (id starts with 'dndnode_')
          if (node.id.startsWith("dndnode_")) {
            // Highlight the dropped node and set it as selected
            setNodes((nds) =>
              nds.map((n) => ({
                ...n,
                data: {
                  ...n.data,
                  isHighlighted: n.id === node.id,
                  isGlowing: n.id === node.id,
                },
              })),
            );
            setSelectedNodeId(node.id);
            setTutorialStep(2);
          }
        } else if (tutorialStep === 2) {
          // Step 3: Only allow clicking node 30 (t2)
          if (node.data.label === "30") {
            // Create edge from node 3 to node 30
            if (selectedNodeId) {
              const newEdge: Edge = {
                id: `e-${selectedNodeId}-${node.id}`,
                source: node.id, // Parent is node 30
                sourceHandle: "source-bottom-left",
                target: selectedNodeId, // Child is node 3
                targetHandle: "target-top-right",
                type: "straight",
              };
              setEdges((eds) => [...eds, newEdge]);
            }
            // Remove glow from node 3
            setNodes((nds) =>
              nds.map((n) => ({
                ...n,
                data: {
                  ...n.data,
                  isHighlighted: false,
                  isGlowing: false,
                },
              })),
            );
            setSelectedNodeId(null);
            setTutorialStep(3);
          }
        } else if (tutorialStep === 4) {
          // Step 5: Press Node 90
          if (node.data.label === "90" || node.data.label === 90) {
            setNodes((nds) =>
              nds.map((n) => ({
                ...n,
                data: {
                  ...n.data,
                  isHighlighted: n.id === node.id, // Highlight Node 90
                  isGlowing: n.id === node.id,
                },
              })),
            );
            setTutorialStep(5); // Move to Step 6 (Drag to Trash)
          }
        }
      }
    },
    [showTutorial, tutorialStep, selectedNodeId, setNodes, setEdges],
  );

  const handleTutorialDropSuccess = useCallback(() => {
    if (showTutorial && tutorialStep === 0) {
      setTutorialStep(1);
    }
  }, [showTutorial, tutorialStep]);

  // Handle node drag for trash bin glow effect
  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (showTutorial && tutorialStep === 5) {
        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        const dropTargetRadius = 150; // Glow activation radius

        // Calculate distance
        const dist = Math.sqrt(
          Math.pow(event.clientX - trashX, 2) +
            Math.pow(event.clientY - trashY, 2),
        );

        setIsTrashActive(dist < dropTargetRadius);
      }
    },
    [showTutorial, tutorialStep],
  );

  // Handle node drag stop for trash bin deletion
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (showTutorial && tutorialStep === 5) {
        // Trash bin position logic (matches tutorial.tsx CSS)
        // bottom: 140px, left: 50%
        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        const dropTargetRadius = 60; // Hit radius

        // Calculate drop distance
        const dist = Math.sqrt(
          Math.pow(event.clientX - trashX, 2) +
            Math.pow(event.clientY - trashY, 2),
        );

        if (dist < dropTargetRadius) {
          // Delete the node
          setNodes((nds) => nds.filter((n) => n.id !== node.id));
          // Complete tutorial
          handleTutorialComplete();
        }
      }
    },
    [showTutorial, tutorialStep, setNodes, handleTutorialComplete],
  );

  return {
    // State
    showTutorial,
    tutorialStep,
    showCompletionModal,
    isTrashActive,

    // Screen positions
    glowZoneScreenPos,
    droppedNodeScreenPos,
    node30ScreenPos,
    node90ScreenPos,
    sidebarNode3Pos,
    trashBinPos,

    // Setters
    setShowTutorial,
    setTutorialStep,
    setShowCompletionModal,

    // Handlers
    handleTutorialComplete,
    handleNodeClick,
    handleTutorialDropSuccess,
    onNodeDrag,
    onNodeDragStop,
  };
}
