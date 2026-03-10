"use client";

import React from "react";
import CodeBubbleSort from "./types/codalgo/codebubblesort";
import CodeSelectionSort from "./types/codalgo/codeselectionsort";
import CodeInsertionSort from "./types/codalgo/codeinsertingsort";
import CodeMergeSort from "./types/codalgo/codemergesort";
import CodeHeapTree from "./types/codalgo/codeheaptree";
import CodeAVLTree from "./types/codalgo/codeavltree";
import CodeBSTTree from "./types/codalgo/codebsttree";
import CodeBinaryTree from "./types/codalgo/codebinarytree";

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

    default:
      return <CodeBubbleSort {...props} />;
  }
}
