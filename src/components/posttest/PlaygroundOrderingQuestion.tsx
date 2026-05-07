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
  type EdgeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "@/src/components/shared/customNodeTreeandGraph";
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
  labelById?: Map<string, string>;
};

function SelectedBadgeList({
  selectedOrder,
  items,
  correctOrder,
  labelById,
}: SelectedBadgeListProps) {
  return (
    <div className="flex flex-wrap gap-1 items-center justify-center mt-4">
      {selectedOrder.map((id, index) => {
        const item = items.find((i) => i.id === id);
        const displayLabel = item?.label || labelById?.get(id) || id;
        const isWrong = correctOrder
          ? selectedOrder[index] !== correctOrder[index]
          : false;
        const badgeBg = isWrong
          ? "bg-[#BF1A1A] border-[#BF1A1A] text-white"
          : "bg-[#D9E363] border-[#5D5D5D] text-[#222121]";
        return (
          <React.Fragment key={id}>
            <div
              className={`flex items-center justify-center w-12 h-10 border-2 rounded-full text-base font-bold shrink-0 ${badgeBg}`}
            >
              {displayLabel}
            </div>
            {index < selectedOrder.length - 1 && (
              <span className="text-gray-400 font-bold text-lg select-none">
                →
              </span>
            )}
          </React.Fragment>
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
  const nodeLabelById = useMemo(() => {
    return new Map(
      canvasData.nodes.map((node) => [node.id, String(node.data?.label ?? "")]),
    );
  }, [canvasData.nodes]);

  const nodeIdSet = useMemo(() => {
    return new Set(canvasData.nodes.map((node) => node.id));
  }, [canvasData.nodes]);

  const isEdgeOrdering = useMemo(() => {
    return items.some((item) => !nodeIdSet.has(item.id));
  }, [items, nodeIdSet]);

  const edgeLabelById = useMemo(() => {
    const map = new Map<string, string>();
    canvasData.edges.forEach((edge) => {
      const sourceLabel = nodeLabelById.get(edge.source) || "";
      const targetLabel = nodeLabelById.get(edge.target) || "";
      if (!sourceLabel || !targetLabel) return;
      map.set(edge.id, `(${sourceLabel}-${targetLabel})`);
    });
    return map;
  }, [canvasData.edges, nodeLabelById]);

  const edgeIdByItemId = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => {
      const match = Array.from(edgeLabelById.entries()).find(
        ([, label]) => label === item.label,
      );

      if (match) {
        map.set(item.id, match[0]);
        return;
      }

      const reverseMatch = Array.from(edgeLabelById.entries()).find(
        ([, label]) => {
          const reversed = label.replace(/^\(([^-]+)-([^)]+)\)$/, "($2-$1)");
          return reversed === item.label;
        },
      );

      if (reverseMatch) {
        map.set(item.id, reverseMatch[0]);
      }
    });
    return map;
  }, [items, edgeLabelById]);

  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => map.set(item.id, item.label));
    edgeLabelById.forEach((label, edgeId) => map.set(edgeId, label));
    return map;
  }, [edgeLabelById, items]);

  const selectedEdgeIds = useMemo(() => {
    if (!isEdgeOrdering) return new Set<string>();
    return new Set<string>(
      selectedOrder
        .map((itemId) => edgeIdByItemId.get(itemId) ?? itemId)
        .filter((edgeId) => edgeLabelById.has(edgeId)),
    );
  }, [edgeIdByItemId, edgeLabelById, isEdgeOrdering, selectedOrder]);

  // Highlight selected nodes and show selection numbers
  const decoratedNodes = useMemo<Node[]>(() => {
    return canvasData.nodes.map((node) => {
      const selectionIndex = selectedOrder.indexOf(node.id);
      const isSelected = selectionIndex >= 0;

      return {
        ...node,
        type: "custom",
        data: {
          ...node.data,
          isHighlighted: isSelected,
          highlightColor: isSelected ? "#9CA3AF" : undefined,
          label: node.data.label as string,
          variant: (node.data.variant as "square" | "circle") ?? "circle",
        },
        draggable: false,
        selectable: false,
      };
    });
  }, [canvasData.nodes, selectedOrder]);

  const decoratedEdges = useMemo<Edge[]>(() => {
    return canvasData.edges.map((edge) => {
      const isSelected = selectedEdgeIds.has(edge.id);
      const baseStyle = {
        stroke: isSelected ? "#F7AD45" : isEdgeOrdering ? "#222121" : "#5D5D5D",
        strokeWidth: isEdgeOrdering ? 2.5 : 2,
        cursor: isEdgeOrdering ? "pointer" : "default",
      };

      if (canvasData.canvasType === "tree" && edge.type !== "tree") {
        return {
          ...edge,
          type: "tree",
          selected: isSelected,
          style: baseStyle,
        };
      }

      if (canvasData.canvasType === "graph" && edge.type !== "floatingEdge") {
        return {
          ...edge,
          type: "floatingEdge",
          selected: isSelected,
          style: baseStyle,
        };
      }

      return {
        ...edge,
        selected: isSelected,
        style: {
          ...edge.style,
          ...baseStyle,
        },
      };
    });
  }, [
    canvasData.canvasType,
    canvasData.edges,
    isEdgeOrdering,
    selectedEdgeIds,
  ]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (disabled) return;
      if (isEdgeOrdering) return;

      const nodeId = node.id;
      const currentIndex = selectedOrder.indexOf(nodeId);

      if (currentIndex >= 0) {
        // Remove this node from the order (and shift subsequent nodes)
        onOrderChange(selectedOrder.filter((_, i) => i !== currentIndex));
      } else {
        // Select this node (add to order)
        if (selectedOrder.length < items.length) {
          onOrderChange([...selectedOrder, nodeId]);
        }
      }
    },
    [disabled, isEdgeOrdering, selectedOrder, items.length, onOrderChange],
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      if (disabled) return;
      if (!isEdgeOrdering) return;

      const edgeLabel = edgeLabelById.get(edge.id);
      if (!edgeLabel) return;

      const item = items.find((candidate) => {
        if (candidate.label === edgeLabel) return true;
        const reversed = edgeLabel.replace(/^\(([^-]+)-([^)]+)\)$/, "($2-$1)");
        return candidate.label === reversed;
      });

      const storedId = item?.id ?? edge.id;

      const currentIndex = selectedOrder.indexOf(storedId);
      if (currentIndex >= 0) {
        onOrderChange(selectedOrder.filter((_, i) => i !== currentIndex));
        return;
      }

      if (selectedOrder.length < items.length) {
        onOrderChange([...selectedOrder, storedId]);
      }
    },
    [
      disabled,
      edgeLabelById,
      isEdgeOrdering,
      items,
      onOrderChange,
      selectedOrder,
    ],
  );

  return (
    <div className={`${className}`}>
      {/* ReactFlow Canvas */}
      {isEdgeOrdering && (
        <p className="text-sm text-gray-500 mb-2 text-center">
          Click edges in order to answer.
        </p>
      )}
      <div
        className="w-full rounded-xl border-2 border-gray-200 overflow-hidden bg-white mx-auto"
        style={{ height: 320, maxWidth: 540 }}
      >
        <ReactFlow
          nodes={decoratedNodes}
          edges={decoratedEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 0.2, maxZoom: 1.5 }}
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
              labelById={labelById}
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
  items,
  orderedIds,
  correctOrder,
  label,
  className = "",
}: PlaygroundOrderingResultProps) {
  const nodeLabelById = useMemo(() => {
    return new Map(items.map((item) => [item.id, String(item.label ?? "")]));
  }, [items]);

  const edgeLabelById = useMemo(() => {
    const map = new Map<string, string>();
    // Fall back to item labels for result view; edge labels are derived elsewhere.
    items.forEach((item) => map.set(item.id, item.label));
    return map;
  }, [items]);

  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    nodeLabelById.forEach((label, id) => map.set(id, label));
    edgeLabelById.forEach((label, id) => map.set(id, label));
    return map;
  }, [edgeLabelById, nodeLabelById]);

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
        labelById={labelById}
      />
    </div>
  );
}

export default PlaygroundOrderingQuestion;
