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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Question, QuestionOption } from '@/types';
import { cn } from '@/lib/utils';
import { GripVertical, Check, X } from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface DragDropOrderProps {
  question: Question;
  currentOrder: string[];
  onOrderChange: (order: string[]) => void;
  showResult?: boolean;
  disabled?: boolean;
}

// ===========================================
// Sortable Item Component
// ===========================================

interface SortableItemProps {
  id: string;
  text: string;
  index: number;
  state: 'default' | 'correct' | 'incorrect';
  disabled?: boolean;
}

function SortableItem({ id, text, index, state, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border-2 bg-white transition-all',
        state === 'default' && 'border-gray-200',
        state === 'correct' && 'border-green-500 bg-green-50',
        state === 'incorrect' && 'border-red-500 bg-red-50',
        isDragging && 'shadow-lg z-10 opacity-90',
        disabled && 'cursor-not-allowed'
      )}
    >
      {/* Drag handle */}
      {!disabled && (
        <button
          className="p-1 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>
      )}

      {/* Position number */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0',
          state === 'default' && 'bg-gray-100 text-gray-600',
          state === 'correct' && 'bg-green-500 text-white',
          state === 'incorrect' && 'bg-red-500 text-white'
        )}
      >
        {state === 'correct' ? (
          <Check className="w-4 h-4" />
        ) : state === 'incorrect' ? (
          <X className="w-4 h-4" />
        ) : (
          index + 1
        )}
      </div>

      {/* Item text */}
      <span
        className={cn(
          'flex-1',
          state === 'default' && 'text-gray-700',
          state === 'correct' && 'text-green-700',
          state === 'incorrect' && 'text-red-700'
        )}
      >
        {text}
      </span>
    </div>
  );
}

// ===========================================
// Drag Drop Order Component
// ===========================================

export function DragDropOrder({
  question,
  currentOrder,
  onOrderChange,
  showResult = false,
  disabled = false,
}: DragDropOrderProps) {
  const options = question.options as QuestionOption[];
  const correctOrder = question.correctAnswer as string[];

  // Initialize order if empty
  const items = currentOrder.length > 0 
    ? currentOrder 
    : options.map(o => o.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      onOrderChange(newOrder);
    }
  }, [items, onOrderChange]);

  const getItemState = (itemId: string, index: number) => {
    if (!showResult) return 'default';
    
    const correctIndex = correctOrder.indexOf(itemId);
    return correctIndex === index ? 'correct' : 'incorrect';
  };

  const getOptionText = (id: string) => {
    return options.find(o => o.id === id)?.text || id;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((id, index) => (
            <SortableItem
              key={id}
              id={id}
              text={getOptionText(id)}
              index={index}
              state={getItemState(id, index)}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// ===========================================
// Simple List Order (non-draggable for results)
// ===========================================

interface OrderedListProps {
  items: { id: string; text: string; isCorrect?: boolean }[];
}

export function OrderedList({ items }: OrderedListProps) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border-2',
            item.isCorrect === undefined && 'border-gray-200 bg-gray-50',
            item.isCorrect === true && 'border-green-500 bg-green-50',
            item.isCorrect === false && 'border-red-500 bg-red-50'
          )}
        >
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm',
              item.isCorrect === undefined && 'bg-gray-200 text-gray-600',
              item.isCorrect === true && 'bg-green-500 text-white',
              item.isCorrect === false && 'bg-red-500 text-white'
            )}
          >
            {index + 1}
          </div>
          <span className="flex-1">{item.text}</span>
        </div>
      ))}
    </div>
  );
}
