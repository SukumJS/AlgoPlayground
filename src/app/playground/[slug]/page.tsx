import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAlgorithmBySlug } from '@/data/algorithms';
import { AlgorithmSlug } from '@/types';
import { PlaygroundClient } from './playground-client';

// ===========================================
// Types
// ===========================================

interface PlaygroundPageProps {
  params: Promise<{ slug: string }>;
}

// ===========================================
// Metadata
// ===========================================

export async function generateMetadata({ params }: PlaygroundPageProps): Promise<Metadata> {
  const { slug } = await params;
  const algorithm = getAlgorithmBySlug(slug as AlgorithmSlug);

  if (!algorithm) {
    return {
      title: 'Algorithm Not Found',
    };
  }

  return {
    title: `${algorithm.name} Playground`,
    description: algorithm.description,
  };
}

// ===========================================
// Page Component
// ===========================================

export default async function PlaygroundPage({ params }: PlaygroundPageProps) {
  const { slug } = await params;
  const algorithm = getAlgorithmBySlug(slug as AlgorithmSlug);

  if (!algorithm) {
    notFound();
  }

  return (
    <Suspense fallback={<PlaygroundLoading />}>
      <PlaygroundClient algorithm={algorithm} />
    </Suspense>
  );
}

// ===========================================
// Loading State
// ===========================================

function PlaygroundLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 h-16 animate-pulse">
        <div className="max-w-full mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-6 bg-gray-200 rounded" />
            <div className="w-32 h-6 bg-gray-200 rounded" />
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-6 h-[calc(100vh-64px)]">
        <div className="flex gap-4 h-full animate-pulse">
          <div className="w-72 bg-gray-200 rounded-xl" />
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-24 bg-gray-200 rounded-xl" />
          </div>
          <div className="w-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
