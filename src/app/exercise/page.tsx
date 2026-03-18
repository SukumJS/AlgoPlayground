"use client";

import { useState, useEffect } from "react";
import ExerciseCard from "@/src/components/excercise/ExerciseCard";
import type { Exercise, Difficulty } from "@/src/app/types/exercise";
import { Filter } from "lucide-react";
import Navbar from "@/src/components/Navbar";
import { exerciseService } from "@/src/services/exercise.service";

export default function ExercisesPage() {
  const [filter, setFilter] = useState<"All" | Difficulty>("All");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);
        const response = await exerciseService.getExercises();
        const data = Array.isArray(response.data)
          ? response.data
          : (response.data as { data?: Exercise[] })?.data || [];
        setExercises(data);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const filteredExercises =
    filter === "All"
      ? exercises
      : exercises.filter((exercise) => exercise.difficulty === filter);

  return (
    <main className="mx-auto max-w-12xl px-16 py-6">
      <Navbar onSelectCategory={() => {}} />
      <div className="mx-4">
        <div className="mb-4 mt-15 flex items-center gap-2 text-base">
          <span className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filter by difficulty:
          </span>

          {(["All", "Easy", "Medium", "Hard"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`
                cursor-pointer rounded-md border px-3 py-1 font-medium transition
                ${
                  filter === level
                    ? "border-blue-300 bg-[#0066CC] text-white shadow-base"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                }
              `}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-base text-gray-500">Loading exercises...</p>
          ) : filteredExercises.length > 0 ? (
            filteredExercises.map((exercise, index) => (
              <ExerciseCard key={exercise.title || index} exercise={exercise} />
            ))
          ) : (
            <p className="text-base text-gray-500">No exercises found.</p>
          )}
        </div>
      </div>
    </main>
  );
}
