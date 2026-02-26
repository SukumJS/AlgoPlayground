import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export const generateInsertionSteps = (
    nodes: Node<SortNodeData>[],
    positionFromIndex: (index: number) => { x: number; y: number }
) => {
    const BASE_Y = 5;
    const LIFT_OFFSET = 60;
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

        // Lift: ยกตัวที่จะแทรกขึ้นมา และเปลี่ยนสีเป็นกำลังทำงาน (compare)
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

            // Compare: เปลี่ยนสีตัวซ้ายมือให้เป็นสีเปรียบเทียบ (compare)
            arr = arr.map((node) =>
                node.id === shiftNodeId || node.id === targetNodeId
                    ? { ...node, data: { ...node.data, status: "compare" as const } }
                    : node
            );
            pushStep();

            // Shift (Swap Phase): เปลี่ยนสีเป็น "swap" ตอนกำลังเลื่อนผ่านกัน
            arr = arr.map((node) => {
                if (node.id === shiftNodeId) {
                    return {
                        ...node,
                        data: { ...node.data, index: j, status: "swap" as const }, // เปลี่ยนเป็นสี swap
                        position: positionFromIndex(j), // สไลด์ไปทางขวา
                    };
                }
                if (node.id === targetNodeId) {
                    return {
                        ...node,
                        data: { ...node.data, index: j - 1, status: "swap" as const }, // เปลี่ยนเป็นสี swap
                        position: {
                            x: positionFromIndex(j - 1).x, // สไลด์ไปรอข้างบน
                            y: BASE_Y - LIFT_OFFSET,
                        },
                    };
                }
                return node;
            });

            // สลับตำแหน่งใน Array จริงๆ เพื่อให้ลูปทำงานต่อไปได้
            const temp = arr[j];
            arr[j] = arr[j - 1];
            arr[j - 1] = temp;

            pushStep();

            //  Reset Shifted Node: คืนค่าสีตัวที่เลื่อนไปแล้วให้กลับเป็นปกติ (idle)
            arr = arr.map((node) =>
                node.id === shiftNodeId
                    ? { ...node, data: { ...node.data, status: "idle" as const } }
                    : node
            );
            // โครงค้างตัว targetNodeId ไว้เป็นสี compare หรือ swap เพื่อให้รู้ว่ายังถือลอยอยู่
            arr = arr.map((node) =>
                node.id === targetNodeId
                    ? { ...node, data: { ...node.data, status: "compare" as const } }
                    : node
            );
            pushStep();

            j--;
        }

        //  Drop: วางตัวที่ยกลงในช่องว่าง และคืนสีเป็นปกติ (idle)
        arr = arr.map((node) => {
            if (node.id === targetNodeId) {
                return {
                    ...node,
                    data: { ...node.data, status: "idle" as const, index: j },
                    position: positionFromIndex(j), // สไลด์ลงมาที่ตำแหน่งใหม่
                };
            }
            return node;
        });
        pushStep();
    }

    // Mark sorted: เมื่อทำครบทุกตัว ถือว่าจัดเรียงเสร็จสิ้น เปลี่ยนทุกตัวเป็นสี sorted
    arr = arr.map((node) => ({
        ...node,
        data: { ...node.data, status: "sorted" as const },
    }));
    pushStep();

    return steps;
};