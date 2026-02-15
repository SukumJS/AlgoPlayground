import type { Node as RFNode } from '@xyflow/react';
import type { AVLTreeNode } from "@/src/hooks/treeAdapters/avlAdapter";
import { 
  calculateTreePositions, 
  avlTreeToReactFlow,
  removeAVLWithAnimation 
} from "@/src/hooks/treeAdapters/avlAdapter";
import { AVLAnimationRecorder } from "@/src/components/algorithms/AVLtree/avlAnimation";
import { AnimationController } from './animationController';
import { 
  cloneTree, 
  buildRemoveSnapshots,
  type AnimationStep 
} from './snapshotBuilder';
import { 
  interpolateNodes, 
  mergeNodeArrays, 
  mergeEdgeArrays,
  buildPositionMap,
  filterValidEdges 
} from './nodeInterpolation';
import type { AnimationCallbacks } from './insertAnimation';

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
  totalSteps: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void
): void {
  controller.scheduleStep(() => {
    const finalPositions = calculateTreePositions(finalSnapshot);
    const { nodes: finalNodes, edges: finalEdges } = avlTreeToReactFlow(
      finalSnapshot,
      [],
      [],
      finalPositions
    );
    
    callbacks.setDescription('Removal complete!');
    
    const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
      finalNodes,
      finalEdges,
      new Set(),
      new Set(),
      'green'
    );
    
    callbacks.setNodes(highlightedNodes);
    callbacks.setEdges(highlightedEdges);
    
    // Clean up after delay
    controller.scheduleStep(() => {
      onComplete();
      callbacks.setDescription('');
    }, animationSpeed);
    
  }, animationSpeed * Math.max(1, totalSteps + 1));
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
