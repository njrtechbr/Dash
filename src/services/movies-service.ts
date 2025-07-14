import { db } from '@/lib/firebase';
import type { Movie } from '@/types';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
} from 'firebase/firestore';


export function subscribeToMovies(callback: (movies: Movie[]) => void): () => void {
    const q = query(collection(db, 'movies'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const movies: Movie[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            movies.push({ 
                id: data.id,
                docId: doc.id, 
                ...data 
            } as Movie);
        });
        callback(movies);
    }, (error) => {
        console.error("Error fetching movies: ", error);
        callback([]);
    });
    return unsubscribe;
}

export async function addMovie(movie: Omit<Movie, 'watched' | 'docId'>): Promise<void> {
    try {
        await addDoc(collection(db, 'movies'), {
            ...movie,
            watched: false
        });
    } catch(e) {
        console.error("Error adding movie: ", e);
        throw e;
    }
}

export async function removeMovie(docId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "movies", docId));
    } catch (e) {
        console.error("Error removing movie: ", e);
        throw e;
    }
}

export async function toggleMovieWatched(docId: string, watched: boolean): Promise<void> {
    try {
        const docRef = doc(db, "movies", docId);
        await updateDoc(docRef, { watched });
    } catch(e) {
        console.error("Error toggling watched state: ", e);
        throw e;
    }
}
