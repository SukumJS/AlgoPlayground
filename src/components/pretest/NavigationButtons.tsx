"use client";

import React from "react";

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
  return (
    <div className={`flex justify-between items-center w-full ${className}`}>
      {/* Back Button - Simple text style */}
      <button
        onClick={onBack}
        disabled={isFirstQuestion}
        className={`
          flex items-center justify-center px-2 py-2 rounded-lg
          font-medium text-base transition-all duration-200 border-1 border-black
          ${
            isFirstQuestion
              ? "opacity-30 cursor-not-allowed"
              : "hover:opacity-70 cursor-pointer"
          }
        `}
      >
        <svg
          className="w-5 h-5 text-[#222121]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="font-medium text-[#222121] text-lg">Back</span>
      </button>

      {/* Next / Submit Button - Blue solid style */}
      <button
        onClick={onNext}
        disabled={!hasSelectedAnswer}
        className={`
          flex items-center justify-center px-6 py-2 rounded-lg
          font-medium text-base transition-all duration-200
          ${
            hasSelectedAnswer
              ? "bg-[#0066cc] text-white hover:bg-[#0052a3] cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
        `}
      >
        {isLastQuestion ? "Submit" : "Next"}
      </button>
    </div>
  );
}

export default NavigationButtons;
