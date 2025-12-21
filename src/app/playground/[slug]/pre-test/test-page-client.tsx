'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlgorithmMetadata, TestType, Question } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { SimpleHeader } from '@/components/playground';
import { TestContainer } from '@/components/test';
import { getQuestionsByAlgorithm } from '@/data/questions';
import { getCategoryDisplayName, getCategoryColor } from '@/data/algorithms';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  ClipboardCheck,
  ArrowRight,
  LogIn,
  AlertCircle,
} from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface TestPageClientProps {
  algorithm: AlgorithmMetadata;
  testType: TestType;
}

// ===========================================
// Test Page Client Component
// ===========================================

export function TestPageClient({ algorithm, testType }: TestPageClientProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [previousScore, setPreviousScore] = useState<number | undefined>();

  const categoryColor = getCategoryColor(algorithm.category);
  const testTitle = testType === 'PRE_TEST' ? 'Pre-Test' : 'Post-Test';

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        // Get questions for this algorithm and test type
        const allQuestions = getQuestionsByAlgorithm(algorithm.slug);
        const filteredQuestions = allQuestions.filter(q => q.testType === testType);
        setQuestions(filteredQuestions);

        // TODO: Load previous score from API for post-test
        if (testType === 'POST_TEST') {
          // const previousResult = await fetchPreviousTestResult(algorithm.slug, 'PRE_TEST');
          // setPreviousScore(previousResult?.percentage);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [algorithm.slug, testType]);

  // Handle test completion
  const handleComplete = async (score: number, percentage: number) => {
    // TODO: Save test result to API
    console.log('Test completed:', { score, percentage });
  };

  // Loading state
  if (isLoading || isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleHeader
          title={`${testTitle}: ${algorithm.name}`}
          backHref={`/playground/${algorithm.slug}`}
          backLabel="Back to Playground"
        />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleHeader
          title={`${testTitle}: ${algorithm.name}`}
          backHref={`/playground/${algorithm.slug}`}
          backLabel="Back to Playground"
        />
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sign in to Take Tests
            </h2>
            <p className="text-gray-600 mb-6">
              Create an account or sign in to track your progress and take tests.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No questions available
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleHeader
          title={`${testTitle}: ${algorithm.name}`}
          backHref={`/playground/${algorithm.slug}`}
          backLabel="Back to Playground"
        />
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Questions Available
            </h2>
            <p className="text-gray-600 mb-6">
              There are no {testTitle.toLowerCase()} questions for this algorithm yet.
            </p>
            <Link
              href={`/playground/${algorithm.slug}`}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to Playground</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader
        title={`${testTitle}: ${algorithm.name}`}
        backHref={`/playground/${algorithm.slug}`}
        backLabel="Back to Playground"
      />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Test Info */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', categoryColor)}>
              {getCategoryDisplayName(algorithm.category)}
            </span>
            <span className="text-sm text-gray-500">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {testTitle}: {algorithm.name}
          </h1>
          <p className="text-gray-600">
            {testType === 'PRE_TEST'
              ? 'Test your current knowledge before starting the visualization.'
              : 'Check how much you\'ve learned after practicing with the visualization.'}
          </p>
        </div>

        {/* Test Container */}
        <TestContainer
          algorithmSlug={algorithm.slug}
          algorithmName={algorithm.name}
          testType={testType}
          questions={questions}
          onComplete={handleComplete}
          previousScore={previousScore}
        />
      </main>
    </div>
  );
}
