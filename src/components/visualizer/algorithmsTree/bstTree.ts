export interface BSTNode {
  id: string;
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

export interface BSTAnimationRecorder {
  recordTraverse?: (
    nodeId: string,
    value: number,
    direction: "left" | "right" | "here",
  ) => void;
  recordFoundParent?: (
    parentId: string,
    value: number,
    direction: "left" | "right",
  ) => void;
  recordInsert?: (nodeId: string, value: number) => void;
  recordRemove?: (nodeId: string, value: number) => void;
  recordComplete?: (value: number) => void;
}

//  Core BST Operations
function insertBSTInternal(
  root: BSTNode | null,
  value: number,
  nodeId: string,
  recorder?: BSTAnimationRecorder,
  parent?: BSTNode | null,
  parentDir?: "left" | "right",
): BSTNode {
  if (root === null) {
    if (parent && parentDir) {
      recorder?.recordFoundParent?.(parent.id, value, parentDir);
    }
    recorder?.recordInsert?.(nodeId, value);
    return { id: nodeId, value, left: null, right: null };
  }

  if (value < root.value) {
    recorder?.recordTraverse?.(root.id, value, "left");
    root.left = insertBSTInternal(
      root.left,
      value,
      nodeId,
      recorder,
      root,
      "left",
    );
  } else if (value > root.value) {
    recorder?.recordTraverse?.(root.id, value, "right");
    root.right = insertBSTInternal(
      root.right,
      value,
      nodeId,
      recorder,
      root,
      "right",
    );
  }
  return root;
}

export function insertBST(
  root: BSTNode | null,
  value: number,
  nodeId: string,
): BSTNode {
  return insertBSTInternal(root, value, nodeId);
}

export function insertBSTWithAnimation(
  root: BSTNode | null,
  value: number,
  nodeId: string,
  recorder?: BSTAnimationRecorder,
): BSTNode {
  return insertBSTInternal(root, value, nodeId, recorder);
}

function getMinNode(node: BSTNode): BSTNode {
  let cur = node;
  while (cur.left) cur = cur.left;
  return cur;
}

/** Find inorder successor of a node to be deleted (node must have right child) */
export function findBSTSuccessor(
  root: BSTNode | null,
  value: number,
): { successorId: string | null; successorValue: number | null } {
  if (!root) return { successorId: null, successorValue: null };
  let cur = root;
  // Find the node
  while (cur && cur.value !== value) {
    cur = value < cur.value ? cur.left! : cur.right!;
    if (!cur) return { successorId: null, successorValue: null };
  }
  // If has right subtree, successor is min of right
  if (cur.right) {
    const suc = getMinNode(cur.right);
    return { successorId: suc.id, successorValue: suc.value };
  }
  return { successorId: null, successorValue: null };
}

function removeBSTInternal(
  root: BSTNode | null,
  value: number,
  recorder?: BSTAnimationRecorder,
): BSTNode | null {
  if (!root) return null;

  if (value < root.value) {
    recorder?.recordTraverse?.(root.id, value, "left");
    root.left = removeBSTInternal(root.left, value, recorder);
  } else if (value > root.value) {
    recorder?.recordTraverse?.(root.id, value, "right");
    root.right = removeBSTInternal(root.right, value, recorder);
  } else {
    recorder?.recordRemove?.(root.id, root.value);

    if (!root.left) return root.right;
    if (!root.right) return root.left;

    const successor = getMinNode(root.right);
    root.value = successor.value;
    root.id = successor.id;
    root.right = removeBSTInternal(root.right, successor.value, recorder);
  }

  return root;
}

export function removeBST(root: BSTNode | null, value: number): BSTNode | null {
  return removeBSTInternal(root, value);
}

export function removeBSTWithAnimation(
  root: BSTNode | null,
  value: number,
  recorder?: BSTAnimationRecorder,
): BSTNode | null {
  return removeBSTInternal(root, value, recorder);
}

export function searchBST(
  root: BSTNode | null,
  value: number,
): { found: boolean; nodeId?: string; path: string[] } {
  const path: string[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.id);
    if (value === cur.value) return { found: true, nodeId: cur.id, path };
    cur = value < cur.value ? cur.left : cur.right;
  }
  return { found: false, path };
}

export interface BSTInsertionPosition {
  parentId: string | null;
  position: "left" | "right";
  parentValue: number | null;
  path: string[];
}

export function findBSTInsertionPosition(
  root: BSTNode | null,
  value: number,
  path: string[] = [],
): BSTInsertionPosition {
  if (!root)
    return { parentId: null, position: "left", parentValue: null, path };

  if (value < root.value) {
    if (!root.left)
      return {
        parentId: root.id,
        position: "left",
        parentValue: root.value,
        path: [...path, root.id],
      };
    return findBSTInsertionPosition(root.left, value, [...path, root.id]);
  }
  if (value > root.value) {
    if (!root.right)
      return {
        parentId: root.id,
        position: "right",
        parentValue: root.value,
        path: [...path, root.id],
      };
    return findBSTInsertionPosition(root.right, value, [...path, root.id]);
  }

  return { parentId: null, position: "left", parentValue: null, path };
}

//  Position & ReactFlow

export interface NodePosition {
  x: number;
  y: number;
}

function getTreeNodesArray(
  root: BSTNode | null,
  result: BSTNode[] = [],
): BSTNode[] {
  if (!root) return result;
  getTreeNodesArray(root.left, result);
  result.push(root);
  getTreeNodesArray(root.right, result);
  return result;
}

export function calculateBSTPositions(
  root: BSTNode | null,
  positions: Map<string, NodePosition> = new Map(),
): Map<string, NodePosition> {
  if (!root) return positions;

  const totalNodes = getTreeNodesArray(root).length;
  const gap = Math.max(50, 85 - totalNodes * 0.8);
  const verticalGap = 100;

  let idx = 0;
  function inorder(node: BSTNode | null, depth: number) {
    if (!node) return;
    inorder(node.left, depth + 1);
    positions.set(node.id, { x: idx * gap, y: depth * verticalGap });
    idx++;
    inorder(node.right, depth + 1);
  }

  inorder(root, 0);
  return positions;
}

export function bstToReactFlow(
  root: BSTNode | null,
  nodes: Record<string, unknown>[] = [],
  edges: Record<string, unknown>[] = [],
  positions: Map<string, NodePosition> = new Map(),
): { nodes: Record<string, unknown>[]; edges: Record<string, unknown>[] } {
  if (!root) return { nodes, edges };

  const position = positions.get(root.id) || { x: 0, y: 0 };

  nodes.push({
    id: root.id,
    type: "custom",
    data: { label: root.value.toString(), variant: "circle" },
    position,
  });

  if (root.left) {
    edges.push({
      id: `edge-${root.id}-${root.left.id}`,
      source: root.id,
      sourceHandle: "source-bottom-left",
      target: root.left.id,
      targetHandle: "target-top-right",
      type: "straight",
    });
    bstToReactFlow(root.left, nodes, edges, positions);
  }

  if (root.right) {
    edges.push({
      id: `edge-${root.id}-${root.right.id}`,
      source: root.id,
      sourceHandle: "source-bottom-right",
      target: root.right.id,
      targetHandle: "target-top-left",
      type: "straight",
    });
    bstToReactFlow(root.right, nodes, edges, positions);
  }

  return { nodes, edges };
}

//  Serialize / Deserialize
export function serializeBST(root: BSTNode | null): BSTNode | null {
  if (!root) return null;
  return JSON.parse(JSON.stringify(root));
}

export function deserializeBST(data: BSTNode | null): BSTNode | null {
  if (!data) return null;
  return JSON.parse(JSON.stringify(data));
}

export function cloneBSTTree(root: BSTNode | null): BSTNode | null {
  if (!root) return null;
  return JSON.parse(JSON.stringify(root));
}

import { BTNode, rebuildBTFromReactFlow } from "./binaryTree";

export function rebuildBSTFromNodes(
  nodes: Array<{ id: string; data: { label: string } }>,
  edges: Array<{
    source: string;
    target: string;
    sourceHandle?: string | null;
  }> = [], // default to empty array for backwards compatibility
): BSTNode | null {
  const btRoot = rebuildBTFromReactFlow(nodes, edges);
  if (!btRoot) return null;

  function convertToBST(btNode: BTNode | null): BSTNode | null {
    if (!btNode) return null;
    return {
      id: btNode.id,
      value: btNode.value,
      left: convertToBST(btNode.left),
      right: convertToBST(btNode.right),
    };
  }

  return convertToBST(btRoot);
}
