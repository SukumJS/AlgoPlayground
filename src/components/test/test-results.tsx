'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TestType } from '@/types';
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowRight,
  Share2,
} from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface TestResultsProps {
  testType: TestType;
  score: number;
  totalPoints: number;
  percentage: number;
  timeTaken: number; // in seconds
  correctCount: number;
  incorrectCount: number;
  previousScore?: number;
  onRetry?: () => void;
  onContinue?: () => void;
  onReviewAnswers?: () => void;
  className?: string;
}

// ===========================================
// Test Results Component
// ===========================================

export function TestResults({
  testType,
  score,
  totalPoints,
  percentage,
  timeTaken,
  correctCount,
  incorrectCount,
  previousScore,
  onRetry,
  onContinue,
  onReviewAnswers,
  className,
}: TestResultsProps) {
  const isPassing = percentage >= 70;
  const improvement = previousScore !== undefined ? percentage - previousScore : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'px-8 py-10 text-center',
          isPassing ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'
        )}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2">
          {testType === 'PRE_TEST' ? 'Pre-Test' : 'Post-Test'} Complete!
        </h2>

        <p className="text-white/80">
          {isPassing ? 'Great job! You passed!' : 'Keep practicing to improve!'}
        </p>
      </div>

      {/* Score Circle */}
      <div className="px-8 py-6 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke={isPassing ? '#22c55e' : '#f59e0b'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 56}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - percentage / 100) }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-3xl font-bold text-gray-900"
              >
                {Math.round(percentage)}%
              </motion.span>
              <span className="text-sm text-gray-500">Score</span>
            </div>
          </div>

          <div className="text-lg text-gray-700">
            <span className="font-semibold">{score}</span>
            <span className="text-gray-400"> / </span>
            <span>{totalPoints} points</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-8 py-4 grid grid-cols-3 gap-4">
        <StatCard
          icon={CheckCircle}
          iconColor="text-green-500"
          label="Correct"
          value={correctCount}
        />
        <StatCard
          icon={XCircle}
          iconColor="text-red-500"
          label="Incorrect"
          value={incorrectCount}
        />
        <StatCard
          icon={Clock}
          iconColor="text-blue-500"
          label="Time"
          value={formatTime(timeTaken)}
        />
      </div>

      {/* Improvement Indicator (for post-test) */}
      {improvement !== null && (
        <div className="px-8 py-4">
          <div
            className={cn(
              'flex items-center justify-center gap-2 p-4 rounded-xl',
              improvement > 0 && 'bg-green-50',
              improvement < 0 && 'bg-red-50',
              improvement === 0 && 'bg-gray-50'
            )}
          >
            {improvement > 0 && <TrendingUp className="w-5 h-5 text-green-600" />}
            {improvement < 0 && <TrendingDown className="w-5 h-5 text-red-600" />}
            {improvement === 0 && <Minus className="w-5 h-5 text-gray-600" />}
            <span
              className={cn(
                'font-medium',
                improvement > 0 && 'text-green-700',
                improvement < 0 && 'text-red-700',
                improvement === 0 && 'text-gray-700'
              )}
            >
              {improvement > 0 && '+'}
              {improvement}% compared to pre-test
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          {onReviewAnswers && (
            <button
              onClick={onReviewAnswers}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Target className="w-4 h-4" />
              <span>Review Answers</span>
            </button>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
          
          {onContinue && (
            <button
              onClick={onContinue}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors',
                isPassing
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ===========================================
// Stat Card Component
// ===========================================

interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string | number;
}

function StatCard({ icon: Icon, iconColor, label, value }: StatCardProps) {
  return (
    <div className="text-center">
      <Icon className={cn('w-5 h-5 mx-auto mb-1', iconColor)} />
      <div className="text-xl font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

// ===========================================
// Compact Results (for inline display)
// ===========================================

interface CompactResultsProps {
  score: number;
  totalPoints: number;
  percentage: number;
}

export function CompactResults({ score, totalPoints, percentage }: CompactResultsProps) {
  const isPassing = percentage >= 70;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl',
        isPassing ? 'bg-green-50' : 'bg-amber-50'
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center',
          isPassing ? 'bg-green-100' : 'bg-amber-100'
        )}
      >
        <Trophy
          className={cn(
            'w-6 h-6',
            isPassing ? 'text-green-600' : 'text-amber-600'
          )}
        />
      </div>
      <div>
        <div className="font-semibold text-gray-900">
          {Math.round(percentage)}% - {score}/{totalPoints} points
        </div>
        <div className="text-sm text-gray-500">
          {isPassing ? 'Passed!' : 'Keep practicing'}
        </div>
      </div>
    </div>
  );
}
