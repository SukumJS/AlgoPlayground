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
//ชื่อ type เปลี่ยนตามที่ส่งมาจาก url query เปลี่ยนตรงนี้ เช่น url query เป็น ?type=bubble ก็จะไปเรียก runBubbleSort