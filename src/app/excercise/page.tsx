"use client";

import { useState } from "react";
import ExerciseCard from "@/src/components/ExerciseCard";
import type { Exercise, Difficulty } from "@/src/types/exercise";
import { Filter } from "lucide-react";

/* ---------------- Mock Data ---------------- */
const exercises: Exercise[] = [
  {
    title: "Bubble Sort the Task List",
    difficulty: "Easy",
    description:
      "You are given an unsorted list of integers representing the processing times of tasks.",
    requirement:
      "Implement Bubble Sort manually without using built-in sorting functions.",
    example:
      "Input: [64, 34, 25, 12, 22, 11, 90]\nOutput: [11, 12, 22, 25, 34, 64, 90]",
    tips: [
      {
        label: "Pseudo Code",
        content: `procedure bubbleSort(arr):
  n ← length(arr)

  for i ← 0 to n - 2:
    swapped ← false

    for j ← 0 to n - i - 2:
      if arr[j] > arr[j + 1]:
        swap(arr[j], arr[j + 1])
        swapped ← true

    if swapped == false:
      break`,
      },
      {
        label: "Key Idea",
        content:
          "Repeatedly compare adjacent elements and swap them if they are in the wrong order.",
      },
    ],
  },

  {
    title: "Selection Sort Simulation",
    difficulty: "Medium",
    description:
      "Simulate the Selection Sort algorithm by repeatedly selecting the minimum element.",
    requirement: "Show each selection step clearly.",
    example:
      "Input: [29, 10, 14, 37, 13]\nOutput: [10, 13, 14, 29, 37]",
    tips: [
      {
        label: "Pseudo Code",
        content: `procedure selectionSort(arr):
  n ← length(arr)

  for i ← 0 to n - 2:
    minIndex ← i

    for j ← i + 1 to n - 1:
      if arr[j] < arr[minIndex]:
        minIndex ← j

    swap(arr[i], arr[minIndex])`,
      },
    ],
  },
];


export default function ExercisesPage() {
  const [filter, setFilter] = useState<"All" | Difficulty>("All");

  const filteredExercises =
    filter === "All"
      ? exercises
      : exercises.filter(
          (exercise) => exercise.difficulty === filter
        );

  return (
    <main className="mx-auto max-w-12xl px-16 py-6">
      <div className="mb-4 flex items-center gap-2 text-xs">
        <span className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          Filter by difficulty:
        </span>

        {(["All", "Easy", "Medium", "Hard"] as const).map(
          (level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`
                cursor-pointer rounded-md border px-3 py-1 font-medium transition
                ${
                  filter === level
                    ? "border-blue-300 bg-[#0066CC] text-white shadow-sm"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                }
              `}
            >
              {level}
            </button>
          )
        )}
      </div>

      <div className="space-y-3">
        {filteredExercises.map((exercise, index) => (
          <ExerciseCard
            key={index}
            exercise={exercise}
          />
        ))}

        {filteredExercises.length === 0 && (
          <p className="text-sm text-gray-500">
            No exercises found.
          </p>
        )}
      </div>
    </main>
  );
}