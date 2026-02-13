import * as core from '@/src/utils/AVLtree/avlTree';

export const insertAVLWithAnimation = core.insertAVLWithAnimation;
export const insertAVL = core.insertAVL;
export const removeAVL = core.removeAVL;
export const removeAVLWithAnimation = core.removeAVLWithAnimation;
export const searchAVL = core.searchAVL;
export const calculateTreePositions = core.calculateTreePositions;
export const avlTreeToReactFlow = core.avlTreeToReactFlow;
export const rebuildAVLTreeFromNodes = core.rebuildAVLTreeFromNodes;
export const validateTreeStructure = core.validateTreeStructure;
export const findInsertionPosition = core.findInsertionPosition;
export const rotateLeft = core.rotateLeft;
export const rotateRight = core.rotateRight;
export const updateHeight = core.updateHeight;

export type AVLTreeNode = core.AVLTreeNode;
export type AnimationRecorder = core.AnimationRecorder;

export default {
  insertAVLWithAnimation,
  insertAVL,
  removeAVL,
  removeAVLWithAnimation,
  searchAVL,
  calculateTreePositions,
  avlTreeToReactFlow,
  rebuildAVLTreeFromNodes,
  validateTreeStructure,
  findInsertionPosition,
  rotateLeft,
  rotateRight,
  updateHeight,
};
