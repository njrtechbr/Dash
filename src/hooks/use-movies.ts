'use client';

import { create } from 'zustand';
import { useEffect } from 'react';
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
  setMovies: (movies: Movie[]) => void;
  setLoaded: (loaded: boolean) => void;
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

    setMovies: (movies) => {
      set({ movies });
      get().fetchMissingDetails(movies);
    },
    
    setLoaded: (loaded) => set({ isLoaded: loaded }),

    fetchMissingDetails: async (movies) => {
        const state = get();
        const moviesToFetch = movies.filter(movie => !state.details[movie.id]);

        if (moviesToFetch.length === 0) {
            if (!state.isLoaded) set({ isLoaded: true });
            return;
        }

        try {
            const detailsPromises = moviesToFetch.map(movie => 
                getMovieDetails(movie.id.toString())
            );
            
            const detailsResults = await Promise.all(detailsPromises);
            
            const newDetails = { ...state.details };
            detailsResults.forEach((details, index) => {
                if (details) {
                    newDetails[moviesToFetch[index].id] = details;
                }
            });
            
            set({ details: newDetails, isLoaded: true });
        } catch (error) {
            console.error('Error fetching movie details:', error);
            set({ isLoaded: true });
        }
    },

    addMovie: async (movie) => {
        try {
            await dbAddMovie(movie);
            // Força atualização imediata
            const freshMovies = await (await fetch('/api/movies')).json();
            set({ movies: freshMovies });
            get().fetchMissingDetails(freshMovies);
            toast({
                title: "Filme adicionado",
                description: `${movie.title} foi adicionado à sua lista.`,
            });
        } catch (error) {
            console.error('Error adding movie:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            toast({
                title: "Erro",
                description: errorMessage === 'Filme já adicionado' ? 'Este filme já está na sua lista.' : "Erro ao adicionar filme. Tente novamente.",
                variant: "destructive",
            });
        }
    },

    removeMovie: async (movieId) => {
        try {
            await dbRemoveMovie(movieId);
            // Força atualização imediata
            const freshMovies = await (await fetch('/api/movies')).json();
            set({ movies: freshMovies });
            get().fetchMissingDetails(freshMovies);
            toast({
                title: "Filme removido",
                description: "O filme foi removido da sua lista.",
            });
        } catch (error) {
            console.error('Error removing movie:', error);
            toast({
                title: "Erro",
                description: "Erro ao remover filme. Tente novamente.",
                variant: "destructive",
            });
        }
    },

    toggleMovieWatched: async (movieId) => {
        const movie = get().movies.find(m => m.id === movieId);
        if (!movie) return;

        try {
            await dbToggleMovieWatched(movieId, !movie.watched);
            // Força atualização imediata
            const freshMovies = await (await fetch('/api/movies')).json();
            set({ movies: freshMovies });
            get().fetchMissingDetails(freshMovies);
            toast({
                title: movie.watched ? "Filme marcado como não assistido" : "Filme marcado como assistido",
                description: `${movie.title} foi atualizado.`,
            });
        } catch (error) {
            console.error('Error toggling movie watched:', error);
            toast({
                title: "Erro",
                description: "Erro ao atualizar filme. Tente novamente.",
                variant: "destructive",
            });
        }
    },

    handleMovieDetailsClick: (movieId) => {
        set({ movieDetailsId: movieId, isMovieDetailsOpen: true });
    },

    setMovieDetailsOpen: (isOpen) => {
        set({ isMovieDetailsOpen: isOpen });
        if (!isOpen) {
            set({ movieDetailsId: null });
        }
    },
}));

export const useMovies = () => {
    const store = useMoviesStore();

    useEffect(() => {
        // Evitar múltiplas chamadas durante a montagem do componente
        let isMounted = true;
        let lastDataHash = '';
        
        // Função para processar os dados recebidos
        const processMovies = (movies) => {
            if (!isMounted) return;
            
            const dataHash = JSON.stringify(movies);
            if (dataHash !== lastDataHash) {
                lastDataHash = dataHash;
                store.setMovies(movies);
                if (!store.isLoaded) store.setLoaded(true);
            }
        };
        
        // Iniciar a subscrição apenas uma vez
        const unsubscribe = subscribeToMovies(processMovies);
        
        // Limpeza ao desmontar
        return () => {
            isMounted = false;
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return store;
};
