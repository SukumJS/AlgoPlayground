import type { AVLTreeNode } from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";
import { updateHeight } from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";
import { rotateLeft, rotateRight } from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";

/**
 * Deep clone an AVL tree
 */
export function cloneTree(root: AVLTreeNode | null): AVLTreeNode | null {
  if (!root) return null;
  return JSON.parse(JSON.stringify(root)) as AVLTreeNode;
}

/**
 * Insert a leaf node without performing AVL balancing
 * Used to reconstruct tree snapshots during animation
 */
export function insertLeafWithoutBalance(
  root: AVLTreeNode | null,
  value: number,
  nodeId: string
): AVLTreeNode {
  if (root === null) {
    return { id: nodeId, value, left: null, right: null, height: 1 };
  }
  if (value < root.value) {
    root.left = insertLeafWithoutBalance(root.left, value, nodeId);
  } else if (value > root.value) {
    root.right = insertLeafWithoutBalance(root.right, value, nodeId);
  }
  updateHeight(root);
  return root;
}

/**
 * Remove a node using BST deletion without AVL balancing
 * Used to reconstruct tree snapshots during animation
 */
export function removeLeafWithoutBalance(
  root: AVLTreeNode | null,
  value: number
): AVLTreeNode | null {
  if (!root) return null;

  if (value < root.value) {
    root.left = removeLeafWithoutBalance(root.left, value);
    updateHeight(root);
    return root;
  }

  if (value > root.value) {
    root.right = removeLeafWithoutBalance(root.right, value);
    updateHeight(root);
    return root;
  }

  // Found the node to remove
  if (!root.left) return root.right;
  if (!root.right) return root.left;

  // Node has two children: replace with inorder successor
  let successor = root.right;
  while (successor && successor.left) {
    successor = successor.left;
  }

  if (successor) {
    root.value = successor.value;
    root.right = removeLeafWithoutBalance(root.right, successor.value);
  }

  updateHeight(root);
  return root;
}

/**
 * Apply a rotation at a specific node in the tree
 */
export function applyRotationAt(
  root: AVLTreeNode | null,
  targetId: string,
  direction: 'left' | 'right'
): AVLTreeNode | null {
  if (!root) return null;

  if (root.id === targetId) {
    // Import rotateLeft and rotateRight here to avoid circular deps
    return direction === 'left' ? rotateLeft(root) : rotateRight(root);
  }

  root.left = applyRotationAt(root.left, targetId, direction);
  root.right = applyRotationAt(root.right, targetId, direction);
  updateHeight(root);
  return root;
}

/**
 * Animation step type
 */
export interface AnimationStep {
  type: string;
  description: string;
  highlightedNodes: string[];
  highlightedEdges: string[];
  highlightColor?: string;
  edgeColor?: string;
}

/**
 * Build snapshots from animation steps
 * Each snapshot represents the tree state after applying a step
 */
export function buildInsertSnapshots(
  rootCopy: AVLTreeNode | null,
  steps: AnimationStep[],
  value: number,
  nodeId: string
): Array<AVLTreeNode | null> {
  const snapshots: Array<AVLTreeNode | null> = [];
  let stateRoot = cloneTree(rootCopy);

  // Initial state
  snapshots.push(cloneTree(stateRoot));

  // Apply each step to build subsequent snapshots
  steps.forEach(step => {
    if (step.type === 'insert-node') {
      stateRoot = insertLeafWithoutBalance(stateRoot, value, nodeId);
    } else if (step.type === 'rotate-left') {
      const targetId = step.highlightedNodes[0] || '';
      stateRoot = applyRotationAt(stateRoot, targetId, 'left');
    } else if (step.type === 'rotate-right') {
      const targetId = step.highlightedNodes[0] || '';
      stateRoot = applyRotationAt(stateRoot, targetId, 'right');
    }
    snapshots.push(cloneTree(stateRoot));
  });

  return snapshots;
}

/**
 * Build snapshots for remove operation
 */
export function buildRemoveSnapshots(
  rootCopy: AVLTreeNode | null,
  steps: AnimationStep[],
  value: number
): Array<AVLTreeNode | null> {
  const snapshots: Array<AVLTreeNode | null> = [];
  let stateRoot = cloneTree(rootCopy);

  // Initial state
  snapshots.push(cloneTree(stateRoot));

  // Apply each step
  steps.forEach(step => {
    if (step.type === 'remove-node') {
      stateRoot = removeLeafWithoutBalance(stateRoot, value);
    } else if (step.type === 'rotate-left') {
      const targetId = step.highlightedNodes[0] || '';
      stateRoot = applyRotationAt(stateRoot, targetId, 'left');
    } else if (step.type === 'rotate-right') {
      const targetId = step.highlightedNodes[0] || '';
      stateRoot = applyRotationAt(stateRoot, targetId, 'right');
    }
    snapshots.push(cloneTree(stateRoot));
  });

  return snapshots;
}
