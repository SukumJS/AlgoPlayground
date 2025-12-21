'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TreeNode, ElementState } from '@/types';
import { cn } from '@/lib/utils';

// ===========================================
// Types
// ===========================================

interface TreeVisualizerProps {
  root: TreeNode | null;
  currentNodeId?: string;
  highlightedNodes?: string[];
  visitedNodes?: string[];
  showHeight?: boolean;
  className?: string;
}

interface PositionedNode extends TreeNode {
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

// ===========================================
// Color mapping
// ===========================================

const stateColors: Record<ElementState, { bg: string; border: string; text: string }> = {
  default: { bg: '#f1f5f9', border: '#94a3b8', text: '#334155' },
  current: { bg: '#3b82f6', border: '#1d4ed8', text: '#ffffff' },
  visited: { bg: '#a855f7', border: '#7c3aed', text: '#ffffff' },
  path: { bg: '#14b8a6', border: '#0d9488', text: '#ffffff' },
  comparing: { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },
  highlight: { bg: '#eab308', border: '#ca8a04', text: '#1f2937' },
  found: { bg: '#22c55e', border: '#16a34a', text: '#ffffff' },
  'not-found': { bg: '#9ca3af', border: '#6b7280', text: '#ffffff' },
  swapping: { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
  sorted: { bg: '#22c55e', border: '#16a34a', text: '#ffffff' },
  pivot: { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' },
  minimum: { bg: '#ec4899', border: '#db2777', text: '#ffffff' },
};

// ===========================================
// Tree Layout Calculation
// ===========================================

function calculateTreeLayout(
  root: TreeNode | null,
  width: number,
  height: number
): PositionedNode[] {
  if (!root) return [];

  const nodes: PositionedNode[] = [];
  const nodeWidth = 48;
  const verticalSpacing = 70;
  const initialHorizontalSpacing = width / 4;

  function traverse(
    node: TreeNode,
    x: number,
    y: number,
    horizontalSpacing: number,
    parentX?: number,
    parentY?: number
  ) {
    const positionedNode: PositionedNode = {
      ...node,
      x,
      y,
      parentX,
      parentY,
    };
    nodes.push(positionedNode);

    const childY = y + verticalSpacing;
    const childSpacing = horizontalSpacing / 2;

    if (node.left) {
      traverse(node.left, x - horizontalSpacing, childY, childSpacing, x, y);
    }
    if (node.right) {
      traverse(node.right, x + horizontalSpacing, childY, childSpacing, x, y);
    }
  }

  traverse(root, width / 2, 40, initialHorizontalSpacing);

  return nodes;
}

// ===========================================
// Tree Visualizer Component
// ===========================================

export function TreeVisualizer({
  root,
  currentNodeId,
  highlightedNodes = [],
  visitedNodes = [],
  showHeight = false,
  className,
}: TreeVisualizerProps) {
  const width = 600;
  const height = 400;

  const positionedNodes = useMemo(() => {
    return calculateTreeLayout(root, width, height);
  }, [root]);

  if (!root) {
    return (
      <div className={cn('flex items-center justify-center h-64 text-gray-400', className)}>
        No tree data to display
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Edges */}
        {positionedNodes.map((node) => {
          if (node.parentX === undefined || node.parentY === undefined) return null;

          const isHighlighted = highlightedNodes.includes(node.id);
          const isVisited = visitedNodes.includes(node.id);

          return (
            <motion.line
              key={`edge-${node.id}`}
              x1={node.parentX}
              y1={node.parentY + 20}
              x2={node.x}
              y2={node.y - 20}
              stroke={isHighlighted ? '#3b82f6' : isVisited ? '#a855f7' : '#cbd5e1'}
              strokeWidth={isHighlighted || isVisited ? 3 : 2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}

        {/* Nodes */}
        {positionedNodes.map((node, index) => {
          let state = node.state;
          if (node.id === currentNodeId) state = 'current';
          else if (highlightedNodes.includes(node.id)) state = 'highlight';
          else if (visitedNodes.includes(node.id)) state = 'visited';

          const colors = stateColors[state] || stateColors.default;
          const isCurrent = node.id === currentNodeId;

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: index * 0.05,
              }}
            >
              {/* Node circle */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={22}
                fill={colors.bg}
                stroke={colors.border}
                strokeWidth={2}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
                style={{
                  filter: isCurrent ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none',
                }}
              />

              {/* Node value */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.text}
                className="text-sm font-semibold"
                style={{ pointerEvents: 'none' }}
              >
                {node.value}
              </text>

              {/* Height indicator (for AVL trees) */}
              {showHeight && node.height !== undefined && (
                <text
                  x={node.x + 28}
                  y={node.y - 15}
                  textAnchor="start"
                  className="text-xs fill-gray-400"
                  style={{ pointerEvents: 'none' }}
                >
                  h={node.height}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        <LegendItem color="#f1f5f9" borderColor="#94a3b8" label="Default" />
        <LegendItem color="#3b82f6" borderColor="#1d4ed8" label="Current" />
        <LegendItem color="#a855f7" borderColor="#7c3aed" label="Visited" />
        <LegendItem color="#22c55e" borderColor="#16a34a" label="Found" />
      </div>
    </div>
  );
}

// ===========================================
// Legend Item
// ===========================================

function LegendItem({ 
  color, 
  borderColor, 
  label 
}: { 
  color: string; 
  borderColor: string; 
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div 
        className="w-4 h-4 rounded-full border-2"
        style={{ backgroundColor: color, borderColor }}
      />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}

// ===========================================
// Heap Array Visualization (for min/max heap)
// ===========================================

interface HeapVisualizerProps {
  values: number[];
  currentIndex?: number;
  comparingIndices?: number[];
  swappingIndices?: number[];
  className?: string;
}

export function HeapVisualizer({
  values,
  currentIndex,
  comparingIndices = [],
  swappingIndices = [],
  className,
}: HeapVisualizerProps) {
  // Convert array to tree structure for visualization
  const root = useMemo(() => {
    if (values.length === 0) return null;

    function buildTree(index: number): TreeNode | null {
      if (index >= values.length) return null;

      let state: ElementState = 'default';
      if (swappingIndices.includes(index)) state = 'swapping';
      else if (index === currentIndex) state = 'current';
      else if (comparingIndices.includes(index)) state = 'comparing';

      return {
        id: `heap-${index}`,
        value: values[index],
        state,
        left: buildTree(2 * index + 1) || undefined,
        right: buildTree(2 * index + 2) || undefined,
      };
    }

    return buildTree(0);
  }, [values, currentIndex, comparingIndices, swappingIndices]);

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Tree visualization */}
      <TreeVisualizer root={root} />

      {/* Array representation */}
      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-500 mb-2">Array representation:</span>
        <div className="flex gap-1">
          {values.map((value, index) => {
            let bgClass = 'bg-slate-100';
            if (swappingIndices.includes(index)) bgClass = 'bg-red-100';
            else if (index === currentIndex) bgClass = 'bg-blue-100';
            else if (comparingIndices.includes(index)) bgClass = 'bg-amber-100';

            return (
              <div
                key={index}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded border-2',
                  bgClass,
                  swappingIndices.includes(index) ? 'border-red-400' :
                  index === currentIndex ? 'border-blue-400' :
                  comparingIndices.includes(index) ? 'border-amber-400' :
                  'border-slate-300'
                )}
              >
                <span className="text-sm font-medium">{value}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-1 mt-1">
          {values.map((_, index) => (
            <div key={index} className="w-10 text-center text-xs text-gray-400">
              {index}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Helper: Create tree from array
// ===========================================

export function createTreeFromArray(
  values: (number | null)[],
  index: number = 0
): TreeNode | null {
  if (index >= values.length || values[index] === null) {
    return null;
  }

  return {
    id: `node-${index}`,
    value: values[index] as number,
    state: 'default',
    left: createTreeFromArray(values, 2 * index + 1) || undefined,
    right: createTreeFromArray(values, 2 * index + 2) || undefined,
  };
}
