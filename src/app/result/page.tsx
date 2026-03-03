"use client";

import React from "react";
import TrackProgress from "@/src/components/pretest/TrackProgress";
import ChoiceCard from "@/src/components/pretest/ChoiceCard";
import { QuizData, UserAnswer } from "../types/quiz";
import Link from "next/link";

type ResultPageProps = {
  quizData: QuizData;
  userAnswers: UserAnswer[];
  onGoToPlayground: () => void;
  className?: string;
};

function ResultPage({
  quizData,
  userAnswers,
  onGoToPlayground,
  className = "",
}: ResultPageProps) {
  if (!quizData || !userAnswers) {
    return (
      <div className="bg-white min-h-screen w-full flex items-center justify-center">
        <p className="text-gray-500">No quiz data available.</p>
      </div>
    );
  }

  // Calculate score for each question
  const getQuestionScore = (
    questionId: string,
  ): { earned: number; total: number } => {
    const question = quizData.questions.find((q) => q.id === questionId);
    const userAnswer = userAnswers.find((a) => a.questionId === questionId);

    if (!question || !userAnswer) return { earned: 0, total: 1 };

    const isCorrect = userAnswer.selectedChoiceId === question.correctAnswerId;
    return { earned: isCorrect ? 1 : 0, total: 1 };
  };

  // Calculate total score
  const totalScore = quizData.questions.reduce((acc, question) => {
    const score = getQuestionScore(question.id);
    return acc + score.earned;
  }, 0);

  return (
    <div className={`bg-white min-h-screen w-full ${className}`}>
      <div className="max-w-[1440px] mx-auto sm:px-8 sm:py-8">
        {/* Progress Navbar - Complete */}
        <TrackProgress
          current={quizData.questions.length}
          total={quizData.questions.length}
          title={quizData.title}
          isComplete={true}
          className="mb-10"
        />

        {/* All Questions with Results */}
        <div className="space-y-10 px-8">
          {quizData.questions.map((question, questionIndex) => {
            const userAnswer = userAnswers.find(
              (a) => a.questionId === question.id,
            );
            const score = getQuestionScore(question.id);

            return (
              <div key={question.id} className="space-y-4">
                {/* Question Header with Score */}
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[#222121] text-base md:text-lg font-semibold">
                    <span>{questionIndex + 1}.</span> {question.question}
                  </p>
                  <div className="shrink-0 px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600">
                    {score.earned}/{score.total}
                  </div>
                </div>

                {/* Choices Grid */}
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

        {/* Go to Playground Button */}
        <div className="flex justify-end mt-10">
          <Link href="/playground">
            <button
              onClick={onGoToPlayground}
              className="px-8 py-3 bg-[#0066cc] text-white font-medium text-base rounded-lg hover:bg-[#0052a3] transition-colors cursor-pointer"
            >
              Go to playground
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
