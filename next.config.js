/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Optimize for production
  reactStrictMode: true,
  // Enable experimental features if needed
  experimental: {
    // serverActions: true, // Already enabled by default in Next.js 14
  },
};

module.exports = nextConfig;
