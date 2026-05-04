// config/algorithmVisual.ts
export const algorithmVisualMap = {
  // Linear DS
  array: { pattern: "array" },
  "doubly-linked-list": { pattern: "doubly-linked-list" },
  "singly-linked-list": { pattern: "singly-linked-list" },
  stack: { pattern: "stack" },
  queue: { pattern: "queue" },
  // Tree
  "binary-tree-preorder": { pattern: "tree-pre" },
  "binary-tree-postorder": { pattern: "tree-post" },
  "binary-tree-inorder": { pattern: "tree-in" },
  "binary-search-tree": { pattern: "tree-search" },
  "avl-tree": { pattern: "tree-avl" },
  "min-heap": { pattern: "min-heap" },
  "max-heap": { pattern: "max-heap" },
  // Graph
  "breadth-first-search": { pattern: "graph-bfs" },
  "depth-first-search": { pattern: "graph-dfs" },
  dijkstra: { pattern: "graph-dij" },
  "bellman-ford": { pattern: "graph-bellman" },
  prims: { pattern: "graph-prim" },
  kruskals: { pattern: "graph-kruskal" },
  // Sorting
  "bubble-sort": { pattern: "bubble-sort" },
  "selection-sort": { pattern: "selection-sort" },
  "insertion-sort": { pattern: "insertion-sort" },
  "merge-sort": { pattern: "merge-sort" },
  // Searching
  "linear-search": { pattern: "linear-search" },
  "binary-search": { pattern: "binary-search" },
} as const;
