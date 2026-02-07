import { useState } from "react";
import { Lightbulb } from "lucide-react";
import TipsModal from "@/src/components/excercise/TipsModal";
import type { Exercise, Difficulty } from "@/src/app/types/exercise";

function DifficultyBadge({ level }: { level: Difficulty }) {
  const styles: Record<Difficulty, string> = {
    Easy: "bg-green-100 text-green-700",
    Medium: "bg-orange-100 text-orange-700",
    Hard: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-0.5 text-base font-medium ${styles[level]}`}
    >
      {level}
    </span>
  );
}

export default function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);
  const [showTips, setShowTips] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-inner">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setOpen(!open)}
        >
          <h3 className="text-base font-semibold text-gray-900">
            {exercise.title}
          </h3>

          <div className="flex items-center gap-2">
            <DifficultyBadge level={exercise.difficulty} />

            <svg
              className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {open && (
          <div className="mt-3 space-y-3 text-base text-gray-700">
            <p className="leading-relaxed">
              {exercise.description}
            </p>

            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1 font-semibold text-gray-900">
                  Requirement
                </p>
                <p className="leading-relaxed text-gray-600">
                  {exercise.requirement}
                </p>
              </div>

              <div className="relative pb-2 pr-2">
                <p className="mb-1  font-semibold text-gray-900">
                  Example
                </p>

                <div className="rounded-md bg-gray-900 px-3 py-2 mr-28 font-mono text-[11px] leading-relaxed text-white whitespace-pre-wrap">
                  {exercise.example}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTips(true);
                  }}
                  className="cursor-pointer absolute bottom-0 right-0 translate-x-1 -translate-y-1
                            flex h-7 w-7 items-center justify-center rounded-full
                            border border-black-300 bg-white text-gray-600 shadow
                            hover:bg-gray-100 transition"
                  aria-label="Show tips"
                >
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <TipsModal
        isOpen={showTips}
        onClose={() => setShowTips(false)}
        title="Tips"
        sections={exercise.tips}
      />

    </>
  );
}
