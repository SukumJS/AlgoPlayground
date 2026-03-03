"use client";

import { useState, useCallback, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";

interface ScreenPosition {
  x: number;
  y: number;
}

interface UseGraphTutorialProps {
  nodes: Node[];
  edges: Edge[];
  flowToScreenPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  };
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  isGraph: boolean;
}

/**
 * Graph Tutorial Hook
 *
 * 10 Steps:
 * 0: Tap node 69 to start (highlight)
 * 1: Tap node 70 to create link (69→70)
 * 2: Type weight '2' for the new edge
 * 3: Value Set! confirmation
 * 4: Tap existing weight (64→39, weight 4)
 * 5: Type weight '5' to edit
 * 6: Value Set! confirmation
 * 7: Click node 70 (highlight for delete)
 * 8: Hold and drag to trash bin
 * 9: Tutorial Completed!
 */
export function useGraphTutorial({
  nodes,
  edges,
  flowToScreenPosition,
  setNodes,
  setEdges,
  isGraph,
}: UseGraphTutorialProps) {
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(() => isGraph);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Weight input state
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState("");
  const [pendingEdge, setPendingEdge] = useState<{
    source: string;
    target: string;
  } | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);

  // Screen positions for spotlight
  const [node69ScreenPos, setNode69ScreenPos] = useState<ScreenPosition | null>(
    null,
  );
  const [node70ScreenPos, setNode70ScreenPos] = useState<ScreenPosition | null>(
    null,
  );
  const [edge64to39WeightPos, setEdge64to39WeightPos] =
    useState<ScreenPosition | null>(null);
  const [trashBinPos, setTrashBinPos] = useState<ScreenPosition | null>(null);
  const [isTrashActive, setIsTrashActive] = useState(false);

  // Track first selected node for linking
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Update screen positions when nodes/edges change
  const updateTutorialPositions = useCallback(() => {
    if (!showTutorial) return;

    // Find node 69
    const node69 = nodes.find((n) => String(n.data?.label) === "69");
    if (node69) {
      const screenPos = flowToScreenPosition({
        x: node69.position.x + 28,
        y: node69.position.y + 28,
      });
      setNode69ScreenPos(screenPos);
    }

    // Find node 70
    const node70 = nodes.find((n) => String(n.data?.label) === "70");
    if (node70) {
      const screenPos = flowToScreenPosition({
        x: node70.position.x + 28,
        y: node70.position.y + 28,
      });
      setNode70ScreenPos(screenPos);
    }

    // Find edge 64→39 weight position (midpoint of edge)
    const edge64to39 = edges.find((e) => {
      const sourceNode = nodes.find((n) => n.id === e.source);
      const targetNode = nodes.find((n) => n.id === e.target);
      return (
        String(sourceNode?.data?.label) === "64" &&
        String(targetNode?.data?.label) === "39"
      );
    });

    if (edge64to39) {
      const sourceNode = nodes.find((n) => n.id === edge64to39.source);
      const targetNode = nodes.find((n) => n.id === edge64to39.target);
      if (sourceNode && targetNode) {
        const midX = (sourceNode.position.x + targetNode.position.x) / 2 + 28;
        const midY = (sourceNode.position.y + targetNode.position.y) / 2 + 28;
        const screenPos = flowToScreenPosition({ x: midX, y: midY });
        setEdge64to39WeightPos(screenPos);
      }
    }

    // Trash bin position (bottom center)
    setTrashBinPos({
      x: window.innerWidth / 2,
      y: window.innerHeight - 140,
    });
  }, [nodes, edges, showTutorial, flowToScreenPosition]);

  // Initial position update & Resize listener
  useEffect(() => {
    // Schedule asynchronously to avoid synchronous setState in effect body
    const rafId = requestAnimationFrame(updateTutorialPositions);

    window.addEventListener("resize", updateTutorialPositions);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateTutorialPositions);
    };
  }, [updateTutorialPositions]);

  // Trigger position update when tutorial becomes active
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
      if (!showTutorial) return;

      const nodeLabel = String(node.data?.label);

      if (tutorialStep === 0) {
        // Step 0: Click node 69 to start
        if (nodeLabel === "69") {
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
          setTutorialStep(1);
        }
      } else if (tutorialStep === 1) {
        // Step 1: Click node 70 to create link (69→70)
        if (nodeLabel === "70" && selectedNodeId) {
          // Store pending edge (will be created after weight input)
          setPendingEdge({ source: selectedNodeId, target: node.id });
          // Clear node highlight
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
          // Show weight input
          setShowWeightInput(true);
          setWeightInputValue("");
          setTutorialStep(2);
        }
      } else if (tutorialStep === 7) {
        // Step 7: Click node 70 (highlight for delete)
        if (nodeLabel === "70") {
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
          setTutorialStep(8);
        }
      }
    },
    [showTutorial, tutorialStep, selectedNodeId, setNodes],
  );

  // Handle weight click for editing (Step 4)
  const handleWeightClick = useCallback(
    (edgeId: string) => {
      if (!showTutorial || tutorialStep !== 4) return;

      // Find the edge
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      // Check if it's edge 64→39
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (
        String(sourceNode?.data?.label) === "64" &&
        String(targetNode?.data?.label) === "39"
      ) {
        setEditingEdgeId(edgeId);
        setShowWeightInput(true);
        setWeightInputValue("");
        setTutorialStep(5);
      }
    },
    [showTutorial, tutorialStep, edges, nodes],
  );

  // Handle weight input change
  const handleWeightInputChange = useCallback((value: string) => {
    setWeightInputValue(value);
  }, []);

  // Handle weight confirmation
  const handleWeightConfirm = useCallback(() => {
    if (tutorialStep === 2 && pendingEdge) {
      // Create new edge 69→70 with weight
      const weight = parseInt(weightInputValue) || 2;
      const newEdge: Edge = {
        id: `e-${pendingEdge.source}-${pendingEdge.target}`,
        source: pendingEdge.source,
        target: pendingEdge.target,
        type: "floatingEdge",
        label: String(weight),
        data: { weight },
        style: { stroke: "#222121", strokeWidth: 1 },
        markerEnd: {
          type: "arrowclosed" as const,
          width: 25,
          height: 25,
          color: "#222121",
        },
      };
      setEdges((eds) => [...eds, newEdge]);
      setPendingEdge(null);
      setShowWeightInput(false);
      setWeightInputValue("");
      setTutorialStep(3);

      // Auto-advance to step 4 after short delay
      setTimeout(() => {
        setTutorialStep(4);
      }, 1500);
    } else if (tutorialStep === 5 && editingEdgeId) {
      // Edit existing edge weight (64→39) - update BOTH label and data.weight
      const weight = parseInt(weightInputValue) || 5;
      setEdges((eds) =>
        eds.map((e) =>
          e.id === editingEdgeId
            ? { ...e, label: String(weight), data: { ...e.data, weight } }
            : e,
        ),
      );
      setEditingEdgeId(null);
      setShowWeightInput(false);
      setWeightInputValue("");
      setTutorialStep(6);

      // Auto-advance to step 7 after short delay
      setTimeout(() => {
        setTutorialStep(7);
      }, 1500);
    }
  }, [tutorialStep, pendingEdge, editingEdgeId, weightInputValue, setEdges]);

  // Handle node drag for trash bin glow effect (Step 8)
  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (showTutorial && tutorialStep === 8) {
        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        const dropTargetRadius = 150;

        const dist = Math.sqrt(
          Math.pow(event.clientX - trashX, 2) +
            Math.pow(event.clientY - trashY, 2),
        );

        setIsTrashActive(dist < dropTargetRadius);

        // Update node danger state
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: {
              ...n.data,
              isDanger: n.id === node.id ? dist < dropTargetRadius : false,
            },
          })),
        );
      }
    },
    [showTutorial, tutorialStep, setNodes],
  );

  // Handle node drag stop for trash bin deletion (Step 8)
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (showTutorial && tutorialStep === 8) {
        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        const dropTargetRadius = 60;

        const dist = Math.sqrt(
          Math.pow(event.clientX - trashX, 2) +
            Math.pow(event.clientY - trashY, 2),
        );

        if (dist < dropTargetRadius) {
          // Delete node and connected edges
          setNodes((nds) => nds.filter((n) => n.id !== node.id));
          setEdges((eds) =>
            eds.filter((e) => e.source !== node.id && e.target !== node.id),
          );
          // Complete tutorial
          setTutorialStep(9);
          handleTutorialComplete();
        } else {
          // Clear danger state
          setNodes((nds) =>
            nds.map((n) => ({
              ...n,
              data: { ...n.data, isDanger: false },
            })),
          );
        }

        setIsTrashActive(false);
      }
    },
    [showTutorial, tutorialStep, setNodes, setEdges, handleTutorialComplete],
  );

  return {
    // State
    showTutorial,
    tutorialStep,
    showCompletionModal,
    isTrashActive,
    showWeightInput,
    weightInputValue,
    pendingEdge,

    // Screen positions
    node69ScreenPos,
    node70ScreenPos,
    edge64to39WeightPos,
    trashBinPos,

    // Setters
    setShowTutorial,
    setTutorialStep,
    setShowCompletionModal,

    // Handlers
    handleTutorialComplete,
    handleNodeClick,
    handleWeightClick,
    handleWeightInputChange,
    handleWeightConfirm,
    onNodeDrag,
    onNodeDragStop,
  };
}
