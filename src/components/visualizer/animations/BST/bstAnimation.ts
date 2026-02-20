export interface BSTAnimationStep {
  type: 'traverse' | 'found-parent' | 'insert-node' | 'remove-node' | 'complete';
  description: string;
  highlightedNodes: string[];
  highlightedEdges: string[];
  highlightColor?: string;
  edgeColor?: string;
}

export class BSTAnimationRecorder {
  private steps: BSTAnimationStep[] = [];
  private prevNodeId: string | null = null;

  recordTraverse(nodeId: string, value: number, direction: 'left' | 'right' | 'here') {
    const dirLabel =
      direction === 'left' ? '← left' :
        direction === 'right' ? '→ right' : '';

    const highlightedEdges = this.prevNodeId
      ? [`edge-${this.prevNodeId}-${nodeId}`]
      : [];

    this.steps.push({
      type: 'traverse',
      description: `Comparing ${value} at node ${nodeId}, go ${dirLabel}`,
      highlightedNodes: [nodeId],
      highlightedEdges,
      highlightColor: 'blue', // → '#62A2F7'
      edgeColor: '#F7AD45',
    });

    this.prevNodeId = nodeId;
  }

  recordFoundParent(parentId: string, value: number, direction: 'left' | 'right') {
    const dirLabel = direction === 'left' ? 'left' : 'right';
    this.steps.push({
      type: 'found-parent',
      description: `Found parent node ${parentId} → will insert ${value} as ${dirLabel} child`,
      highlightedNodes: [parentId],
      highlightedEdges: [],
      highlightColor: 'yellow', // → '#FBBF24'
    });
  }

  recordInsert(nodeId: string, value: number) {
    this.steps.push({
      type: 'insert-node',
      description: `✓ Inserted node with value ${value}`,
      highlightedNodes: [nodeId],
      highlightedEdges: [],
      highlightColor: 'green', // → '#22C55E'
    });
    this.prevNodeId = null;
  }

  recordRemove(nodeId: string, value: number) {
    this.steps.push({
      type: 'remove-node',
      description: `✖ Removed node ${nodeId} with value ${value}`,
      highlightedNodes: [nodeId],
      highlightedEdges: [],
      highlightColor: 'red', // → '#EF4444'
    });
    this.prevNodeId = null;
  }

  recordComplete(value: number) {
    this.steps.push({
      type: 'complete',
      description: `✓ Operation on ${value} complete!`,
      highlightedNodes: [],
      highlightedEdges: [],
      highlightColor: 'green',
    });
    this.prevNodeId = null;
  }

  getSteps(): BSTAnimationStep[] {
    return [...this.steps];
  }

  clear() {
    this.steps = [];
    this.prevNodeId = null;
  }
}