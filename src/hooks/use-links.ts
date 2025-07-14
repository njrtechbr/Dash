'use client';

import { create } from 'zustand';
import type { LinkItem } from '@/types';
import { 
    addLink as dbAddLink,
    addMultipleLinks as dbAddMultipleLinks,
    updateLink as dbUpdateLink,
    deleteLink as dbDeleteLink,
    toggleFavorite as dbToggleFavorite,
    reorderLinks as dbReorderLinks,
    subscribeToLinks
} from '@/services/links-service';

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
    const unsubscribe = subscribeToLinks((links) => {
      set({ links, isLoaded: true });
    });
    return unsubscribe;
  },

  addLink: async (link) => {
    await dbAddLink(link);
  },

  addMultipleLinks: async (newLinks) => {
    await dbAddMultipleLinks(newLinks);
  },

  updateLink: async (id, updatedFields) => {
    await dbUpdateLink(id, updatedFields);
  },

  deleteLink: async (id) => {
    await dbDeleteLink(id);
  },
    
  toggleFavorite: async (id) => {
    const linkToToggle = get().links.find(link => link.id === id);
    if (linkToToggle) {
        await dbToggleFavorite(id, !linkToToggle.isFavorite);
    }
  },

  reorderLinks: async (draggedId, targetId) => {
    const currentLinks = get().links;
    await dbReorderLinks(draggedId, targetId, currentLinks);
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

let unsubscribe: (() => void) | null = null;

export const useLinks = () => {
    const store = useLinksStore();

    if (typeof window !== 'undefined' && !unsubscribe) {
        unsubscribe = store.initializeLinks();
    }
    
    return store;
};
