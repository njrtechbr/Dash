'use client';

import { create } from 'zustand';
import type { Show, WatchedEpisode, Episode, TMDbShowDetails } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { getShowDetails } from '@/services/tmdb';
import {
  subscribeToShows,
  addShow as dbAddShow,
  removeShow as dbRemoveShow,
  toggleWatchedEpisode as dbToggleWatchedEpisode,
  toggleSeasonWatched as dbToggleSeasonWatched
} from '@/services/shows-service';

interface ShowsState {
  shows: Show[];
  details: Record<number, TMDbShowDetails>;
  isLoaded: boolean;
  showDetailsId: number | null;
  isShowDetailsOpen: boolean;
  initializeShows: () => () => void;
  addShow: (show: Omit<Show, 'watched_episodes' | 'id'> & { id: number }) => void;
  removeShow: (showId: number) => Promise<void>;
  toggleWatchedEpisode: (showId: number, episode: Episode, isWatched: boolean) => Promise<void>;
  toggleSeasonWatched: (showId: number, episodes: Episode[], markAsWatched: boolean) => Promise<void>;
  handleShowDetailsClick: (showId: number) => void;
  setShowDetailsOpen: (isOpen: boolean) => void;
  fetchMissingDetails: (shows: Show[]) => Promise<void>;
}

const useShowsStore = create<ShowsState>()(
    (set, get) => ({
      shows: [],
      details: {},
      isLoaded: false,
      showDetailsId: null,
      isShowDetailsOpen: false,

      initializeShows: () => {
        const unsubscribe = subscribeToShows((shows) => {
            set({ shows });
            get().fetchMissingDetails(shows);
        });
        return unsubscribe;
      },

      fetchMissingDetails: async (shows) => {
        const state = get();
        const showsToFetch = shows.filter(show => !state.details[show.id]);

        if (showsToFetch.length === 0) {
          if (!state.isLoaded) set({ isLoaded: true });
          return;
        }

        const detailsPromises = showsToFetch.map(show => getShowDetails(show.id));
        const results = await Promise.all(detailsPromises);

        const newDetails: Record<number, TMDbShowDetails> = {};
        results.forEach(detail => {
          if (detail) {
            newDetails[detail.id] = detail;
          }
        });

        set(prevState => ({
          details: { ...prevState.details, ...newDetails },
          isLoaded: true
        }));
      },

      addShow: async (show) => {
        const state = get();
        if (state.shows.some(s => s.id === show.id)) {
          toast({
            variant: 'destructive',
            title: 'Série já adicionada',
            description: 'Você já está acompanhando esta série.'
          });
          return;
        }
        await dbAddShow(show);
        toast({
            title: 'Série Adicionada!',
            description: `${show.name} foi adicionado ao seu painel.`
        });
      },

      removeShow: async (showId) => {
        const showToRemove = get().shows.find(s => s.id === showId);
        if (showToRemove && showToRemove.docId) {
          await dbRemoveShow(showToRemove.docId);
          toast({
              variant: 'destructive',
              title: 'Série Removida',
              description: `${showToRemove.name} foi removido do seu painel.`
          });
        }
      },

      toggleWatchedEpisode: async (showId, episode, isWatched) => {
        const showToUpdate = get().shows.find(s => s.id === showId);
        if (!showToUpdate || !showToUpdate.docId) return;

        await dbToggleWatchedEpisode(showToUpdate, episode, isWatched);
      },

      toggleSeasonWatched: async (showId, seasonEpisodes, markAsWatched) => {
        const showToUpdate = get().shows.find(s => s.id === showId);
        if (!showToUpdate || !showToUpdate.docId) return;
        
        await dbToggleSeasonWatched(showToUpdate, seasonEpisodes, markAsWatched);
      },

      handleShowDetailsClick: (showId: number) => {
        set({ showDetailsId: showId, isShowDetailsOpen: true });
      },

      setShowDetailsOpen: (isOpen: boolean) => {
        set({ isShowDetailsOpen: isOpen });
        if (!isOpen) {
          set({ showDetailsId: null });
        }
      },
    })
);


let unsubscribeShows: (() => void) | null = null;

export const useShows = () => {
    const store = useShowsStore();
    if (typeof window !== 'undefined' && !unsubscribeShows) {
        unsubscribeShows = store.initializeShows();
    }
    return store;
};
