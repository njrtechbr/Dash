'use client';

import { create } from 'zustand';
import { useEffect } from 'react';
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
  setShows: (shows: Show[]) => void;
  setLoaded: (loaded: boolean) => void;
  addShow: (show: Omit<Show, 'watched_episodes' | 'id'> & { id: number }) => void;
  removeShow: (showId: number) => Promise<void>;
  toggleWatchedEpisode: (showId: number, episode: Episode, isWatched: boolean) => Promise<void>;
  toggleSeasonWatched: (showId: number, episodes: Episode[], markAsWatched: boolean) => Promise<void>;
  handleShowDetailsClick: (showId: number) => void;
  setShowDetailsOpen: (isOpen: boolean) => void;
  fetchMissingDetails: (shows: Show[]) => Promise<void>;
}

const useShowsStore = create<ShowsState>((set, get) => ({
      shows: [],
      details: {},
      isLoaded: false,
      showDetailsId: null,
      isShowDetailsOpen: false,

      setShows: (shows) => {
        set({ shows });
        get().fetchMissingDetails(shows);
      },
      
      setLoaded: (loaded) => set({ isLoaded: loaded }),

      fetchMissingDetails: async (shows) => {
        const state = get();
        const showsToFetch = shows.filter(show => !state.details[show.id]);

        if (showsToFetch.length === 0) {
            if (!state.isLoaded) set({ isLoaded: true });
            return;
        }

        try {
            const detailsPromises = showsToFetch.map(show => 
                getShowDetails(show.id.toString())
            );
            
            const detailsResults = await Promise.all(detailsPromises);
            
            const newDetails = { ...state.details };
            detailsResults.forEach((details, index) => {
                if (details) {
                    newDetails[showsToFetch[index].id] = details;
                }
            });
            
            set({ details: newDetails, isLoaded: true });
        } catch (error) {
            console.error('Error fetching show details:', error);
            set({ isLoaded: true });
        }
      },

      addShow: async (show) => {
        try {
            await dbAddShow(show);
            // Força atualização imediata
            const freshShows = await (await fetch('/api/shows')).json();
            set({ shows: freshShows });
            get().fetchMissingDetails(freshShows);
            toast({
                title: "Série adicionada",
                description: `${show.name} foi adicionada à sua lista.`,
            });
        } catch (error) {
            console.error('Error adding show:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            toast({
                title: "Erro",
                description: errorMessage === 'Série já adicionada' ? 'Esta série já está na sua lista.' : "Erro ao adicionar série. Tente novamente.",
                variant: "destructive",
            });
        }
      },

      removeShow: async (showId) => {
        try {
            await dbRemoveShow(showId);
            // Força atualização imediata
            const freshShows = await (await fetch('/api/shows')).json();
            set({ shows: freshShows });
            get().fetchMissingDetails(freshShows);
            toast({
                title: "Série removida",
                description: "A série foi removida da sua lista.",
            });
        } catch (error) {
            console.error('Error removing show:', error);
            toast({
                title: "Erro",
                description: "Erro ao remover série. Tente novamente.",
                variant: "destructive",
            });
        }
      },

      toggleWatchedEpisode: async (showId, episode, isWatched) => {
        const show = get().shows.find(s => s.id === showId);
        if (!show) return;

        try {
            await dbToggleWatchedEpisode(show, episode, isWatched);
            // Força atualização imediata
            const freshShows = await (await fetch('/api/shows')).json();
            set({ shows: freshShows });
            get().fetchMissingDetails(freshShows);
            toast({
                title: isWatched ? "Episódio marcado como assistido" : "Episódio marcado como não assistido",
                description: `${episode.name} foi atualizado.`,
            });
        } catch (error) {
            console.error('Error toggling watched episode:', error);
            toast({
                title: "Erro",
                description: "Erro ao atualizar episódio. Tente novamente.",
                variant: "destructive",
            });
        }
      },

      toggleSeasonWatched: async (showId, episodes, markAsWatched) => {
        const show = get().shows.find(s => s.id === showId);
        if (!show) return;

        try {
            await dbToggleSeasonWatched(show, episodes, markAsWatched);
            // Força atualização imediata
            const freshShows = await (await fetch('/api/shows')).json();
            set({ shows: freshShows });
            get().fetchMissingDetails(freshShows);
            toast({
                title: markAsWatched ? "Temporada marcada como assistida" : "Temporada marcada como não assistida",
                description: `${episodes.length} episódios foram atualizados.`,
            });
        } catch (error) {
            console.error('Error toggling season watched:', error);
            toast({
                title: "Erro",
                description: "Erro ao atualizar temporada. Tente novamente.",
                variant: "destructive",
            });
        }
      },

      handleShowDetailsClick: (showId) => {
        set({ showDetailsId: showId, isShowDetailsOpen: true });
      },

      setShowDetailsOpen: (isOpen) => {
        set({ isShowDetailsOpen: isOpen });
        if (!isOpen) {
            set({ showDetailsId: null });
        }
      },
}));

export const useShows = () => {
    const store = useShowsStore();

    useEffect(() => {
        let lastDataHash = '';
        const unsubscribe = subscribeToShows((shows) => {
            // Ordena os shows e episódios antes de serializar
            const sortedShows = shows
                .map(show => ({
                    ...show,
                    watched_episodes: show.watched_episodes
                        ? [...show.watched_episodes].sort((a, b) => {
                            if (a.episodeId && b.episodeId) {
                                return a.episodeId.localeCompare(b.episodeId);
                            }
                            return 0;
                        })
                        : []
                }))
                .sort((a, b) => a.id - b.id);

            const dataHash = JSON.stringify(sortedShows);
            if (dataHash !== lastDataHash) {
                lastDataHash = dataHash;
                store.setShows(shows);
                if (!store.isLoaded) store.setLoaded(true);
            }
        });
        return unsubscribe;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return store;
};
