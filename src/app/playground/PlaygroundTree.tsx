"use client";
import React, {
  useState,
  useCallback,
  useRef,
  DragEvent,
  useMemo,
} from "react";
import ControlPanel from "../../components/shared/controlPanel";
import SideTab from "../../components/shared/sideTab";
import ExplainAlgo from "../../components/visualizer/explainAlgo";
import CodeAlgo from "../../components/visualizer/codeAlgo";
import Tutorial_modal from "../../components/shared/tutorial_modal";
import PostTest_portal from "@/src/components/shared/postTest_portal";
import TutorialTree from "../../components/visualizer/tutorial_tree";
import TreeTrashBin from "../../components/visualizer/TreeTrashBin";
import { useTreeTutorial } from "@/src/hooks/useTreeTutorial";
import { useNodeInteraction } from "@/src/hooks/useNodeInteraction";
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
import Data_tree from "@/src/components/visualizer/data_tree";
import CustomNode from "@/src/components/shared/customNodeTreeandGraph";
import TreeEdge from "@/src/components/shared/treeEdge";
import FloatingEdge from "@/src/components/shared/FloatingEdge";
import {
  insertBST,
  type BSTNode,
} from "@/src/components/visualizer/algorithmsTree/bstTree";
import {
  insertBT,
  type BTNode,
} from "@/src/components/visualizer/algorithmsTree/binaryTree";
import {
  insertHeap,
  type HeapNode,
} from "@/src/components/visualizer/algorithmsTree/heapTree";
import {
  insertAVL,
  type AVLTreeNode,
} from "@/src/components/visualizer/algorithmsTree/avlTree";
import Reading_modal from "@/src/components/shared/reading_modal";
import { Info } from "lucide-react";
import StatusNode from "@/src/components/shared/statusNode";
import GoToHome_Portal from "@/src/components/shared/goToHome_Portal";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { tree: TreeEdge, floatingEdge: FloatingEdge };
const fitViewOptions: FitViewOptions = { padding: 0.2 };
const defaultEdgeOptions: DefaultEdgeOptions = { animated: false };

// Initial nodes for tree (BST layout with circle variant)
const treeInitialNodes: Node[] = [
  {
    id: "t1",
    type: "custom",
    data: { label: "64", variant: "circle" },
    position: { x: 200, y: 50 },
  },
  {
    id: "t2",
    type: "custom",
    data: { label: "30", variant: "circle" },
    position: { x: 100, y: 150 },
  },
  {
    id: "t3",
    type: "custom",
    data: { label: "70", variant: "circle" },
    position: { x: 300, y: 150 },
  },
  {
    id: "t4",
    type: "custom",
    data: { label: "80", variant: "circle" },
    position: { x: 375, y: 250 },
  },
  {
    id: "t5",
    type: "custom",
    data: { label: "90", variant: "circle" },
    position: { x: 450, y: 350 },
  },
];

// Initial edges for tree (BST structure) - straight lines at 45° angles
const treeInitialEdges: Edge[] = [
  {
    id: "e-t1-t2",
    source: "t1",
    sourceHandle: "source-bottom-left",
    target: "t2",
    targetHandle: "target-top-right",
    type: "straight",
  },
  {
    id: "e-t1-t3",
    source: "t1",
    sourceHandle: "source-bottom-right",
    target: "t3",
    targetHandle: "target-top-left",
    type: "straight",
  },
  {
    id: "e-t3-t4",
    source: "t3",
    sourceHandle: "source-bottom-right",
    target: "t4",
    targetHandle: "target-top-left",
    type: "straight",
  },
  {
    id: "e-t4-t5",
    source: "t4",
    sourceHandle: "source-bottom-right",
    target: "t5",
    targetHandle: "target-top-left",
    type: "straight",
  },
];

// ── Build initial BST from treeInitialNodes ───────────────────────────────────
const buildTreeInitialBSTRoot = (): BSTNode => {
  // t1=64 (root), t2=30, t3=70, t4=80, t5=90
  const insertOrder = [
    { id: "t1", value: 64 },
    { id: "t2", value: 30 },
    { id: "t3", value: 70 },
    { id: "t4", value: 80 },
  ];
  let root: BSTNode | null = null;
  for (const { id, value } of insertOrder) root = insertBST(root, value, id);
  return root!;
};

// ── Build initial BT root (สำหรับ bt-inorder, bt-preorder, bt-postorder) ────
const buildTreeInitialBTRoot = (): BTNode => {
  const insertOrder = [
    { id: "t1", value: 64 },
    { id: "t2", value: 30 },
    { id: "t3", value: 70 },
    { id: "t4", value: 80 },
  ];
  let root: BTNode | null = null;
  for (const { id, value } of insertOrder) root = insertBT(root, value, id);
  return root!;
};

// ── Build initial AVL root ────────────────────────────────────────────────────
const buildTreeInitialAVLRoot = (): AVLTreeNode => {
  const insertOrder = [
    { id: "t1", value: 64 },
    { id: "t2", value: 30 },
    { id: "t3", value: 70 },
    { id: "t4", value: 80 },
  ];
  let root: AVLTreeNode | null = null;
  for (const { id, value } of insertOrder) root = insertAVL(root, value, id);
  return root!;
};

// ── Build initial Heap root (for min-heap / max-heap) ─────────────────────────
const buildTreeInitialHeapRoot = (isMinHeap: boolean): HeapNode => {
  const insertOrder = [
    { id: "t1", value: 64 },
    { id: "t2", value: 30 },
    { id: "t3", value: 70 },
    { id: "t4", value: 80 },
  ];
  let root: HeapNode | null = null;
  for (const { id, value } of insertOrder) {
    const result = insertHeap(root, value, id, isMinHeap);
    root = result.root;
  }
  return root!;
};

const treeInitialBTRoot = buildTreeInitialBTRoot();
const treeInitialBSTRoot = buildTreeInitialBSTRoot();
const treeInitialAVLRoot = buildTreeInitialAVLRoot();
const treeInitialMinHeapRoot = buildTreeInitialHeapRoot(true);
const treeInitialMaxHeapRoot = buildTreeInitialHeapRoot(false);

// สร้าง Object ไว้แปลงชื่อ Tree Algorithm
const algorithmNames: Record<string, string> = {
  "binary-search-tree": "Binary Search Tree",
  "avl-tree": "AVL Tree",
  "binary-tree-inorder": "Binary Tree (Inorder)",
  "binary-tree-preorder": "Binary Tree (Preorder)",
  "binary-tree-postorder": "Binary Tree (Postorder)",
  "min-heap": "Min-Heap",
  "max-heap": "Max-Heap",
};

export default function PlaygroundTree({ algorithm }: { algorithm: string }) {
  const [nodes, setNodes] = useState<Node[]>(treeInitialNodes);
  const [edges, setEdges] = useState<Edge[]>(treeInitialEdges);
  const [showInfo, setShowInfo] = useState(false);
  const [explanation, setExplanation] = useState<string>(
    "This section will explain the tree algorithm's steps. Perform an operation to begin.",
  );
  const { flowToScreenPosition } = useReactFlow();

  const rebalanceRef = useRef<(() => void) | null>(null);

  // ดึงชื่อจาก Mapping (ถ้าไม่เจอให้ใช้ค่า Default)
  const prettyName = algorithm
    ? algorithmNames[algorithm] || "Tree Algorithms"
    : "Tree Algorithms";

  // reset explanation when the selected algorithm changes
  React.useEffect(() => {
    if (algorithm) {
      setExplanation(
        `This section will explain ${prettyName}. Perform an operation to begin.`,
      );
    }
  }, [algorithm, prettyName]);

  const btRebalanceRef = useRef<(() => void) | null>(null);
  const heapRebalanceRef = useRef<(() => void) | null>(null);
  const trashDeleteRef = useRef<
    ((nodeId: string, value: number) => void) | null
  >(null);
  const autoInsertRef = useRef<((value: number) => void) | null>(null);

  // Tutorial logic extracted to custom hook
  const tutorial = useTreeTutorial({
    nodes,
    flowToScreenPosition,
    setNodes,
    setEdges,
    isTree: true,
  });

  // Node interaction (universal - works for all node types, only active when NOT in tutorial)
  const nodeInteraction = useNodeInteraction({
    nodes,
    edges,
    setNodes,
    setEdges,
    isTree: true,
    isGraph: false,
    isTutorialActive: tutorial.showTutorial,
  });

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      // Intercept connections for algorithms to validate
      const isGenericBT = [
        "binary-tree-inorder",
        "binary-tree-preorder",
        "binary-tree-postorder",
      ].includes(algorithm);

      if (isGenericBT && connection.source && connection.target) {
        // Check how many children the parent already has
        const parentEdges = edges.filter((e) => e.source === connection.source);
        if (parentEdges.length >= 2) {
          console.warn(
            "Parent already has 2 children. Auto-correcting placement...",
          );

          // Reject the edge! Find the target node value
          const targetNode = nodes.find((n) => n.id === connection.target);
          const val = targetNode ? Number(targetNode.data.label) : NaN;

          if (!isNaN(val)) {
            // Delete the manually placed floating node since the connection is invalid
            setNodes((nds) => nds.filter((n) => n.id !== connection.target));

            // Auto-correct by properly inserting the value (which will find the next level-order gap)
            if (autoInsertRef.current) {
              setTimeout(() => autoInsertRef.current?.(val), 100);
            }
          }
          return; // abort connection
        }
      }

      setEdges((eds) => addEdge(connection, eds));
      // If in tutorial step 3 (connect), advance to next step
      if (tutorial.showTutorial && tutorial.tutorialStep === 2) {
        tutorial.setTutorialStep(3);
      }
    },
    [setEdges, setNodes, edges, nodes, algorithm, tutorial],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Edge click handler
  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      nodeInteraction.handleEdgeClick(event, edge.id);
    },
    [nodeInteraction],
  );

  // Combined node click handler
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (tutorial.showTutorial) {
        tutorial.handleNodeClick(event, node);
      } else {
        nodeInteraction.handleNodeClick(event, node);
      }
    },
    [tutorial, nodeInteraction],
  );

  // Combined node drag handlers
  const handleNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (tutorial.showTutorial) return;
      nodeInteraction.handleNodeDragStart(event, node);
    },
    [tutorial.showTutorial, nodeInteraction],
  );

  const handleNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (tutorial.showTutorial) {
        tutorial.onNodeDrag(event, node);
      } else {
        nodeInteraction.handleNodeDrag(event, node);
      }
    },
    [tutorial, nodeInteraction],
  );

  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (tutorial.showTutorial) {
        tutorial.onNodeDragStop(event, node);
      } else {
        nodeInteraction.handleNodeDragStop(event, node);
      }
    },
    [tutorial, nodeInteraction],
  );

  // Pane click to clear selection (universal)
  const handlePaneClick = useCallback(() => {
    if (!tutorial.showTutorial) {
      nodeInteraction.handlePaneClick();
    }
  }, [tutorial.showTutorial, nodeInteraction]);

  // สร้าง String ตัวแทนข้อมูล (เอาแค่ ID และ Label)
  const nodeDataString = nodes
    .filter((n) => n.type === "custom")
    .map((n) => `${n.id}-${(n.data as Record<string, unknown>)?.label}`)
    .join("|");

  // แช่แข็ง treeNodes ให้ประมวลผลใหม่เฉพาะตอนที่มีการเพิ่ม/ลดโหนด หรือแก้ค่าตัวเลขเท่านั้น

  const treeNodes = useMemo(() => {
    return nodes
      .filter(
        (node) =>
          node.type === "custom" &&
          typeof node.data === "object" &&
          "label" in node.data,
      )
      .map((node) => ({
        id: node.id,
        data: { label: (node.data as Record<string, unknown>).label as string },
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeDataString]);

  // แช่แข็ง SideTab ทั้งก้อน!
  const sideTabMemo = useMemo(
    () => (
      // เปลี่ยน title ตรงนี้ให้ใช้ prettyName
      <SideTab title={prettyName}>
        <div>
          <CodeAlgo tutorialMode={tutorial.showTutorial} />
          <ExplainAlgo
            tutorialMode={tutorial.showTutorial}
            explanation={explanation}
            algoType={algorithm}
            algoName={prettyName}
          />
          {/* Display Data Input for Tree Algorithms */}
          <Data_tree
            tutorialMode={tutorial.showTutorial}
            tutorialStep={tutorial.tutorialStep}
            onTutorialDropSuccess={tutorial.handleTutorialDropSuccess}
            currentNodes={treeNodes}
            currentEdges={edges}
            algorithm={algorithm}
            onRebalanceReady={(fn) => {
              rebalanceRef.current = fn;
            }}
            onBTRebalanceReady={(fn) => {
              btRebalanceRef.current = fn;
            }}
            onHeapRebalanceReady={(fn) => {
              heapRebalanceRef.current = fn;
            }}
            initialBSTRoot={
              ["binary-search-tree", "avl-tree"].includes(algorithm)
                ? treeInitialBSTRoot
                : null
            }
            initialBTRoot={
              [
                "binary-tree-inorder",
                "binary-tree-preorder",
                "binary-tree-postorder",
              ].includes(algorithm)
                ? treeInitialBTRoot
                : null
            }
            initialHeapRoot={
              algorithm === "min-heap"
                ? treeInitialMinHeapRoot
                : algorithm === "max-heap"
                  ? treeInitialMaxHeapRoot
                  : null
            }
            initialAVLRoot={
              algorithm === "avl-tree" ? treeInitialAVLRoot : null
            }
            onTrashDeleteReady={(fn) => {
              trashDeleteRef.current = fn;
            }}
            onAutoInsertReady={(fn) => {
              autoInsertRef.current = fn;
            }}
            setExplanation={setExplanation}
          />
        </div>
        <div>
          <PostTest_portal />
        </div>
      </SideTab>
    ),
    [
      tutorial.showTutorial,
      tutorial.tutorialStep,
      tutorial.handleTutorialDropSuccess,
      treeNodes,
      edges,
      algorithm,
      explanation,
      setExplanation,
      prettyName, // อย่าลืมเพิ่มเป็น dependency ของ useMemo
    ],
  );

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={tutorial.showTutorial ? undefined : onNodesChange}
        onEdgesChange={tutorial.showTutorial ? undefined : onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onDragOver={onDragOver}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodeDragStart={handleNodeDragStart}
        onPaneClick={handlePaneClick}
        panOnDrag={!tutorial.showTutorial}
        zoomOnScroll={!tutorial.showTutorial}
        zoomOnPinch={!tutorial.showTutorial}
        zoomOnDoubleClick={!tutorial.showTutorial}
        nodesDraggable={
          !tutorial.showTutorial ||
          (tutorial.showTutorial && tutorial.tutorialStep === 5)
        }
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background />
        {!tutorial.showTutorial && <Controls />}
      </ReactFlow>

      <div className="absolute bottom-4 w-full z-10">
        <ControlPanel />
      </div>

      {sideTabMemo}

      {/*Top Left Component show Info for reading how algo work & Status of Node in Playground Page */}
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

      {/* Info Reading inside Playground */}
      <Reading_modal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      {/* Tutorial overlay for tree */}
      {tutorial.showTutorial && (
        <TutorialTree
          onComplete={tutorial.handleTutorialComplete}
          currentStep={tutorial.tutorialStep}
          setCurrentStep={tutorial.setTutorialStep}
          droppedNodeScreenPos={tutorial.droppedNodeScreenPos}
          node30ScreenPos={tutorial.node30ScreenPos}
          node90ScreenPos={tutorial.node90ScreenPos}
          sidebarNode3Pos={tutorial.sidebarNode3Pos}
          isTrashActive={tutorial.isTrashActive}
          trashBinPos={tutorial.trashBinPos}
        />
      )}

      {/* Universal trash bin (non-tutorial mode) */}
      {!tutorial.showTutorial && (
        <TreeTrashBin
          show={nodeInteraction.showTrashBin}
          isActive={nodeInteraction.isTrashActive}
          position={nodeInteraction.trashBinPos}
        />
      )}

      {/* Completion modal for tree */}
      {tutorial.showCompletionModal && (
        <Tutorial_modal
          showModal={tutorial.showCompletionModal}
          onClose={() => tutorial.setShowCompletionModal(false)}
          tutorialContent={[
            {
              title: "Tutorial Complete!",
              description: `You are now ready to explore ${prettyName}.`,
            },
          ]}
          onLetsPlay={
            algorithm === "avl-tree"
              ? () => rebalanceRef.current?.()
              : [
                    "binary-tree-inorder",
                    "binary-tree-preorder",
                    "binary-tree-postorder",
                  ].includes(algorithm)
                ? () => btRebalanceRef.current?.()
                : ["min-heap", "max-heap"].includes(algorithm)
                  ? () => heapRebalanceRef.current?.()
                  : undefined
          }
        />
      )}
    </div>
  );
}
