"use client";

import React, { useCallback, useMemo } from "react";
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    type Node,
    type Edge,
    type NodeTypes,
    type EdgeTypes,
    type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "@/src/components/shared/customNode";
import TreeEdge from "@/src/components/shared/treeEdge";
import FloatingEdge from "@/src/components/shared/FloatingEdge";
import { OrderingCanvasData, OrderItem } from "@/src/app/types/posttest";

const nodeTypes: NodeTypes = {
    custom: CustomNode,
};

const edgeTypes: EdgeTypes = {
    tree: TreeEdge,
    floatingEdge: FloatingEdge,
};

// ─── Selected Order Badge (number overlay on clicked nodes) ──────────
type SelectedBadgeListProps = {
    selectedOrder: string[];
    items: OrderItem[];
    correctOrder?: string[];
};

function SelectedBadgeList({ selectedOrder, items, correctOrder }: SelectedBadgeListProps) {
    return (
        <div className="flex flex-wrap gap-2 items-center justify-center mt-4">
            {selectedOrder.map((id, index) => {
                const item = items.find((i) => i.id === id);
                const isWrong = correctOrder
                    ? selectedOrder[index] !== correctOrder[index]
                    : false;
                const badgeBg = isWrong
                    ? "bg-[#BF1A1A] border-[#BF1A1A] text-white"
                    : "bg-[#D9E363] border-[#5D5D5D] text-[#222121]";
                const numColor = isWrong ? "text-red-200" : "text-gray-600";
                return (
                    <div
                        key={id}
                        className={`flex items-center gap-1 px-3 py-1 border-2 rounded-full text-sm font-bold ${badgeBg}`}
                    >
                        <span className={`text-xs ${numColor}`}>{index + 1}.</span>
                        {item?.label || id}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────
type PlaygroundOrderingQuestionProps = {
    canvasData: OrderingCanvasData;
    items: OrderItem[];
    selectedOrder: string[];
    onOrderChange: (newOrder: string[]) => void;
    disabled?: boolean;
    className?: string;
};

function PlaygroundOrderingQuestion({
    canvasData,
    items,
    selectedOrder,
    onOrderChange,
    disabled = false,
    className = "",
}: PlaygroundOrderingQuestionProps) {
    // Highlight selected nodes and show selection numbers
    const decoratedNodes = useMemo<Node[]>(() => {
        return canvasData.nodes.map((node) => {
            const selectionIndex = selectedOrder.indexOf(node.id);
            const isSelected = selectionIndex >= 0;

            return {
                ...node,
                data: {
                    ...node.data,
                    isHighlighted: isSelected,
                    label: node.data.label as string,
                    variant: node.data.variant as "square" | "circle",
                },
                draggable: false,
                selectable: false,
            };
        });
    }, [canvasData.nodes, selectedOrder]);

    const handleNodeClick: NodeMouseHandler = useCallback(
        (_event, node) => {
            if (disabled) return;

            const nodeId = node.id;
            const currentIndex = selectedOrder.indexOf(nodeId);

            if (currentIndex >= 0) {
                // If clicking the last selected node, deselect it
                if (currentIndex === selectedOrder.length - 1) {
                    onOrderChange(selectedOrder.slice(0, -1));
                }
                // Otherwise ignore click on already-selected non-last node
            } else {
                // Select this node (add to order)
                if (selectedOrder.length < items.length) {
                    onOrderChange([...selectedOrder, nodeId]);
                }
            }
        },
        [disabled, selectedOrder, items.length, onOrderChange]
    );

    return (
        <div className={`${className}`}>
            {/* ReactFlow Canvas */}
            <div
                className="w-full rounded-xl border-2 border-gray-200 overflow-hidden bg-white mx-auto"
                style={{ height: 400, maxWidth: 600 }}
            >
                <ReactFlow
                    nodes={decoratedNodes}
                    edges={canvasData.edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodeClick={handleNodeClick}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    panOnDrag={false}
                    zoomOnScroll={false}
                    zoomOnPinch={false}
                    zoomOnDoubleClick={false}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={16}
                        size={1.5}
                        color="#d4d4d4"
                    />
                </ReactFlow>
            </div>

            {/* Selected order display */}
            <div className="mt-4 text-center">
                {selectedOrder.length > 0 ? (
                    <>
                        <p className="text-sm text-gray-500 mb-2">
                            Selected order ({selectedOrder.length}/{items.length}):
                        </p>
                        <SelectedBadgeList
                            selectedOrder={selectedOrder}
                            items={items}
                        />
                        {!disabled && (
                            <button
                                onClick={() => onOrderChange([])}
                                className="mt-3 px-4 py-1.5 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Reset
                            </button>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-gray-400">
                        Click nodes in the correct traversal order
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Static display for result page ──────────────────────────────────
type PlaygroundOrderingResultProps = {
    canvasData: OrderingCanvasData;
    items: OrderItem[];
    orderedIds: string[];
    correctOrder?: string[];
    label?: string;
    className?: string;
};

export function PlaygroundOrderingResult({
    canvasData,
    items,
    orderedIds,
    correctOrder,
    label,
    className = "",
}: PlaygroundOrderingResultProps) {
    return (
        <div className={className}>
            {label && (
                <span className="text-sm font-medium text-gray-500 block mb-2">
                    {label}
                </span>
            )}
            <SelectedBadgeList
                selectedOrder={orderedIds}
                items={items}
                correctOrder={correctOrder}
            />
        </div>
    );
}

export default PlaygroundOrderingQuestion;
