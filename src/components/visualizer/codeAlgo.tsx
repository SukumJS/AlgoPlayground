"use client";

import React from "react";
import CodeBubbleSort from "./types/animationcodalgo/ani_codebubblesort";
import CodeSelectionSort from "./types/animationcodalgo/ani_codeselectionsort";
import CodeInsertionSort from "./types/animationcodalgo/ani_codeinsertingsort";
import CodeMergeSort from "./types/animationcodalgo/ani_codemergesort";
import CodeHeapTree from "./types/animationcodalgo/ani_codeheaptree";
import CodeAVLTree from "./types/animationcodalgo/ani_codeavltree";
import CodeBSTTree from "./types/animationcodalgo/ani_codebsttree";
import CodeBinaryTree from "./types/animationcodalgo/ani_codebinarytree";
import CodeBellmanGraph from "./types/animationcodalgo/ani_codebellmangraph";
import CodeBFSGraph from "./types/animationcodalgo/ani_codebfsgraph";
import CodeDFSGraph from "./types/animationcodalgo/ani_codedfsgraph";
import CodeDijkstraGraph from "./types/animationcodalgo/ani_codedijkstragraph";
import CodeKruskalGraph from "./types/animationcodalgo/ani_codekruskalgraph";
import CodePrimGraph from "./types/animationcodalgo/ani_codeprimgraph";
import CodeBinarySearch from "./types/animationcodalgo/ani_codebinarysearch";
import CodeLinearSearch from "./types/animationcodalgo/ani_codelinearsearch";
import CodeGenerateSearch from "./types/animationcodalgo/ani_codegeneratesearch";

interface CodeAlgoProps {
  title?: string;
  code?: string;
  language?: string;
  tutorialMode?: boolean;
  algoType?: string | null;
  /** external step index from the sort/tree engine; when provided, the code
   *  highlighter will follow this instead of its own internal playback */
  currentStep?: number;
  /** optional mapping from step index -> code line number (1-based) */
  stepToCodeLine?: number[];
  /** optional high-level tree action for tree algorithms (insert/search/remove/traversal-*) */
  treeAction?: string | null;
}

export default function CodeAlgo(props: CodeAlgoProps) {
  switch (props.algoType) {
    // Sorts
    case "selection-sort":
      return <CodeSelectionSort {...props} />;
    case "insertion-sort":
      return <CodeInsertionSort {...props} />;
    case "merge-sort":
      return <CodeMergeSort {...props} />;
    case "bubble-sort":
      return <CodeBubbleSort {...props} />;

    // Trees
    case "binary-search-tree":
      return <CodeBSTTree {...props} />;
    case "avl-tree":
      return <CodeAVLTree {...props} />;
    case "binary-tree-inorder":
    case "binary-tree-preorder":
    case "binary-tree-postorder":
      return <CodeBinaryTree {...props} />;
    case "min-heap":
    case "max-heap":
      return <CodeHeapTree {...props} />;

    // Graphs
    case "breadth-first-search":
      return <CodeBFSGraph {...props} />;
    case "depth-first-search":
      return <CodeDFSGraph {...props} />;
    case "dijkstra":
      return <CodeDijkstraGraph {...props} />;
    case "bellman-ford":
      return <CodeBellmanGraph {...props} />;
    case "prims":
      return <CodePrimGraph {...props} />;
    case "kruskals":
      return <CodeKruskalGraph {...props} />;

    // Search
    case "binary-search":
      return <CodeBinarySearch {...props} />;
    case "linear-search":
      return <CodeLinearSearch {...props} />;
    case "generate-search":
      return <CodeGenerateSearch {...props} />;

    default:
      return <CodeBubbleSort {...props} />;
  }
}
