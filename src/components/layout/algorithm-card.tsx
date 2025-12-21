'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlgorithmMetadata, AlgorithmCategory } from '@/types';
import { getCategoryDisplayName, getCategoryColor } from '@/data/algorithms';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Clock,
  HardDrive,
  CheckCircle,
  Circle,
  PlayCircle,
} from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface AlgorithmCardProps {
  algorithm: AlgorithmMetadata;
  progress?: {
    completed: boolean;
    preTestScore?: number | null;
    postTestScore?: number | null;
  };
  index?: number;
}

// ===========================================
// Difficulty Badge
// ===========================================

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const config = {
    easy: { label: 'Easy', color: 'bg-green-100 text-green-700' },
    medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
    hard: { label: 'Hard', color: 'bg-red-100 text-red-700' },
  };

  const { label, color } = config[difficulty];

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', color)}>
      {label}
    </span>
  );
}

// ===========================================
// Algorithm Card Component
// ===========================================

export function AlgorithmCard({ algorithm, progress, index = 0 }: AlgorithmCardProps) {
  const categoryColor = getCategoryColor(algorithm.category);
  const isCompleted = progress?.completed ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/playground/${algorithm.slug}`}
        className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300"
      >
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', categoryColor)}>
                {getCategoryDisplayName(algorithm.category)}
              </span>
              <DifficultyBadge difficulty={algorithm.difficulty} />
            </div>
            
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
            {algorithm.name}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2">
            {algorithm.description}
          </p>
        </div>

        {/* Complexity */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Time: <span className="text-gray-700 font-medium">{algorithm.timeComplexity.average}</span></span>
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Space: <span className="text-gray-700 font-medium">{algorithm.spaceComplexity}</span></span>
              </span>
            </div>
            
            <span className="flex items-center gap-1 text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Start
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Progress bar (if has progress) */}
        {progress && (progress.preTestScore !== null || progress.postTestScore !== null) && (
          <div className="px-5 py-2 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-3 text-xs">
              {progress.preTestScore !== null && (
                <span className="text-gray-500">
                  Pre: <span className="font-medium text-gray-700">{progress.preTestScore}%</span>
                </span>
              )}
              {progress.postTestScore !== null && (
                <span className="text-gray-500">
                  Post: <span className="font-medium text-green-600">{progress.postTestScore}%</span>
                </span>
              )}
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

// ===========================================
// Algorithm Card Skeleton
// ===========================================

export function AlgorithmCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-16 h-5 bg-gray-200 rounded" />
          <div className="w-12 h-5 bg-gray-200 rounded" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full mb-1" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Algorithm Grid
// ===========================================

interface AlgorithmGridProps {
  algorithms: AlgorithmMetadata[];
  progress?: Map<string, { completed: boolean; preTestScore?: number | null; postTestScore?: number | null }>;
  className?: string;
}

export function AlgorithmGrid({ algorithms, progress, className }: AlgorithmGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {algorithms.map((algorithm, index) => (
        <AlgorithmCard
          key={algorithm.slug}
          algorithm={algorithm}
          progress={progress?.get(algorithm.slug)}
          index={index}
        />
      ))}
    </div>
  );
}

// ===========================================
// Category Section
// ===========================================

interface CategorySectionProps {
  category: AlgorithmCategory;
  algorithms: AlgorithmMetadata[];
  progress?: Map<string, { completed: boolean; preTestScore?: number | null; postTestScore?: number | null }>;
}

export function CategorySection({ category, algorithms, progress }: CategorySectionProps) {
  const categoryName = getCategoryDisplayName(category);
  const categoryColor = getCategoryColor(category);

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className={cn('px-3 py-1 rounded-lg text-sm font-semibold', categoryColor)}>
          {categoryName}
        </span>
        <span className="text-sm text-gray-500">
          {algorithms.length} algorithm{algorithms.length !== 1 ? 's' : ''}
        </span>
      </div>

      <AlgorithmGrid algorithms={algorithms} progress={progress} />
    </section>
  );
}
