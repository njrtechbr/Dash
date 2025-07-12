'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import type { Show, WatchedEpisode } from '@/types';
import { useToast } from './use-toast';

interface ShowsContextType {
  shows: Show[];
  isLoaded: boolean;
  addShow: (show: Show) => void;
  removeShow: (showId: number) => void;
  toggleWatchedEpisode: (showId: number, episodeId: string, episodeName: string) => void;
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
    } catch (error) {
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

  const toggleWatchedEpisode = useCallback((showId: number, episodeId: string, episodeName: string) => {
    setShows(prevShows => {
      const updatedShows = prevShows.map(show => {
        if (show.id === showId) {
          const watchedEpisodes = show.watched_episodes || [];
          const isWatched = watchedEpisodes.some(e => e.episodeId === episodeId);
          
          let newWatchedEpisodes: WatchedEpisode[];

          if (isWatched) {
            newWatchedEpisodes = watchedEpisodes.filter(e => e.episodeId !== episodeId);
            toast({
                title: 'Episódio Desmarcado',
                description: `O episódio "${episodeName}" foi removido do seu histórico.`
            });
          } else {
            newWatchedEpisodes = [...watchedEpisodes, { episodeId, watchedAt: new Date().toISOString() }];
             toast({
                title: 'Episódio Assistido!',
                description: `Você marcou "${episodeName}" como assistido.`
            });
          }
          
          return { ...show, watched_episodes: newWatchedEpisodes };
        }
        return show;
      });
      updateLocalStorage(updatedShows);
      return updatedShows;
    });
  }, [toast]);

  return (
    <ShowsContext.Provider value={{ shows, isLoaded, addShow, removeShow, toggleWatchedEpisode }}>
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
