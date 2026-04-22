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
import NavigationButtons from "@/src/components/pretest/NavigationButtons";
import PosttestQuestionRenderer from "@/src/components/posttest/PosttestQuestionRenderer";
import PosttestResultPage from "@/src/components/posttest/PosttestResultPage";
import { PosttestUserAnswer } from "@/src/app/types/posttest";
import {
  posttestService,
  PosttestDataDTO,
  PosttestGradingResult,
} from "@/src/services/posttest.service";

// ─── Initialize answers from questions ───────────────────────────────
function initAnswers(
  questions: PosttestDataDTO["questions"],
  saved?: PosttestUserAnswer[],
): PosttestUserAnswer[] {
  const savedMap = new Map((saved || []).map((a) => [a.questionId, a]));

  return questions.map((q) => {
    const existing = savedMap.get(q.id);
    if (existing) return existing;

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
        if (q.question.canvasData) {
          // Canvas ordering should start with no selection; user must click nodes.
          return { ...base, orderedItems: [] };
        }
        const items = q.question.items || [];
        const shuffledIds = [...items]
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
    case "ordering":
      return (answer.orderedItems || []).length > 0;
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

  const [posttest, setPosttest] = useState<PosttestDataDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<PosttestUserAnswer[]>([]);
  const [gradingResult, setGradingResult] =
    useState<PosttestGradingResult | null>(null);

  // Auto-save debounce
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef(userAnswers);
  answersRef.current = userAnswers;

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

        const { data } = response.data;

        if (!data || !data.questions || data.questions.length === 0) {
          setError(`No posttest questions found for "${algorithm}"`);
          return;
        }

        setPosttest(data);
        setUserAnswers(initAnswers(data.questions, data.savedAnswers));
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

  // Auto-save progress when answers change
  const saveProgress = useCallback(async () => {
    if (!algorithm || answersRef.current.length === 0) return;
    try {
      await posttestService.savePosttestProgress(algorithm, answersRef.current);
    } catch {
      // Silent fail
    }
  }, [algorithm]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (algorithm && answersRef.current.some((answer) => hasAnswer(answer))) {
        posttestService
          .savePosttestProgress(algorithm, answersRef.current)
          .catch(() => {});
      }
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

  const handleAnswer = useCallback(
    (newAnswer: PosttestUserAnswer) => {
      setUserAnswers((prev) =>
        prev.map((a) =>
          a.questionId === newAnswer.questionId ? newAnswer : a,
        ),
      );

      // Debounced auto-save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveProgress();
      }, 1000);
    },
    [saveProgress],
  );

  const handleBack = useCallback(() => {
    if (!isFirstQuestion) setCurrentQuestionIndex((prev) => prev - 1);
  }, [isFirstQuestion]);

  const handleNext = useCallback(async () => {
    if (isLastQuestion) {
      // Submit for backend grading
      setIsSubmitting(true);
      try {
        const response = await posttestService.submitPosttestAnswers(
          algorithm,
          userAnswers,
        );
        setGradingResult(response.data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit posttest",
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [isLastQuestion, algorithm, userAnswers]);

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

  // Submitting state
  if (isSubmitting) {
    return (
      <div className="bg-white min-h-screen w-full flex items-center justify-center">
        <p className="text-lg text-gray-500">Submitting posttest...</p>
      </div>
    );
  }

  // Show result page after grading
  if (gradingResult) {
    return (
      <PosttestResultPage
        title={posttest.title}
        questions={posttest.questions}
        userAnswers={userAnswers}
        gradingResult={gradingResult}
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

          {/* Question renderer — cast to expected type */}
          {currentAnswer && (
            <div className="mb-10">
              <PosttestQuestionRenderer
                question={currentQuestion as never}
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
