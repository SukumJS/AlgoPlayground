import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export function generateSearchStepsByType(
  algoType: string | null,
  nodes: Node<SortNodeData>[],
  target: number
) {
  // รีเซ็ตทุก Node ให้เป็นสี idle ก่อนเริ่มหา
  const initialNodes = nodes.map(node => ({
    ...node,
    data: { ...node.data, status: "idle" as const }
  }));

  switch (algoType) {
    case "linear":
      return generateLinearSearchSteps(initialNodes, target);
    case "binary":
      return generateBinarySearchSteps(initialNodes, target);
    default:
      return generateLinearSearchSteps(initialNodes, target);
  }
}

// ----------------------------------------
// 🔍 1. Linear Search 
// ----------------------------------------
function generateLinearSearchSteps(nodes: Node<SortNodeData>[], target: number) {
  const steps: Node<SortNodeData>[][] = [];
  let currentNodes = JSON.parse(JSON.stringify(nodes));

  steps.push(JSON.parse(JSON.stringify(currentNodes))); // ภาพตั้งต้น

  for (let i = 0; i < currentNodes.length; i++) {
    // Step 1: ไฮไลต์สีฟ้า (กำลังตรวจสอบ)
    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    currentNodes[i].data.status = "compare"; 
    steps.push(currentNodes);

    // Step 2: เช็คว่าใช่ Target ไหม
    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    if (currentNodes[i].data.value === target) {
      currentNodes[i].data.status = "found"; 
      steps.push(currentNodes);
      break; 
    } else {
      currentNodes[i].data.status = "discarded"; 
      steps.push(currentNodes);
    }
  }

  return steps;
}

// ----------------------------------------
//  Binary Search 
// เงื่อนไขของ binary คือต้อง sort แล้ว ซึ่งถ้าไม่ sort มันจะหาไม่เจอ แต่ถ้าเจอก็คือมันโชคดีว่า target มันอยู่ในฝั่งที่ binary search เช็คพอดีเลย 
// ----------------------------------------
function generateBinarySearchSteps(nodes: Node<SortNodeData>[], target: number) {
  const steps: Node<SortNodeData>[][] = [];
  let currentNodes = JSON.parse(JSON.stringify(nodes));
  
  steps.push(JSON.parse(JSON.stringify(currentNodes)));

  let left = 0;
  let right = currentNodes.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    // Step 1: ไฮไลต์ตรงกลางเป็นสีฟ้า (ตัวที่กำลังเช็ค)
    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    currentNodes[mid].data.status = "compare";
    steps.push(currentNodes);

    const midValue = currentNodes[mid].data.value;

    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    if (midValue === target) {
      // เจอแล้ว!
      currentNodes[mid].data.status = "found";
      steps.push(currentNodes);
      break;
    } else if (midValue < target) {
      // ค่าน้อยไป ตัดครึ่งซ้ายทิ้งให้เป็นสีเทาให้หมด (รวมถึงตัว mid ด้วย)
      for(let i = left; i <= mid; i++) {
        currentNodes[i].data.status = "discarded";
      }
      left = mid + 1;
      steps.push(currentNodes);
    } else {
      // ค่ามากไป ตัดครึ่งขวาทิ้งให้เป็นสีเทาให้หมด
      for(let i = mid; i <= right; i++) {
        currentNodes[i].data.status = "discarded";
      }
      right = mid - 1;
      steps.push(currentNodes);
    }
  }

  return steps;
}