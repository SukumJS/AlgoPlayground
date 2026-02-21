import { useCallback } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import {
    searchHeap,
    removeHeap,
    cloneHeap,
    calculateHeapPositions,
    heapToReactFlow,
    type HeapNode,
} from '@/src/components/visualizer/algorithmsTree/Heap/heapTree';

export function useHeapRemoveHandler(params: {
    heapRoot: HeapNode | null;
    setHeapRoot: (root: HeapNode | null) => void;
    isMinHeap: boolean;
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

    const handleRemove = useCallback((value: number) => {
        const controller = new AnimationController(isPausedRef);
        setIsAnimating(true);
        if (!heapRoot) {
            setDescription('Tree is empty');
            setIsAnimating(false);
            return;
        }

        const { found, nodeId, path } = searchHeap(heapRoot, value);
        const positions = calculateHeapPositions(heapRoot);
        const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(heapRoot, [], [], positions, 'heap-edge');

        let globalOffset = 0;

        // Step 1: Animate search
        path.forEach((id, idx) => {
            controller.scheduleStep(() => {
                const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: n.id === id,
                        highlightColor: n.id === id ? '#62A2F7' : undefined,
                    },
                }));
                const edgePath = path.slice(0, idx).map((src, i) => `heap-edge-${src}-${path[i + 1]}`);
                const highlightedEdges = (rfEdges as RFEdge[]).map((e: RFEdge) => ({
                    ...e,
                    style: edgePath.includes(e.id)
                        ? { stroke: '#F7AD45', strokeWidth: 3 }
                        : { stroke: '#999', strokeWidth: 2 },
                }));
                setNodes(highlighted);
                setEdges(highlightedEdges);
                setDescription(`Searching for ${value}... visiting node ${id}`);
            }, animationSpeed * (idx + 1));
            globalOffset = idx + 1;
        });

        if (!found) {
            globalOffset++;
            controller.scheduleStep(() => {
                setNodes(rfNodes as RFNode[]);
                setEdges(rfEdges as RFEdge[]);
                setDescription(`✗ ${value} not found`);
                controller.scheduleStep(() => {
                    setDescription('');
                    setIsAnimating(false);
                }, animationSpeed * 2);
            }, animationSpeed * globalOffset);
            return;
        }

        // Step 2: Highlight found node in red
        globalOffset++;
        controller.scheduleStep(() => {
            const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
                ...n,
                data: {
                    ...n.data,
                    isHighlighted: n.id === nodeId,
                    highlightColor: n.id === nodeId ? '#EF4444' : undefined,
                },
            }));
            setNodes(highlighted);
            setEdges(rfEdges as RFEdge[]);
            setDescription(`Found ${value}! Removing...`);
        }, animationSpeed * globalOffset);

        // Step 3: Perform removal and show result
        globalOffset++;
        controller.scheduleStep(() => {
            const rootCopy = cloneHeap(heapRoot);
            const newRoot = removeHeap(rootCopy, value, isMinHeap);
            setHeapRoot(newRoot);

            if (newRoot) {
                const newPositions = calculateHeapPositions(newRoot);
                const { nodes: newRFNodes, edges: newRFEdges } = heapToReactFlow(newRoot, [], [], newPositions, 'heap-edge');
                setNodes(newRFNodes as RFNode[]);
                setEdges(newRFEdges as RFEdge[]);
            } else {
                setNodes([]);
                setEdges([]);
            }
            setDescription(`Removed ${value}. Heap property restored.`);

            controller.scheduleStep(() => {
                setDescription('');
                setIsAnimating(false);
            }, animationSpeed * 2);
        }, animationSpeed * globalOffset);

    }, [heapRoot, setHeapRoot, isMinHeap, setNodes, setEdges, setDescription, animationSpeed, isPausedRef, setIsAnimating]);

    return { handleRemove };
}
