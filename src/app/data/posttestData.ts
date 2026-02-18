import { PosttestData } from "@/src/app/types/posttest";
import type { Node, Edge } from "@xyflow/react";

// ─── Bubble Sort (sorting) ────────────────────────────────────────────
export const bubbleSortPosttest: PosttestData = {
    id: "posttest-bubble-sort",
    algorithm: "bubble-sort",
    typeQuiz: "posttest",
    title: "Post Test Of Bubble Sort",
    questions: [
        // --- Multiple Choice (3) ---
        {
            id: "q_bubble_post_mc1",
            type: "multiple_choice",
            title: "Bubble Sort Concept",
            text: "What is the basic operation in Bubble Sort?",
            question: {
                multipleChoice: {
                    choices: [
                        { id: "a", label: "A", text: "Compare and swap adjacent elements" },
                        { id: "b", label: "B", text: "Divide the array into halves" },
                        { id: "c", label: "C", text: "Find minimum element" },
                        { id: "d", label: "D", text: "Merge sorted arrays" },
                    ],
                    correctChoiceId: "a",
                },
            },
        },
        {
            id: "q_bubble_post_mc2",
            type: "multiple_choice",
            title: "Bubble Sort Minimum Swaps",
            text: "In Bubble Sort, what is the minimum number of swaps required to sort an already sorted array of size N?",
            question: {
                multipleChoice: {
                    choices: [
                        { id: "a", label: "A", text: "0" },
                        { id: "b", label: "B", text: "N" },
                        { id: "c", label: "C", text: "N-1" },
                        { id: "d", label: "D", text: "N^2" },
                    ],
                    correctChoiceId: "a",
                },
            },
        },
        {
            id: "q_bubble_post_mc3",
            type: "multiple_choice",
            title: "Bubble Sort Stability",
            text: "Is Bubble Sort a stable sorting algorithm?",
            question: {
                multipleChoice: {
                    choices: [
                        { id: "a", label: "A", text: "Yes, it preserves relative order of equal elements" },
                        { id: "b", label: "B", text: "No, it changes the order of equal elements" },
                        { id: "c", label: "C", text: "Only when sorting numbers" },
                        { id: "d", label: "D", text: "It depends on the implementation" },
                    ],
                    correctChoiceId: "a",
                },
            },
        },
        // --- Fill Blank (2) ---
        {
            id: "q_bubble_post_fb1",
            type: "fill_blank",
            title: "Bubble Sort Complexity",
            text: "Worst-case time complexity of Bubble Sort is ____",
            question: {
                correctAnswer: "O(n^2)",
            },
        },
        {
            id: "q_bubble_post_fb2",
            type: "fill_blank",
            title: "Bubble Sort Swaps",
            text: "During the iteration where i = 1, how many swaps occur when sorting [5, 3, 4, 1, 2] with Bubble Sort?",
            question: {
                correctAnswer: "3",
            },
        },
        // --- Ordering (2) — drag-and-drop for sorting ---
        {
            id: "q_bubble_post_ord1",
            type: "ordering",
            title: "Bubble Sort Steps",
            text: "Arrange the steps of Bubble Sort in the correct order:",
            question: {
                items: [
                    { id: "i1", label: "Compare adjacent elements" },
                    { id: "i2", label: "Swap if out of order" },
                    { id: "i3", label: "Repeat until sorted" },
                ],
                correctOrder: ["i1", "i2", "i3"],
            },
        },
        {
            id: "q_bubble_post_ord2",
            type: "ordering",
            title: "Bubble Sort Array State",
            text: "After performing the first pass of Bubble Sort on A = [5, 3, 1, 4, 2], what is the array content?",
            question: {
                items: [
                    { id: "n3", label: "3" },
                    { id: "n1", label: "1" },
                    { id: "n4", label: "4" },
                    { id: "n2", label: "2" },
                    { id: "n5", label: "5" },
                ],
                correctOrder: ["n3", "n1", "n4", "n2", "n5"],
            },
        },
    ],
};

// ─── Binary Tree Inorder Traversal (tree) ─────────────────────────────
// Tree canvas: BST [10, 5, 15, 3, 7]
//       10
//      /  \
//     5    15
//    / \
//   3   7
const treeNodes_ord1: Node[] = [
    { id: "n10", type: "custom", data: { label: "10", variant: "circle" }, position: { x: 200, y: 30 } },
    { id: "n5", type: "custom", data: { label: "5", variant: "circle" }, position: { x: 100, y: 130 } },
    { id: "n15", type: "custom", data: { label: "15", variant: "circle" }, position: { x: 300, y: 130 } },
    { id: "n3", type: "custom", data: { label: "3", variant: "circle" }, position: { x: 30, y: 230 } },
    { id: "n7", type: "custom", data: { label: "7", variant: "circle" }, position: { x: 170, y: 230 } },
];
const treeEdges_ord1: Edge[] = [
    { id: "e-10-5", source: "n10", sourceHandle: "source-bottom-left", target: "n5", targetHandle: "target-top-right", type: "straight", style: { strokeWidth: 2, stroke: "#5D5D5D" } },
    { id: "e-10-15", source: "n10", sourceHandle: "source-bottom-right", target: "n15", targetHandle: "target-top-left", type: "straight", style: { strokeWidth: 2, stroke: "#5D5D5D" } },
    { id: "e-5-3", source: "n5", sourceHandle: "source-bottom-left", target: "n3", targetHandle: "target-top-right", type: "straight", style: { strokeWidth: 2, stroke: "#5D5D5D" } },
    { id: "e-5-7", source: "n5", sourceHandle: "source-bottom-right", target: "n7", targetHandle: "target-top-left", type: "straight", style: { strokeWidth: 2, stroke: "#5D5D5D" } },
];

// Tree canvas: BST [20, 10, 30, 5, 15]
//        20
//       /  \
//     10    30
//    /  \
//   5   15
const treeNodes_ord2: Node[] = [
    { id: "n20", type: "custom", data: { label: "20", variant: "circle" }, position: { x: 200, y: 30 } },
    { id: "n10", type: "custom", data: { label: "10", variant: "circle" }, position: { x: 100, y: 130 } },
    { id: "n30", type: "custom", data: { label: "30", variant: "circle" }, position: { x: 300, y: 130 } },
    { id: "n5", type: "custom", data: { label: "5", variant: "circle" }, position: { x: 30, y: 230 } },
    { id: "n15", type: "custom", data: { label: "15", variant: "circle" }, position: { x: 170, y: 230 } },
];
const treeEdges_ord2: Edge[] = [
    { id: "e-20-10", source: "n20", sourceHandle: "source-bottom-left", target: "n10", targetHandle: "target-top-right", type: "straight", style: { strokeWidth: 2, stroke: "#5D5D5D" } },
    { id: "e-20-30", source: "n20", sourceHandle: "source-bottom-right", target: "n30", targetHandle: "target-top-left", type: "straight", style: { strokeWidth: 2, stroke: "#5D5D5D" } },
    { id: "e-10-5", source: "n10", sourceHandle: "source-bottom-left", target: "n5", targetHandle: "target-top-right", type: "straight", style: { strokeWidth: 2, stroke: "#5D5D5D" } },
    { id: "e-10-15", source: "n10", sourceHandle: "source-bottom-right", target: "n15", targetHandle: "target-top-left", type: "straight", style: { strokeWidth: 2, stroke: "#5D5D5D" } },
];

export const binaryTreeInorderPosttest: PosttestData = {
    id: "posttest-binary-tree-inorder",
    algorithm: "binary-tree-inorder",
    typeQuiz: "posttest",
    title: "Post Test Of Binary Tree Inorder Traversal",
    questions: [
        // --- Multiple Choice (2) ---
        {
            id: "q_tree_post_mc1",
            type: "multiple_choice",
            title: "Inorder Traversal Order",
            text: "What is the correct order of visiting nodes in inorder traversal?",
            question: {
                multipleChoice: {
                    choices: [
                        { id: "a", label: "A", text: "Left → Root → Right" },
                        { id: "b", label: "B", text: "Root → Left → Right" },
                        { id: "c", label: "C", text: "Left → Right → Root" },
                        { id: "d", label: "D", text: "Right → Root → Left" },
                    ],
                    correctChoiceId: "a",
                },
            },
        },
        {
            id: "q_tree_post_mc2",
            type: "multiple_choice",
            title: "Inorder BST Property",
            text: "What does inorder traversal of a Binary Search Tree produce?",
            question: {
                multipleChoice: {
                    choices: [
                        { id: "a", label: "A", text: "A sorted sequence in ascending order" },
                        { id: "b", label: "B", text: "A sorted sequence in descending order" },
                        { id: "c", label: "C", text: "A level-order sequence" },
                        { id: "d", label: "D", text: "A random sequence" },
                    ],
                    correctChoiceId: "a",
                },
            },
        },
        // --- Fill Blank (2) ---
        {
            id: "q_tree_post_fb1",
            type: "fill_blank",
            title: "Inorder Time Complexity",
            text: "The time complexity of inorder traversal for a tree with N nodes is ____",
            question: {
                correctAnswer: "O(n)",
            },
        },
        {
            id: "q_tree_post_fb2",
            type: "fill_blank",
            title: "Inorder Traversal Count",
            text: "For a BST with nodes [10, 5, 15, 3, 7], the first node visited in inorder traversal is ____",
            question: {
                correctAnswer: "3",
            },
        },
        // --- Ordering (2) — playground-style ReactFlow canvas ---
        {
            id: "q_tree_post_ord1",
            type: "ordering",
            title: "Inorder Traversal Order",
            text: "Click the nodes in the correct inorder traversal order:",
            question: {
                items: [
                    { id: "n10", label: "10" },
                    { id: "n5", label: "5" },
                    { id: "n15", label: "15" },
                    { id: "n3", label: "3" },
                    { id: "n7", label: "7" },
                ],
                correctOrder: ["n3", "n5", "n7", "n10", "n15"],
                canvasData: {
                    canvasType: "tree",
                    nodes: treeNodes_ord1,
                    edges: treeEdges_ord1,
                },
            },
        },
        {
            id: "q_tree_post_ord2",
            type: "ordering",
            title: "Inorder Traversal Order 2",
            text: "Click the nodes in the correct inorder traversal order:",
            question: {
                items: [
                    { id: "n20", label: "20" },
                    { id: "n10", label: "10" },
                    { id: "n30", label: "30" },
                    { id: "n5", label: "5" },
                    { id: "n15", label: "15" },
                ],
                correctOrder: ["n5", "n10", "n15", "n20", "n30"],
                canvasData: {
                    canvasType: "tree",
                    nodes: treeNodes_ord2,
                    edges: treeEdges_ord2,
                },
            },
        },
    ],
};

// ─── Breadth-First Search (graph) ─────────────────────────────────────
// Graph: A →5→ B, A →1→ D, B →3→ C, C →1→ E
const graphNodes_ord1: Node[] = [
    { id: "nA", type: "custom", data: { label: "A", variant: "circle" }, position: { x: 30, y: 160 } },
    { id: "nB", type: "custom", data: { label: "B", variant: "circle" }, position: { x: 180, y: 30 } },
    { id: "nC", type: "custom", data: { label: "C", variant: "circle" }, position: { x: 350, y: 30 } },
    { id: "nD", type: "custom", data: { label: "D", variant: "circle" }, position: { x: 180, y: 280 } },
    { id: "nE", type: "custom", data: { label: "E", variant: "circle" }, position: { x: 350, y: 160 } },
];
const graphEdges_ord1: Edge[] = [
    { id: "eg-A-B", source: "nA", target: "nB", type: "floatingEdge", label: "5", data: { weight: 5 }, style: { stroke: "#222121", strokeWidth: 1 }, markerEnd: { type: "arrowclosed" as const, width: 25, height: 25, color: "#222121" } },
    { id: "eg-A-D", source: "nA", target: "nD", type: "floatingEdge", label: "1", data: { weight: 1 }, style: { stroke: "#222121", strokeWidth: 1 }, markerEnd: { type: "arrowclosed" as const, width: 25, height: 25, color: "#222121" } },
    { id: "eg-B-C", source: "nB", target: "nC", type: "floatingEdge", label: "3", data: { weight: 3 }, style: { stroke: "#222121", strokeWidth: 1 }, markerEnd: { type: "arrowclosed" as const, width: 25, height: 25, color: "#222121" } },
    { id: "eg-C-E", source: "nC", target: "nE", type: "floatingEdge", label: "1", data: { weight: 1 }, style: { stroke: "#222121", strokeWidth: 1 }, markerEnd: { type: "arrowclosed" as const, width: 25, height: 25, color: "#222121" } },
];

// Graph 2: X →2→ Y, X →4→ Z, Y →1→ W, Z →3→ W
const graphNodes_ord2: Node[] = [
    { id: "nX", type: "custom", data: { label: "X", variant: "circle" }, position: { x: 30, y: 130 } },
    { id: "nY", type: "custom", data: { label: "Y", variant: "circle" }, position: { x: 200, y: 30 } },
    { id: "nZ", type: "custom", data: { label: "Z", variant: "circle" }, position: { x: 200, y: 240 } },
    { id: "nW", type: "custom", data: { label: "W", variant: "circle" }, position: { x: 370, y: 130 } },
];
const graphEdges_ord2: Edge[] = [
    { id: "eg-X-Y", source: "nX", target: "nY", type: "floatingEdge", label: "2", data: { weight: 2 }, style: { stroke: "#222121", strokeWidth: 1 }, markerEnd: { type: "arrowclosed" as const, width: 25, height: 25, color: "#222121" } },
    { id: "eg-X-Z", source: "nX", target: "nZ", type: "floatingEdge", label: "4", data: { weight: 4 }, style: { stroke: "#222121", strokeWidth: 1 }, markerEnd: { type: "arrowclosed" as const, width: 25, height: 25, color: "#222121" } },
    { id: "eg-Y-W", source: "nY", target: "nW", type: "floatingEdge", label: "1", data: { weight: 1 }, style: { stroke: "#222121", strokeWidth: 1 }, markerEnd: { type: "arrowclosed" as const, width: 25, height: 25, color: "#222121" } },
    { id: "eg-Z-W", source: "nZ", target: "nW", type: "floatingEdge", label: "3", data: { weight: 3 }, style: { stroke: "#222121", strokeWidth: 1 }, markerEnd: { type: "arrowclosed" as const, width: 25, height: 25, color: "#222121" } },
];

export const bfsPosttest: PosttestData = {
    id: "posttest-breadth-first-search",
    algorithm: "breadth-first-search",
    typeQuiz: "posttest",
    title: "Post Test Of Breadth-First Search",
    questions: [
        // --- Multiple Choice (2) ---
        {
            id: "q_bfs_post_mc1",
            type: "multiple_choice",
            title: "BFS Data Structure",
            text: "Which data structure does BFS primarily use?",
            question: {
                multipleChoice: {
                    choices: [
                        { id: "a", label: "A", text: "Queue" },
                        { id: "b", label: "B", text: "Stack" },
                        { id: "c", label: "C", text: "Heap" },
                        { id: "d", label: "D", text: "Linked List" },
                    ],
                    correctChoiceId: "a",
                },
            },
        },
        {
            id: "q_bfs_post_mc2",
            type: "multiple_choice",
            title: "BFS Traversal Property",
            text: "BFS explores nodes in which order?",
            question: {
                multipleChoice: {
                    choices: [
                        { id: "a", label: "A", text: "Level by level (breadth-first)" },
                        { id: "b", label: "B", text: "Deepest node first" },
                        { id: "c", label: "C", text: "Random order" },
                        { id: "d", label: "D", text: "Alphabetical order" },
                    ],
                    correctChoiceId: "a",
                },
            },
        },
        // --- Fill Blank (2) ---
        {
            id: "q_bfs_post_fb1",
            type: "fill_blank",
            title: "BFS Complexity",
            text: "The time complexity of BFS on a graph with V vertices and E edges is ____",
            question: {
                correctAnswer: "O(V+E)",
            },
        },
        {
            id: "q_bfs_post_fb2",
            type: "fill_blank",
            title: "BFS Shortest Path",
            text: "BFS finds the shortest path in terms of number of ____",
            question: {
                correctAnswer: "edges",
            },
        },
        // --- Ordering (2) — playground-style ReactFlow canvas ---
        {
            id: "q_bfs_post_ord1",
            type: "ordering",
            title: "BFS Visit Order",
            text: "Click the nodes in BFS traversal order starting from node A:",
            question: {
                items: [
                    { id: "nA", label: "A" },
                    { id: "nB", label: "B" },
                    { id: "nC", label: "C" },
                    { id: "nD", label: "D" },
                    { id: "nE", label: "E" },
                ],
                correctOrder: ["nA", "nB", "nD", "nC", "nE"],
                canvasData: {
                    canvasType: "graph",
                    nodes: graphNodes_ord1,
                    edges: graphEdges_ord1,
                },
            },
        },
        {
            id: "q_bfs_post_ord2",
            type: "ordering",
            title: "BFS Visit Order 2",
            text: "Click the nodes in BFS traversal order starting from node X:",
            question: {
                items: [
                    { id: "nX", label: "X" },
                    { id: "nY", label: "Y" },
                    { id: "nZ", label: "Z" },
                    { id: "nW", label: "W" },
                ],
                correctOrder: ["nX", "nY", "nZ", "nW"],
                canvasData: {
                    canvasType: "graph",
                    nodes: graphNodes_ord2,
                    edges: graphEdges_ord2,
                },
            },
        },
    ],
};

// ─── Lookup map ───────────────────────────────────────────────────────
export const posttestDataMap: Record<string, PosttestData> = {
    "bubble-sort": bubbleSortPosttest,
    "binary-tree-inorder": binaryTreeInorderPosttest,
    "breadth-first-search": bfsPosttest,
};
