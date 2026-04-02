"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface TutorialProps {
  onComplete: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  droppedNodeScreenPos?: { x: number; y: number } | null;
  node2ScreenPos?: { x: number; y: number } | null;
  node3ScreenPos?: { x: number; y: number } | null;
  node1ScreenPos?: { x: number; y: number } | null;
  sidebarNodePos?: { x: number; y: number } | null;
  dropZoneScreenPos?: { x: number; y: number } | null;
  isTrashActive?: boolean;
  trashBinPos?: { x: number; y: number } | null;
  nodeMaskSize?: number;
}

const DashedArrow = ({
  className,
  style,
  width = 50,
  color = "#333",
}: {
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  color?: string;
}) => (
  <svg
    width={width}
    height="24"
    viewBox={`0 0 ${width} 24`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d={`M${width - 2} 12H5`}
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="4 4"
    />
    <path
      d="M12 19L5 12L12 5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function TutorialLinearDS({
  currentStep,
  node2ScreenPos,
  node3ScreenPos,
  node1ScreenPos,
  sidebarNodePos,
  dropZoneScreenPos,
  isTrashActive,
  trashBinPos,
  nodeMaskSize,
}: TutorialProps) {
  if (currentStep >= 5) return null;

  const nodeBoxSize = 105;
  const nodeHalfBox = nodeBoxSize / 2;
  const nodeRadius = "12";
  const sidebarBoxSize = 54;
  const sidebarHalfBox = sidebarBoxSize / 2;

  return (
    <>
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-[60]"
        style={{ position: "fixed" }}
      >
        <defs>
          <mask id="spotlight-mask-linear">
            <rect width="100%" height="100%" fill="white" />
            {currentStep === 0 && sidebarNodePos && (
              <rect
                x={sidebarNodePos.x - sidebarHalfBox}
                y={sidebarNodePos.y - sidebarHalfBox}
                width={sidebarBoxSize}
                height={sidebarBoxSize}
                rx="8"
                fill="black"
              />
            )}
            {currentStep === 0 && dropZoneScreenPos && (
              <rect
                x={dropZoneScreenPos.x - nodeHalfBox}
                y={dropZoneScreenPos.y - nodeHalfBox}
                width={nodeBoxSize}
                height={nodeBoxSize}
                rx={nodeRadius}
                fill="black"
              />
            )}
            {(currentStep === 1 || currentStep === 2) && node2ScreenPos && (
              <rect
                x={node2ScreenPos.x - nodeHalfBox}
                y={node2ScreenPos.y - nodeHalfBox}
                width={nodeBoxSize}
                height={nodeBoxSize}
                rx={nodeRadius}
                fill="black"
              />
            )}
            {(currentStep === 1 || currentStep === 2) && node3ScreenPos && (
              <rect
                x={node3ScreenPos.x - nodeHalfBox}
                y={node3ScreenPos.y - nodeHalfBox}
                width={nodeBoxSize}
                height={nodeBoxSize}
                rx={nodeRadius}
                fill="black"
              />
            )}
            {(currentStep === 3 || currentStep === 4) && node1ScreenPos && (
              <rect
                x={node1ScreenPos.x - nodeHalfBox}
                y={node1ScreenPos.y - nodeHalfBox}
                width={nodeBoxSize}
                height={nodeBoxSize}
                rx={nodeRadius}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.55)"
          mask="url(#spotlight-mask-linear)"
        />
      </svg>

      {/*  ดัน right ไปที่ +85px เพื่อหลบกล่อง */}
      {currentStep === 0 && (
        <div
          className="fixed z-[70] bg-white rounded-xl shadow-xl px-5 py-4 border border-gray-200 flex items-center justify-center text-center w-[220px]"
          style={{
            top: sidebarNodePos ? `${sidebarNodePos.y - 45}px` : "30%",
            right: sidebarNodePos
              ? `calc(100vw - ${sidebarNodePos.x}px + 85px)`
              : "350px",
          }}
        >
          <p className="text-sm text-gray-800">
            <span className="font-bold">Drag an element</span> from the panel
            and drop it.
          </p>
          <DashedArrow
            width={45}
            className="absolute pointer-events-none"
            style={{
              left: "100%",
              top: "50%",
              marginTop: "-12px",
              marginLeft: "5px",
              transform: "rotate(180deg)",
            }}
          />
        </div>
      )}

      {currentStep === 0 && dropZoneScreenPos && (
        <div
          className="fixed z-[65] pointer-events-none"
          style={{
            left: `${dropZoneScreenPos.x}px`,
            top: `${dropZoneScreenPos.y}px`,
            transform: "translate(-50%, -50%)",
            width: `${nodeBoxSize}px`,
            height: `${nodeBoxSize}px`,
            borderRadius: "12px",
            border: "2px solid white",
          }}
        />
      )}

      {/* Step 1 */}
      {currentStep === 1 && node2ScreenPos && (
        <div
          className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${node2ScreenPos.x}px`,
            bottom: `calc(100vh - ${node2ScreenPos.y}px + ${nodeHalfBox + 15}px)`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-sm text-gray-800 font-bold whitespace-nowrap">
            Press 2 and move it to the right
          </p>
          <DashedArrow
            width={30}
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "100%",
              marginLeft: "-15px",
              marginTop: "2px",
              transform: "rotate(-90deg)",
            }}
          />
        </div>
      )}

      {/* Step 2 */}
      {currentStep === 2 && node3ScreenPos && node2ScreenPos && (
        <div
          className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${(node3ScreenPos.x + node2ScreenPos.x) / 2}px`,
            bottom: `calc(100vh - ${node3ScreenPos.y}px + ${nodeHalfBox + 15}px)`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-sm text-gray-800 font-bold whitespace-nowrap">
            Swap Complete!
          </p>
          <DashedArrow
            width={30}
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "100%",
              marginLeft: "-15px",
              marginTop: "2px",
              transform: "rotate(-90deg)",
            }}
          />
        </div>
      )}

      {/* Step 3 */}
      {(currentStep === 3 || currentStep === 4) && node1ScreenPos && (
        <div
          className="fixed z-[65] pointer-events-none"
          style={{
            left: `${node1ScreenPos.x}px`,
            top: `${node1ScreenPos.y}px`,
            transform: "translate(-50%, -50%)",
            width: `${nodeBoxSize - 2}px`,
            height: `${nodeBoxSize - 2}px`,
            borderRadius: "12px",
          }}
        />
      )}
      {currentStep === 3 && node1ScreenPos && (
        <div
          className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${node1ScreenPos.x}px`,
            bottom: `calc(100vh - ${node1ScreenPos.y}px + ${nodeHalfBox + 15}px)`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-sm text-gray-800 font-bold whitespace-nowrap">
            Press and hold the element.
          </p>
          <DashedArrow
            width={30}
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "100%",
              marginLeft: "-15px",
              marginTop: "2px",
              transform: "rotate(-90deg)",
            }}
          />
        </div>
      )}

      {/* Step 4 */}
      {currentStep === 4 && (
        <>
          <div
            className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
            style={{
              left: trashBinPos ? `${trashBinPos.x - 310}px` : "40%",
              top: trashBinPos ? `${trashBinPos.y}px` : "85%",
              transform: "translateY(-110%)",
            }}
          >
            <p className="text-sm text-gray-800 font-bold whitespace-nowrap">
              Drag it to the trash bin icon.
            </p>
            <DashedArrow
              width={40}
              className="absolute pointer-events-none"
              style={{
                left: "100%",
                top: "50%",
                marginTop: "-12px",
                marginLeft: "5px",
                transform: "rotate(180deg)",
              }}
            />
          </div>
          <div
            className={`trash-bin fixed z-[65] flex items-center justify-center w-16 h-16 rounded-full bg-[#E53E3E] shadow-lg border-2 border-[#5D5D5D] transition-transform duration-200 ${isTrashActive ? "scale-125" : ""}`}
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
        </>
      )}
    </>
  );
}
