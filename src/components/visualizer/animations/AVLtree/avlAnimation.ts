import { AVLTreeNode } from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";

export interface AnimationStep {
    type: 'traverse' | 'insert-node' | 'remove-node' | 'check-balance' | 'rotate-left' | 'rotate-right' | 'complete';
    description: string;
    highlightedNodes: string[];
    highlightedEdges: string[];
    highlightColor?: string;
    edgeColor?: string;
    treeSnapshot?: AVLTreeNode | null;
}

/**
 * Animation recorder - tracks all steps during insertion
 */
export class AVLAnimationRecorder {
    private steps: AnimationStep[] = [];

    private prevNodeId: string | null = null;

    /**
     * Record a traversal step (going down the tree to find position)
     */
    recordTraverse(nodeId: string, value: number, direction: 'left' | 'right' | 'here') {
        const directionText = direction === 'left' ? '← left' : direction === 'right' ? '→ right' : '';
        const highlightedEdges = this.prevNodeId ? [`edge-${this.prevNodeId}-${nodeId}`] : [];

        this.steps.push({
            type: 'traverse',
            description: `Traversing ${directionText} from node ${nodeId} (looking for ${value})`,
            highlightedNodes: [nodeId],
            highlightedEdges,
            highlightColor: 'blue',
            edgeColor: '#F7AD45',
        });

        this.prevNodeId = nodeId;
    }

    /**
     * Record found parent
     */
    recordFoundParent(parentId: string, value: number, direction: 'left' | 'right') {
        const dirLabel = direction === 'left' ? 'left' : 'right';
        this.steps.push({
            type: 'traverse', // Reuse traverse type for animation loop compatibility if no specific 'found-parent' handler exists, or add it if needed.
            description: `Found parent node ${parentId} → will insert ${value} as ${dirLabel} child`,
            highlightedNodes: [parentId],
            highlightedEdges: [],
            highlightColor: 'yellow',
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
        this.prevNodeId = null;
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
        this.prevNodeId = null;
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
        this.prevNodeId = null;
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
        this.prevNodeId = null;
    }
}
