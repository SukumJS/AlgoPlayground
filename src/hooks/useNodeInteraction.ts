"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";

interface UseNodeInteractionProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  isTree: boolean;
  isGraph: boolean;
  isTutorialActive: boolean;
  /** true = directed graph (Dijkstra), false = undirected. Defaults to true. */
  directed?: boolean;
  /** true = weighted edges (Dijkstra, Prim, Kruskal), false = unweighted (BFS/DFS). Defaults to directed. */
  weighted?: boolean;
}

interface UseNodeInteractionReturn {
  // State
  selectedNodeId: string | null;
  showTrashBin: boolean;
  isTrashActive: boolean;

  // Weight modal state
  showWeightModal: boolean;
  weightInputValue: string;
  handleWeightInputChange: (value: string) => void;
  handleWeightConfirm: () => void;
  handleWeightModalClose: () => void;

  // Handlers
  handleNodeClick: (event: React.MouseEvent, node: Node) => void;
  handleNodeDragStart: (event: React.MouseEvent, node: Node) => void;
  handleNodeDrag: (event: React.MouseEvent, node: Node) => void;
  handleNodeDragStop: (event: React.MouseEvent, node: Node) => void;
  handleEdgeClick: (event: React.MouseEvent, edgeId: string) => void;
  handlePaneClick: () => void;

  // Trash bin position
  trashBinPos: { x: number; y: number };
}

/**
 * Universal hook for node interactions across all node types:
 * - Drag and hold 300ms → trash bin appears → drop on trash to delete
 * - Click to select/highlight (tree only: click another to link)
 * Works for tree, graph, and sorting nodes.
 */
export function useNodeInteraction({
  nodes,
  edges,
  setNodes,
  setEdges,
  isTree,
  isGraph,
  isTutorialActive,
  directed = true,
  weighted = directed,
}: UseNodeInteractionProps): UseNodeInteractionReturn {
  // Selection state (used for tree/graph linking)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Drag-to-delete state
  const [showTrashBin, setShowTrashBin] = useState(false);
  const [isTrashActive, setIsTrashActive] = useState(false);
  // Mirror of isTrashActive that updates synchronously, so handleNodeDragStop
  // can read the latest value without racing the React render cycle.
  const isTrashActiveRef = useRef(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const draggingNodeIdRef = useRef<string | null>(null);

  // Weight modal state (for graph linking & edge editing)
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState("");
  const [pendingEdge, setPendingEdge] = useState<{
    sourceId: string;
    targetId: string;
  } | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);

  // Trash bin position (bottom center)
  const [trashBinPos, setTrashBinPos] = useState({ x: 0, y: 0 });

  // Update trash position on mount and resize
  useEffect(() => {
    const updateTrashPos = () => {
      setTrashBinPos({
        x: window.innerWidth / 2,
        y: window.innerHeight - 140,
      });
    };
    updateTrashPos();
    window.addEventListener("resize", updateTrashPos);
    return () => window.removeEventListener("resize", updateTrashPos);
  }, []);

  /**
   * Validate BST rule for linking two nodes (tree-only)
   */
  const validateBSTLink = useCallback(
    (
      parentNode: Node,
      childNode: Node,
      currentEdges: Edge[],
    ): {
      valid: boolean;
      sourceHandle: string;
      targetHandle: string;
      error?: string;
    } => {
      const parentValue = Number(parentNode.data.label);
      const childValue = Number(childNode.data.label);

      if (isNaN(parentValue) || isNaN(childValue)) {
        return {
          valid: false,
          sourceHandle: "",
          targetHandle: "",
          error: "Invalid node values",
        };
      }

      const isLeftChild = childValue < parentValue;
      const sourceHandle = isLeftChild
        ? "source-bottom-left"
        : "source-bottom-right";
      const targetHandle = isLeftChild ? "target-top-right" : "target-top-left";

      const existingEdge = currentEdges.find(
        (e) => e.source === parentNode.id && e.sourceHandle === sourceHandle,
      );

      if (existingEdge) {
        return {
          valid: false,
          sourceHandle,
          targetHandle,
          error: `Parent already has a ${isLeftChild ? "left" : "right"} child`,
        };
      }

      return { valid: true, sourceHandle, targetHandle };
    },
    [],
  );

  /**
   * Handle node click - select or link (tree mode keeps linking behavior)
   */
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (isTutorialActive) return;
      if (showTrashBin) return; // Don't process click if trash was just shown

      if (isGraph) {
        // Graph mode: click to select, click second node to link with weight
        if (selectedNodeId === null) {
          setSelectedNodeId(node.id);
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
        } else if (selectedNodeId === node.id) {
          // Deselect
          setSelectedNodeId(null);
          setNodes((nds) =>
            nds.map((n) => ({
              ...n,
              data: { ...n.data, isHighlighted: false, isGlowing: false },
            })),
          );
        } else {
          // Link: behavior depends on directed/weighted mode
          if (directed) {
            // Directed mode: show weight modal before creating edge
            setPendingEdge({ sourceId: selectedNodeId, targetId: node.id });
            setWeightInputValue("");
            setShowWeightModal(true);
          } else if (weighted) {
            // Undirected + weighted: show weight modal before creating edge (no arrow)
            setPendingEdge({ sourceId: selectedNodeId, targetId: node.id });
            setWeightInputValue("");
            setShowWeightModal(true);
          } else {
            // Undirected mode: create edge immediately (no weight)
            const newEdge: Edge = {
              id: `eg-${selectedNodeId}-${node.id}-${Date.now()}`,
              source: selectedNodeId,
              target: node.id,
              type: "floatingEdge",
              data: { directed: false },
              style: { stroke: "#222121", strokeWidth: 1 },
            };
            setEdges((eds) => [...eds, newEdge]);
          }
          // Clear selection visual
          setNodes((nds) =>
            nds.map((n) => ({
              ...n,
              data: { ...n.data, isHighlighted: false, isGlowing: false },
            })),
          );
          setSelectedNodeId(null);
        }
        return;
      }

      if (!isTree) {
        // Non-tree/non-graph (sorting): click to select/deselect only
        if (selectedNodeId === node.id) {
          setSelectedNodeId(null);
          setNodes((nds) =>
            nds.map((n) => ({
              ...n,
              data: { ...n.data, isHighlighted: false, isGlowing: false },
            })),
          );
        } else {
          setSelectedNodeId(node.id);
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
        }
        return;
      }

      // Tree mode: select or link
      if (selectedNodeId === null) {
        setSelectedNodeId(node.id);
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
      } else if (selectedNodeId === node.id) {
        setSelectedNodeId(null);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: { ...n.data, isHighlighted: false, isGlowing: false },
          })),
        );
      } else {
        // Try to link
        const selectedNode = nodes.find((n) => n.id === selectedNodeId);
        if (!selectedNode) return;

        const validation = validateBSTLink(node, selectedNode, edges);
        if (validation.valid) {
          const newEdge: Edge = {
            id: `e-${node.id}-${selectedNodeId}`,
            source: node.id,
            sourceHandle: validation.sourceHandle,
            target: selectedNodeId,
            targetHandle: validation.targetHandle,
            type: "straight",
          };
          setEdges((eds) => [...eds, newEdge]);
        } else {
          console.warn("Invalid BST link:", validation.error);
        }

        setSelectedNodeId(null);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: { ...n.data, isHighlighted: false, isGlowing: false },
          })),
        );
      }
    },
    [
      isTutorialActive,
      isTree,
      isGraph,
      directed,
      weighted,
      selectedNodeId,
      nodes,
      edges,
      setNodes,
      setEdges,
      validateBSTLink,
      showTrashBin,
    ],
  );

  /**
   * Handle node drag start - start 300ms timer to show trash
   * This is the key change: trash shows after dragging for 300ms (no prior click needed)
   */
  const handleNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (isTutorialActive) return;

      draggingNodeIdRef.current = node.id;

      // Clear any existing timer
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }

      // Start 300ms timer - if still dragging after 300ms, show trash
      holdTimerRef.current = setTimeout(() => {
        setShowTrashBin(true);
      }, 300);
    },
    [isTutorialActive],
  );

  /**
   * Handle node drag - check trash proximity
   */
  const handleNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (isTutorialActive) return;

      if (!showTrashBin) return; // Trash not yet visible

      const trashX = window.innerWidth / 2;
      const trashY = window.innerHeight - 140;
      const dropTargetRadius = 150;

      const dist = Math.sqrt(
        Math.pow(event.clientX - trashX, 2) +
          Math.pow(event.clientY - trashY, 2),
      );

      const isNearTrash = dist < dropTargetRadius;
      isTrashActiveRef.current = isNearTrash;
      setIsTrashActive(isNearTrash);

      // Update node color when near trash
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isDanger: n.id === node.id ? isNearTrash : false,
          },
        })),
      );
    },
    [isTutorialActive, showTrashBin, setNodes],
  );

  /**
   * Handle node drag stop - delete if over trash, otherwise reset
   */
  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Always clear the timer
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }

      if (isTutorialActive) return;

      if (showTrashBin) {
        // Read from ref — state may not have flushed yet if user released
        // immediately after the node turned red.
        if (isTrashActiveRef.current) {
          setNodes((nds) => nds.filter((n) => n.id !== node.id));
          setEdges((eds) =>
            eds.filter((e) => e.source !== node.id && e.target !== node.id),
          );
          setSelectedNodeId(null);
        } else {
          // Clear danger state
          setNodes((nds) =>
            nds.map((n) => ({
              ...n,
              data: { ...n.data, isDanger: false },
            })),
          );
        }
      }

      // Reset state
      setShowTrashBin(false);
      setIsTrashActive(false);
      isTrashActiveRef.current = false;
      draggingNodeIdRef.current = null;
    },
    [isTutorialActive, showTrashBin, setNodes, setEdges],
  );

  /**
   * Handle edge click - open weight editor (graph only, weighted mode only)
   */
  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edgeId: string) => {
      if (isTutorialActive) return;
      if (!isGraph) return;
      if (!weighted) return; // No weight editing for unweighted graphs

      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      setEditingEdgeId(edgeId);
      setWeightInputValue(String(edge.data?.weight ?? edge.label ?? ""));
      setShowWeightModal(true);
      // Clear node selection
      setSelectedNodeId(null);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isHighlighted: false, isGlowing: false },
        })),
      );
    },
    [isTutorialActive, isGraph, weighted, edges, setNodes],
  );

  /**
   * Weight modal handlers
   */
  const handleWeightInputChange = useCallback((value: string) => {
    setWeightInputValue(value);
  }, []);

  const handleWeightConfirm = useCallback(() => {
    const weight = Number(weightInputValue);
    if (isNaN(weight) || weightInputValue.trim() === "") return;

    if (editingEdgeId) {
      // Editing existing edge weight
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id !== editingEdgeId) return e;
          return {
            ...e,
            label: String(weight),
            data: { ...e.data, weight },
          };
        }),
      );
    } else if (pendingEdge) {
      // Creating new edge — depends on directed/weighted mode
      if (directed) {
        // Directed: edge WITH arrow and weight
        const newEdge: Edge = {
          id: `eg-${pendingEdge.sourceId}-${pendingEdge.targetId}-${Date.now()}`,
          source: pendingEdge.sourceId,
          target: pendingEdge.targetId,
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
      } else {
        // Undirected + weighted: edge WITHOUT arrow but WITH weight label
        const newEdge: Edge = {
          id: `eg-${pendingEdge.sourceId}-${pendingEdge.targetId}-${Date.now()}`,
          source: pendingEdge.sourceId,
          target: pendingEdge.targetId,
          type: "floatingEdge",
          label: String(weight),
          data: { directed: false, weight },
          style: { stroke: "#222121", strokeWidth: 1 },
        };
        setEdges((eds) => [...eds, newEdge]);
      }
    }

    // Reset modal state
    setShowWeightModal(false);
    setWeightInputValue("");
    setPendingEdge(null);
    setEditingEdgeId(null);
  }, [weightInputValue, editingEdgeId, pendingEdge, directed, setEdges]);

  const handleWeightModalClose = useCallback(() => {
    setShowWeightModal(false);
    setWeightInputValue("");
    setPendingEdge(null);
    setEditingEdgeId(null);
  }, []);

  /**
   * Handle pane click - clear selection
   */
  const handlePaneClick = useCallback(() => {
    if (isTutorialActive) return;

    setSelectedNodeId(null);
    setShowTrashBin(false);
    setIsTrashActive(false);

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isHighlighted: false,
          isGlowing: false,
          isDanger: false,
        },
      })),
    );
  }, [isTutorialActive, setNodes]);

  return {
    selectedNodeId,
    showTrashBin,
    isTrashActive,
    showWeightModal,
    weightInputValue,
    handleWeightInputChange,
    handleWeightConfirm,
    handleWeightModalClose,
    handleNodeClick,
    handleNodeDragStart,
    handleNodeDrag,
    handleNodeDragStop,
    handleEdgeClick,
    handlePaneClick,
    trashBinPos,
  };
}
