'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ===========================================
// Loading Spinner
// ===========================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary-500', sizeStyles[size], className)}
    />
  );
}

// ===========================================
// Full Page Loading
// ===========================================

interface FullPageLoadingProps {
  message?: string;
}

export function FullPageLoading({ message = 'Loading...' }: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}

// ===========================================
// Inline Loading
// ===========================================

interface InlineLoadingProps {
  message?: string;
  className?: string;
}

export function InlineLoading({ message, className }: InlineLoadingProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-8', className)}>
      <LoadingSpinner size="sm" />
      {message && <span className="text-sm text-gray-500">{message}</span>}
    </div>
  );
}

// ===========================================
// Skeleton Base
// ===========================================

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
    />
  );
}

// ===========================================
// Skeleton Text
// ===========================================

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

// ===========================================
// Skeleton Avatar
// ===========================================

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <Skeleton className={cn('rounded-full', sizeStyles[size], className)} />
  );
}

// ===========================================
// Skeleton Card
// ===========================================

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-200 p-5 animate-pulse',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-16 h-5" />
        <Skeleton className="w-12 h-5" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <SkeletonText lines={2} />
    </div>
  );
}

// ===========================================
// Page Loading State
// ===========================================

interface PageLoadingProps {
  title?: string;
}

export function PageLoading({ title }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {title && (
          <Skeleton className="h-8 w-64 mb-6" />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Content Loading Wrapper
// ===========================================

interface LoadingWrapperProps {
  isLoading: boolean;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function LoadingWrapper({
  isLoading,
  skeleton,
  children,
  className,
}: LoadingWrapperProps) {
  if (isLoading) {
    return (
      <div className={className}>
        {skeleton || <InlineLoading />}
      </div>
    );
  }

  return <>{children}</>;
}
