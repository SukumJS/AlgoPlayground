import ArrayIcon from "./Array"
import StackIcon from "./Stack"
import DoublyLinkedListIcon from "./DoublyLinkedList"
import SinglyLinkedListIcon from "./SinglyLinkedList"
import QueueIcon from "./Queue"
import TreeinIcon from "./Treein"
import TreepreIcon from "./Treepre"
import TreepostIcon from "./Treepost"
import TreeSearch from "./TreeSearch"
import GraphBFSIcon from "./GraphBFS"
import GraphDFSIcon from "./GraphDFS"
import GraphDijIcon from "./GraphDij"
import GraphBellmanIcon from "./GraphBellman"
import GraphPrimIcon from "./GraphPrim"
import GraphKruskalIcon from "./GraphKruskal"
import AVLTreeIcon from "./TreeAVL"
import MinHeapIcon from "./TreeMinHeap"
import MaxHeapIcon from "./TreeMaxHeap"
import BubbleSortIcon from "./BubbleSort"
import SelectionSortIcon from "./SelectionSort"
import InsertionSortIcon from "./InsertionSort"
import MergeSortIcon from "./MergeSort"
import QueueSortIcon from "./QueueSort"
import LinearSearchIcon from "./LinearSearch"
import BinarySearchIcon from "./BinarySearch"

interface Props {
    pattern:
    | "array"
    | "doubly-linked-list"
    | "singly-linked-list"
    | "stack"
    | "queue"
    | "tree-in"
    | "tree-pre"
    | "tree-post"
    | "tree-search"
    | "tree-avl"
    | "min-heap"
    | "max-heap"
    | "graph-bfs"
    | "graph-dfs"
    | "graph-dij"
    | "graph-bellman"
    | "graph-prim"
    | "graph-kruskal"
    | "bubble-sort"
    | "selection-sort"
    | "insertion-sort"
    | "merge-sort"
    | "queue-sort"
    | "linear-search"
    | "binary-search"
    className?: string
}
export function BlockIcon({ pattern, className }: Props) {
    switch (pattern) {
        case "array":
            return <ArrayIcon className={className} />
        case "stack":
            return <StackIcon className={className} />
        case "queue":
            return <QueueIcon className={className} />
        case "singly-linked-list":
            return <SinglyLinkedListIcon className={className} />
        case "doubly-linked-list":
            return <DoublyLinkedListIcon className={className} />
        case "tree-in":
            return <TreeinIcon className={className} />
        case "tree-pre":
            return <TreepreIcon className={className} />
        case "tree-post":
            return <TreepostIcon className={className} />
        case "tree-search":
            return <TreeSearch className={className} />
        case "tree-avl":
            return <AVLTreeIcon className={className} />
        case "min-heap":
            return <MinHeapIcon className={className} />
        case "max-heap":
            return <MaxHeapIcon className={className} />
        case "graph-bfs":
            return <GraphBFSIcon className={className} />
        case "graph-dfs":
            return <GraphDFSIcon className={className} />
        case "graph-dij":
            return <GraphDijIcon className={className} />
        case "graph-bellman":
            return <GraphBellmanIcon className={className} />
        case "graph-prim":
            return <GraphPrimIcon className={className} />
        case "graph-kruskal":
            return <GraphKruskalIcon className={className} />
        case "bubble-sort":
            return <BubbleSortIcon className={className} />
        case "selection-sort":
            return <SelectionSortIcon className={className} />
        case "insertion-sort":
            return <InsertionSortIcon className={className} />
        case "merge-sort":
            return <MergeSortIcon className={className} />
        case "queue-sort":
            return <QueueSortIcon className={className} />
        case "linear-search":
            return <LinearSearchIcon className={className} />
        case "binary-search":
            return <BinarySearchIcon className={className} />

    }
}