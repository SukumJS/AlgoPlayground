import { useState, useRef, useCallback } from "react";
import type { Node } from "@xyflow/react";
import { sortAlgorithms } from "@/src/components/visualizer/algorithmsSort";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export const useSortRunner = (
    nodes: Node<SortNodeData>[],
    setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>,
    algoType: string | null,
    positionFromIndex: (index: number) => { x: number; y: number },
    delayRef: React.MutableRefObject<number>,
    setExplanation: React.Dispatch<React.SetStateAction<string>>
) => {
    const [isSorting, setIsSorting] = useState(false);
    const isRunningRef = useRef(false);

    const handleRunSort = useCallback(async () => {
        if (isSorting || !algoType) return;

        const sortFunction = sortAlgorithms[algoType as keyof typeof sortAlgorithms];
        if (!sortFunction) {
            console.error(`Algorithm type "${algoType}" not found.`);
            setExplanation(`Algorithm type "${algoType}" not found.`);
            return;
        }

        setIsSorting(true);
        isRunningRef.current = true;

        // Reset node statuses before running
        setNodes((prevNodes) =>
            prevNodes.map((node) => ({
                ...node,
                data: { ...node.data, status: "idle" },
            }))
        );

        try {
            await sortFunction({
                nodes,
                setNodes,
                positionFromIndex,
                delayRef,
                isRunningRef,
                setExplanation, // Pass it down
            });
        } catch (error) {
            console.error("Error during sort execution:", error);
            setExplanation("An error occurred during the algorithm execution.");
        } finally {
            setIsSorting(false);
            isRunningRef.current = false;
        }
    }, [nodes, setNodes, algoType, positionFromIndex, delayRef, setExplanation, isSorting]);

    const handleStop = useCallback(() => {
        if (isSorting) {
            isRunningRef.current = false;
            // The algorithm's loop will terminate, and the `finally` block in handleRunSort will handle the rest.
        }
    }, [isSorting]);

    return { handleRunSort, handleStop, isSorting };
};