export type AlgoSection = {
  heading: string;
  content?: string[];
  list?: string[];
  image?: string[]; 
  code?: {
    language?: string;
    value: string;
  };
};

export type ContentReading = {
  id: string;
  type: "structure" | "algorithm";
  title: string;
  sections: AlgoSection[];
};

export const ALGO_CONTENT: ContentReading[] = [
  {
    id: "array",
    type: "structure",
    title: "ARRAY",
    sections: [
      {
        heading: "WHAT IS ARRAY?",
        content: [
          "An array is a collection of items of the same variable type that are stored at contiguous memory locations. It is one of the most popular and simple data structures used in programming.",
        ],
      },
      {
        heading: "BASIC TERMINOLOGIES OF ARRAY",
        list: [
          "Array Element: Elements are items stored in an array.",
          "Array Index: Elements are accessed by their indexes. Indexes in most programming languages start from 0.",
        ],
      },
      {
        heading: "MEMORY REPRESENTATION OF ARRAY",
        content: [
          "In an array, all the elements or their references are stored in contiguous memory locations. This allows for efficient access and manipulation of elements.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250224182515919065/1-.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250224182515574059/2-.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250224182515285430/3-.webp",
        ],
      },
      {
        heading: "DECLARATION OF ARRAY (PYTHON)",
        code: {
          language: "python",
          value: `
# In Python, all types of lists are created the same way
arr = []
          `.trim(),
        },
      },
      {
        heading: "INITIALIZATION OF ARRAY",
        code: {
          language: "python",
          value: `
arr = [1, 2, 3, 4, 5]
arr = ['a', 'b', 'c', 'd', 'e']
arr = [1.4, 2.0, 24.0, 5.0, 0.0]
          `.trim(),
        },
      },
      {
        heading: "WHY DO WE NEED ARRAYS?",
        content: [
          "Using individual variables becomes difficult when handling large data. Arrays allow efficient storage and manipulation of large datasets.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20240405123859/Importance-of-Array.webp",
        ],
      },
      {
        heading: "TYPES OF ARRAYS",
        list: [
          "On the basis of Size",
          "On the basis of Dimensions",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20240731124259/Types-of-Arrays.webp",
        ],
      },
      {
        heading: "FIXED SIZE ARRAY",
        content: [
          "The size of a fixed-size array cannot be altered once declared. Improper sizing may cause memory wastage or shortage.",
        ],
        code: {
          language: "python",
          value: `
arr = [0] * 5
print(arr)
          `.trim(),
        },
      },
      {
        heading: "DYNAMIC SIZE ARRAY",
        content: [
          "The size of a dynamic array can change during execution.",
        ],
        code: {
          language: "python",
          value: `
arr = []
          `.trim(),
        },
      },
      {
        heading: "ONE-DIMENSIONAL ARRAY",
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20240405123929/One-Dimensional-Array(1-D-Array).webp",
        ],
      },
      {
        heading: "TWO-DIMENSIONAL ARRAY",
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20240408165401/Two-Dimensional-Array(2-D-Array-or-Matrix).webp",
        ],
      },
      {
        heading: "THREE-DIMENSIONAL ARRAY",
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20240408165421/Three-Dimensional-Array(3-D-Array).webp",
        ],
      },
    ],
  },
  {
  id: "doubly-linked-list",
  type: "structure",
  title: "DOUBLY LINKED LIST",
  sections: [
    {
      heading: "WHAT IS DOUBLY LINKED LIST?",
      content: [
        "A doubly linked list is a more complex data structure than a singly linked list, but it offers several advantages. The main advantage of a doubly linked list is that it allows for efficient traversal of the list in both directions. This is because each node in the list contains a pointer to the previous node and a pointer to the next node. This allows for quick and easy insertion and deletion of nodes from the list, as well as efficient traversal of the list in both directions.",
      ],
      image: [
        "https://media.geeksforgeeks.org/wp-content/uploads/20250827100441798494/11.webp",
      ],
    },
    {
      heading: "REPRESENTATION OF DOUBLY LINKED LIST",
      content: [
        "In a data structure, a doubly linked list is represented using nodes that have three fields: data, a pointer to the next node, and a pointer to the previous node.",
      ],
      list: [
        "Data",
        "A pointer to the next node (next)",
        "A pointer to the previous node (prev)",
      ],
      image: [
        "https://media.geeksforgeeks.org/wp-content/uploads/20250827100603409157/22.webp",
      ],
    },
    {
      heading: "NODE DEFINITION",
      content: [
        "Each node in a Doubly Linked List contains the data it holds, a pointer to the next node in the list, and a pointer to the previous node in the list. By linking these nodes together through the next and prev pointers, we can traverse the list in both directions (forward and backward), which is a key feature of a Doubly Linked List.",
      ],
      code: {
        language: "python",
        value: `
class Node:
    def __init__(self, data):
        # To store the value or data.
        self.data = data

        # Reference to the previous node
        self.prev = None

        # Reference to the next node
        self.next = None
        `.trim(),
      },
    },
    {
        heading: "CREATING A DOUBLY LINKED LIST",
        content: [
          "To create a doubly linked list with multiple nodes, start by creating the head node and then link each new node by updating both the next and prev pointers. The last node must have its next pointer set to null or None. Keeping track of the head (and optionally the tail) allows easy traversal and insertion.",
        ],
        list: [
          "Create the head node and set its prev and next to null.",
          "Create the next node and link it using head.next and set its prev to head.",
          "Repeat the process for additional nodes.",
          "Ensure the tail node has next == null.",
          "Use head to traverse the list from the front.",
        ],
        code: {
          language: "python",
          value: `
  class Node:
      def __init__(self, value):
          self.data = value
          self.prev = None
          self.next = None

  # Create the first node (head)
  head = Node(10)

  # Create and link the second node
  head.next = Node(20)
  head.next.prev = head

  # Create and link the third node
  head.next.next = Node(30)
  head.next.next.prev = head.next

  # Create and link the fourth node
  head.next.next.next = Node(40)
  head.next.next.next.prev = head.next.next

  # Traverse and print the list
  temp = head
  while temp is not None:
      print(temp.data, end="")
      if temp.next is not None:
          print(" <-> ", end="")
      temp = temp.next
          `.trim(),
        },
      },
      {
        heading: "OUTPUT",
        content: [
          "10 <-> 20 <-> 30 <-> 40",
        ],
      },
    ],
  },
  {
    id: "singly-linked-list",
    type: "structure",
    title: "SINGLY LINKED LIST",
    sections: [
      {
        heading: "WHAT IS SINGLY LINKED LIST?",
        content: [
          "A singly linked list is a linear data structure consisting of nodes where each node contains data and a reference to the next node in the list. The last node points to null, indicating the end of the list.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250901170546665785/link1.webp",
        ],
      },
      {
        heading: "NODE STRUCTURE",
        content: [
          "Each node contains two parts: the data field to store the value and a pointer to the next node, allowing nodes to be linked dynamically.",
        ],
        code: {
          language: "python",
          value: `
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
          `.trim(),
        },
      },
      {
        heading: "OPERATIONS",
        list: [
          "Insertion at beginning",
          "Insertion at end",
          "Deletion of a node",
          "Traversal",
        ],
      },
      {
        heading: "TIME COMPLEXITY",
        list: [
          "Insertion at beginning: O(1)",
          "Insertion at end: O(n)",
          "Deletion: O(n)",
          "Traversal: O(n)",
        ],
      },
      {
        heading: "WHEN TO USE SINGLY LINKED LIST?",
        content: [
          "Singly linked lists are useful when frequent insertions and deletions are required and memory reallocation is expensive, such as in dynamic memory management.",
        ],
      },
    ],
  },
  {
    id: "doubly-linked-list",
    type: "structure",
    title: "DOUBLY LINKED LIST",
    sections: [
      {
        heading: "WHAT IS DOUBLY LINKED LIST?",
        content: [
          "A doubly linked list is an extension of a singly linked list where each node contains pointers to both the previous and next nodes, allowing traversal in both directions and efficient insertion and deletion.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250827100441798494/11.webp",
        ],
      },
      {
        heading: "NODE STRUCTURE",
        content: [
          "Each node consists of three parts: data, a pointer to the previous node, and a pointer to the next node.",
        ],
        code: {
          language: "python",
          value: `
class Node:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None
          `.trim(),
        },
      },
      {
        heading: "ADVANTAGES AND DISADVANTAGES",
        list: [
          "Traversal in both directions",
          "Efficient insertion and deletion",
          "Extra memory required for previous pointer",
        ],
      },
      {
        heading: "TIME COMPLEXITY",
        list: [
          "Insertion: O(1)",
          "Deletion: O(1)",
          "Traversal: O(n)",
        ],
      },
    ],
  },
  {
    id: "stack",
    type: "structure",
    title: "STACK",
    sections: [
      {
        heading: "WHAT IS STACK?",
        content: [
          "A stack is a linear data structure that follows the LIFO (Last In First Out) principle, where the last inserted element is removed first.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250708173723170760/push232.webp",
        ],
      },
      {
        heading: "STACK OPERATIONS",
        list: [
          "Push (Insert element)",
          "Pop (Remove element)",
          "Peek (View top element)",
        ],
      },
      {
        heading: "APPLICATIONS OF STACK",
        list: [
          "Function calls (Call Stack)",
          "Undo / Redo operations",
          "Expression evaluation",
          "Syntax parsing",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250708173836670891/usecases_of_stack232.webp",
        ],
      },
      {
        heading: "TIME COMPLEXITY",
        list: [
          "Push: O(1)",
          "Pop: O(1)",
          "Peek: O(1)",
        ],
      },
    ],
  },

  {
    id: "queue",
    type: "structure",
    title: "QUEUE",
    sections: [
      {
        heading: "WHAT IS QUEUE?",
        content: [
          "A queue is a linear data structure that follows the FIFO (First In First Out) principle, where the first inserted element is removed first.",
        ],
      },
      {
        heading: "QUEUE OPERATIONS",
        list: [
          "Enqueue (Insertion)",
          "Dequeue (Deletion)",
          "Front",
          "Rear",
        ],
        image: [
          "https://deen3evddmddt.cloudfront.net/uploads/content-images/what-is-queue-in-data-structure.webp",
        ],
      },
      {
        heading: "APPLICATIONS OF QUEUE",
        content: [
          "Queues are widely used in CPU scheduling, memory management, network communication, and algorithms such as Breadth First Search (BFS).",
        ],
      },
      {
        heading: "TIME COMPLEXITY",
        list: [
          "Enqueue: O(1)",
          "Dequeue: O(1)",
        ],
      },
    ],
  },
  {
    id: "inorder-traversal",
    type: "algorithm",
    title: "INORDER TRAVERSAL",
    sections: [
      {
        heading: "WHAT IS INORDER TRAVERSAL?",
        content: [
          "Inorder Traversal is a tree traversal technique where for each node, the left subtree is visited first, followed by the node itself, and then the right subtree. The traversal order is Left → Root → Right.",
        ],
      },
      {
        heading: "EXAMPLE 1",
        content: [
          "In this example, the tree is traversed using the inorder method. The left child is visited first, then the root node, and finally the right child, resulting in the output [2, 1, 3].",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001115303253179/20.webp",
        ],
      },
      {
        heading: "EXAMPLE 2",
        content: [
          "For a larger binary tree, the inorder traversal visits nodes in the order Left → Root → Right, producing the sequence 4, 2, 5, 1, 3, 6.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001115407846307/24.webp",
        ],
      },
      {
        heading: "STEP BY STEP TRAVERSAL",
        content: [
          "The traversal starts from the root and recursively processes the left subtree completely before visiting the node itself and then traversing the right subtree.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251003115345632974/inorder_traversal_of_binary_tree_7.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251003115346106117/inorder_traversal_of_binary_tree_8.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251003115346385577/inorder_traversal_of_binary_tree_9.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251003115346608962/inorder_traversal_of_binary_tree_10.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251003115346811756/inorder_traversal_of_binary_tree_11.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251003115347094274/inorder_traversal_of_binary_tree_12.webp",
        ],
      },
      {
        heading: "RECURSIVE APPROACH",
        content: [
          "The recursive approach to inorder traversal works by recursively visiting the left subtree, processing the current node, and then recursively visiting the right subtree.",
        ],
        code: {
          language: "python",
          value: `
  class Node:
      def __init__(self, x):
          self.data = x
          self.left = None
          self.right = None

  def inOrder(node, res):
      if node is None:
          return

      inOrder(node.left, res)
      res.append(node.data)
      inOrder(node.right, res)

  # Example usage
  root = Node(1)
  root.left = Node(2)
  root.right = Node(3)
  root.left.left = Node(4)
  root.left.right = Node(5)
  root.right.right = Node(6)

  result = []
  inOrder(root, result)
  print(result)
          `.trim(),
        },
      },
      {
        heading: "TIME AND SPACE COMPLEXITY",
        list: [
          "Time Complexity: O(n), where n is the number of nodes in the tree.",
          "Auxiliary Space: O(h), where h is the height of the tree.",
          "Worst case: O(n) for a skewed tree.",
          "Best case: O(log n) for a balanced or complete tree.",
        ],
      },
      {
        heading: "KEY PROPERTIES",
        list: [
          "Inorder traversal of a Binary Search Tree (BST) returns elements in sorted order.",
          "It is useful for expression trees where operators are processed between operands.",
          "It preserves the hierarchical structure of the tree during traversal.",
        ],
      },
    ],
  },
  {
    id: "preorder-traversal",
    type: "algorithm",
    title: "PREORDER TRAVERSAL",
    sections: [
      {
        heading: "WHAT IS PREORDER TRAVERSAL?",
        content: [
          "Preorder Traversal is a tree traversal technique where the current node is visited first, followed by traversal of the left subtree, and finally traversal of the right subtree. The traversal order is Root → Left → Right.",
        ],
      },
      {
        heading: "EXAMPLE 1",
        content: [
          "In this example, the preorder traversal starts from the root node and visits the root first, then the left child, and finally the right child, resulting in the output [1, 2, 3].",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001115303253179/20.webp",
        ],
      },
      {
        heading: "EXAMPLE 2",
        content: [
          "For a larger tree, preorder traversal processes nodes in the sequence Root → Left → Right, producing the output 1, 2, 4, 5, 3, 6.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001115407846307/24.webp",
        ],
      },
      {
        heading: "HOW PREORDER TRAVERSAL WORKS",
        content: [
          "The traversal begins at the root node. The root is processed first, then the algorithm recursively traverses the left subtree completely before moving to the right subtree.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001114608100310/preorder_traversal_of_binary_tree_7.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001114608899707/preorder_traversal_of_binary_tree_8.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001114609429721/preorder_traversal_of_binary_tree_9.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001114610016701/preorder_traversal_of_binary_tree_10.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001114610306120/preorder_traversal_of_binary_tree_11.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001114610496243/preorder_traversal_of_binary_tree_12.webp",
        ],
      },
      {
        heading: "RECURSIVE APPROACH",
        content: [
          "The recursive approach visits the current node first, then recursively traverses the left subtree, followed by the right subtree.",
        ],
        code: {
          language: "python",
          value: `
  class Node:
      def __init__(self, data):
          self.data = data
          self.left = None
          self.right = None

  def preOrder(node, res):
      if not node:
          return

      res.append(node.data)
      preOrder(node.left, res)
      preOrder(node.right, res)

  root = Node(1)
  root.left = Node(2)
  root.right = Node(3)
  root.left.left = Node(4)
  root.left.right = Node(5)
  root.right.right = Node(6)

  result = []
  preOrder(root, result)
  print(result)
          `.trim(),
        },
      },
      {
        heading: "TIME AND SPACE COMPLEXITY",
        list: [
          "Time Complexity: O(n), where n is the number of nodes.",
          "Auxiliary Space: O(h), where h is the height of the tree.",
          "Worst case: O(n) for a skewed tree.",
          "Best case: O(log n) for a balanced tree.",
        ],
      },
      {
        heading: "KEY PROPERTIES",
        list: [
          "Used to generate prefix notation in expression trees.",
          "The root node is always processed first.",
        ],
      },
    ],
  },
  {
    id: "postorder-traversal",
    type: "algorithm",
    title: "POSTORDER TRAVERSAL",
    sections: [
      {
        heading: "WHAT IS POSTORDER TRAVERSAL?",
        content: [
          "Postorder Traversal is a tree traversal technique where the left subtree is traversed first, followed by the right subtree, and finally the current node is visited. The traversal order is Left → Right → Root.",
        ],
      },
      {
        heading: "EXAMPLE 1",
        content: [
          "In this example, postorder traversal visits the left node first, then the right node, and finally the root node, resulting in the output [2, 3, 1].",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001115303253179/20.webp",
        ],
      },
      {
        heading: "EXAMPLE 2",
        content: [
          "For a larger binary tree, postorder traversal processes nodes in the order 4, 5, 2, 6, 3, 1.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251001115407846307/24.webp",
        ],
      },
      {
        heading: "HOW POSTORDER TRAVERSAL WORKS",
        content: [
          "The traversal recursively processes the left subtree completely, then the right subtree, and finally visits the current node after both subtrees are finished.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250327114307773933/Postorder-Traversal-of-Binary-Tree-1.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250327114307929871/Postorder-Traversal-of-Binary-Tree-2.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250327114308073304/Postorder-Traversal-of-Binary-Tree-3.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250327114308288763/Postorder-Traversal-of-Binary-Tree-4.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250327114308422032/Postorder-Traversal-of-Binary-Tree-5.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250327114308546515/Postorder-Traversal-of-Binary-Tree-6.webp",
        ],
      },
      {
        heading: "RECURSIVE APPROACH",
        content: [
          "The recursive approach first traverses the left subtree, then the right subtree, and finally processes the current node.",
        ],
        code: {
          language: "python",
          value: `
  class Node:
      def __init__(self, v):
          self.data = v
          self.left = None
          self.right = None

  def postOrder(node, res):
      if node is None:
          return

      postOrder(node.left, res)
      postOrder(node.right, res)
      res.append(node.data)

  root = Node(1)
  root.left = Node(2)
  root.right = Node(3)
  root.left.left = Node(4)
  root.left.right = Node(5)
  root.right.right = Node(6)

  result = []
  postOrder(root, result)
  print(result)
          `.trim(),
        },
      },
      {
        heading: "TIME AND SPACE COMPLEXITY",
        list: [
          "Time Complexity: O(n), where n is the number of nodes.",
          "Auxiliary Space: O(h), where h is the height of the tree.",
          "Worst case: O(n) for a skewed tree.",
          "Best case: O(log n) for a balanced tree.",
        ],
      },
      {
        heading: "KEY PROPERTIES",
        list: [
          "Used for deleting trees because children are processed before the parent.",
          "Useful for generating postfix notation in expression trees.",
        ],
      },
    ],
  },
  {
    id: "avl-tree",
    type: "structure",
    title: "AVL Tree",
    sections: [
      {
        heading: "Binary Search Tree (BST)",
        content: [
          "A Binary Search Tree (BST) is a type of binary tree data structure in which each node contains a unique key and follows a strict ordering rule. All values in the left subtree of a node must be strictly less than the node’s value, while all values in the right subtree must be strictly greater. This property allows efficient searching, insertion, and deletion operations, especially when the tree remains balanced.",
          "BSTs are widely used in database indexing, symbol tables, range queries, and many problem-solving scenarios where maintaining a sorted stream of data is required. However, if the tree becomes skewed, performance can degrade significantly."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250904151404492797/bst1.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250904151404252799/bst2.webp"
        ],
        list: [
          "Left subtree contains values smaller than the node",
          "Right subtree contains values larger than the node",
          "In-order traversal of a BST produces sorted output",
          "Average time complexity is O(log n) when balanced",
          "Worst-case time complexity is O(n) when unbalanced"
        ]
      },

      {
        heading: "AVL Tree Overview",
        content: [
          "An AVL Tree is a self-balancing Binary Search Tree where the height difference between the left and right subtrees of any node is at most one. This difference is known as the Balance Factor, calculated as the height of the left subtree minus the height of the right subtree.",
          "By maintaining strict balance conditions, AVL Trees guarantee O(log n) time complexity for search, insertion, and deletion operations, making them suitable for applications where predictable performance is critical."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250703161306662411/Example-of-an-AVL-Tree-11.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250703161407500927/Example-of-an-AVL-Tree-22.webp"
        ],
        list: [
          "Balance Factor = height(left subtree) - height(right subtree)",
          "Valid balance factor range is -1 to +1",
          "AVL Tree is always a Binary Search Tree",
          "Provides guaranteed O(log n) performance"
        ]
      },

      {
        heading: "Rotations in AVL Tree",
        content: [
          "To maintain balance after insertions and deletions, AVL Trees use rotations. These rotations are local restructuring operations that preserve the BST property while restoring balance in constant time. There are four fundamental rotation cases used in AVL Trees."
        ],
        list: [
          "Left-Left (LL): Single right rotation",
          "Right-Right (RR): Single left rotation",
          "Left-Right (LR): Left rotation followed by right rotation",
          "Right-Left (RL): Right rotation followed by left rotation"
        ]
      },

      {
        heading: "AVL Tree Use Cases",
        content: [
          "AVL Trees are particularly useful in environments where fast lookups are more important than frequent insertions or deletions. Because of their strict balancing rules, AVL Trees tend to have smaller height compared to other self-balancing trees, leading to faster search operations."
        ],
        list: [
          "Database indexing systems",
          "Real-time systems requiring predictable performance",
          "Applications with frequent searches and rare updates",
          "Educational purposes for learning self-balancing trees"
        ]
      },

      {
        heading: "Advantages and Disadvantages of AVL Tree",
        content: [
          "AVL Trees offer strong performance guarantees but come with increased implementation complexity. Their strict balancing ensures fast searches, but insertions and deletions may require multiple rotations, leading to higher overhead compared to other balanced trees like Red-Black Trees."
        ],
        list: [
          "Advantages: Guaranteed O(log n) operations, sorted traversal, smaller tree height",
          "Disadvantages: More complex implementation, higher rotation cost, less common in standard libraries"
        ]
      }
    ],
  },
  {
    id: "min-heap",
    type: "structure",
    title: "Min-Heap Data Structure",
    sections: [
      {
        heading: "Min-Heap Overview",
        content: [
          "A Min-Heap is a specialized tree-based data structure that satisfies two main properties. First, it must be a Complete Binary Tree, meaning all levels are fully filled except possibly the last, which is filled from left to right. Second, the value of each node must be less than or equal to the values of its children. As a result, the smallest element in a Min-Heap is always located at the root node.",
          "Because of these properties, Min-Heaps are widely used in priority-based systems where quick access to the minimum element is required."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20241105101737867907/min-heap-1.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20241105101737995053/min-heap-2.webp"
        ],
        list: [
          "It is a Complete Binary Tree",
          "The root node always contains the minimum value",
          "Heap property must hold for all subtrees"
        ]
      },

      {
        heading: "Internal Representation of Min-Heap",
        content: [
          "A Min-Heap can be efficiently implemented using an array instead of a pointer-based tree structure. This representation takes advantage of the complete binary tree property and allows constant-time access to parent and child nodes using index calculations."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251009110428295907/minH2drawio.png"
        ],
        list: [
          "Left child index = 2*i + 1",
          "Right child index = 2*i + 2",
          "Parent index = floor((i - 1) / 2)"
        ]
      },

      {
        heading: "Insertion Operation in Min-Heap",
        content: [
          "Insertion in a Min-Heap starts by placing the new element at the end of the heap, maintaining the complete binary tree property. The element is then repeatedly compared with its parent, and swapped if it violates the Min-Heap property. This process, known as heapify-up, continues until the heap property is restored or the element reaches the root."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20230323191741/insertion-in-Minimum-heap.webp"
        ],
        list: [
          "Insert element at the end of the heap",
          "Compare with parent and swap if smaller",
          "Repeat until heap property is restored",
          "Time Complexity: O(log n)"
        ],
        code: {
          language: "python",
          value: `def insert(heap, value):
      heap.append(value)
      index = len(heap) - 1
      while index > 0 and heap[(index - 1) // 2] > heap[index]:
          heap[index], heap[(index - 1) // 2] = heap[(index - 1) // 2], heap[index]
          index = (index - 1) // 2`
        }
      },

      {
        heading: "Deletion Operation in Min-Heap",
        content: [
          "Deleting the minimum element in a Min-Heap involves removing the root node. The last element in the heap is moved to the root position, and the heap size is reduced by one. The heap property is then restored by repeatedly pushing the element down the tree using the heapify-down process."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250213150757930038/n1.png",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250213150758245127/n4.png",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250213150758568084/n5.png"
        ],
        list: [
          "Replace root with last element",
          "Remove last element",
          "Heapify-down from root",
          "Time Complexity: O(log n)"
        ],
        code: {
          language: "python",
          value: `def deleteMin(heap, value):
      index = -1
      for i in range(len(heap)):
          if heap[i] == value:
              index = i
              break
      if index == -1:
          return

      heap[index] = heap[-1]
      heap.pop()

      while True:
          left = 2 * index + 1
          right = 2 * index + 2
          smallest = index

          if left < len(heap) and heap[left] < heap[smallest]:
              smallest = left
          if right < len(heap) and heap[right] < heap[smallest]:
              smallest = right

          if smallest != index:
              heap[index], heap[smallest] = heap[smallest], heap[index]
              index = smallest
          else:
              break`
        }
      },

      {
        heading: "Peek and Heapify Operations",
        content: [
          "The peek operation returns the minimum element of the Min-Heap, which is always located at the root, making it a constant-time operation. Heapify is a fundamental operation used to restore the heap property and can also be used to build a Min-Heap from an unsorted array in linear time."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20230314114931/n8.png",
          "https://media.geeksforgeeks.org/wp-content/uploads/20230323191740/Heapify-Operation-in-min-heap.webp"
        ],
        list: [
          "Peek operation runs in O(1) time",
          "Heapify builds a heap in O(n) time",
          "Used internally in insertion and deletion"
        ]
      },

      {
        heading: "Applications, Advantages, and Comparison",
        content: [
          "Min-Heaps are fundamental in many real-world and algorithmic applications due to their efficiency and simplicity. They are widely used in graph algorithms, data compression, scheduling systems, and sorting algorithms."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251017120002612348/420046868.webp"
        ],
        list: [
          "Used in Priority Queues and Heap Sort",
          "Core data structure in Dijkstra’s Algorithm",
          "Supports fast insertion and deletion",
          "Provides O(1) access to minimum element",
          "More space-efficient using array implementation"
        ]
      }
    ]
  },
  {
    id: "max-heap",
    type: "structure",
    title: "Max-Heap Data Structure",
    sections: [
      {
        heading: "Max-Heap Overview",
        content: [
          "A Max-Heap is a tree-based data structure that satisfies two key properties. First, it must be a Complete Binary Tree, meaning all levels are fully filled except possibly the last, which is filled from left to right. Second, the value stored in each node must be greater than or equal to the values stored in its children. As a result, the largest element in a Max-Heap is always located at the root node.",
          "Due to these properties, Max-Heaps are widely used in scenarios where quick access to the maximum element is required, such as priority-based scheduling systems."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251009123507375063/max-heap-1.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251009123507691262/max-heap-2.webp"
        ],
        list: [
          "It is a Complete Binary Tree",
          "The root node always contains the maximum value",
          "Heap property must hold for all subtrees"
        ]
      },

      {
        heading: "Internal Representation of Max-Heap",
        content: [
          "A Max-Heap can be efficiently implemented using an array instead of explicit tree nodes. This approach takes advantage of the complete binary tree property and allows parent-child relationships to be determined using index calculations."
        ],
        list: [
          "Left child index = 2*i + 1",
          "Right child index = 2*i + 2",
          "Parent index = floor((i - 1) / 2)"
        ]
      },

      {
        heading: "Insertion Operation in Max-Heap",
        content: [
          "Insertion in a Max-Heap begins by adding the new element at the end of the heap to maintain the complete binary tree structure. The element is then compared with its parent, and if it is larger, the two are swapped. This process, known as heapify-up, continues until the heap property is restored or the element reaches the root."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20230901130152/Insertion-In-Max-Heap.png"
        ],
        list: [
          "Insert element at the end of the heap",
          "Compare with parent and swap if larger",
          "Repeat until heap property is restored",
          "Time Complexity: O(log n)"
        ],
        code: {
          language: "python",
          value: `def insert(heap, value):
      heap.append(value)
      index = len(heap) - 1
      while index > 0 and heap[(index - 1) // 2] < heap[index]:
          heap[index], heap[(index - 1) // 2] = heap[(index - 1) // 2], heap[index]
          index = (index - 1) // 2`
        }
      },

      {
        heading: "Deletion Operation in Max-Heap",
        content: [
          "Deleting the maximum element in a Max-Heap involves removing the root node. The last element in the heap is moved to the root position, and the heap size is reduced. The heap property is then restored using the heapify-down process, where the element is repeatedly swapped with the larger of its children until the property is satisfied."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20230901130454/Max-Heap-Data-Structure.png",
          "https://media.geeksforgeeks.org/wp-content/uploads/20230901130624/Max-Heap-Data-Structure-step-1.png",
          "https://media.geeksforgeeks.org/wp-content/uploads/20230901130816/Max-Heap-Data-Structure-step-2.png"
        ],
        list: [
          "Replace root with last element",
          "Remove last element",
          "Heapify-down from root",
          "Time Complexity: O(log n)"
        ],
        code: {
          language: "python",
          value: `def deleteMax(heap, value):
      index = -1
      for i in range(len(heap)):
          if heap[i] == value:
              index = i
              break
      if index == -1:
          return

      heap[index] = heap[-1]
      heap.pop()

      while True:
          left = 2 * index + 1
          right = 2 * index + 2
          largest = index

          if left < len(heap) and heap[left] > heap[largest]:
              largest = left
          if right < len(heap) and heap[right] > heap[largest]:
              largest = right

          if largest != index:
              heap[index], heap[largest] = heap[largest], heap[index]
              index = largest
          else:
              break`
        }
      },

      {
        heading: "Peek and Heapify Operations",
        content: [
          "The peek operation in a Max-Heap returns the maximum element, which is always located at the root, making it a constant-time operation. Heapify is a fundamental operation used to restore the heap property and can also be used to build a Max-Heap from an unsorted array efficiently."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20231108125528/peak-element-of-max-heap.png",
          "https://media.geeksforgeeks.org/wp-content/uploads/20231108125652/heapify-operations-in-max-heap.png"
        ],
        list: [
          "Peek operation runs in O(1) time",
          "Heapify builds a heap in O(n) time",
          "Used internally in insertion and deletion"
        ]
      },

      {
        heading: "Applications and Advantages of Max-Heap",
        content: [
          "Max-Heaps are widely used in many practical and algorithmic applications due to their efficiency and ability to prioritize large values. They play a critical role in scheduling, graph algorithms, and sorting techniques."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251017120002612348/420046868.webp"
        ],
        list: [
          "Used in Priority Queues and Job Scheduling",
          "Core structure in Heap Sort algorithm",
          "Efficient for selecting the largest element repeatedly",
          "Provides O(1) access to maximum element",
          "Space-efficient array-based implementation"
        ]
      }
    ]
  },
  {
    id: "breadth-first-search",
    type: "algorithm",
    title: "Breadth First Search (BFS)",
    sections: [
      {
        heading: "Breadth First Search Overview",
        content: [
          "Breadth First Search (BFS) is a fundamental graph traversal algorithm that starts from a given source node and explores the graph level by level. It first visits all vertices directly connected to the source, then proceeds to visit vertices at the next level of distance. This process continues until all reachable vertices from the source have been visited.",
          "Unlike Depth First Search (DFS), BFS always explores the closest vertices first, making it particularly suitable for problems that require shortest-path solutions in unweighted graphs. BFS is also the foundation of several well-known graph algorithms such as Dijkstra’s shortest path algorithm (for unweighted graphs), Kahn’s Algorithm for topological sorting, and Prim’s algorithm for minimum spanning trees."
        ],
        list: [
          "Traverses the graph level by level",
          "Visits closest vertices before farther ones",
          "Uses a queue data structure internally",
          "Guarantees shortest path in unweighted graphs"
        ]
      },

      {
        heading: "Key Properties and Capabilities of BFS",
        content: [
          "Breadth First Search can be applied to both directed and undirected graphs. By maintaining a visited array, BFS ensures that each vertex is processed only once, even in the presence of cycles. This makes BFS efficient and prevents infinite loops when traversing cyclic graphs.",
          "In addition to traversal, BFS can be used to detect cycles, identify connected components, and determine the shortest path between nodes in an unweighted graph."
        ],
        list: [
          "Detects cycles in directed and undirected graphs",
          "Finds shortest paths in unweighted graphs",
          "Identifies connected components",
          "Used as a base for many advanced graph algorithms"
        ]
      },

      {
        heading: "BFS Traversal Example",
        content: [
          "Consider a graph represented using an adjacency list. Starting from a source node, BFS visits nodes in increasing order of their distance from the source. All neighbors of the current node are explored before moving deeper into the graph.",
          "For example, given an adjacency list [[1, 2], [0, 2], [0, 1, 3, 4], [2], [2]] and starting from node 0, BFS will visit nodes in the order 0, 1, 2, 3, and 4."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251014173018632936/frame_3148.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251014110602842995/420046859.webp"
        ]
      },

      {
        heading: "BFS from a Given Source (Single Connected Component)",
        content: [
          "In a connected graph, BFS can be performed by starting from a single source vertex. The algorithm initializes a queue, marks the source as visited, and then repeatedly dequeues a vertex, processes it, and enqueues all of its unvisited neighbors. This continues until the queue becomes empty."
        ],
        code: {
          language: "python",
          value: `from collections import deque

  def bfs(adj):
      V = len(adj)
      visited = [False] * V
      res = []

      src = 0
      q = deque()
      visited[src] = True
      q.append(src)

      while q:
          curr = q.popleft()
          res.append(curr)

          for x in adj[curr]:
              if not visited[x]:
                  visited[x] = True
                  q.append(x)

      return res`
        },
        list: [
          "Uses a queue to control traversal order",
          "Each vertex is visited exactly once",
          "Maintains a visited array to avoid revisits"
        ]
      },

      {
        heading: "BFS in a Disconnected Undirected Graph",
        content: [
          "In a disconnected graph, not all vertices are reachable from a single source. To ensure that BFS covers the entire graph, the algorithm iterates through all vertices and initiates a BFS traversal from any vertex that has not yet been visited. This guarantees that every connected component in the graph is explored."
        ],
        code: {
          language: "python",
          value: `from collections import deque

  def bfsConnected(adj, src, visited, res):
      q = deque()
      visited[src] = True
      q.append(src)

      while q:
          curr = q.popleft()
          res.append(curr)

          for x in adj[curr]:
              if not visited[x]:
                  visited[x] = True
                  q.append(x)

  def bfs(adj):
      V = len(adj)
      visited = [False] * V
      res = []

      for i in range(V):
          if not visited[i]:
              bfsConnected(adj, i, visited, res)

      return res`
        }
      },

      {
        heading: "Time and Space Complexity of BFS",
        content: [
          "The time complexity of Breadth First Search is O(V + E), where V represents the number of vertices and E represents the number of edges in the graph. This is because each vertex and each edge is visited at most once during the traversal.",
          "The auxiliary space complexity of BFS is O(V), as it requires additional memory to store the visited array and the queue used during traversal."
        ],
        list: [
          "Time Complexity: O(V + E)",
          "Auxiliary Space: O(V)",
          "Efficient for large sparse graphs"
        ]
      },

      {
        heading: "Applications of Breadth First Search",
        content: [
          "Breadth First Search plays a crucial role in many real-world and theoretical applications. Its ability to explore graphs level by level makes it especially useful in networking, pathfinding, and graph analysis problems."
        ],
        list: [
          "Shortest path finding in unweighted graphs",
          "Cycle detection",
          "Finding connected components",
          "Network routing and broadcasting",
          "Social network analysis"
        ]
      }
    ]
  },
  {
    id: "depth-first-search",
    type: "algorithm",
    title: "Depth First Search (DFS)",
    sections: [
      {
        heading: "Depth First Search Overview",
        content: [
          "Depth First Search (DFS) is a graph traversal algorithm that starts from a source vertex and explores a path as deeply as possible before backtracking to explore other paths. Unlike Breadth First Search (BFS), DFS prioritizes depth over breadth, meaning it follows one branch of the graph until it can no longer proceed, then backtracks to explore alternative branches.",
          "In graphs that contain cycles, DFS uses a visited array to ensure that each vertex is processed only once. The traversal order of DFS can vary depending on the order in which adjacent vertices are chosen, meaning a single graph can have multiple valid DFS traversal results."
        ],
        list: [
          "Explores one path completely before backtracking",
          "Uses recursion or an explicit stack",
          "Traversal order depends on adjacency order",
          "Requires a visited array to avoid infinite loops"
        ]
      },

      {
        heading: "Key Characteristics of DFS",
        content: [
          "Depth First Search is particularly useful when the goal is to explore all possible paths in a graph or to analyze the structure of connected components. Because DFS dives deep into the graph, it is commonly used in problems related to connectivity, cycle detection, and topological sorting.",
          "DFS can be implemented using recursion, which naturally leverages the call stack, or iteratively using an explicit stack data structure."
        ],
        list: [
          "Suitable for path exploration problems",
          "Used in cycle detection and connectivity checks",
          "Forms the basis of topological sorting",
          "Works on both directed and undirected graphs"
        ]
      },

      {
        heading: "DFS Traversal Example",
        content: [
          "Consider a graph represented by an adjacency list. Starting from vertex 0, DFS first visits the source, then recursively explores the first unvisited adjacent vertex, continuing this process until it reaches a vertex with no unvisited neighbors. At that point, the algorithm backtracks and explores other available paths.",
          "For the adjacency list [[1, 2], [0, 2], [0, 1, 3, 4], [2], [2]], one possible DFS traversal starting from node 0 is 0, 1, 2, 3, and 4. Different traversal orders may occur depending on the chosen adjacency order."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20251014173018632936/frame_3148.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20251014110602842995/420046859.webp"
        ]
      },

      {
        heading: "DFS from a Given Source (Recursive Approach)",
        content: [
          "When performing DFS from a given source vertex, the algorithm marks the current vertex as visited, records it in the result list, and then recursively explores each unvisited adjacent vertex. This continues until all vertices reachable from the source have been visited.",
          "Because graphs may contain cycles, a visited array is required to prevent the algorithm from revisiting the same vertex multiple times."
        ],
        code: {
          language: "python",
          value: `def dfsRec(adj, visited, s, res):
      visited[s] = True
      res.append(s)

      # Recursively visit all adjacent vertices
      # that are not visited yet
      for i in adj[s]:
          if not visited[i]:
              dfsRec(adj, visited, i, res)

  def dfs(adj):
      visited = [False] * len(adj)
      res = []
      dfsRec(adj, visited, 0, res)
      return res`
        },
        list: [
          "Marks vertex as visited before exploring neighbors",
          "Uses recursion to naturally backtrack",
          "Explores depth-first until no options remain"
        ]
      },

      {
        heading: "DFS in a Disconnected Graph",
        content: [
          "In a disconnected graph, not all vertices can be reached from a single source. To ensure that DFS visits every vertex in the graph, the algorithm iterates over all vertices and starts a new DFS traversal whenever it encounters an unvisited vertex.",
          "This approach guarantees that all connected components of the graph are explored, even when the graph consists of multiple disconnected subgraphs."
        ],
        code: {
          language: "python",
          value: `def dfsRec(adj, visited, s, res):
      visited[s] = True
      res.append(s)

      for i in adj[s]:
          if not visited[i]:
              dfsRec(adj, visited, i, res)

  def dfs(adj):
      visited = [False] * len(adj)
      res = []

      # Loop through all vertices to handle
      # disconnected graph
      for i in range(len(adj)):
          if not visited[i]:
              dfsRec(adj, visited, i, res)

      return res`
        }
      },

      {
        heading: "Time and Space Complexity of DFS",
        content: [
          "The time complexity of Depth First Search is O(V + E), where V is the number of vertices and E is the number of edges in the graph. Each vertex is visited once, and each edge is explored at most once in directed graphs or twice in undirected graphs.",
          "The auxiliary space complexity of DFS is O(V + E). This includes the visited array of size V and the recursive call stack, which in the worst case can grow proportional to the number of vertices in the graph."
        ],
        list: [
          "Time Complexity: O(V + E)",
          "Auxiliary Space: O(V + E)",
          "Worst-case recursion depth equals number of vertices"
        ]
      },

      {
        heading: "Applications of Depth First Search",
        content: [
          "Depth First Search is widely used in graph-related problems where exploring all possible paths or analyzing graph structure is required. Its depth-oriented nature makes it especially useful for problems involving recursion and hierarchical structures."
        ],
        list: [
          "Cycle detection in graphs",
          "Finding connected components",
          "Topological sorting",
          "Path existence problems",
          "Maze and puzzle solving"
        ]
      }
    ]
  },
  {
    id: "dijkstra-algorithm",
    type: "algorithm",
    title: "Dijkstra’s Algorithm",
    sections: [
      {
        heading: "Dijkstra’s Algorithm Overview",
        content: [
          "Dijkstra’s Algorithm is a graph algorithm used to find the shortest path from a given source vertex to all other vertices in a weighted graph. The graph must not contain any negative edge weights, as the algorithm relies on the assumption that once the shortest distance to a vertex is determined, it will never be updated again.",
          "The algorithm works by maintaining a distance array that stores the currently known shortest distance from the source to each vertex. At each step, the vertex with the smallest tentative distance is selected and its adjacent vertices are relaxed to check whether a shorter path exists through it."
        ],
        list: [
          "Works on weighted graphs",
          "Does not support negative edge weights",
          "Finds shortest path from a single source",
          "Uses greedy strategy"
        ]
      },

      {
        heading: "Key Idea Behind Dijkstra’s Algorithm",
        content: [
          "The core idea of Dijkstra’s Algorithm is to grow a shortest-path tree from the source vertex. At every step, the algorithm selects the vertex that has the minimum distance from the source among all vertices that have not yet been finalized.",
          "Once a vertex is selected, its shortest distance is considered final. The algorithm then updates the distances of its adjacent vertices if a shorter path is found through this vertex. This process continues until all vertices are processed."
        ],
        list: [
          "Maintains a shortest-path tree",
          "Uses distance relaxation",
          "Finalizes vertices one by one",
          "Greedy choice ensures correctness"
        ]
      },

      {
        heading: "Example of Dijkstra’s Algorithm",
        content: [
          "Consider a weighted undirected graph with source vertex 0. The adjacency list representation is given as [[[1,4],[2,8]], [[0,4],[4,6],[2,3]], [[0,8],[3,2],[1,3]], [[2,2],[4,10]], [[1,6],[3,10]]].",
          "Starting from node 0, the algorithm computes the shortest distances to all other vertices. The resulting distance array is [0, 4, 7, 9, 10], representing the shortest path cost from the source to each vertex."
        ]
      },

      {
        heading: "Why Priority Queue is Used",
        content: [
          "A priority queue is used in Dijkstra’s Algorithm to efficiently select the vertex with the smallest current distance. This ensures that the next vertex processed always has the shortest known path from the source.",
          "If a vertex appears again in the priority queue with a larger distance than the currently recorded one, it is skipped. This avoids unnecessary processing and keeps the algorithm efficient."
        ],
        list: [
          "Always selects minimum distance vertex",
          "Avoids scanning all vertices repeatedly",
          "Improves efficiency over array-based approach",
          "Ensures greedy correctness"
        ]
      },

      {
        heading: "Detailed Steps of the Algorithm",
        content: [
          "First, create a distance array dist[] of size V and initialize all values to infinity, except for the source vertex which is set to 0. Insert the source vertex into a priority queue.",
          "While the priority queue is not empty, extract the vertex with the smallest distance. If the extracted distance is greater than the recorded distance, skip it.",
          "For each adjacent vertex, calculate the distance through the current vertex. If this new distance is smaller than the previously known distance, update it and push the updated value into the priority queue.",
          "Continue until the priority queue becomes empty. At the end, the distance array contains the shortest distances from the source to all vertices."
        ]
      },

      {
        heading: "Implementation of Dijkstra’s Algorithm",
        code: {
          language: "python",
          value: `import heapq
  import sys

  def dijkstra(adj, src):
      V = len(adj)

      # Distance array initialized to infinity
      dist = [sys.maxsize] * V
      dist[src] = 0

      # Min-heap priority queue (distance, vertex)
      pq = []
      heapq.heappush(pq, (0, src))

      while pq:
          d, u = heapq.heappop(pq)

          # Skip if this is not the shortest distance
          if d > dist[u]:
              continue

          # Relax all adjacent vertices
          for v, w in adj[u]:
              if dist[u] + w < dist[v]:
                  dist[v] = dist[u] + w
                  heapq.heappush(pq, (dist[v], v))

      return dist`
        }
      },

      {
        heading: "Time and Space Complexity",
        content: [
          "The time complexity of Dijkstra’s Algorithm using a priority queue is O((V + E) log V), where V is the number of vertices and E is the number of edges. Each vertex and edge is processed efficiently through heap operations.",
          "The auxiliary space complexity is O(V + E), which includes the distance array, priority queue, and adjacency list representation of the graph."
        ],
        list: [
          "Time Complexity: O((V + E) log V)",
          "Auxiliary Space: O(V + E)"
        ]
      },

      {
        heading: "Why Dijkstra’s Algorithm Does Not Work with Negative Weights",
        content: [
          "Dijkstra’s Algorithm assumes that once a vertex is extracted from the priority queue, its shortest distance is finalized. This assumption holds true only when all edge weights are non-negative.",
          "If a negative weight edge exists, a vertex that has already been finalized might later receive a shorter path through another vertex. This violates the core assumption of the algorithm and leads to incorrect results."
        ],
        list: [
          "Relies on greedy finalization",
          "Negative edges can reduce finalized distances",
          "Incorrect shortest paths may be produced",
          "Use Bellman-Ford instead for negative weights"
        ]
      },

      {
        heading: "Applications of Dijkstra’s Algorithm",
        content: [
          "Dijkstra’s Algorithm is widely used in real-world systems where shortest paths are required in weighted graphs. Its efficiency and correctness make it a fundamental algorithm in computer science."
        ],
        list: [
          "GPS and map navigation systems",
          "Network routing protocols",
          "Shortest path in weighted graphs",
          "Traffic and logistics optimization"
        ]
      }
    ]
  },
  {
    id: "bellman-ford-algorithm",
    type: "algorithm",
    title: "Bellman–Ford Algorithm",
    sections: [
      {
        heading: "Bellman–Ford Algorithm Overview",
        content: [
          "Bellman–Ford Algorithm is a single-source shortest path algorithm used to find the shortest distances from a source vertex to all other vertices in a weighted graph. Unlike Dijkstra’s Algorithm, Bellman–Ford can handle graphs with negative edge weights and can also detect negative weight cycles.",
          "If a vertex is unreachable from the source, its distance remains infinite (commonly represented as 1e8 or 10^8). If a negative weight cycle exists in the graph, the algorithm reports that no valid shortest path solution exists."
        ],
        list: [
          "Works with negative edge weights",
          "Detects negative weight cycles",
          "Single-source shortest path algorithm",
          "Slower than Dijkstra but more flexible"
        ]
      },

      {
        heading: "Negative Weight Cycle",
        content: [
          "A negative weight cycle is a cycle in a graph whose total sum of edge weights is negative. If such a cycle exists, the shortest path is undefined because repeatedly traversing the cycle keeps reducing the total path cost.",
          "Bellman–Ford explicitly checks for negative weight cycles by attempting one extra relaxation after all shortest paths should have been finalized."
        ]
      },

      {
        heading: "Limitation of Dijkstra’s Algorithm",
        content: [
          "Dijkstra’s Algorithm fails in graphs containing negative edge weights because it assumes that once a vertex is marked as visited, its shortest distance is final.",
          "If a shorter path exists through a vertex that is processed later using a negative edge, Dijkstra’s Algorithm cannot correct the distance, leading to incorrect results."
        ],
        list: [
          "Does not support negative edges",
          "Greedy finalization fails with negatives",
          "Bellman–Ford is preferred in such cases"
        ]
      },

      {
        heading: "Principle of Relaxation of Edges",
        content: [
          "Relaxation is the process of updating the shortest distance to a vertex if a shorter path is found through another vertex. For an edge (u, v) with weight w, relaxation checks whether dist[v] > dist[u] + w.",
          "If a shorter path is found, the distance to vertex v is updated. Bellman–Ford applies this relaxation process repeatedly to ensure all shortest paths are discovered."
        ]
      },

      {
        heading: "Why Relaxing Edges (V - 1) Times Works",
        content: [
          "The shortest path between two vertices in a graph can have at most (V - 1) edges. Any path with more edges would form a cycle.",
          "By relaxing all edges (V - 1) times, Bellman–Ford guarantees that the shortest path to every vertex is found, assuming no negative cycles exist."
        ]
      },

      {
        heading: "Detection of a Negative Weight Cycle",
        content: [
          "After performing (V - 1) relaxations, Bellman–Ford performs one additional relaxation. If any distance can still be updated during this step, it means a negative weight cycle exists.",
          "This extra relaxation step is the key feature that allows Bellman–Ford to detect negative cycles."
        ],
        list: [
          "Extra relaxation step",
          "Any update indicates negative cycle",
          "Returns -1 when detected"
        ]
      },

      {
        heading: "Example",
        content: [
          "For V = 5 and edges [[0,1,5],[1,2,1],[1,3,2],[2,4,1],[4,3,-1]] with source 0, the shortest distances are [0,5,6,6,7].",
          "In another example containing a negative cycle, such as edges [[0,1,4],[1,2,-6],[2,3,5],[3,1,-2]], the algorithm detects the negative cycle and returns [-1]."
        ]
      },

      {
        heading: "Implementation of Bellman–Ford Algorithm",
        code: {
          language: "python",
          value: `def bellmanFord(V, edges, src):
      INF = 100000000
      dist = [INF] * V
      dist[src] = 0

      # Relax all edges V times
      for i in range(V):
          for u, v, wt in edges:
              if dist[u] != INF and dist[u] + wt < dist[v]:
                  # If update happens in V-th iteration, negative cycle exists
                  if i == V - 1:
                      return [-1]
                  dist[v] = dist[u] + wt

      return dist


  if __name__ == "__main__":
      V = 5
      edges = [[1, 3, 2], [4, 3, -1], [2, 4, 1], [1, 2, 1], [0, 1, 5]]
      src = 0
      print(bellmanFord(V, edges, src))`
        }
      },

      {
        heading: "Time and Space Complexity",
        content: [
          "Bellman–Ford has a time complexity of O(V × E) because it relaxes all edges for each vertex. This makes it slower than Dijkstra’s Algorithm.",
          "The auxiliary space complexity is O(V), as it only requires a distance array."
        ],
        list: [
          "Time Complexity: O(V × E)",
          "Auxiliary Space: O(V)"
        ]
      },

      {
        heading: "Applications of Bellman–Ford Algorithm",
        content: [
          "Bellman–Ford is useful in scenarios where graphs contain negative edge weights or where detecting negative cycles is necessary."
        ],
        list: [
          "Graphs with negative weights",
          "Financial arbitrage detection",
          "Routing protocols (e.g., RIP)",
          "Cycle detection in weighted graphs"
        ]
      }
    ]
  },
  {
    id: "prims-mst",
    type: "algorithm",
    title: "PRIM’S ALGORITHM",
    sections: [
      {
        heading: "WHAT IS PRIM’S ALGORITHM?",
        content: [
          "Prim’s Algorithm is a Greedy Algorithm used to find the Minimum Spanning Tree (MST) of a weighted, connected, and undirected graph.",
          "Unlike Kruskal’s Algorithm, Prim’s Algorithm starts from a single vertex and gradually grows the spanning tree by adding the minimum weight edge connected to the tree.",
        ],
      },
      {
        heading: "BASIC IDEA",
        list: [
          "The algorithm starts with an empty spanning tree.",
          "It maintains two sets of vertices: one set contains vertices already included in the MST, and the other contains vertices not yet included.",
          "At each step, it considers all edges connecting these two sets and selects the edge with the minimum weight.",
          "After selecting the edge, the vertex at the other end is added to the MST set.",
        ],
      },
      {
        heading: "WORKING OF PRIM’S ALGORITHM",
        list: [
          "Choose an arbitrary vertex as the starting point (usually vertex 0).",
          "Find all edges connecting vertices in the MST to vertices outside the MST (fringe vertices).",
          "Select the minimum weight edge among them.",
          "Add this edge and the corresponding vertex to the MST.",
          "Repeat until all vertices are included in the MST.",
        ],
        content: [
          "Since Prim’s Algorithm only adds edges that connect the MST to an unvisited vertex, cycles are never formed.",
        ],
      },
      {
        heading: "ILLUSTRATION",
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154939293361/Prims-Algorithm-1.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154939055549/Prims-Algorithm-2.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154939505588/Prims-Algorithm-3.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154939778378/Prims-Algorithm-4.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154939980152/Prims-Algorithm-5.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154940174320/Prim-Algorithm-6.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154940434658/Prims-Algorithm-7.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154940696307/Prims-Algorithm-8.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154941373563/Prims-Algorithm-9.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154942491145/Prims-Algorithm-10.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154943178040/Prims-Algorithm-11.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250225154944161024/Prims-Algorithm-12.webp",
        ],
      },
      {
        heading: "SIMPLE IMPLEMENTATION (ADJACENCY MATRIX)",
        content: [
          "This implementation uses an adjacency matrix representation of the graph.",
          "The key array is used to store the minimum weight edge connecting each vertex to the MST.",
        ],
        code: {
          language: "python",
          value: `
  import sys

  class Graph():
      def __init__(self, vertices):
          self.V = vertices
          self.graph = [[0 for _ in range(vertices)]
                        for _ in range(vertices)]

      def printMST(self, parent):
          print("Edge \\tWeight")
          for i in range(1, self.V):
              print(parent[i], "-", i, "\\t", self.graph[parent[i]][i])

      def minKey(self, key, mstSet):
          min_val = sys.maxsize
          for v in range(self.V):
              if key[v] < min_val and not mstSet[v]:
                  min_val = key[v]
                  min_index = v
          return min_index

      def primMST(self):
          key = [sys.maxsize] * self.V
          parent = [None] * self.V
          mstSet = [False] * self.V

          key[0] = 0
          parent[0] = -1

          for _ in range(self.V):
              u = self.minKey(key, mstSet)
              mstSet[u] = True

              for v in range(self.V):
                  if self.graph[u][v] > 0 and not mstSet[v] and key[v] > self.graph[u][v]:
                      key[v] = self.graph[u][v]
                      parent[v] = u

          self.printMST(parent)

  if __name__ == '__main__':
      g = Graph(5)
      g.graph = [
          [0, 2, 0, 6, 0],
          [2, 0, 3, 8, 5],
          [0, 3, 0, 0, 7],
          [6, 8, 0, 0, 9],
          [0, 5, 7, 9, 0]
      ]
      g.primMST()
          `.trim(),
        },
      },
      {
        heading: "TIME AND SPACE COMPLEXITY (ADJACENCY MATRIX)",
        list: [
          "Time Complexity: O(V²)",
          "Auxiliary Space: O(V)",
        ],
      },
      {
        heading: "EFFICIENT IMPLEMENTATION (PRIORITY QUEUE)",
        content: [
          "Using an adjacency list and a priority queue (min-heap), Prim’s Algorithm can be optimized.",
          "This approach significantly improves performance for sparse graphs.",
        ],
        code: {
          language: "python",
          value: `
  import heapq

  def spanningTree(V, adj):
      pq = []
      visited = [False] * V
      res = 0

      heapq.heappush(pq, (0, 0))

      while pq:
          wt, u = heapq.heappop(pq)

          if visited[u]:
              continue

          res += wt
          visited[u] = True

          for v in adj[u]:
              if not visited[v[0]]:
                  heapq.heappush(pq, (v[1], v[0]))

      return res

  if __name__ == '__main__':
      V = 3
      adj = [[] for _ in range(V)]

      adj[0].append([1, 5])
      adj[1].append([0, 5])

      adj[1].append([2, 3])
      adj[2].append([1, 3])

      adj[0].append([2, 1])
      adj[2].append([0, 1])

      print(spanningTree(V, adj))
          `.trim(),
        },
      },
      {
        heading: "TIME AND SPACE COMPLEXITY (PRIORITY QUEUE)",
        list: [
          "Time Complexity: O((E + V) * log V)",
          "Auxiliary Space: O(E + V)",
        ],
      },
      {
        heading: "HOW DOES IT WORK?",
        content: [
          "Prim’s Algorithm is based on the Cut Property of Minimum Spanning Trees.",
          "For any cut that divides the vertices into two sets, the minimum weight edge crossing that cut must be part of an MST.",
          "Since Prim’s Algorithm always selects such edges, it guarantees an optimal MST without forming cycles.",
        ],
      },
      {
        heading: "ADVANTAGES AND DISADVANTAGES",
        list: [
          "Advantages:",
          "• Guaranteed to find the MST in a connected weighted graph.",
          "• Efficient for sparse graphs when using a priority queue.",
          "• Easier to implement for dense graphs compared to Kruskal’s algorithm.",
          "Disadvantages:",
          "• Can be slow on dense graphs when using adjacency matrix representation.",
          "• Requires extra memory for priority queue and visited tracking.",
          "• Different starting vertices may lead to different MST structures.",
        ],
      },
    ],
  },
  {
    id: "kruskal-mst",
    type: "algorithm",
    title: "KRUSKAL’S ALGORITHM",
    sections: [
      {
        heading: "WHAT IS MINIMUM SPANNING TREE (MST)?",
        content: [
          "A Minimum Spanning Tree (MST) or Minimum Weight Spanning Tree of a weighted, connected, and undirected graph is a spanning tree that connects all vertices without any cycles and has the minimum possible total edge weight.",
          "The weight of a spanning tree is defined as the sum of all edge weights included in the tree.",
        ],
      },
      {
        heading: "WHAT IS KRUSKAL’S ALGORITHM?",
        content: [
          "Kruskal’s Algorithm is a Greedy Algorithm used to find the Minimum Spanning Tree (MST) of a graph.",
          "It works by selecting edges in increasing order of weight and adding them to the spanning tree as long as they do not form a cycle.",
          "To efficiently detect cycles, Kruskal’s Algorithm uses the Disjoint Set (Union-Find) data structure.",
        ],
      },
      {
        heading: "STEPS OF KRUSKAL’S ALGORITHM",
        list: [
          "Sort all the edges of the graph in non-decreasing order of their weights.",
          "Pick the smallest edge from the sorted list and check if it forms a cycle with the current spanning tree.",
          "If the edge does not form a cycle, include it in the MST; otherwise, discard it.",
          "Repeat the above steps until the spanning tree contains (V - 1) edges, where V is the number of vertices.",
        ],
      },
      {
        heading: "GREEDY STRATEGY",
        content: [
          "Kruskal’s Algorithm always chooses the edge with the minimum available weight at each step.",
          "It makes a locally optimal choice in the hope that these choices lead to a globally optimal solution.",
          "Therefore, Kruskal’s Algorithm is classified as a Greedy Algorithm.",
        ],
      },
      {
        heading: "ILLUSTRATION",
        content: [
          "The given graph contains 9 vertices and 14 edges.",
          "The Minimum Spanning Tree formed using Kruskal’s Algorithm will contain (9 - 1) = 8 edges.",
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250304173248762475/Kruskals-Minimum-Spanning-Tree-MST-Algorithm-1.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250304173249216333/Kruskals-Minimum-Spanning-Tree-MST-Algorithm-2.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250304173249434384/Kruskals-Minimum-Spanning-Tree-MST-Algorithm-3.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250304173249714256/Kruskals-Minimum-Spanning-Tree-MST-Algorithm-4.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250304173250080839/Kruskals-Minimum-Spanning-Tree-MST-Algorithm-5.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250304173250286931/Kruskals-Minimum-Spanning-Tree-MST-Algorithm-6.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250304173250619443/Kruskals-Minimum-Spanning-Tree-MST-Algorithm-7.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250304173250866697/Kruskals-Minimum-Spanning-Tree-MST-Algorithm-8.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250304173251141680/Kruskals-Minimum-Spanning-Tree-MST-Algorithm-9.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250305124734038631/Kruskals-Minimum-Spanning-Tree-MST-Algorithm-10.webp",
        ],
      },
      {
        heading: "IMPLEMENTATION OF KRUSKAL’S ALGORITHM (PYTHON)",
        code: {
          language: "python",
          value: `
  from functools import cmp_to_key

  def comparator(a, b):
      return a[2] - b[2]

  def kruskals_mst(V, edges):
      # Sort all edges by weight
      edges = sorted(edges, key=cmp_to_key(comparator))

      dsu = DSU(V)
      cost = 0
      count = 0

      for x, y, w in edges:
          # Check if adding this edge forms a cycle
          if dsu.find(x) != dsu.find(y):
              dsu.union(x, y)
              cost += w
              count += 1
              if count == V - 1:
                  break
      return cost

  # Disjoint Set Union (Union-Find)
  class DSU:
      def __init__(self, n):
          self.parent = list(range(n))
          self.rank = [1] * n

      def find(self, i):
          if self.parent[i] != i:
              self.parent[i] = self.find(self.parent[i])
          return self.parent[i]

      def union(self, x, y):
          s1 = self.find(x)
          s2 = self.find(y)
          if s1 != s2:
              if self.rank[s1] < self.rank[s2]:
                  self.parent[s1] = s2
              elif self.rank[s1] > self.rank[s2]:
                  self.parent[s2] = s1
              else:
                  self.parent[s2] = s1
                  self.rank[s1] += 1

  if __name__ == "__main__":
      edges = [
          [0, 1, 10],
          [1, 3, 15],
          [2, 3, 4],
          [2, 0, 6],
          [0, 3, 5]
      ]
      print(kruskals_mst(4, edges))
          `.trim(),
        },
      },
      {
        heading: "OUTPUT",
        content: [
          "Edges in the constructed Minimum Spanning Tree:",
          "2 -- 3 == 4",
          "0 -- 3 == 5",
          "0 -- 1 == 10",
          "Minimum Cost Spanning Tree: 19",
        ],
      },
      {
        heading: "TIME AND SPACE COMPLEXITY",
        list: [
          "Sorting all edges takes O(E log E) time.",
          "Each find and union operation takes O(log V) time.",
          "Overall Time Complexity: O(E log E) or O(E log V).",
          "Auxiliary Space Complexity: O(E + V), where V is the number of vertices and E is the number of edges.",
        ],
      },
    ],
  },
  {
    id: "bubble-sort",
    type: "algorithm",
    title: "BUBBLE SORT",
    sections: [
      {
        heading: "WHAT IS BUBBLE SORT?",
        content: [
          "Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping adjacent elements if they are in the wrong order.",
          "This algorithm is inefficient for large datasets due to its high average and worst-case time complexity.",
        ],
      },
      {
        heading: "BASIC IDEA",
        list: [
          "The array is sorted using multiple passes.",
          "After the first pass, the largest element moves to the last position.",
          "After the second pass, the second largest element moves to the second last position.",
          "After k passes, the last k elements are in their correct positions.",
        ],
      },
      {
        heading: "WORKING OF BUBBLE SORT",
        content: [
          "In each pass, adjacent elements are compared and swapped if they are in the wrong order.",
          "This process continues until the array becomes sorted.",
        ],
      },
      {
        heading: "ILLUSTRATION",
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20240925153535/bubble-sort-1.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20240925153536/bubble-sort-2.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20240925153536/bubble-sort-3.webp",
        ],
      },
      {
        heading: "OPTIMIZED IMPLEMENTATION (PYTHON)",
        content: [
          "Bubble Sort can be optimized by stopping early if no swaps occur during a pass.",
        ],
        code: {
          language: "python",
          value: `
  def bubbleSort(arr):
      n = len(arr)

      for i in range(n):
          swapped = False

          for j in range(0, n - i - 1):
              if arr[j] > arr[j + 1]:
                  arr[j], arr[j + 1] = arr[j + 1], arr[j]
                  swapped = True

          if not swapped:
              break

  if __name__ == "__main__":
      arr = [64, 34, 25, 12, 22, 11, 90]
      bubbleSort(arr)
      print("Sorted array:")
      print(arr)
          `.trim(),
        },
      },
      {
        heading: "COMPLEXITY ANALYSIS",
        list: [
          "Time Complexity: O(n²)",
          "Auxiliary Space: O(1)",
        ],
      },
      {
        heading: "ADVANTAGES AND DISADVANTAGES",
        list: [
          "Advantages:",
          "• Easy to understand and implement.",
          "• Stable sorting algorithm.",
          "• In-place algorithm with no extra memory usage.",
          "Disadvantages:",
          "• Very slow for large datasets.",
          "• Rarely used in real-world applications.",
        ],
      },
    ],
  },
  {
    id: "selection-sort",
    type: "algorithm",
    title: "SELECTION SORT",
    sections: [
      {
        heading: "WHAT IS SELECTION SORT?",
        content: [
          "Selection Sort is a comparison-based sorting algorithm.",
          "It works by repeatedly selecting the smallest element from the unsorted portion and placing it at the beginning.",
        ],
      },
      {
        heading: "WORKING OF SELECTION SORT",
        list: [
          "Find the smallest element and swap it with the first element.",
          "Find the second smallest element and swap it with the second position.",
          "Repeat until the entire array is sorted.",
        ],
      },
      {
        heading: "ILLUSTRATION",
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20240926134343/Selection-Sort-Algorithm-1.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20240926134343/Selection-Sort-Algorithm-2.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20240926134344/Selection-Sort-Algorithm-3.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20240926134345/Selection-Sort-Algorithm-4.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20240926134345/Selection-Sort-Algorithm-5.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20240926134346/Selection-Sort-Algorithm-6.webp",
        ],
      },
      {
        heading: "IMPLEMENTATION (PYTHON)",
        code: {
          language: "python",
          value: `
  def selection_sort(arr):
      n = len(arr)

      for i in range(n - 1):
          min_idx = i
          for j in range(i + 1, n):
              if arr[j] < arr[min_idx]:
                  min_idx = j

          arr[i], arr[min_idx] = arr[min_idx], arr[i]

  if __name__ == "__main__":
      arr = [64, 25, 12, 22, 11]
      selection_sort(arr)
      print("Sorted array:", arr)
          `.trim(),
        },
      },
      {
        heading: "COMPLEXITY ANALYSIS",
        list: [
          "Time Complexity: O(n²) in all cases",
          "Auxiliary Space: O(1)",
        ],
      },
      {
        heading: "ADVANTAGES AND DISADVANTAGES",
        list: [
          "Advantages:",
          "• Simple to implement.",
          "• Requires minimal memory writes.",
          "• In-place sorting algorithm.",
          "Disadvantages:",
          "• Not stable.",
          "• Inefficient for large datasets.",
        ],
      },
      {
        heading: "FREQUENT QUESTIONS",
        content: [
          "Selection Sort is not a stable sorting algorithm.",
          "It is best suited for small datasets or educational purposes.",
        ],
      },
    ],
  },
  {
    id: "insertion-sort",
    type: "algorithm",
    title: "INSERTION SORT",
    sections: [
      {
        heading: "WHAT IS INSERTION SORT?",
        content: [
          "Insertion Sort is a simple sorting algorithm that builds the final sorted array one element at a time.",
          "It works similarly to how you sort playing cards in your hand.",
        ],
      },
      {
        heading: "WORKING OF INSERTION SORT",
        list: [
          "Assume the first element is already sorted.",
          "Pick the next element and insert it into the correct position in the sorted portion.",
          "Repeat until all elements are sorted.",
        ],
      },
      {
        heading: "ILLUSTRATION",
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250322120814021166/Insertion-Sort--1.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250322120813676040/Insertion-Sort--2.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250322120813423266/Insertion-Sort--3.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250322120812765435/Insertion-Sort--4.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250322120812115216/Insertion-Sort--5.webp",
        ],
      },
      {
        heading: "IMPLEMENTATION (PYTHON)",
        code: {
          language: "python",
          value: `
  def insertionSort(arr):
      for i in range(1, len(arr)):
          key = arr[i]
          j = i - 1

          while j >= 0 and key < arr[j]:
              arr[j + 1] = arr[j]
              j -= 1

          arr[j + 1] = key

  if __name__ == "__main__":
      arr = [12, 11, 13, 5, 6]
      insertionSort(arr)
      print(arr)
          `.trim(),
        },
      },
      {
        heading: "COMPLEXITY ANALYSIS",
        list: [
          "Best Case: O(n)",
          "Average Case: O(n²)",
          "Worst Case: O(n²)",
          "Auxiliary Space: O(1)",
        ],
      },
      {
        heading: "ADVANTAGES AND DISADVANTAGES",
        list: [
          "Advantages:",
          "• Stable sorting algorithm.",
          "• Efficient for small or nearly sorted arrays.",
          "• In-place and adaptive.",
          "Disadvantages:",
          "• Inefficient for large datasets.",
        ],
      },
      {
        heading: "APPLICATIONS",
        list: [
          "Used for small datasets.",
          "Used when the array is nearly sorted.",
          "Used in hybrid algorithms like TimSort and IntroSort.",
        ],
      },
    ],
  },
  {
    id: "merge-sort",
    type: "algorithm",
    title: "MERGE SORT",
    sections: [
      {
        heading: "WHAT IS MERGE SORT?",
        content: [
          "Merge Sort is a popular sorting algorithm known for its efficiency and stability. It follows the Divide and Conquer approach.",
          "The algorithm works by recursively dividing the input array into two halves, sorting each half, and then merging them back together."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250923102849709166/arr_.webp"
        ]
      },
      {
        heading: "WORKING PRINCIPLE",
        list: [
          "Divide: Recursively divide the array into two halves until each subarray has one element.",
          "Conquer: Sort each subarray individually.",
          "Merge: Merge the sorted subarrays to produce the final sorted array."
        ]
      },
      {
        heading: "STEP BY STEP EXAMPLE",
        content: [
          "Let’s sort the array [38, 27, 43, 10] using Merge Sort."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250923102849301345/420046649.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250923102849111197/420046650.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250923102848872960/420046651.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250923102849544932/420046652.webp"
        ]
      },
      {
        heading: "DIVIDE PHASE",
        list: [
          "[38, 27, 43, 10] → [38, 27] and [43, 10]",
          "[38, 27] → [38] and [27]",
          "[43, 10] → [43] and [10]"
        ]
      },
      {
        heading: "CONQUER PHASE",
        list: [
          "[38] is already sorted",
          "[27] is already sorted",
          "[43] is already sorted",
          "[10] is already sorted"
        ]
      },
      {
        heading: "MERGE PHASE",
        list: [
          "Merge [38] and [27] → [27, 38]",
          "Merge [43] and [10] → [10, 43]",
          "Merge [27, 38] and [10, 43] → [10, 27, 38, 43]"
        ]
      },
      {
        heading: "MERGE SORT IMPLEMENTATION (PYTHON)",
        code: {
          language: "python",
          value: `
def merge(arr, left, mid, right):
    n1 = mid - left + 1
    n2 = right - mid

    L = [0] * n1
    R = [0] * n2

    for i in range(n1):
        L[i] = arr[left + i]
    for j in range(n2):
        R[j] = arr[mid + 1 + j]

    i = j = 0
    k = left

    while i < n1 and j < n2:
        if L[i] <= R[j]:
            arr[k] = L[i]
            i += 1
        else:
            arr[k] = R[j]
            j += 1
        k += 1

    while i < n1:
        arr[k] = L[i]
        i += 1
        k += 1

    while j < n2:
        arr[k] = R[j]
        j += 1
        k += 1


def mergeSort(arr, left, right):
    if left < right:
        mid = (left + right) // 2
        mergeSort(arr, left, mid)
        mergeSort(arr, mid + 1, right)
        merge(arr, left, mid, right)


arr = [38, 27, 43, 10]
mergeSort(arr, 0, len(arr) - 1)
print(arr)
          `.trim()
        }
      },
      {
        heading: "TIME AND SPACE COMPLEXITY",
        list: [
          "Best Case: O(n log n)",
          "Average Case: O(n log n)",
          "Worst Case: O(n log n)",
          "Auxiliary Space: O(n)"
        ]
      },
      {
        heading: "ADVANTAGES",
        list: [
          "Stable sorting algorithm",
          "Guaranteed O(n log n) performance",
          "Easy to parallelize",
          "Preferred for linked lists"
        ]
      },
      {
        heading: "DISADVANTAGES",
        list: [
          "Requires extra memory",
          "Not an in-place sorting algorithm",
          "Generally slower than QuickSort due to memory access"
        ]
      }
    ]
  },

  {
    id: "queue-sort",
    type: "algorithm",
    title: "QUEUE SORTING",
    sections: [
      {
        heading: "PROBLEM STATEMENT",
        content: [
          "Given a queue with random elements, sort it without using any extra space.",
          "Only enqueue, dequeue, and isEmpty operations are allowed."
        ]
      },
      {
        heading: "IDEA",
        content: [
          "On each pass, find the minimum element in the unsorted part of the queue.",
          "Move this minimum element to the rear of the queue.",
          "Repeat the process until the queue becomes sorted."
        ]
      },
      {
        heading: "ILLUSTRATION",
        list: [
          "Initial Queue: 11 5 4 21",
          "After first pass → 11 5 21 4",
          "After second pass → 11 21 4 5",
          "After third pass → 21 4 5 11",
          "Final Queue → 4 5 11 21"
        ]
      },
      {
        heading: "PYTHON IMPLEMENTATION",
        code: {
          language: "python",
          value: `
from queue import Queue

def minIndex(q, sortedIndex):
    min_index = -1
    min_val = float('inf')
    n = q.qsize()

    for i in range(n):
        curr = q.queue[0]
        q.get()

        if curr <= min_val and i <= sortedIndex:
            min_val = curr
            min_index = i

        q.put(curr)
    return min_index


def insertMinToRear(q, min_index):
    min_val = None
    n = q.qsize()

    for i in range(n):
        curr = q.queue[0]
        q.get()

        if i != min_index:
            q.put(curr)
        else:
            min_val = curr

    q.put(min_val)


def sortQueue(q):
    for i in range(1, q.qsize() + 1):
        min_index = minIndex(q, q.qsize() - i)
        insertMinToRear(q, min_index)


q = Queue()
q.put(30)
q.put(11)
q.put(15)
q.put(4)

sortQueue(q)

while not q.empty():
    print(q.queue[0], end=" ")
    q.get()
          `.trim()
        }
      },
      {
        heading: "COMPLEXITY ANALYSIS",
        list: [
          "Time Complexity: O(n²)",
          "Extra Space: O(1)"
        ]
      }
    ]
  },
  {
    id: "linear-search",
    type: "algorithm",
    title: "LINEAR SEARCH",
    sections: [
      {
        heading: "WHAT IS LINEAR SEARCH?",
        content: [
          "Linear Search is a simple searching algorithm that checks each element of the array sequentially until the target element is found or the array ends.",
          "It is also known as Sequential Search."
        ]
      },
      {
        heading: "PROBLEM STATEMENT",
        content: [
          "Given an array arr[] of n integers and a target element x, find the index of the first occurrence of x in the array.",
          "If the element does not exist, return -1."
        ]
      },
      {
        heading: "EXAMPLES",
        list: [
          "arr = [1, 2, 3, 4], x = 3 → Output: 2",
          "arr = [10, 8, 30, 4, 5], x = 5 → Output: 4",
          "arr = [10, 8, 30], x = 6 → Output: -1"
        ]
      },
      {
        heading: "HOW LINEAR SEARCH WORKS",
        content: [
          "The algorithm iterates through the array from the first element to the last.",
          "If the current element matches the target, its index is returned.",
          "If the loop finishes without a match, return -1."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20240902185521/Linear-search-algorithm-1.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20240902185522/Linear-search-algorithm-2.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20240902185522/Linear-search-algorithm-3.webp"
        ]
      },
      {
        heading: "LINEAR SEARCH IMPLEMENTATION (C++)",
        code: {
          language: "cpp",
          value: `
#include <iostream>
#include <vector>
using namespace std;

int search(vector<int>& arr, int x) {
    for (int i = 0; i < arr.size(); i++)
        if (arr[i] == x)
            return i;
    return -1;
}

int main() {
    vector<int> arr = {2, 3, 4, 10, 40};
    int x = 10;

    int res = search(arr, x);
    if (res == -1)
        cout << "Element is not present in the array";
    else
        cout << "Element is present at index " << res;
    return 0;
}
          `.trim()
        }
      },
      {
        heading: "TIME AND SPACE COMPLEXITY",
        list: [
          "Best Case: O(1)",
          "Average Case: O(N)",
          "Worst Case: O(N)",
          "Auxiliary Space: O(1)"
        ]
      },
      {
        heading: "APPLICATIONS",
        list: [
          "Searching in unsorted arrays",
          "Small datasets",
          "Searching in linked lists",
          "Simple search operations"
        ]
      },
      {
        heading: "ADVANTAGES",
        list: [
          "Works on both sorted and unsorted data",
          "Easy to implement",
          "No extra memory required",
          "Good for small datasets"
        ]
      },
      {
        heading: "DISADVANTAGES",
        list: [
          "Slow for large datasets",
          "Time complexity is O(N)"
        ]
      },
      {
        heading: "WHEN TO USE LINEAR SEARCH?",
        list: [
          "When the dataset is small",
          "When data is unsorted",
          "When simplicity is more important than speed"
        ]
      }
    ]
  },
  {
    id: "binary-search",
    type: "algorithm",
    title: "BINARY SEARCH",
    sections: [
      {
        heading: "WHAT IS BINARY SEARCH?",
        content: [
          "Binary Search is an efficient searching algorithm that works on sorted arrays.",
          "It repeatedly divides the search space into two halves, reducing the search time to O(log N)."
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20260131112215575504/frame_1.webp"
        ]
      },
      {
        heading: "CONDITIONS TO APPLY BINARY SEARCH",
        list: [
          "The data structure must be sorted",
          "Random access to elements should be possible in O(1) time"
        ]
      },
      {
        heading: "BINARY SEARCH ALGORITHM STEPS",
        list: [
          "Find the middle index of the search space",
          "Compare the middle element with the target",
          "If equal, return the index",
          "If target is smaller, search left half",
          "If target is larger, search right half",
          "Repeat until found or search space is empty"
        ]
      },
      {
        heading: "WORKING EXAMPLE",
        content: [
          "Array: {2, 5, 8, 12, 16, 23, 38, 56, 72, 91}",
          "Target: 23"
        ],
        image: [
          "https://media.geeksforgeeks.org/wp-content/uploads/20250219155359690903/Binary-Search-1.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250219155359020153/Binary-Search-2.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250219155358414164/Binary-Search-3.webp",
          "https://media.geeksforgeeks.org/wp-content/uploads/20250219155357890968/Binary-Search-4.png"
        ]
      },
      {
        heading: "ITERATIVE BINARY SEARCH (PYTHON)",
        code: {
          language: "python",
          value: `
def binarySearch(arr, x):
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = low + (high - low) // 2

        if arr[mid] == x:
            return mid
        elif arr[mid] < x:
            low = mid + 1
        else:
            high = mid - 1

    return -1


arr = [2, 3, 4, 10, 40]
x = 10
print(binarySearch(arr, x))
          `.trim()
        }
      },
      {
        heading: "RECURSIVE BINARY SEARCH (PYTHON)",
        code: {
          language: "python",
          value: `
def binarySearch(arr, low, high, x):
    if high >= low:
        mid = low + (high - low) // 2

        if arr[mid] == x:
            return mid
        elif arr[mid] > x:
            return binarySearch(arr, low, mid - 1, x)
        else:
            return binarySearch(arr, mid + 1, high, x)
    else:
        return -1


arr = [2, 3, 4, 10, 40]
x = 10
print(binarySearch(arr, 0, len(arr) - 1, x))
          `.trim()
        }
      },
      {
        heading: "COMPLEXITY ANALYSIS",
        list: [
          "Best Case: O(1)",
          "Average Case: O(log N)",
          "Worst Case: O(log N)",
          "Auxiliary Space: O(1) (Iterative)",
          "Auxiliary Space: O(log N) (Recursive)"
        ]
      },
      {
        heading: "APPLICATIONS",
        list: [
          "Searching in sorted arrays",
          "Database indexing",
          "Debugging with git bisect",
          "File systems and libraries",
          "Machine learning parameter tuning",
          "Competitive programming",
          "Binary Search Trees and related structures"
        ]
      }
    ]
  },
];
