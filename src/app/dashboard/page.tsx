import { Suspense } from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { getUserStats, getUserProgress } from '@/lib/db';
import { getAlgorithmsByCategory, categoryOrder, getCategoryDisplayName } from '@/data/algorithms';
import { Navbar, Footer } from '@/components/layout';
import {
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function DashboardContent() {
  const user = await requireAuth('/dashboard');
  const stats = await getUserStats(user.id);
  const progress = await getUserProgress(user.id);
  const progressMap = new Map(
    (Array.isArray(progress) ? progress : []).map((p) => [p.algorithmSlug, p])
  );

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">
          Track your progress and continue learning algorithms.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Completed"
          value={`${stats.completedAlgorithms}/${stats.totalAlgorithms}`}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Time Spent"
          value={formatTime(stats.totalPlaygroundTime)}
          color="blue"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Avg. Post-Test"
          value={`${stats.averagePostTestScore}%`}
          color="purple"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Improvement"
          value={`+${stats.improvement}%`}
          color="orange"
        />
      </div>

      {/* Algorithm Progress by Category */}
      <div className="space-y-8">
        {categoryOrder.map((category) => {
          const algorithms = getAlgorithmsByCategory(category);
          if (algorithms.length === 0) return null;

          return (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {getCategoryDisplayName(category)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {algorithms.map((algo) => {
                  const algoProgress = progressMap.get(algo.slug);
                  const isCompleted =
                    algoProgress?.preTestCompleted &&
                    algoProgress?.playgroundCompleted &&
                    algoProgress?.postTestCompleted;
                  const isStarted = !!algoProgress;

                  return (
                    <Link
                      key={algo.slug}
                      href={`/playground/${algo.slug}`}
                      className="group bg-white rounded-xl border border-gray-200 p-4 
                               hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                          {algo.name}
                        </h3>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : isStarted ? (
                          <Circle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>

                      {/* Progress Steps */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span
                          className={
                            algoProgress?.preTestCompleted
                              ? 'text-green-600'
                              : ''
                          }
                        >
                          Pre-Test
                        </span>
                        <ArrowRight className="w-3 h-3" />
                        <span
                          className={
                            algoProgress?.playgroundCompleted
                              ? 'text-green-600'
                              : ''
                          }
                        >
                          Practice
                        </span>
                        <ArrowRight className="w-3 h-3" />
                        <span
                          className={
                            algoProgress?.postTestCompleted
                              ? 'text-green-600'
                              : ''
                          }
                        >
                          Post-Test
                        </span>
                      </div>

                      {/* Score if completed */}
                      {algoProgress?.postTestScore !== null &&
                        algoProgress?.postTestScore !== undefined && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Post-Test Score</span>
                              <span className="font-medium text-gray-900">
                                {algoProgress.postTestScore}%
                              </span>
                            </div>
                          </div>
                        )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'green' | 'blue' | 'purple' | 'orange';
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-96 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
