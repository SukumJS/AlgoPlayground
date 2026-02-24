"use client";
import React, { useState, useCallback, DragEvent } from "react";
import ControlPanel from "../../components/shared/controlPanel";
import SideTab from "../../components/shared/sideTab";
import ExplainAlgo from "../../components/visualizer/explainAlgo";
import CodeAlgo from "../../components/visualizer/codeAlgo";
import Data_sort from "../../components/visualizer/data_sort";
import PostTest_portal from "@/src/components/shared/postTest_portal";
import {
    ReactFlow,
    Background,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Controls,
    type Node,
    type Edge,
    type FitViewOptions,
    type OnConnect,
    type OnNodesChange,
    type OnEdgesChange,
    type DefaultEdgeOptions,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import '@xyflow/react/dist/base.css';

// นำเข้า SortNode และ Type ที่เราแยกไว้
import SortNode, { type SortNodeData } from "@/src/components/shared/sortNode";
import { useSortableDrag } from "@/src/hooks/sort/useSortableDrag";
import { useExecutionSpeed } from "@/src/hooks/useExecutionSpeed";
import { useSortController } from "@/src/hooks/useSortController";
import Reading_modal from "@/src/components/shared/reading_modal";
import { Info } from "lucide-react";
import StatusNode from "@/src/components/shared/statusNode";
import GoToHome_Portal from "@/src/components/shared/goToHome_Portal";

// กำหนด Custom Node ให้ใช้ SortNode
const nodeTypes = {
    custom: SortNode,
};

// ค่าคงที่สำหรับคำนวณตำแหน่งของ node แต่ละตัว
const NODE_WIDTH = 65;
// ฟังก์ชันสำหรับคำนวณตำแหน่งจาก index
const positionFromIndex = (index: number) => ({
    x: index * NODE_WIDTH,
    y: 5,
});

const initialNodes: Node<SortNodeData>[] = [
    { id: "1", type: "custom", position: positionFromIndex(0), data: { value: 1, index: 0, status: "idle" } },
    { id: "2", type: "custom", position: positionFromIndex(1), data: { value: 2, index: 1, status: "idle" } },
    { id: "3", type: "custom", position: positionFromIndex(2), data: { value: 3, index: 2, status: "idle" } },
    { id: "4", type: "custom", position: positionFromIndex(3), data: { value: 4, index: 3, status: "idle" } },
    { id: "5", type: "custom", position: positionFromIndex(4), data: { value: 5, index: 4, status: "idle" } },
];

const initialEdges: Edge[] = [];
const fitViewOptions: FitViewOptions = { padding: 0.2 };
const defaultEdgeOptions: DefaultEdgeOptions = { animated: true };

// รับค่า algorithm มาจาก page.tsx 
export default function PlaygroundSort({ algorithm }: { algorithm: string }) {
    // state สำหรับ input ใน sorting
    const [nodes, setNodes] = useState<Node<SortNodeData>[]>(initialNodes);
    const [nodeInput, setNodeInput] = useState<number>(0);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [showInfo, setShowInfo] = useState(false);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds) as Node<SortNodeData>[]),
        []
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        []
    );

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    /* Hook สำหรับควบคุมความเร็ว animation */
    const { delayRef, setSpeed, speed } = useExecutionSpeed();

    /* Hook สำหรับ drag แล้ว swap node */
    const { onNodeDrag, onNodeDragStop } = useSortableDrag(setNodes, positionFromIndex);

    const controller = useSortController({
        algoType: algorithm,
        nodes,
        setNodes,
        positionFromIndex,
        delayRef,
        setSpeed,
        speed,
    });

    return (
        <div className="w-screen h-screen">
            <ReactFlow
                className={controller.isRunning ? "sorting" : ""}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onDragOver={onDragOver}
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                nodesDraggable={!controller.isRunning}
                fitView
                fitViewOptions={fitViewOptions}
                defaultEdgeOptions={defaultEdgeOptions}
            >
                <Background />
                <Controls />
            </ReactFlow>

            <div className="absolute bottom-4 w-full z-10">
                <ControlPanel controller={controller} />
            </div>

            <SideTab title="Sorting Algorithms">
                <div>
                    <CodeAlgo />
                    <ExplainAlgo />
                    <Data_sort
                        nodeInput={nodeInput}
                        setNodeInput={setNodeInput}
                    />
                </div>
                <div>
                    <PostTest_portal />
                </div>
            </SideTab>

            <div className="absolute top-4 left-8 z-10 flex gap-2">
                <GoToHome_Portal />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo(true);
                    }}
                    className="rounded-full bg-white p-2 border border-gray-200 shadow-lg hover:shadow-lg hover:bg-gray-100 transition cursor-pointer"
                >
                    <Info color="#000000" />
                </button>
                <StatusNode />
            </div>

            <Reading_modal isOpen={showInfo} onClose={() => setShowInfo(false)} />
        </div>
    );
}