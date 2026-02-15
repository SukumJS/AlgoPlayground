"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import controlBus from '@/src/lib/controlBus';
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useReactFlow, XYPosition } from "@xyflow/react";
import type { Node as RFNode } from '@xyflow/react';
import { OnDropAction, useDnD, useDnDPosition } from "./useDnD";
import RandomSize from "../shared/randomSize";
import { Plus, Search, Trash } from "lucide-react";
import { GLOW_ZONE } from "./tutorial_tree";
import { insertAVLWithAnimation, calculateTreePositions, avlTreeToReactFlow, rebuildAVLTreeFromNodes, validateTreeStructure, findInsertionPosition, rotateLeft, rotateRight, updateHeight, searchAVL, removeAVLWithAnimation, type AVLTreeNode } from "@/src/utils/treeAdapters/avlAdapter";
import { AVLAnimationRecorder } from "@/src/utils/AVLtree/avlAnimation";

let id = 0;
const getId = () => `dndnode_${id++}`;

interface Data_treeProps {
    tutorialMode?: boolean;
    tutorialStep?: number;
    onTutorialDropSuccess?: () => void;
    currentNodes?: Array<{ id: string; data: { label: string } }>;
}

function Data_tree({ tutorialMode = false, tutorialStep = 0, onTutorialDropSuccess, currentNodes = [] }: Data_treeProps) {
    const [isDataSortOpen, setIsDataSortOpen] = useState(true);
    const { onDragStart, isDragging } = useDnD();
    const [type, setType] = useState<string | null>(null);
    const rf = useReactFlow();
    const { setNodes, setEdges } = rf;
    const [inputValue, setInputValue] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const [removeValue, setRemoveValue] = useState<string>("");
    const [nodeInput, setNodeInput] = useState<string>("");
    const [draggedValue, setDraggedValue] = useState<number | null>(null);
    const [nodeIdCounter, setNodeIdCounter] = useState(5);
    
    // Animation state
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(500); // ms per step
    const [animationDescription, setAnimationDescription] = useState<string>("");
    const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
    const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());
    const [highlightColor, setHighlightColor] = useState<'blue' | 'yellow' | 'red' | 'green'>('blue');

    // timers for scheduled animation steps so we can cancel on pause
    const timersRef = useRef<number[]>([]);
    const isPausedRef = useRef<boolean>(false);

    const clearAllTimers = () => {
        timersRef.current.forEach(id => clearTimeout(id));
        timersRef.current = [];
    };

    // Sample nodes for tutorial
    const Sample = [
        { number: "3" },
        { number: "67" },
        { number: "46" },
    ];

    // Get current AVL tree root from ReactFlow nodes
    // Automatically rebuilds tree if structure is invalid
    const avlRoot = useMemo((): AVLTreeNode | null => {
        if (currentNodes.length === 0) return null;

        // Filter only nodes with numeric labels
        const numericNodes = currentNodes.filter(node => !isNaN(parseInt(node.data.label)));
        
        if (numericNodes.length === 0) return null;

        // Rebuild AVL tree from current nodes to ensure structure is valid
        const rebuilt = rebuildAVLTreeFromNodes(numericNodes);
        
        // Verify structure is valid
        if (!validateTreeStructure(numericNodes, rebuilt)) {
            console.warn("Tree structure invalid, rebuilding...");
            return rebuilt;
        }

        return rebuilt;
    }, [currentNodes]);

    const createAddNewNode = useCallback(
        (Sample: number): OnDropAction => {
            return ({ position }: { position: XYPosition }) => {
                // During tutorial step 1, only allow drop in glow zone area
                if (tutorialMode && tutorialStep === 0) {
                    // Use GLOW_ZONE constant for consistency
                    const glowCenterX = GLOW_ZONE.x;
                    const glowCenterY = GLOW_ZONE.y;
                    const allowedRadius = GLOW_ZONE.radius;

                    const dx = position.x - glowCenterX;
                    const dy = position.y - glowCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > allowedRadius) {
                        // Drop is outside glow zone - don't create node
                        return;
                    }
                }

                const newNode = {
                    id: getId(),
                    type: "custom",
                    position,
                    data: { label: Sample.toString(), variant: "circle" },
                    // Higher z-index during tutorial so node 3 appears above others
                    zIndex: tutorialMode ? 100 : undefined,
                };

                setNodes((nds) => nds.concat(newNode));
                setType(null);

                if (tutorialMode && tutorialStep === 0) {
                    onTutorialDropSuccess?.();
                }
            };
        },
        [setNodes, setType, tutorialMode, tutorialStep, onTutorialDropSuccess],
    );


    // Apply highlighting to nodes and edges
    const applyHighlighting = useCallback((
        baseNodes: ReturnType<typeof avlTreeToReactFlow>['nodes'],
        baseEdges: ReturnType<typeof avlTreeToReactFlow>['edges'],
        highlightedNodeIds: Set<string>,
        highlightedEdgeIds: Set<string>,
        color: 'blue' | 'yellow' | 'red' | 'green'
    ) => {
        const highlightedNodes = baseNodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                isHighlighted: highlightedNodeIds.has(node.id),
                highlightColor: highlightedNodeIds.has(node.id) ? color : undefined,
            },
        }));
        
        const highlightedEdges = baseEdges.map(edge => ({
            ...edge,
            style: highlightedEdgeIds.has(edge.id)
                ? { stroke: color === 'red' ? '#EF4444' : color === 'blue' ? '#3B82F6' : color === 'yellow' ? '#FBBF24' : '#22C55E', strokeWidth: 3 }
                : { stroke: '#999', strokeWidth: 2 },
        }));
        
        return { highlightedNodes, highlightedEdges };
    }, []);

    // (removed unused buildPosMap helper)

    // Helper: interpolate positions between two maps
    const interpolateNodes = (
        templateNodes: RFNode[],
        startMap: Map<string, XYPosition>,
        endMap: Map<string, XYPosition>,
        fraction: number
    ) => {
        return templateNodes.map(n => {
            const start = startMap.get(n.id) || endMap.get(n.id) || { x: 0, y: 0 };
            const end = endMap.get(n.id) || startMap.get(n.id) || { x: start.x, y: start.y };
            const ix = start.x + (end.x - start.x) * fraction;
            const iy = start.y + (end.y - start.y) * fraction;
            return { ...n, position: { x: ix, y: iy } } as RFNode;
        });
    };

    // Merge two node arrays into a template preserving node ids (use endNode data when available)
    const mergeNodeArrays = (startNodes: RFNode[], endNodes: RFNode[]): RFNode[] => {
        const map = new Map<string, RFNode>();
        startNodes.forEach(n => map.set(n.id, n));
        endNodes.forEach(n => map.set(n.id, { ...(map.get(n.id) || n), ...n }));
        return Array.from(map.values());
    };

    const mergeEdgeArrays = (startEdges: any[], endEdges: any[]) => {
        // Key edges by their target (child) so the edge follows the child node across
        // snapshots. Prefer properties from endEdges when available.
        const map = new Map<string, any>();

        const add = (e: any) => {
            if (!e || !e.target) return;
            const key = `${e.target}`; // child-centric key
            const canonical = {
                id: `edge-${e.source ?? 'unknown'}-${e.target}`,
                source: e.source,
                target: e.target,
                type: e.type || 'straight',
                sourceHandle: e.sourceHandle,
                targetHandle: e.targetHandle,
                label: e.label,
                style: e.style,
                markerEnd: e.markerEnd,
                data: e.data,
            };
            map.set(key, { ...(map.get(key) || {}), ...canonical });
        };

        (startEdges || []).forEach(e => add(e));
        (endEdges || []).forEach(e => add(e));

        return Array.from(map.values());
    };

    // Deep clone helper for AVL tree
    const cloneTree = (root: AVLTreeNode | null): AVLTreeNode | null => {
        if (!root) return null;
        return JSON.parse(JSON.stringify(root)) as AVLTreeNode;
    };

    // Insert leaf without balancing (used to reconstruct snapshots)
    const insertLeafWithoutBalance = (root: AVLTreeNode | null, value: number, nodeId: string): AVLTreeNode => {
        if (root === null) {
            return { id: nodeId, value, left: null, right: null, height: 1 };
        }
        if (value < root.value) {
            root.left = insertLeafWithoutBalance(root.left, value, nodeId);
        } else if (value > root.value) {
            root.right = insertLeafWithoutBalance(root.right, value, nodeId);
        }
        updateHeight(root);
        return root;
    };

    // Remove leaf (BST delete) without performing balancing (used for snapshot reconstruction)
    const removeLeafWithoutBalance = (root: AVLTreeNode | null, value: number): AVLTreeNode | null => {
        if (!root) return null;
        if (value < root.value) {
            root.left = removeLeafWithoutBalance(root.left, value);
            updateHeight(root);
            return root;
        }
        if (value > root.value) {
            root.right = removeLeafWithoutBalance(root.right, value);
            updateHeight(root);
            return root;
        }

        // found node
        if (!root.left) return root.right;
        if (!root.right) return root.left;

        // two children: replace with inorder successor
        let succ = root.right;
        while (succ && succ.left) succ = succ.left;
        if (succ) {
            root.value = succ.value;
            root.right = removeLeafWithoutBalance(root.right, succ.value);
        }
        updateHeight(root);
        return root;
    };

    // Apply rotation at a node id by recursively searching and rotating when found
    const applyRotationAt = (root: AVLTreeNode | null, targetId: string, direction: 'left' | 'right'): AVLTreeNode | null => {
        if (!root) return null;
        if (root.id === targetId) {
            return direction === 'left' ? rotateLeft(root) : rotateRight(root);
        }
        root.left = applyRotationAt(root.left, targetId, direction);
        root.right = applyRotationAt(root.right, targetId, direction);
        updateHeight(root);
        return root;
    };

    const handleInsert = () => {
        if (tutorialMode) return;

        const valueToInsert = inputValue ? parseInt(inputValue) : Math.floor(Math.random() * 100) + 1;
        if (isNaN(valueToInsert)) return;

        // Start animation (phase 1)
        setIsAnimating(true);
        setAnimationDescription(`Finding position for value ${valueToInsert}...`);
        setHighlightedNodes(new Set());
        setHighlightedEdges(new Set());

        setTimeout(() => {
            const currentRoot = avlRoot;

            // Find insertion position without modifying tree
            const insertionPos = findInsertionPosition(currentRoot, valueToInsert);

            // Duplicate check
            if (currentRoot !== null && insertionPos.parentId === null && currentRoot.value === valueToInsert) {
                setIsAnimating(false);
                setAnimationDescription(`⚠️ Value ${valueToInsert} already exists!`);
                setTimeout(() => setAnimationDescription(''), 2000);
                return;
            }

            // If tree is empty, prepare a root preview and wait for confirmation
            if (!currentRoot) {
                const previewRoot: AVLTreeNode = {
                    id: `avl_${nodeIdCounter}`,
                    value: valueToInsert,
                    left: null,
                    right: null,
                    height: 1,
                };
                const positions = calculateTreePositions(previewRoot);
                const { nodes: baseNodes, edges: baseEdges } = avlTreeToReactFlow(previewRoot, [], [], positions);
                
                // show preview (green) then auto-play insertion steps for root
                const newNodeId = previewRoot.id;
                setNodes(baseNodes.map(n => ({ ...n, data: { ...n.data, isHighlighted: true, highlightColor: 'green' } })));
                setEdges(baseEdges);
                setAnimationDescription(`Inserting ${valueToInsert} as root...`);

                // perform insertion with recorder and play its steps
                const recorder = new AVLAnimationRecorder();
                insertAVLWithAnimation(null, valueToInsert, newNodeId, recorder);
                setNodeIdCounter(prev => prev + 1);

                const steps = recorder.getSteps();

                // Reconstruct per-step snapshots by applying structural ops to the preview root
                const snapshots: Array<AVLTreeNode | null> = [];
                let stateRoot = cloneTree(previewRoot);
                snapshots.push(cloneTree(stateRoot));

                steps.forEach(step => {
                    if (step.type === 'insert-node') {
                        stateRoot = insertLeafWithoutBalance(stateRoot, valueToInsert, newNodeId);
                    } else if (step.type === 'rotate-left') {
                        const targetId = step.highlightedNodes[0] || '';
                        stateRoot = applyRotationAt(stateRoot, targetId, 'left');
                    } else if (step.type === 'rotate-right') {
                        const targetId = step.highlightedNodes[0] || '';
                        stateRoot = applyRotationAt(stateRoot, targetId, 'right');
                    }
                    snapshots.push(cloneTree(stateRoot));
                });

                // Play steps: animate between snapshots[i] -> snapshots[i+1]
                let globalOffset = 0;
                const framesPerStep = 4;
                steps.forEach((step, index) => {
                    const startSnap = snapshots[index];
                    const endSnap = snapshots[index + 1] || snapshots[index];
                    const startPos = calculateTreePositions(startSnap);
                    const endPos = calculateTreePositions(endSnap);
                    const { nodes: startNodes, edges: startEdges } = avlTreeToReactFlow(startSnap, [], [], startPos);
                    const { nodes: endNodes, edges: endEdges } = avlTreeToReactFlow(endSnap, [], [], endPos);

                    for (let f = 1; f <= framesPerStep; f++) {
                        const fraction = f / framesPerStep;
                        const t = window.setTimeout(() => {
                            if (isPausedRef.current) return;
                            const template = mergeNodeArrays(startNodes, endNodes);
                            const templateEdges = mergeEdgeArrays(startEdges, endEdges);
                            const intermediate = interpolateNodes(template, startPos, endPos, fraction);
                            setAnimationDescription(step.description);
                            // Filter edges to those that actually connect nodes present in the template
                            const nodeIdSet = new Set((template || []).map(n => n.id));
                            const filteredEdges = (templateEdges || []).filter((e: any) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target));
                            const { highlightedNodes: sn, highlightedEdges: se } = applyHighlighting(intermediate as any, filteredEdges as any, new Set(step.highlightedNodes), new Set(step.highlightedEdges), step.highlightColor || 'blue');
                            setNodes(sn as any);
                            setEdges(se as any);
                        }, animationSpeed * (globalOffset + f));
                        timersRef.current.push(t as unknown as number);
                    }
                    globalOffset += framesPerStep;
                });

                const finalize = window.setTimeout(() => {
                    if (isPausedRef.current) return;
                    const finalSnap = snapshots[snapshots.length - 1];
                    const finalPos = calculateTreePositions(finalSnap);
                    const { nodes: finalNodes2, edges: finalEdges2 } = avlTreeToReactFlow(finalSnap, [], [], finalPos);
                    setAnimationDescription(`Insertion complete!`);
                    const { highlightedNodes: cn, highlightedEdges: ce } = applyHighlighting(finalNodes2, finalEdges2, new Set(), new Set(), 'green');
                    setNodes(cn);
                    setEdges(ce);
                    setHighlightColor('green');
                    const tidy = window.setTimeout(() => {
                        setIsAnimating(false);
                        setAnimationDescription("");
                        setHighlightedNodes(new Set());
                        setHighlightedEdges(new Set());
                    }, animationSpeed);
                    timersRef.current.push(tidy as unknown as number);
                }, animationSpeed * Math.max(1, steps.length * framesPerStep + 1));
                timersRef.current.push(finalize as unknown as number);

                return;
            }

            // Non-empty tree: show original tree first, then animate traversal step-by-step
            const rootCopy = JSON.parse(JSON.stringify(currentRoot)) as AVLTreeNode;
            const currentPositions = calculateTreePositions(rootCopy);
            const { nodes: baseNodes, edges: baseEdges } = avlTreeToReactFlow(rootCopy, [], [], currentPositions);

            // Render the original tree first (no highlights)
            // IMPORTANT: do NOT replace the current visible nodes immediately with the freshly computed layout.
            // That causes a visual jump / structure change before the traversal animation begins.
            // Instead, read the current ReactFlow nodes/edges and use them as the starting template for highlighting
            const currentRFEdges = (rf as any).getEdges ? (rf as any).getEdges() : baseEdges;
            const currentRFNodes = (rf as any).getNodes ? (rf as any).getNodes() : baseNodes;
            // Keep the current view as-is and start the traversal animation
            setAnimationDescription(`Searching for position to insert ${valueToInsert}...`);

            // Prepare new node id for insertion
            

            // Animate traversal along insertionPos.path one node at a time
            const path = insertionPos.path || [];
            path.forEach((nodeId, idx) => {
                const t = window.setTimeout(() => {
                    if (isPausedRef.current) return;
                    // highlight current node in blue
                    const { highlightedNodes: stepNodes, highlightedEdges: stepEdges } = applyHighlighting(currentRFNodes as any, currentRFEdges as any, new Set([nodeId]), new Set(), 'blue');
                    setNodes(stepNodes as any);
                    setEdges(stepEdges as any);
                    setHighlightedNodes(new Set([nodeId]));
                    setHighlightColor('blue');
                    setAnimationDescription(`Traversing node ${nodeId}...`);
                }, animationSpeed * (idx + 1));
                timersRef.current.push(t as unknown as number);
            });

            // After traversal, highlight the parent (target) in yellow
            const highlightParentTimer = window.setTimeout(() => {
                if (isPausedRef.current) return;
                const parentId = insertionPos.parentId;
                if (parentId) {
                    const { highlightedNodes: targetNodes, highlightedEdges: targetEdges } = applyHighlighting(currentRFNodes as any, currentRFEdges as any, new Set([parentId]), new Set(), 'yellow');
                    setNodes(targetNodes as any);
                    setEdges(targetEdges as any);
                    setHighlightedNodes(new Set([parentId]));
                    setHighlightColor('yellow');
                    setAnimationDescription(`Found parent ${insertionPos.parentValue} — inserting ${valueToInsert} as ${insertionPos.position}`);
                }
            }, animationSpeed * (path.length + 1));
            timersRef.current.push(highlightParentTimer as unknown as number);

            // Then automatically perform insertion (after a short delay) unless paused
            const performInsertTimer = window.setTimeout(() => {
                if (isPausedRef.current) return;

                const newNodeId = `avl_${nodeIdCounter}`;
                // perform insertion with recorder
                const insertRoot = JSON.parse(JSON.stringify(rootCopy)) as AVLTreeNode | null;
                const recorder = new AVLAnimationRecorder();
                insertAVLWithAnimation(insertRoot, valueToInsert, newNodeId, recorder);
                setNodeIdCounter(prev => prev + 1);

                const steps = recorder.getSteps();

                // Reconstruct snapshots from rootCopy and the recorded steps
                const snapshots2: Array<AVLTreeNode | null> = [];
                let stateRoot2 = cloneTree(rootCopy);
                snapshots2.push(cloneTree(stateRoot2));
                steps.forEach(step => {
                    if (step.type === 'insert-node') {
                        stateRoot2 = insertLeafWithoutBalance(stateRoot2, valueToInsert, newNodeId);
                    } else if (step.type === 'rotate-left') {
                        const targetId = step.highlightedNodes[0] || '';
                        stateRoot2 = applyRotationAt(stateRoot2, targetId, 'left');
                    } else if (step.type === 'rotate-right') {
                        const targetId = step.highlightedNodes[0] || '';
                        stateRoot2 = applyRotationAt(stateRoot2, targetId, 'right');
                    }
                    snapshots2.push(cloneTree(stateRoot2));
                });

                // Animate each step between snapshots with multiple frames per step
                const framesPerStep2 = 4;
                let globalOffset2 = 0;
                // Build a map of current RF positions so the first transition starts from what user currently sees
                const rfStartNodes = (rf as any).getNodes ? (rf as any).getNodes() : baseNodes;
                const rfPosMap = new Map<string, XYPosition>();
                (rfStartNodes || []).forEach((n: any) => rfPosMap.set(n.id, n.position));

                steps.forEach((step, sIdx) => {
                    const startSnap = snapshots2[sIdx];
                    const endSnap = snapshots2[sIdx + 1] || snapshots2[sIdx];
                    // For the very first animated step, use the current RF positions as the start positions
                    let startPos = calculateTreePositions(startSnap);
                    if (sIdx === 0 && rfPosMap.size > 0) {
                        // override startPos entries with positions from the live RF nodes when available
                        const mergedStart = new Map(startPos);
                        rfPosMap.forEach((pos, id) => mergedStart.set(id, pos));
                        startPos = mergedStart;
                    }
                    const endPos = calculateTreePositions(endSnap);
                    const { nodes: startNodes, edges: startEdges } = avlTreeToReactFlow(startSnap, [], [], startPos);
                    const { nodes: endNodes, edges: endEdges } = avlTreeToReactFlow(endSnap, [], [], endPos);

                    for (let f = 1; f <= framesPerStep2; f++) {
                        const fraction = f / framesPerStep2;
                        const t = window.setTimeout(() => {
                            if (isPausedRef.current) return;
                            const template = mergeNodeArrays(startNodes, endNodes);
                            const templateEdges = mergeEdgeArrays(startEdges, endEdges);
                            const intermediate = interpolateNodes(template, startPos, endPos, fraction);
                            setAnimationDescription(step.description);
                            // Filter edges to those that actually connect nodes present in the template
                            const nodeIdSet = new Set((template || []).map(n => n.id));
                            const filteredEdges = (templateEdges || []).filter((e: any) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target));
                            const { highlightedNodes: sn, highlightedEdges: se } = applyHighlighting(intermediate as any, filteredEdges as any, new Set(step.highlightedNodes), new Set(step.highlightedEdges), step.highlightColor || 'blue');
                            setNodes(sn as any);
                            setEdges(se as any);
                        }, animationSpeed * (path.length + 2 + globalOffset2 + f));
                        timersRef.current.push(t as unknown as number);
                    }
                    globalOffset2 += framesPerStep2;
                });

                const finalize2 = window.setTimeout(() => {
                    if (isPausedRef.current) return;
                    const finalSnap2 = snapshots2[snapshots2.length - 1];
                    const finalPos2 = calculateTreePositions(finalSnap2);
                    const { nodes: finalNodes3, edges: finalEdges3 } = avlTreeToReactFlow(finalSnap2, [], [], finalPos2);
                    setAnimationDescription(`Insertion complete!`);
                    const { highlightedNodes: cn, highlightedEdges: ce } = applyHighlighting(finalNodes3, finalEdges3, new Set(), new Set(), 'green');
                    setNodes(cn);
                    setEdges(ce);
                    setHighlightColor('green');
                    setTimeout(() => {
                        setIsAnimating(false);
                        setAnimationDescription("");
                        setHighlightedNodes(new Set());
                        setHighlightedEdges(new Set());
                    }, animationSpeed);
                }, animationSpeed * (path.length + 2 + Math.max(1, steps.length * framesPerStep2)));
                timersRef.current.push(finalize2 as unknown as number);
            }, animationSpeed * (path.length + 2));
            timersRef.current.push(performInsertTimer as unknown as number);
        }, 150);

        setInputValue("");
    };

    const handleSearch = () => {
        if (tutorialMode) return;
        const v = searchValue ? parseInt(searchValue) : NaN;
        if (isNaN(v)) return;

        clearAllTimers();
        setIsAnimating(true);
        setAnimationDescription(`Searching for ${v}...`);

        const currentRoot = avlRoot;
        if (!currentRoot) {
            setAnimationDescription(`Tree is empty`);
            setIsAnimating(false);
            return;
        }

        const res = searchAVL(currentRoot, v);
        const path = res.path || [];

        const currentRFNodes = (rf as any).getNodes ? (rf as any).getNodes() : [];
        const currentRFEdges = (rf as any).getEdges ? (rf as any).getEdges() : [];

    path.forEach((nodeId: string, idx: number) => {
            const t = window.setTimeout(() => {
                if (isPausedRef.current) return;
                const { highlightedNodes: stepNodes, highlightedEdges: stepEdges } = applyHighlighting(currentRFNodes as any, currentRFEdges as any, new Set([nodeId]), new Set(), 'blue');
                setNodes(stepNodes as any);
                setEdges(stepEdges as any);
                setAnimationDescription(`Traversing node ${nodeId}...`);
            }, animationSpeed * (idx + 1));
            timersRef.current.push(t as unknown as number);
        });

        const finalize = window.setTimeout(() => {
            if (isPausedRef.current) return;
            if (res.found && res.nodeId) {
                const { highlightedNodes: fn, highlightedEdges: fe } = applyHighlighting(currentRFNodes as any, currentRFEdges as any, new Set([res.nodeId]), new Set(), 'green');
                setNodes(fn as any);
                setEdges(fe as any);
                setAnimationDescription(`Found ${v} at ${res.nodeId}`);
            } else {
                setAnimationDescription(`Value ${v} not found`);
            }
            const tidy = window.setTimeout(() => {
                setIsAnimating(false);
                setAnimationDescription("");
                setSearchValue("");
            }, animationSpeed);
            timersRef.current.push(tidy as unknown as number);
        }, animationSpeed * (path.length + 1));
        timersRef.current.push(finalize as unknown as number);
    };

    const handleRemove = () => {
        if (tutorialMode) return;
        const v = removeValue ? parseInt(removeValue) : NaN;
        if (isNaN(v)) return;

        clearAllTimers();
        setIsAnimating(true);
        setAnimationDescription(`Removing ${v}...`);

        const currentRoot = avlRoot;
        if (!currentRoot) {
            setAnimationDescription(`Tree is empty`);
            setIsAnimating(false);
            return;
        }

        const rootForRecorder = cloneTree(currentRoot);
        const recorder = new AVLAnimationRecorder();
        removeAVLWithAnimation(rootForRecorder, v, recorder);
        const steps = recorder.getSteps();

        const snapshots: Array<AVLTreeNode | null> = [];
        let stateRoot = cloneTree(currentRoot);
        snapshots.push(cloneTree(stateRoot));

    steps.forEach((step: any) => {
            if (step.type === 'remove-node') {
                stateRoot = removeLeafWithoutBalance(stateRoot, v);
            } else if (step.type === 'rotate-left') {
                const targetId = step.highlightedNodes[0] || '';
                stateRoot = applyRotationAt(stateRoot, targetId, 'left');
            } else if (step.type === 'rotate-right') {
                const targetId = step.highlightedNodes[0] || '';
                stateRoot = applyRotationAt(stateRoot, targetId, 'right');
            }
            snapshots.push(cloneTree(stateRoot));
        });

        // Animate snapshots similarly to insert flow
        const framesPerStep = 4;
        let globalOffset = 0;
        const rfStartNodes = (rf as any).getNodes ? (rf as any).getNodes() : [];
        const rfPosMap = new Map<string, XYPosition>();
        (rfStartNodes || []).forEach((n: any) => rfPosMap.set(n.id, n.position));

        steps.forEach((step, sIdx) => {
            const startSnap = snapshots[sIdx];
            const endSnap = snapshots[sIdx + 1] || snapshots[sIdx];
            let startPos = calculateTreePositions(startSnap);
            if (sIdx === 0 && rfPosMap.size > 0) {
                const mergedStart = new Map(startPos);
                rfPosMap.forEach((pos, id) => mergedStart.set(id, pos));
                startPos = mergedStart;
            }
            const endPos = calculateTreePositions(endSnap);
            const { nodes: startNodes, edges: startEdges } = avlTreeToReactFlow(startSnap, [], [], startPos);
            const { nodes: endNodes, edges: endEdges } = avlTreeToReactFlow(endSnap, [], [], endPos);

            for (let f = 1; f <= framesPerStep; f++) {
                const fraction = f / framesPerStep;
                const t = window.setTimeout(() => {
                    if (isPausedRef.current) return;
                    const template = mergeNodeArrays(startNodes, endNodes);
                    const templateEdges = mergeEdgeArrays(startEdges, endEdges);
                    const intermediate = interpolateNodes(template, startPos, endPos, fraction);
                    setAnimationDescription(step.description);
                    const nodeIdSet = new Set((template || []).map(n => n.id));
                    const filteredEdges = (templateEdges || []).filter((e: any) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target));
                    const { highlightedNodes: sn, highlightedEdges: se } = applyHighlighting(intermediate as any, filteredEdges as any, new Set(step.highlightedNodes), new Set(step.highlightedEdges), step.highlightColor || 'blue');
                    setNodes(sn as any);
                    setEdges(se as any);
                }, animationSpeed * (globalOffset + f));
                timersRef.current.push(t as unknown as number);
            }
            globalOffset += framesPerStep;
        });

        const finalize = window.setTimeout(() => {
            if (isPausedRef.current) return;
            const finalSnap = snapshots[snapshots.length - 1];
            const finalPos = calculateTreePositions(finalSnap);
            const { nodes: finalNodes, edges: finalEdges } = avlTreeToReactFlow(finalSnap, [], [], finalPos);
            setAnimationDescription(`Removal complete!`);
            const { highlightedNodes: cn, highlightedEdges: ce } = applyHighlighting(finalNodes, finalEdges, new Set(), new Set(), 'green');
            setNodes(cn);
            setEdges(ce);
            setHighlightColor('green');
            const tidy = window.setTimeout(() => {
                setIsAnimating(false);
                setAnimationDescription("");
                setRemoveValue("");
            }, animationSpeed);
            timersRef.current.push(tidy as unknown as number);
        }, animationSpeed * Math.max(1, steps.length * framesPerStep + 1));
        timersRef.current.push(finalize as unknown as number);
    };

    // Subscriptions: speed control and pause/stop/run
    useEffect(() => {
        const unsubSpeed = controlBus.subscribe('setSpeed', (ms?: number) => {
            if (typeof ms === 'number') setAnimationSpeed(ms);
        });

        const unsubStop = controlBus.subscribe('stop', () => {
            isPausedRef.current = true;
            clearAllTimers();
            setIsAnimating(false);
            setAnimationDescription('Paused');
        });

        const unsubRun = controlBus.subscribe('run', () => {
            // unpause; auto-run flows are timer-driven and will proceed only if timers exist
            isPausedRef.current = false;
        });

        return () => {
            unsubSpeed();
            unsubStop();
            unsubRun();
            clearAllTimers();
        };
    }, [applyHighlighting]);
    const handleReset = () => {
        if (tutorialMode) return; // Disabled during tutorial
        setInputValue("");
        setSearchValue("");
        setRemoveValue("");
    };

    // Toggle expand/collapse - disabled during tutorial
    const handleToggle = () => {
        if (tutorialMode) return;
        setIsDataSortOpen(!isDataSortOpen);
    };

    return (
        <>
            {/* Ghost node when dragging */}
            {isDragging && <DragGhost type={type} value={draggedValue} />}

            <button
                className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${isDataSortOpen ? "bg-gray-200 h-12" : "bg-white"} ${tutorialMode ? "cursor-default" : ""}`}
                onClick={handleToggle}
            >
                <div className="flex items-center">
                    <div
                        className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${isDataSortOpen ? "" : "hidden opacity-100"}`}
                    ></div>
                    <div className={`flex text-lg p-2`}>Data</div>
                </div>
                <div className="mr-2 flex justify-end">
                    {isDataSortOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>

            {/* Draggable nodes */}
            <div className={`flex-col ${isDataSortOpen ? "opacity-100" : "opacity-0"}`}>
                <div className={`transition-all duration-300 ease-in-out overflow-x-auto flex gap-2 mb-2 p-2`}>
                    {/* Sample nodes - all same color per Figma */}
                    {Sample.map((item, index) => (
                        <div
                            key={index}
                            className="shrink-0 w-16 h-16 rounded-full flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 border-[#5D5D5D] cursor-grab bg-[#D9E363]"
                            data-tutorial-target={item.number === "3" ? "sidebar-node-3" : undefined}
                            onPointerDown={(event) => {
                                setType("custom");
                                setDraggedValue(parseInt(item.number));
                                onDragStart(event, createAddNewNode(parseInt(item.number)));
                            }}
                        >
                            {item.number}
                        </div>
                    ))}
                </div>

                {/* Form controls - visible but disabled during tutorial */}
                <div className={`flex-col justify-center items-center text-center ${tutorialMode ? 'pointer-events-none opacity-60' : ''}`}>
                    <div className="grid-cols-1 grid gap-2 text-start m-1">
                        <p className="font-bold text-md">Insert</p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <button
                                className="bg-[#222121] rounded-lg p-2 disabled:opacity-50"
                                onClick={handleInsert}
                                disabled={isAnimating}
                            >
                                <Plus color="white" />
                            </button>
                        </div>
                    </div>
                    <div className="grid-cols-1 grid gap-2 text-start m-1">
                        <p className="font-bold text-md">Search</p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                            <button className="bg-[#222121] rounded-lg p-2" onClick={handleSearch}>
                                <Search color="white" />
                            </button>
                        </div>
                    </div>
                    <div className="grid-cols-1 grid gap-2 text-start m-1">
                        <p className="font-bold text-md">Remove</p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={removeValue}
                                onChange={(e) => setRemoveValue(e.target.value)}
                            />
                            <button className="bg-[#E82B2B] rounded-lg p-2" onClick={handleRemove}>
                                <Trash color="white" />
                            </button>
                        </div>
                    </div>
                    <RandomSize onReset={handleReset} />
                </div>
            </div>
        </>
    );
}

export default Data_tree;

interface DragGhostProps {
    type: string | null;
    value: number | null;
}

export function DragGhost({ type, value }: DragGhostProps) {
    const { position } = useDnDPosition();

    if (!position || !type) return null;

    return (
        <div
            className={`fixed top-0 left-0 pointer-events-none z-1000 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#5D5D5D] bg-[#D9E363] text-center text-2xl font-semibold text-[#222121] shadow-lg`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
            }}>
            {value}
        </div>
    );
}
