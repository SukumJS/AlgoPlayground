"use client";
import React, { useState, useCallback, DragEvent, useMemo } from "react";
import SideTab from "../../components/shared/sideTab";
import ExplainAlgo from "../../components/visualizer/explainAlgo";
import CodeAlgo from "../../components/visualizer/codeAlgo";
import Data_Linear_DS from "@/src/components/visualizer/data_lineards";
import PostTest_portal from "@/src/components/shared/postTest_portal";
import {
  ReactFlow,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Controls,
  useReactFlow,
  MarkerType,
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
import LinearDSNode, {
  type LinearNodeData,
} from "@/src/components/shared/linearDSNode";
import { useSortableDrag } from "@/src/hooks/sort/useSortableDrag";
import { useExecutionSpeed } from "@/src/hooks/useExecutionSpeed";
import Reading_modal from "@/src/components/shared/reading_modal";
import { Info, Trash2 } from "lucide-react";
import StatusNode from "@/src/components/shared/statusNode";
import GoToHome_Portal from "@/src/components/shared/goToHome_Portal";

import { useArrayEngine } from "@/src/hooks/linear_ds/useArrayEngine";
import { useLinkedListEngine } from "@/src/hooks/linear_ds/useLinkedListEngine";

const nodeTypes = {
  custom: LinearDSNode,
};

const NODE_WIDTH = 65;
const positionFromIndex = (index: number) => ({
  x: index * NODE_WIDTH,
  y: 5,
});

const initialNodes: Node<LinearNodeData>[] = [
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
const defaultEdgeOptions: DefaultEdgeOptions = { animated: false };

const algorithmNames: Record<string, string> = {
  array: "Array",
  queue: "Queue",
  stack: "Stack",
  "singly-linked-list": "Singly Linked List",
  "doubly-linked-list": "Doubly Linked List",
};

export default function PlaygroundLinearDS({
  algorithm,
}: {
  algorithm: string;
}) {
  const [nodes, setNodes] = useState<Node<LinearNodeData>[]>(initialNodes);
  const [nodeInput, setNodeInput] = useState<number | string>("6");
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const [explanation, setExplanation] = useState<string>(
    "This section will explain the data structure operations.",
  );
  const [showInfo, setShowInfo] = useState(false);

  const prettyName = algorithm
    ? algorithmNames[algorithm] || "Linear Data Structures"
    : "Linear Data Structures";

  React.useEffect(() => {
    if (algorithm) {
      setExplanation(
        `This section will explain ${prettyName} operations. Click 'Run' to start.`,
      );
    }
  }, [algorithm, prettyName]);

  React.useEffect(() => {
    const isLL =
      algorithm === "singly-linked-list" || algorithm === "doubly-linked-list";
    const isDLL = algorithm === "doubly-linked-list";
    const spacing = isLL ? 120 : NODE_WIDTH;

    const defaultNodes: Node<LinearNodeData>[] = [1, 2, 3, 4, 5].map(
      (val, i) => ({
        id: `${i + 1}`,
        type: "custom",
        position: { x: i * spacing, y: 5 },
        data: { value: val, index: i, status: "idle" },
      }),
    );

    setNodes(defaultNodes);

    if (isLL) {
      const defaultEdges: Edge[] = [];
      for (let i = 0; i < defaultNodes.length - 1; i++) {
        defaultEdges.push({
          id: `edge_${defaultNodes[i].id}_to_${defaultNodes[i + 1].id}_next`,
          source: defaultNodes[i].id,
          sourceHandle: "s-next",
          target: defaultNodes[i + 1].id,
          targetHandle: "t-next",
          type: "smoothstep",
          animated: false,
          style: { stroke: "#5D5D5D", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#5D5D5D" },
        });

        if (isDLL) {
          defaultEdges.push({
            id: `edge_${defaultNodes[i + 1].id}_to_${defaultNodes[i].id}_prev`,
            source: defaultNodes[i + 1].id,
            sourceHandle: "s-prev",
            target: defaultNodes[i].id,
            targetHandle: "t-prev",
            type: "smoothstep",
            animated: false,
            style: { stroke: "#3182CE", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#3182CE" },
          });
        }
      }
      setEdges(defaultEdges);
    } else {
      setEdges([]);
    }
  }, [algorithm, setNodes, setEdges]);

  const { setCenter, getZoom } = useReactFlow();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) =>
      setNodes((nds) => {
        const isLL =
          algorithm === "singly-linked-list" ||
          algorithm === "doubly-linked-list";

        const lockedChanges = changes.map((change) => {
          if (isLL && change.type === "position" && change.position) {
            return {
              ...change,
              position: { x: change.position.x, y: 5 },
            };
          }
          return change;
        });

        return applyNodeChanges(lockedChanges, nds) as Node<LinearNodeData>[];
      }),
    [algorithm],
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

  const getNumericSpeed = (speedStr: string | number) => {
    if (speedStr === "5x") return 200;
    if (speedStr === "2x") return 500;
    return 1000;
  };
  const numericSpeed = getNumericSpeed(speed);

  const isLinkedList =
    algorithm === "singly-linked-list" || algorithm === "doubly-linked-list";
  const nodeSpacing = isLinkedList ? 120 : NODE_WIDTH;
  const dynamicPositionFromIndex = useCallback(
    (index: number) => ({
      x: index * nodeSpacing,
      y: 5,
    }),
    [nodeSpacing],
  );

  const {
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    isDraggingNode,
    isTrashActive,
  } = useSortableDrag(
    setNodes as unknown as Parameters<typeof useSortableDrag>[0],
    dynamicPositionFromIndex,
    isLinkedList,
  );

  const arrayEngine = useArrayEngine(nodes, setNodes, numericSpeed);
  const linkedListEngine = useLinkedListEngine(
    nodes,
    setNodes,
    edges,
    setEdges,
    numericSpeed,
    algorithm,
  );

  const activeEngine = isLinkedList ? linkedListEngine : arrayEngine;
  const { insertAtIndex, deleteAtIndex, isAnimating } = activeEngine;
  const isUserPanning = React.useRef(false);
  const lastPannedPosition = React.useRef<{ id: string; x: number } | null>(
    null,
  );

  React.useEffect(() => {
    if (!isAnimating) {
      lastPannedPosition.current = null;
      return;
    }

    if (isUserPanning.current) return;

    const activeNode = nodes.find(
      (n) => n.data.status === "compare" || n.data.status === "processing",
    );

    if (activeNode) {
      const isSameNode = lastPannedPosition.current?.id === activeNode.id;
      const isSamePos = lastPannedPosition.current?.x === activeNode.position.x;

      if (!isSameNode || !isSamePos) {
        lastPannedPosition.current = {
          id: activeNode.id,
          x: activeNode.position.x,
        };

        setCenter(activeNode.position.x + 32.5, activeNode.position.y + 25, {
          zoom: 1.5,
          duration: 600,
        });
      }
    }
  }, [nodes, isAnimating, setCenter, getZoom]);

  React.useEffect(() => {
    if (!isLinkedList || isAnimating) return;

    const isDLL = algorithm === "doubly-linked-list";

    const sortedNodes = [...nodes].sort(
      (a, b) => (a.data.index as number) - (b.data.index as number),
    );

    const expectedEdges: Edge[] = [];
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      expectedEdges.push({
        id: `edge_${sortedNodes[i].id}_to_${sortedNodes[i + 1].id}_next`,
        source: sortedNodes[i].id,
        sourceHandle: "s-next",
        target: sortedNodes[i + 1].id,
        targetHandle: "t-next",
        type: "smoothstep",
        animated: false,
        style: { stroke: "#5D5D5D", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#5D5D5D" },
      });

      if (isDLL) {
        expectedEdges.push({
          id: `edge_${sortedNodes[i + 1].id}_to_${sortedNodes[i].id}_prev`,
          source: sortedNodes[i + 1].id,
          sourceHandle: "s-prev",
          target: sortedNodes[i].id,
          targetHandle: "t-prev",
          type: "smoothstep",
          animated: false,
          style: { stroke: "#3182CE", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#3182CE" },
        });
      }
    }

    const currentEdgeIds = edges
      .map((e) => e.id)
      .sort()
      .join(",");
    const expectedEdgeIds = expectedEdges
      .map((e) => e.id)
      .sort()
      .join(",");

    if (currentEdgeIds !== expectedEdgeIds) {
      setEdges(expectedEdges);
    }
  }, [nodes, edges, isLinkedList, algorithm, isAnimating, setEdges]);

  const handleNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      onNodeDragStart?.(event, node, allNodes);
    },
    [onNodeDragStart],
  );

  const handleNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      onNodeDrag(event, node, allNodes);
    },
    [onNodeDrag],
  );

  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      onNodeDragStop(event, node, allNodes);
    },
    [onNodeDragStop],
  );

  const displayNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      draggable: !isAnimating,
      style: {
        transition: isAnimating
          ? `transform ${numericSpeed}ms ease-in-out`
          : "none",
      },
      data: { ...node.data, hideIndex: isLinkedList },
    }));
  }, [nodes, isAnimating, numericSpeed, isLinkedList]);

  const sideTabMemo = useMemo(
    () => (
      <SideTab title={prettyName}>
        <div>
          <CodeAlgo />
          <ExplainAlgo explanation={explanation} />
          <Data_Linear_DS
            nodeInput={nodeInput}
            setNodeInput={setNodeInput}
            isRunning={isAnimating}
            algorithm={algorithm}
            onInsert={insertAtIndex}
            onDelete={deleteAtIndex}
            isAnimating={isAnimating}
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
      prettyName,
      isAnimating,
      algorithm,
      insertAtIndex,
      deleteAtIndex,
    ],
  );

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        className={isAnimating ? "sorting" : ""}
        nodes={displayNodes}
        edges={edges}
        onMoveStart={(event) => {
          if (event) isUserPanning.current = true;
        }}
        onMoveEnd={(event) => {
          if (event) {
            setTimeout(() => {
              isUserPanning.current = false;
            }, 1500);
          }
        }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background />
        <Controls />
      </ReactFlow>

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

      {isDraggingNode && (
        <div
          className={`fixed z-[65] flex items-center justify-center w-16 h-16 rounded-full bg-[#E53E3E] shadow-lg border-2 border-[#5D5D5D] transition-transform duration-200 ${
            isTrashActive ? "scale-125" : ""
          }`}
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
    </div>
  );
}
