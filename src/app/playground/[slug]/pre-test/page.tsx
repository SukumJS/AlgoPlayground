import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAlgorithmBySlug } from '@/data/algorithms';
import { AlgorithmSlug } from '@/types';
import { TestPageClient } from './test-page-client';

// ===========================================
// Types
// ===========================================

interface PreTestPageProps {
  params: Promise<{ slug: string }>;
}

// ===========================================
// Metadata
// ===========================================

export async function generateMetadata({ params }: PreTestPageProps): Promise<Metadata> {
  const { slug } = await params;
  const algorithm = getAlgorithmBySlug(slug as AlgorithmSlug);

  if (!algorithm) {
    return {
      title: 'Algorithm Not Found',
    };
  }

  return {
    title: `Pre-Test: ${algorithm.name}`,
    description: `Test your knowledge of ${algorithm.name} before starting the lesson.`,
  };
}

// ===========================================
// Page Component
// ===========================================

export default async function PreTestPage({ params }: PreTestPageProps) {
  const { slug } = await params;
  const algorithm = getAlgorithmBySlug(slug as AlgorithmSlug);

  if (!algorithm) {
    notFound();
  }

  return (
    <Suspense fallback={<TestLoading />}>
      <TestPageClient algorithm={algorithm} testType="PRE_TEST" />
    </Suspense>
  );
}

// ===========================================
// Loading State
// ===========================================

function TestLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading test...</div>
    </div>
  );
}
