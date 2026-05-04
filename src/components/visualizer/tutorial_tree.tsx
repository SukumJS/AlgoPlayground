"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { TutorialStep } from "@/src/app/types/tutorial";
import { useWindowSize } from "@/src/hooks/useWindowSize";

// Tutorial steps for Tree (BST)
const TREE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    instruction:
      "Drag a node from the panel and drop it where the playground glows.",
    action: "drag",
    targetSelector: ".data-panel-node",
    completed: false,
  },
  {
    id: 2,
    instruction: "Tap a node to start.",
    action: "tap",
    targetSelector: ".react-flow__node",
    completed: false,
  },
  {
    id: 3,
    instruction: "Now, tap another node to create a link.",
    action: "connect",
    targetSelector: ".react-flow__node",
    completed: false,
  },
  {
    id: 4,
    instruction: "Link Created!",
    action: "click",
    targetSelector: "body", // Click anywhere
    completed: false,
  },
  {
    id: 5,
    instruction: "Press and hold the node.",
    action: "tap",
    targetSelector: ".react-flow__node",
    completed: false,
  },
  {
    id: 6,
    instruction: "Drag it to the trash bin icon.",
    action: "delete",
    targetSelector: ".trash-bin",
    completed: false,
  },
];

// Glow zone canvas position
export const GLOW_ZONE = {
  x: 5,
  y: 285,
  radius: 60,
};

interface TutorialProps {
  algorithm: string;
  onComplete: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onNodeDropped?: () => void;
  // Dynamic screen positions for spotlight
  droppedNodeScreenPos?: { x: number; y: number } | null;
  node30ScreenPos?: { x: number; y: number } | null;
  node90ScreenPos?: { x: number; y: number } | null;
  sidebarNode3Pos?: { x: number; y: number } | null;
  glowZoneScreenPos?: { x: number; y: number } | null;
  isTrashActive?: boolean;
  trashBinPos?: { x: number; y: number } | null;
}

// Custom Dashed Arrow Component (อัปเดตให้เหมือน Graph)
const DashedArrow = ({
  className,
  style,
  width = 50,
  color = "#333",
  direction = "left", // "left" | "right" | "up" | "down"
}: {
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  color?: string;
  direction?: "left" | "right" | "up" | "down";
}) => {
  const rotate = {
    left: 0,
    right: 180,
    up: 90,
    down: -90,
  }[direction];

  return (
    <svg
      width={width}
      height="24"
      viewBox={`0 0 ${width} 24`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ ...style, transform: `rotate(${rotate}deg)` }}
    >
      <path
        d={`M${width - 2} 12H5`}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 4"
      />
      <path
        d="M12 19L5 12L12 5"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function TutorialTree({
  algorithm,
  onComplete,
  currentStep,
  setCurrentStep,
  onNodeDropped,
  droppedNodeScreenPos,
  node30ScreenPos,
  node90ScreenPos,
  sidebarNode3Pos,
  glowZoneScreenPos,
  isTrashActive,
  trashBinPos,
}: TutorialProps) {
  const [steps, setSteps] = useState<TutorialStep[]>(TREE_TUTORIAL_STEPS);
  const { width: vw, height: vh } = useWindowSize();

  // สร้าง State ท้องถิ่นเพื่อแยก 2 สเต็ปสุดท้ายออกมา
  const [localEndStep, setLocalEndStep] = useState(0);

  // ติดตามตำแหน่งปุ่ม Post Test แบบ dynamic
  const [postTestRect, setPostTestRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    if (localEndStep !== 2) return;
    // Force open the sidebar so the post test button becomes visible
    window.dispatchEvent(new CustomEvent("forceOpenSidebar"));
    let frameId: number;
    const track = () => {
      const el = document.getElementById("post-test-button");
      if (el) {
        const r = el.getBoundingClientRect();
        setPostTestRect({ x: r.left, y: r.top, w: r.width, h: r.height });
      }
      frameId = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(frameId);
  }, [localEndStep]);

  // 🎯 แก้ไข: ให้ดัน currentStep ไปเรื่อยๆ แทนการเรียก onComplete() ทันที
  const handleStepComplete = useCallback(() => {
    if (currentStep < steps.length) {
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === currentStep ? { ...step, completed: true } : step,
        ),
      );
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length, setCurrentStep]);

  const handleDropOnGlow = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (currentStep === 0) {
        handleStepComplete();
        onNodeDropped?.();
      }
    },
    [currentStep, handleStepComplete, onNodeDropped],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // กันข้ามอัตโนมัติ (Anti Auto-Skip System)
  if (localEndStep === 0) {
    if (currentStep >= steps.length) {
      setLocalEndStep(1);
    }
  }

  useEffect(() => {
    if (localEndStep < 1) return;
    let frameId: number;
    const trackPosition = () => {
      const el = document.querySelector(
        "[data-tutorial-posttest]",
      ) as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        setPostTestRect({
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
        });
      }
      frameId = requestAnimationFrame(trackPosition);
    };
    trackPosition();
    return () => cancelAnimationFrame(frameId);
  }, [localEndStep]);
  // ส่วนของชี้สถานะสีและ Post Test
  if (localEndStep > 0) {
    return (
      <div className="fixed inset-0 z-[80] pointer-events-auto transition-opacity duration-300">
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ position: "fixed" }}
          viewBox={`0 0 ${vw || 1} ${vh || 1}`}
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="endstep-spotlight-mask-tree">
              <rect width="100%" height="100%" fill="white" />
              {localEndStep === 1 && (
                <rect
                  x={algorithm === "avl-tree" ? "220" : "180"}
                  y="12"
                  width={algorithm === "avl-tree" ? "460" : "440"}
                  height="45"
                  rx="22"
                  fill="black"
                />
              )}
              {localEndStep === 2 && postTestRect && (
                <rect
                  x={postTestRect.x - 4}
                  y={postTestRect.y - 4}
                  width={postTestRect.w + 8}
                  height={postTestRect.h + 8}
                  rx="4"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#endstep-spotlight-mask-tree)"
          />
        </svg>

        {/* กล่องชี้สถานะสี (ซ้ายบน) */}
        {localEndStep === 1 && (
          <div className="absolute top-[120px] left-[200px] bg-white p-6 rounded-xl shadow-2xl w-[280px] transition-all duration-500 ease-in-out">
            <DashedArrow
              width={50}
              className="absolute -top-[45px] left-[140px]"
              direction="up"
            />
            <h3 className="font-bold text-gray-800 text-lg mb-2">
              Color Legend
            </h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              {algorithm === "avl-tree"
                ? "Look here to understand node colors. You can also use the button to show or hide the Balance Factors (-1, 0, 1)!"
                : "Look here to understand what different node colors mean."}
            </p>
            <button
              onClick={() => setLocalEndStep(2)}
              className="w-full py-2 bg-[#0066CC] hover:bg-[#0052a3] transition text-white rounded-lg font-bold"
            >
              Next
            </button>
          </div>
        )}

        {/* กล่องชี้ Post Test (ชี้ไปที่ปุ่ม Post Test จริง) */}
        {localEndStep === 2 && postTestRect && (
          <div
            className="fixed bg-white p-6 rounded-xl shadow-2xl w-[300px] transition-all duration-500 ease-in-out"
            style={{
              top: `${postTestRect.y - 280}px`,
              left: `${postTestRect.x + postTestRect.w / 2 - 150}px`,
            }}
          >
            <DashedArrow
              width={50}
              className="absolute -bottom-[50px] left-1/2 transform -translate-x-1/2"
              direction="down"
            />
            <h3 className="font-bold text-gray-800 text-lg mb-2">Post Test</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Once you finish experimenting, click here to take a short quiz and
              test your knowledge!
            </p>
            <button
              onClick={onComplete} // จบ Tutorial
              className="w-full py-2 bg-[#0066CC] hover:bg-[#0052a3] transition text-white rounded-lg font-bold"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  if (!currentStepData) {
    return null;
  }

  return (
    <>
      {/* SVG Overlay for Spotlight Effect */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-50"
        style={{ position: "fixed" }}
        viewBox={`0 0 ${vw || 1} ${vh || 1}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="spotlight-mask">
            {/* Whole screen white (visible) */}
            <rect width="100%" height="100%" fill="white" />

            {/* Spotlight holes (black = transparent/cutout) */}
            {/* Step 1: Spotlight on Sidebar Node 3 */}
            {currentStep === 0 && sidebarNode3Pos && (
              <circle
                cx={sidebarNode3Pos.x}
                cy={sidebarNode3Pos.y}
                r="33"
                fill="black"
              />
            )}

            {/* Step 2: Spotlight on dropped node 3 */}
            {currentStep === 1 && droppedNodeScreenPos && (
              <circle
                cx={droppedNodeScreenPos.x}
                cy={droppedNodeScreenPos.y}
                r="57"
                fill="black"
              />
            )}

            {/* Step 3: Dual spotlight - both node 3 AND node 30 */}
            {currentStep === 2 && droppedNodeScreenPos && (
              <circle
                cx={droppedNodeScreenPos.x}
                cy={droppedNodeScreenPos.y}
                r="57"
                fill="black"
              />
            )}
            {currentStep === 2 && node30ScreenPos && (
              <circle
                cx={node30ScreenPos.x}
                cy={node30ScreenPos.y}
                r="57"
                fill="black"
              />
            )}

            {/* Step 5 & 6: Spotlight on node 90 (Press & Drag steps) */}
            {(currentStep === 4 || currentStep === 5) && node90ScreenPos && (
              <circle
                cx={node90ScreenPos.x}
                cy={node90ScreenPos.y}
                r="57"
                fill="black"
              />
            )}
            {/* Fallback for Step 5/6 if node90 position not ready */}
            {(currentStep === 4 || currentStep === 5) && !node90ScreenPos && (
              <circle cx={1086} cy={630} r="57" fill="black" />
            )}
          </mask>
        </defs>

        {/* Step 0: Full dark overlay (no spotlight) */}
        {currentStep === 0 && !sidebarNode3Pos && (
          <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" />
        )}
        {/* Step 0: Dark overlay with spotlight mask applied if sidebar pos found */}
        {currentStep === 0 && sidebarNode3Pos && (
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.5)"
            mask="url(#spotlight-mask)"
          />
        )}

        {/* Steps 1, 2, 5 & 6: Dark overlay with spotlight mask applied */}
        {(currentStep === 1 ||
          currentStep === 2 ||
          currentStep === 4 ||
          currentStep === 5) && (
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.5)"
            mask="url(#spotlight-mask)"
          />
        )}

        {/* Step 4 (Link Created): Full dark overlay */}
        {currentStep === 3 && (
          <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" />
        )}
      </svg>

      {/* Step 1: Tooltip with exact Figma size 326x88px */}
      {currentStep === 0 && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl px-5 py-4 border border-gray-200 flex items-center"
          style={{
            width: "326px",
            height: "88px",
            top: sidebarNode3Pos ? `${sidebarNode3Pos.y - 44}px` : "225px",
            right: sidebarNode3Pos
              ? `calc(100vw - ${sidebarNode3Pos.x}px + 110px)`
              : "420px",
          }}
        >
          <p className="text-base text-gray-800">
            <span className="font-bold">Drag a node</span> from the panel and
            drop it where the playground glows.
          </p>
          <DashedArrow
            width={60}
            className="absolute pointer-events-none"
            style={{
              left: "100%",
              top: "50%",
              marginTop: "-12px",
              marginLeft: "10px",
            }}
            direction="right"
          />
        </div>
      )}

      {/* Glow drop zone (Step 1) */}
      {currentStep === 0 && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: glowZoneScreenPos ? `${glowZoneScreenPos.x - 50}px` : "250px",
            top: glowZoneScreenPos ? `${glowZoneScreenPos.y - 50}px` : "450px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.9)",
            background: "transparent",
            boxShadow:
              "0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.3)",
            animation: "glow-ring 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Trash bin icon (Step 6 Only) */}
      {currentStep === 5 && (
        <>
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl px-4 py-2 border border-gray-200"
            style={{
              left: trashBinPos ? `${trashBinPos.x - 350}px` : "55%",
              top: trashBinPos ? `${trashBinPos.y - 30}px` : "85%",
              transform: "translateY(-50%)",
            }}
          >
            <p className="text-base text-gray-800 font-medium">
              Drag it to the trash bin icon.
            </p>
            <DashedArrow
              width={60}
              className="absolute pointer-events-none"
              style={{
                left: "100%",
                top: "50%",
                marginTop: "-12px",
                marginLeft: "10px",
              }}
              direction="right"
            />
          </div>
          <div
            className={`trash-bin fixed z-50 flex items-center justify-center w-17 h-17 rounded-full bg-[#FF4D4D] cursor-pointer hover:bg-[#FF3333] transition-all duration-300 shadow-lg border-3 border-[#5D5D5D] ${isTrashActive ? "scale-110" : ""}`}
            style={{
              bottom: "140px",
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: isTrashActive
                ? "0 0 30px 10px rgba(255, 77, 77, 0.8), 0 0 10px 5px rgba(255, 255, 255, 0.5)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
            onClick={handleStepComplete}
            onDrop={(e) => {
              e.preventDefault();
              handleStepComplete();
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Trash2 color="white" size={40} />
          </div>
        </>
      )}

      {/* Step 2: Tooltip pointing to node 3 */}
      {currentStep === 1 && droppedNodeScreenPos && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 max-w-xs border border-gray-200"
          style={{
            left: `${droppedNodeScreenPos.x + 120}px`,
            top: `${droppedNodeScreenPos.y - 20}px`,
            borderRadius: "10px",
          }}
        >
          <p className="text-base text-gray-800 font-medium whitespace-nowrap">
            Tap a node to start.
          </p>
          <DashedArrow
            width={50}
            className="absolute pointer-events-none"
            style={{
              right: "100%",
              top: "50%",
              marginTop: "-12px",
              marginRight: "10px",
            }}
            direction="left"
          />
        </div>
      )}

      {/* Step 3: Tooltip pointing to node 30 */}
      {currentStep === 2 && node30ScreenPos && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 max-w-xs border border-gray-200"
          style={{
            left: `${node30ScreenPos.x + 120}px`,
            top: `${node30ScreenPos.y - 20}px`,
            borderRadius: "10px",
          }}
        >
          <p className="text-base text-gray-800 font-medium">
            Now, tap another node to create a link.
          </p>
          <DashedArrow
            width={50}
            className="absolute pointer-events-none"
            style={{
              right: "100%",
              top: "50%",
              marginTop: "-12px",
              marginRight: "10px",
            }}
            direction="left"
          />
        </div>
      )}

      {/* Step 4: Link Created! */}
      {currentStep === 3 && droppedNodeScreenPos && node30ScreenPos && (
        <>
          <div
            className="fixed inset-0 z-[60] cursor-pointer"
            onClick={() => setCurrentStep(4)}
          />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl px-4 py-2 border border-gray-200"
            style={{
              left: `${(droppedNodeScreenPos.x + node30ScreenPos.x) / 2 + 50}px`,
              top: `${(droppedNodeScreenPos.y + node30ScreenPos.y) / 2 - 15}px`,
              pointerEvents: "none",
            }}
          >
            <p className="text-base text-gray-800 font-medium whitespace-nowrap">
              Link Created!
            </p>
            <DashedArrow
              width={30}
              className="absolute pointer-events-none"
              style={{
                right: "100%",
                top: "50%",
                marginTop: "-12px",
                marginRight: "10px",
              }}
              direction="left"
            />
          </div>
        </>
      )}

      {/* Step 5: Press Node 90 */}
      {currentStep === 4 && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl px-4 py-2 border border-gray-200"
          style={{
            right: `calc(100vw - ${node90ScreenPos ? node90ScreenPos.x : 1086}px + 120px)`,
            top: `${(node90ScreenPos ? node90ScreenPos.y : 630) - 20}px`,
            borderRadius: "10px",
          }}
        >
          <p className="text-base text-gray-800 font-medium whitespace-nowrap">
            Press and hold the node.
          </p>
          <DashedArrow
            width={50}
            className="absolute pointer-events-none"
            style={{
              left: "100%",
              top: "50%",
              marginTop: "-12px",
              marginLeft: "10px",
            }}
            direction="right"
          />
        </div>
      )}

      <style jsx>{`
        @keyframes glow-ring {
          0%,
          100% {
            opacity: 0.7;
            box-shadow:
              0 0 20px rgba(255, 255, 255, 0.6),
              0 0 40px rgba(255, 255, 255, 0.3);
          }
          50% {
            opacity: 1;
            box-shadow:
              0 0 30px rgba(255, 255, 255, 0.9),
              0 0 60px rgba(255, 255, 255, 0.5);
          }
        }
      `}</style>
    </>
  );
}

export { TREE_TUTORIAL_STEPS };
