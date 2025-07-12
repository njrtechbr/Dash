import type { LucideIcon } from 'lucide-react';

export type LinkItem = {
  id: string;
  title: string;
  url: string;
  icon: string;
  group: string;
  description?: string;
};

export type Icon = {
  name: string;
  icon: LucideIcon;
};

export type Show = {
  id: number;
  name: string;
  poster_path: string | null;
  watched_episodes?: string[];
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
};

export type WatchProvider = {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}

export interface TMDbShowDetails {
  id: number;
  name: string;
  next_episode_to_air: Episode | null;
  poster_path: string | null;
  backdrop_path: string | null;
  status: string;
  seasons: { season_number: number }[];
  'watch/providers'?: {
    results: {
        BR?: {
            flatrate?: WatchProvider[];
        }
    }
  }
}

export interface SeasonDetails {
    episodes: Episode[];
}
