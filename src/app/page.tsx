import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Search,
  GitBranch,
  Binary,
  Layers,
} from 'lucide-react';
import { UserMenu } from '@/components/auth';

const categories = [
  {
    id: 'sorting',
    name: 'Sorting Algorithms',
    description: 'Learn how to arrange data in order',
    icon: BarChart3,
    color: 'sorting',
    algorithms: ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort'],
  },
  {
    id: 'searching',
    name: 'Searching Algorithms',
    description: 'Find elements efficiently',
    icon: Search,
    color: 'searching',
    algorithms: ['Linear Search', 'Binary Search'],
  },
  {
    id: 'graph',
    name: 'Graph Algorithms',
    description: 'Navigate and analyze networks',
    icon: GitBranch,
    color: 'graph',
    algorithms: ['BFS', 'DFS', 'Dijkstra', 'Bellman-Ford', "Prim's", "Kruskal's"],
  },
  {
    id: 'tree',
    name: 'Tree Structures',
    description: 'Hierarchical data organization',
    icon: Binary,
    color: 'tree',
    algorithms: ['BST', 'AVL Tree', 'Min Heap', 'Max Heap', 'Tree Traversals'],
  },
  {
    id: 'linear',
    name: 'Linear Structures',
    description: 'Sequential data handling',
    icon: Layers,
    color: 'linear',
    algorithms: ['Linked List', 'Stack', 'Queue'],
  },
];

const colorClasses = {
  sorting: {
    bg: 'bg-sorting-light',
    text: 'text-sorting-dark',
    icon: 'text-sorting',
    border: 'border-sorting/20',
    hover: 'hover:border-sorting/50',
  },
  searching: {
    bg: 'bg-searching-light',
    text: 'text-searching-dark',
    icon: 'text-searching',
    border: 'border-searching/20',
    hover: 'hover:border-searching/50',
  },
  graph: {
    bg: 'bg-graph-light',
    text: 'text-graph-dark',
    icon: 'text-graph',
    border: 'border-graph/20',
    hover: 'hover:border-graph/50',
  },
  tree: {
    bg: 'bg-tree-light',
    text: 'text-tree-dark',
    icon: 'text-tree',
    border: 'border-tree/20',
    hover: 'hover:border-tree/50',
  },
  linear: {
    bg: 'bg-linear-light',
    text: 'text-linear-dark',
    icon: 'text-linear',
    border: 'border-linear/20',
    hover: 'hover:border-linear/50',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-gray-900">AlgoPlayground</span>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Learn Algorithms{' '}
            <span className="text-gradient">Interactively</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Visualize, practice, and master data structures and algorithms
            through hands-on interactive experiences.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
                       transition-colors font-medium inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#categories"
              className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300
                       hover:bg-gray-50 transition-colors font-medium"
            >
              Explore Algorithms
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Visual Learning
              </h3>
              <p className="text-gray-600 text-sm">
                Watch algorithms come to life with step-by-step animations
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Binary className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Interactive Practice
              </h3>
              <p className="text-gray-600 text-sm">
                Control execution speed, input data, and explore edge cases
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Layers className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600 text-sm">
                Pre and post tests to measure your understanding
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Algorithm Categories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const colors = colorClasses[category.color as keyof typeof colorClasses];
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className={`bg-white rounded-xl border-2 ${colors.border} ${colors.hover} 
                           p-6 transition-all duration-200 hover:shadow-lg`}
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.algorithms.slice(0, 4).map((algo) => (
                      <span
                        key={algo}
                        className={`text-xs px-2 py-1 ${colors.bg} ${colors.text} rounded-full`}
                      >
                        {algo}
                      </span>
                    ))}
                    {category.algorithms.length > 4 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        +{category.algorithms.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>© 2024 AlgoPlayground. Built for learning.</p>
        </div>
      </footer>
    </div>
  );
}
