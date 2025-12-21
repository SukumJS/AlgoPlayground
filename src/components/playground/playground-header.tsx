'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { UserMenu } from '@/components/auth';
import { AlgorithmMetadata } from '@/types';
import { getCategoryDisplayName, getCategoryColor } from '@/data/algorithms';
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  Save,
  Cloud,
  CloudOff,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===========================================
// Types
// ===========================================

interface PlaygroundHeaderProps {
  algorithm: AlgorithmMetadata;
  isSaving?: boolean;
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  showPreTest?: boolean;
  showPostTest?: boolean;
  preTestCompleted?: boolean;
  postTestCompleted?: boolean;
}

// ===========================================
// Playground Header Component
// ===========================================

export function PlaygroundHeader({
  algorithm,
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  onSave,
  showPreTest = true,
  showPostTest = true,
  preTestCompleted,
  postTestCompleted,
}: PlaygroundHeaderProps) {
  const { isAuthenticated } = useAuth();
  const categoryColor = getCategoryColor(algorithm.category);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back + Algorithm Info */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>

            <div className="h-6 w-px bg-gray-200" />

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  categoryColor
                )}
              >
                {getCategoryDisplayName(algorithm.category)}
              </span>
              <h1 className="font-semibold text-gray-900">
                {algorithm.name}
              </h1>
            </div>
          </div>

          {/* Center: Learning Flow */}
          <div className="hidden md:flex items-center gap-2">
            {showPreTest && (
              <Link
                href={`/playground/${algorithm.slug}/pre-test`}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  preTestCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Pre-Test</span>
                {preTestCompleted && (
                  <span className="ml-1 text-xs">✓</span>
                )}
              </Link>
            )}

            <div className="flex items-center gap-1 text-gray-400">
              <div className="w-6 h-px bg-gray-300" />
              <span className="text-xs">→</span>
              <div className="w-6 h-px bg-gray-300" />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-100 text-primary-700 text-sm font-medium">
              <BookOpen className="w-4 h-4" />
              <span>Practice</span>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <div className="w-6 h-px bg-gray-300" />
              <span className="text-xs">→</span>
              <div className="w-6 h-px bg-gray-300" />
            </div>

            {showPostTest && (
              <Link
                href={`/playground/${algorithm.slug}/post-test`}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  postTestCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Post-Test</span>
                {postTestCompleted && (
                  <span className="ml-1 text-xs">✓</span>
                )}
              </Link>
            )}
          </div>

          {/* Right: Save Status + User Menu */}
          <div className="flex items-center gap-4">
            {/* Save Status (only for authenticated users) */}
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : hasUnsavedChanges ? (
                  <button
                    onClick={onSave}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                ) : lastSaved ? (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Cloud className="w-4 h-4 text-green-500" />
                    <span className="hidden sm:inline">Saved</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <CloudOff className="w-4 h-4" />
                    <span className="hidden sm:inline">Not saved</span>
                  </div>
                )}
              </div>
            )}

            <div className="h-6 w-px bg-gray-200" />

            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

// ===========================================
// Simple Header (for non-playground pages)
// ===========================================

interface SimpleHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
}

export function SimpleHeader({ title, backHref = '/', backLabel = 'Back' }: SimpleHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backLabel}</span>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="font-semibold text-gray-900">{title}</h1>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
