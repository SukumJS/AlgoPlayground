'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrayElement, ElementState } from '@/types';
import { cn } from '@/lib/utils';
import { useVisualizerStore, getStateColor } from '@/stores';

// ===========================================
// Types
// ===========================================

interface ArrayVisualizerProps {
  elements: ArrayElement[];
  maxValue?: number;
  showValues?: boolean;
  showIndices?: boolean;
  comparing?: [number, number] | null;
  swapping?: [number, number] | null;
  className?: string;
}

// ===========================================
// Color mapping for element states
// ===========================================

const stateColorClasses: Record<ElementState, string> = {
  default: 'bg-slate-400',
  comparing: 'bg-amber-400',
  swapping: 'bg-red-500',
  sorted: 'bg-emerald-500',
  current: 'bg-blue-500',
  visited: 'bg-purple-400',
  path: 'bg-teal-500',
  highlight: 'bg-yellow-400',
  pivot: 'bg-indigo-500',
  minimum: 'bg-pink-500',
  found: 'bg-green-500',
  'not-found': 'bg-gray-300',
};

const stateBorderClasses: Record<ElementState, string> = {
  default: 'border-slate-500',
  comparing: 'border-amber-500',
  swapping: 'border-red-600',
  sorted: 'border-emerald-600',
  current: 'border-blue-600',
  visited: 'border-purple-500',
  path: 'border-teal-600',
  highlight: 'border-yellow-500',
  pivot: 'border-indigo-600',
  minimum: 'border-pink-600',
  found: 'border-green-600',
  'not-found': 'border-gray-400',
};

// ===========================================
// Array Visualizer Component
// ===========================================

export function ArrayVisualizer({
  elements,
  maxValue: providedMaxValue,
  showValues = true,
  showIndices = true,
  comparing,
  swapping,
  className,
}: ArrayVisualizerProps) {
  const { settings } = useVisualizerStore();
  
  // Calculate max value for scaling
  const maxValue = useMemo(() => {
    if (providedMaxValue) return providedMaxValue;
    return Math.max(...elements.map((e) => e.value), 1);
  }, [elements, providedMaxValue]);

  // Calculate bar dimensions based on element count
  const barWidth = useMemo(() => {
    const count = elements.length;
    if (count <= 5) return 60;
    if (count <= 10) return 50;
    if (count <= 15) return 40;
    if (count <= 20) return 32;
    return Math.max(24, Math.floor(600 / count));
  }, [elements.length]);

  const maxHeight = 200;
  const gap = Math.max(4, Math.min(8, 80 / elements.length));

  if (elements.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64 text-gray-400', className)}>
        No data to display
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Bars Container */}
      <div 
        className="flex items-end justify-center"
        style={{ gap: `${gap}px`, minHeight: maxHeight + 60 }}
      >
        <AnimatePresence mode="popLayout">
          {elements.map((element, index) => {
            const height = (element.value / maxValue) * maxHeight;
            const isComparing = comparing?.includes(index);
            const isSwapping = swapping?.includes(index);
            
            // Determine visual state
            let visualState = element.state;
            if (isSwapping) visualState = 'swapping';
            else if (isComparing) visualState = 'comparing';

            return (
              <motion.div
                key={element.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: isComparing || isSwapping ? 1.05 : 1,
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                  layout: { duration: 0.3 },
                }}
                className="flex flex-col items-center"
              >
                {/* Value label (above bar) */}
                {showValues && (
                  <motion.span
                    className={cn(
                      'text-xs font-medium mb-1 transition-colors',
                      visualState === 'sorted' ? 'text-emerald-600' :
                      visualState === 'comparing' ? 'text-amber-600' :
                      visualState === 'swapping' ? 'text-red-600' :
                      visualState === 'current' ? 'text-blue-600' :
                      'text-gray-600'
                    )}
                    animate={{
                      scale: isComparing || isSwapping ? 1.2 : 1,
                      fontWeight: isComparing || isSwapping ? 700 : 500,
                    }}
                  >
                    {element.value}
                  </motion.span>
                )}

                {/* Bar */}
                <motion.div
                  className={cn(
                    'rounded-t-md border-2 transition-colors relative',
                    stateColorClasses[visualState],
                    stateBorderClasses[visualState],
                    isSwapping && 'ring-2 ring-red-300 ring-offset-2',
                    isComparing && 'ring-2 ring-amber-300 ring-offset-1'
                  )}
                  style={{ width: barWidth }}
                  animate={{
                    height,
                    y: isSwapping ? -10 : 0,
                  }}
                  transition={{
                    height: { type: 'spring', stiffness: 300, damping: 25 },
                    y: { type: 'spring', stiffness: 400, damping: 20 },
                  }}
                >
                  {/* Swap indicator arrows */}
                  {isSwapping && (
                    <motion.div
                      className="absolute -top-6 left-1/2 -translate-x-1/2"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="text-red-500 text-lg">↕</span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Index label (below bar) */}
                {showIndices && (
                  <span className="text-xs text-gray-500 mt-1">{index}</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 text-xs">
        <LegendItem color="bg-slate-400" label="Default" />
        <LegendItem color="bg-amber-400" label="Comparing" />
        <LegendItem color="bg-red-500" label="Swapping" />
        <LegendItem color="bg-emerald-500" label="Sorted" />
        <LegendItem color="bg-blue-500" label="Current" />
      </div>
    </div>
  );
}

// ===========================================
// Legend Item Component
// ===========================================

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('w-3 h-3 rounded-sm', color)} />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}

// ===========================================
// Compact Array View (for search algorithms)
// ===========================================

interface CompactArrayProps {
  elements: ArrayElement[];
  left?: number;
  right?: number;
  mid?: number;
  target?: number;
  showIndices?: boolean;
  className?: string;
}

export function CompactArrayVisualizer({
  elements,
  left,
  right,
  mid,
  target,
  showIndices = true,
  className,
}: CompactArrayProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Target indicator */}
      {target !== undefined && (
        <div className="text-sm text-gray-600">
          Target: <span className="font-semibold text-blue-600">{target}</span>
        </div>
      )}

      {/* Array boxes */}
      <div className="flex gap-1">
        {elements.map((element, index) => {
          const isInRange = left !== undefined && right !== undefined && 
                           index >= left && index <= right;
          const isMid = mid !== undefined && index === mid;
          const isLeft = left !== undefined && index === left;
          const isRight = right !== undefined && index === right;

          let state = element.state;
          if (isMid && state === 'default') state = 'comparing';

          return (
            <motion.div
              key={element.id}
              className="flex flex-col items-center"
              animate={{
                opacity: isInRange || left === undefined ? 1 : 0.3,
              }}
            >
              <motion.div
                className={cn(
                  'w-12 h-12 flex items-center justify-center rounded-lg border-2 font-medium',
                  stateColorClasses[state],
                  stateBorderClasses[state],
                  !isInRange && left !== undefined && 'opacity-40',
                  isMid && 'ring-2 ring-blue-400 ring-offset-2'
                )}
                animate={{
                  scale: isMid ? 1.1 : 1,
                }}
              >
                {element.value}
              </motion.div>
              
              {showIndices && (
                <div className="flex flex-col items-center mt-1">
                  <span className="text-xs text-gray-500">{index}</span>
                  <div className="flex gap-1 text-xs">
                    {isLeft && <span className="text-green-600 font-medium">L</span>}
                    {isMid && <span className="text-blue-600 font-medium">M</span>}
                    {isRight && <span className="text-red-600 font-medium">R</span>}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Range indicators */}
      {left !== undefined && right !== undefined && (
        <div className="text-sm text-gray-600">
          Search range: [{left}, {right}]
          {mid !== undefined && ` • Mid: ${mid}`}
        </div>
      )}
    </div>
  );
}
