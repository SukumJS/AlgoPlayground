import { runBubbleSort } from "./bubblesort";
import { runSelectionSort } from "./selectionsort";
import { runInsertionSort } from "./insertionsort";
import { runQueueSort } from "./queuesort";
import { runMergeSort } from "./mergesort";
export const sortAlgorithms = {
    bubble: runBubbleSort,
    selection: runSelectionSort,
    insertion: runInsertionSort,
    queue: runQueueSort,
    merge: runMergeSort,
};
