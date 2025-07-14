import { db } from '@/lib/firebase';
import type { Show, WatchedEpisode, Episode } from '@/types';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
} from 'firebase/firestore';


export function subscribeToShows(callback: (shows: Show[]) => void): () => void {
    const q = query(collection(db, 'shows'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const shows: Show[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            shows.push({ 
                id: data.id,
                docId: doc.id,
                ...data 
            } as Show);
        });
        callback(shows);
    }, (error) => {
        console.error("Error fetching shows: ", error);
        callback([]);
    });
    return unsubscribe;
}

export async function addShow(show: Omit<Show, 'watched_episodes' | 'docId'>): Promise<void> {
    try {
      await addDoc(collection(db, 'shows'), {
        id: show.id,
        name: show.name,
        poster_path: show.poster_path,
        watched_episodes: []
      });
    } catch(e) {
      console.error("Error adding show: ", e);
      throw e;
    }
}

export async function removeShow(docId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "shows", docId));
    } catch(e) {
        console.error("Error removing show: ", e);
        throw e;
    }
}

export async function toggleWatchedEpisode(show: Show, episode: Episode, isWatched: boolean): Promise<void> {
    if (!show.docId) return;

    const episodeId = `S${episode.season_number}E${episode.episode_number}`;
    const watchedEpisodes = show.watched_episodes || [];
    let newWatchedEpisodes: WatchedEpisode[];

    if (isWatched) {
        if (watchedEpisodes.some(e => e.episodeId === episodeId)) return;
        newWatchedEpisodes = [...watchedEpisodes, { episodeId, episodeName: episode.name, watchedAt: new Date().toISOString() }];
    } else {
        newWatchedEpisodes = watchedEpisodes.filter(e => e.episodeId !== episodeId);
    }

    try {
        const docRef = doc(db, "shows", show.docId);
        await updateDoc(docRef, { watched_episodes: newWatchedEpisodes });
    } catch(e) {
        console.error("Error updating watched episodes: ", e);
        throw e;
    }
}


export async function toggleSeasonWatched(show: Show, seasonEpisodes: Episode[], markAsWatched: boolean): Promise<void> {
    if (!show.docId) return;
    
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

    try {
        const docRef = doc(db, "shows", show.docId);
        await updateDoc(docRef, { watched_episodes: watchedEpisodes });
    } catch(e) {
        console.error("Error updating season watched episodes: ", e);
        throw e;
    }
}
