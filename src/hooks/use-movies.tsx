'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import type { Movie } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const STORAGE_KEY = 'fluxdash-movies';

interface MoviesContextType {
  movies: Movie[];
  isLoaded: boolean;
  addMovie: (movie: Omit<Movie, 'watched'>) => void;
  removeMovie: (movieId: number) => void;
  toggleMovieWatched: (movieId: number) => void;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedMovies = window.localStorage.getItem(STORAGE_KEY);
      if (storedMovies) {
        setMovies(JSON.parse(storedMovies));
      }
    } catch (error) {
      console.error('Failed to load movies from local storage:', error);
    }
    setIsLoaded(true);
  }, []);

  const updateLocalStorage = (updatedMovies: Movie[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMovies));
    } catch (error) {
      console.error('Failed to save movies to local storage:', error);
    }
  };

  const addMovie = useCallback((movie: Omit<Movie, 'watched'>) => {
    let movieAlreadyExists = false;
    let movieTitle = '';

    setMovies((prevMovies) => {
      if (prevMovies.some(m => m.id === movie.id)) {
        movieAlreadyExists = true;
        return prevMovies;
      }
      const newMovie = { ...movie, watched: false };
      const updatedMovies = [...prevMovies, newMovie];
      updateLocalStorage(updatedMovies);
      movieTitle = movie.title;
      return updatedMovies;
    });

    if (movieAlreadyExists) {
        toast({
            variant: 'destructive',
            title: 'Filme já adicionado',
            description: 'Você já adicionou este filme à sua lista.'
        });
    } else {
        toast({
            title: 'Filme Adicionado!',
            description: `${movieTitle} foi adicionado à sua lista.`
        });
    }
  }, [toast]);

  const removeMovie = useCallback((movieId: number) => {
    let movieTitle = '';
    
    setMovies((prevMovies) => {
      const movieToRemove = prevMovies.find(m => m.id === movieId);
      if (movieToRemove) {
          movieTitle = movieToRemove.title;
      }
      const updatedMovies = prevMovies.filter((m) => m.id !== movieId);
      updateLocalStorage(updatedMovies);
      return updatedMovies;
    });

    if (movieTitle) {
      toast({
          variant: 'destructive',
          title: 'Filme Removido',
          description: `${movieTitle} foi removido da sua lista.`
      });
    }
  }, [toast]);

  const toggleMovieWatched = useCallback((movieId: number) => {
    let movieTitle = '';
    let isWatched = false;

    setMovies(prevMovies => {
        const updatedMovies = prevMovies.map(movie => {
            if (movie.id === movieId) {
                movieTitle = movie.title;
                isWatched = !movie.watched;
                return { ...movie, watched: isWatched };
            }
            return movie;
        });
        updateLocalStorage(updatedMovies);
        return updatedMovies;
    });
    
    if (movieTitle) {
        toast({
            title: `Filme ${isWatched ? 'Assistido' : 'Não Assistido'}`,
            description: `Você marcou "${movieTitle}" como ${isWatched ? 'assistido' : 'não assistido'}.`
        })
    }
  }, [toast]);

  const value = { movies, isLoaded, addMovie, removeMovie, toggleMovieWatched };

  return (
    <MoviesContext.Provider value={value}>
      {children}
    </MoviesContext.Provider>
  );
};

export const useMovies = (): MoviesContextType => {
  const context = useContext(MoviesContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MoviesProvider');
  }
  return context;
};
