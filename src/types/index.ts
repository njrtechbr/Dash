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

export type WatchedEpisode = {
    episodeId: string;
    episodeName: string;
    watchedAt: string; // ISO 8601 date string
}

export type Show = {
  id: number;
  name: string;
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
}

export interface TMDbShowDetails {
  id: number;
  name: string;
  next_episode_to_air: Episode | null;
  last_episode_to_air: Episode | null;
  poster_path: string | null;
  backdrop_path: string | null;
  status: string;
  seasons: { season_number: number, episode_count: number }[];
  number_of_episodes: number;
  number_of_seasons: number;
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
