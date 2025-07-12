'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Movie } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface MoviesState {
  movies: Movie[];
  isLoaded: boolean;
  movieDetailsId: number | null;
  isMovieDetailsOpen: boolean;
  addMovie: (movie: Omit<Movie, 'watched'>) => void;
  removeMovie: (movieId: number) => void;
  toggleMovieWatched: (movieId: number) => void;
  handleMovieDetailsClick: (movieId: number) => void;
  setMovieDetailsOpen: (isOpen: boolean) => void;
}

export const useMovies = create<MoviesState>()(
  persist(
    (set, get) => ({
      movies: [],
      isLoaded: false,
      movieDetailsId: null,
      isMovieDetailsOpen: false,

      addMovie: (movie) => {
        const state = get();
        if (state.movies.some((m) => m.id === movie.id)) {
          toast({
            variant: 'destructive',
            title: 'Filme já adicionado',
            description: 'Você já adicionou este filme à sua lista.',
          });
          return;
        }
        set((prevState) => ({
          movies: [...prevState.movies, { ...movie, watched: false }],
        }));
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
       onRehydrateStorage: () => (state) => {
        if (state) state.isLoaded = true;
      },
    }
  )
);

// This component can be placed in your layout to handle dialogs globally
export function MovieDialogManager() {
  const { isMovieDetailsOpen, setMovieDetailsOpen, movieDetailsId } = useMovies();
  const MovieDetailsDialog = require('@/components/dashboard/movie-details-dialog').MovieDetailsDialog;

  return (
    <>
      {movieDetailsId && (
        <MovieDetailsDialog
          open={isMovieDetailsOpen}
          onOpenChange={setMovieDetailsOpen}
          movieId={movieDetailsId}
        />
      )}
    </>
  );
}
