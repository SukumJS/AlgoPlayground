import type { Node as RFNode } from '@xyflow/react';
import type { AVLTreeNode } from "@/src/hooks/treeAdapters/avlAdapter";
import { searchAVL } from "@/src/hooks/treeAdapters/avlAdapter";
import { AnimationController } from './animationController';
import type { AnimationCallbacks } from './insertAnimation';

/**
 * Result of a search operation
 */
interface SearchResult {
  found: boolean;
  nodeId?: string;
  path: string[];
}

/**
 * Animate search traversal through tree
 */
export function animateSearchTraversal(
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
 * Show final search result
 */
export function showSearchResult(
  searchResult: SearchResult,
  value: number,
  currentNodes: RFNode[],
  currentEdges: any[],
  animationSpeed: number,
  pathLength: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void
): void {
  controller.scheduleStep(() => {
    if (searchResult.found && searchResult.nodeId) {
      // Found - highlight in green
      const { highlightedNodes, highlightedEdges } = callbacks.applyHighlighting(
        currentNodes,
        currentEdges,
        new Set([searchResult.nodeId]),
        new Set(),
        'green'
      );
      
      callbacks.setNodes(highlightedNodes);
      callbacks.setEdges(highlightedEdges);
      callbacks.setDescription(`Found ${value} at ${searchResult.nodeId}`);
    } else {
      // Not found
      callbacks.setDescription(`Value ${value} not found`);
    }

    // Clean up after a delay
    controller.scheduleStep(() => {
      onComplete();
      callbacks.setDescription('');
    }, animationSpeed);
    
  }, animationSpeed * (pathLength + 1));
}

/**
 * Complete search animation flow
 */
export function animateSearch(
  currentRoot: AVLTreeNode | null,
  value: number,
  currentRFNodes: RFNode[],
  currentRFEdges: any[],
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

  callbacks.setDescription(`Searching for ${value}...`);

  // Perform search to get path
  const searchResult = searchAVL(currentRoot, value);
  const path = searchResult.path || [];

  // Animate traversal
  animateSearchTraversal(
    path,
    currentRFNodes,
    currentRFEdges,
    animationSpeed,
    controller,
    callbacks
  );

  // Show result
  showSearchResult(
    searchResult,
    value,
    currentRFNodes,
    currentRFEdges,
    animationSpeed,
    path.length,
    controller,
    callbacks,
    onComplete
  );
}
