import { useCallback, useRef } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import {
    insertHeap,
    cloneHeap,
    calculateHeapPositions,
    heapToReactFlow,
    type HeapNode,
} from '@/src/components/visualizer/algorithmsTree/Heap/heapTree';

export function useHeapInsertHandler(params: {
    heapRoot: HeapNode | null;
    setHeapRoot: (root: HeapNode | null) => void;
    isMinHeap: boolean;
    nodes: RFNode[];
    edges: RFEdge[];
    setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
    setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
    setDescription: (desc: string) => void;
    animationSpeed: number;
    isPausedRef: React.MutableRefObject<boolean>;
    setIsAnimating: (v: boolean) => void;
}) {
    const {
        heapRoot, setHeapRoot, isMinHeap,
        setNodes, setEdges, setDescription,
        animationSpeed, isPausedRef, setIsAnimating,
    } = params;

    const counterRef = useRef(0);

    const handleInsert = useCallback((value: number) => {
        const controller = new AnimationController(isPausedRef);
        setIsAnimating(true);
        const nodeId = `heap_${Date.now()}_${counterRef.current++}`;
        const rootCopy = cloneHeap(heapRoot);

        // Get the final result and paths
        const { root: newRoot, path, siftPath } = insertHeap(rootCopy, value, nodeId, isMinHeap);

        let globalOffset = 0;

        // Build a simulation tree that represents the state BEFORE sift-up starts
        let simTree = cloneHeap(heapRoot);
        const newNode: HeapNode = { id: nodeId, value, left: null, right: null };
        if (!simTree) {
            simTree = newNode;
        } else {
            const queue: HeapNode[] = [simTree];
            while (queue.length > 0) {
                const cur = queue.shift()!;
                if (!cur.left) { cur.left = newNode; break; }
                queue.push(cur.left);
                if (!cur.right) { cur.right = newNode; break; }
                queue.push(cur.right);
            }
        }

        // Step 1: Highlight BFS traversal path (finding next empty position)
        if (path.length > 0) {
            const origPositions = calculateHeapPositions(heapRoot);
            const origRF = heapRoot ? heapToReactFlow(heapRoot, [], [], origPositions, 'heap-edge') : { nodes: [], edges: [] };

            path.forEach((id, idx) => {
                controller.scheduleStep(() => {
                    const highlighted = (origRF.nodes as RFNode[]).map((n: RFNode) => ({
                        ...n,
                        data: {
                            ...n.data,
                            isHighlighted: n.id === id,
                            highlightColor: n.id === id ? '#62A2F7' : undefined,
                        },
                    }));
                    // Accumulate highlighted edges using Set
                    const visitedIds = new Set(path.slice(0, idx + 1));
                    const highlightedEdges = (origRF.edges as RFEdge[]).map((e: RFEdge) => ({
                        ...e,
                        style: (visitedIds.has(e.source) && visitedIds.has(e.target))
                            ? { stroke: '#F7AD45', strokeWidth: 3 }
                            : { stroke: '#999', strokeWidth: 2 },
                    }));
                    setNodes(highlighted);
                    setEdges(highlightedEdges);
                    setDescription(`Finding next empty position... checking node ${id}`);
                }, animationSpeed * (idx + 1));
                globalOffset = idx + 1;
            });
        }

        // Step 2: Show inserted node (green) at the bottom
        globalOffset++;
        controller.scheduleStep(() => {
            const positions = calculateHeapPositions(simTree);
            const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(simTree, [], [], positions, 'heap-edge');

            const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
                ...n,
                data: {
                    ...n.data,
                    isHighlighted: n.id === nodeId,
                    highlightColor: n.id === nodeId ? '#4CAF7D' : undefined,
                },
            }));
            setNodes(highlighted);
            setEdges(rfEdges as RFEdge[]);
            setDescription(`Inserted ${value}. ${siftPath.length > 0 ? 'Checking heap property and sifting up...' : 'Heap property maintained!'}`);
        }, animationSpeed * globalOffset);

        // Step 3: Animate sift-up swaps smoothly
        let currentSiftNodeId = nodeId;

        siftPath.forEach((swapId, idx) => {
            // First highlight the two nodes about to swap
            globalOffset++;
            controller.scheduleStep(() => {
                const positions = calculateHeapPositions(simTree);
                const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(simTree, [], [], positions, 'heap-edge');

                const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: n.id === currentSiftNodeId || n.id === swapId,
                        highlightColor: n.id === currentSiftNodeId || n.id === swapId ? '#F7AD45' : undefined,
                    },
                }));
                setNodes(highlighted);
                setEdges(rfEdges as RFEdge[]);
                setDescription(`Sifting up... swapping with parent node ${swapId} (${idx + 1}/${siftPath.length})`);
            }, animationSpeed * globalOffset);

            // Interpolation frames for smooth node sliding
            const INTERP_FRAMES = 15;
            for (let frame = 1; frame <= INTERP_FRAMES; frame++) {
                controller.scheduleStep(() => {
                    const positions = calculateHeapPositions(simTree);
                    const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(simTree, [], [], positions, 'heap-edge');

                    const posA = positions.get(currentSiftNodeId);
                    const posB = positions.get(swapId);

                    if (posA && posB) {
                        const t = frame / INTERP_FRAMES;
                        const currAX = posA.x + (posB.x - posA.x) * t;
                        const currAY = posA.y + (posB.y - posA.y) * t;
                        const currBX = posB.x + (posA.x - posB.x) * t;
                        const currBY = posB.y + (posA.y - posB.y) * t;

                        const movingNodes = (rfNodes as RFNode[]).map((n: RFNode) => {
                            if (n.id === currentSiftNodeId) {
                                return {
                                    ...n,
                                    position: { x: currAX, y: currAY },
                                    data: { ...n.data, isHighlighted: true, highlightColor: '#F7AD45' }
                                };
                            }
                            if (n.id === swapId) {
                                return {
                                    ...n,
                                    position: { x: currBX, y: currBY },
                                    data: { ...n.data, isHighlighted: true, highlightColor: '#F7AD45' }
                                };
                            }
                            return n;
                        });

                        setNodes(movingNodes);
                        setEdges(rfEdges as RFEdge[]);
                    }
                }, animationSpeed * globalOffset + (animationSpeed / INTERP_FRAMES) * frame);
            }
            globalOffset++; // Advance time for interpolation

            // Snap simulation tree to new layout state
            controller.scheduleStep(() => {
                let nodeA: HeapNode | null = null;
                let nodeB: HeapNode | null = null;
                const sq = [simTree];
                while (sq.length > 0) {
                    const c = sq.shift()!;
                    if (c.id === currentSiftNodeId) nodeA = c;
                    if (c.id === swapId) nodeB = c;
                    if (c.left) sq.push(c.left);
                    if (c.right) sq.push(c.right);
                }
                if (nodeA && nodeB) {
                    const tmpV = nodeA.value;
                    const tmpI = nodeA.id;
                    nodeA.value = nodeB.value;
                    nodeA.id = nodeB.id;
                    nodeB.value = tmpV;
                    nodeB.id = tmpI;
                }
                // (After swapping IDs, nodeA child becomes swapId, and nodeB parent becomes currentSiftNodeId).
            }, animationSpeed * globalOffset);
        });

        // Step 4: Final state
        globalOffset++;
        controller.scheduleStep(() => {
            setHeapRoot(newRoot);
            const positions = calculateHeapPositions(newRoot);
            const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(newRoot, [], [], positions, 'heap-edge');

            // Highlight the final settled node one last time
            const finalNode = (rfNodes as RFNode[]).map((n: RFNode) => ({
                ...n,
                data: {
                    ...n.data,
                    isHighlighted: n.id === currentSiftNodeId,
                    highlightColor: n.id === currentSiftNodeId ? '#4CAF7D' : undefined,
                },
            }));

            setNodes(finalNode);
            setEdges(rfEdges as RFEdge[]);
            setDescription(`Inserted ${value}. Heap property restored!`);

            controller.scheduleStep(() => {
                const cleanNodes = (rfNodes as RFNode[]).map((n: RFNode) => ({
                    ...n,
                    data: { ...n.data, isHighlighted: false },
                }));
                setNodes(cleanNodes);
                setDescription('');
                setIsAnimating(false);
            }, animationSpeed * 2);

        }, animationSpeed * globalOffset);

    }, [heapRoot, setHeapRoot, isMinHeap, setNodes, setEdges, setDescription, animationSpeed, isPausedRef, setIsAnimating]);

    return { handleInsert };
}
