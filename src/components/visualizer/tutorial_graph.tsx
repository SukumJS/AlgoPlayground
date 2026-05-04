"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Check } from "lucide-react";
import { useWindowSize } from "@/src/hooks/useWindowSize";

// Graph Tutorial Steps configuration — DIRECTED mode (Dijkstra)
const DIRECTED_TUTORIAL_STEPS = [
  { id: 0, instruction: "Tap a node to start.", action: "tap" },
  {
    id: 1,
    instruction: "Now, tap another node to create a link.",
    action: "tap",
  },
  { id: 2, instruction: "Type '2' to set the weight.", action: "input" },
  { id: 3, instruction: "Value Set!", action: "confirm" },
  { id: 4, instruction: "Tap this weight!", action: "tap" },
  { id: 5, instruction: "Type '5' to edit the weight.", action: "input" },
  { id: 6, instruction: "Value Set!", action: "confirm" },
  { id: 7, instruction: "Tap to hold node 70.", action: "tap" },
  { id: 8, instruction: "Drag it to the trash bin icon.", action: "drag" },
  { id: 9, instruction: "Tutorial Completed!", action: "complete" },
];

// Graph Tutorial Steps configuration — UNDIRECTED mode (BFS/DFS)
const UNDIRECTED_TUTORIAL_STEPS = [
  { id: 0, instruction: "Tap a node to start.", action: "tap" },
  {
    id: 1,
    instruction: "Now, tap another node to create a link.",
    action: "tap",
  },
  { id: 2, instruction: "Link Created!", action: "confirm" },
  { id: 3, instruction: "Tap to hold node 70.", action: "tap" },
  { id: 4, instruction: "Drag it to the trash bin icon.", action: "drag" },
  { id: 5, instruction: "Tutorial Completed!", action: "complete" },
];

// Graph Tutorial Steps configuration — UNDIRECTED WEIGHTED mode (Prim/Kruskal)
const UNDIRECTED_WEIGHTED_TUTORIAL_STEPS = [
  { id: 0, instruction: "Tap a node to start.", action: "tap" },
  {
    id: 1,
    instruction: "Now, tap another node to create a link.",
    action: "tap",
  },
  { id: 2, instruction: "Type '2' to set the weight.", action: "input" },
  { id: 3, instruction: "Value Set!", action: "confirm" },
  { id: 4, instruction: "Tap this weight!", action: "tap" },
  { id: 5, instruction: "Type '5' to edit the weight.", action: "input" },
  { id: 6, instruction: "Value Set!", action: "confirm" },
  { id: 7, instruction: "Tap to hold node 70.", action: "tap" },
  { id: 8, instruction: "Drag it to the trash bin icon.", action: "drag" },
  { id: 9, instruction: "Tutorial Completed!", action: "complete" },
];

// Keep a default reference
const GRAPH_TUTORIAL_STEPS = DIRECTED_TUTORIAL_STEPS;

// Custom Dashed Arrow Component
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

interface TutorialGraphProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onComplete: () => void;
  // Mode flags
  directed?: boolean;
  weighted?: boolean;
  // Screen positions
  node69ScreenPos?: { x: number; y: number } | null;
  node70ScreenPos?: { x: number; y: number } | null;
  edge64to39WeightPos?: { x: number; y: number } | null;
  trashBinPos?: { x: number; y: number } | null;
  isTrashActive?: boolean;
  nodeScreenRadius?: number;
  // Weight input
  showWeightInput?: boolean;
  weightInputValue?: string;
  weightInputError?: string | null;
  onWeightInputChange?: (value: string) => void;
  onWeightConfirm?: () => void;
}

export default function TutorialGraph({
  currentStep,
  setCurrentStep,
  onComplete,
  directed = true,
  weighted = directed,
  node69ScreenPos,
  node70ScreenPos,
  edge64to39WeightPos,
  trashBinPos,
  isTrashActive = false,
  nodeScreenRadius = 32,
  showWeightInput = false,
  weightInputValue = "",
  weightInputError = null,
  onWeightInputChange,
  onWeightConfirm,
}: TutorialGraphProps) {
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

  const steps = directed
    ? DIRECTED_TUTORIAL_STEPS
    : weighted
      ? UNDIRECTED_WEIGHTED_TUTORIAL_STEPS
      : UNDIRECTED_TUTORIAL_STEPS;

  const { width: vw, height: vh } = useWindowSize();
  // Dynamic step references
  const deleteHighlightStep = weighted ? 7 : 3;
  const dragStep = weighted ? 8 : 4;
  const completeStep = weighted ? 9 : 5;

  // กันข้ามอัตโนมัติ (Anti Auto-Skip System) - ดักจับตอนถึงสเต็ปสุดท้ายของแต่ละโหมด
  if (localEndStep === 0) {
    if (currentStep >= completeStep) {
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

  const stepData = steps[currentStep];
  if (!stepData) return null;

  // หากอยู่ในช่วง 2 สเต็ปสุดท้าย ให้รันหน้าตานี้ และไม่ต้องสนใจ currentStep ของระบบกราฟอีกต่อไป
  if (localEndStep > 0) {
    return (
      <div className="fixed inset-0 z-[80] pointer-events-auto transition-opacity duration-300">
        {/* --- MASK SPOTLIGHT สำหรับ Legend และ Post Test --- */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ position: "fixed" }}
          viewBox={`0 0 ${vw || 1} ${vh || 1}`}
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="endstep-spotlight-mask-graph">
              <rect width="100%" height="100%" fill="white" />

              {/* เจาะรูไฮไลท์สำหรับ Color Legend (ซ้ายบน) */}
              {localEndStep === 1 && (
                <rect
                  x="180"
                  y="12"
                  width="250"
                  height="45"
                  rx="22"
                  fill="black"
                />
              )}

              {/* เจาะรูไฮไลท์สำหรับ Post Test (ตามตำแหน่งจริง) */}
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
            mask="url(#endstep-spotlight-mask-graph)"
          />
        </svg>

        {/* กล่องชี้สถานะสี (ซ้ายบน) */}
        {localEndStep === 1 && (
          <div className="absolute top-[120px] left-[200px] bg-white p-6 rounded-xl shadow-2xl w-[280px] transition-all duration-500 ease-in-out">
            <DashedArrow
              width={50}
              className="absolute -top-[45px] left-[110px]"
              direction="up" // ใช้ direction ของไฟล์ graph หมุนขึ้น
            />
            <h3 className="font-bold text-gray-800 text-lg mb-2">
              Color Legend
            </h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Look here to understand what different node colors mean
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
              onClick={onComplete}
              className="w-full py-2 bg-[#0066CC] hover:bg-[#0052a3] transition text-white rounded-lg font-bold"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }

  // ถ้ายังไม่เริ่มหรือจบไปแล้วแต่ยังไม่ได้ขึ้น 2 สเต็ปสุดท้าย (กันพัง)
  if (!stepData) return null;

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
          <mask id="graph-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />

            {/* Step 0: Spotlight on node 69 */}
            {currentStep === 0 && node69ScreenPos && (
              <circle
                cx={node69ScreenPos.x}
                cy={node69ScreenPos.y}
                r={nodeScreenRadius}
                fill="black"
              />
            )}

            {/* Step 1: Dual spotlight - node 69 and node 70 */}
            {currentStep === 1 && node69ScreenPos && (
              <circle
                cx={node69ScreenPos.x}
                cy={node69ScreenPos.y}
                r={nodeScreenRadius}
                fill="black"
              />
            )}
            {currentStep === 1 && node70ScreenPos && (
              <circle
                cx={node70ScreenPos.x}
                cy={node70ScreenPos.y}
                r={nodeScreenRadius}
                fill="black"
              />
            )}

            {/* Step 4 (weighted): Spotlight on edge 64→39 weight */}
            {weighted && currentStep === 4 && edge64to39WeightPos && (
              <circle
                cx={edge64to39WeightPos.x}
                cy={edge64to39WeightPos.y}
                r="20"
                fill="black"
              />
            )}

            {/* Delete highlight & drag step: Spotlight on node 70 */}
            {(currentStep === deleteHighlightStep ||
              currentStep === dragStep) &&
              node70ScreenPos && (
                <circle
                  cx={node70ScreenPos.x}
                  cy={node70ScreenPos.y}
                  r={nodeScreenRadius}
                  fill="black"
                />
              )}
          </mask>
        </defs>

        {/* Dark overlay with spotlight */}
        {(currentStep === 0 ||
          currentStep === 1 ||
          (weighted && currentStep === 4) ||
          currentStep === deleteHighlightStep ||
          currentStep === dragStep) && (
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.5)"
            mask="url(#graph-spotlight-mask)"
          />
        )}

        {/* Weighted: Steps 2, 3, 5, 6: Full dark overlay (no spotlight, focus on input) */}
        {weighted &&
          (currentStep === 2 ||
            currentStep === 3 ||
            currentStep === 5 ||
            currentStep === 6) && (
            <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" />
          )}

        {/* Undirected+Unweighted: Step 2 = "Link Created!" confirmation overlay */}
        {!directed && !weighted && currentStep === 2 && (
          <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" />
        )}
      </svg>

      {/* Step 0: Tooltip pointing to node 69 */}
      {currentStep === 0 && node69ScreenPos && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${node69ScreenPos.x + 80}px`,
            top: `${node69ScreenPos.y - 20}px`,
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

      {/* Step 1: Tooltip pointing to node 70 */}
      {currentStep === 1 && node70ScreenPos && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${node70ScreenPos.x + 80}px`,
            top: `${node70ScreenPos.y - 20}px`,
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

      {/* Weighted: Step 2 & 5: Weight Input Modal */}
      {weighted &&
        showWeightInput &&
        (currentStep === 2 || currentStep === 5) && (
          <div className="fixed inset-0 z-60 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 min-w-70">
              <p className="text-lg text-gray-800 font-medium mb-4 text-center">
                {currentStep === 2
                  ? "Type '2' to set the weight."
                  : "Type '5' to edit the weight."}
              </p>
              <input
                type="number"
                value={weightInputValue}
                onChange={(e) => onWeightInputChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onWeightConfirm?.();
                }}
                className="w-full text-center text-3xl font-bold p-4 border-2 border-gray-300 rounded-xl focus:border-[#D9E363] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
                autoFocus
              />
              {weightInputError && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {weightInputError}
                </p>
              )}
              <button
                onClick={onWeightConfirm}
                className="w-full mt-4 bg-[#222121] text-white py-3 rounded-xl font-semibold hover:bg-[#333] transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

      {/* Undirected+Unweighted Step 2: Link Created! confirmation */}
      {!directed && !weighted && currentStep === 2 && (
        <>
          <div
            className="fixed inset-0 z-60 cursor-pointer"
            onClick={() => setCurrentStep(currentStep + 1)}
          />
          <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl px-6 py-4 border border-gray-200">
            <p className="text-lg text-gray-800 font-bold text-center">
              Link Created!
            </p>
          </div>
        </>
      )}

      {/* Weighted: Step 3 & 6: Value Set! Confirmation */}
      {weighted && (currentStep === 3 || currentStep === 6) && (
        <>
          <div
            className="fixed inset-0 z-60 cursor-pointer"
            onClick={() => setCurrentStep(currentStep + 1)}
          />
          <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl px-6 py-4 border border-gray-200">
            <p className="text-lg text-gray-800 font-bold text-center">
              Value Set!
            </p>
          </div>
        </>
      )}

      {/* Step 4 (weighted): Tooltip pointing to edge weight */}
      {weighted && currentStep === 4 && edge64to39WeightPos && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${edge64to39WeightPos.x + 50}px`,
            top: `${edge64to39WeightPos.y - 20}px`,
          }}
        >
          <p className="text-base text-gray-800 font-medium whitespace-nowrap">
            Tap this weight!
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
      )}

      {/* Delete highlight step: Tooltip for hold node 70 */}
      {currentStep === deleteHighlightStep && node70ScreenPos && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${node70ScreenPos.x + 80}px`,
            top: `${node70ScreenPos.y - 20}px`,
          }}
        >
          <p className="text-base text-gray-800 font-medium whitespace-nowrap">
            Tap to hold node 70.
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

      {/* Drag step: Trash bin and tooltip */}
      {currentStep === dragStep && (
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
          >
            <Trash2 color="white" size={40} />
          </div>
        </>
      )}
    </>
  );
}

export {
  GRAPH_TUTORIAL_STEPS,
  DIRECTED_TUTORIAL_STEPS,
  UNDIRECTED_TUTORIAL_STEPS,
  UNDIRECTED_WEIGHTED_TUTORIAL_STEPS,
};
