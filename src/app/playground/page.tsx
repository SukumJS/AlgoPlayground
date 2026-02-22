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
import PostTest_portal from "@/src/components/shared/postTest_portal";
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
// import { sortAlgorithms } from "@/src/components/visualizer/algorithmsSort";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { useSortableDrag } from "@/src/hooks/useSortableDrag";
import { useSortSpeed } from "@/src/hooks/useSortSpeed";
// import { useSortRunner } from "@/src/hooks/useSortRunner";
import Reading_modal from "@/src/components/shared/reading_modal";
import { Info } from "lucide-react";
import StatusNode from "@/src/components/shared/statusNode";
import GoToHome_Portal from "@/src/components/shared/goToHome_Portal";
import { useStepSortEngine } from "@/src/hooks/useStepSortEngine";

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
    const [showInfo, setShowInfo] = useState(false);

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

    /* Hook สำหรับควบคุมความเร็ว animation */
    const { delayRef, setSpeed, speed } = useSortSpeed();

    /* Hook สำหรับ drag แล้ว swap node */
    const { onNodeDrag, onNodeDragStop } = useSortableDrag(setNodes, positionFromIndex);
    const {
        run,
        stop,
        nextStep,
        prevStep,
        skipBack,
        skipForward,
        isRunning,
    } = useStepSortEngine({
        algoType,
        nodes,
        setNodes,
        positionFromIndex,
        delayRef,
    });
    const controller = {
        run,
        stop,
        setSpeed,
        isRunning,
        speed,
        prevStep,
        nextStep,
        skipBack,
        skipForward,
    };

    {/*Check Type & Display Data Input of Current Algorithms */ }
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
                    /> //ตัวอย่าง http://localhost:3000/playground?type=insertion 
                );
        }
    };
    {/*Check Type & Display Title of Current Algorithms */ }

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
            <ReactFlow className={isRunning ? "sorting" : ""}

                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onDragOver={onDragOver}
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                nodesDraggable={!isRunning}
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

            {/* Add SideTab Component Here */}
            <SideTab title={getTitle()}>
                <div>
                    <CodeAlgo />
                    <ExplainAlgo />
                    {renderDataVisualizer()}
                </div>
                <div>
                    <PostTest_portal />
                </div>
            </SideTab>

            {/*Top Left Component show Info for reading how algo work & Status of Node in Playground Page */}
            <div className="absolute top-4 left-8 z-10 flex gap-2">
                <GoToHome_Portal />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo(true)
                    }}
                    className="rounded-full bg-white p-2 border border-gray-200 shadow-lg hover:shadow-lg hover:bg-gray-100 transition cursor-pointer">
                    <Info color='#000000' />
                </button>
                <StatusNode />
            </div>

            {/* Info Reading inside Playground */}
            <Reading_modal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)} />


            {/* STutorial Complelte Modal Show When User Finish Tutorial */}
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