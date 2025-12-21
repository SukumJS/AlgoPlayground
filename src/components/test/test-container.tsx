'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Question, TestType, AlgorithmSlug } from '@/types';
import { useTestStore } from '@/stores';
import { cn } from '@/lib/utils';
import { QuestionCard, QuestionDots } from './question-card';
import { TestResults } from './test-results';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  AlertCircle,
} from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface TestContainerProps {
  algorithmSlug: AlgorithmSlug;
  algorithmName: string;
  testType: TestType;
  questions: Question[];
  onComplete?: (score: number, percentage: number) => void;
  previousScore?: number;
  className?: string;
}

// ===========================================
// Test Container Component
// ===========================================

export function TestContainer({
  algorithmSlug,
  algorithmName,
  testType,
  questions,
  onComplete,
  previousScore,
  className,
}: TestContainerProps) {
  const router = useRouter();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Test store
  const {
    currentQuestionIndex,
    answers,
    status,
    score,
    percentage,
    initializeTest,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    setAnswer,
    setDragDropOrderAnswer,
    submitTest,
  } = useTestStore();

  // Initialize test
  useEffect(() => {
    initializeTest({
      algorithmSlug,
      testType,
      questions,
    });
  }, [algorithmSlug, testType, questions, initializeTest]);

  // Timer
  useEffect(() => {
    if (status !== 'in-progress') return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.get(currentQuestionIndex);
  const answeredQuestions = new Set(answers.keys());

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer
  const handleAnswer = useCallback((answer: unknown) => {
    if (currentQuestion.type === 'DRAG_DROP_ORDER') {
      setDragDropOrderAnswer(currentQuestionIndex, answer as string[]);
    } else {
      setAnswer(currentQuestionIndex, answer);
    }
  }, [currentQuestionIndex, currentQuestion?.type, setAnswer, setDragDropOrderAnswer]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    const result = submitTest();
    onComplete?.(result.score, result.percentage);
  }, [submitTest, onComplete]);

  // Can submit?
  const unansweredCount = questions.length - answeredQuestions.size;
  const canSubmit = answeredQuestions.size > 0;

  // Show results
  if (status === 'completed') {
    const correctCount = questions.filter((q, i) => {
      const answer = answers.get(i);
      if (!answer) return false;
      
      // Check answer based on type
      if (q.type === 'DRAG_DROP_ORDER') {
        const correctOrder = q.correctAnswer as string[];
        const userOrder = answer as string[];
        return JSON.stringify(correctOrder) === JSON.stringify(userOrder);
      }
      if (q.type === 'DRAG_DROP_MATCH') {
        const correctMatches = q.correctAnswer as Record<string, string>;
        const userMatches = answer as Record<string, string>;
        return JSON.stringify(correctMatches) === JSON.stringify(userMatches);
      }
      if (q.type === 'FILL_BLANK') {
        return (answer as string).toLowerCase().trim() === 
               (q.correctAnswer as string).toLowerCase().trim();
      }
      return answer === q.correctAnswer;
    }).length;

    return (
      <TestResults
        testType={testType}
        score={score}
        totalPoints={questions.reduce((sum, q) => sum + (q.points || 1), 0)}
        percentage={percentage}
        timeTaken={elapsedTime}
        correctCount={correctCount}
        incorrectCount={questions.length - correctCount}
        previousScore={previousScore}
        onRetry={() => {
          setElapsedTime(0);
          initializeTest({ algorithmSlug, testType, questions });
        }}
        onContinue={() => {
          if (testType === 'PRE_TEST') {
            router.push(`/playground/${algorithmSlug}`);
          } else {
            router.push('/dashboard');
          }
        }}
        onReviewAnswers={() => {
          // TODO: Implement review mode
        }}
        className={className}
      />
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Progress Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
          <div className="text-sm text-gray-600">
            {answeredQuestions.size} of {questions.length} answered
          </div>
        </div>

        <QuestionDots
          totalQuestions={questions.length}
          currentQuestion={currentQuestionIndex}
          answeredQuestions={answeredQuestions}
          onQuestionClick={goToQuestion}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQuestionIndex}
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          answer={currentAnswer}
          onAnswer={handleAnswer}
          showResult={false}
          disabled={false}
        />
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            currentQuestionIndex === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-3">
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              disabled={!canSubmit}
              className={cn(
                'flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors',
                canSubmit
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4" />
              <span>Submit Test</span>
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmSubmit(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Submit Test?
                  </h3>
                  <p className="text-gray-600">
                    {unansweredCount > 0 ? (
                      <>
                        You have <span className="font-medium text-amber-600">{unansweredCount} unanswered</span> question{unansweredCount > 1 ? 's' : ''}. Are you sure you want to submit?
                      </>
                    ) : (
                      'You have answered all questions. Submit your test?'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmSubmit(false);
                    handleSubmit();
                  }}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
