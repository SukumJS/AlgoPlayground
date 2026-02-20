import type { Node as RFNode } from '@xyflow/react';
import type { AVLTreeNode } from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";
import { 
  calculateTreePositions, 
  avlTreeToReactFlow,
  removeAVLWithAnimation, 
  searchAVL,
  rotateLeft,
  rotateRight
} from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";
import { AVLAnimationRecorder } from "@/src/components/visualizer/animations/AVLtree/avlAnimation";
import { AnimationController } from '../Tree/animationController';
import { 
  cloneTree, 
  buildRemoveSnapshots,
  type AnimationStep, 
  removeLeafWithoutBalance
} from '@/src/components/visualizer/algorithmsTree/AVLtree/snapshotBuilder';
import { 
  interpolateNodes, 
  mergeNodeArrays, 
  mergeEdgeArrays,
  buildPositionMap,
  filterValidEdges 
} from '../Tree/nodeInterpolation';
import { animateInsertionSteps, type AnimationCallbacks } from './insertAnimation';
import { getBalanceFactor, updateHeight } from '@/src/components/visualizer/algorithmsTree/AVLtree/avlTree';

/**
 * Animate removal steps with smooth transitions
 */
export function animateRemovalSteps(
  snapshots: Array<AVLTreeNode | null>,
  steps: AnimationStep[],
  animationSpeed: number,
  framesPerStep: number,
  startingRFNodes: RFNode[],
  controller: AnimationController,
  callbacks: AnimationCallbacks
): void {
  let globalOffset = 0;
  const rfPosMap = buildPositionMap(startingRFNodes);

  steps.forEach((step, stepIndex) => {
    const startSnap = snapshots[stepIndex];
    const endSnap = snapshots[stepIndex + 1] || snapshots[stepIndex];

    // Calculate positions
    let startPositions = calculateTreePositions(startSnap);
    
    // For first step, use current ReactFlow positions
    if (stepIndex === 0 && rfPosMap.size > 0) {
      const mergedStart = new Map(startPositions);
      rfPosMap.forEach((pos, id) => mergedStart.set(id, pos));
      startPositions = mergedStart;
    }
    
    const endPositions = calculateTreePositions(endSnap);

    // Convert to ReactFlow format
    const { nodes: startNodes, edges: startEdges } = avlTreeToReactFlow(
      startSnap,
      [],
      [],
      startPositions
    );
    const { nodes: endNodes, edges: endEdges } = avlTreeToReactFlow(
      endSnap,
      [],
      [],
      endPositions
    );

    // Animate with multiple frames
    for (let frame = 1; frame <= framesPerStep; frame++) {
      const fraction = frame / framesPerStep;
      
      controller.scheduleStep(() => {
        const template = mergeNodeArrays(startNodes, endNodes);
        const templateEdges = mergeEdgeArrays(startEdges, endEdges);
        const intermediate = interpolateNodes(template, startPositions, endPositions, fraction);
        
        const nodeIdSet = new Set(template.map(n => n.id));
        const filteredEdges = filterValidEdges(templateEdges, nodeIdSet);
        
        const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
          intermediate,
          filteredEdges,
          new Set(step.highlightedNodes),
          new Set(step.highlightedEdges),
          step.highlightColor || 'blue'
        );
        
        callbacks.setNodes(highlightedNodes);
        callbacks.setEdges(highlightedEdges);
        callbacks.setDescription(step.description);
      }, animationSpeed * (globalOffset + frame));
    }
    
    globalOffset += framesPerStep;
  });
}

/**
 * Finalize removal animation
 */
export function finalizeRemoveAnimation(
  finalSnapshot: AVLTreeNode | null,
  animationSpeed: number,
  timeOffset: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void
): void {
  controller.scheduleStep(() => {
    const positions = calculateTreePositions(finalSnapshot);
    const { nodes, edges } = avlTreeToReactFlow(finalSnapshot, [], [], positions);

    callbacks.setNodes(nodes);
    callbacks.setEdges(edges);
    callbacks.setDescription('Removal complete!');

    // ← delay ก่อน onComplete เพื่อให้ React render edges ทัน
    controller.scheduleStep(() => {
      callbacks.setDescription('');
      onComplete();
    }, animationSpeed * 2);

  }, animationSpeed * timeOffset);
}

/**
 * Complete remove animation flow
 */
export function animateRemove(
  currentRoot: AVLTreeNode | null,
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

  callbacks.setDescription(`Removing ${value}...`);

  // Record removal with animation steps
  const rootCopy = cloneTree(currentRoot);
  const recorder = new AVLAnimationRecorder();
  removeAVLWithAnimation(rootCopy, value, recorder);
  
  const steps = recorder.getSteps();
  const snapshots = buildRemoveSnapshots(rootCopy, steps, value);

  // Animate steps
  const framesPerStep = 4;
  animateRemovalSteps(
    snapshots,
    steps,
    animationSpeed,
    framesPerStep,
    currentRFNodes,
    controller,
    callbacks
  );

  // Finalize
  finalizeRemoveAnimation(
    snapshots[snapshots.length - 1],
    animationSpeed,
    steps.length * framesPerStep,
    controller,
    callbacks,
    onComplete
  );
}

export function animateRemoveWithStructureCheck(
  currentRoot: AVLTreeNode | null,
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

  const framesPerStep = 4;

  const { found, path } = searchAVL(currentRoot, value);
  if (!found) {
    callbacks.setDescription(`Value ${value} not found`);
    onComplete();
    return;
  }

  path.forEach((nodeId, idx) => {
    controller.scheduleStep(() => {
      const pos = calculateTreePositions(currentRoot);
      const { nodes, edges } = avlTreeToReactFlow(currentRoot, [], [], pos);
      const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
        nodes, edges, new Set([nodeId]), new Set(), 'blue'
      );
      callbacks.setNodes(highlightedNodes);
      callbacks.setEdges(highlightedEdges);
      callbacks.setDescription(`Searching... visiting node ${nodeId}`);
    }, animationSpeed * (idx + 1));
  });

  let timeOffset = path.length + 1;

  controller.scheduleStep(() => {
    const pos = calculateTreePositions(currentRoot);
    const { nodes, edges } = avlTreeToReactFlow(currentRoot, [], [], pos);
    const targetId = path[path.length - 1];
    const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
      nodes, edges, new Set([targetId]), new Set(), 'red'
    );
    callbacks.setNodes(highlightedNodes);
    callbacks.setEdges(highlightedEdges);
    callbacks.setDescription(`Found node ${value}! Removing...`);
  }, animationSpeed * timeOffset);

  timeOffset += 1;

  const afterDeleteRoot = cloneTree(currentRoot);
  removeLeafWithoutBalance(afterDeleteRoot, value);

  controller.scheduleStep(() => {
    const pos = calculateTreePositions(afterDeleteRoot);
    const { nodes, edges } = avlTreeToReactFlow(afterDeleteRoot, [], [], pos);
    callbacks.setNodes(nodes);
    callbacks.setEdges(edges);
    callbacks.setDescription('Node removed. Checking AVL balance...');
  }, animationSpeed * timeOffset);

  timeOffset += 2;

  const rebalanceRecorder = new AVLAnimationRecorder();
  const { root: finalRoot, snapshots: rebalanceSnapshots } = rebalanceAVL(
    cloneTree(afterDeleteRoot),
    rebalanceRecorder
  );

  const rebalanceSteps = rebalanceRecorder.getSteps().filter(
    s => s.type === 'rotate-left' || s.type === 'rotate-right'
  );

  if (rebalanceSteps.length > 0) {
    const afterDeletePositions = calculateTreePositions(afterDeleteRoot);
    const { nodes: afterDeleteRFNodes } = avlTreeToReactFlow(
      afterDeleteRoot, [], [], afterDeletePositions
    );

    const snapshots = [cloneTree(afterDeleteRoot), ...rebalanceSnapshots];

    animateInsertionSteps(
      snapshots,
      rebalanceSteps,
      animationSpeed,
      framesPerStep,
      afterDeleteRFNodes,
      controller,
      callbacks,
      timeOffset
    );

    timeOffset += rebalanceSteps.length * framesPerStep;
  }

  // ── Step 6: Finalize ────────────────────────────────────────────
  finalizeRemoveAnimation(
    finalRoot,          // ← ใช้ finalRoot จาก rebalanceAVL แทน afterRebalance เดิม
    animationSpeed,
    timeOffset,
    controller,
    callbacks,
    onComplete
  );
}

function rebalanceAVL(
  root: AVLTreeNode | null,
  recorder: AVLAnimationRecorder
): { root: AVLTreeNode | null; snapshots: Array<AVLTreeNode | null> } {
  const snapshots: Array<AVLTreeNode | null> = [];

  function balanceNode(node: AVLTreeNode | null): AVLTreeNode | null {
    if (!node) return null;

    node.left = balanceNode(node.left);
    node.right = balanceNode(node.right);

    updateHeight(node);

    const balance = getBalanceFactor(node);
    recorder.recordBalanceCheck(node.id, balance);

    // Left Left
    if (balance > 1 && getBalanceFactor(node.left) >= 0) {
      recorder.recordRightRotation(node.id, node.left?.id ?? '');
      const result = rotateRight(node);
      snapshots.push(cloneTree(result));
      return result;
    }
    // Left Right
    if (balance > 1 && getBalanceFactor(node.left) < 0) {
      if (node.left) {
        recorder.recordLeftRotation(node.left.id, node.left.right?.id ?? '');
        node.left = rotateLeft(node.left);
        snapshots.push(cloneTree(node));
      }
      recorder.recordRightRotation(node.id, node.left?.id ?? '');
      const result = rotateRight(node);
      snapshots.push(cloneTree(result));
      return result;
    }
    // Right Right
    if (balance < -1 && getBalanceFactor(node.right) <= 0) {
      recorder.recordLeftRotation(node.id, node.right?.id ?? '');
      const result = rotateLeft(node);
      snapshots.push(cloneTree(result));
      return result;
    }
    // Right Left
    if (balance < -1 && getBalanceFactor(node.right) > 0) {
      if (node.right) {
        recorder.recordRightRotation(node.right.id, node.right.left?.id ?? '');
        node.right = rotateRight(node.right);
        snapshots.push(cloneTree(node));
      }
      recorder.recordLeftRotation(node.id, node.right?.id ?? '');
      const result = rotateLeft(node);
      snapshots.push(cloneTree(result));
      return result;
    }

    return node;
  }

  const finalRoot = balanceNode(root);
  return { root: finalRoot, snapshots };
}