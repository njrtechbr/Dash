
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  }
};

export default nextConfig;
