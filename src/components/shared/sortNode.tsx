//โครงสร้างของ node ในการ sort
export type SortNodeData = {
  value: number;
  index: number;
  status: "idle" | "compare" | "swap" | "merge" | "sorted";
  level?: number; // สำหรับ mergesort
  currentLevel?: number;
};
