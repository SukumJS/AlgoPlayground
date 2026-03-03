import type { ExplanationContext } from "../explanationUtils";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export const explainInsertionSort = (
    ctx: ExplanationContext<SortNodeData>
): string | undefined => {
    // หาโหนดที่มีสถานะต่างๆ ใน step ปัจจุบัน
    const compareNodes = ctx.currentNodes.filter((n) => n.data.status === "compare");
    const swapNodes = ctx.currentNodes.filter((n) => n.data.status === "swap");

    // จังหวะ Lift (ยกขึ้น): มีโหนดเดียวที่เป็นสถานะ compare (กำลังถูกหยิบ)
    if (compareNodes.length === 1 && swapNodes.length === 0) {
        const target = compareNodes[0];
        return `Lifting ${target.data.value} to find its correct position.`;
    }

    // 2จังหวะ Compare (เทียบค่า): มีโหนดสองตัวกำลังเทียบกัน
    if (compareNodes.length === 2) {
        // หาตัวที่กำลังลอยอยู่ (y น้อยกว่า) และตัวที่อยู่บนพื้น
        const target = compareNodes.find((n) => n.position.y < 0) || compareNodes[1];
        const floorNode = compareNodes.find((n) => n.id !== target.id)!;
        return `Comparing: is ${target.data.value} less than ${floorNode.data.value}?`;
    }

    // จังหวะ Shift (เลื่อน): โหนดเปลี่ยนเป็นสถานะ swap
    if (swapNodes.length === 2) {
        // หาตัวที่อยู่บนพื้น (กำลังถูกเลื่อนไปทางขวา)
        const shiftNode = swapNodes.find((n) => n.position.y >= 0) || swapNodes[0];
        return `Since it is greater, shifting ${shiftNode.data.value} to the right to make space.`;
    }

    // จังหวะ Drop (วางลง): เช็คว่าตัวที่เคยลอยอยู่ (compare) กลายเป็น (idle) หรือไม่
    const prevCompare = ctx.prevNodes.find(
        (n) => n.data.status === "compare" && n.position.y < 0
    );
    const currIdle = ctx.currentNodes.find(
        (n) => n.id === prevCompare?.id && n.data.status === "idle"
    );

    if (prevCompare && currIdle) {
        return `Found the correct position. Dropping ${currIdle.data.value} into the slot.`;
    }

    // Default fallback ในกรณีที่กำลังเปลี่ยนผ่าน state
    return "Sorting the array...";
};
