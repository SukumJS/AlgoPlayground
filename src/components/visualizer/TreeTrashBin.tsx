"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface TreeTrashBinProps {
  show: boolean;
  isActive: boolean;
  position: { x: number; y: number };
}

/**
 * Trash bin component for deleting nodes
 * Design matches tutorial_tree.tsx exactly
 */
export default function TreeTrashBin({
  show,
  isActive,
  position,
}: TreeTrashBinProps) {
  if (!show) return null;

  return (
    <div
      className={`trash-bin fixed z-50 flex items-center justify-center w-17 h-17 rounded-full bg-[#FF4D4D] cursor-pointer hover:bg-[#FF3333] transition-all duration-300 shadow-lg border-3 border-[#5D5D5D] ${isActive ? "scale-110" : ""}`}
      style={{
        bottom: "140px",
        left: "50%",
        transform: "translateX(-50%)",
        boxShadow: isActive
          ? "0 0 30px 10px rgba(255, 77, 77, 0.8), 0 0 10px 5px rgba(255, 255, 255, 0.5)"
          : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        animation: "fadeInUp 0.2s ease-out",
      }}
    >
      <Trash2 color="white" size={40} />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
