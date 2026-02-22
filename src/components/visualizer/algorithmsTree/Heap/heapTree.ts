import { type BTNode, type NodePosition, calculateBTPositions, btToReactFlow } from '../BinaryTree/binaryTree';

export type HeapNode = BTNode;

// Re-export BT rendering utilities for heap
export { calculateBTPositions as calculateHeapPositions, btToReactFlow as heapToReactFlow };

// ── Helpers ──────────────────────────────────────────────────────

export function cloneHeap(root: HeapNode | null): HeapNode | null {
    if (!root) return null;
    return JSON.parse(JSON.stringify(root)) as HeapNode;
}

/** BFS collect all nodes in level-order */
function collectBFS(root: HeapNode | null): HeapNode[] {
    if (!root) return [];
    const result: HeapNode[] = [];
    const queue: HeapNode[] = [root];
    while (queue.length > 0) {
        const cur = queue.shift()!;
        result.push(cur);
        if (cur.left) queue.push(cur.left);
        if (cur.right) queue.push(cur.right);
    }
    return result;
}

/** Find a node by id and return it + its parent */
function findWithParent(
    root: HeapNode,
    targetId: string
): { node: HeapNode; parent: HeapNode | null; dir: 'left' | 'right' | null } | null {
    if (root.id === targetId) return { node: root, parent: null, dir: null };
    const queue: Array<{ node: HeapNode; parent: HeapNode; dir: 'left' | 'right' }> = [];
    if (root.left) queue.push({ node: root.left, parent: root, dir: 'left' });
    if (root.right) queue.push({ node: root.right, parent: root, dir: 'right' });
    while (queue.length > 0) {
        const cur = queue.shift()!;
        if (cur.node.id === targetId) return cur;
        if (cur.node.left) queue.push({ node: cur.node.left, parent: cur.node, dir: 'left' });
        if (cur.node.right) queue.push({ node: cur.node.right, parent: cur.node, dir: 'right' });
    }
    return null;
}

/** Get the last node (rightmost in last level) and its parent */
function getLastNode(root: HeapNode): { node: HeapNode; parent: HeapNode | null; dir: 'left' | 'right' | null } {
    const nodes = collectBFS(root);
    const lastNode = nodes[nodes.length - 1];
    if (lastNode.id === root.id) return { node: lastNode, parent: null, dir: null };
    return findWithParent(root, lastNode.id)!;
}

// ── Sift Operations ──────────────────────────────────────────────

function shouldSwap(parentVal: number, childVal: number, isMinHeap: boolean): boolean {
    return isMinHeap ? childVal < parentVal : childVal > parentVal;
}

/** Sift up: swap node with parent until heap property is restored. Returns array of swap paths (ids). */
function siftUp(root: HeapNode, nodeId: string, isMinHeap: boolean): string[] {
    const swaps: string[] = [];
    let cur = findWithParent(root, nodeId);
    while (cur && cur.parent) {
        if (shouldSwap(cur.parent.value, cur.node.value, isMinHeap)) {
            // Swap values (keep structure)
            const tmpVal = cur.parent.value;
            const tmpId = cur.parent.id;
            cur.parent.value = cur.node.value;
            cur.parent.id = cur.node.id;
            cur.node.value = tmpVal;
            cur.node.id = tmpId;
            swaps.push(cur.parent.id);
            // Continue from the parent position (which now has our value)
            cur = findWithParent(root, cur.parent.id);
        } else {
            break;
        }
    }
    return swaps;
}

/** Sift down: swap node with smallest/largest child until heap property is restored. Returns swap paths. */
function siftDown(root: HeapNode, nodeId: string, isMinHeap: boolean): string[] {
    const swaps: string[] = [];
    let curFind = findWithParent(root, nodeId);
    if (!curFind) return swaps;

    let cur = curFind.node;
    while (true) {
        let target = cur;
        if (cur.left && shouldSwap(target.value, cur.left.value, isMinHeap)) {
            target = cur.left;
        }
        if (cur.right && shouldSwap(target.value, cur.right.value, isMinHeap)) {
            target = cur.right;
        }
        if (target === cur) break;

        // Swap values
        const tmpVal = cur.value;
        const tmpId = cur.id;
        cur.value = target.value;
        cur.id = target.id;
        target.value = tmpVal;
        target.id = tmpId;
        swaps.push(cur.id);

        // Follow the swapped-down node
        cur = target;
    }
    return swaps;
}

// ── Public Operations ────────────────────────────────────────────

/** Insert a value into the heap. Returns {root, insertedId, path (BFS placement), siftPath (sift-up swaps)} */
export function insertHeap(
    root: HeapNode | null,
    value: number,
    nodeId: string,
    isMinHeap: boolean
): { root: HeapNode; insertedId: string; path: string[]; siftPath: string[] } {
    const newNode: HeapNode = { id: nodeId, value, left: null, right: null };
    if (!root) {
        return { root: newNode, insertedId: nodeId, path: [], siftPath: [] };
    }

    // BFS to find first empty spot
    const path: string[] = [];
    const queue: HeapNode[] = [root];
    let parentNode: HeapNode | null = null;
    let dir: 'left' | 'right' = 'left';

    while (queue.length > 0) {
        const cur = queue.shift()!;
        path.push(cur.id);
        if (!cur.left) {
            parentNode = cur;
            dir = 'left';
            break;
        }
        queue.push(cur.left);
        if (!cur.right) {
            parentNode = cur;
            dir = 'right';
            break;
        }
        queue.push(cur.right);
    }

    if (parentNode) {
        if (dir === 'left') parentNode.left = newNode;
        else parentNode.right = newNode;
    }

    // Sift up
    const siftPath = siftUp(root, nodeId, isMinHeap);

    return { root, insertedId: nodeId, path, siftPath };
}

/** Remove a value from the heap. Returns { root, siftPath, lastNodeId, removedId } for animation. */
export function removeHeap(
    root: HeapNode | null,
    value: number,
    isMinHeap: boolean
): { root: HeapNode | null; siftPath: string[]; lastNodeId: string | null; removedId: string | null } {
    if (!root) return { root: null, siftPath: [], lastNodeId: null, removedId: null };

    // Find node with value
    const nodes = collectBFS(root);
    const targetNode = nodes.find(n => n.value === value);
    if (!targetNode) return { root, siftPath: [], lastNodeId: null, removedId: null };

    const removedId = targetNode.id;

    // If only one node
    if (nodes.length === 1) return { root: null, siftPath: [], lastNodeId: null, removedId };

    // Get last node
    const last = getLastNode(root);
    const lastNodeId = last.node.id;

    // Remove last node from tree
    if (last.parent && last.dir) {
        if (last.dir === 'left') last.parent.left = null;
        else last.parent.right = null;
    }

    // Replace target's value with last node's value/id to retain visual node for animation
    let siftPath: string[] = [];
    if (targetNode.id !== last.node.id) {
        targetNode.value = last.node.value;
        targetNode.id = last.node.id;

        // Sift down from target position
        siftPath = siftDown(root, targetNode.id, isMinHeap);
        // Also try sift up in case replacement is smaller (min-heap) or larger (max-heap) than parent
        const upPath = siftUp(root, targetNode.id, isMinHeap);
        if (upPath.length > 0) siftPath = upPath;
    }

    return { root, siftPath, lastNodeId, removedId };
}

/** Search for a value using BFS. Returns {found, nodeId, path} */
export function searchHeap(
    root: HeapNode | null,
    value: number
): { found: boolean; nodeId?: string; path: string[] } {
    if (!root) return { found: false, path: [] };
    const path: string[] = [];
    const queue: HeapNode[] = [root];
    while (queue.length > 0) {
        const cur = queue.shift()!;
        path.push(cur.id);
        if (cur.value === value) return { found: true, nodeId: cur.id, path };
        if (cur.left) queue.push(cur.left);
        if (cur.right) queue.push(cur.right);
    }
    return { found: false, path };
}
