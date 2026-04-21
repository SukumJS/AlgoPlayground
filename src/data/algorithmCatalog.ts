export type Status = "active" | "locked" | "completed";

export type TestProgress = {
  slug: string;
  title: string;
  shortTitle?: string;
  progress: {
    pretest: {
      status: Status;
      score?: number;
      answeredCount?: number;
      totalCount: number;
    };
    posttest: {
      status: Status;
      score?: number;
      answeredCount?: number;
      totalCount: number;
    };
  };
};

export type AlgorithmSectionData = {
  id: string;
  title: string;
  items: TestProgress[];
};

// Default progress: all locked (real data fetched from API)
const defaultProgress = (): TestProgress["progress"] => ({
  pretest: { status: "locked", totalCount: 5 },
  posttest: { status: "locked", totalCount: 5 },
});

export const algorithmCatalog: AlgorithmSectionData[] = [
  {
    id: "linear-ds",
    title: "Linear DS",
    items: [
      { slug: "array", title: "Array", progress: defaultProgress() },
      {
        slug: "doubly-linked-list",
        title: "Doubly Linked List",
        progress: defaultProgress(),
      },
      {
        slug: "singly-linked-list",
        title: "Singly Linked List",
        progress: defaultProgress(),
      },
      { slug: "stack", title: "Stack", progress: defaultProgress() },
      { slug: "queue", title: "Queue", progress: defaultProgress() },
    ],
  },

  {
    id: "tree",
    title: "Tree",
    items: [
      {
        slug: "binary-tree-inorder",
        title: "Binary Tree Traversal (Inorder)",
        shortTitle: "BT Inorder",
        progress: defaultProgress(),
      },
      {
        slug: "binary-tree-preorder",
        title: "Binary Tree Traversal (Preorder)",
        shortTitle: "BT Preorder",
        progress: defaultProgress(),
      },
      {
        slug: "binary-tree-postorder",
        title: "Binary Tree Traversal (Postorder)",
        shortTitle: "BT Postorder",
        progress: defaultProgress(),
      },
      {
        slug: "binary-search-tree",
        title: "Binary Search Tree",
        progress: defaultProgress(),
      },
      {
        slug: "avl-tree",
        title: "AVL Tree",
        progress: defaultProgress(),
      },
      {
        slug: "min-heap",
        title: "Min Heap",
        progress: defaultProgress(),
      },
      {
        slug: "max-heap",
        title: "Max Heap",
        progress: defaultProgress(),
      },
    ],
  },

  {
    id: "graph",
    title: "Graph",
    items: [
      {
        slug: "breadth-first-search",
        title: "Breadth-First Search",
        progress: defaultProgress(),
      },
      {
        slug: "depth-first-search",
        title: "Depth-First Search",
        progress: defaultProgress(),
      },
      {
        slug: "dijkstra",
        title: "Dijkstra's",
        progress: defaultProgress(),
      },
      {
        slug: "bellman-ford",
        title: "Bellman-Ford",
        progress: defaultProgress(),
      },
      {
        slug: "prims",
        title: "Prim's",
        progress: defaultProgress(),
      },
      {
        slug: "kruskals",
        title: "Kruskal's",
        progress: defaultProgress(),
      },
    ],
  },

  {
    id: "sorting",
    title: "Sorting",
    items: [
      {
        slug: "bubble-sort",
        title: "Bubble Sort",
        progress: defaultProgress(),
      },
      {
        slug: "selection-sort",
        title: "Selection Sort",
        progress: defaultProgress(),
      },
      {
        slug: "insertion-sort",
        title: "Insertion Sort",
        progress: defaultProgress(),
      },
      {
        slug: "merge-sort",
        title: "Merge Sort",
        progress: defaultProgress(),
      },
      {
        slug: "queue-sort",
        title: "Queue Sort",
        progress: defaultProgress(),
      },
    ],
  },

  {
    id: "searching",
    title: "Searching",
    items: [
      {
        slug: "linear-search",
        title: "Linear Search",
        progress: defaultProgress(),
      },
      {
        slug: "binary-search",
        title: "Binary Search",
        progress: defaultProgress(),
      },
    ],
  },
];
