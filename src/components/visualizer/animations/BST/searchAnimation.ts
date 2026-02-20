import type { Node as RFNode } from '@xyflow/react';
import type { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/AVLtree/insertAnimation';
import {
  searchBST,
  calculateBSTPositions,
  bstToReactFlow,
  type BSTNode,
} from '@/src/components/visualizer/algorithmsTree/BST/bstTree';

export function animateBSTSearch(
  currentRoot: BSTNode | null,
  value: number,
  currentRFNodes: RFNode[],
  animationSpeed: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void
): void {
  if (!currentRoot) {
    callbacks.setDescription('Tree is empty');
    return;
  }

  const { found, path } = searchBST(currentRoot, value);

  path.forEach((nodeId, idx) => {
    controller.scheduleStep(() => {
      const pos = calculateBSTPositions(currentRoot);
      const { nodes, edges } = bstToReactFlow(currentRoot, [], [], pos);
      const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
        nodes, edges, new Set([nodeId]), new Set(), 'blue'
      );
      callbacks.setNodes(highlightedNodes);
      callbacks.setEdges(highlightedEdges);
      callbacks.setDescription(`Searching... visiting node ${nodeId}`);
    }, animationSpeed * (idx + 1));
  });

  const timeOffset = path.length + 1;

  controller.scheduleStep(() => {
    const pos = calculateBSTPositions(currentRoot);
    const { nodes, edges } = bstToReactFlow(currentRoot, [], [], pos);

    if (found) {
      const targetId = path[path.length - 1];
      const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
        nodes, edges, new Set([targetId]), new Set(), 'green'
      );
      callbacks.setNodes(highlightedNodes);
      callbacks.setEdges(highlightedEdges);
      callbacks.setDescription(`✓ Found node ${value}!`);
    } else {
      callbacks.setNodes(nodes);
      callbacks.setEdges(edges);
      callbacks.setDescription(`✗ Value ${value} not found`);
    }

    controller.scheduleStep(() => {
      callbacks.setDescription('');
      onComplete();
    }, animationSpeed * 2);
  }, animationSpeed * timeOffset);
}
