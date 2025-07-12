'use client';

import { create } from 'zustand';
import type { LinkItem } from '@/types';
import { db } from '@/lib/firebase';
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
  getDocs,
} from 'firebase/firestore';

interface LinksState {
  links: LinkItem[];
  isLoaded: boolean;
  linkToEdit: LinkItem | null;
  isLinkDialogOpen: boolean;
  initializeLinks: () => () => void; // Returns the unsubscribe function
  addLink: (link: Omit<LinkItem, 'id' | 'isFavorite' | 'createdAt'>) => Promise<void>;
  addMultipleLinks: (newLinks: Omit<LinkItem, 'id' | 'isFavorite' | 'createdAt'>[]) => Promise<void>;
  updateLink: (id: string, updatedFields: Partial<Omit<LinkItem, 'id'>>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  reorderLinks: (draggedId: string, targetId: string) => Promise<void>;
  handleEditLink: (link: LinkItem) => void;
  handleAddNewLink: () => void;
  handleDeleteLink: (id: string) => void;
  setLinkToEdit: (link: LinkItem | null) => void;
  setLinkDialogOpen: (isOpen: boolean) => void;
}

const useLinksStore = create<LinksState>((set, get) => ({
  links: [],
  isLoaded: false,
  linkToEdit: null,
  isLinkDialogOpen: false,
  
  initializeLinks: () => {
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
      set({ links, isLoaded: true });
    }, (error) => {
        console.error("Error fetching links: ", error);
        set({ isLoaded: true });
    });
    
    return unsubscribe;
  },

  addLink: async (link) => {
    try {
      await addDoc(collection(db, 'links'), {
        ...link,
        isFavorite: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  },

  addMultipleLinks: async (newLinks) => {
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
  },

  updateLink: async (id, updatedFields) => {
    const linkDocRef = doc(db, 'links', id);
    try {
      await updateDoc(linkDocRef, updatedFields);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  },

  deleteLink: async (id) => {
    try {
      await deleteDoc(doc(db, 'links', id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  },
    
  toggleFavorite: async (id) => {
    const state = get();
    const linkToToggle = state.links.find(link => link.id === id);
    if (!linkToToggle) return;
    const linkDocRef = doc(db, 'links', id);
    try {
      await updateDoc(linkDocRef, { isFavorite: !linkToToggle.isFavorite });
    } catch (error) {
      console.error("Error toggling favorite: ", error);
    }
  },

  reorderLinks: async (draggedId, targetId) => {
    const state = get();
    const currentLinks = [...state.links];
    const draggedItemIndex = currentLinks.findIndex((l) => l.id === draggedId);
    const targetItemIndex = currentLinks.findIndex((l) => l.id === targetId);
    
    if (draggedItemIndex === -1 || targetItemIndex === -1) return;

    const [draggedItem] = currentLinks.splice(draggedItemIndex, 1);
    
    const newTargetIndex = currentLinks.findIndex((l) => l.id === targetId);
    currentLinks.splice(newTargetIndex > draggedItemIndex ? newTargetIndex : newTargetIndex, 0, draggedItem);
    
    const batch = writeBatch(db);
    currentLinks.forEach((link, index) => {
      const docRef = doc(db, 'links', link.id);
      // We are essentially re-writing createdAt to establish order.
      // Firestore timestamps are precise enough for this.
      batch.update(docRef, { createdAt: new Date(Date.now() + index) });
    });

    try {
        await batch.commit();
    } catch(error) {
        console.error("Error reordering links:", error);
    }
  },
    
  handleEditLink: (link) => {
    set({ linkToEdit: link, isLinkDialogOpen: true });
  },

  handleAddNewLink: () => {
    set({ linkToEdit: null, isLinkDialogOpen: true });
  },

  handleDeleteLink: (id) => {
      get().deleteLink(id);
  },
  
  setLinkToEdit: (link) => set({ linkToEdit: link }),
  
  setLinkDialogOpen: (isOpen) => {
      set({ isLinkDialogOpen: isOpen });
      if (!isOpen) {
          set({ linkToEdit: null });
      }
  },
}));

// A wrapper hook to initialize the store on first render
let unsubscribe: (() => void) | null = null;

export const useLinks = () => {
    const store = useLinksStore();

    if (typeof window !== 'undefined' && !unsubscribe) {
        unsubscribe = store.initializeLinks();
    }
    
    // Cleanup on unmount (though this will likely live for the app's lifetime)
    // useEffect(() => {
    //     const unsub = useLinksStore.getState().initializeLinks();
    //     return () => unsub();
    // }, []);

    return store;
};
