import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AlgoPlayground',
    template: '%s | AlgoPlayground',
  },
  description:
    'Interactive platform for learning data structures and algorithms through visualization and hands-on practice.',
  keywords: [
    'algorithms',
    'data structures',
    'visualization',
    'learning',
    'education',
    'sorting',
    'searching',
    'graphs',
    'trees',
  ],
  authors: [{ name: 'AlgoPlayground Team' }],
  openGraph: {
    title: 'AlgoPlayground',
    description: 'Learn algorithms through interactive visualization',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
