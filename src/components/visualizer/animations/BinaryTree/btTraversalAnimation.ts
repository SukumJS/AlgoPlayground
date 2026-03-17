import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";
import {
  calculateBTPositions,
  btToReactFlow,
  type BTNode,
} from "@/src/components/visualizer/algorithmsTree/binaryTree";

//  Collect traversal order

function collectInorder(node: BTNode | null, result: string[] = []): string[] {
  if (!node) return result;
  collectInorder(node.left, result);
  result.push(node.id);
  collectInorder(node.right, result);
  return result;
}

function collectPreorder(node: BTNode | null, result: string[] = []): string[] {
  if (!node) return result;
  result.push(node.id);
  collectPreorder(node.left, result);
  collectPreorder(node.right, result);
  return result;
}

function collectPostorder(
  node: BTNode | null,
  result: string[] = [],
): string[] {
  if (!node) return result;
  collectPostorder(node.left, result);
  collectPostorder(node.right, result);
  result.push(node.id);
  return result;
}

function getNodeValue(node: BTNode | null, id: string): number | null {
  if (!node) return null;
  if (node.id === id) return node.value;
  return getNodeValue(node.left, id) ?? getNodeValue(node.right, id);
}

//  Core

function animateTraversal(
  root: BTNode,
  order: string[],
  label: string,
  treeAction: string,
  currentColor: string,
  animationSpeed: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void,
): void {
  const positions = calculateBTPositions(root);
  const values = order.map((id) => getNodeValue(root, id) ?? 0);

  // Pseudo code mapping for traversal variants (line numbers in CodeBinaryTreeView)
  // Inorder/Preorder/Postorder variants all share the same template structure:
  // 1 ALGORITHM...
  // 2 IF node IS null THEN
  // 3 RETURN
  // 4 END IF
  // 5 recurse/visit
  // 6 visit/recurse
  // 7 recurse
  // 8 END ALGORITHM
  const stepToLine = [1, 2, 5, 6, 7, 8];
  callbacks.setTreeAction?.(treeAction);
  callbacks.setStepToCodeLine?.(stepToLine);
  callbacks.setCodeStep?.(0);

  // Log traversal order in console before animation starts.
  console.log(`[${label}]:`, values.join(" -> "));

  const traversalCodeSteps: [number, number, number] =
    treeAction === "bt-traversal-preorder"
      ? [3, 2, 4]
      : treeAction === "bt-traversal-postorder"
        ? [2, 4, 3]
        : [2, 3, 4];

  let stepCounter = 0;

  // reset
  controller.scheduleStep(() => {
    const { nodes, edges } = btToReactFlow(root, [], [], positions);
    callbacks.setNodes(nodes as RFNode[]);
    callbacks.setEdges(edges as never[]);
    callbacks.setDescription(
      `Start ${label}. Follow the highlighted node order.`,
    );
    callbacks.setCodeStep?.(1);
  }, animationSpeed * 0.5);
  stepCounter += 1;

  order.forEach((nodeId, idx) => {
    const visited = new Set(order.slice(0, idx));
    const currentId = order[idx];

    const buildHighlight = () => {
      const { nodes, edges } = btToReactFlow(root, [], [], positions);
      const highlighted = (nodes as RFNode[]).map((n: RFNode) => ({
        ...n,
        data: {
          ...n.data,
          isHighlighted: n.id === nodeId || visited.has(n.id),
          highlightColor:
            n.id === nodeId
              ? currentColor
              : visited.has(n.id)
                ? "#4CAF7D"
                : undefined,
        },
      }));

      const visitedArr = Array.from(visited);
      const highlightedEdges = (edges as RFEdge[]).map((e: RFEdge) => {
        const isHighlightedEdge =
          (visitedArr.includes(e.source) && visitedArr.includes(e.target)) ||
          (visitedArr.includes(e.source) && e.target === currentId);
        return {
          ...e,
          style: isHighlightedEdge
            ? { stroke: "#F7AD45", strokeWidth: 3 }
            : { stroke: "#999", strokeWidth: 2 },
        };
      });

      callbacks.setNodes(highlighted);
      callbacks.setEdges(highlightedEdges);
    };

    // Split into 3 visible sub-steps so code highlight moves (recurse/visit/recurse)
    (traversalCodeSteps as number[]).forEach((codeStep, subIdx) => {
      stepCounter += 1;
      controller.scheduleStep(() => {
        buildHighlight();
        if (subIdx === 1) {
          callbacks.setDescription(
            `${label}: visit node ${getNodeValue(root, nodeId)} (step ${idx + 1}/${order.length}).`,
          );
        } else {
          callbacks.setDescription(
            `${label}: continue traversal (step ${idx + 1}/${order.length}).`,
          );
        }
        callbacks.setCodeStep?.(codeStep);
      }, animationSpeed * stepCounter);
    });
  });

  // finalize
  controller.scheduleStep(
    () => {
      const { nodes, edges } = btToReactFlow(root, [], [], positions);
      const allVisited = new Set(order);
      const final = (nodes as RFNode[]).map((n: RFNode) => ({
        ...n,
        data: {
          ...n.data,
          isHighlighted: allVisited.has(n.id),
          highlightColor: "#4CAF7D",
        },
      }));
      callbacks.setNodes(final);
      callbacks.setEdges(edges as never[]);
      callbacks.setDescription(
        `${label} complete. Visit order: [${values.join(" -> ")}].`,
      );
      callbacks.setCodeStep?.(4);

      controller.scheduleStep(() => {
        const { nodes: clean, edges: cleanE } = btToReactFlow(
          root,
          [],
          [],
          positions,
        );
        callbacks.setNodes(clean as RFNode[]);
        callbacks.setEdges(cleanE as never[]);
        callbacks.setCodeStep?.(0);
        callbacks.setTreeAction?.(null);
        onComplete();
      }, animationSpeed * 2);
    },
    animationSpeed * (stepCounter + 1),
  );
}

//  Public

export function animateBTInorder(
  root: BTNode | null,
  animationSpeed: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void,
): void {
  if (!root) {
    callbacks.setDescription("The tree is empty. Traversal cannot start.");
    onComplete();
    return;
  }
  // Changed color to #F7AD45 (Orange) to match Preorder
  animateTraversal(
    root,
    collectInorder(root),
    "Inorder (L -> Root -> R)",
    "bt-traversal-inorder",
    "#F7AD45",
    animationSpeed,
    controller,
    callbacks,
    onComplete,
  );
}

export function animateBTPreorder(
  root: BTNode | null,
  animationSpeed: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void,
): void {
  if (!root) {
    callbacks.setDescription("The tree is empty. Traversal cannot start.");
    onComplete();
    return;
  }
  animateTraversal(
    root,
    collectPreorder(root),
    "Preorder (Root -> L -> R)",
    "bt-traversal-preorder",
    "#F7AD45",
    animationSpeed,
    controller,
    callbacks,
    onComplete,
  );
}

export function animateBTPostorder(
  root: BTNode | null,
  animationSpeed: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void,
): void {
  if (!root) {
    callbacks.setDescription("The tree is empty. Traversal cannot start.");
    onComplete();
    return;
  }
  // Changed color to #F7AD45 (Orange) to match Preorder
  animateTraversal(
    root,
    collectPostorder(root),
    "Postorder (L -> R -> Root)",
    "bt-traversal-postorder",
    "#F7AD45",
    animationSpeed,
    controller,
    callbacks,
    onComplete,
  );
}
