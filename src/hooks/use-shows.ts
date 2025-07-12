'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Show, WatchedEpisode, Episode } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface ShowsState {
  shows: Show[];
  isLoaded: boolean;
  showDetailsId: number | null;
  isShowDetailsOpen: boolean;
  addShow: (show: Omit<Show, 'watched_episodes'>) => void;
  removeShow: (showId: number) => void;
  toggleWatchedEpisode: (showId: number, episode: Episode, isWatched: boolean) => void;
  toggleSeasonWatched: (showId: number, episodes: Episode[], markAsWatched: boolean) => void;
  handleShowDetailsClick: (showId: number) => void;
  setShowDetailsOpen: (isOpen: boolean) => void;
}

export const useShows = create<ShowsState>()(
  persist(
    (set, get) => ({
      shows: [],
      isLoaded: false,
      showDetailsId: null,
      isShowDetailsOpen: false,

      addShow: (show) => {
        const state = get();
        if (state.shows.some(s => s.id === show.id)) {
          toast({
            variant: 'destructive',
            title: 'Série já adicionada',
            description: 'Você já está acompanhando esta série.'
          });
          return;
        }
        set(prevState => ({
          shows: [...prevState.shows, { ...show, watched_episodes: [] }]
        }));
        toast({
          title: 'Série Adicionada!',
          description: `${show.name} foi adicionado ao seu painel.`
        });
      },

      removeShow: (showId) => {
        const showToRemove = get().shows.find(s => s.id === showId);
        if (showToRemove) {
          set(state => ({
            shows: state.shows.filter(s => s.id !== showId)
          }));
          toast({
            variant: 'destructive',
            title: 'Série Removida',
            description: `${showToRemove.name} foi removido do seu painel.`
          });
        }
      },

      toggleWatchedEpisode: (showId, episode, isWatched) => {
        const episodeId = `S${episode.season_number}E${episode.episode_number}`;
        set(state => ({
          shows: state.shows.map(show => {
            if (show.id === showId) {
              const watchedEpisodes = show.watched_episodes || [];
              let newWatchedEpisodes: WatchedEpisode[];

              if (isWatched) {
                if (watchedEpisodes.some(e => e.episodeId === episodeId)) return show;
                newWatchedEpisodes = [...watchedEpisodes, { episodeId, episodeName: episode.name, watchedAt: new Date().toISOString() }];
              } else {
                newWatchedEpisodes = watchedEpisodes.filter(e => e.episodeId !== episodeId);
              }
              return { ...show, watched_episodes: newWatchedEpisodes };
            }
            return show;
          })
        }));
      },

      toggleSeasonWatched: (showId, seasonEpisodes, markAsWatched) => {
        set(state => ({
          shows: state.shows.map(show => {
            if (show.id === showId) {
              let watchedEpisodes = show.watched_episodes || [];

              if (markAsWatched) {
                const episodesToAdd = seasonEpisodes
                  .map(ep => ({
                    episodeId: `S${ep.season_number}E${ep.episode_number}`,
                    episodeName: ep.name,
                    watchedAt: new Date().toISOString()
                  }))
                  .filter(epToAdd => !watchedEpisodes.some(existingEp => existingEp.episodeId === epToAdd.episodeId));
                watchedEpisodes = [...watchedEpisodes, ...episodesToAdd];
              } else {
                const seasonEpisodeIds = new Set(seasonEpisodes.map(ep => `S${ep.season_number}E${ep.episode_number}`));
                watchedEpisodes = watchedEpisodes.filter(ep => !seasonEpisodeIds.has(ep.episodeId));
              }
              return { ...show, watched_episodes: watchedEpisodes };
            }
            return show;
          })
        }));
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
    }),
    {
      name: 'fluxdash-shows',
      storage: createJSONStorage(() => localStorage),
       onRehydrateStorage: () => (state) => {
        if (state) state.isLoaded = true;
      },
    }
  )
);
