import { AVLTreeNode } from "./avlTree";

export interface AnimationStep {
    type: 'traverse' | 'insert-node' | 'remove-node' | 'check-balance' | 'rotate-left' | 'rotate-right' | 'complete';
    description: string;
    highlightedNodes: string[];
    highlightedEdges: string[];
    highlightColor?: 'blue' | 'yellow' | 'red' | 'green';
    treeSnapshot?: AVLTreeNode | null;
}

/**
 * Animation recorder - tracks all steps during insertion
 */
export class AVLAnimationRecorder {
    private steps: AnimationStep[] = [];

    /**
     * Record a traversal step (going down the tree to find position)
     */
    recordTraverse(nodeId: string, value: number, direction: 'left' | 'right' | 'here') {
        const directionText = direction === 'left' ? '← left' : direction === 'right' ? '→ right' : '';
        this.steps.push({
            type: 'traverse',
            description: `Traversing ${directionText} from node ${nodeId} (looking for ${value})`,
            highlightedNodes: [nodeId],
            highlightedEdges: [],
            highlightColor: 'blue',
        });
    }

    /**
     * Record node insertion
     */
    recordInsert(nodeId: string, value: number) {
        this.steps.push({
            type: 'insert-node',
            description: `✓ Inserted node ${nodeId} with value ${value}`,
            highlightedNodes: [nodeId],
            highlightedEdges: [],
            highlightColor: 'green',
        });
    }

    /**
     * Record node removal
     */
    recordRemove(nodeId: string, value: number) {
        this.steps.push({
            type: 'remove-node',
            description: `✖ Removed node ${nodeId} with value ${value}`,
            highlightedNodes: [nodeId],
            highlightedEdges: [],
            highlightColor: 'red',
        });
    }

    /**
     * Record balance check
     */
    recordBalanceCheck(nodeId: string, balanceFactor: number) {
        let status = 'Balanced ✓';
        let color: 'blue' | 'yellow' | 'red' | 'green' = 'blue';
        
        if (balanceFactor < -1 || balanceFactor > 1) {
            status = `Unbalanced! Balance factor: ${balanceFactor}`;
            color = 'red';
        } else if (balanceFactor !== 0) {
            status = `Slightly tilted (balance: ${balanceFactor})`;
            color = 'yellow';
        }
        
        this.steps.push({
            type: 'check-balance',
            description: `Checking node ${nodeId}: ${status}`,
            highlightedNodes: [nodeId],
            highlightedEdges: [],
            highlightColor: color,
        });
    }

    /**
     * Record left rotation
     */
    recordLeftRotation(nodeId: string, rightChild: string) {
        this.steps.push({
            type: 'rotate-left',
            description: `⟲ Left rotating at node ${nodeId} (moved ${rightChild} up)`,
            highlightedNodes: [nodeId, rightChild],
            highlightedEdges: [`edge-${nodeId}-${rightChild}`],
            highlightColor: 'red',
        });
    }

    /**
     * Record right rotation
     */
    recordRightRotation(nodeId: string, leftChild: string) {
        this.steps.push({
            type: 'rotate-right',
            description: `⟳ Right rotating at node ${nodeId} (moved ${leftChild} up)`,
            highlightedNodes: [nodeId, leftChild],
            highlightedEdges: [`edge-${nodeId}-${leftChild}`],
            highlightColor: 'red',
        });
    }

    /**
     * Record completion
     */
    recordComplete(value: number) {
        this.steps.push({
            type: 'complete',
            description: `✓✓✓ Insertion of ${value} complete and balanced!`,
            highlightedNodes: [],
            highlightedEdges: [],
            highlightColor: 'green',
        });
    }

    /**
     * Get all recorded steps
     */
    getSteps(): AnimationStep[] {
        return [...this.steps];
    }

    /**
     * Clear all steps
     */
    clear() {
        this.steps = [];
    }
}
