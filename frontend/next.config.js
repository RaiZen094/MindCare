/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for Vercel (use default)
  // output: 'standalone', // Comment out for Vercel deployment
  
  // Image optimization for production
  images: {
    unoptimized: false, // Enable optimization for Vercel
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  },
  
  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', '*.vercel.app']
    },
  },
  
  // Enable strict mode
  reactStrictMode: true,
  
  // Ignore ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
