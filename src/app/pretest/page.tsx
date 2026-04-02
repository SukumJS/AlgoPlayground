"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TrackProgress from "@/src/components/pretest/TrackProgress";
import QuestionCard from "@/src/components/pretest/QuestionCard";
import ChoiceCard from "@/src/components/pretest/ChoiceCard";
import NavigationButtons from "@/src/components/pretest/NavigationButtons";
import PretestResultPage from "@/src/app/result/page";
import type { UserAnswer } from "../types/quiz";
import {
  pretestService,
  type PretestQuizData,
  type PretestGradingResult,
} from "@/src/services/pretest.service";

function PretestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const algoType = searchParams.get("type") || "";
  const algorithm = searchParams.get("algorithm") || "";

  const [quizData, setQuizData] = useState<PretestQuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingResult, setGradingResult] =
    useState<PretestGradingResult | null>(null);

  // Check if user already completed pretest → redirect to playground
  useEffect(() => {
    if (!algorithm) return;

    const checkStatus = async () => {
      try {
        const res = await pretestService.checkPretestStatus(algorithm);
        if (res.data.data.completed) {
          router.replace(`/playground?type=${algoType}&algorithm=${algorithm}`);
        }
      } catch {
        // If status check fails (e.g. not logged in), continue to pretest
      }
    };

    checkStatus();
  }, [algorithm, algoType, router]);

  // Fetch pretest questions from API
  useEffect(() => {
    if (!algorithm) {
      setIsLoading(false);
      setError("No algorithm specified");
      return;
    }

    let cancelled = false;

    const fetchPretest = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await pretestService.getPretestByAlgorithm(algorithm);
        if (cancelled) return;

        const data = response.data.data;

        if (!data || !data.questions || data.questions.length === 0) {
          setError(`No pretest questions found for "${algorithm}"`);
          return;
        }

        setQuizData(data);
        setUserAnswers(
          data.questions.map((q) => ({
            questionId: q.id,
            selectedChoiceId: null,
          })),
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load pretest data",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPretest();
    return () => {
      cancelled = true;
    };
  }, [algorithm]);

  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const totalQuestions = quizData?.questions.length ?? 0;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const currentAnswer = currentQuestion
    ? userAnswers.find((a) => a.questionId === currentQuestion.id)
    : undefined;
  const hasSelectedAnswer = currentAnswer?.selectedChoiceId !== null;

  const handleSelectChoice = useCallback(
    (choiceId: string) => {
      if (gradingResult || !currentQuestion) return;

      setUserAnswers((prev) =>
        prev.map((answer) =>
          answer.questionId === currentQuestion.id
            ? { ...answer, selectedChoiceId: choiceId }
            : answer,
        ),
      );
    },
    [currentQuestion, gradingResult],
  );

  const handleBack = useCallback(() => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [isFirstQuestion]);

  const handleNext = useCallback(async () => {
    if (isLastQuestion) {
      // Submit answers to backend for grading
      setIsSubmitting(true);
      try {
        const res = await pretestService.submitPretestAnswers(
          algorithm,
          userAnswers,
        );
        setGradingResult(res.data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit answers",
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [isLastQuestion, algorithm, userAnswers]);

  const handleGoToPlayground = useCallback(() => {
    router.push(`/playground?type=${algoType}&algorithm=${algorithm}`);
  }, [router, algoType, algorithm]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen w-full flex items-center justify-center">
        <p className="text-lg text-gray-500">Loading pretest...</p>
      </div>
    );
  }

  // Error / no data
  if (error || !quizData || !currentQuestion) {
    return (
      <div className="bg-white min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold text-[#222121]">
            {error || `No pretest data found for "${algorithm}"`}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] transition-colors cursor-pointer"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Show result page after grading completes
  if (gradingResult && quizData) {
    return (
      <PretestResultPage
        quizData={quizData}
        userAnswers={userAnswers}
        gradingResult={gradingResult}
        onGoToPlayground={handleGoToPlayground}
      />
    );
  }

  // Show Quiz Page
  return (
    <div className="bg-white min-h-screen w-full">
      <div className="max-w-360 mx-auto sm:px-8 sm:py-8">
        <TrackProgress
          current={currentQuestionIndex + 1}
          total={totalQuestions}
          title={quizData.title}
          className="mb-16"
        />
        <div className="sm:px-8">
          <QuestionCard question={currentQuestion.question} className="mb-9" />

          <p className="font-bold text-lg text-[#222121] mb-9">
            Answer the question:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            {currentQuestion.choices.map((choice) => (
              <ChoiceCard
                key={choice.id}
                id={choice.id}
                text={choice.text}
                isSelected={currentAnswer?.selectedChoiceId === choice.id}
                onSelect={handleSelectChoice}
              />
            ))}
          </div>

          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
            isFirstQuestion={isFirstQuestion}
            isLastQuestion={isLastQuestion}
            hasSelectedAnswer={hasSelectedAnswer}
          />

          {isSubmitting && (
            <p className="text-center text-gray-500 mt-4">
              Submitting answers...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PretestPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen w-full flex items-center justify-center">
          <p className="text-lg text-gray-500">Loading...</p>
        </div>
      }
    >
      <PretestContent />
    </Suspense>
  );
}
