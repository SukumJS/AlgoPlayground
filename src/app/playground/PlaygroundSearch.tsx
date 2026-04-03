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
import SortNode, { type SortNodeData } from "@/src/components/shared/sortNode";
import { useSortableDrag } from "@/src/hooks/sort/useSortableDrag";
import { useExecutionSpeed } from "@/src/hooks/useExecutionSpeed";
import { useStepSearchEngine } from "@/src/hooks/search/useStepSearchEngine";
import Reading_modal from "@/src/components/shared/reading_modal";
import { Info, Trash2 } from "lucide-react";
import StatusNode from "@/src/components/shared/statusNode";
import GoToHome_Portal from "@/src/components/shared/goToHome_Portal";
import { useSearchTutorial } from "@/src/hooks/useSearchTutorial";
import TutorialSearch from "@/src/components/visualizer/tutorial_search";
import Tutorial_modal from "@/src/components/shared/tutorial_modal";

// กำหนด Custom Node ให้ใช้ SortNode
const nodeTypes = {
  custom: SortNode,
};

// ค่าคงที่สำหรับคำนวณตำแหน่งของ node แต่ละตัว
const NODE_WIDTH = 65;
const positionFromIndex = (index: number) => ({
  x: index * NODE_WIDTH,
  y: 5,
});

const initialNodes: Node<SortNodeData>[] = [
  {
    id: "1",
    type: "custom",
    position: positionFromIndex(0),
    data: { value: 1, index: 0, status: "idle" },
  },
  {
    id: "2",
    type: "custom",
    position: positionFromIndex(1),
    data: { value: 2, index: 1, status: "idle" },
  },
  {
    id: "3",
    type: "custom",
    position: positionFromIndex(2),
    data: { value: 3, index: 2, status: "idle" },
  },
  {
    id: "4",
    type: "custom",
    position: positionFromIndex(3),
    data: { value: 4, index: 3, status: "idle" },
  },
  {
    id: "5",
    type: "custom",
    position: positionFromIndex(4),
    data: { value: 5, index: 4, status: "idle" },
  },
];

const initialEdges: Edge[] = [];
const fitViewOptions: FitViewOptions = { padding: 0.2 };
const defaultEdgeOptions: DefaultEdgeOptions = { animated: true };

// Object ไว้แปลงชื่อ Algorithm แบบเดียวกับ Sort
const algorithmNames: Record<string, string> = {
  "linear-search": "Linear Search",
  "binary-search": "Binary Search",
};

export default function PlaygroundSearch({ algorithm }: { algorithm: string }) {
  const [nodes, setNodes] = useState<Node<SortNodeData>[]>(initialNodes);
  const [nodeInput, setNodeInput] = useState<number | string>("6");
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [targetValue, setTargetValue] = useState<number | string>("");
  const [explanation, setExplanation] = useState<string>(
    "This section will explain the algorithm's steps. Click 'Run' to start.",
  );
  const [showInfo, setShowInfo] = useState(false);

  const prettyName = algorithm
    ? algorithmNames[algorithm] || "Searching Algorithms"
    : "Searching Algorithms";

  React.useEffect(() => {
    if (algorithm) {
      setExplanation(
        `This section will explain ${prettyName}. Click 'Run' to start.`,
      );
    }
  }, [algorithm, prettyName]);

  const { flowToScreenPosition, setCenter, getZoom } = useReactFlow();

  const tutorial = useSearchTutorial({
    nodes,
    flowToScreenPosition,
    setNodes,
    isSearch: true,
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

  const [showBinaryWarning, setShowBinaryWarning] = useState(false);

  // ฟังก์ชันดักจับ: เช็คว่ากล่องบนหน้าจอเรียงลำดับตัวเลขจากน้อยไปมากหรือยัง
  const checkIsSorted = useCallback(() => {
    // 1. เรียงลำดับกล่องตามตำแหน่ง X (ซ้ายไปขวา) เผื่อว่าคนเล่นลากสลับตำแหน่งกัน
    const sortedByX = [...nodes].sort((a, b) => a.position.x - b.position.x);

    // 2. เช็คว่าค่า value ข้างในเรียงจากน้อยไปมากหรือไม่
    for (let i = 0; i < sortedByX.length - 1; i++) {
      if (
        Number(sortedByX[i].data.value) > Number(sortedByX[i + 1].data.value)
      ) {
        return false; // เจอตัวที่ไม่เรียง! ส่ง false กลับไป
      }
    }
    return true; // เรียงถูกต้องแล้ว
  }, [nodes]);
  const {
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    isDraggingNode,
    isTrashActive,
  } = useSortableDrag(setNodes, positionFromIndex);

  const engine = useStepSearchEngine({
    algoType: algorithm,
    nodes,
    setNodes,
    setExplanation,
    target: Number(targetValue) || 0,
    delayRef,
  });

  const controller = {
    ...engine,
    setSpeed,
    speed,
    run: () => {
      // ถ้าเลือก Binary Search และแอนิเมชันยังไม่ได้เริ่ม
      if (algorithm === "binary-search" && !engine.isRunning) {
        // ให้เช็คว่าข้อมูลเรียงหรือยัง
        if (!checkIsSorted()) {
          setShowBinaryWarning(true); // ข้อมูลไม่เรียง -> เด้ง Modal
          return;
        }
      }
      engine.run();
    },
  };

  // ระบบ Smart Camera (กล้องติดตามกล่องที่กำลังทำงาน)
  const isUserPanning = React.useRef(false);
  const lastPannedPosition = React.useRef<{ id: string; x: number } | null>(
    null,
  );

  React.useEffect(() => {
    // ถ้าไม่ได้รันอยู่ ให้ล้างค่าความจำกล้องทิ้ง
    if (!controller.isRunning) {
      lastPannedPosition.current = null;
      return;
    }

    // ถ้าคนเล่นกำลังเอามือลากจออยู่ ให้พักกล้องอัตโนมัติ
    if (isUserPanning.current) return;

    //หากล่องที่กำลังทำงานอยู่ (สำหรับหน้า Search คือ compare หรือ processing)
    const activeNode = nodes.find(
      (n) => n.data.status === "compare" || n.data.status === "processing",
    );

    if (activeNode) {
      const isSameNode = lastPannedPosition.current?.id === activeNode.id;
      const isSamePos = lastPannedPosition.current?.x === activeNode.position.x;

      // เลื่อนกล้องเมื่อเปลี่ยนกล่อง หรือกล่องขยับ
      if (!isSameNode || !isSamePos) {
        lastPannedPosition.current = {
          id: activeNode.id,
          x: activeNode.position.x,
        };

        setCenter(
          activeNode.position.x + 32.5, // 32.5 คือระยะครึ่งกล่อง ให้ภาพอยู่ตรงกลาง
          activeNode.position.y + 25,
          { zoom: 1.5, duration: 600 }, //  ซูมเข้าไปที่ 1.5 (150%) เพื่อให้เห็นชัดๆ
        );
      }
    }
  }, [nodes, controller.isRunning, setCenter, getZoom]);

  const handleNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      onNodeDragStart?.(event, node, allNodes);
      if (tutorial.showTutorial)
        tutorial.onNodeDragStart(event, node as Node<SortNodeData>);
    },
    [onNodeDragStart, tutorial],
  );

  const handleNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      onNodeDrag(event, node, allNodes);
      if (tutorial.showTutorial)
        tutorial.onNodeDrag(event, node as Node<SortNodeData>);
    },
    [onNodeDrag, tutorial],
  );

  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      onNodeDragStop(event, node, allNodes);
      if (tutorial.showTutorial)
        tutorial.onNodeDragStop(event, node as Node<SortNodeData>);
    },
    [onNodeDragStop, tutorial],
  );

  const displayNodes = useMemo(() => {
    return nodes.map((node) => {
      let canDrag = !controller.isRunning;

      if (tutorial.showTutorial) {
        canDrag = false;
        const val = String(node.data.value);
        if (tutorial.tutorialStep === 1 && val === "2") canDrag = true;
        if (
          (tutorial.tutorialStep === 3 || tutorial.tutorialStep === 4) &&
          val === "1"
        )
          canDrag = true;
      }
      return { ...node, draggable: canDrag };
    });
  }, [
    nodes,
    controller.isRunning,
    tutorial.showTutorial,
    tutorial.tutorialStep,
  ]);

  const engineRef = React.useRef(engine);
  React.useEffect(() => {
    engineRef.current = engine;
  }, [engine]);

  const handleTargetChange = useCallback((val: number | string) => {
    engineRef.current.stop();
    setTargetValue(val);
  }, []);

  const { showTutorial, handleTutorialDropSuccess } = tutorial;

  const sideTabMemo = useMemo(
    () => (
      <SideTab title={prettyName}>
        <div>
          <CodeAlgo />
          <ExplainAlgo explanation={explanation} />
          <Data_sort
            nodeInput={nodeInput}
            setNodeInput={setNodeInput}
            targetValue={targetValue}
            setTargetValue={handleTargetChange}
            tutorialMode={showTutorial}
            onTutorialDropSuccess={() => {
              handleTutorialDropSuccess();
              setNodeInput("");
            }}
            isRunning={controller.isRunning}
            algorithm={algorithm}
          />
        </div>
        <div>
          <PostTest_portal algorithm={algorithm} algoType="search" />
        </div>
      </SideTab>
    ),
    [
      nodeInput,
      targetValue,
      explanation,
      prettyName,
      algorithm,
      handleTargetChange,
      showTutorial,
      handleTutorialDropSuccess,
      controller.isRunning,
    ],
  );

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        className={controller.isRunning ? "sorting" : ""}
        nodes={displayNodes}
        edges={edges}
        onMoveStart={(event) => {
          if (event) {
            isUserPanning.current = true;
          }
        }}
        onMoveEnd={(event) => {
          if (event) {
            // เมื่อคนเล่นปล่อยเมาส์ ให้หน่วงเวลา 1.5 วินาที กล้องถึงจะกลับมาทำงาน
            setTimeout(() => {
              isUserPanning.current = false;
            }, 1500);
          }
        }}
        onNodesChange={showTutorial ? undefined : onNodesChange}
        onEdgesChange={showTutorial ? undefined : onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        panOnDrag={!showTutorial}
        zoomOnScroll={!showTutorial}
        zoomOnPinch={!showTutorial}
        zoomOnDoubleClick={!showTutorial}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background />
        {!showTutorial && <Controls />}
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
      {/* Modal แจ้งเตือน Binary Search */}
      {showBinaryWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full   transform scale-100">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
              Data is Not Sorted!
            </h2>
            <div className="text-gray-700 space-y-3 mb-8">
              <p>
                <strong>Binary Search</strong> requires the data to be a{" "}
                <strong>Sorted Array</strong> (in ascending order).
              </p>
              <p className="bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                If the elements are out of order, the algorithm is logic will
                fail. It might accidentally discard the half that contains your
                target number, resulting in a Not Found error!
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBinaryWarning(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
              >
                Go back and sort
              </button>
              <button
                onClick={() => {
                  setShowBinaryWarning(false);
                  engine.run();
                }}
                className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30"
              >
                Run anyway to see why
              </button>
            </div>
          </div>
        </div>
      )}

      {showTutorial && (
        <TutorialSearch
          onComplete={tutorial.handleTutorialComplete}
          currentStep={tutorial.tutorialStep}
          setCurrentStep={tutorial.setTutorialStep}
          droppedNodeScreenPos={tutorial.droppedNodeScreenPos}
          node2ScreenPos={tutorial.node2ScreenPos}
          node3ScreenPos={tutorial.node3ScreenPos}
          node1ScreenPos={tutorial.node1ScreenPos}
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
              description: "You are now ready to explore Search Algorithms.",
            },
          ]}
        />
      )}
    </div>
  );
}
