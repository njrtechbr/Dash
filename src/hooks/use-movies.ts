'use client';

import { create } from 'zustand';
import type { Movie, TMDbMovieDetails } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { getMovieDetails } from '@/services/tmdb';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
        const q = query(collection(db, 'movies'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const movies: Movie[] = [];
            querySnapshot.forEach((doc) => {
                movies.push({ id: doc.id, ...doc.data() } as Movie);
            });
            set({ movies });
            get().fetchMissingDetails(movies);
        }, (error) => {
            console.error("Error fetching movies: ", error);
            set({ isLoaded: true });
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

        try {
            await addDoc(collection(db, 'movies'), {
                ...movie,
                watched: false
            });
            toast({
              title: 'Filme Adicionado!',
              description: `${movie.title} foi adicionado à sua lista.`,
            });
        } catch(e) {
            console.error("Error adding movie: ", e);
            toast({ variant: 'destructive', title: 'Erro ao adicionar filme' });
        }
    },

    removeMovie: async (movieId) => {
        const movieToRemove = get().movies.find((m) => m.id === movieId);
        if (movieToRemove) {
            try {
                // Since we don't store the firestore doc id on the movie object, we query for it
                const q = query(collection(db, "movies"), where("id", "==", movieId));
                const querySnapshot = await getDocs(q);
                const batch = writeBatch(db);
                querySnapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                await batch.commit();

                toast({
                    variant: 'destructive',
                    title: 'Filme Removido',
                    description: `${movieToRemove.title} foi removido da sua lista.`,
                });
            } catch (e) {
                console.error("Error removing movie: ", e);
                toast({ variant: 'destructive', title: 'Erro ao remover filme' });
            }
        }
    },

    toggleMovieWatched: async (movieId) => {
        const movieToToggle = get().movies.find((m) => m.id === movieId);
        if (movieToToggle) {
            try {
                 const q = query(collection(db, "movies"), where("id", "==", movieId));
                 const querySnapshot = await getDocs(q);
                 const docToUpdate = querySnapshot.docs[0];
                 
                 if(docToUpdate) {
                    const newWatchedState = !movieToToggle.watched;
                    await updateDoc(docToUpdate.ref, { watched: newWatchedState });
                    toast({
                        title: `Filme ${newWatchedState ? 'Assistido' : 'Não Assistido'}`,
                        description: `Você marcou "${movieToToggle.title}" como ${newWatchedState ? 'assistido' : 'não assistido'}.`,
                    });
                 }
            } catch(e) {
                console.error("Error toggling watched state: ", e);
                toast({ variant: 'destructive', title: 'Erro ao atualizar filme' });
            }
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