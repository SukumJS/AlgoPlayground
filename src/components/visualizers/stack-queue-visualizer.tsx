'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { StackQueueItem, ElementState } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowRight, ArrowLeft } from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface StackVisualizerProps {
  items: StackQueueItem[];
  maxItems?: number;
  showLabels?: boolean;
  className?: string;
}

interface QueueVisualizerProps {
  items: StackQueueItem[];
  maxItems?: number;
  showLabels?: boolean;
  className?: string;
}

// ===========================================
// Color mapping
// ===========================================

const stateColors: Record<ElementState, { bg: string; border: string }> = {
  default: { bg: 'bg-slate-100', border: 'border-slate-300' },
  current: { bg: 'bg-blue-100', border: 'border-blue-400' },
  highlight: { bg: 'bg-yellow-100', border: 'border-yellow-400' },
  visited: { bg: 'bg-purple-100', border: 'border-purple-400' },
  comparing: { bg: 'bg-amber-100', border: 'border-amber-400' },
  swapping: { bg: 'bg-red-100', border: 'border-red-400' },
  sorted: { bg: 'bg-green-100', border: 'border-green-400' },
  path: { bg: 'bg-teal-100', border: 'border-teal-400' },
  found: { bg: 'bg-emerald-100', border: 'border-emerald-400' },
  'not-found': { bg: 'bg-gray-100', border: 'border-gray-300' },
  pivot: { bg: 'bg-indigo-100', border: 'border-indigo-400' },
  minimum: { bg: 'bg-pink-100', border: 'border-pink-400' },
};

// ===========================================
// Stack Visualizer Component
// ===========================================

export function StackVisualizer({
  items,
  maxItems = 10,
  showLabels = true,
  className,
}: StackVisualizerProps) {
  // Stack grows upward, so reverse for display
  const displayItems = [...items].reverse().slice(0, maxItems);
  const isOverflow = items.length > maxItems;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Push indicator */}
      {showLabels && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
          <ArrowDown className="w-4 h-4" />
          <span>Push</span>
        </div>
      )}

      {/* Stack container */}
      <div className="relative">
        {/* Stack box outline */}
        <div className="absolute inset-x-0 bottom-0 h-full border-l-2 border-r-2 border-b-2 border-gray-300 rounded-b-lg" />

        {/* Stack items */}
        <div className="flex flex-col-reverse items-center p-2 min-w-[120px]">
          <AnimatePresence mode="popLayout">
            {displayItems.map((item, index) => {
              const isTop = index === 0;
              const colors = stateColors[item.state] || stateColors.default;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                  className={cn(
                    'w-full px-4 py-3 rounded-md border-2 text-center font-medium mb-1',
                    colors.bg,
                    colors.border,
                    isTop && 'ring-2 ring-blue-200'
                  )}
                >
                  <span className="text-gray-700">{item.value}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {items.length === 0 && (
            <div className="w-full px-4 py-8 text-center text-gray-400 text-sm">
              Stack is empty
            </div>
          )}

          {/* Overflow indicator */}
          {isOverflow && (
            <div className="w-full px-4 py-2 text-center text-gray-400 text-xs">
              ... {items.length - maxItems} more items
            </div>
          )}
        </div>

        {/* Top indicator */}
        {items.length > 0 && showLabels && (
          <div className="absolute -right-16 top-2 flex items-center gap-1 text-xs text-blue-600">
            <ArrowLeft className="w-3 h-3" />
            <span>Top</span>
          </div>
        )}
      </div>

      {/* Pop indicator */}
      {showLabels && (
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
          <ArrowDown className="w-4 h-4 rotate-180" />
          <span>Pop</span>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-sm text-gray-600">
        Size: <span className="font-medium">{items.length}</span>
      </div>
    </div>
  );
}

// ===========================================
// Queue Visualizer Component
// ===========================================

export function QueueVisualizer({
  items,
  maxItems = 8,
  showLabels = true,
  className,
}: QueueVisualizerProps) {
  const displayItems = items.slice(0, maxItems);
  const isOverflow = items.length > maxItems;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Direction indicator */}
      {showLabels && (
        <div className="flex items-center justify-between w-full max-w-md mb-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span>Dequeue</span>
            <ArrowLeft className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            <span>Enqueue</span>
          </div>
        </div>
      )}

      {/* Queue container */}
      <div className="relative flex items-center">
        {/* Front indicator */}
        {items.length > 0 && showLabels && (
          <div className="absolute -left-14 flex flex-col items-center text-xs text-green-600">
            <span>Front</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        )}

        {/* Queue box */}
        <div className="flex items-center border-2 border-gray-300 rounded-lg p-2 min-w-[200px] min-h-[60px]">
          <AnimatePresence mode="popLayout">
            {displayItems.map((item, index) => {
              const isFront = index === 0;
              const isRear = index === displayItems.length - 1;
              const colors = stateColors[item.state] || stateColors.default;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -50 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                  className={cn(
                    'px-4 py-3 rounded-md border-2 text-center font-medium mx-1',
                    colors.bg,
                    colors.border,
                    isFront && 'ring-2 ring-green-200',
                    isRear && 'ring-2 ring-blue-200'
                  )}
                >
                  <span className="text-gray-700">{item.value}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {items.length === 0 && (
            <div className="w-full px-4 py-2 text-center text-gray-400 text-sm">
              Queue is empty
            </div>
          )}

          {/* Overflow indicator */}
          {isOverflow && (
            <div className="px-2 py-3 text-gray-400 text-xs">
              +{items.length - maxItems}
            </div>
          )}
        </div>

        {/* Rear indicator */}
        {items.length > 0 && showLabels && (
          <div className="absolute -right-12 flex flex-col items-center text-xs text-blue-600">
            <span>Rear</span>
            <ArrowLeft className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-sm text-gray-600">
        Size: <span className="font-medium">{items.length}</span>
      </div>
    </div>
  );
}

// ===========================================
// Combined Stack/Queue View (for BFS/DFS comparison)
// ===========================================

interface DataStructureViewProps {
  type: 'stack' | 'queue';
  items: StackQueueItem[];
  title?: string;
  className?: string;
}

export function DataStructureView({
  type,
  items,
  title,
  className,
}: DataStructureViewProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-6', className)}>
      {title && (
        <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
          {title}
        </h3>
      )}
      
      {type === 'stack' ? (
        <StackVisualizer items={items} />
      ) : (
        <QueueVisualizer items={items} />
      )}
    </div>
  );
}
