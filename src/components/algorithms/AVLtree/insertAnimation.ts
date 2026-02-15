import type { Node as RFNode } from '@xyflow/react';
import type { XYPosition } from '@xyflow/react';
import type { AVLTreeNode } from "@/src/hooks/treeAdapters/avlAdapter";
import { 
  calculateTreePositions, 
  avlTreeToReactFlow,
  insertAVLWithAnimation 
} from "@/src/hooks/treeAdapters/avlAdapter";
import { AVLAnimationRecorder } from "@/src/components/algorithms/AVLtree/avlAnimation";
import { AnimationController } from './animationController';
import { 
  cloneTree, 
  buildInsertSnapshots,
  type AnimationStep 
} from './snapshotBuilder';
import { 
  interpolateNodes, 
  mergeNodeArrays, 
  mergeEdgeArrays,
  buildPositionMap,
  filterValidEdges 
} from './nodeInterpolation';

export interface AnimationCallbacks {
  setNodes: (nodes: any) => void;
  setEdges: (edges: any) => void;
  setDescription: (desc: string) => void;
  applyHighlighting: (
    nodes: any[],
    edges: any[],
    highlightedNodeIds: Set<string>,
    highlightedEdgeIds: Set<string>,
    color: 'blue' | 'yellow' | 'red' | 'green'
  ) => { highlightedNodes: any[]; highlightedEdges: any[] };
}

/**
 * Animate traversal path before insertion
 */
export function animateInsertTraversal(
  path: string[],
  currentNodes: RFNode[],
  currentEdges: any[],
  animationSpeed: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks
): void {
  path.forEach((nodeId, idx) => {
    controller.scheduleStep(() => {
      const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
        currentNodes,
        currentEdges,
        new Set([nodeId]),
        new Set(),
        'blue'
      );
      callbacks.setNodes(highlightedNodes);
      callbacks.setEdges(highlightedEdges);
      callbacks.setDescription(`Traversing node ${nodeId}...`);
    }, animationSpeed * (idx + 1));
  });
}

/**
 * Highlight parent node before insertion
 */
export function highlightParentNode(
  parentId: string | null,
  parentValue: number | undefined,
  position: string | undefined,
  valueToInsert: number,
  currentNodes: RFNode[],
  currentEdges: any[],
  animationSpeed: number,
  pathLength: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks
): void {
  if (!parentId) return;

  controller.scheduleStep(() => {
    const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
      currentNodes,
      currentEdges,
      new Set([parentId]),
      new Set(),
      'yellow'
    );
    callbacks.setNodes(highlightedNodes);
    callbacks.setEdges(highlightedEdges);
    callbacks.setDescription(
      `Found parent ${parentValue} — inserting ${valueToInsert} as ${position}`
    );
  }, animationSpeed * (pathLength + 1));
}

/**
 * Animate insertion steps with smooth transitions
 */
export function animateInsertionSteps(
  snapshots: Array<AVLTreeNode | null>,
  steps: AnimationStep[],
  animationSpeed: number,
  framesPerStep: number,
  startingRFNodes: RFNode[],
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  delayOffset: number = 0
): void {
  let globalOffset = 0;
  const rfPosMap = buildPositionMap(startingRFNodes);

  steps.forEach((step, stepIndex) => {
    const startSnap = snapshots[stepIndex];
    const endSnap = snapshots[stepIndex + 1] || snapshots[stepIndex];

    // Calculate positions for both snapshots
    let startPositions = calculateTreePositions(startSnap);
    
    // For the first step, use current ReactFlow positions as start
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

    // Animate with multiple frames for smooth transition
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
      }, animationSpeed * (delayOffset + globalOffset + frame));
    }
    
    globalOffset += framesPerStep;
  });
}

/**
 * Finalize insertion animation
 */
export function finalizeInsertAnimation(
  finalSnapshot: AVLTreeNode | null,
  animationSpeed: number,
  totalSteps: number,
  delayOffset: number,
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
    
    callbacks.setDescription('Insertion complete!');
    
    const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
      finalNodes,
      finalEdges,
      new Set(),
      new Set(),
      'green'
    );
    
    callbacks.setNodes(highlightedNodes);
    callbacks.setEdges(highlightedEdges);
    
    // Clean up after a brief delay
    controller.scheduleStep(() => {
      onComplete();
      callbacks.setDescription('');
    }, animationSpeed);
    
  }, animationSpeed * (delayOffset + totalSteps));
}

/**
 * Complete insert animation flow for empty tree (root insertion)
 */
export function animateRootInsertion(
  value: number,
  nodeId: string,
  animationSpeed: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void
): void {
  // Create preview root
  const previewRoot: AVLTreeNode = {
    id: nodeId,
    value,
    left: null,
    right: null,
    height: 1,
  };

  const positions = calculateTreePositions(previewRoot);
  const { nodes: baseNodes, edges: baseEdges } = avlTreeToReactFlow(
    previewRoot,
    [],
    [],
    positions
  );

  // Show preview with green highlight
  const previewNodes = baseNodes.map(n => ({
    ...n,
    data: { ...n.data, isHighlighted: true, highlightColor: 'green' }
  }));
  
  callbacks.setNodes(previewNodes);
  callbacks.setEdges(baseEdges);
  callbacks.setDescription(`Inserting ${value} as root...`);

  // Record insertion steps
  const recorder = new AVLAnimationRecorder();
  insertAVLWithAnimation(null, value, nodeId, recorder);
  const steps = recorder.getSteps();

  // Build snapshots
  const snapshots = buildInsertSnapshots(null, steps, value, nodeId);

  // Animate steps
  const framesPerStep = 4;
  animateInsertionSteps(
    snapshots,
    steps,
    animationSpeed,
    framesPerStep,
    baseNodes,
    controller,
    callbacks,
    0
  );

  // Finalize
  finalizeInsertAnimation(
    snapshots[snapshots.length - 1],
    animationSpeed,
    steps.length * framesPerStep + 1,
    0,
    controller,
    callbacks,
    onComplete
  );
}

/**
 * Complete insert animation flow for non-empty tree
 */
export function animateNonRootInsertion(
  currentRoot: AVLTreeNode,
  value: number,
  newNodeId: string,
  path: string[],
  parentId: string | null,
  parentValue: number | undefined,
  position: string | undefined,
  currentRFNodes: RFNode[],
  currentRFEdges: any[],
  animationSpeed: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void
): void {
  // Step 1: Animate traversal
  callbacks.setDescription(`Searching for position to insert ${value}...`);
  
  animateInsertTraversal(
    path,
    currentRFNodes,
    currentRFEdges,
    animationSpeed,
    controller,
    callbacks
  );

  // Step 2: Highlight parent
  highlightParentNode(
    parentId,
    parentValue,
    position,
    value,
    currentRFNodes,
    currentRFEdges,
    animationSpeed,
    path.length,
    controller,
    callbacks
  );

  // Step 3: Perform insertion with animation
  controller.scheduleStep(() => {
    const rootCopy = cloneTree(currentRoot);
    const recorder = new AVLAnimationRecorder();
    insertAVLWithAnimation(rootCopy, value, newNodeId, recorder);
    
    const steps = recorder.getSteps();
    const snapshots = buildInsertSnapshots(rootCopy, steps, value, newNodeId);

    const framesPerStep = 4;
    const delayOffset = path.length + 2;

    animateInsertionSteps(
      snapshots,
      steps,
      animationSpeed,
      framesPerStep,
      currentRFNodes,
      controller,
      callbacks,
      delayOffset
    );

    finalizeInsertAnimation(
      snapshots[snapshots.length - 1],
      animationSpeed,
      steps.length * framesPerStep,
      delayOffset,
      controller,
      callbacks,
      onComplete
    );
  }, animationSpeed * (path.length + 2));
}
