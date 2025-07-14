'use client';

import type { LucideIcon } from 'lucide-react';

export type LinkItem = {
  id: string; // Firestore document ID or Prisma cuid()
  title: string;
  url: string;
  icon: string;
  group: string;
  description?: string;
  isFavorite?: boolean;
  createdAt: any; // Can be Firebase Timestamp or JS Date
};

export type Icon = {
  name: string;
  icon: LucideIcon;
};

export type WatchedEpisode = {
  id?: string; // Prisma cuid()
  episodeId: string; // S<season>E<episode>
  episodeName: string;
  watchedAt: string; // ISO 8601 date string
  showId?: number; // Foreign key in Prisma
}

export type Show = {
  id: number; // TMDb ID
  docId?: string; // Firestore Doc ID
  name:string;
  poster_path: string | null;
  watched_episodes?: WatchedEpisode[];
}

export interface TMDbSearchResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
}

export type Episode = {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  season_number: number;
  overview: string;
};

export type WatchProvider = {
    provider_id: number;
    provider_name: string;
    logo_path: string;
    tmdbId?: number; // Optional, can be added for deep linking
}

export type VideoResult = {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
};

export interface TMDbShowDetails {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  next_episode_to_air: Episode | null;
  last_episode_to_air: Episode | null;
  poster_path: string | null;
  backdrop_path: string | null;
  status: string;
  seasons: { season_number: number, episode_count: number }[];
  number_of_episodes: number;
  number_of_seasons: number;
  videos?: {
    results: VideoResult[];
  };
  'watch/providers'?: {
    results: {
        BR?: {
            flatrate?: WatchProvider[];
        }
    }
  }
}

export interface SeasonDetails {
    _id: string;
    air_date: string;
    episodes: Episode[];
    name: string;
    overview: string;
    id: number;
    poster_path: string;
    season_number: number;
}

export type DashboardCard = {
  id: string;
  title: string;
  icon: LucideIcon;
  category: 'financial' | 'utility';
};

// Movie Types
export type Movie = {
  id: number; // TMDb ID
  docId?: string; // Firestore Doc ID
  title: string;
  poster_path: string | null;
  watched: boolean;
}

export interface TMDbMovieSearchResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
}

export interface TMDbMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genres: { id: number; name: string }[];
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  videos?: {
    results: VideoResult[];
  };
  'watch/providers'?: {
    results: {
        BR?: {
            flatrate?: WatchProvider[];
            rent?: WatchProvider[];
            buy?: WatchProvider[];
        }
    }
  }
}

// Financial Types
export interface HistoryData {
  date: string;
  value: number;
}

export interface FinancialInfo {
    value: string | null;
    name?: string;
    change: string | null;
    isPositive: boolean | null;
    footer?: string | null;
    history?: HistoryData[];
}

    