'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllAlgorithms, getCategoryDisplayName, getCategoryColor } from '@/data/algorithms';
import { Navbar, Footer, AlgorithmCard } from '@/components/layout';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  Zap,
  Play,
  BarChart3,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  BookOpen,
} from 'lucide-react';

// ===========================================
// Feature Data
// ===========================================

const features = [
  {
    icon: Play,
    title: 'Interactive Visualizations',
    description: 'Watch algorithms come to life with step-by-step animations and controls.',
  },
  {
    icon: BarChart3,
    title: 'Track Your Progress',
    description: 'Take pre and post tests to measure your learning improvement.',
  },
  {
    icon: BookOpen,
    title: 'Learn by Doing',
    description: 'Customize inputs and see how algorithms behave with different data.',
  },
  {
    icon: GraduationCap,
    title: 'Built for Students',
    description: 'Designed specifically for educational use in computer science courses.',
  },
];

// ===========================================
// Page Component
// ===========================================

export default function HomePage() {
  const allAlgorithms = getAllAlgorithms();
  const featuredAlgorithms = allAlgorithms.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm mb-6">
                <Zap className="w-4 h-4" />
                <span>Educational Algorithm Visualization Platform</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Learn Algorithms
                <br />
                <span className="text-primary-200">Visually</span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Master data structures and algorithms through interactive visualizations,
                hands-on practice, and comprehensive testing.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/algorithms">
                  <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                    Explore Algorithms
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { value: allAlgorithms.length + '+', label: 'Algorithms' },
                { value: '5', label: 'Categories' },
                { value: '∞', label: 'Practice Sessions' },
                { value: '100%', label: 'Free' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/60 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why AlgoPlayground?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to understand algorithms deeply and improve your problem-solving skills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-6"
                  >
                    <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Algorithms */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Featured Algorithms
                </h2>
                <p className="text-gray-600">
                  Start learning with these popular algorithms
                </p>
              </div>
              <Link
                href="/algorithms"
                className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAlgorithms.map((algorithm, index) => (
                <AlgorithmCard
                  key={algorithm.slug}
                  algorithm={algorithm}
                  index={index}
                />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/algorithms">
                <Button variant="outline">
                  View All Algorithms
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Follow our structured learning path to master each algorithm
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Take Pre-Test',
                  description: 'Assess your current knowledge before starting the lesson.',
                  color: 'bg-blue-100 text-blue-700',
                },
                {
                  step: '2',
                  title: 'Practice & Visualize',
                  description: 'Learn through interactive visualizations with custom inputs.',
                  color: 'bg-primary-100 text-primary-700',
                },
                {
                  step: '3',
                  title: 'Take Post-Test',
                  description: 'Measure your improvement and track your progress.',
                  color: 'bg-green-100 text-green-700',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4', item.color)}>
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {item.description}
                    </p>
                  </div>

                  {/* Connector Arrow */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Join thousands of students mastering algorithms through interactive visualizations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/algorithms">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
