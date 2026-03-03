"use client";
import React, { useState, useCallback, DragEvent, useMemo } from "react";
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
  useReactFlow,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type DefaultEdgeOptions,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@xyflow/react/dist/base.css";

// นำเข้า SortNode และ Type ที่เราแยกไว้
import SortNode, { type SortNodeData } from "@/src/components/shared/sortNode";
import { useSortableDrag } from "@/src/hooks/sort/useSortableDrag";
import { useExecutionSpeed } from "@/src/hooks/useExecutionSpeed";
import { useSortController } from "@/src/hooks/useSortController";
import Reading_modal from "@/src/components/shared/reading_modal";
import { Info, Trash2 } from "lucide-react";
import StatusNode from "@/src/components/shared/statusNode";
import GoToHome_Portal from "@/src/components/shared/goToHome_Portal";
import { useSortTutorial } from "@/src/hooks/useSortTutorial";
import TutorialSort from "@/src/components/visualizer/tutorial_sort";
import Tutorial_modal from "@/src/components/shared/tutorial_modal";

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
  {
    id: "1",
    type: "custom",
    position: positionFromIndex(0),
    data: { value: 3, index: 0, status: "idle" },
  },
  {
    id: "2",
    type: "custom",
    position: positionFromIndex(1),
    data: { value: 34, index: 1, status: "idle" },
  },
  {
    id: "3",
    type: "custom",
    position: positionFromIndex(2),
    data: { value: 64, index: 2, status: "idle" },
  },
  {
    id: "4",
    type: "custom",
    position: positionFromIndex(3),
    data: { value: 12, index: 3, status: "idle" },
  },
  {
    id: "5",
    type: "custom",
    position: positionFromIndex(4),
    data: { value: 22, index: 4, status: "idle" },
  },
  {
    id: "6",
    type: "custom",
    position: positionFromIndex(5),
    data: { value: 25, index: 5, status: "idle" },
  },
];

const initialEdges: Edge[] = [];
const fitViewOptions: FitViewOptions = { padding: 0.2 };
const defaultEdgeOptions: DefaultEdgeOptions = { animated: true };

// 1️⃣ สร้าง Object ไว้แปลงชื่อ Algorithm
const algorithmNames: Record<string, string> = {
  "bubble-sort": "Bubble Sort",
  "selection-sort": "Selection Sort",
  "insertion-sort": "Insertion Sort",
  "merge-sort": "Merge Sort",
};

export default function PlaygroundSort({ algorithm }: { algorithm: string }) {
  const [nodes, setNodes] = useState<Node<SortNodeData>[]>(initialNodes);
  const [nodeInput, setNodeInput] = useState<number | string>(11);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [explanation, setExplanation] = useState<string>(
    "This section will explain the algorithm's steps. Click 'Run' to start.",
  );

  // ดึงชื่อจาก Mapping (ถ้าไม่ตรงให้ใช้ชื่อเดิม หรือค่า Default)
  const prettyName = algorithm
    ? algorithmNames[algorithm] || "Sorting Algorithms"
    : "Sorting Algorithms";

  // reset default explanation when the algorithm changes
  React.useEffect(() => {
    if (algorithm) {
      setExplanation(
        `This section will explain ${prettyName}. Click 'Run' to start.`,
      );
    }
  }, [algorithm, prettyName]);
  const [showInfo, setShowInfo] = useState(false);

  const { flowToScreenPosition } = useReactFlow();

  const tutorial = useSortTutorial({
    nodes,
    flowToScreenPosition,
    setNodes,
    isSort: true,
  });

  const onNodesChange: OnNodesChange = useCallback(
    (changes) =>
      setNodes((nds) => applyNodeChanges(changes, nds) as Node<SortNodeData>[]),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const { delayRef, setSpeed, speed } = useExecutionSpeed();
  const {
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    isDraggingNode,
    isTrashActive,
  } = useSortableDrag(setNodes, positionFromIndex);

  const controller = useSortController({
    algoType: algorithm,
    nodes,
    setNodes,
    positionFromIndex,
    delayRef,
    setSpeed,
    speed,
    setExplanation,
  });

  //แมปข้อมูลเพื่อ "สตาฟ" กล่องที่ไม่เกี่ยวข้อง
  const displayNodes = useMemo(() => {
    return nodes.map((node) => {
      let canDrag = !controller.isRunning;

      if (tutorial.showTutorial) {
        canDrag = false;

        const val = String(node.data.value);
        if (tutorial.tutorialStep === 1 && val === "34") {
          canDrag = true;
        }
        if (
          (tutorial.tutorialStep === 3 || tutorial.tutorialStep === 4) &&
          val === "3"
        ) {
          canDrag = true;
        }
      }

      return { ...node, draggable: canDrag };
    });
  }, [
    nodes,
    controller.isRunning,
    tutorial.showTutorial,
    tutorial.tutorialStep,
  ]);

  const handleNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      onNodeDragStart(event, node, allNodes);
      if (tutorial.showTutorial) {
        tutorial.onNodeDragStart(event, node as Node<SortNodeData>);
      }
    },
    [onNodeDragStart, tutorial],
  );

  const handleNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      //เรียกใช้ของเดิม เพื่อให้มันเกิด Live-swap ดันกล่องอื่นสลับที่
      onNodeDrag(event, node, allNodes);

      if (tutorial.showTutorial) {
        tutorial.onNodeDrag(event, node as Node<SortNodeData>);
      }
    },
    [onNodeDrag, tutorial],
  );

  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      // เรียกใช้ของเดิม เพื่อให้มัน Snap เข้า Grid
      onNodeDragStop(event, node, allNodes);

      if (tutorial.showTutorial) {
        tutorial.onNodeDragStop(event, node as Node<SortNodeData>);
      }
    },
    [onNodeDragStop, tutorial],
  );

  const { showTutorial, handleTutorialDropSuccess } = tutorial;

  const sideTabMemo = useMemo(
    () => (
      <SideTab title={prettyName}>
        <div>
          <CodeAlgo />
          <ExplainAlgo
            isOpen={true}
            onToggle={() => {}}
            explanation={explanation}
            algoType={algorithm}
            algoName={prettyName}
          />
          <Data_sort
            nodeInput={nodeInput}
            setNodeInput={setNodeInput}
            tutorialMode={showTutorial}
            onTutorialDropSuccess={() => {
              handleTutorialDropSuccess();
              setNodeInput("");
            }}
          />
        </div>
        <div>
          <PostTest_portal />
        </div>
      </SideTab>
    ),
    [
      nodeInput,
      explanation,
      algorithm,
      prettyName,
      showTutorial,
      handleTutorialDropSuccess,
    ],
  );

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        className={controller.isRunning ? "sorting" : ""}
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        panOnDrag={!tutorial.showTutorial}
        zoomOnScroll={!tutorial.showTutorial}
        zoomOnPinch={!tutorial.showTutorial}
        zoomOnDoubleClick={!tutorial.showTutorial}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background />
        {!tutorial.showTutorial && <Controls />}
      </ReactFlow>

      <div className="absolute bottom-4 w-full z-10">
        <ControlPanel controller={controller} />
      </div>

      {sideTabMemo}

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
      {!tutorial.showTutorial && isDraggingNode && (
        <div
          className={`fixed z-[65] flex items-center justify-center w-16 h-16 rounded-full bg-[#E53E3E] shadow-lg border-2 border-[#5D5D5D] transition-transform duration-200 ${isTrashActive ? "scale-125" : ""}`}
          style={{
            bottom: "140px",
            left: "50%",
            transform: "translateX(-50%)",
            boxShadow: isTrashActive
              ? "0 0 30px 10px rgba(229, 62, 62, 0.8)"
              : "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Trash2 color="white" size={32} />
        </div>
      )}

      <Reading_modal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      {tutorial.showTutorial && (
        <TutorialSort
          onComplete={tutorial.handleTutorialComplete}
          currentStep={tutorial.tutorialStep}
          setCurrentStep={tutorial.setTutorialStep}
          droppedNodeScreenPos={tutorial.droppedNodeScreenPos}
          node34ScreenPos={tutorial.node34ScreenPos}
          node64ScreenPos={tutorial.node64ScreenPos}
          node3ScreenPos={tutorial.node3ScreenPos}
          sidebarNodePos={tutorial.sidebarNodePos}
          dropZoneScreenPos={tutorial.dropZoneScreenPos}
          isTrashActive={tutorial.isTrashActive}
          trashBinPos={tutorial.trashBinPos}
          nodeMaskSize={tutorial.nodeMaskSize}
        />
      )}

      {tutorial.showCompletionModal && (
        <Tutorial_modal
          showModal={tutorial.showCompletionModal}
          onClose={() => tutorial.setShowCompletionModal(false)}
          tutorialContent={[
            {
              title: "Tutorial Complete!",
              description: "You are now ready to explore Sorting Algorithms.",
            },
          ]}
        />
      )}
    </div>
  );
}
