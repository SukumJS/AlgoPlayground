'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface FillBlankProps {
  question: Question;
  answer: string;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  disabled?: boolean;
}

// ===========================================
// Fill Blank Component
// ===========================================

export function FillBlank({
  question,
  answer,
  onAnswer,
  showResult = false,
  disabled = false,
}: FillBlankProps) {
  const correctAnswer = question.correctAnswer as string;
  const isCorrect = showResult && answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

  // Parse question text to find blank position
  // Blanks are marked with _____ or [BLANK]
  const parts = question.questionText.split(/(_____|\[BLANK\])/);

  return (
    <div className="space-y-4">
      {/* Question with inline blank */}
      <div className="text-lg leading-relaxed">
        {parts.map((part, index) => {
          if (part === '_____' || part === '[BLANK]') {
            return (
              <span key={index} className="inline-block mx-1 align-middle">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => onAnswer(e.target.value)}
                  disabled={disabled}
                  placeholder="Type answer..."
                  className={cn(
                    'w-40 px-3 py-1 border-b-2 bg-transparent text-center focus:outline-none transition-colors',
                    !showResult && 'border-gray-300 focus:border-primary-500',
                    showResult && isCorrect && 'border-green-500 text-green-700',
                    showResult && !isCorrect && 'border-red-500 text-red-700',
                    disabled && 'cursor-not-allowed'
                  )}
                />
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>

      {/* Standalone input if no inline blank found */}
      {parts.length === 1 && (
        <div className="relative">
          <input
            type="text"
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            disabled={disabled}
            placeholder="Type your answer..."
            className={cn(
              'w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all',
              !showResult && 'border-gray-300 focus:border-primary-500 focus:ring-primary-200',
              showResult && isCorrect && 'border-green-500 focus:ring-green-200 bg-green-50',
              showResult && !isCorrect && 'border-red-500 focus:ring-red-200 bg-red-50',
              disabled && 'cursor-not-allowed bg-gray-50'
            )}
          />
          
          {showResult && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isCorrect ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Show correct answer when wrong */}
      {showResult && !isCorrect && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200"
        >
          <span className="text-sm text-amber-700">
            Correct answer: <span className="font-medium">{correctAnswer}</span>
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ===========================================
// Code Fill Blank (for code completion)
// ===========================================

interface CodeFillBlankProps {
  question: Question;
  answer: string;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  disabled?: boolean;
}

export function CodeFillBlank({
  question,
  answer,
  onAnswer,
  showResult = false,
  disabled = false,
}: CodeFillBlankProps) {
  const correctAnswer = question.correctAnswer as string;
  const isCorrect = showResult && answer.trim() === correctAnswer.trim();

  // Parse code with blanks
  const codeLines = question.questionText.split('\n');

  return (
    <div className="space-y-4">
      {/* Code block with blanks */}
      <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
        <pre className="text-sm font-mono">
          {codeLines.map((line, lineIndex) => {
            const parts = line.split(/(_____|\[BLANK\])/);
            
            return (
              <div key={lineIndex} className="flex items-center">
                <span className="w-8 text-gray-500 select-none">{lineIndex + 1}</span>
                <code className="text-gray-100">
                  {parts.map((part, partIndex) => {
                    if (part === '_____' || part === '[BLANK]') {
                      return (
                        <input
                          key={partIndex}
                          type="text"
                          value={answer}
                          onChange={(e) => onAnswer(e.target.value)}
                          disabled={disabled}
                          placeholder="..."
                          className={cn(
                            'w-32 px-2 py-0.5 mx-1 rounded font-mono text-sm bg-gray-700 border focus:outline-none',
                            !showResult && 'border-gray-600 focus:border-primary-500 text-white',
                            showResult && isCorrect && 'border-green-500 bg-green-900/50 text-green-300',
                            showResult && !isCorrect && 'border-red-500 bg-red-900/50 text-red-300',
                            disabled && 'cursor-not-allowed'
                          )}
                        />
                      );
                    }
                    return <span key={partIndex}>{part}</span>;
                  })}
                </code>
              </div>
            );
          })}
        </pre>
      </div>

      {/* Show correct answer when wrong */}
      {showResult && !isCorrect && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200"
        >
          <span className="text-sm text-amber-700">
            Correct answer: <code className="font-mono bg-amber-100 px-1 rounded">{correctAnswer}</code>
          </span>
        </motion.div>
      )}
    </div>
  );
}
