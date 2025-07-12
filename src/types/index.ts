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
}

export interface TMDbSearchResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
}

export interface TMDbShowDetails {
  id: number;
  name: string;
  next_episode_to_air: {
    air_date: string;
    episode_number: number;
    name: string;
    season_number: number;
  } | null;
  poster_path: string | null;
  status: string;
}
