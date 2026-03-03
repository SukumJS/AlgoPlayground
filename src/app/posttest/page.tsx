"use client";

import React, { useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TrackProgress from "@/src/components/pretest/TrackProgress";
import QuestionCard from "@/src/components/pretest/QuestionCard";
import NavigationButtons from "@/src/components/pretest/NavigationButtons";
import PosttestQuestionRenderer from "@/src/components/posttest/PosttestQuestionRenderer";
import PosttestResultPage from "@/src/components/posttest/PosttestResultPage";
import { PosttestQuestion, PosttestUserAnswer } from "@/src/app/types/posttest";
import { posttestDataMap } from "@/src/data/posttestData";

// ─── Random question selection ───────────────────────────────────────
// Select 5 questions ensuring at least 1 of each type
function selectRandomQuestions(
  allQuestions: PosttestQuestion[],
  count: number = 5,
): PosttestQuestion[] {
  const types = ["multiple_choice", "fill_blank", "ordering"] as const;

  // Group by type
  const byType: Record<string, PosttestQuestion[]> = {};
  for (const t of types) {
    byType[t] = allQuestions.filter((q) => q.type === t);
  }

  const selected: PosttestQuestion[] = [];
  const usedIds = new Set<string>();

  // Pick at least 1 of each type
  for (const t of types) {
    const pool = byType[t];
    if (pool.length > 0) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      selected.push(pick);
      usedIds.add(pick.id);
    }
  }

  // Fill remaining slots from unused questions
  const remaining = allQuestions.filter((q) => !usedIds.has(q.id));
  const shuffled = [...remaining].sort(() => Math.random() - 0.5);

  for (const q of shuffled) {
    if (selected.length >= count) break;
    selected.push(q);
  }

  // Shuffle final selection
  return selected.sort(() => Math.random() - 0.5);
}

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
          // Canvas ordering: start with empty selection (user clicks nodes)
          return { ...base, orderedItems: [] };
        }
        // Drag-and-drop ordering: shuffle items for initial display
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
      return items.length > 0; // canvas: needs at least 1 selection; drag-drop: always has items
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

  // Load data and select questions
  const posttest = posttestDataMap[algorithm];

  const selectedQuestions = useMemo(() => {
    if (!posttest) return [];
    return selectRandomQuestions(posttest.questions, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<PosttestUserAnswer[]>(() =>
    initAnswers(selectedQuestions),
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const totalQuestions = selectedQuestions.length;
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

  // No data found
  if (!posttest || selectedQuestions.length === 0) {
    return (
      <div className="bg-white min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold text-[#222121]">
            No posttest data found for &quot;{algorithm}&quot;
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
        selectedQuestions={selectedQuestions}
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

          {/* Question renderer (routes to correct component by type) */}
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
