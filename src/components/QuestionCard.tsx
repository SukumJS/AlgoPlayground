"use client";

import React from "react";

type QuestionCardProps = {
  question: string;
  questionNumber?: number;
  className?: string;
};

function QuestionCard({
  question,
  questionNumber,
  className = "",
}: QuestionCardProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Question card */}
      <div className="bg-white flex items-center min-h-[100px] px-6 py-4 rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]">
        <p className="font-semibold text-[#222121] text-xl md:text-2xl">
          {questionNumber && (
            <span className="text-[#0066cc] mr-2">Q{questionNumber}.</span>
          )}
          {question}
        </p>
      </div>
    </div>
  );
}

export default QuestionCard;
