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
export function insertBT(root: BTNode | null, value: number, nodeId: string): BTNode {
  const newNode: BTNode = { id: nodeId, value, left: null, right: null };
  if (!root) return newNode;

  const queue: BTNode[] = [root];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (!cur.left) { cur.left = newNode; return root; }
    queue.push(cur.left);
    if (!cur.right) { cur.right = newNode; return root; }
    queue.push(cur.right);
  }
  return root;
}

//  Remove — detach the target node (and its subtree), leaving a null gap
export function removeBT(root: BTNode | null, value: number): BTNode | null {
  if (!root) return null;
  // If root is the target, remove the entire tree
  if (root.value === value) return null;

  // BFS to find the parent of the target node
  const queue: BTNode[] = [root];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.left && cur.left.value === value) {
      cur.left = null; // detach entire subtree
      return root;
    }
    if (cur.right && cur.right.value === value) {
      cur.right = null; // detach entire subtree
      return root;
    }
    if (cur.left) queue.push(cur.left);
    if (cur.right) queue.push(cur.right);
  }
  return root; // value not found
}

//  Search (BFS) 
export function searchBT(
  root: BTNode | null,
  value: number
): { found: boolean; nodeId?: string; path: string[] } {
  if (!root) return { found: false, path: [] };
  const queue: Array<{ node: BTNode; path: string[] }> = [{ node: root, path: [root.id] }];
  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (node.value === value) return { found: true, nodeId: node.id, path };
    if (node.left) queue.push({ node: node.left, path: [...path, node.left.id] });
    if (node.right) queue.push({ node: node.right, path: [...path, node.right.id] });
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
  while (q.length) { const n = q.shift()!; result.push(n); if (n.left) q.push(n.left); if (n.right) q.push(n.right); }
  return result;
}

export function calculateBTPositions(
  root: BTNode | null,
  positions: Map<string, NodePosition> = new Map()
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
  _prefix?: string  // เพิ่ม param นี้
): { nodes: object[]; edges: object[] } {
  const prefix = _prefix ?? `bt-${Date.now()}`;
  if (!root) return { nodes, edges };
  nodes.push({ id: root.id, type: 'custom', data: { label: root.value.toString(), variant: 'circle' }, position: positions.get(root.id) ?? { x: 0, y: 0 } });
  if (root.left) {
    edges.push({ id: `${prefix}-${root.id}-${root.left.id}`, source: root.id, sourceHandle: 'source-bottom-left', target: root.left.id, targetHandle: 'target-top-right', type: 'straight' });
    btToReactFlow(root.left, nodes, edges, positions, prefix);
  }
  if (root.right) {
    edges.push({ id: `${prefix}-${root.id}-${root.right.id}`, source: root.id, sourceHandle: 'source-bottom-right', target: root.right.id, targetHandle: 'target-top-left', type: 'straight' });
    btToReactFlow(root.right, nodes, edges, positions, prefix);
  }
  return { nodes, edges };
}

//  Build from node list 
export function buildBTFromNodes(
  nodes: Array<{ id: string; data: { label: string } }>
): BTNode | null {
  let root: BTNode | null = null;
  for (const n of nodes) {
    const value = parseInt(n.data.label);
    if (!isNaN(value)) root = insertBT(root, value, n.id);
  }
  return root;
}
