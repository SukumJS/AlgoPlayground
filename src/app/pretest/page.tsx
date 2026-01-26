"use client";

import React, { useState, useCallback } from "react";
import TrackProgress from "@/src/components/TrackProgress";
import QuestionCard from "@/src/components/QuestionCard";
import ChoiceCard from "@/src/components/ChoiceCard";
import NavigationButtons from "@/src/components/NavigationButtons";
import ResultPage from "@/src/app/result/page";
import { QuizData, UserAnswer } from "../types/quiz";
import { sampleQuizData } from "../data/quizData";

type PretestPageProps = {
  quizData?: QuizData;
  onGoToPlayground?: () => void;
};

function PretestPage({
  quizData = sampleQuizData,
  onGoToPlayground,
}: PretestPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(
    quizData.questions.map((q) => ({
      questionId: q.id,
      selectedChoiceId: null,
    })),
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const currentAnswer = userAnswers.find(
    (a) => a.questionId === currentQuestion.id,
  );
  const hasSelectedAnswer = currentAnswer?.selectedChoiceId !== null;

  const handleSelectChoice = useCallback(
    (choiceId: string) => {
      if (isSubmitted) return;

      setUserAnswers((prev) =>
        prev.map((answer) =>
          answer.questionId === currentQuestion.id
            ? { ...answer, selectedChoiceId: choiceId }
            : answer,
        ),
      );
    },
    [currentQuestion.id, isSubmitted],
  );

  const handleBack = useCallback(() => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [isFirstQuestion]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      // Submit quiz - show results page
      setIsSubmitted(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [isLastQuestion]);

  const handleGoToPlayground = useCallback(() => {
    if (onGoToPlayground) {
      onGoToPlayground();
    } else {
      // Default behavior: could navigate to playground or reset
      console.log("Navigate to playground");
      // For demo: you could redirect here
      // window.location.href = "/playground";
    }
  }, [onGoToPlayground]);

  // Show Result Page after submission
  if (isSubmitted) {
    return (
      <ResultPage
        quizData={quizData}
        userAnswers={userAnswers}
        onGoToPlayground={handleGoToPlayground}
      />
    );
  }

  // Show Quiz Page
  return (
    <div className="bg-white min-h-screen w-full">
      <div className="max-w-[1440px] mx-auto sm:px-8 sm:py-8">
        {/* Progress Navbar */}
        <TrackProgress
          current={currentQuestionIndex + 1}
          total={totalQuestions}
          title={quizData.title}
          className="mb-32"
        />
        <div className="sm:px-8">
          {/* Question Card */}
          <QuestionCard question={currentQuestion.question} className="mb-9" />

          {/* Answer instruction */}
          <p className="font-bold text-base text-[#222121] mb-9">
            Answer the question:
          </p>

          {/* Choice Grid */}
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

          {/* Navigation Buttons */}
          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
            isFirstQuestion={isFirstQuestion}
            isLastQuestion={isLastQuestion}
            hasSelectedAnswer={hasSelectedAnswer}
          />
        </div>
      </div>
    </div>
  );
}

export default PretestPage;
