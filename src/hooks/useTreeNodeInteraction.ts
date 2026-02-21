import { useState, useCallback, useRef, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface UseTreeNodeInteractionProps {
    nodes: Node[];
    edges: Edge[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    isTree: boolean;
    isTutorialActive: boolean;
    onNodeDeleted?: (nodeId: string, nodeValue: number) => void;
}

interface UseTreeNodeInteractionReturn {
    // State
    selectedNodeId: string | null;
    showTrashBin: boolean;
    isTrashActive: boolean;

    // Handlers
    handleNodeClick: (event: React.MouseEvent, node: Node) => void;
    handleNodeMouseDown: (event: React.MouseEvent, node: Node) => void;
    handleNodeMouseUp: () => void;
    handleNodeDrag: (event: React.MouseEvent, node: Node) => void;
    handleNodeDragStop: (event: React.MouseEvent, node: Node) => void;
    handlePaneClick: () => void;

    // Trash bin position
    trashBinPos: { x: number; y: number };
}

/**
 * Hook for managing tree node interactions:
 * - Click to select/highlight
 * - Click another node to link (with BST validation)
 * - Hold 300ms to show trash, drag to delete
 */
export function useTreeNodeInteraction({
    nodes,
    edges,
    setNodes,
    setEdges,
    isTree,
    isTutorialActive,
    onNodeDeleted,
}: UseTreeNodeInteractionProps): UseTreeNodeInteractionReturn {
    // Selection state
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Hold-to-delete state
    const [showTrashBin, setShowTrashBin] = useState(false);
    const [isTrashActive, setIsTrashActive] = useState(false);
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isHoldingRef = useRef(false);

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
     * Validate BST rule for linking two nodes
     * Returns the correct sourceHandle based on child value
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

        // Determine which side the child should be on
        const isLeftChild = childValue < parentValue;
        const sourceHandle = isLeftChild ? 'source-bottom-left' : 'source-bottom-right';
        const targetHandle = isLeftChild ? 'target-top-right' : 'target-top-left';

        // Check if parent already has a child on that side
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
     * Handle node click - select or link
     */
    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (!isTree || isTutorialActive) return;

        // If holding, don't process click
        if (isHoldingRef.current || showTrashBin) return;

        if (selectedNodeId === null) {
            // First click - select this node
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
            // Clicked same node - deselect
            setSelectedNodeId(null);
            setNodes(nds => nds.map(n => ({
                ...n,
                data: {
                    ...n.data,
                    isHighlighted: false,
                    isGlowing: false,
                },
            })));
        } else {
            // Clicked different node - try to link
            const selectedNode = nodes.find(n => n.id === selectedNodeId);
            if (!selectedNode) return;

            // Selected node becomes child, clicked node becomes parent
            const validation = validateBSTLink(node, selectedNode, edges);

            if (validation.valid) {
                // Create edge from parent to child
                const newEdge: Edge = {
                    id: `e-${node.id}-${selectedNodeId}`,
                    source: node.id,
                    sourceHandle: validation.sourceHandle,
                    target: selectedNodeId,
                    targetHandle: validation.targetHandle,
                    type: 'straight',
                };
                setEdges(eds => [...eds, newEdge]);

                // Clear selection
                setSelectedNodeId(null);
                setNodes(nds => nds.map(n => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: false,
                        isGlowing: false,
                    },
                })));
            } else {
                // Invalid link - could show toast/error here
                console.warn('Invalid BST link:', validation.error);
            }
        }
    }, [
        isTree, isTutorialActive, selectedNodeId, nodes, edges,
        setNodes, setEdges, validateBSTLink, showTrashBin
    ]);

    /**
     * Handle node mouse down - start hold timer
     */
    const handleNodeMouseDown = useCallback((event: React.MouseEvent, node: Node) => {
        if (!isTree || isTutorialActive) return;
        if (selectedNodeId !== node.id) return; // Only for selected node

        isHoldingRef.current = false;

        // Start 100ms timer
        holdTimerRef.current = setTimeout(() => {
            isHoldingRef.current = true;
            setShowTrashBin(true);
        }, 100);
    }, [isTree, isTutorialActive, selectedNodeId]);

    /**
     * Handle node mouse up - cancel hold timer
     */
    const handleNodeMouseUp = useCallback(() => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        // Don't reset isHoldingRef here - let drag handle it
    }, []);

    /**
     * Handle node drag - check trash proximity and update node danger state
     */
    const handleNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
        if (!showTrashBin) return;

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
    }, [showTrashBin, setNodes]);

    /**
     * Handle node drag stop - delete if over trash
     */
    const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        if (!showTrashBin) return;

        const trashX = window.innerWidth / 2;
        const trashY = window.innerHeight - 140;
        const deleteRadius = 60;

        const dist = Math.sqrt(
            Math.pow(event.clientX - trashX, 2) +
            Math.pow(event.clientY - trashY, 2)
        );

        if (dist < deleteRadius) {
            // Delete node and connected edges
            const nodeValue = Number(node.data?.label);
            setNodes(nds => nds.filter(n => n.id !== node.id));
            setEdges(eds => eds.filter(e => e.source !== node.id && e.target !== node.id));
            setSelectedNodeId(null);
            // Notify parent to sync internal tree roots
            if (!isNaN(nodeValue)) {
                onNodeDeleted?.(node.id, nodeValue);
            }
        } else {
            // Clear danger state
            setNodes(nds => nds.map(n => ({
                ...n,
                data: { ...n.data, isDanger: false },
            })));
        }

        // Reset state
        setShowTrashBin(false);
        setIsTrashActive(false);
        isHoldingRef.current = false;
    }, [showTrashBin, setNodes, setEdges, onNodeDeleted]);

    /**
     * Handle pane click - clear selection
     */
    const handlePaneClick = useCallback(() => {
        if (!isTree || isTutorialActive) return;

        setSelectedNodeId(null);
        setShowTrashBin(false);
        setIsTrashActive(false);
        isHoldingRef.current = false;

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
    }, [isTree, isTutorialActive, setNodes]);

    return {
        selectedNodeId,
        showTrashBin,
        isTrashActive,
        handleNodeClick,
        handleNodeMouseDown,
        handleNodeMouseUp,
        handleNodeDrag,
        handleNodeDragStop,
        handlePaneClick,
        trashBinPos,
    };
}
