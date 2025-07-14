import { db } from '@/lib/firebase';
import type { LinkItem } from '@/types';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';

export function subscribeToLinks(callback: (links: LinkItem[]) => void): () => void {
    const q = query(collection(db, 'links'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const links: LinkItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        links.push({ 
            id: doc.id,
            ...data,
            isFavorite: data.isFavorite || false,
        } as LinkItem);
      });
      callback(links);
    }, (error) => {
        console.error("Error fetching links: ", error);
        callback([]);
    });
    
    return unsubscribe;
}

export async function addLink(link: Omit<LinkItem, 'id' | 'isFavorite' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, 'links'), {
        ...link,
        isFavorite: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
}

export async function addMultipleLinks(newLinks: Omit<LinkItem, 'id' | 'isFavorite' | 'createdAt'>[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      newLinks.forEach((link) => {
        const docRef = doc(collection(db, 'links'));
        batch.set(docRef, {
            ...link,
            isFavorite: false,
            createdAt: new Date(),
        });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error adding multiple documents: ", error);
    }
}

export async function updateLink(id: string, updatedFields: Partial<Omit<LinkItem, 'id'>>): Promise<void> {
    const linkDocRef = doc(db, 'links', id);
    try {
      await updateDoc(linkDocRef, updatedFields);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
}

export async function deleteLink(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'links', id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const linkDocRef = doc(db, 'links', id);
    try {
      await updateDoc(linkDocRef, { isFavorite });
    } catch (error) {
      console.error("Error toggling favorite: ", error);
    }
}

export async function reorderLinks(draggedId: string, targetId: string, currentLinks: LinkItem[]): Promise<void> {
    const links = [...currentLinks];
    const draggedItemIndex = links.findIndex((l) => l.id === draggedId);
    const targetItemIndex = links.findIndex((l) => l.id === targetId);
    
    if (draggedItemIndex === -1 || targetItemIndex === -1) return;

    const [draggedItem] = links.splice(draggedItemIndex, 1);
    
    const newTargetIndex = links.findIndex((l) => l.id === targetId);
    links.splice(newTargetIndex > draggedItemIndex ? newTargetIndex : newTargetIndex, 0, draggedItem);
    
    const batch = writeBatch(db);
    links.forEach((link, index) => {
      const docRef = doc(db, 'links', link.id);
      batch.update(docRef, { createdAt: new Date(Date.now() + index) });
    });

    try {
        await batch.commit();
    } catch(error) {
        console.error("Error reordering links:", error);
    }
}
