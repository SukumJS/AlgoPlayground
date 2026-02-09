export type Status = "active" | "locked" | "completed"

export type TestProgress = {
  slug: string
  title: string
  shortTitle?: string
  progress: {
    pretest: {
      status: Status
      score?: number
      answeredCount?: number
      totalCount: number
    }
    posttest: {
      status: Status
      score?: number
      answeredCount?: number
      totalCount: number
    }
  }
}

export type AlgorithmSectionData = {
  id: string
  title: string
  items: TestProgress[]
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
          pretest: {
            status: "completed",
            score: 2,
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
        },
      },
      {
        slug: "doubly-linked-list",
        title: "Doubly Linked List",
        progress: {
          pretest: {
            status: "completed",
            score: 5,
            totalCount: 5,
          },
          posttest: {
            status: "completed",
            score: 4,
            totalCount: 5,
          },
        },
      },
      {
        slug: "singly-linked-list",
        title: "Singly Linked List",
        progress: {
          pretest: {
            status: "active",
            answeredCount: 3,
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
        },
      },
      {
        slug: "stack",
        title: "Stack",
        progress: {
          pretest: {
            status: "completed",
            score: 4,
            totalCount: 5,
          },
          posttest: {
            status: "active",
            answeredCount: 3,
            totalCount: 5,
          },
        },
      },
      {
        slug: "queue",
        title: "Queue",
        progress: {
          pretest: {
            status: "locked",
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
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
        shortTitle: "BT Inorder",
        progress: {
          pretest: {
            status: "completed",
            score: 5,
            totalCount: 5,
          },
          posttest: {
            status: "completed",
            score: 5,
            totalCount: 5,
          },
        },
      },
      {
        slug: "binary-tree-preorder",
        title: "Binary Tree Traversal (Preorder)",
        shortTitle: "BT Preorder",
        progress: {
          pretest: {
            status: "completed",
            score: 4,
            totalCount: 5,
          },
          posttest: {
            status: "active",
            answeredCount: 3,
            totalCount: 5,
          },
        },
      },
      {
        slug: "binary-tree-postorder",
        title: "Binary Tree Traversal (Postorder)",
        shortTitle: "BT Postorder",
        progress: {
          pretest: {
            status: "active",
            answeredCount: 2,
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
        },
      },
      {
        slug: "binary-search-tree",
        title: "Binary Search Tree",
        progress: {
          pretest: {
            status: "completed",
            score: 5,
            totalCount: 5,
          },
          posttest: {
            status: "completed",
            score: 4,
            totalCount: 5,
          },
        },
      },
      {
        slug: "avl-tree",
        title: "AVL Tree",
        progress: {
          pretest: {
            status: "active",
            answeredCount: 3,
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
        },
      },
      {
        slug: "min-heap",
        title: "Min Heap",
        progress: {
          pretest: {
            status: "completed",
            score: 4,
            totalCount: 5,
          },
          posttest: {
            status: "active",
            answeredCount: 2,
            totalCount: 5,
          },
        },
      },
      {
        slug: "max-heap",
        title: "Max Heap",
        progress: {
          pretest: {
            status: "locked",
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
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
          pretest: {
            status: "completed",
            score: 5,
            totalCount: 5,
          },
          posttest: {
            status: "completed",
            score: 5,
            totalCount: 5,
          },
        },
      },
      {
        slug: "depth-first-search",
        title: "Depth-First Search",
        progress: {
          pretest: {
            status: "completed",
            score: 4,
            totalCount: 5,
          },
          posttest: {
            status: "active",
            answeredCount: 3,
            totalCount: 5,
          },
        },
      },
      {
        slug: "dijkstra",
        title: "Dijkstra’s",
        progress: {
          pretest: {
            status: "active",
            answeredCount: 3,
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
        },
      },
      {
        slug: "bellman-ford",
        title: "Bellman-Ford",
        progress: {
          pretest: {
            status: "active",
            answeredCount: 2,
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
        },
      },
      {
        slug: "prims",
        title: "Prim’s",
        progress: {
          pretest: {
            status: "completed",
            score: 5,
            totalCount: 5,
          },
          posttest: {
            status: "completed",
            score: 4,
            totalCount: 5,
          },
        },
      },
      {
        slug: "kruskals",
        title: "Kruskal’s",
        progress: {
          pretest: {
            status: "locked",
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
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
          pretest: {
            status: "completed",
            score: 4,
            totalCount: 5,
          },
          posttest: {
            status: "completed",
            score: 5,
            totalCount: 5,
          },
        },
      },
      {
        slug: "selection-sort",
        title: "Selection Sort",
        progress: {
          pretest: {
            status: "active",
            answeredCount: 3,
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
        },
      },
      {
        slug: "insertion-sort",
        title: "Insertion Sort",
        progress: {
          pretest: {
            status: "completed",
            score: 5,
            totalCount: 5,
          },
          posttest: {
            status: "completed",
            score: 4,
            totalCount: 5,
          },
        },
      },
      {
        slug: "merge-sort",
        title: "Merge Sort",
        progress: {
          pretest: {
            status: "active",
            answeredCount: 2,
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
        },
      },
      {
        slug: "queue-sort",
        title: "Queue Sort",
        progress: {
          pretest: {
            status: "locked",
            totalCount: 5,
          },
          posttest: {
            status: "locked",
            totalCount: 5,
          },
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
          pretest: {
            status: "completed",
            score: 4,
            totalCount: 5,
          },
          posttest: {
            status: "active",
            answeredCount: 3,
            totalCount: 5,
          },
        },
      },
      {
        slug: "binary-search",
        title: "Binary Search",
        progress: {
          pretest: {
            status: "completed",
            score: 5,
            totalCount: 5,
          },
          posttest: {
            status: "completed",
            score: 5,
            totalCount: 5,
          },
        },
      },
    ],
  },
]

