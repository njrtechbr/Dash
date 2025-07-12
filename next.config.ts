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
    TMDB_API_KEY: 'e8d22c755d73bec02627838a3f4a7909',
    GOOGLE_API_KEY: 'AIzaSyC7KHunXJgj8LXL0UkxGil8R_Vp9h_uLBw',
    NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyC7KHunXJgj8LXL0UkxGil8R_Vp9h_uLBw',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'fluxdash-4fmx1.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'fluxdash-4fmx1',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'fluxdash-4fmx1.appspot.com',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '789647407253',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:789647407253:web:10e9415711bf54e63b839c',
  }
};

export default nextConfig;
