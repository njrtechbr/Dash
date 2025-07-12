'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Movie, TMDbMovieDetails } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { getMovieDetails } from '@/services/tmdb';

interface MoviesState {
  movies: Movie[];
  details: Record<number, TMDbMovieDetails>;
  isLoaded: boolean;
  movieDetailsId: number | null;
  isMovieDetailsOpen: boolean;
  addMovie: (movie: Omit<Movie, 'watched'>) => void;
  removeMovie: (movieId: number) => void;
  toggleMovieWatched: (movieId: number) => void;
  handleMovieDetailsClick: (movieId: number) => void;
  setMovieDetailsOpen: (isOpen: boolean) => void;
  fetchMissingDetails: (movies: Movie[]) => Promise<void>;
}

export const useMovies = create<MoviesState>()(
  persist(
    (set, get) => ({
      movies: [],
      details: {},
      isLoaded: false,
      movieDetailsId: null,
      isMovieDetailsOpen: false,

      fetchMissingDetails: async (movies) => {
        const state = get();
        const moviesToFetch = movies.filter(movie => !state.details[movie.id]);

        if (moviesToFetch.length === 0) {
            if (!state.isLoaded) set({ isLoaded: true });
            return;
        };

        const detailsPromises = moviesToFetch.map(movie => getMovieDetails(movie.id));
        const results = await Promise.all(detailsPromises);

        const newDetails: Record<number, TMDbMovieDetails> = {};
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

      addMovie: async (movie) => {
        const state = get();
        if (state.movies.some((m) => m.id === movie.id)) {
          toast({
            variant: 'destructive',
            title: 'Filme já adicionado',
            description: 'Você já adicionou este filme à sua lista.',
          });
          return;
        }
        const newMovie = { ...movie, watched: false };
        set((prevState) => ({
          movies: [...prevState.movies, newMovie],
        }));
        
        // Fetch details for the new movie
        const movieDetails = await getMovieDetails(movie.id);
        if (movieDetails) {
            set(prevState => ({
                details: { ...prevState.details, [movie.id]: movieDetails }
            }));
        }

        toast({
          title: 'Filme Adicionado!',
          description: `${movie.title} foi adicionado à sua lista.`,
        });
      },

      removeMovie: (movieId) => {
        const movieToRemove = get().movies.find((m) => m.id === movieId);
        if (movieToRemove) {
          set((state) => ({
            movies: state.movies.filter((m) => m.id !== movieId),
            details: Object.fromEntries(Object.entries(state.details).filter(([id]) => Number(id) !== movieId))
          }));
          toast({
            variant: 'destructive',
            title: 'Filme Removido',
            description: `${movieToRemove.title} foi removido da sua lista.`,
          });
        }
      },

      toggleMovieWatched: (movieId) => {
        let movieTitle = '';
        let isWatched = false;
        set((state) => ({
          movies: state.movies.map((movie) => {
            if (movie.id === movieId) {
              movieTitle = movie.title;
              isWatched = !movie.watched;
              return { ...movie, watched: isWatched };
            }
            return movie;
          }),
        }));
        if (movieTitle) {
          toast({
            title: `Filme ${isWatched ? 'Assistido' : 'Não Assistido'}`,
            description: `Você marcou "${movieTitle}" como ${isWatched ? 'assistido' : 'não assistido'}.`,
          });
        }
      },

      handleMovieDetailsClick: (movieId: number) => {
        set({ movieDetailsId: movieId, isMovieDetailsOpen: true });
      },

      setMovieDetailsOpen: (isOpen: boolean) => {
        set({ isMovieDetailsOpen: isOpen });
        if (!isOpen) {
          set({ movieDetailsId: null });
        }
      },
    }),
    {
      name: 'fluxdash-movies',
      storage: createJSONStorage(() => localStorage),
       onRehydrateStorage: () => (state, error) => {
        if (state) {
            state.fetchMissingDetails(state.movies);
        }
      },
    }
  )
);
