export type Status = "active" | "locked" | "completed"

export type Item = {
  slug: string
  title: string
  progress: {
    pretest: {
      percent: number
      status: Status
    }
    posttest: {
      percent: number
      status: Status
    }
  }
}

export type AlgorithmSectionData = {
  id: string
  title: string
  items: Item[]
}
export const algorithmCatalog: AlgorithmSectionData[] = [
  {
    id: "linear-ds",
    title: "Linear DS",
    items: [
      {
        slug: "array",
        title: "Array",
        progress: {
          pretest: { percent: 20, status: "active" },
          posttest: { percent: 60, status: "active" },
        },
      },
      {
        slug: "doubly-linked-list",
        title: "Doubly Linked List",
        progress: {
          pretest: { percent: 100, status: "completed" },
          posttest: { percent: 100, status: "completed" },
        },
      },
      {
        slug: "singly-linked-list",
        title: "Singly Linked List",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "stack",
        title: "Stack",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "queue",
        title: "Queue",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
    ],
  },

  {
    id: "tree",
    title: "Tree",
    items: [
      {
        slug: "binary-tree-inorder",
        title: "Binary Tree Traversal (Inorder)",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "binary-tree-preorder",
        title: "Binary Tree Traversal (Preorder)",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "binary-tree-postorder",
        title: "Binary Tree Traversal (Postorder)",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "binary-search-tree",
        title: "Binary Search Tree",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "avl-tree",
        title: "AVL Tree",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "min-heap",
        title: "Min Heap",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "max-heap",
        title: "Max Heap",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
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
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "depth-first-search",
        title: "Depth-First Search",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "dijkstra",
        title: "Dijkstra’s ",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "bellman-ford",
        title: "Bellman-Ford ",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "prims",
        title: "Prim’s ",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "kruskals",
        title: "Kruskal’s ",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
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
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "selection-sort",
        title: "Selection Sort",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "insertion-sort",
        title: "Insertion Sort",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "merge-sort",
        title: "Merge Sort",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "queue-sort",
        title: "Queue Sort",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
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
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
      {
        slug: "binary-search",
        title: "Binary Search",
        progress: {
          pretest: { percent: 0, status: "locked" },
          posttest: { percent: 0, status: "locked" },
        },
      },
    ],
  },
]
