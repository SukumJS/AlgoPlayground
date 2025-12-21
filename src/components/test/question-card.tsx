'use client';

import { motion } from 'framer-motion';
import { Question, QuestionType } from '@/types';
import { cn } from '@/lib/utils';
import { MultipleChoice, TrueFalse } from './multiple-choice';
import { DragDropOrder } from './drag-drop-order';
import { DragDropMatch } from './drag-drop-match';
import { FillBlank, CodeFillBlank } from './fill-blank';
import {
  HelpCircle,
  CheckSquare,
  ToggleLeft,
  ArrowUpDown,
  Link2,
  PenLine,
} from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  answer: unknown;
  onAnswer: (answer: unknown) => void;
  showResult?: boolean;
  disabled?: boolean;
  className?: string;
}

// ===========================================
// Question Type Config
// ===========================================

const questionTypeConfig: Record<QuestionType, { icon: React.ElementType; label: string }> = {
  'MULTIPLE_CHOICE': { icon: CheckSquare, label: 'Multiple Choice' },
  'TRUE_FALSE': { icon: ToggleLeft, label: 'True/False' },
  'DRAG_DROP_ORDER': { icon: ArrowUpDown, label: 'Order the Steps' },
  'DRAG_DROP_MATCH': { icon: Link2, label: 'Match the Pairs' },
  'FILL_BLANK': { icon: PenLine, label: 'Fill in the Blank' },
};

// ===========================================
// Question Card Component
// ===========================================

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswer,
  showResult = false,
  disabled = false,
  className,
}: QuestionCardProps) {
  const config = questionTypeConfig[question.type] || { icon: HelpCircle, label: 'Question' };
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <span className="text-sm text-gray-500">{config.label}</span>
              <div className="font-medium text-gray-900">
                Question {questionNumber} of {totalQuestions}
              </div>
            </div>
          </div>
          
          {question.points && (
            <div className="text-sm text-gray-500">
              {question.points} {question.points === 1 ? 'point' : 'points'}
            </div>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        {/* Question Text */}
        {question.type !== 'FILL_BLANK' && (
          <p className="text-lg text-gray-800 mb-6">
            {question.questionText}
          </p>
        )}

        {/* Question Type Specific Component */}
        {renderQuestionInput(question, answer, onAnswer, showResult, disabled)}

        {/* Explanation (shown after answering) */}
        {showResult && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-gray-100"
          >
            <h4 className="text-sm font-medium text-gray-700 mb-2">Explanation</h4>
            <p className="text-sm text-gray-600">{question.explanation}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ===========================================
// Render Question Input Helper
// ===========================================

function renderQuestionInput(
  question: Question,
  answer: unknown,
  onAnswer: (answer: unknown) => void,
  showResult: boolean,
  disabled: boolean
) {
  switch (question.type) {
    case 'MULTIPLE_CHOICE':
      return (
        <MultipleChoice
          question={question}
          selectedAnswer={answer as string | null}
          onAnswer={onAnswer}
          showResult={showResult}
          disabled={disabled}
        />
      );

    case 'TRUE_FALSE':
      return (
        <TrueFalse
          question={question}
          selectedAnswer={answer as boolean | null}
          onAnswer={onAnswer}
          showResult={showResult}
          disabled={disabled}
        />
      );

    case 'DRAG_DROP_ORDER':
      return (
        <DragDropOrder
          question={question}
          currentOrder={answer as string[] || []}
          onOrderChange={onAnswer}
          showResult={showResult}
          disabled={disabled}
        />
      );

    case 'DRAG_DROP_MATCH':
      return (
        <DragDropMatch
          question={question}
          matches={answer as Record<string, string> || {}}
          onMatchChange={onAnswer}
          showResult={showResult}
          disabled={disabled}
        />
      );

    case 'FILL_BLANK':
      // Check if it's code-based
      const isCodeQuestion = question.questionText.includes('```') || 
                             question.questionText.includes('function') ||
                             question.questionText.includes('def ');
      
      if (isCodeQuestion) {
        return (
          <CodeFillBlank
            question={question}
            answer={answer as string || ''}
            onAnswer={onAnswer}
            showResult={showResult}
            disabled={disabled}
          />
        );
      }
      
      return (
        <FillBlank
          question={question}
          answer={answer as string || ''}
          onAnswer={onAnswer}
          showResult={showResult}
          disabled={disabled}
        />
      );

    default:
      return (
        <div className="text-center text-gray-400 py-8">
          Unknown question type
        </div>
      );
  }
}

// ===========================================
// Question Navigation Dots
// ===========================================

interface QuestionDotsProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  onQuestionClick: (index: number) => void;
  className?: string;
}

export function QuestionDots({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onQuestionClick,
  className,
}: QuestionDotsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2 flex-wrap', className)}>
      {Array.from({ length: totalQuestions }).map((_, index) => {
        const isAnswered = answeredQuestions.has(index);
        const isCurrent = index === currentQuestion;

        return (
          <button
            key={index}
            onClick={() => onQuestionClick(index)}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
              isCurrent && 'ring-2 ring-primary-500 ring-offset-2',
              isAnswered && !isCurrent && 'bg-primary-500 text-white',
              !isAnswered && !isCurrent && 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              isCurrent && isAnswered && 'bg-primary-500 text-white',
              isCurrent && !isAnswered && 'bg-primary-100 text-primary-700'
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
