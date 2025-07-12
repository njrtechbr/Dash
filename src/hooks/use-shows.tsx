'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import type { Show } from '@/types';
import { useToast } from './use-toast';

const STORAGE_KEY = 'fluxdash-shows';

interface ShowsContextType {
  shows: Show[];
  isLoaded: boolean;
  addShow: (show: Show) => void;
  removeShow: (showId: number) => void;
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
      const updatedShows = [...prevShows, show];
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

  return (
    <ShowsContext.Provider value={{ shows, isLoaded, addShow, removeShow }}>
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
