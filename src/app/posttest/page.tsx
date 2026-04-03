"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TrackProgress from "@/src/components/pretest/TrackProgress";
import QuestionCard from "@/src/components/pretest/QuestionCard";
import NavigationButtons from "@/src/components/pretest/NavigationButtons";
import PosttestQuestionRenderer from "@/src/components/posttest/PosttestQuestionRenderer";
import PosttestResultPage from "@/src/components/posttest/PosttestResultPage";
import {
  PosttestQuestion,
  PosttestUserAnswer,
  PosttestData,
} from "@/src/app/types/posttest";
import { posttestService } from "@/src/services/posttest.service";

// ─── Initialize answers ──────────────────────────────────────────────
function initAnswers(questions: PosttestQuestion[]): PosttestUserAnswer[] {
  return questions.map((q) => {
    const base: PosttestUserAnswer = {
      questionId: q.id,
      type: q.type,
    };

    switch (q.type) {
      case "multiple_choice":
        return { ...base, selectedChoiceId: null };
      case "fill_blank":
        return { ...base, filledAnswer: "" };
      case "ordering": {
        const hasCanvas = q.question.canvasData !== undefined;
        if (hasCanvas) {
          return { ...base, orderedItems: [] };
        }
        const shuffledIds = [...q.question.items]
          .sort(() => Math.random() - 0.5)
          .map((item) => item.id);
        return { ...base, orderedItems: shuffledIds };
      }
      default:
        return base;
    }
  });
}

// ─── Check if question has been answered ─────────────────────────────
function hasAnswer(answer: PosttestUserAnswer): boolean {
  switch (answer.type) {
    case "multiple_choice":
      return (
        answer.selectedChoiceId !== null &&
        answer.selectedChoiceId !== undefined
      );
    case "fill_blank":
      return (answer.filledAnswer || "").trim().length > 0;
    case "ordering": {
      const items = answer.orderedItems || [];
      return items.length > 0;
    }
    default:
      return false;
  }
}

// ─── Main Posttest Component ─────────────────────────────────────────
function PosttestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const algoType = searchParams.get("type") || "sorting";
  const algorithm = searchParams.get("algorithm") || "";

  const [posttest, setPosttest] = useState<PosttestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<PosttestUserAnswer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch posttest questions from API
  useEffect(() => {
    if (!algorithm) {
      setIsLoading(false);
      setError("No algorithm specified");
      return;
    }

    let cancelled = false;

    const fetchPosttest = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await posttestService.getPosttestByAlgorithm(algorithm);
        if (cancelled) return;

        const data = response.data.data;

        if (!data || !data.questions || data.questions.length === 0) {
          setError(`No posttest questions found for "${algorithm}"`);
          return;
        }

        setPosttest(data);
        setUserAnswers(initAnswers(data.questions));
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load posttest data",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPosttest();
    return () => {
      cancelled = true;
    };
  }, [algorithm]);

  const currentQuestion = posttest?.questions[currentQuestionIndex];
  const totalQuestions = posttest?.questions.length ?? 0;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const currentAnswer = userAnswers.find(
    (a) => a.questionId === currentQuestion?.id,
  );
  const answered = currentAnswer ? hasAnswer(currentAnswer) : false;

  const handleAnswer = useCallback((newAnswer: PosttestUserAnswer) => {
    setUserAnswers((prev) =>
      prev.map((a) => (a.questionId === newAnswer.questionId ? newAnswer : a)),
    );
  }, []);

  const handleBack = useCallback(() => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [isFirstQuestion]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      setIsSubmitted(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [isLastQuestion]);

  const handleGoHome = useCallback(() => {
    router.push("/");
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen w-full flex items-center justify-center">
        <p className="text-lg text-gray-500">Loading posttest...</p>
      </div>
    );
  }

  // Error / no data
  if (error || !posttest || !currentQuestion) {
    return (
      <div className="bg-white min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold text-[#222121]">
            {error || `No posttest data found for "${algorithm}"`}
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

  // Show result page after submission
  if (isSubmitted) {
    return (
      <PosttestResultPage
        posttest={posttest}
        selectedQuestions={posttest.questions}
        userAnswers={userAnswers}
        onGoHome={handleGoHome}
        algoType={algoType}
      />
    );
  }

  return (
    <div className="bg-white min-h-screen w-full">
      <div className="max-w-360 mx-auto sm:px-8 sm:py-8">
        {/* Progress Bar */}
        <TrackProgress
          current={currentQuestionIndex + 1}
          total={totalQuestions}
          title={posttest.title}
          className="mb-16"
        />
        <div className="sm:px-8">
          {/* Question Card */}
          <QuestionCard question={currentQuestion.text} className="mb-9" />

          {/* Answer instruction */}
          <p className="font-bold text-lg text-[#222121] mb-9">
            Answer the question:
          </p>

          {/* Question renderer */}
          {currentAnswer && (
            <div className="mb-10">
              <PosttestQuestionRenderer
                question={currentQuestion}
                answer={currentAnswer}
                onAnswer={handleAnswer}
                algoType={algoType}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
            isFirstQuestion={isFirstQuestion}
            isLastQuestion={isLastQuestion}
            hasSelectedAnswer={answered}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page export with Suspense ───────────────────────────────────────
export default function PosttestPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen w-full flex items-center justify-center">
          <p className="text-lg text-gray-500">Loading...</p>
        </div>
      }
    >
      <PosttestContent />
    </Suspense>
  );
}
