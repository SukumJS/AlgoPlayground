import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export function generateBinarySearchSteps(
    nodes: Node<SortNodeData>[],
    target: number
) {
    const steps: Node<SortNodeData>[][] = [];
    
    // โคลนข้อมูลเริ่มต้น
    let currentNodes = JSON.parse(JSON.stringify(nodes));
    steps.push(JSON.parse(JSON.stringify(currentNodes))); // สเต็ปเริ่มต้น (ภาพก่อนหา)

    let left = 0;
    let right = currentNodes.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        // 🎬 Step 1: ไฮไลต์ตัวตรงกลาง (Mid) เป็นสีฟ้า เพื่อบอกว่า "กำลังเช็คตัวนี้นะ!"
        currentNodes = JSON.parse(JSON.stringify(currentNodes));
        currentNodes[mid].data.status = "compare"; 
        steps.push(JSON.parse(JSON.stringify(currentNodes)));

        const midValue = Number(currentNodes[mid].data.value);

        // 🎬 Step 2: ประมวลผลและหั่น Array
        currentNodes = JSON.parse(JSON.stringify(currentNodes));
        
        if (midValue === target) {
            // 🎯 เจอเป้าหมายแล้ว! เปลี่ยนเป็นสีเขียว แล้วจบการทำงาน
            currentNodes[mid].data.status = "found";
            steps.push(JSON.parse(JSON.stringify(currentNodes)));
            break; 
            
        } else if (midValue < target) {
            // ✂️ ค่าตรงกลาง "น้อยกว่า" เป้าหมาย แปลว่าฝั่งซ้ายทั้งหมด (รวมถึงตัวมันเอง) ใช้ไม่ได้แล้ว ตัดทิ้งให้เป็นสีเทา!
            for (let i = left; i <= mid; i++) {
                currentNodes[i].data.status = "discarded";
            }
            left = mid + 1; // ขยับขอบเขตซ้ายมาเริ่มที่ตัวถัดไป
            steps.push(JSON.parse(JSON.stringify(currentNodes)));
            
        } else {
            // ✂️ ค่าตรงกลาง "มากกว่า" เป้าหมาย แปลว่าฝั่งขวาทั้งหมด (รวมถึงตัวมันเอง) ใช้ไม่ได้แล้ว ตัดทิ้งให้เป็นสีเทา!
            for (let i = mid; i <= right; i++) {
                currentNodes[i].data.status = "discarded";
            }
            right = mid - 1; // ขยับขอบเขตขวามาจบที่ตัวก่อนหน้า
            steps.push(JSON.parse(JSON.stringify(currentNodes)));
        }
    }

    return steps;
}