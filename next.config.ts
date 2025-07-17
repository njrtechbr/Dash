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
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    
    // APIs
    TMDB_API_KEY: process.env.TMDB_API_KEY || 'e8d22c755d73bec02627838a3f4a7909',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || 'AIzaSyC7KHunXJgj8LXL0UkxGil8R_Vp9h_uLBw',
    

  }
};

export default nextConfig;
