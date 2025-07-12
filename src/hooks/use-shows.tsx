'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import type { Show, WatchedEpisode, Episode } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const STORAGE_KEY = 'fluxdash-shows';

interface ShowsContextType {
  shows: Show[];
  isLoaded: boolean;
  addShow: (show: Show) => void;
  removeShow: (showId: number) => void;
  toggleWatchedEpisode: (showId: number, episode: Episode, isWatched: boolean) => void;
  toggleSeasonWatched: (showId: number, episodes: Episode[], markAsWatched: boolean) => void;
}

const ShowsContext = createContext<ShowsContextType | undefined>(undefined);

export function ShowsProvider({ children }: { children: ReactNode }) {
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedShows = window.localStorage.getItem(STORAGE_KEY);
      if (storedShows) {
        setShows(JSON.parse(storedShows));
      }
    } catch (error) {
      console.error('Failed to load shows from local storage:', error);
    }
    setIsLoaded(true);
  }, []);

  const updateLocalStorage = (updatedShows: Show[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedShows));
    } catch (error)
      {
      console.error('Failed to save shows to local storage:', error);
    }
  };

  const addShow = useCallback((show: Show) => {
    setShows((prevShows) => {
      if (prevShows.some(s => s.id === show.id)) {
        toast({
            variant: 'destructive',
            title: 'Série já adicionada',
            description: 'Você já está acompanhando esta série.'
        })
        return prevShows;
      }
      const newShow = { ...show, watched_episodes: [] };
      const updatedShows = [...prevShows, newShow];
      updateLocalStorage(updatedShows);
      toast({
        title: 'Série Adicionada!',
        description: `${show.name} foi adicionado ao seu painel.`
      });
      return updatedShows;
    });
  }, [toast]);

  const removeShow = useCallback((showId: number) => {
    setShows((prevShows) => {
      const showToRemove = prevShows.find(s => s.id === showId);
      const updatedShows = prevShows.filter((s) => s.id !== showId);
      updateLocalStorage(updatedShows);
      if (showToRemove) {
        toast({
            variant: 'destructive',
            title: 'Série Removida',
            description: `${showToRemove.name} foi removido do seu painel.`
        });
      }
      return updatedShows;
    });
  }, [toast]);

 const toggleWatchedEpisode = useCallback((showId: number, episode: Episode, isWatched: boolean) => {
    const episodeId = `S${episode.season_number}E${episode.episode_number}`;
    
    setShows(prevShows => {
      const updatedShows = prevShows.map(show => {
        if (show.id === showId) {
          const watchedEpisodes = show.watched_episodes || [];
          let newWatchedEpisodes: WatchedEpisode[];

          if (isWatched) {
             // Avoid adding duplicates
            if (watchedEpisodes.some(e => e.episodeId === episodeId)) {
                return show;
            }
            newWatchedEpisodes = [...watchedEpisodes, { episodeId, episodeName: episode.name, watchedAt: new Date().toISOString() }];
          } else {
            newWatchedEpisodes = watchedEpisodes.filter(e => e.episodeId !== episodeId);
          }
          
          return { ...show, watched_episodes: newWatchedEpisodes };
        }
        return show;
      });
      updateLocalStorage(updatedShows);
      return updatedShows;
    });
  }, []);

  const toggleSeasonWatched = useCallback((showId: number, seasonEpisodes: Episode[], markAsWatched: boolean) => {
    setShows(prevShows => {
        const updatedShows = prevShows.map(show => {
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
        });
        updateLocalStorage(updatedShows);
        return updatedShows;
    });
  }, []);

  return (
    <ShowsContext.Provider value={{ shows, isLoaded, addShow, removeShow, toggleWatchedEpisode, toggleSeasonWatched }}>
      {children}
    </ShowsContext.Provider>
  );
};

export const useShows = (): ShowsContextType => {
  const context = useContext(ShowsContext);
  if (context === undefined) {
    throw new Error('useShows must be used within a ShowsProvider');
  }
  return context;
};
