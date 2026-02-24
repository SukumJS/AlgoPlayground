"use client";

import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { OrderItem } from "@/src/app/types/posttest";

// ─── Sortable Node Item ──────────────────────────────────────────────
type SortableNodeProps = {
    item: OrderItem;
    variant: "square" | "circle";
    disabled?: boolean;
};

function SortableNode({ item, variant, disabled }: SortableNodeProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id, disabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    const isCircle = variant === "circle";

    // Check if label is a short number/letter (render as node) vs longer text (render as step card)
    const isCompactLabel = item.label.length <= 4;

    if (isCompactLabel) {
        // Render as playground-style node
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`
          shrink-0 flex justify-center items-center
          border-2 border-[#5D5D5D] bg-[#D9E363]
          w-14 h-14 text-2xl font-semibold text-[#222121]
          select-none transition-shadow duration-200
          ${isCircle ? "rounded-full" : "rounded-lg"}
          ${disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
          ${isDragging ? "shadow-lg" : "shadow-md"}
        `}
            >
                {item.label}
            </div>
        );
    }

    // Render as step card (for text-based ordering items like algorithm steps)
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        shrink-0 flex items-center justify-center
        px-5 py-3 min-w-[140px] min-h-[56px]
        border-2 border-[#5D5D5D] bg-[#D9E363]
        rounded-lg text-sm font-semibold text-[#222121]
        select-none transition-shadow duration-200
        ${disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
        ${isDragging ? "shadow-lg" : "shadow-md"}
      `}
        >
            {item.label}
        </div>
    );
}

// ─── Static Node (for result page) ───────────────────────────────────
type StaticNodeProps = {
    item: OrderItem;
    variant: "square" | "circle";
    isWrong?: boolean;
};

function StaticNode({ item, variant, isWrong = false }: StaticNodeProps) {
    const isCircle = variant === "circle";
    const isCompactLabel = item.label.length <= 4;
    const bgColor = isWrong ? "bg-[#BF1A1A]" : "bg-[#D9E363]";
    const borderColor = isWrong ? "border-[#BF1A1A]" : "border-[#5D5D5D]";
    const textColor = isWrong ? "text-white" : "text-[#222121]";

    if (isCompactLabel) {
        return (
            <div
                className={`
          shrink-0 flex justify-center items-center
          border-2 ${borderColor} ${bgColor}
          w-14 h-14 text-2xl font-semibold ${textColor}
          ${isCircle ? "rounded-full" : "rounded-lg"}
        `}
            >
                {item.label}
            </div>
        );
    }

    return (
        <div
            className={`
        shrink-0 flex items-center justify-center
        px-5 py-3 min-w-[140px] min-h-[56px]
        border-2 ${borderColor} ${bgColor}
        rounded-lg text-sm font-semibold ${textColor}
      `}
        >
            {item.label}
        </div>
    );
}

// ─── Main Ordering Question Component ────────────────────────────────
type OrderingQuestionProps = {
    items: OrderItem[];
    currentOrder: string[];
    onReorder: (newOrder: string[]) => void;
    variant?: "square" | "circle";
    disabled?: boolean;
    className?: string;
};

function OrderingQuestion({
    items,
    currentOrder,
    onReorder,
    variant = "square",
    disabled = false,
    className = "",
}: OrderingQuestionProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        if (disabled) return;
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = currentOrder.indexOf(active.id as string);
            const newIndex = currentOrder.indexOf(over.id as string);
            const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
            onReorder(newOrder);
        }
    };

    // Get ordered items for rendering
    const orderedItems = currentOrder
        .map((id) => items.find((item) => item.id === id))
        .filter(Boolean) as OrderItem[];

    return (
        <div className={`${className}`}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={currentOrder}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="flex flex-wrap gap-3 items-center justify-center">
                        {orderedItems.map((item) => (
                            <SortableNode
                                key={item.id}
                                item={item}
                                variant={variant}
                                disabled={disabled}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}

// ─── Static display for result page ──────────────────────────────────
type OrderingResultDisplayProps = {
    items: OrderItem[];
    orderedIds: string[];
    correctOrder?: string[];
    variant?: "square" | "circle";
    className?: string;
};

export function OrderingResultDisplay({
    items,
    orderedIds,
    correctOrder,
    variant = "square",
    className = "",
}: OrderingResultDisplayProps) {
    const orderedItems = orderedIds
        .map((id) => items.find((item) => item.id === id))
        .filter(Boolean) as OrderItem[];

    return (
        <div className={`flex flex-wrap gap-3 items-center justify-center ${className}`}>
            {orderedItems.map((item, index) => {
                const isWrong = correctOrder
                    ? orderedIds[index] !== correctOrder[index]
                    : false;
                return (
                    <StaticNode
                        key={item.id}
                        item={item}
                        variant={variant}
                        isWrong={isWrong}
                    />
                );
            })}
        </div>
    );
}

export default OrderingQuestion;
