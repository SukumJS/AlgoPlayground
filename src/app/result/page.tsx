"use client";

import React from "react";
import TrackProgress from "@/src/components/pretest/TrackProgress";
import ChoiceCard from "@/src/components/pretest/ChoiceCard";
import type { UserAnswer } from "../types/quiz";
import type { PretestGradingResult } from "@/src/services/pretest.service";

type QuizQuestion = {
  id: string;
  question: string;
  questionImage?: string;
  choices: { id: string; label: string; text: string }[];
};

type QuizLike = {
  id: string;
  title: string;
  questions: QuizQuestion[];
};

type ResultPageProps = {
  quizData: QuizLike;
  userAnswers: UserAnswer[];
  gradingResult: PretestGradingResult;
  onGoToPlayground: () => void;
  className?: string;
};

function ResultPage({
  quizData,
  userAnswers,
  gradingResult,
  onGoToPlayground,
  className = "",
}: ResultPageProps) {
  if (!quizData || !userAnswers || !gradingResult) {
    return (
      <div className="bg-white min-h-screen w-full flex items-center justify-center">
        <p className="text-gray-500">No quiz data available.</p>
      </div>
    );
  }

  // Build a lookup from grading results
  const resultMap = new Map(
    gradingResult.results.map((r) => [r.questionId, r.isCorrect]),
  );

  return (
    <div className={`bg-white min-h-screen w-full ${className}`}>
      <div className="max-w-[1440px] mx-auto sm:px-8 sm:py-8">
        {/* Progress bar — complete */}
        <TrackProgress
          current={quizData.questions.length}
          total={quizData.questions.length}
          title={quizData.title}
          isComplete={true}
          className="mb-10"
        />

        {/* Score display */}
        <div className="flex justify-center mb-10">
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-md px-6 py-4 text-center">
            <p className="text-sm text-gray-500 font-medium mb-1">Your Score</p>
            <p className="text-3xl font-bold text-[#222121]">
              {gradingResult.score}/{gradingResult.totalQuestions}
            </p>
          </div>
        </div>

        {/* Questions with results */}
        <div className="space-y-10 px-8">
          {quizData.questions.map((question, questionIndex) => {
            const userAnswer = userAnswers.find(
              (a) => a.questionId === question.id,
            );
            const isCorrect = resultMap.get(question.id) ?? false;

            return (
              <div key={question.id} className="space-y-4">
                {/* Question header with ✅/❌ */}
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[#222121] text-base md:text-lg font-semibold">
                    <span>{questionIndex + 1}.</span> {question.question}
                  </p>
                  <div
                    className={`shrink-0 px-3 py-1 border rounded-lg text-sm font-medium ${
                      isCorrect
                        ? "border-green-300 text-green-600 bg-green-50"
                        : "border-red-300 text-red-600 bg-red-50"
                    }`}
                  >
                    {isCorrect ? "1/1" : "0/1"}
                  </div>
                </div>

                {/* Choices grid — show what user selected, no correct answer highlight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {question.choices.map((choice) => {
                    const isUserSelection =
                      choice.id === userAnswer?.selectedChoiceId;

                    return (
                      <ChoiceCard
                        key={choice.id}
                        id={choice.id}
                        text={choice.text}
                        isSelected={isUserSelection}
                        disabled={true}
                        onSelect={() => {}}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Go to Playground button */}
        <div className="flex justify-end mt-10 px-8">
          <button
            onClick={onGoToPlayground}
            className="px-8 py-3 bg-[#0066cc] text-white font-medium text-base rounded-lg hover:bg-[#0052a3] transition-colors cursor-pointer"
          >
            Go to playground
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
