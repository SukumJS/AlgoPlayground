"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TrackProgress from "@/src/components/pretest/TrackProgress";
import QuestionCard from "@/src/components/pretest/QuestionCard";
import ChoiceCard from "@/src/components/pretest/ChoiceCard";
import NavigationButtons from "@/src/components/pretest/NavigationButtons";
import IncompleteQuizModal from "@/src/components/shared/IncompleteQuizModal";
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
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Ref to track the latest answers for auto-save (avoids stale closure)
  const answersRef = useRef<UserAnswer[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        // If status check fails, continue to pretest
      }
    };

    checkStatus();
  }, [algorithm, algoType, router]);

  // Fetch pretest questions from API (resumes progress if exists)
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

        // Limit to the first 5 questions regardless of how many the DB returns
        const limitedQuestions = data.questions.slice(0, 5);
        const limitedData = { ...data, questions: limitedQuestions };

        setQuizData(limitedData);

        // Restore saved answers if they exist, otherwise create empty answers
        let initialAnswers: UserAnswer[];
        if (data.savedAnswers && data.savedAnswers.length > 0) {
          // Map saved answers back to UserAnswer format
          const savedMap = new Map(
            data.savedAnswers.map((a) => [a.questionId, a.selectedChoiceId]),
          );
          initialAnswers = limitedQuestions.map((q) => ({
            questionId: q.id,
            selectedChoiceId: savedMap.get(q.id) || null,
          }));
        } else {
          initialAnswers = limitedQuestions.map((q) => ({
            questionId: q.id,
            selectedChoiceId: null,
          }));
        }

        setUserAnswers(initialAnswers);
        answersRef.current = initialAnswers;
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

  // Auto-save progress (debounced 1s after last answer change)
  const scheduleAutoSave = useCallback(
    (answers: UserAnswer[]) => {
      if (!algorithm) return;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(async () => {
        try {
          await pretestService.savePretestProgress(algorithm, answers);
        } catch {
          // Silent fail — don't interrupt the user
        }
      }, 1000);
    },
    [algorithm],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      // Final save on unmount with latest answers
      if (
        algorithm &&
        answersRef.current.some((a) => a.selectedChoiceId !== null)
      ) {
        pretestService
          .savePretestProgress(algorithm, answersRef.current)
          .catch(() => {});
      }
    };
  }, [algorithm]);

  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const totalQuestions = 5;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const currentAnswer = currentQuestion
    ? userAnswers.find((a) => a.questionId === currentQuestion.id)
    : undefined;
  const hasSelectedAnswer = currentAnswer?.selectedChoiceId !== null;

  const handleSelectChoice = useCallback(
    (choiceId: string) => {
      if (gradingResult || !currentQuestion) return;

      setUserAnswers((prev) => {
        const updated = prev.map((answer) =>
          answer.questionId === currentQuestion.id
            ? { ...answer, selectedChoiceId: choiceId }
            : answer,
        );
        answersRef.current = updated;
        scheduleAutoSave(updated);
        return updated;
      });
    },
    [currentQuestion, gradingResult, scheduleAutoSave],
  );

  const handleBack = useCallback(() => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [isFirstQuestion]);

  const unansweredCount = userAnswers.filter(
    (a) => a.selectedChoiceId === null,
  ).length;

  const handleNext = useCallback(async () => {
    if (isLastQuestion) {
      const hasUnanswered = userAnswers.some(
        (a) => a.selectedChoiceId === null,
      );
      if (hasUnanswered) {
        setShowIncompleteModal(true);
        return;
      }

      // Cancel any pending auto-save
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

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

  // Show result page after grading
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

      <IncompleteQuizModal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        unansweredCount={unansweredCount}
        totalCount={totalQuestions}
      />
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
