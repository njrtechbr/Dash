'use client';

import { create } from 'zustand';
import type { Show, WatchedEpisode, Episode, TMDbShowDetails } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { getShowDetails } from '@/services/tmdb';
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

interface ShowsState {
  shows: Show[];
  details: Record<number, TMDbShowDetails>;
  isLoaded: boolean;
  showDetailsId: number | null;
  isShowDetailsOpen: boolean;
  initializeShows: () => () => void;
  addShow: (show: Omit<Show, 'watched_episodes' | 'id'> & { id: number }) => void;
  removeShow: (showId: number) => Promise<void>;
  toggleWatchedEpisode: (showId: number, episode: Episode, isWatched: boolean) => Promise<void>;
  toggleSeasonWatched: (showId: number, episodes: Episode[], markAsWatched: boolean) => Promise<void>;
  handleShowDetailsClick: (showId: number) => void;
  setShowDetailsOpen: (isOpen: boolean) => void;
  fetchMissingDetails: (shows: Show[]) => Promise<void>;
}

const useShowsStore = create<ShowsState>()(
    (set, get) => ({
      shows: [],
      details: {},
      isLoaded: false,
      showDetailsId: null,
      isShowDetailsOpen: false,

      initializeShows: () => {
        const q = query(collection(db, 'shows'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const shows: Show[] = [];
            querySnapshot.forEach((doc) => {
                shows.push({ id: doc.id, ...doc.data() } as Show);
            });
            set({ shows });
            get().fetchMissingDetails(shows);
        }, (error) => {
            console.error("Error fetching shows: ", error);
            set({ isLoaded: true });
        });
        return unsubscribe;
      },

      fetchMissingDetails: async (shows) => {
        const state = get();
        const showsToFetch = shows.filter(show => !state.details[show.id]);

        if (showsToFetch.length === 0) {
          if (!state.isLoaded) set({ isLoaded: true });
          return;
        }

        const detailsPromises = showsToFetch.map(show => getShowDetails(show.id));
        const results = await Promise.all(detailsPromises);

        const newDetails: Record<number, TMDbShowDetails> = {};
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

      addShow: async (show) => {
        const state = get();
        if (state.shows.some(s => s.id === show.id)) {
          toast({
            variant: 'destructive',
            title: 'Série já adicionada',
            description: 'Você já está acompanhando esta série.'
          });
          return;
        }
        
        try {
          await addDoc(collection(db, 'shows'), {
            ...show,
            watched_episodes: []
          });
          toast({
            title: 'Série Adicionada!',
            description: `${show.name} foi adicionado ao seu painel.`
          });
        } catch(e) {
          console.error("Error adding show: ", e);
          toast({ variant: 'destructive', title: 'Erro ao adicionar série' });
        }
      },

      removeShow: async (showId) => {
        const showToRemove = get().shows.find(s => s.id === showId);
        if (showToRemove) {
          try {
            const q = query(collection(db, "shows"), where("id", "==", showId));
            const querySnapshot = await getDocs(q);
            const batch = writeBatch(db);
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            toast({
                variant: 'destructive',
                title: 'Série Removida',
                description: `${showToRemove.name} foi removido do seu painel.`
            });
          } catch(e) {
             console.error("Error removing show: ", e);
             toast({ variant: 'destructive', title: 'Erro ao remover série' });
          }
        }
      },

      toggleWatchedEpisode: async (showId, episode, isWatched) => {
        const showToUpdate = get().shows.find(s => s.id === showId);
        if (!showToUpdate) return;

        const episodeId = `S${episode.season_number}E${episode.episode_number}`;
        const watchedEpisodes = showToUpdate.watched_episodes || [];
        let newWatchedEpisodes: WatchedEpisode[];

        if (isWatched) {
            if (watchedEpisodes.some(e => e.episodeId === episodeId)) return;
            newWatchedEpisodes = [...watchedEpisodes, { episodeId, episodeName: episode.name, watchedAt: new Date().toISOString() }];
        } else {
            newWatchedEpisodes = watchedEpisodes.filter(e => e.episodeId !== episodeId);
        }

        try {
            const q = query(collection(db, "shows"), where("id", "==", showId));
            const querySnapshot = await getDocs(q);
            const docToUpdate = querySnapshot.docs[0];
            if (docToUpdate) {
                await updateDoc(docToUpdate.ref, { watched_episodes: newWatchedEpisodes });
            }
        } catch(e) {
            console.error("Error updating watched episodes: ", e);
            toast({ variant: 'destructive', title: 'Erro ao atualizar episódios' });
        }
      },

      toggleSeasonWatched: async (showId, seasonEpisodes, markAsWatched) => {
        const showToUpdate = get().shows.find(s => s.id === showId);
        if (!showToUpdate) return;
        
        let watchedEpisodes = showToUpdate.watched_episodes || [];

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

         try {
            const q = query(collection(db, "shows"), where("id", "==", showId));
            const querySnapshot = await getDocs(q);
            const docToUpdate = querySnapshot.docs[0];
            if (docToUpdate) {
                await updateDoc(docToUpdate.ref, { watched_episodes: watchedEpisodes });
            }
        } catch(e) {
            console.error("Error updating season watched episodes: ", e);
            toast({ variant: 'destructive', title: 'Erro ao atualizar temporada' });
        }
      },

      handleShowDetailsClick: (showId: number) => {
        set({ showDetailsId: showId, isShowDetailsOpen: true });
      },

      setShowDetailsOpen: (isOpen: boolean) => {
        set({ isShowDetailsOpen: isOpen });
        if (!isOpen) {
          set({ showDetailsId: null });
        }
      },
    })
);


let unsubscribeShows: (() => void) | null = null;

export const useShows = () => {
    const store = useShowsStore();
    if (typeof window !== 'undefined' && !unsubscribeShows) {
        unsubscribeShows = store.initializeShows();
    }
    return store;
};