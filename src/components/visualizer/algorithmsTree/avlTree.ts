/**
 * AVL Tree Node for insertion and balancing operations
 */
export interface AVLTreeNode {
    id: string;
    value: number;
    left: AVLTreeNode | null;
    right: AVLTreeNode | null;
    height: number;
}

/**
 * Position for rendering node in the canvas
 */
export interface NodePosition {
    x: number;
    y: number;
}

/**
 * Animation recorder interface (imported from avlAnimation)
 */
export interface AnimationRecorder {
    recordTraverse?: (nodeId: string, value: number, direction: "left" | "right" | "here") => void;
    recordFoundParent?: (parentId: string, value: number, direction: 'left' | 'right') => void;
    recordInsert?: (nodeId: string, value: number) => void;
    recordBalanceCheck?: (nodeId: string, balanceFactor: number) => void;
    recordLeftRotation?: (nodeId: string, rightChild: string) => void;
    recordRightRotation?: (nodeId: string, leftChild: string) => void;
    recordRemove?: (nodeId: string, value: number) => void;
    recordComplete?: (value: number) => void;
}

/**
 * Calculate height of node
 */
export function getHeight(node: AVLTreeNode | null): number {
    return node === null ? 0 : node.height;
}

/**
 * Calculate balance factor of node
 */
export function getBalanceFactor(node: AVLTreeNode | null): number {
    return node === null ? 0 : getHeight(node.left) - getHeight(node.right);
}

/**
 * Update node height based on children heights
 */
export function updateHeight(node: AVLTreeNode): void {
    node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
}

/**
 * Right rotation
 */
export function rotateRight(z: AVLTreeNode): AVLTreeNode {
    const y = z.left;
    if (y === null) return z;

    const T3 = y.right;

    // Perform rotation
    y.right = z;
    z.left = T3;

    // Update heights
    updateHeight(z);
    updateHeight(y);

    return y;
}

/**
 * Left rotation
 */
export function rotateLeft(z: AVLTreeNode): AVLTreeNode {
    const y = z.right;
    if (y === null) return z;

    const T2 = y.left;

    // Perform rotation
    y.left = z;
    z.right = T2;

    // Update heights
    updateHeight(z);
    updateHeight(y);

    return y;
}

/**
 * Insert a new value into AVL tree with animation recording
 */
export function insertAVLWithAnimation(
    root: AVLTreeNode | null,
    value: number,
    nodeId: string,
    recorder?: AnimationRecorder
): AVLTreeNode {
    return insertAVLInternal(root, value, nodeId, recorder);
}

/**
 * Internal recursive insertion with animation support
 */
function insertAVLInternal(
    root: AVLTreeNode | null,
    value: number,
    nodeId: string,
    recorder?: AnimationRecorder,
    parent?: AVLTreeNode | null,
    parentDir?: 'left' | 'right'
): AVLTreeNode {
    // Step 1: Perform normal BST insertion
    if (root === null) {
        if (parent && parentDir) {
            recorder?.recordFoundParent?.(parent.id, value, parentDir);
        }
        recorder?.recordInsert?.(nodeId, value);
        return {
            id: nodeId,
            value,
            left: null,
            right: null,
            height: 1,
        };
    }

    // Traverse and record
    if (value < root.value) {
        recorder?.recordTraverse?.(root.id, value, 'left');
        const newId = nodeId || `node_${Date.now()}_left`;
        root.left = insertAVLInternal(root.left, value, newId, recorder, root, 'left');
    } else if (value > root.value) {
        recorder?.recordTraverse?.(root.id, value, 'right');
        const newId = nodeId || `node_${Date.now()}_right`;
        root.right = insertAVLInternal(root.right, value, newId, recorder, root, 'right');
    } else {
        // Duplicate values not allowed
        return root;
    }

    // Step 2: Update height of current node
    updateHeight(root);

    // Step 3: Get balance factor and record check
    const balance = getBalanceFactor(root);
    recorder?.recordBalanceCheck?.(root.id, balance);

    // Step 4: If unbalanced, there are 4 cases

    // Left Left Case
    if (balance > 1 && value < (root.left?.value ?? Infinity)) {
        recorder?.recordRightRotation?.(root.id, root.left?.id ?? '');
        return rotateRight(root);
    }

    // Right Right Case
    if (balance < -1 && value > (root.right?.value ?? -Infinity)) {
        recorder?.recordLeftRotation?.(root.id, root.right?.id ?? '');
        return rotateLeft(root);
    }

    // Left Right Case
    if (balance > 1 && value > (root.left?.value ?? Infinity)) {
        if (root.left !== null) {
            recorder?.recordLeftRotation?.(root.left.id, root.left.right?.id ?? '');
            root.left = rotateLeft(root.left);
        }
        recorder?.recordRightRotation?.(root.id, root.left?.id ?? '');
        return rotateRight(root);
    }

    // Right Left Case
    if (balance < -1 && value < (root.right?.value ?? -Infinity)) {
        if (root.right !== null) {
            recorder?.recordRightRotation?.(root.right.id, root.right.left?.id ?? '');
            root.right = rotateRight(root.right);
        }
        recorder?.recordLeftRotation?.(root.id, root.right?.id ?? '');
        return rotateLeft(root);
    }

    // Return root (unchanged)
    return root;
}

/**
 * Insert a new value into AVL tree and return root
 */
export function insertAVL(
    root: AVLTreeNode | null,
    value: number,
    nodeId: string
): AVLTreeNode {
    return insertAVLInternal(root, value, nodeId);
}

/**
 * Search for a value in the AVL tree.
 * Returns an object with found:boolean, node (if found) and path (ids traversed)
 */
export function searchAVL(root: AVLTreeNode | null, value: number): { found: boolean; node?: AVLTreeNode; nodeId?: string; path: string[] } {
    const path: string[] = [];
    let cur = root;
    while (cur) {
        path.push(cur.id);
        if (value === cur.value) {
            return { found: true, node: cur, nodeId: cur.id, path };
        }
        cur = value < cur.value ? cur.left : cur.right;
    }
    return { found: false, path };
}

/**
 * Get node with minimum value in subtree
 */
function getMinNode(node: AVLTreeNode | null): AVLTreeNode | null {
    if (!node) return null;
    let cur = node;
    while (cur.left) cur = cur.left;
    return cur;
}

/**
 * Internal removal with optional recorder
 */
function removeAVLInternal(root: AVLTreeNode | null, value: number, recorder?: AnimationRecorder): AVLTreeNode | null {
    if (root === null) return null;

    if (value < root.value) {
        recorder?.recordTraverse?.(root.id, value, 'left');
        root.left = removeAVLInternal(root.left, value, recorder);
    } else if (value > root.value) {
        recorder?.recordTraverse?.(root.id, value, 'right');
        root.right = removeAVLInternal(root.right, value, recorder);
    } else {
        // found node to remove
        recorder?.recordRemove?.(root.id, root.value as number);

        // node with only one child or no child
        if (root.left === null) {
            return root.right;
        } else if (root.right === null) {
            return root.left;
        }

        // node with two children: get inorder successor (smallest in the right)
        const temp = getMinNode(root.right);
        if (temp) {
            // Copy the inorder successor's value to this node
            root.value = temp.value;
            // Delete the inorder successor
            root.right = removeAVLInternal(root.right, temp.value, recorder);
        }
    }

    // If the tree had only one node
    if (root === null) return null;

    // Update height
    updateHeight(root);

    // Get balance factor
    const balance = getBalanceFactor(root);
    recorder?.recordBalanceCheck?.(root.id, balance);

    // Balance cases
    // Left Left
    if (balance > 1 && getBalanceFactor(root.left) >= 0) {
        recorder?.recordRightRotation?.(root.id, root.left?.id ?? '');
        return rotateRight(root);
    }

    // Left Right
    if (balance > 1 && getBalanceFactor(root.left) < 0) {
        if (root.left) {
            recorder?.recordLeftRotation?.(root.left.id, root.left.right?.id ?? '');
            root.left = rotateLeft(root.left);
        }
        recorder?.recordRightRotation?.(root.id, root.left?.id ?? '');
        return rotateRight(root);
    }

    // Right Right
    if (balance < -1 && getBalanceFactor(root.right) <= 0) {
        recorder?.recordLeftRotation?.(root.id, root.right?.id ?? '');
        return rotateLeft(root);
    }

    // Right Left
    if (balance < -1 && getBalanceFactor(root.right) > 0) {
        if (root.right) {
            recorder?.recordRightRotation?.(root.right.id, root.right.left?.id ?? '');
            root.right = rotateRight(root.right);
        }
        recorder?.recordLeftRotation?.(root.id, root.right?.id ?? '');
        return rotateLeft(root);
    }

    return root;
}

/**
 * Public remove function (non-animated)
 */
export function removeAVL(root: AVLTreeNode | null, value: number): AVLTreeNode | null {
    return removeAVLInternal(root, value);
}

/**
 * Remove with animation recording
 */
export function removeAVLWithAnimation(root: AVLTreeNode | null, value: number, recorder?: AnimationRecorder): AVLTreeNode | null {
    return removeAVLInternal(root, value, recorder);
}

/**
 * Simple BST insert (no rebalance) — produces the "before rotation" snapshot
 */
function insertBSTOnly(root: AVLTreeNode | null, value: number, nodeId: string): AVLTreeNode {
    if (root === null) {
        return { id: nodeId, value, left: null, right: null, height: 1 };
    }
    if (value < root.value) {
        root.left = insertBSTOnly(root.left, value, nodeId);
    } else if (value > root.value) {
        root.right = insertBSTOnly(root.right, value, nodeId);
    }
    updateHeight(root);
    return root;
}

/**
 * Detect what rotation (if any) would occur at a given node
 */
function detectRotation(root: AVLTreeNode | null): { type: string | null; nodeId: string | null } {
    if (!root) return { type: null, nodeId: null };

    const balance = getBalanceFactor(root);

    if (balance > 1 && root.left && getBalanceFactor(root.left) >= 0) {
        return { type: 'LL (Right Rotation)', nodeId: root.id };
    }
    if (balance > 1 && root.left && getBalanceFactor(root.left) < 0) {
        return { type: 'LR (Left-Right Rotation)', nodeId: root.id };
    }
    if (balance < -1 && root.right && getBalanceFactor(root.right) <= 0) {
        return { type: 'RR (Left Rotation)', nodeId: root.id };
    }
    if (balance < -1 && root.right && getBalanceFactor(root.right) > 0) {
        return { type: 'RL (Right-Left Rotation)', nodeId: root.id };
    }

    // Check children recursively
    const leftResult = detectRotation(root.left);
    if (leftResult.type) return leftResult;
    return detectRotation(root.right);
}

/**
 * Insert with intermediate steps for animation:
 * 1. afterInsert: BST insert only (no rebalance)
 * 2. rotationType + rotationNodeId: what rotation occurs
 * 3. afterRebalance: final balanced tree
 */
export function insertAVLWithSteps(
    root: AVLTreeNode | null,
    value: number,
    nodeId: string
): {
    afterInsert: AVLTreeNode;
    rotationType: string | null;
    rotationNodeId: string | null;
    afterRebalance: AVLTreeNode;
} {
    // Phase 1: BST-only insert (clone first)
    const bstClone = root ? JSON.parse(JSON.stringify(root)) : null;
    const afterInsert = insertBSTOnly(bstClone, value, nodeId);

    // Detect rotation needed
    const { type: rotationType, nodeId: rotationNodeId } = detectRotation(afterInsert);

    // Phase 2: Full AVL insert (clone original)
    const avlClone = root ? JSON.parse(JSON.stringify(root)) : null;
    const afterRebalance = insertAVL(avlClone, value, nodeId);

    return { afterInsert, rotationType, rotationNodeId, afterRebalance };
}

/**
 * Simple BST delete (no rebalance) — produces the "before rotation" snapshot
 */
function removeBSTOnly(root: AVLTreeNode | null, value: number): { root: AVLTreeNode | null; successorId: string | null } {
    if (!root) return { root: null, successorId: null };
    let successorId: string | null = null;

    if (value < root.value) {
        const result = removeBSTOnly(root.left, value);
        root.left = result.root;
        successorId = result.successorId;
    } else if (value > root.value) {
        const result = removeBSTOnly(root.right, value);
        root.right = result.root;
        successorId = result.successorId;
    } else {
        if (!root.left) return { root: root.right, successorId: null };
        if (!root.right) return { root: root.left, successorId: null };

        const successor = getMinNode(root.right);
        if (successor) {
            successorId = successor.id;
            root.value = successor.value;
            const result = removeBSTOnly(root.right, successor.value);
            root.right = result.root;
        }
    }

    if (root) updateHeight(root);
    return { root, successorId };
}

/**
 * Remove with intermediate steps for animation:
 * 1. successorId: inorder successor (if 2-child case)
 * 2. afterRemove: tree after BST delete (before rebalance)
 * 3. rotationType + rotationNodeId
 * 4. afterRebalance: final balanced tree
 */
export function removeAVLWithSteps(
    root: AVLTreeNode | null,
    value: number
): {
    successorId: string | null;
    afterRemove: AVLTreeNode | null;
    rotationType: string | null;
    rotationNodeId: string | null;
    afterRebalance: AVLTreeNode | null;
} {
    // Phase 1: BST-only remove (clone first)
    const bstClone = root ? JSON.parse(JSON.stringify(root)) : null;
    const { root: afterRemove, successorId } = removeBSTOnly(bstClone, value);

    // Detect rotation needed
    const { type: rotationType, nodeId: rotationNodeId } = detectRotation(afterRemove);

    // Phase 2: Full AVL remove (clone original)
    const avlClone = root ? JSON.parse(JSON.stringify(root)) : null;
    const afterRebalance = removeAVL(avlClone, value);

    return { successorId, afterRemove, rotationType, rotationNodeId, afterRebalance };
}

/**
 * Calculate optimal positions for AVL tree nodes (level-order spacing)
 */
export function calculateTreePositions(
    root: AVLTreeNode | null,
    positions: Map<string, NodePosition> = new Map()
): Map<string, NodePosition> {
    if (root === null) return positions;

    // Use inorder layout so nodes spread horizontally; spacing grows with node count
    const totalNodes = getTreeNodesArray(root).length;
    const gap = Math.max(60, 80 + totalNodes * 8);
    const verticalGap = 100;

    let idx = 0;
    function inorder(node: AVLTreeNode | null, depth: number) {
        if (!node) return;
        inorder(node.left, depth + 1);
        const px = idx * gap;
        const py = depth * verticalGap;
        positions.set(node.id, { x: px, y: py });
        idx++;
        inorder(node.right, depth + 1);
    }

    inorder(root, 0);
    return positions;
}

/**
 * ReactFlow Node type
 */
interface ReactFlowNode {
    id: string;
    type: string;
    data: {
        label: string;
        variant: string;
        balanceFactor?: number;
    };
    position: NodePosition;
}

/**
 * ReactFlow Edge type
 */
interface ReactFlowEdge {
    id: string;
    source: string;
    target: string;
    type: string;
    sourceHandle?: string;
    targetHandle?: string;
}

/**
 * Convert AVL tree to ReactFlow nodes and edges
 */
export function avlTreeToReactFlow(
    root: AVLTreeNode | null,
    nodes: ReactFlowNode[] = [],
    edges: ReactFlowEdge[] = [],
    positions: Map<string, NodePosition> = new Map(),
    showAVLBalance: boolean = true
): { nodes: ReactFlowNode[]; edges: ReactFlowEdge[] } {
    if (root === null) return { nodes, edges };

    const position = positions.get(root.id) || { x: 0, y: 0 };

    // Add node
    nodes.push({
        id: root.id,
        type: "custom",
        data: {
            label: root.value.toString(),
            variant: "circle",
            balanceFactor: showAVLBalance ? getBalanceFactor(root) : undefined
        },
        position,
    });

    // Process left subtree
    if (root.left !== null) {
        const leftPosition = positions.get(root.left.id);
        if (leftPosition) {
            edges.push({
                id: `edge-${root.id}-${root.left.id}`,
                source: root.id,
                sourceHandle: "source-bottom-left",
                target: root.left.id,
                targetHandle: "target-top-right",
                type: "straight",
            });
            avlTreeToReactFlow(root.left, nodes, edges, positions, showAVLBalance);
        }
    }

    // Process right subtree
    if (root.right !== null) {
        const rightPosition = positions.get(root.right.id);
        if (rightPosition) {
            edges.push({
                id: `edge-${root.id}-${root.right.id}`,
                source: root.id,
                sourceHandle: "source-bottom-right",
                target: root.right.id,
                targetHandle: "target-top-left",
                type: "straight",
            });
            avlTreeToReactFlow(root.right, nodes, edges, positions, showAVLBalance);
        }
    }

    return { nodes, edges };
}

/**
 * Find the insertion position for a value in the tree
 * Returns the node path and where the new node should be placed
 * Does NOT modify the tree
 */
export interface InsertionPosition {
    parentId: string | null;           // Parent node ID where new node will be attached
    position: 'left' | 'right';        // Whether to add to left or right of parent
    parentValue: number | null;        // Value of parent node
    path: string[];                    // Node IDs from root to parent
}

export function findInsertionPosition(
    root: AVLTreeNode | null,
    value: number,
    path: string[] = []
): InsertionPosition {
    // If tree is empty, return null parent (will be root)
    if (root === null) {
        return {
            parentId: null,
            position: 'left',  // Doesn't matter, will be root
            parentValue: null,
            path
        };
    }

    // Found exact match or should go left
    if (value < root.value) {
        if (root.left === null) {
            // Found the spot! Go left here
            return {
                parentId: root.id,
                position: 'left',
                parentValue: root.value,
                path: [...path, root.id]
            };
        }
        // Continue searching left
        return findInsertionPosition(root.left, value, [...path, root.id]);
    }

    // Should go right
    if (value > root.value) {
        if (root.right === null) {
            // Found the spot! Go right here
            return {
                parentId: root.id,
                position: 'right',
                parentValue: root.value,
                path: [...path, root.id]
            };
        }
        // Continue searching right
        return findInsertionPosition(root.right, value, [...path, root.id]);
    }

    // Duplicate value - shouldn't insert
    return {
        parentId: null,
        position: 'left',
        parentValue: null,
        path
    };
}

/**
 * Serialized AVL tree data structure
 */
interface SerializedAVLNode {
    id: string;
    value: number;
    height: number;
    left: SerializedAVLNode | null;
    right: SerializedAVLNode | null;
}

/**
 * Serialize AVL tree to JSON (for storing state)
 */
export function serializeAVLTree(root: AVLTreeNode | null): SerializedAVLNode | null {
    if (root === null) return null;

    return {
        id: root.id,
        value: root.value,
        height: root.height,
        left: serializeAVLTree(root.left),
        right: serializeAVLTree(root.right),
    };
}

/**
 * Deserialize JSON back to AVL tree
 */
export function deserializeAVLTree(data: SerializedAVLNode | null): AVLTreeNode | null {
    if (data === null) return null;

    return {
        id: data.id,
        value: data.value,
        height: data.height,
        left: deserializeAVLTree(data.left),
        right: deserializeAVLTree(data.right),
    };
}

/**
 * Get all nodes in AVL tree as array (in-order traversal)
 */
export function getTreeNodesArray(root: AVLTreeNode | null, result: AVLTreeNode[] = []): AVLTreeNode[] {
    if (root === null) return result;

    getTreeNodesArray(root.left, result);
    result.push(root);
    getTreeNodesArray(root.right, result);

    return result;
}

/**
 * Validate AVL tree structure
 */
export function validateAVLTree(root: AVLTreeNode | null): boolean {
    if (root === null) return true;

    // Check heights are correct
    const leftHeight = getHeight(root.left);
    const rightHeight = getHeight(root.right);
    if (root.height !== Math.max(leftHeight, rightHeight) + 1) {
        return false;
    }

    // Check balance factor is valid
    const balance = getBalanceFactor(root);
    if (Math.abs(balance) > 1) {
        return false;
    }

    // Recursively check subtrees
    return validateAVLTree(root.left) && validateAVLTree(root.right);
}

/**
 * Rebuild AVL tree from ReactFlow nodes to ensure correct structure
 * Extracts values from ReactFlow nodes and rebuilds tree with proper AVL balancing
 */
export function rebuildAVLTreeFromNodes(nodes: Array<{ id: string; data: { label: string } }>): AVLTreeNode | null {
    let root: AVLTreeNode | null = null;

    // Extract values from nodes, sorted by value for optimal tree building
    const values = nodes
        .map(node => ({
            value: parseInt(node.data.label),
            id: node.id
        }))
        .filter(item => !isNaN(item.value))
        .sort((a, b) => a.value - b.value);

    // Rebuild tree by inserting each value in order
    values.forEach(({ value, id }) => {
        root = insertAVL(root, value, id);
    });

    return root;
}

/**
 * Check if ReactFlow tree structure matches AVL structure
 * Returns true if valid, false if needs rebuilding
 */
export function validateTreeStructure(
    reactFlowNodes: Array<{ id: string; data: { label: string } }>,
    currentRoot: AVLTreeNode | null
): boolean {
    // If no ReactFlow nodes, tree should be empty
    if (reactFlowNodes.length === 0) {
        return currentRoot === null;
    }

    // If tree is null but has nodes, invalid
    if (currentRoot === null && reactFlowNodes.length > 0) {
        return false;
    }

    // Validate current tree structure
    return validateAVLTree(currentRoot);
}
