'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAllAlgorithms, getCategoryDisplayName, getCategoryColor } from '@/data/algorithms';
import { AlgorithmCategory } from '@/types';
import { Navbar, Footer, AlgorithmCard, AlgorithmCardSkeleton } from '@/components/layout';
import { Input, Badge, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Search, Filter, BookOpen } from 'lucide-react';

// ===========================================
// Types
// ===========================================

type FilterCategory = AlgorithmCategory | 'all';
type FilterDifficulty = 'all' | 'easy' | 'medium' | 'hard';

// ===========================================
// Categories
// ===========================================

const categories: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'SORTING', label: 'Sorting' },
  { value: 'SEARCHING', label: 'Searching' },
  { value: 'GRAPH', label: 'Graph' },
  { value: 'TREE', label: 'Tree' },
  { value: 'LINEAR', label: 'Linear' },
];

const difficulties: { value: FilterDifficulty; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

// ===========================================
// Page Component
// ===========================================

export default function AlgorithmsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<FilterDifficulty>('all');

  const allAlgorithms = getAllAlgorithms();

  // Filter algorithms
  const filteredAlgorithms = useMemo(() => {
    return allAlgorithms.filter((algo) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = algo.name.toLowerCase().includes(query);
        const matchesDescription = algo.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && algo.category !== selectedCategory) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && algo.difficulty !== selectedDifficulty) {
        return false;
      }

      return true;
    });
  }, [allAlgorithms, searchQuery, selectedCategory, selectedDifficulty]);

  // Group by category for display
  const groupedAlgorithms = useMemo(() => {
    if (selectedCategory !== 'all') {
      return { [selectedCategory]: filteredAlgorithms };
    }

    const grouped: Record<string, typeof filteredAlgorithms> = {};
    for (const algo of filteredAlgorithms) {
      if (!grouped[algo.category]) {
        grouped[algo.category] = [];
      }
      grouped[algo.category].push(algo);
    }
    return grouped;
  }, [filteredAlgorithms, selectedCategory]);

  const hasResults = filteredAlgorithms.length > 0;
  const totalCount = allAlgorithms.length;
  const filteredCount = filteredAlgorithms.length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Algorithms</h1>
                <p className="text-gray-600 mt-1">
                  Explore {totalCount} algorithms with interactive visualizations
                </p>
              </div>

              {/* Search */}
              <div className="w-full md:w-80">
                <Input
                  placeholder="Search algorithms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      selectedCategory === category.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as FilterDifficulty)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results count */}
          {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all' ? (
            <p className="text-sm text-gray-500 mb-6">
              Showing {filteredCount} of {totalCount} algorithms
            </p>
          ) : null}

          {/* Algorithm Grid */}
          {hasResults ? (
            <div className="space-y-12">
              {Object.entries(groupedAlgorithms).map(([category, algorithms]) => (
                <section key={category}>
                  {selectedCategory === 'all' && (
                    <div className="flex items-center gap-3 mb-6">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-lg text-sm font-semibold',
                          getCategoryColor(category as AlgorithmCategory)
                        )}
                      >
                        {getCategoryDisplayName(category as AlgorithmCategory)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {algorithms.length} algorithm{algorithms.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {algorithms.map((algorithm, index) => (
                      <AlgorithmCard
                        key={algorithm.slug}
                        algorithm={algorithm}
                        index={index}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen className="w-8 h-8 text-gray-400" />}
              title="No algorithms found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              }
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
