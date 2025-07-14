'use client';

import { create } from 'zustand';
import type { Movie, TMDbMovieDetails } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { getMovieDetails } from '@/services/tmdb';
import {
  addMovie as dbAddMovie,
  removeMovie as dbRemoveMovie,
  toggleMovieWatched as dbToggleMovieWatched,
  subscribeToMovies
} from '@/services/movies-service';

interface MoviesState {
  movies: Movie[];
  details: Record<number, TMDbMovieDetails>;
  isLoaded: boolean;
  movieDetailsId: number | null;
  isMovieDetailsOpen: boolean;
  initializeMovies: () => () => void;
  addMovie: (movie: Omit<Movie, 'watched' | 'id'> & { id: number }) => void;
  removeMovie: (movieId: number) => Promise<void>;
  toggleMovieWatched: (movieId: number) => Promise<void>;
  handleMovieDetailsClick: (movieId: number) => void;
  setMovieDetailsOpen: (isOpen: boolean) => void;
  fetchMissingDetails: (movies: Movie[]) => Promise<void>;
}

const useMoviesStore = create<MoviesState>((set, get) => ({
    movies: [],
    details: {},
    isLoaded: false,
    movieDetailsId: null,
    isMovieDetailsOpen: false,

    initializeMovies: () => {
        const unsubscribe = subscribeToMovies((movies) => {
            set({ movies });
            get().fetchMissingDetails(movies);
        });
        return unsubscribe;
    },

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
        await dbAddMovie(movie);
        toast({
            title: 'Filme Adicionado!',
            description: `${movie.title} foi adicionado à sua lista.`,
        });
    },

    removeMovie: async (movieId) => {
        const movieToRemove = get().movies.find((m) => m.id === movieId);
        if (movieToRemove && movieToRemove.docId) {
            await dbRemoveMovie(movieToRemove.docId);
            toast({
                variant: 'destructive',
                title: 'Filme Removido',
                description: `${movieToRemove.title} foi removido da sua lista.`,
            });
        }
    },

    toggleMovieWatched: async (movieId) => {
        const movieToToggle = get().movies.find((m) => m.id === movieId);
        if (movieToToggle && movieToToggle.docId) {
            const newWatchedState = !movieToToggle.watched;
            await dbToggleMovieWatched(movieToToggle.docId, newWatchedState);
            toast({
                title: `Filme ${newWatchedState ? 'Assistido' : 'Não Assistido'}`,
                description: `Você marcou "${movieToToggle.title}" como ${newWatchedState ? 'assistido' : 'não assistido'}.`,
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
}));


let unsubscribeMovies: (() => void) | null = null;

export const useMovies = () => {
    const store = useMoviesStore();
    if (typeof window !== 'undefined' && !unsubscribeMovies) {
        unsubscribeMovies = store.initializeMovies();
    }
    return store;
};
