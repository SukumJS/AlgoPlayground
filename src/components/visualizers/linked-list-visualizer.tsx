'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkedList, LinkedListNode, ElementState } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowLeft } from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface LinkedListVisualizerProps {
  list: LinkedList;
  currentNodeId?: string;
  highlightedNodes?: string[];
  showPointers?: boolean;
  className?: string;
}

// ===========================================
// Color mapping
// ===========================================

const stateColors: Record<ElementState, { bg: string; border: string; text: string }> = {
  default: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700' },
  current: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  highlight: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700' },
  visited: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
  comparing: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700' },
  swapping: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700' },
  sorted: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
  path: { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-700' },
  found: { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-700' },
  'not-found': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-500' },
  pivot: { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-700' },
  minimum: { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-700' },
};

// ===========================================
// Linked List Visualizer Component
// ===========================================

export function LinkedListVisualizer({
  list,
  currentNodeId,
  highlightedNodes = [],
  showPointers = true,
  className,
}: LinkedListVisualizerProps) {
  // Convert linked list to array for display
  const nodes = useMemo(() => {
    const result: LinkedListNode[] = [];
    let currentId = list.head;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const node = list.nodes.get(currentId);
      if (node) {
        result.push(node);
        currentId = node.next || null;
      } else {
        break;
      }
    }

    return result;
  }, [list]);

  const isDoublyLinked = list.type === 'doubly';

  if (nodes.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-32 text-gray-400', className)}>
        <div className="text-center">
          <div className="text-lg mb-1">Empty List</div>
          <div className="text-sm">HEAD → NULL</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* List visualization */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 px-2">
        {/* Head pointer */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500 mb-1">HEAD</span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>

        <AnimatePresence mode="popLayout">
          {nodes.map((node, index) => {
            const isFirst = index === 0;
            const isLast = index === nodes.length - 1;
            const isCurrent = node.id === currentNodeId;
            const isHighlighted = highlightedNodes.includes(node.id);

            let state = node.state;
            if (isCurrent) state = 'current';
            else if (isHighlighted) state = 'highlight';

            const colors = stateColors[state] || stateColors.default;

            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                  delay: index * 0.05,
                }}
                className="flex items-center"
              >
                {/* Node box */}
                <div
                  className={cn(
                    'flex items-center rounded-lg border-2 overflow-hidden',
                    colors.border,
                    isCurrent && 'ring-2 ring-blue-300',
                    isHighlighted && 'ring-2 ring-yellow-300'
                  )}
                >
                  {/* Prev pointer (for doubly linked) */}
                  {isDoublyLinked && showPointers && (
                    <div className={cn(
                      'w-8 h-12 flex items-center justify-center border-r-2',
                      colors.border,
                      colors.bg
                    )}>
                      <ArrowLeft className="w-3 h-3 text-gray-400" />
                    </div>
                  )}

                  {/* Value */}
                  <div className={cn(
                    'w-12 h-12 flex items-center justify-center font-semibold',
                    colors.bg,
                    colors.text
                  )}>
                    {node.value}
                  </div>

                  {/* Next pointer */}
                  {showPointers && (
                    <div className={cn(
                      'w-8 h-12 flex items-center justify-center border-l-2',
                      colors.border,
                      colors.bg
                    )}>
                      {node.next ? (
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                      ) : (
                        <span className="text-xs text-gray-400">∅</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Arrow to next node */}
                {!isLast && (
                  <div className="flex items-center mx-1">
                    <div className="w-6 h-0.5 bg-gray-300" />
                    <ArrowRight className="w-4 h-4 text-gray-400 -ml-1" />
                  </div>
                )}

                {/* Doubly linked back arrow */}
                {isDoublyLinked && !isLast && (
                  <div className="absolute -bottom-4 flex items-center">
                    <ArrowLeft className="w-3 h-3 text-gray-300" />
                    <div className="w-4 h-0.5 bg-gray-200" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* NULL pointer */}
        <div className="flex items-center gap-1 ml-2">
          <div className="w-4 h-0.5 bg-gray-300" />
          <span className="text-sm text-gray-400 font-mono">NULL</span>
        </div>
      </div>

      {/* Tail pointer */}
      {list.tail && (
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>TAIL points to: </span>
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
            {list.nodes.get(list.tail)?.value}
          </span>
        </div>
      )}

      {/* List info */}
      <div className="flex gap-4 mt-4 text-sm text-gray-600">
        <div>
          Type: <span className="font-medium capitalize">{list.type}</span>
        </div>
        <div>
          Length: <span className="font-medium">{nodes.length}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        <LegendItem bg="bg-slate-100" border="border-slate-300" label="Default" />
        <LegendItem bg="bg-blue-100" border="border-blue-400" label="Current" />
        <LegendItem bg="bg-yellow-100" border="border-yellow-400" label="Highlighted" />
        <LegendItem bg="bg-emerald-100" border="border-emerald-400" label="Found" />
      </div>
    </div>
  );
}

// ===========================================
// Legend Item
// ===========================================

function LegendItem({ 
  bg, 
  border, 
  label 
}: { 
  bg: string; 
  border: string; 
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('w-4 h-4 rounded border-2', bg, border)} />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}

// ===========================================
// Simple Linked List Node Creator
// ===========================================

export function createLinkedListFromArray(
  values: number[],
  type: 'singly' | 'doubly' = 'singly'
): LinkedList {
  const nodes = new Map<string, LinkedListNode>();
  
  if (values.length === 0) {
    return { head: null, tail: null, nodes, type };
  }

  const nodeIds = values.map((_, i) => `node-${i}`);

  values.forEach((value, index) => {
    const node: LinkedListNode = {
      id: nodeIds[index],
      value,
      state: 'default',
      next: index < values.length - 1 ? nodeIds[index + 1] : undefined,
      prev: type === 'doubly' && index > 0 ? nodeIds[index - 1] : undefined,
    };
    nodes.set(node.id, node);
  });

  return {
    head: nodeIds[0],
    tail: nodeIds[nodeIds.length - 1],
    nodes,
    type,
  };
}
