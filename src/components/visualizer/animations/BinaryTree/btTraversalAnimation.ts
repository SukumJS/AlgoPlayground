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
  currentColor: string,
  animationSpeed: number,
  controller: AnimationController,
  callbacks: AnimationCallbacks,
  onComplete: () => void,
): void {
  const positions = calculateBTPositions(root);
  const values = order.map((id) => getNodeValue(root, id) ?? 0);

  // แสดงผลทาง console ก่อนเริ่ม animation
  console.log(`[${label}]:`, values.join(" → "));

  // reset
  controller.scheduleStep(() => {
    const { nodes, edges } = btToReactFlow(root, [], [], positions);
    callbacks.setNodes(nodes as RFNode[]);
    callbacks.setEdges(edges as never[]);
    callbacks.setDescription(`Starting ${label}... (result in console)`);
  }, animationSpeed * 0.5);

  order.forEach((nodeId, idx) => {
    controller.scheduleStep(
      () => {
        const { nodes, edges } = btToReactFlow(root, [], [], positions);
        const visited = new Set(order.slice(0, idx));
        const currentId = order[idx];

        // To find the exact path to the current node, we can track parent links or just highlight all edges between visited nodes.
        // Easiest is to highlight edges where both source and target are visited, or target is the current node.

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
        callbacks.setDescription(
          `${label}: visiting ${getNodeValue(root, nodeId)} (${idx + 1}/${order.length})`,
        );
      },
      animationSpeed * (idx + 1),
    );
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
      callbacks.setDescription(`${label} complete: [${values.join(" → ")}]`);

      controller.scheduleStep(() => {
        const { nodes: clean, edges: cleanE } = btToReactFlow(
          root,
          [],
          [],
          positions,
        );
        callbacks.setNodes(clean as RFNode[]);
        callbacks.setEdges(cleanE as never[]);
        onComplete();
      }, animationSpeed * 2);
    },
    animationSpeed * (order.length + 1),
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
    callbacks.setDescription("Tree is empty");
    onComplete();
    return;
  }
  // Changed color to #F7AD45 (Orange) to match Preorder
  animateTraversal(
    root,
    collectInorder(root),
    "Inorder (L → Root → R)",
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
    callbacks.setDescription("Tree is empty");
    onComplete();
    return;
  }
  animateTraversal(
    root,
    collectPreorder(root),
    "Preorder (Root → L → R)",
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
    callbacks.setDescription("Tree is empty");
    onComplete();
    return;
  }
  // Changed color to #F7AD45 (Orange) to match Preorder
  animateTraversal(
    root,
    collectPostorder(root),
    "Postorder (L → R → Root)",
    "#F7AD45",
    animationSpeed,
    controller,
    callbacks,
    onComplete,
  );
}
