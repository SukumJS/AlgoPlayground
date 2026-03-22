"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ExplainAlgoProps {
  isOpen?: boolean;
  explanation?: string;
}

export default function ExplainAlgo({
  isOpen = true,
  explanation = "",
}: ExplainAlgoProps) {
  const [isExplain, setIsExplain] = useState(isOpen);
  const [displayedExplanation, setDisplayedExplanation] = useState(explanation);
  const [transitionState, setTransitionState] = useState<
    "entered" | "exiting" | "entering"
  >("entered");
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    if (explanation === displayedExplanation) return;

    const startExitTimer = setTimeout(() => {
      setTransitionState("exiting");
    }, 0);

    const swapTimer = setTimeout(() => {
      setDisplayedExplanation(explanation);
      setTransitionKey((k) => k + 1);
      setTransitionState("entering");

      // Advance to fully visible on the next frame.
      requestAnimationFrame(() => {
        setTransitionState("entered");
      });
    }, 170);

    return () => {
      clearTimeout(startExitTimer);
      clearTimeout(swapTimer);
    };
  }, [explanation, displayedExplanation]);

  return (
    <>
      <button
        className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
          isExplain ? "bg-gray-200 h-12" : "bg-white"
        }`}
        /*toggling the value of the `isExplain` state when the button is clicked. */
        onClick={() => {
          setIsExplain(!isExplain);
        }}
      >
        <div className="flex items-center">
          <div
            className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${
              isExplain ? "" : "hidden opacity-0"
            }`}
          ></div>
          <div className={`flex text-lg p-2`}>Explain</div>
        </div>
        <div className="mr-2 flex justify-end">
          <ChevronDown
            className={`transform transition-transform duration-300 ease-in-out ${
              isExplain ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-600 ease-in-out ${
          isExplain ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 min-h-15">
          <p
            key={transitionKey}
            className={`text-lg text-gray-700 transition-all duration-220 ease-out ${
              transitionState === "exiting"
                ? "opacity-0 -translate-y-1 scale-[0.99]"
                : transitionState === "entering"
                  ? "opacity-0 translate-y-1 scale-[1.01]"
                  : "opacity-100 translate-y-0 scale-100"
            }`}
          >
            {displayedExplanation}
          </p>
        </div>
      </div>
    </>
  );
}
