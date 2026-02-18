import type { Node, Edge } from "@xyflow/react";

// Shared choice type (reuse from quiz.ts structure)
export type PosttestChoice = {
    id: string;
    label: string;
    text: string;
};

// Item in an ordering question (draggable node)
export type OrderItem = {
    id: string;
    label: string;
};

// Canvas data for tree/graph ordering questions (ReactFlow)
export type OrderingCanvasData = {
    canvasType: "tree" | "graph";
    nodes: Node[];
    edges: Edge[];
};

// --- Question sub-types ---

export type MultipleChoicePosttest = {
    id: string;
    type: "multiple_choice";
    title: string;
    text: string;
    question: {
        multipleChoice: {
            choices: PosttestChoice[];
            correctChoiceId: string;
        };
    };
};

export type FillBlankPosttest = {
    id: string;
    type: "fill_blank";
    title: string;
    text: string;
    question: {
        correctAnswer: string;
    };
};

export type OrderingPosttest = {
    id: string;
    type: "ordering";
    title: string;
    text: string;
    question: {
        items: OrderItem[];
        correctOrder: string[]; // array of item ids in correct order
        canvasData?: OrderingCanvasData; // present → ReactFlow canvas, absent → drag-and-drop
    };
};

// Discriminated union
export type PosttestQuestion =
    | MultipleChoicePosttest
    | FillBlankPosttest
    | OrderingPosttest;

// Full posttest dataset for an algorithm
export type PosttestData = {
    id: string;
    algorithm: string;
    typeQuiz: "posttest";
    title: string;
    questions: PosttestQuestion[];
};

// User answer — supports all 3 types
export type PosttestUserAnswer = {
    questionId: string;
    type: "multiple_choice" | "fill_blank" | "ordering";
    selectedChoiceId?: string | null;   // multiple_choice
    filledAnswer?: string | null;       // fill_blank
    orderedItems?: string[] | null;     // ordering (array of item ids)
};
