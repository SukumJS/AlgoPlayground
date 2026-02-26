import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export const generateInsertionSteps = (
    nodes: Node<SortNodeData>[],
    positionFromIndex: (index: number) => { x: number; y: number }
) => {
    const BASE_Y = 5;
    const LIFT_OFFSET = 40;
    let arr: Node<SortNodeData>[] = [...nodes]
        .map((node): Node<SortNodeData> => ({
            ...node,
            position: positionFromIndex(node.data.index),
            data: {
                ...node.data,
                status: "idle",
            },
        }))
        .sort((a, b) => a.data.index - b.data.index);

    const steps: Node<SortNodeData>[][] = [];

    const pushStep = () => {
        steps.push(
            arr.map((node) => ({
                ...node,
                position: { ...node.position },
                data: { ...node.data },
            }))
        );
    };
    pushStep(); // Initial state

    const n = arr.length;

    for (let i = 1; i < n; i++) {
        let j = i;
        const targetNodeId = arr[i].id;
        const targetValue = arr[i].data.value;

        // 1️⃣ Lift: ยกตัวที่จะแทรกขึ้นมาพักไว้
        arr = arr.map((node) =>
            node.id === targetNodeId
                ? {
                      ...node,
                      data: { ...node.data, status: "compare" as const },
                      position: {
                          x: node.position.x,
                          y: BASE_Y - LIFT_OFFSET,
                      },
                  }
                : node
        );
        pushStep();

        while (j > 0 && arr[j - 1].data.value > targetValue) {
            const shiftNodeId = arr[j - 1].id;

            // 2️⃣ Compare: ไฮไลท์ตัวที่จะเทียบด้วย (ตัวซ้ายมือ)
            arr = arr.map((node) =>
                node.id === shiftNodeId
                    ? { ...node, data: { ...node.data, status: "compare" as const } }
                    : node
            );
            pushStep();

            // 3️⃣ Shift: เลื่อนตัวที่มากกว่าไปทางขวา 1 ช่อง และเลื่อนตัวที่ลอยอยู่ไปทางซ้ายบน
            arr = arr.map((node) => {
                if (node.id === shiftNodeId) {
                    return {
                        ...node,
                        data: { ...node.data, index: j, status: "idle" as const }, // อัปเดต index และเคลียร์ status
                        position: positionFromIndex(j), // สไลด์ไปทางขวา
                    };
                }
                if (node.id === targetNodeId) {
                    return {
                        ...node,
                        data: { ...node.data, index: j - 1 }, // อัปเดต index ของตัวที่ลอยอยู่
                        position: {
                            x: positionFromIndex(j - 1).x, // สไลด์ตามไปรอด้านบนของช่องว่าง
                            y: BASE_Y - LIFT_OFFSET,
                        },
                    };
                }
                return node;
            });

            // สลับตำแหน่งใน Array จริงๆ เพื่อให้ลูปทำงานต่อไปได้ถูกต้อง
            const temp = arr[j];
            arr[j] = arr[j - 1];
            arr[j - 1] = temp;

            pushStep();
            j--;
        }

        // 4️⃣ Drop: วางตัวที่ยกไว้ลงในช่องว่างที่ถูกต้อง
        arr = arr.map((node) => {
            if (node.id === targetNodeId) {
                return {
                    ...node,
                    data: { ...node.data, status: "idle" as const },
                    position: positionFromIndex(j), // ตกลงมาที่ Base Y
                };
            }
            return node;
        });
        pushStep();
    }

    // Mark sorted: เมื่อทำครบทุกตัว ถือว่าจัดเรียงเสร็จสิ้น
    arr = arr.map((node) => ({
        ...node,
        data: { ...node.data, status: "sorted" as const },
    }));
    pushStep();

    return steps;
};