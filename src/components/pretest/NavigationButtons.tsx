"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type NavigationButtonsProps = {
  onBack: () => void;
  onNext: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  hasSelectedAnswer: boolean;
  className?: string;
};

function NavigationButtons({
  onBack,
  onNext,
  isFirstQuestion,
  isLastQuestion,
  hasSelectedAnswer,
  className = "",
}: NavigationButtonsProps) {
  // The Submit button on the last question stays clickable so the
  // incomplete-quiz modal can show; intermediate Next buttons require
  // a real answer.
  const nextDisabled = !isLastQuestion && !hasSelectedAnswer;

  return (
    <div className={`flex justify-between items-center w-full ${className}`}>
      {/* Back Button - Simple text style */}
      <button
        onClick={onBack}
        disabled={isFirstQuestion}
        className={`
          flex items-center justify-center px-3 py-2 rounded-lg border border-[#222121]
          font-medium text-base transition-all duration-200 wx-[24px] h-11
          ${
            isFirstQuestion
              ? "opacity-30 cursor-not-allowed"
              : "hover:opacity-70 cursor-pointer"
          }
        `}
      >
        <div className="flex items-center gap-1">
          <ChevronLeft className="w-5 h-7" />
          <span className="text-lg h-7 flex items-center">Back</span>
        </div>
      </button>

      {/* Next / Submit Button - Blue solid style */}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`
          flex items-center justify-center px-4 py-2 rounded-lg
          font-medium text-base transition-all duration-200
          bg-[#0066cc] text-white
          ${
            nextDisabled
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-[#0052a3] cursor-pointer"
          }
        `}
      >
        {isLastQuestion ? (
          <span className="text-lg h-7">Submit</span>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-lg h-7 flex items-center">Next</span>
            <ChevronRight className="w-5 h-7" />
          </div>
        )}
      </button>
    </div>
  );
}

export default NavigationButtons;
