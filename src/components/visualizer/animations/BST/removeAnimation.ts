import type { Node as RFNode } from '@xyflow/react';
import type { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/AVLtree/insertAnimation';
import {
  cloneBSTTree,
  removeBSTWithAnimation,
  searchBST,
  calculateBSTPositions,
  bstToReactFlow,
  type BSTNode,
} from '@/src/components/visualizer/algorithmsTree/BST/bstTree';

//  Finalize 

function finalizeRemove(
  finalRoot: BSTNode | null,
  animationSpeed: number,
  timeOffset: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void
): void {
  controller.scheduleStep(() => {
    const positions = calculateBSTPositions(finalRoot);
    const { nodes, edges } = bstToReactFlow(finalRoot, [], [], positions);

    callbacks.setNodes(nodes);
    callbacks.setEdges(edges);
    callbacks.setDescription('Removal complete!');

    controller.scheduleStep(() => {
      callbacks.setDescription('');
      onComplete();
    }, animationSpeed * 2);
  }, animationSpeed * timeOffset);
}

//  Public 

export function animateBSTRemove(
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
    onComplete();
    return;
  }

  const { found, path } = searchBST(currentRoot, value);
  if (!found) {
    callbacks.setDescription(`Value ${value} not found`);
    onComplete();
    return;
  }

  const timeOffset = path.length + 1;

  //  Step 1: Animate ทีละ node ตาม path 
  path.forEach((nodeId, idx) => {
    controller.scheduleStep(() => {
      const pos = calculateBSTPositions(currentRoot);
      const { nodes, edges } = bstToReactFlow(currentRoot, [], [], pos);
      const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
        nodes, edges, new Set([nodeId]), new Set(), 'blue'
      );
      callbacks.setNodes(highlightedNodes);
      callbacks.setEdges(highlightedEdges);
      callbacks.setDescription(`Searching for ${value}... visiting ${nodeId}`);
    }, animationSpeed * (idx + 1));
  });

  //  Step 2: Highlight โหนดที่จะลบเลย 
  const targetId = path[path.length - 1];

  controller.scheduleStep(() => {
    const pos = calculateBSTPositions(currentRoot);
    const { nodes, edges } = bstToReactFlow(currentRoot, [], [], pos);
    const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
      nodes, edges, new Set([targetId]), new Set(), 'red'
    );
    callbacks.setNodes(highlightedNodes);
    callbacks.setEdges(highlightedEdges);
    callbacks.setDescription(`Found node ${value}! Removing...`);
  }, animationSpeed * timeOffset);

  //  Step 3: แสดงโครงสร้างหลังลบ (BST ไม่มี rebalance) 
  const afterDelete = cloneBSTTree(currentRoot);
  removeBSTWithAnimation(afterDelete, value);

  controller.scheduleStep(() => {
    const pos = calculateBSTPositions(afterDelete);
    const { nodes, edges } = bstToReactFlow(afterDelete, [], [], pos);
    callbacks.setNodes(nodes);
    callbacks.setEdges(edges);
    callbacks.setDescription('Node removed.');
  }, animationSpeed * (timeOffset + 1));

  //  Finalize 
  finalizeRemove(afterDelete, animationSpeed, timeOffset + 2, controller, callbacks, onComplete);
}
