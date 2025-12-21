'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Question, QuestionOption } from '@/types';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface MultipleChoiceProps {
  question: Question;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  disabled?: boolean;
}

// ===========================================
// Multiple Choice Component
// ===========================================

export function MultipleChoice({
  question,
  selectedAnswer,
  onAnswer,
  showResult = false,
  disabled = false,
}: MultipleChoiceProps) {
  const options = question.options as QuestionOption[];

  const getOptionState = (optionId: string) => {
    if (!showResult) {
      return selectedAnswer === optionId ? 'selected' : 'default';
    }
    
    const isCorrect = optionId === question.correctAnswer;
    const isSelected = selectedAnswer === optionId;
    
    if (isCorrect) return 'correct';
    if (isSelected && !isCorrect) return 'incorrect';
    return 'default';
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const state = getOptionState(option.id);
        
        return (
          <motion.button
            key={option.id}
            onClick={() => !disabled && onAnswer(option.id)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
              state === 'default' && 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
              state === 'selected' && 'border-primary-500 bg-primary-50',
              state === 'correct' && 'border-green-500 bg-green-50',
              state === 'incorrect' && 'border-red-500 bg-red-50',
              disabled && 'cursor-not-allowed opacity-75'
            )}
            whileHover={!disabled ? { scale: 1.01 } : {}}
            whileTap={!disabled ? { scale: 0.99 } : {}}
          >
            {/* Option letter */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0',
                state === 'default' && 'bg-gray-100 text-gray-600',
                state === 'selected' && 'bg-primary-500 text-white',
                state === 'correct' && 'bg-green-500 text-white',
                state === 'incorrect' && 'bg-red-500 text-white'
              )}
            >
              {showResult && state === 'correct' ? (
                <Check className="w-4 h-4" />
              ) : showResult && state === 'incorrect' ? (
                <X className="w-4 h-4" />
              ) : (
                String.fromCharCode(65 + index)
              )}
            </div>

            {/* Option text */}
            <span
              className={cn(
                'flex-1',
                state === 'default' && 'text-gray-700',
                state === 'selected' && 'text-primary-700',
                state === 'correct' && 'text-green-700',
                state === 'incorrect' && 'text-red-700'
              )}
            >
              {option.text}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ===========================================
// True/False Component
// ===========================================

interface TrueFalseProps {
  question: Question;
  selectedAnswer: boolean | null;
  onAnswer: (answer: boolean) => void;
  showResult?: boolean;
  disabled?: boolean;
}

export function TrueFalse({
  question,
  selectedAnswer,
  onAnswer,
  showResult = false,
  disabled = false,
}: TrueFalseProps) {
  const options = [
    { value: true, label: 'True' },
    { value: false, label: 'False' },
  ];

  const getOptionState = (value: boolean) => {
    if (!showResult) {
      return selectedAnswer === value ? 'selected' : 'default';
    }
    
    const isCorrect = value === question.correctAnswer;
    const isSelected = selectedAnswer === value;
    
    if (isCorrect) return 'correct';
    if (isSelected && !isCorrect) return 'incorrect';
    return 'default';
  };

  return (
    <div className="flex gap-4">
      {options.map((option) => {
        const state = getOptionState(option.value);
        
        return (
          <motion.button
            key={String(option.value)}
            onClick={() => !disabled && onAnswer(option.value)}
            disabled={disabled}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-medium transition-all',
              state === 'default' && 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700',
              state === 'selected' && 'border-primary-500 bg-primary-50 text-primary-700',
              state === 'correct' && 'border-green-500 bg-green-50 text-green-700',
              state === 'incorrect' && 'border-red-500 bg-red-50 text-red-700',
              disabled && 'cursor-not-allowed opacity-75'
            )}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
          >
            {showResult && state === 'correct' && <Check className="w-5 h-5" />}
            {showResult && state === 'incorrect' && <X className="w-5 h-5" />}
            <span>{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
