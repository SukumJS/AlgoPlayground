import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Button } from '@/components/ui';
import {
  Zap,
  Target,
  Users,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Code2,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About AlgoPlayground
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              An educational platform designed to help students understand data structures
              and algorithms through interactive visualizations and structured learning.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-600 mb-4">
                  We believe that understanding algorithms shouldn&apos;t be limited to reading
                  textbooks or watching static diagrams. Learning is most effective when
                  it&apos;s interactive and engaging.
                </p>
                <p className="text-gray-600">
                  AlgoPlayground bridges the gap between theory and practice by providing
                  hands-on visualizations that make complex concepts intuitive and memorable.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Target, label: 'Visual Learning' },
                  { icon: Code2, label: 'Code Understanding' },
                  { icon: GraduationCap, label: 'Education First' },
                  { icon: Users, label: 'Student Focused' },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-gray-200 p-4 text-center"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              What We Offer
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: 'Interactive Visualizations',
                  description: 'Watch algorithms execute step-by-step with animated visualizations. Control the speed, pause, and step through each operation.',
                },
                {
                  title: 'Pre & Post Testing',
                  description: 'Assess your knowledge before and after learning each algorithm. Track your improvement and identify areas that need more practice.',
                },
                {
                  title: 'Multiple Algorithm Categories',
                  description: 'From sorting and searching to graphs and trees, we cover the essential algorithms taught in computer science courses.',
                },
                {
                  title: 'Progress Tracking',
                  description: 'Keep track of your learning journey with personalized dashboards showing your progress across all algorithms.',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-gray-600 mb-8">
              Explore our collection of algorithms and start your learning journey today.
            </p>
            <Link href="/algorithms">
              <Button size="lg">
                Explore Algorithms
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
