export interface BTNode {
  id: string;
  value: number;
  left: BTNode | null;
  right: BTNode | null;
}

export interface NodePosition {
  x: number;
  y: number;
}

//  Insert (Level-order BFS)
export function insertBT(
  root: BTNode | null,
  value: number,
  nodeId: string,
): BTNode {
  const newNode: BTNode = { id: nodeId, value, left: null, right: null };
  if (!root) return newNode;

  const queue: BTNode[] = [root];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (!cur.left) {
      cur.left = newNode;
      return root;
    }
    queue.push(cur.left);
    if (!cur.right) {
      cur.right = newNode;
      return root;
    }
    queue.push(cur.right);
  }
  return root;
}

//  Remove (Standard Deepest-Rightmost Replacement)
export function removeBT(
  root: BTNode | null,
  value: number,
): { newRoot: BTNode | null; deepestId: string | null } {
  if (!root) return { newRoot: null, deepestId: null };

  // If only one node in tree
  if (!root.left && !root.right) {
    if (root.value === value) return { newRoot: null, deepestId: null };
    return { newRoot: root, deepestId: null };
  }

  // 1. Find the target node and the deepest rightmost node
  let targetNode: BTNode | null = null;
  let deepestNode: BTNode | null = null;
  let deepestParent: BTNode | null = null;

  const queue: Array<{ node: BTNode; parent: BTNode | null }> = [
    { node: root, parent: null },
  ];

  while (queue.length > 0) {
    const { node, parent } = queue.shift()!;

    if (node.value === value) {
      targetNode = node;
    }

    // As we process strictly left-to-right via BFS, the very last node processed
    // will be the deepest and rightmost node in the tree.
    deepestNode = node;
    deepestParent = parent;

    if (node.left) queue.push({ node: node.left, parent: node });
    if (node.right) queue.push({ node: node.right, parent: node });
  }

  // 2. If target found, replace its value/id with the deepest node, then delete deepest node
  if (targetNode && deepestNode && deepestParent) {
    const deepestId = deepestNode.id;

    // Only swap if they aren't the exact same node (e.g. deleting the deepest node itself)
    if (targetNode !== deepestNode) {
      targetNode.value = deepestNode.value;
      targetNode.id = deepestNode.id;
    }

    // Detach deepest node from its parent
    if (deepestParent.right === deepestNode) {
      deepestParent.right = null;
    } else if (deepestParent.left === deepestNode) {
      deepestParent.left = null;
    }

    return { newRoot: root, deepestId };
  }

  return { newRoot: root, deepestId: null }; // value not found
}

//  Search (BFS)
export function searchBT(
  root: BTNode | null,
  value: number,
): { found: boolean; nodeId?: string; path: string[] } {
  if (!root) return { found: false, path: [] };
  const queue: Array<{ node: BTNode; path: string[] }> = [
    { node: root, path: [root.id] },
  ];
  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (node.value === value) return { found: true, nodeId: node.id, path };
    if (node.left)
      queue.push({ node: node.left, path: [...path, node.left.id] });
    if (node.right)
      queue.push({ node: node.right, path: [...path, node.right.id] });
  }
  return { found: false, path: [] };
}

//  Clone
export function cloneBT(root: BTNode | null): BTNode | null {
  if (!root) return null;
  return JSON.parse(JSON.stringify(root));
}

//  Positions
function getAllBTNodes(root: BTNode | null): BTNode[] {
  const result: BTNode[] = [];
  if (!root) return result;
  const q = [root];
  while (q.length) {
    const n = q.shift()!;
    result.push(n);
    if (n.left) q.push(n.left);
    if (n.right) q.push(n.right);
  }
  return result;
}

export function calculateBTPositions(
  root: BTNode | null,
  positions: Map<string, NodePosition> = new Map(),
): Map<string, NodePosition> {
  if (!root) return positions;
  const total = getAllBTNodes(root).length;
  const gap = Math.max(60, 80 + total * 8);
  const verticalGap = 100;
  let idx = 0;
  function inorder(node: BTNode | null, depth: number) {
    if (!node) return;
    inorder(node.left, depth + 1);
    positions.set(node.id, { x: idx * gap, y: depth * verticalGap });
    idx++;
    inorder(node.right, depth + 1);
  }
  inorder(root, 0);
  return positions;
}

//  ReactFlow
export function btToReactFlow(
  root: BTNode | null,
  nodes: object[] = [],
  edges: object[] = [],
  positions: Map<string, NodePosition> = new Map(),
  _prefix?: string, // เพิ่ม param นี้
): { nodes: object[]; edges: object[] } {
  const prefix = _prefix ?? `bt-${Date.now()}`;
  if (!root) return { nodes, edges };
  nodes.push({
    id: root.id,
    type: "custom",
    data: { label: root.value.toString(), variant: "circle" },
    position: positions.get(root.id) ?? { x: 0, y: 0 },
  });
  if (root.left) {
    edges.push({
      id: `${prefix}-${root.id}-${root.left.id}`,
      source: root.id,
      sourceHandle: "source-bottom-left",
      target: root.left.id,
      targetHandle: "target-top-right",
      type: "straight",
    });
    btToReactFlow(root.left, nodes, edges, positions, prefix);
  }
  if (root.right) {
    edges.push({
      id: `${prefix}-${root.id}-${root.right.id}`,
      source: root.id,
      sourceHandle: "source-bottom-right",
      target: root.right.id,
      targetHandle: "target-top-left",
      type: "straight",
    });
    btToReactFlow(root.right, nodes, edges, positions, prefix);
  }
  return { nodes, edges };
}

//  Build from custom drawings (React Flow nodes and edges)
export function rebuildBTFromReactFlow(
  nodes: Array<{ id: string; data: { label: string } }>,
  edges: Array<{
    source: string;
    target: string;
    sourceHandle?: string | null;
  }>,
): BTNode | null {
  if (!nodes || nodes.length === 0) return null;

  // 1. Create a map of all node IDs to BTNode instances
  const nodeMap = new Map<string, BTNode>();

  // Find nodes that only contain valid numbers
  const validNodes = nodes.filter((n) => !isNaN(parseInt(n.data.label)));
  if (validNodes.length === 0) return null;

  validNodes.forEach((n) => {
    nodeMap.set(n.id, {
      id: n.id,
      value: parseInt(n.data.label),
      left: null,
      right: null,
    });
  });

  // 2. Map children to parents based on edges
  // To find the root, we track which nodes are targets
  const targetIds = new Set<string>();

  edges.forEach((edge) => {
    const parent = nodeMap.get(edge.source);
    const child = nodeMap.get(edge.target);

    if (parent && child) {
      targetIds.add(child.id);

      // Determine if left or right child based on sourceHandle
      if (edge.sourceHandle === "source-bottom-left") {
        parent.left = child;
      } else if (edge.sourceHandle === "source-bottom-right") {
        parent.right = child;
      } else {
        // Fallback if handles aren't specified clearly: try left then right
        if (!parent.left) {
          parent.left = child;
        } else if (!parent.right) {
          parent.right = child;
        }
      }
    }
  });

  // 3. Find the root (the node that is NEVER a target)
  // If there are multiple disconnected components, we'll just pick the first valid root we find.
  let mainRoot: BTNode | null = null;
  for (const n of validNodes) {
    if (!targetIds.has(n.id)) {
      mainRoot = nodeMap.get(n.id) || null;
      break;
    }
  }

  if (!mainRoot) {
    mainRoot = nodeMap.get(validNodes[0].id) || null;
  }

  // 4. Find all nodes reachable from mainRoot
  const reached = new Set<string>();
  if (mainRoot) {
    const queue: BTNode[] = [mainRoot];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      reached.add(cur.id);
      if (cur.left) queue.push(cur.left);
      if (cur.right) queue.push(cur.right);
    }
  }

  // 5. Auto-attach connected-cluster nodes (nodes that have at least one edge
  //    but are NOT reachable from mainRoot) into the main tree via level-order insertion.
  //    Truly isolated nodes (zero edges) are ignored entirely.
  const connectedIds = new Set<string>();
  for (const edge of edges) {
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
  }

  if (mainRoot) {
    for (const n of validNodes) {
      if (!reached.has(n.id) && connectedIds.has(n.id)) {
        // Auto-insert this orphan cluster node into the main tree
        const orphanNode = nodeMap.get(n.id);
        if (orphanNode) {
          // Detach from any sub-cluster links to avoid corrupting the tree
          orphanNode.left = null;
          orphanNode.right = null;
          // Insert via level-order (find first null slot)
          const queue: BTNode[] = [mainRoot];
          let inserted = false;
          while (queue.length > 0 && !inserted) {
            const cur = queue.shift()!;
            if (!cur.left) {
              cur.left = orphanNode;
              inserted = true;
            } else if (!cur.right) {
              cur.right = orphanNode;
              inserted = true;
            } else {
              queue.push(cur.left);
              queue.push(cur.right);
            }
          }
          reached.add(n.id);
        }
      }
    }
  }

  return mainRoot;
}
