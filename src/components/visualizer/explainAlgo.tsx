"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExplainAlgoProps {
  tutorialMode?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  explanation?: string;
  /** optional values that describe the current algorithm so the explanation can be contextualized */
  algoType?: string;
  algoName?: string;
}

export default function ExplainAlgo({
  isOpen = true,
  onToggle,
  explanation = "",
  tutorialMode = false,
  algoType,
  algoName,
}: ExplainAlgoProps) {
  const [isExplain, setIsExplain] = useState(isOpen);
  const [displayedExplanation, setDisplayedExplanation] = useState(explanation);
  const [isFading, setIsFading] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Don't animate on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Use requestAnimationFrame to ensure the state update happens after the render
    const frame = requestAnimationFrame(() => {
      setIsFading(true);
    });

    const timer = setTimeout(() => {
      setDisplayedExplanation(explanation);
      setIsFading(false);
    }, 150); // A short duration for the fade-out part

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [explanation]);

  const contentRef = useRef<HTMLDivElement>(null);
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
        <div ref={contentRef} className="p-4 min-h-15">
          <p
            className={`text-lg text-gray-700 transition-opacity duration-150 ${
              isFading ? "opacity-0" : "opacity-100"
            }`}
          >
            {
              // if parent provided algoName we can prefix it for clarity
              algoName ? `${displayedExplanation}` : displayedExplanation
            }
          </p>
        </div>
      </div>
    </>
  );
}
