"use client";

import React from "react";

type TrackProgressProps = {
  current: number;
  total: number;
  title: string;
  className?: string;
  isComplete?: boolean;
};

function TrackProgress({
  current,
  total,
  title,
  className = "",
  isComplete = false,
}: TrackProgressProps) {
  const progressPercentage = Math.min((current / total) * 100, 100);

  return (
    <div className={`relative w-full h-[80px] ${className}`}>
      {/* Background bar */}
      <div className="absolute bg-[#b4d4f1] border-2 border-[#5d5d5d] inset-0 rounded-full" />

      {/* Title */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2">
        <p className="font-bold text-[#222121] text-xl sm:text-[20px] whitespace-nowrap">
          {title}
        </p>
      </div>

      {/* Progress counter */}
      <div className="absolute right-6 top-1/2 -translate-y-3 px-3">
        <p className="font-bold text-[#222121] text-xl sm:text-[20px] uppercase">
          {current}/{total}
        </p>
      </div>

      {/* Progress bar container */}
      <div className="absolute top-1/2 -translate-y-1 right-19 w-[300px] h-[15px]">
        {/* Progress track background */}
        <div className="absolute bg-white inset-0 rounded-full" />
        {/* Progress fill */}
        <div
          className={`absolute h-full left-0 rounded-full transition-all duration-500 ease-out ${
            isComplete ? "bg-[#22C55E]" : "bg-[#0066cc]"
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default TrackProgress;
