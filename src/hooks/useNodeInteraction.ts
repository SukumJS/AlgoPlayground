'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface UseNodeInteractionProps {
    nodes: Node[];
    edges: Edge[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    isTree: boolean;
    isTutorialActive: boolean;
}

interface UseNodeInteractionReturn {
    // State
    selectedNodeId: string | null;
    showTrashBin: boolean;
    isTrashActive: boolean;

    // Handlers
    handleNodeClick: (event: React.MouseEvent, node: Node) => void;
    handleNodeDragStart: (event: React.MouseEvent, node: Node) => void;
    handleNodeDrag: (event: React.MouseEvent, node: Node) => void;
    handleNodeDragStop: (event: React.MouseEvent, node: Node) => void;
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
    isTutorialActive,
}: UseNodeInteractionProps): UseNodeInteractionReturn {
    // Selection state (used for tree linking)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Drag-to-delete state
    const [showTrashBin, setShowTrashBin] = useState(false);
    const [isTrashActive, setIsTrashActive] = useState(false);
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
    const draggingNodeIdRef = useRef<string | null>(null);

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
        window.addEventListener('resize', updateTrashPos);
        return () => window.removeEventListener('resize', updateTrashPos);
    }, []);

    /**
     * Validate BST rule for linking two nodes (tree-only)
     */
    const validateBSTLink = useCallback((
        parentNode: Node,
        childNode: Node,
        currentEdges: Edge[]
    ): { valid: boolean; sourceHandle: string; targetHandle: string; error?: string } => {
        const parentValue = Number(parentNode.data.label);
        const childValue = Number(childNode.data.label);

        if (isNaN(parentValue) || isNaN(childValue)) {
            return { valid: false, sourceHandle: '', targetHandle: '', error: 'Invalid node values' };
        }

        const isLeftChild = childValue < parentValue;
        const sourceHandle = isLeftChild ? 'source-bottom-left' : 'source-bottom-right';
        const targetHandle = isLeftChild ? 'target-top-right' : 'target-top-left';

        const existingEdge = currentEdges.find(
            e => e.source === parentNode.id && e.sourceHandle === sourceHandle
        );

        if (existingEdge) {
            return {
                valid: false,
                sourceHandle,
                targetHandle,
                error: `Parent already has a ${isLeftChild ? 'left' : 'right'} child`,
            };
        }

        return { valid: true, sourceHandle, targetHandle };
    }, []);

    /**
     * Handle node click - select or link (tree mode keeps linking behavior)
     */
    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (isTutorialActive) return;
        if (showTrashBin) return; // Don't process click if trash was just shown

        if (!isTree) {
            // Non-tree: click to select/deselect only
            if (selectedNodeId === node.id) {
                setSelectedNodeId(null);
                setNodes(nds => nds.map(n => ({
                    ...n,
                    data: { ...n.data, isHighlighted: false, isGlowing: false },
                })));
            } else {
                setSelectedNodeId(node.id);
                setNodes(nds => nds.map(n => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: n.id === node.id,
                        isGlowing: n.id === node.id,
                    },
                })));
            }
            return;
        }

        // Tree mode: select or link
        if (selectedNodeId === null) {
            setSelectedNodeId(node.id);
            setNodes(nds => nds.map(n => ({
                ...n,
                data: {
                    ...n.data,
                    isHighlighted: n.id === node.id,
                    isGlowing: n.id === node.id,
                },
            })));
        } else if (selectedNodeId === node.id) {
            setSelectedNodeId(null);
            setNodes(nds => nds.map(n => ({
                ...n,
                data: { ...n.data, isHighlighted: false, isGlowing: false },
            })));
        } else {
            // Try to link
            const selectedNode = nodes.find(n => n.id === selectedNodeId);
            if (!selectedNode) return;

            const validation = validateBSTLink(node, selectedNode, edges);
            if (validation.valid) {
                const newEdge: Edge = {
                    id: `e-${node.id}-${selectedNodeId}`,
                    source: node.id,
                    sourceHandle: validation.sourceHandle,
                    target: selectedNodeId,
                    targetHandle: validation.targetHandle,
                    type: 'straight',
                };
                setEdges(eds => [...eds, newEdge]);
            } else {
                console.warn('Invalid BST link:', validation.error);
            }

            setSelectedNodeId(null);
            setNodes(nds => nds.map(n => ({
                ...n,
                data: { ...n.data, isHighlighted: false, isGlowing: false },
            })));
        }
    }, [isTutorialActive, isTree, selectedNodeId, nodes, edges, setNodes, setEdges, validateBSTLink, showTrashBin]);

    /**
     * Handle node drag start - start 300ms timer to show trash
     * This is the key change: trash shows after dragging for 300ms (no prior click needed)
     */
    const handleNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
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
    }, [isTutorialActive]);

    /**
     * Handle node drag - check trash proximity
     */
    const handleNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
        if (isTutorialActive) return;

        if (!showTrashBin) return; // Trash not yet visible

        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        const dropTargetRadius = 150;

        const dist = Math.sqrt(
            Math.pow(event.clientX - trashX, 2) +
            Math.pow(event.clientY - trashY, 2)
        );

        const isNearTrash = dist < dropTargetRadius;
        setIsTrashActive(isNearTrash);

        // Update node color when near trash
        setNodes(nds => nds.map(n => ({
            ...n,
            data: {
                ...n.data,
                isDanger: n.id === node.id ? isNearTrash : false,
            },
        })));
    }, [isTutorialActive, showTrashBin, setNodes]);

    /**
     * Handle node drag stop - delete if over trash, otherwise reset
     */
    const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        // Always clear the timer
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }

        if (isTutorialActive) return;

        if (showTrashBin) {
            const trashX = window.innerWidth / 2;
            const trashY = window.innerHeight - 140;
            const deleteRadius = 60;

            const dist = Math.sqrt(
                Math.pow(event.clientX - trashX, 2) +
                Math.pow(event.clientY - trashY, 2)
            );

            if (dist < deleteRadius) {
                // Delete node and connected edges
                setNodes(nds => nds.filter(n => n.id !== node.id));
                setEdges(eds => eds.filter(e => e.source !== node.id && e.target !== node.id));
                setSelectedNodeId(null);
            } else {
                // Clear danger state
                setNodes(nds => nds.map(n => ({
                    ...n,
                    data: { ...n.data, isDanger: false },
                })));
            }
        }

        // Reset state
        setShowTrashBin(false);
        setIsTrashActive(false);
        draggingNodeIdRef.current = null;
    }, [isTutorialActive, showTrashBin, setNodes, setEdges]);

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

        setNodes(nds => nds.map(n => ({
            ...n,
            data: {
                ...n.data,
                isHighlighted: false,
                isGlowing: false,
                isDanger: false,
            },
        })));
    }, [isTutorialActive, setNodes]);

    return {
        selectedNodeId,
        showTrashBin,
        isTrashActive,
        handleNodeClick,
        handleNodeDragStart,
        handleNodeDrag,
        handleNodeDragStop,
        handlePaneClick,
        trashBinPos,
    };
}
