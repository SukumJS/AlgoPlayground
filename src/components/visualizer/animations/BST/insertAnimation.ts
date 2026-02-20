import type { Node as RFNode } from '@xyflow/react';
import type { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/AVLtree/insertAnimation';
import {
  interpolateNodes,
  mergeNodeArrays,
  mergeEdgeArrays,
  buildPositionMap,
  filterValidEdges,
} from '@/src/components/visualizer/animations/Tree/nodeInterpolation';
import {
  cloneBSTTree,
  insertBSTWithAnimation,
  calculateBSTPositions,
  bstToReactFlow,
  type BSTNode,
} from '@/src/components/visualizer/algorithmsTree/BST/bstTree';
import { BSTAnimationRecorder } from './bstAnimation';

const FRAMES_PER_STEP = 4;

//  Snapshot Builder 

function buildInsertSnapshots(
  rootBeforeInsert: BSTNode | null,
  steps: ReturnType<BSTAnimationRecorder['getSteps']>,
  value: number,
  nodeId: string
): Array<BSTNode | null> {
  const snapshots: Array<BSTNode | null> = [];
  let state = cloneBSTTree(rootBeforeInsert);
  snapshots.push(cloneBSTTree(state));

  steps.forEach(step => {
    if (step.type === 'insert-node') {
      state = insertBSTWithAnimation(state, value, nodeId) as BSTNode;
    }
    snapshots.push(cloneBSTTree(state));
  });

  return snapshots;
}

//  Animate Steps 

function animateSteps(
  snapshots: Array<BSTNode | null>,
  steps: ReturnType<BSTAnimationRecorder['getSteps']>,
  animationSpeed: number,
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

    let startPositions = calculateBSTPositions(startSnap);
    if (stepIndex === 0 && rfPosMap.size > 0) {
      const merged = new Map(startPositions);
      rfPosMap.forEach((pos, id) => merged.set(id, pos));
      startPositions = merged;
    }
    const endPositions = calculateBSTPositions(endSnap);

    const { nodes: startNodes, edges: startEdges } = bstToReactFlow(startSnap, [], [], startPositions);
    const { nodes: endNodes, edges: endEdges } = bstToReactFlow(endSnap, [], [], endPositions);

    for (let frame = 1; frame <= FRAMES_PER_STEP; frame++) {
      const fraction = frame / FRAMES_PER_STEP;

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
          step.highlightColor || 'blue',
          step.edgeColor
        );

        callbacks.setNodes(highlightedNodes);
        callbacks.setEdges(highlightedEdges);
        callbacks.setDescription(step.description);
      }, animationSpeed * (delayOffset + globalOffset + frame));
    }

    globalOffset += FRAMES_PER_STEP;
  });
}

//  Finalize 

function finalizeInsert(
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

    const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
      nodes, edges, new Set(), new Set(), 'green'
    );
    callbacks.setNodes(highlightedNodes);
    callbacks.setEdges(highlightedEdges);
    callbacks.setDescription('Insertion complete!');

    controller.scheduleStep(() => {
      callbacks.setDescription('');
      onComplete();
    }, animationSpeed * 2);
  }, animationSpeed * timeOffset);
}

//  Public

export function animateBSTInsert(
  currentRoot: BSTNode | null,
  value: number,
  newNodeId: string,
  currentRFNodes: RFNode[],
  animationSpeed: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void
): void {
  //  Empty tree 
  if (!currentRoot) {
    const previewRoot: BSTNode = { id: newNodeId, value, left: null, right: null };
    const positions = calculateBSTPositions(previewRoot);
    const { nodes, edges } = bstToReactFlow(previewRoot, [], [], positions);
    callbacks.setNodes(nodes);
    callbacks.setEdges(edges);
    callbacks.setDescription(`Inserting ${value} as root...`);
    finalizeInsert(previewRoot, animationSpeed, 1, controller, callbacks, onComplete);
    return;
  }

  //  Non-empty tree 
  const recorder = new BSTAnimationRecorder();
  const rootCopy = cloneBSTTree(currentRoot);

  insertBSTWithAnimation(rootCopy, value, newNodeId, recorder);

  const steps = recorder.getSteps();

  const snapshots = buildInsertSnapshots(cloneBSTTree(currentRoot), steps, value, newNodeId);

  animateSteps(snapshots, steps, animationSpeed, currentRFNodes, controller, callbacks, 0);

  finalizeInsert(
    snapshots[snapshots.length - 1],
    animationSpeed,
    steps.length * FRAMES_PER_STEP + 1,
    controller,
    callbacks,
    onComplete
  );
}