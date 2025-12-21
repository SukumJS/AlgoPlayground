'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import { GripVertical, Check, X, ArrowRight } from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface DragDropMatchProps {
  question: Question;
  matches: Record<string, string>; // leftId -> rightId
  onMatchChange: (matches: Record<string, string>) => void;
  showResult?: boolean;
  disabled?: boolean;
}

interface MatchOption {
  id: string;
  text: string;
}

// ===========================================
// Draggable Item Component
// ===========================================

interface DraggableItemProps {
  id: string;
  text: string;
  disabled?: boolean;
}

function DraggableItem({ id, text, disabled }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border-2 bg-white cursor-grab active:cursor-grabbing',
        'border-primary-200 hover:border-primary-400 hover:bg-primary-50',
        isDragging && 'opacity-50 shadow-lg',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

// ===========================================
// Droppable Slot Component
// ===========================================

interface DroppableSlotProps {
  id: string;
  leftText: string;
  matchedText?: string;
  isCorrect?: boolean | null;
  showResult: boolean;
  disabled?: boolean;
}

function DroppableSlot({ 
  id, 
  leftText, 
  matchedText, 
  isCorrect, 
  showResult,
  disabled 
}: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
        !showResult && !matchedText && 'border-dashed border-gray-300 bg-gray-50',
        !showResult && matchedText && 'border-solid border-primary-300 bg-primary-50',
        !showResult && isOver && 'border-primary-500 bg-primary-100',
        showResult && isCorrect === true && 'border-green-500 bg-green-50',
        showResult && isCorrect === false && 'border-red-500 bg-red-50',
        showResult && isCorrect === null && 'border-gray-300 bg-gray-50'
      )}
    >
      {/* Left side (fixed) */}
      <div className="flex-1 font-medium text-gray-700">
        {leftText}
      </div>

      {/* Arrow */}
      <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />

      {/* Right side (droppable) */}
      <div
        className={cn(
          'flex-1 min-h-[40px] flex items-center justify-center rounded-lg border-2 border-dashed',
          !matchedText && 'border-gray-300 bg-gray-100',
          matchedText && !showResult && 'border-primary-400 bg-white',
          showResult && isCorrect === true && 'border-green-400 bg-white',
          showResult && isCorrect === false && 'border-red-400 bg-white'
        )}
      >
        {matchedText ? (
          <div className="flex items-center gap-2 px-3 py-1">
            {showResult && isCorrect === true && (
              <Check className="w-4 h-4 text-green-500" />
            )}
            {showResult && isCorrect === false && (
              <X className="w-4 h-4 text-red-500" />
            )}
            <span className={cn(
              'text-sm',
              showResult && isCorrect === true && 'text-green-700',
              showResult && isCorrect === false && 'text-red-700'
            )}>
              {matchedText}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Drop here</span>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Drag Drop Match Component
// ===========================================

export function DragDropMatch({
  question,
  matches,
  onMatchChange,
  showResult = false,
  disabled = false,
}: DragDropMatchProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Parse options - assuming format: { left: [...], right: [...] }
  const options = question.options as { left: MatchOption[]; right: MatchOption[] };
  const correctMatches = question.correctAnswer as Record<string, string>;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get unmatched right options
  const matchedRightIds = Object.values(matches);
  const unmatchedRight = options.right.filter(
    (opt) => !matchedRightIds.includes(opt.id)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over) {
      const draggedId = active.id as string;
      const droppedOnId = over.id as string;

      // Check if dropped on a left item slot
      if (options.left.some((l) => l.id === droppedOnId)) {
        const newMatches = { ...matches };
        
        // Remove any existing match for this right item
        for (const key of Object.keys(newMatches)) {
          if (newMatches[key] === draggedId) {
            delete newMatches[key];
          }
        }
        
        // Add new match
        newMatches[droppedOnId] = draggedId;
        onMatchChange(newMatches);
      }
    }
  }, [matches, options.left, onMatchChange]);

  const getActiveText = () => {
    if (!activeId) return '';
    const opt = options.right.find((r) => r.id === activeId);
    return opt?.text || '';
  };

  const getMatchedText = (leftId: string) => {
    const rightId = matches[leftId];
    if (!rightId) return undefined;
    const opt = options.right.find((r) => r.id === rightId);
    return opt?.text;
  };

  const getIsCorrect = (leftId: string) => {
    if (!showResult) return null;
    const matchedRightId = matches[leftId];
    if (!matchedRightId) return null;
    return correctMatches[leftId] === matchedRightId;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side: Drop zones */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Match items:</h4>
          {options.left.map((left) => (
            <DroppableSlot
              key={left.id}
              id={left.id}
              leftText={left.text}
              matchedText={getMatchedText(left.id)}
              isCorrect={getIsCorrect(left.id)}
              showResult={showResult}
              disabled={disabled}
            />
          ))}
        </div>

        {/* Right side: Draggable items */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Available items:</h4>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {unmatchedRight.map((right) => (
                <motion.div
                  key={right.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <DraggableItem
                    id={right.id}
                    text={right.text}
                    disabled={disabled}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {unmatchedRight.length === 0 && !showResult && (
              <p className="text-sm text-gray-400 italic">
                All items have been matched
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-primary-500 bg-white shadow-lg">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{getActiveText()}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
