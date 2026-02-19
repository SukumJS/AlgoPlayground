"use client";
import React, { useState, useCallback, Suspense, DragEvent, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "../../components/shared/controlPanel";
import SideTab from "../../components/shared/sideTab";
import ExplainAlgo from "../../components/visualizer/explainAlgo";
import CodeAlgo from "../../components/visualizer/codeAlgo";
import Data_sort from "../../components/visualizer/data_sort";
import { DnDProvider, useDnD } from "@/src/components/visualizer/useDnD";
import Tutorial_modal from "../../components/shared/tutorial_modal";
import {
    ReactFlow,
    ReactFlowProvider,
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
    type OnNodeDrag,
    type DefaultEdgeOptions,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Data_tree from "@/src/components/visualizer/data_tree";
import Data_graph from "@/src/components/visualizer/data_graph";
import CustomNode from "@/src/components/shared/customNode";
import '@xyflow/react/dist/base.css';
import { sortAlgorithms } from "@/src/components/visualizer/algorithmsSort";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { useSortableDrag } from "@/src/hooks/useSortableDrag";
import { useSortSpeed } from "@/src/hooks/useSortSpeed";
import { useSortRunner } from "@/src/hooks/useSortRunner";
const nodeTypes = {
    custom: CustomNode,
};
// ค่าคงที่สำหรับคำนวณตำแหน่งของ node แต่ละตัว
const NODE_WIDTH = 65;
//ฟังก์ชันสำหรับคำนวณตำแหน่งจาก index
const positionFromIndex = (index: number) => ({
    x: index * NODE_WIDTH,
    y: 5,
});


/* This block of code is setting up initial data for a visualizer component using ReactFlow library in
a TypeScript React application. Here's a breakdown of what each constant is doing: */
// const initialNodes: Node[] = [
//     { id: "1", type: "custom", data: { label : "1" }, position: { x: -50, y: 5 }},
//     { id: "2", type: "custom", data: { label: "2" }, position: { x: 15, y: 5}},
//     { id: "3", type: "custom", data: { label: "3" }, position: { x: 80, y: 5}},
//     { id: "4", type: "custom", data: { label: "4" }, position: { x: 145, y: 5}},
//     { id: "5", type: "custom", data: { label: "5" }, position: { x: 210, y: 5}},
// ];
const initialNodes: Node<SortNodeData>[] = [
    { id: "1", type: "custom", position: positionFromIndex(0), data: { value: 1, index: 0, status: "idle" } },
    { id: "2", type: "custom", position: positionFromIndex(1), data: { value: 2, index: 1, status: "idle" } },
    { id: "3", type: "custom", position: positionFromIndex(2), data: { value: 3, index: 2, status: "idle" } },
    { id: "4", type: "custom", position: positionFromIndex(3), data: { value: 4, index: 3, status: "idle" } },
    { id: "5", type: "custom", position: positionFromIndex(4), data: { value: 5, index: 4, status: "idle" } },
];

// const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];
const initialEdges: Edge[] = [];
const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
};

const onNodeDrag: OnNodeDrag = (_, node) => {
    console.log("drag event", node.data);
};

/*  defining a function `getId` that returns a string value with a dynamic ID. */
let id = 0;
const getId = (): string => `dndnode_${id++}`;

function Playground() {
    const searchParams = useSearchParams();
    const algoType = searchParams.get("type");
    //state สำหรับ input ใน sorting
    const [nodes, setNodes] = useState<Node<SortNodeData>[]>(initialNodes);
    const [nodeInput, setNodeInput] = useState<number>(0);


    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [showTutorial, setShowTutorial] = useState(true);
    /* These three constants are defining functions that handle changes to nodes, edges, and
    connections in the ReactFlow component. */
    const onNodesChange: OnNodesChange = useCallback(
        (changes) =>
            setNodes((nds) =>
                applyNodeChanges(changes, nds) as Node<SortNodeData>[]
            ),
        []
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );
    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    /* Hook สำหรับ drag แล้ว swap node */
    const { onNodeDrag, onNodeDragStop } =
        useSortableDrag(setNodes, positionFromIndex);
    /* Hook สำหรับควบคุมความเร็ว animation */
    const { delayRef, setSpeed } =
        useSortSpeed();

    /* Hook สำหรับควบคุมการรัน algorithm */
    const { handleRunSort, handleStop, isSorting } =
        useSortRunner(
            nodes,
            setNodes,
            algoType,
            positionFromIndex,
            delayRef
        );

    const renderDataVisualizer = () => {
        switch (algoType) {
            case "tree":
                return <Data_tree />;
            case 'graph':
                return <Data_graph />;
            default:
                return (
                    <Data_sort
                        nodeInput={nodeInput}
                        setNodeInput={setNodeInput}
                    />
                );
        }
    };
    const getTitle = () => {
        switch (algoType) {
            case "tree":
                return "Tree Algorithms";
            case 'graph':
                return 'Graph Algorithms';
            default:
                return "Sorting Algorithms";
        }
    };
    return (
        <div className={`w-screen h-screen  `}>
            {/* Implement Change page to canvas */}
            <ReactFlow className={isSorting ? "sorting" : ""}

                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onDragOver={onDragOver}
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                fitView
                fitViewOptions={fitViewOptions}
                defaultEdgeOptions={defaultEdgeOptions}
                
            >
                <Background />
                <Controls />
            </ReactFlow>

            <div className="absolute bottom-4 w-full z-50">
                <ControlPanel
                    onRun={handleRunSort}
                    onStop={handleStop}
                    onSpeedChange={setSpeed}
                />
            </div>

            {/* Add SideTab Component Here */}
            <SideTab title={getTitle()}>
                <CodeAlgo />
                <ExplainAlgo />
                {renderDataVisualizer()}
            </SideTab>

            {/* <Tutorial_modal
            showModal={showTutorial}
            onClose={() => setShowTutorial(false)}
            tutorialContent={[{
                title: "Tutorial Complete!",
                description: "You are ready to play."
            }]} 
        /> */}
        </div>

    );
}

export default function Page() {
    return (
        <ReactFlowProvider>
            <DnDProvider>
                <Suspense fallback={<div>Loading...</div>}>
                    <Playground />
                </Suspense>
            </DnDProvider>
        </ReactFlowProvider>
    );
}