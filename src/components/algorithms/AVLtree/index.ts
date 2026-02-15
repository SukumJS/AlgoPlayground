/**
 * AVL Animation Utilities
 * 
 * This module provides utilities for animating AVL tree operations
 * including insert, search, and remove with smooth transitions.
 */

export { AnimationController } from './animationController';

export {
  cloneTree,
  insertLeafWithoutBalance,
  removeLeafWithoutBalance,
  applyRotationAt,
  buildInsertSnapshots,
  buildRemoveSnapshots,
  type AnimationStep,
} from './snapshotBuilder';

export {
  interpolateNodes,
  mergeNodeArrays,
  mergeEdgeArrays,
  buildPositionMap,
  filterValidEdges,
} from './nodeInterpolation';

export {
  animateRootInsertion,
  animateNonRootInsertion,
  animateInsertTraversal,
  highlightParentNode,
  animateInsertionSteps,
  finalizeInsertAnimation,
  type AnimationCallbacks,
} from './insertAnimation';

export {
  animateSearch,
  animateSearchTraversal,
  showSearchResult,
} from './searchAnimation';

export {
  animateRemove,
  animateRemovalSteps,
  finalizeRemoveAnimation,
} from './removeAnimation';
